import requests
import os
import pandas as pd
from datetime import datetime

# Define repository list
REPOS = {
    "CF LOB Platform": "cardano-foundation/cf-lob-platform",
    "Veridian Wallet": "cardano-foundation/veridian-wallet",
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

# GitHub API Token (optional, but helps avoid rate limits)
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}

# Output files
REPORT_FILE = "open_source_metrics.md"
CSV_FILE = "open_source_metrics_data.csv"

def get_contributors_count(repo):
    """Get the total number of unique contributors for the given repository."""
    count = 0
    page = 1
    while True:
        url = f"https://api.github.com/repos/{repo}/contributors?per_page=100&page={page}&anon=true"
        response = requests.get(url, headers=HEADERS)
        if response.status_code != 200:
            print(f"Error fetching contributors for {repo}: {response.status_code}")
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
    """Get the number of merged pull requests for the repository."""
    merged_count = 0
    page = 1
    while True:
        url = f"https://api.github.com/repos/{repo}/pulls?state=closed&per_page=100&page={page}"
        response = requests.get(url, headers=HEADERS)
        if response.status_code != 200:
            print(f"Error fetching PRs for {repo}: {response.status_code}")
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
    """Get the number of releases for the repository."""
    count = 0
    page = 1
    while True:
        url = f"https://api.github.com/repos/{repo}/releases?per_page=100&page={page}"
        response = requests.get(url, headers=HEADERS)
        if response.status_code != 200:
            print(f"Error fetching releases for {repo}: {response.status_code}")
            return "N/A"
        releases = response.json()
        if not releases:
            break
        count += len(releases)
        if len(releases) < 100:
            break
        page += 1
    return count

def get_github_metrics(repo):
    """Fetch GitHub metrics for the given repository."""
    url = f"https://api.github.com/repos/{repo}"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        data = response.json()
        contributors_count = get_contributors_count(repo)
        merged_prs = get_merged_prs_count(repo)
        releases_count = get_releases_count(repo)
        return [
            data.get("stargazers_count", 0),
            data.get("forks_count", 0),
            contributors_count,
            merged_prs,
            releases_count
        ]
    else:
        print(f"Error fetching {repo}: {response.status_code}")
        return ["N/A"] * 5

def update_reports():
    report_date = datetime.today().strftime("%d/%m/%Y")

    metrics_list = [
        "GitHub Stars",
        "GitHub Forks",
        "GitHub Contributors",
        "GitHub Pull Requests (PRs) Merged",
        "GitHub Releases"
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

    md_content += f"## 📊 Total Across All Repositories (Data from {report_date})\n"
    md_content += f"| Metric | {report_date} |\n"
    md_content += "|--------|----------------:|\n"
    for metric in metrics_list:
        md_content += f"| {metric} | {totals[metric]} |\n"

    with open(REPORT_FILE, "w") as f:
        f.write(md_content)
    print(f"✅ Updated {REPORT_FILE} successfully!")

    df = pd.DataFrame(csv_data)
    df.to_csv(CSV_FILE, index=False)
    print(f"✅ Updated {CSV_FILE} successfully!")

if __name__ == "__main__":
    update_reports()
