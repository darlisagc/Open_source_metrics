import requests
import os
import pandas as pd
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
    "Cardano Client Core": "bloxbean/cardano-client-core",
    "Yaci Devkit": "bloxbean/yaci-devkit",
    "Yaci": "bloxbean/yaci",
    "Yaci Store": "bloxbean/yaci-store"
}

# GitHub API token (optional but recommended to avoid rate limits)
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}

# Output files
REPORT_FILE = "open_source_metrics.md"
CSV_FILE = "open_source_metrics_data.csv"

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
    """Sum all asset downloads from GitHub releases."""
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

# -------------------- Metrics Collector --------------------

def get_github_metrics(repo):
    url = f"https://api.github.com/repos/{repo}"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        data = response.json()
        contributors_count = get_contributors_count(repo)
        merged_prs = get_merged_prs_count(repo)
        releases_count = get_releases_count(repo)
        github_downloads = get_github_release_downloads(repo)
        maven_monthly_downloads = ""  # Leave blank (do not populate yet)
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

# -------------------- Report Generator --------------------

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

    md_content = f"# 🚀 Open Source Metrics Report\n\n📅 Data collected on **{report_date}**\n\n"
    csv_data = []

    for project_name, repo in REPOS.items():
        md_content += f"## 📌 {project_name}\n"
        md_content += f"| Metric | {report_date} |\n"
        md_content += "|--------|----------------:|\n"
        repo_metrics = get_github_metrics(repo)
        row = {"Project": project_name}
        for idx, metric in enumerate(metrics_list):
            value = repo_metrics[idx]
            row[metric] = value
            md_content += f"| {metric} | {value} |\n"
        csv_data.append(row)
        md_content += "\n"

    totals = {metric: 0 for metric in metrics_list}
    for row in csv_data:
        for metric in metrics_list:
            try:
                totals[metric] += int(row[metric])
            except (ValueError, TypeError):
                pass

    md_content += f"## 📊 Totals Across All Projects (as of {report_date})\n"
    md_content += f"| Metric | Total |\n"
    md_content += "|--------|-------:|\n"
    for metric in metrics_list:
        md_content += f"| {metric} | {totals[metric]} |\n"

    with open(REPORT_FILE, "w") as f:
        f.write(md_content)
    print(f"✅ Markdown report saved to {REPORT_FILE}")

    df = pd.DataFrame(csv_data)
    df.to_csv(CSV_FILE, index=False)
    print(f"✅ CSV data saved to {CSV_FILE}")

# -------------------- Run --------------------

if __name__ == "__main__":
    update_reports()
