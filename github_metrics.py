import requests
import os
from datetime import datetime

# GitHub repositories to track
REPOS = {
    "CF LOB Platform": "cardano-foundation/cf-lob-platform",
    "Cardano IBC Incubator": "cardano-foundation/cardano-ibc-incubator",
    "Cardano Rosetta Java": "cardano-foundation/cardano-rosetta-java",
    "Cardano Devkit": "cardano-foundation/cf-devkit",
    "CF Cardano Ballot": "cardano-foundation/cf-cardano-ballot",
    "CIP30 Data Signature Parser": "cardano-foundation/cip30-data-signature-parser",
    "Cardano Connect With Wallet": "cardano-foundation/cardano-connect-with-wallet",
    "CF Adahandle Resolver": "cardano-foundation/cf-adahandle-resolver",
    "CF Java Rewards Calculation": "cardano-foundation/cf-java-rewards-calculation",
    "Cardano Client Lib": "bloxbean/cardano-client-lib",
    "Yaci Devkit": "bloxbean/yaci-devkit",
    "Yaci": "bloxbean/yaci",
    "Yaci Store": "bloxbean/yaci-store"
}

# GitHub API token (optional but recommended to avoid rate limits)
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}

# Output Markdown file
REPORT_FILE = "open_source_metrics.md"

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

def get_github_metrics(repo):
    url = f"https://api.github.com/repos/{repo}"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        data = response.json()
        contributors_count = get_contributors_count(repo)
        merged_prs = get_merged_prs_count(repo)
        releases_count = get_releases_count(repo)
        github_downloads = get_github_release_downloads(repo)
        maven_monthly_downloads = ""  # Placeholder for future data
        return [
            data.get("stargazers_count", 0),
            data.get("forks_count", 0),
            contributors_count,
            merged_prs,
            releases_count,
            github_downloads,
            maven_monthly_downloads
        ]
    return ["N/A"] * 7

# -------------------- Updated Report Generator --------------------

def update_reports():
    report_date = datetime.today().strftime("%d/%m/%Y")
    metrics_list = [
        "GitHub Stars",
        "GitHub Forks",
        "GitHub Contributors",
        "GitHub PRs Merged",
        "GitHub Releases",
        "GitHub Release Downloads",
        "Maven Monthly Downloads"
    ]

    # Load existing Markdown content if available
    if os.path.exists(REPORT_FILE):
        with open(REPORT_FILE, "r", encoding="utf-8") as f:
            existing_content = f.read()
    else:
        existing_content = "# 🚀 Open Source Metrics Report\n\n"

    # Prepare a new section for the current run
    new_section = f"## 📅 {report_date}\n\n"
    for project_name, repo in REPOS.items():
        new_section += f"### 📌 {project_name}\n"
        new_section += f"| Metric | {report_date} |\n"
        new_section += "|--------|----------------:|\n"
        repo_metrics = get_github_metrics(repo)
        for idx, metric in enumerate(metrics_list):
            new_section += f"| {metric} | {repo_metrics[idx]} |\n"
        new_section += "\n"

    # Append the new section to the existing content
    updated_content = existing_content + "\n" + new_section

    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        f.write(updated_content)
    print(f"✅ Markdown report updated and saved to {REPORT_FILE}")

# -------------------- Run --------------------

if __name__ == "__main__":
    update_reports()
