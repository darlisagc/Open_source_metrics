import requests
import os
import json
import csv
import re
import fnmatch
from datetime import datetime, timedelta

# -------------------- Configuration --------------------

# Orgs to discover repos from (same as github_metrics.py)
DISCOVERED_ORGS = ["cardano-foundation", "bloxbean"]

# Orgs whose members are excluded as "internal"
EXCLUDED_ORGS = ["cardano-foundation", "bloxbean"]

# Additional repos outside the discovered orgs, or not reliably auto-discovered
EXTRA_REPOS = [
    "aiken-lang/aiken",
    "aiken-lang/merkle-patricia-forestry",
    "aiken-lang/stdlib",
    "aiken-lang/fuzz",
    "CardanoSolutions/ogmios",
    "CardanoSolutions/kupo",
    "CardanoSolutions/ogmios-mdk",
    "pragma-org/amaru",
    "elm-cardano/elm-cardano",
    "elm-cardano/bech32",
    "elm-toulouse/cbor",
    "cardano-foundation/cf-lob-platform",
    "cardano-foundation/cardano-devkit",
    "cardano-foundation/cardano-learn-and-hack",
]

# Repos to exclude from tracking (e.g. collaborator-heavy repos)
EXCLUDED_REPOS = [
    "cardano-foundation/x402",
    "cardano-foundation/x402-cardano",
]

# Contractor / bot exclusion patterns (case-insensitive)
EXCLUDED_PATTERNS = [
    "Sotatek*",
    "*smartOS*",
    "*smartos*",
    "*licker*",
    "app/*",
]

# Usernames that are bots or automated accounts (exact match, case-insensitive)
EXCLUDED_USERNAMES = [
    "dependabot[bot]",
    "github-actions[bot]",
    "renovate[bot]",
    "codecov[bot]",
    "snyk-bot",
    "semantic-release-bot",
    "actions-user",
    "web-flow",
    "github-merge-queue[bot]",
    "allcontributors[bot]",
    "mergify[bot]",
    "pre-commit-ci[bot]",
    "stale[bot]",
]

# Substrings that indicate a bot/automated account (case-insensitive)
BOT_SUBSTRINGS = [
    "[bot]",
    "-bot",
    "claude",
    "copilot",
    "openai",
    "chatgpt",
]

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}

HISTORY_FILE = "external_contributors_history.json"
CSV_FILE = "external_contributors_data.csv"

# -------------------- GitHub API Helpers --------------------

def github_get(url, params=None):
    """Make a GET request to GitHub API with rate-limit awareness."""
    resp = requests.get(url, headers=HEADERS, params=params)
    if resp.status_code == 403 and "rate limit" in resp.text.lower():
        print(f"  Rate limited. Waiting 60s...")
        import time
        time.sleep(60)
        resp = requests.get(url, headers=HEADERS, params=params)
    return resp


def paginated_get(url, params=None):
    """Fetch all pages from a paginated GitHub API endpoint."""
    results = []
    page = 1
    if params is None:
        params = {}
    params["per_page"] = 100
    while True:
        params["page"] = page
        resp = github_get(url, params=params)
        if resp.status_code != 200:
            print(f"  Warning: {url} returned {resp.status_code}")
            break
        batch = resp.json()
        if not batch:
            break
        results.extend(batch)
        if len(batch) < 100:
            break
        page += 1
    return results

# -------------------- Org Member Fetching --------------------

def fetch_org_members(org):
    """Fetch all public members of a GitHub org."""
    members = set()
    page = 1
    while True:
        resp = github_get(
            f"https://api.github.com/orgs/{org}/members",
            params={"per_page": 100, "page": page},
        )
        if resp.status_code != 200:
            print(f"  Warning: Could not fetch members for {org}: {resp.status_code}")
            break
        batch = resp.json()
        if not batch:
            break
        for m in batch:
            login = m.get("login")
            if login:
                members.add(login.lower())
        if len(batch) < 100:
            break
        page += 1
    print(f"  Fetched {len(members)} members from {org}")
    return members

# -------------------- Repo Discovery --------------------

def discover_org_repos(org):
    """List every public repo for an org."""
    repos = []
    page = 1
    while True:
        url = f"https://api.github.com/orgs/{org}/repos?type=all&per_page=100&page={page}"
        resp = github_get(url)
        if resp.status_code != 200:
            print(f"  Failed to list repos for {org}: {resp.status_code}")
            return repos
        batch = resp.json()
        if not batch:
            break
        repos.extend(batch)
        if len(batch) < 100:
            break
        page += 1
    return repos


