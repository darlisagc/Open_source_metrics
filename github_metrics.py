import requests
import os
import pandas as pd
from datetime import datetime, timedelta

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

# Markdown report file
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
    last_day_of_last_month = (datetime.today().replace(day=1) - timedelta(days=1)).strftime("%d/%m/%Y")
    yesterday = (datetime.today() - timedelta(days=1)).strftime("%d/%m/%Y")

    metrics_list = [
        "GitHub Stars",
        "GitHub Forks",
        "GitHub Contributors",
        "GitHub Pull Requests (PRs) Merged",
        "GitHub Commit Frequency",
        "GitHub Dependent Projects"
    ]

    # Prepare Markdown content
    md_content = "# 🚀 Open Source Metrics Report\n\n"
    md_content += "| ID | Metric |"

    # Create dynamic columns for each project (two timestamps) and one total column
    for project_name in REPOS.keys():
        md_content += f" {project_name} ({last_day_of_last_month}) | {project_name} ({yesterday}) |"
    md_content += " Total ({last_day_of_last_month}) | Total ({yesterday}) |\n"

    # Align columns: left for descriptions, right for numerical data
    md_content += "|----|---------|" + "------:|------:|" * len(REPOS) + "------:|------:|\n"

    # Fetch and add data
    for idx, metric in enumerate(metrics_list, start=1):
        md_content += f"| {idx} | {metric} |"

        total_last_month = 0
        total_yesterday = 0

        for repo in REPOS.values():
            metrics_last_month = get_github_metrics(repo)[idx - 1]
            metrics_yesterday = get_github_metrics(repo)[idx - 1]

            # Add to total (ignore non-numeric values)
            total_last_month += int(metrics_last_month) if str(metrics_last_month).isdigit() else 0
            total_yesterday += int(metrics_yesterday) if str(metrics_yesterday).isdigit() else 0

            md_content += f" {metrics_last_month} | {metrics_yesterday} |"

        # Append total column values
        md_content += f" {total_last_month} | {total_yesterday} |\n"

    # Save Markdown file
    with open(REPORT_FILE, "w") as f:
        f.write(md_content)

    print(f"✅ Updated {REPORT_FILE} successfully!")

if __name__ == "__main__":
    update_markdown()
