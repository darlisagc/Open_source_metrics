import requests
import os
import pandas as pd
from datetime import datetime

# Define repository list
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

# GitHub API Token (if available)
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}

# Files
REPORT_FILE = "open_source_metrics.md"
CSV_FILE = "open_source_metrics_data.csv"

def get_contributors_count(repo):
    """
    Get the total number of unique contributors for the given repository.
    This function iterates through pages of results (100 per page)
    until no more contributors are returned.
    """
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

def get_github_metrics(repo):
    """Fetch GitHub metrics for the given repository."""
    url = f"https://api.github.com/repos/{repo}"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        data = response.json()
        # Use the new function to calculate unique contributors
        contributors_count = get_contributors_count(repo)
        return [
            data.get("stargazers_count", 0),
            data.get("forks_count", 0),
            contributors_count,
            sum(1 for pr in requests.get(f"{url}/pulls?state=closed&per_page=100", headers=HEADERS).json() if pr.get("merged_at")),
            len(requests.get(f"{url}/commits?per_page=100", headers=HEADERS).json()),
            "Check manually"
        ]
    else:
        print(f"Error fetching {repo}: {response.status_code}")
        return ["N/A"] * 6

def update_reports():
    # Use today's date as the report date (should be the last day of the month when scheduled)
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

    # List for CSV rows
    csv_data = []

    # Loop through each repository
    for project_name, repo in REPOS.items():
        md_content += f"## 📌 {project_name}\n"
        md_content += f"| Metric | {report_date} |\n"
        md_content += "|--------|----------------:|\n"

        repo_metrics = get_github_metrics(repo)
        # Prepare a dict for CSV row
        row = {"Project": project_name}
        for idx, metric in enumerate(metrics_list):
            value = repo_metrics[idx]
            row[metric] = value
            md_content += f"| {metric} | {value} |\n"

        csv_data.append(row)
        md_content += "\n"  # Space between repo sections

    # Totals calculation for Markdown (optional)
    totals = {metric: 0 for metric in metrics_list}
    for row in csv_data:
        for metric in metrics_list:
            try:
                totals[metric] += int(row[metric])
            except (ValueError, TypeError):
                pass

    # Append totals section to Markdown
    md_content += f"## 📊 Total Across All Repositories (Data from {report_date})\n"
    md_content += f"| Metric | {report_date} |\n"
    md_content += "|--------|----------------:|\n"
    for metric in metrics_list:
        md_content += f"| {metric} | {totals[metric]} |\n"

    # Save Markdown file
    with open(REPORT_FILE, "w") as f:
        f.write(md_content)
    print(f"✅ Updated {REPORT_FILE} successfully!")

    # Create a DataFrame and save CSV file
    df = pd.DataFrame(csv_data)
    df.to_csv(CSV_FILE, index=False)
    print(f"✅ Updated {CSV_FILE} successfully!")

if __name__ == "__main__":
    update_reports()