def build_repo_list():
    """Build a list of full_name strings for all tracked repos."""
    repos = set()
    for org in DISCOVERED_ORGS:
        for r in discover_org_repos(org):
            repos.add(r["full_name"])
    for full_name in EXTRA_REPOS:
        repos.add(full_name)
    # Remove excluded repos
    repos -= set(EXCLUDED_REPOS)
    return sorted(repos)

# -------------------- Exclusion Logic --------------------

def is_excluded(username, excluded_members):
    """Check if a username should be excluded."""
    if not username:
        return True
    lower = username.lower()
    # Org members
    if lower in excluded_members:
        return True
    # Exact bot/automated account names
    if lower in {u.lower() for u in EXCLUDED_USERNAMES}:
        return True
    # Substring matching for bot indicators
    for substring in BOT_SUBSTRINGS:
        if substring.lower() in lower:
            return True
    # Glob pattern matching (contractors, etc.)
    for pattern in EXCLUDED_PATTERNS:
        if fnmatch.fnmatch(lower, pattern.lower()):
            return True
    return False

# -------------------- Contributor Collection --------------------

def collect_commit_authors(repo, since, until):
    """Collect unique commit author logins for a repo in a date range."""
    authors = set()
    params = {"since": since, "until": until, "per_page": 100}
    page = 1
    while True:
        params["page"] = page
        resp = github_get(f"https://api.github.com/repos/{repo}/commits", params=params)
        if resp.status_code != 200:
            break
        commits = resp.json()
        if not commits:
            break
        for c in commits:
            author = c.get("author")
            if author and author.get("login"):
                authors.add(author["login"])
        if len(commits) < 100:
            break
        page += 1
    return authors


def collect_pr_authors(repo, since, until):
    """Collect unique PR author logins for a repo in a date range."""
    authors = set()
    # Search for PRs created in the date range
    query = f"repo:{repo} is:pr created:{since}..{until}"
    params = {"q": query, "per_page": 100}
    page = 1
    while True:
        params["page"] = page
        resp = github_get("https://api.github.com/search/issues", params=params)
        if resp.status_code != 200:
            break
        data = resp.json()
        items = data.get("items", [])
        for item in items:
            user = item.get("user")
            if user and user.get("login"):
                authors.add(user["login"])
        if len(items) < 100:
            break
        page += 1
    return authors


def collect_external_contributors(repos, excluded_members, since, until):
    """
    For each repo, collect external contributors (commits + PRs) in date range.
    Returns dict: repo_full_name -> set of external usernames.
    """
    repo_contributors = {}
    for i, repo in enumerate(repos):
        print(f"  [{i+1}/{len(repos)}] Scanning {repo}...")
        # Get all contributors from commits and PRs
        commit_authors = collect_commit_authors(repo, since, until)
        pr_authors = collect_pr_authors(repo, since, until)
        all_authors = commit_authors | pr_authors

        # Filter to external only
        external = {u for u in all_authors if not is_excluded(u, excluded_members)}
        if external:
            repo_contributors[repo] = external
            print(f"    Found {len(external)} external contributor(s)")
    return repo_contributors

# -------------------- History Management --------------------

def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"periods": [], "all_time_contributors": {}}


def save_history(history):
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)


def get_all_time_contributors(history):
    """Get set of all contributor usernames seen across all periods."""
    return set(history.get("all_time_contributors", {}).keys())


def update_all_time_contributors(history, period_label, repo_contributors):
    """Update the all-time contributor registry."""
    all_time = history.setdefault("all_time_contributors", {})
    for repo, contributors in repo_contributors.items():
        for username in contributors:
            if username not in all_time:
                all_time[username] = {
                    "first_seen": period_label,
                    "repos": [repo],
                }
            else:
                if repo not in all_time[username]["repos"]:
                    all_time[username]["repos"].append(repo)

# -------------------- Main Collection --------------------

