import requests
import os
import pandas as pd
from datetime import datetime

# ✅ Updated repository list
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

# GitHub API Token (Optional)
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

# GitHub API Headers
HEADERS = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}

# Markdown File
REPORT_FILE = "open_source_metrics.md"

# Fetch GitHub Metrics
def get_github_metrics(repo):
    """ Fetch GitHub repository metrics """
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
        return ["N/A"] * 6  # Return empty values if request fails

# Update Markdown File
def update_markdown():
    date_label = datetime.now().strftime("%d/%m/%Y")

    # Define metrics list
    metrics_list = [
        "GitHub Stars",
        "GitHub Forks",
        "GitHub Contributors",
        "GitHub Pull Requests (PRs) Merged",
        "GitHub Commit Frequency",
        "GitHub Dependent Projects",
    ]

    # ✅ Load existing data or create new DataFrame
    if os.path.exists(REPORT_FILE):
        df = pd.read_csv(REPORT_FILE)
    else:
        df = pd.DataFrame({"ID": range(1, len(metrics_list) + 1), "Metrics": metrics_list})

    # ✅ Ensure correct row count in new columns
    for project_name, repo in REPOS.items():
        repo_data = get_github_metrics(repo)

        if repo_data:
            new_column_name = f"{project_name} ({date_label})"

            # ✅ Adjust column length to match existing DataFrame
            if len(repo_data) < len(df):
                repo_data.extend([""] * (len(df) - len(repo_data)))  # Fill missing rows
            elif len(repo_data) > len(df):
                df = df.reindex(range(len(repo_data)))  # Expand DataFrame if needed
            
            df[new_column_name] = repo_data  # ✅ Correctly align values

    # Save updated report
    df.to_csv(REPORT_FILE, index=False)

    print(f"✅ Updated {REPORT_FILE} successfully!")

if __name__ == "__main__":
    update_markdown()
