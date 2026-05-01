import requests
import os
import json
import csv
from datetime import datetime

# -------------------- Configuration --------------------

# Orgs to discover repositories from automatically.
DISCOVERED_ORGS = ["cardano-foundation", "bloxbean"]

# Additional individual repos outside the discovered orgs.
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
]

# GitHub API token (optional, for higher rate limits)
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}

# Output files
MARKDOWN_REPORT_FILE = "open_source_metrics.md"
CSV_FILE = "open_source_metrics_data.csv"
HISTORY_FILE = "metrics_history.json"

METRICS_LIST = [
    "GitHub Stars",
    "GitHub Forks",
    "GitHub Contributors",
    "GitHub Pull Requests (PRs) Merged",
    "Number of Releases",
    "Downloads",
]

# -------------------- Repo Discovery --------------------

def discover_org_repos(org):
    """List every public repo (including forks and archived) for an org."""
    repos = []
    page = 1
    while True:
        url = f"https://api.github.com/orgs/{org}/repos?type=all&per_page=100&page={page}"
        response = requests.get(url, headers=HEADERS)
        if response.status_code != 200:
            print(f"⚠️  Failed to list repos for {org}: {response.status_code} {response.text[:200]}")
            return repos
        batch = response.json()
        if not batch:
            break
        repos.extend(batch)
        if len(batch) < 100:
            break
        page += 1
    return repos


def build_repos_dict():
    """
    Returns dict mapping repo-name -> {"full_name": "owner/repo", "language": "..."}.
    Forks are included; archived repos are included.
    """
    out = {}

    for org in DISCOVERED_ORGS:
        for r in discover_org_repos(org):
            name = r["name"]
            out[name] = {
                "full_name": r["full_name"],
                "language": r.get("language") or "Unknown",
            }

    # Static extras: fetch language individually
    for full_name in EXTRA_REPOS:
        name = full_name.split("/", 1)[1]
        if name in out:
            continue
        url = f"https://api.github.com/repos/{full_name}"
        resp = requests.get(url, headers=HEADERS)
        if resp.status_code == 200:
            data = resp.json()
            out[name] = {
                "full_name": data["full_name"],
                "language": data.get("language") or "Unknown",
            }
        else:
            print(f"⚠️  Failed to fetch {full_name}: {resp.status_code}")
            out[name] = {"full_name": full_name, "language": "Unknown"}

    return out

# -------------------- GitHub Metric Functions --------------------

def get_contributors_count(repo):
    count = 0
    page = 1
    while True:
        url = f"https://api.github.com/repos/{repo}/contributors?per_page=100&page={page}&anon=true"
        response = requests.get(url, headers=HEADERS)
        if response.status_code != 200:
            return "N/A"
        contributors = response.json()
        if not contributors:
            break
        count += len(contributors)
        if len(contributors) < 100:
            break
        page += 1
    return count


def get_merged_prs_count(repo):
    merged_count = 0
    page = 1
    while True:
        url = f"https://api.github.com/repos/{repo}/pulls?state=closed&per_page=100&page={page}"
        response = requests.get(url, headers=HEADERS)
        if response.status_code != 200:
            return "N/A"
        prs = response.json()
        if not prs:
            break
        merged_count += sum(1 for pr in prs if pr.get("merged_at"))
        if len(prs) < 100:
            break
        page += 1
    return merged_count


def get_releases_count(repo):
    count = 0
    page = 1
    while True:
        url = f"https://api.github.com/repos/{repo}/releases?per_page=100&page={page}"
        response = requests.get(url, headers=HEADERS)
        if response.status_code != 200:
            return "N/A"
        releases = response.json()
        if not releases:
            break
        count += len(releases)
        if len(releases) < 100:
            break
        page += 1
    return count


def get_github_release_downloads(repo):
    """Aggregate downloads across all releases."""
    url = f"https://api.github.com/repos/{repo}/releases"
    response = requests.get(url, headers=HEADERS)
    if response.status_code != 200:
        return "N/A"
    releases = response.json()
    total_downloads = 0
    for release in releases:
        for asset in release.get("assets", []):
            total_downloads += asset.get("download_count", 0)
    return total_downloads