def run_collection(start_date=None, end_date=None):
    """
    Main entry point. Collects external contributors for the given period.
    If no dates provided, defaults to the previous calendar month.
    """
    today = datetime.utcnow()

    if start_date and end_date:
        since = start_date
        until = end_date
    else:
        # Default: previous calendar month
        first_of_this_month = today.replace(day=1)
        last_of_prev_month = first_of_this_month - timedelta(days=1)
        first_of_prev_month = last_of_prev_month.replace(day=1)
        since = first_of_prev_month.strftime("%Y-%m-%d")
        until = last_of_prev_month.strftime("%Y-%m-%d")

    # Period label (e.g. "Apr 2026")
    since_dt = datetime.strptime(since, "%Y-%m-%d")
    period_label = since_dt.strftime("%b %Y")
    period_key = f"{since}/{until}"

    print(f"Collecting external contributors for period: {period_key} ({period_label})")

    # 1. Fetch excluded org members
    print("Fetching org members for exclusion...")
    excluded_members = set()
    for org in EXCLUDED_ORGS:
        excluded_members |= fetch_org_members(org)
    print(f"Total excluded members: {len(excluded_members)}")

    # 2. Discover all repos
    print("Discovering repositories...")
    repos = build_repo_list()
    print(f"Tracking {len(repos)} repositories")

    # 3. Load history and get all-time contributors for new/returning detection
    history = load_history()
    known_contributors = get_all_time_contributors(history)

    # 4. Check if period already exists
    existing_periods = {p["period"] for p in history.get("periods", [])}
    if period_key in existing_periods:
        print(f"Period {period_key} already exists in history. Overwriting...")
        history["periods"] = [p for p in history["periods"] if p["period"] != period_key]

    # 5. Collect external contributors
    print("Scanning repositories for external contributors...")
    # GitHub search API uses ISO dates for 'since' and 'until'
    # Commits API expects ISO 8601 timestamps
    since_iso = f"{since}T00:00:00Z"
    until_iso = f"{until}T23:59:59Z"
    repo_contributors = collect_external_contributors(repos, excluded_members, since_iso, until_iso)

    # 6. Build period data
    all_external = set()
    repos_data = {}
    for repo, contributors in repo_contributors.items():
        new_contribs = [u for u in contributors if u not in known_contributors]
        returning_contribs = [u for u in contributors if u in known_contributors]
        repos_data[repo] = {
            "new_contributors": sorted(new_contribs),
            "returning_contributors": sorted(returning_contribs),
            "total_external": len(contributors),
            "new_count": len(new_contribs),
            "returning_count": len(returning_contribs),
        }
        all_external |= contributors

    all_new = [u for u in all_external if u not in known_contributors]
    all_returning = [u for u in all_external if u in known_contributors]

    period_data = {
        "period": period_key,
        "label": period_label,
        "collected_at": today.strftime("%Y-%m-%d"),
        "excluded_orgs": EXCLUDED_ORGS,
        "repos": repos_data,
        "summary": {
            "total_external": len(all_external),
            "total_new": len(all_new),
            "total_returning": len(all_returning),
            "repos_with_activity": len(repo_contributors),
            "all_contributors": sorted(all_external),
        },
    }

    # 7. Update history
    history.setdefault("periods", []).append(period_data)
    # Sort periods chronologically
    history["periods"].sort(key=lambda p: p["period"])
    # Store full list of tracked repos so the dashboard can show them all
    history["tracked_repos"] = sorted(repos)
    update_all_time_contributors(history, period_label, repo_contributors)
    save_history(history)

    print(f"\nResults for {period_label}:")
    print(f"  Total external contributors: {len(all_external)}")
    print(f"  New contributors: {len(all_new)}")
    print(f"  Returning contributors: {len(all_returning)}")
    print(f"  Repos with external activity: {len(repo_contributors)}")

    # 8. Generate CSV export
    generate_csv(history)

    print(f"\nSaved to {HISTORY_FILE} and {CSV_FILE}")
    return history


def generate_csv(history):
    """Export history to a flat CSV file."""
    rows = []
    rows.append([
        "Period", "Period Label", "Repo", "Contributor",
        "Status", "First Seen"
    ])

    all_time = history.get("all_time_contributors", {})

    for period in history.get("periods", []):
        label = period["label"]
        period_key = period["period"]
        for repo, data in period.get("repos", {}).items():
            for username in data.get("new_contributors", []):
                first_seen = all_time.get(username, {}).get("first_seen", label)
                rows.append([period_key, label, repo, username, "New", first_seen])
            for username in data.get("returning_contributors", []):
                first_seen = all_time.get(username, {}).get("first_seen", "")
                rows.append([period_key, label, repo, username, "Returning", first_seen])

    with open(CSV_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        for row in rows:
            writer.writerow(row)
    print(f"CSV exported with {len(rows) - 1} records")

# -------------------- CLI --------------------

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Collect external contributor data")
    parser.add_argument("--start-date", help="Start date (YYYY-MM-DD)")
    parser.add_argument("--end-date", help="End date (YYYY-MM-DD)")
    args = parser.parse_args()

    run_collection(start_date=args.start_date, end_date=args.end_date)
