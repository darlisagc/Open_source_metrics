import requests
import os
from datetime import datetime

# GitHub API Token (Optional, recommended for higher rate limits)
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

# List of repositories to track (Format: "owner/repo")
REPOS = [
    "txpipe/yaci-store",
    "input-output-hk/cardano-node"
]

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
    date_label = datetime.now().strftime("%Y-%m-%d")
    
    # Read existing report or initialize new one
    if os.path.exists(REPORT_FILE):
        with open(REPORT_FILE, "r") as file:
            lines = file.readlines()
    else:
        lines = ["# 🚀 Open Source Projects Metrics\n\n"]

    # Add date header
    lines.append(f"## 📅 Metrics for {date_label}\n\n")

    # Column headers
    repo_names = [repo.split("/")[1] for repo in REPOS]
    header = "| Metric | " + " | ".join(repo_names) + " |\n"
    separator = "|--------|" + "|".join(["------------"] * len(REPOS)) + "|\n"

    # Collect metrics
    metric_names = [
        "GitHub Stars", "GitHub Forks", "GitHub Contributors",
        "PRs Merged", "Commit Frequency", "Dependent Projects"
    ]

    metrics_data = []
    
    for idx, metric in enumerate(metric_names):
        row = f"| **{metric}** |"
        for repo in REPOS:
            repo_data = get_github_metrics(repo)
            if repo_data:
                row += f" {repo_data[idx]} |"
            else:
                row += " N/A |"
        metrics_data.append(row + "\n")

    # Append new data
    with open(REPORT_FILE, "w") as file:
        file.writelines(lines)
        file.write(header)
        file.write(separator)
        file.writelines(metrics_data)

    print(f"Updated {REPORT_FILE} successfully.")

if __name__ == "__main__":
    update_markdown()
