import requests
import os
import pandas as pd
from datetime import datetime

# Define repository list
REPOS = {
    "CF LOB Platform": "cardano-foundation/cf-lob-platform",
    "Cardano IBC Incubator": "cardano-foundation/cardano-ibc-incubator",
    "Cardano Rosetta Java": "cardano-foundation/cardano-rosetta-java",
    "Cardano Devkit": "cardano-foundation/cardano-devkit",
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

# GitHub API Token (if available)
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}

# Markdown report file (constant file name)
REPORT_FILE = "open_source_metrics.md"

def get_github_metrics(repo):
    """Fetch GitHub metrics for the given repository."""
    url = f"https://api.github.com/repos/{repo}"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        data = response.json()
        return [
            data.get("stargazers_count", 0),
            data.get("forks_count", 0),
            len(requests.get(f"{url}/contributors?per_page=1", headers=HEADERS).json()),
            sum(1 for pr in requests.get(f"{url}/pulls?state=closed&per_page=100", headers=HEADERS).json() if pr.get("merged_at")),
            len(requests.get(f"{url}/commits?per_page=100", headers=HEADERS).json()),
            "Check manually"
        ]
    else:
        print(f"Error fetching {repo}: {response.status_code}")
        return ["N/A"] * 6

def update_markdown():
    # Use today's date as the report date (should be the last day of the month)
    report_date = datetime.today().strftime("%d/%m/%Y")
    
    metrics_list = [
        "GitHub Stars",
        "GitHub Forks",
        "GitHub Contributors",
        "GitHub Pull Requests (PRs) Merged",
        "GitHub Commit Frequency",
        "GitHub Dependent Projects"
    ]

    # Prepare Markdown content
    md_content = f"# 🚀 Open Source Metrics Report\n\n"
    md_content += f"📅 Data collected on **{report_date}**\n\n"

    # Loop through each repository
    total_metrics = [0] * len(metrics_list)

    for project_name, repo in REPOS.items():
        md_content += f"## 📌 {project_name}\n"
        md_content += f"| Metric | {report_date} |\n"
        md_content += "|--------|----------------:|\n"

        repo_metrics = get_github_metrics(repo)

        for idx, metric in enumerate(metrics_list):
            value = repo_metrics[idx]
            # Accumulate totals (skip non-numeric values)
            if str(value).isdigit():
                total_metrics[idx] += int(value)

            md_content += f"| {metric} | {value} |\n"

        md_content += "\n"  # Space between repo sections

    # Add totals section with date in header
    md_content += f"## 📊 Total Across All Repositories (Data from {report_date})\n"
    md_content += f"| Metric | {report_date} |\n"
    md_content += "|--------|----------------:|\n"
    for idx, metric in enumerate(metrics_list):
        md_content += f"| {metric} | {total_metrics[idx]} |\n"

    # Always update the same file (overwriting it)
    with open(REPORT_FILE, "w") as f:
        f.write(md_content)

    print(f"✅ Updated {REPORT_FILE} successfully!")

if __name__ == "__main__":
    update_markdown()
