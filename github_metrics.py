import requests
import os
import pandas as pd
from datetime import datetime

# GitHub API Token (Optional, recommended for higher rate limits)
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

# List of repositories to track (Format: "owner/repo")
REPOS = {
    "Yaci Store": "txpipe/yaci-store",
    "Cardano IBC": "input-output-hk/cardano-ibc"
}

# GitHub API Headers
HEADERS = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}

# Markdown File
REPORT_FILE = "open_source_metrics.md"

# Fetch GitHub Metrics
def get_github_metrics(repo):
    url = f"https://api.github.com/repos/{repo}"
    response = requests.get(url, headers=HEADERS)

    if response.status_code == 200:
        data = response.json()
        stars = data.get("stargazers_count", 0)
        forks = data.get("forks_count", 0)

        # Contributors Count
        contributors_url = f"{url}/contributors?per_page=1"
        contributors_response = requests.get(contributors_url, headers=HEADERS)
        contributors = len(contributors_response.json()) if contributors_response.status_code == 200 else 0

        # Merged PRs
        prs_url = f"{url}/pulls?state=closed&per_page=100"
        prs_response = requests.get(prs_url, headers=HEADERS)
        merged_prs = sum(1 for pr in prs_response.json() if pr.get("merged_at"))

        # Commit Frequency (Past 100 commits)
        commits_url = f"{url}/commits?per_page=100"
        commits_response = requests.get(commits_url, headers=HEADERS)
        commit_frequency = len(commits_response.json())

        # Dependent Projects (GitHub does not expose this via API)
        dependents_count = "Check manually"

        return [stars, forks, contributors, merged_prs, commit_frequency, dependents_count]
    else:
        print(f"Error fetching {repo}: {response.status_code}")
        return None

# Update Markdown File
def update_markdown():
    date_label = datetime.now().strftime("%d/%m/%Y")

    # Define table structure
    metrics_list = [
        "GitHub Stars",
        "GitHub Forks",
        "GitHub Contributors",
        "GitHub Pull Requests (PRs) Merged",
        "GitHub Commit Frequency",
        "GitHub Dependent Projects",
    ]

    # Load existing data or create new DataFrame
    if os.path.exists(REPORT_FILE):
        df = pd.read_csv(REPORT_FILE)
    else:
        df = pd.DataFrame({"ID": range(1, len(metrics_list) + 1), "Metrics": metrics_list})

    # Append new column for each project with the latest data
    for project_name, repo in REPOS.items():
        repo_data = get_github_metrics(repo)

        if repo_data:
            new_column_name = f"{project_name} - {date_label}"  # Format: "Project Name - Date"
            df[new_column_name] = [date_label] + repo_data

    # Save updated report
    df.to_csv(REPORT_FILE, index=False)

    print(f"✅ Updated {REPORT_FILE} successfully!")

if __name__ == "__main__":
    update_markdown()
