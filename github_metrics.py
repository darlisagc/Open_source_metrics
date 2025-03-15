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

# File names for persistent data and final Markdown report
DATA_FILE = "open_source_metrics_data.csv"
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

    metrics_list = [
        "GitHub Stars",
        "GitHub Forks",
        "GitHub Contributors",
        "GitHub Pull Requests (PRs) Merged",
        "GitHub Commit Frequency",
        "GitHub Dependent Projects"
    ]
    
    if os.path.exists(DATA_FILE):
        df = pd.read_csv(DATA_FILE)
    else:
        df = pd.DataFrame({"ID": range(1, len(metrics_list) + 1), "Metrics": metrics_list})

    new_data = {}
    for project_name, repo in REPOS.items():
        new_data[f"{project_name} ({last_day_of_last_month})"] = get_github_metrics(repo)

    new_df = pd.DataFrame(new_data)
    df = pd.concat([df, new_df], axis=1)
    
    df.to_csv(DATA_FILE, index=False)
    df.to_markdown(REPORT_FILE, index=False)

    print(f"✅ Updated {REPORT_FILE} and {DATA_FILE} successfully!")

if __name__ == "__main__":
    update_markdown()