def get_github_metrics(full_name):
    url = f"https://api.github.com/repos/{full_name}"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        data = response.json()
        stars = data.get("stargazers_count", 0)
        forks = data.get("forks_count", 0)
        contributors = get_contributors_count(full_name)
        prs_merged = get_merged_prs_count(full_name)
        releases_count = get_releases_count(full_name)
        downloads_raw = get_github_release_downloads(full_name)
        downloads = f"Github downloads {downloads_raw}"
        language = data.get("language") or "Unknown"
        return {
            "metrics": [stars, forks, contributors, prs_merged, releases_count, downloads],
            "language": language,
        }
    return {"metrics": ["N/A"] * 6, "language": "Unknown"}

# -------------------- Historical Data Functions --------------------

def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_history(history):
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)


def update_history(repos):
    """repos: dict of repo-name -> {full_name, language}."""
    current_date = datetime.today().strftime("%d/%m/%Y")
    history = load_history()

    for project_name, info in repos.items():
        full_name = info["full_name"]
        result = get_github_metrics(full_name)
        metrics = result["metrics"]
        language = result["language"] or info.get("language") or "Unknown"

        if project_name not in history:
            history[project_name] = {
                "repo": full_name,
                "language": language,
                "dates": [],
                "data": {metric: [] for metric in METRICS_LIST},
            }
        else:
            # Refresh language and repo each run
            history[project_name]["repo"] = full_name
            history[project_name]["language"] = language
            # Ensure data buckets exist for all metrics
            history[project_name].setdefault("data", {})
            for metric in METRICS_LIST:
                history[project_name]["data"].setdefault(metric, [])
            history[project_name].setdefault("dates", [])

        if current_date not in history[project_name]["dates"]:
            history[project_name]["dates"].append(current_date)
            for idx, metric in enumerate(METRICS_LIST):
                history[project_name]["data"][metric].append(metrics[idx])

    save_history(history)
    return history, current_date

# -------------------- Markdown Report Generation --------------------

def generate_markdown_report(history, current_date, repos):
    md_content = "# 🚀 Open Source Metrics Report\n\n"
    md_content += f"_Data collected up to **{current_date}**_\n\n"

    for project_name in sorted(repos.keys()):
        if project_name not in history:
            continue
        language = history[project_name].get("language", "Unknown")
        full_name = history[project_name].get("repo", project_name)
        md_content += f"### 📌 {project_name}\n"
        md_content += f"_Repo: `{full_name}` · Language: **{language}**_\n\n"

        dates = history[project_name].get("dates", [])
        data = history[project_name].get("data", {})

        header = "| Metric | " + " | ".join(dates) + " |\n"
        separator = "|" + "--------|" * (len(dates) + 1) + "\n"
        md_content += header + separator

        for metric in METRICS_LIST:
            values = data.get(metric, [])
            row = f"| {metric} | " + " | ".join(str(v) for v in values) + " |\n"
            md_content += row
        md_content += "\n"

    return md_content


def update_markdown_reports(repos):
    history, current_date = update_history(repos)
    md_content = generate_markdown_report(history, current_date, repos)

    with open(MARKDOWN_REPORT_FILE, "w", encoding="utf-8") as f:
        f.write(md_content)
    print(f"✅ Markdown report updated and saved to {MARKDOWN_REPORT_FILE}")
    return history

# -------------------- CSV Report Generation --------------------

def generate_csv_rows(history, repos):
    rows = []
    for project in sorted(repos.keys()):
        if project not in history:
            continue
        language = history[project].get("language", "Unknown")
        full_name = history[project].get("repo", project)
        rows.append([f"Project: {project}", f"Repo: {full_name}", f"Language: {language}"])
        dates = history[project].get("dates", [])
        header = ["Metric"] + dates
        rows.append(header)
        for metric in METRICS_LIST:
            values = history[project]["data"].get(metric, [])
            row = [metric] + [str(v) for v in values]
            rows.append(row)
        rows.append([])  # spacer
    return rows


def update_csv_report(repos):
    history = load_history()
    csv_rows = generate_csv_rows(history, repos)
    with open(CSV_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        for row in csv_rows:
            writer.writerow(row)
    print(f"✅ CSV data updated and saved to {CSV_FILE}")

# -------------------- Main --------------------

if __name__ == "__main__":
    repos = build_repos_dict()
    print(f"📦 Tracking {len(repos)} repositories")
    update_markdown_reports(repos)
    update_csv_report(repos)
