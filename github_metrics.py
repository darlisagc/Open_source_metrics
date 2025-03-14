import requests
import os
import pandas as pd
from datetime import datetime

# Define repositories to track
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

# Output file name
REPORT_FILE = "open_source_metrics.md"

# Function to fetch GitHub metrics for a given repository
def get_github_metrics(repo):
    url = f"https://api.github.com/repos/{repo}"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        data = response.json()
        stars = data.get("stargazers_count", 0)
        forks = data.get("forks_count", 0)
        # Get contributors count (we use per_page=1 and count the returned list length)
        contributors_url = f"{url}/contributors?per_page=1"
        contributors_response = requests.get(contributors_url, headers=HEADERS)
        contributors = len(contributors_response.json()) if contributors_response.status_code == 200 else 0
        # Count merged PRs
        prs_url = f"{url}/pulls?state=closed&per_page=100"
        prs_response = requests.get(prs_url, headers=HEADERS)
        merged_prs = sum(1 for pr in prs_response.json() if pr.get("merged_at"))
        # Count commits (fetching up to 100)
        commits_url = f"{url}/commits?per_page=100"
        commits_response = requests.get(commits_url, headers=HEADERS)
        commit_frequency = len(commits_response.json())
        dependents_count = "Check manually"  # GitHub API does not provide this directly
        return [stars, forks, contributors, merged_prs, commit_frequency, dependents_count]
    else:
        print(f"Error fetching {repo}: {response.status_code}")
        return ["N/A"] * 6

# Function to update the Markdown report
def update_markdown():
    # Current collection date
    date_label = datetime.now().strftime("%d/%m/%Y")
    
    # Define the metrics (fixed rows)
    metrics_list = [
        "GitHub Stars",
        "GitHub Forks",
        "GitHub Contributors",
        "GitHub Pull Requests (PRs) Merged",
        "GitHub Commit Frequency",
        "GitHub Dependent Projects",
    ]
    
    # Load existing data or create new DataFrame with fixed columns "ID" and "Metrics"
    if os.path.exists(REPORT_FILE):
        # We store data as CSV (later converted to HTML); if file exists, read it.
        df = pd.read_csv(REPORT_FILE)
    else:
        df = pd.DataFrame({"ID": range(1, len(metrics_list) + 1), "Metrics": metrics_list})
    
    # For each repository, get metrics and add a new column named "Project (Date)"
    new_columns = {}
    for project_name, repo in REPOS.items():
        repo_data = get_github_metrics(repo)
        if repo_data:
            col_name = f"{project_name} ({date_label})"
            # Ensure the new column has exactly len(df) elements:
            if len(repo_data) < len(df):
                repo_data.extend([""] * (len(df) - len(repo_data)))
            elif len(repo_data) > len(df):
                df = df.reindex(range(len(repo_data)))
            new_columns[col_name] = repo_data
    new_df = pd.DataFrame(new_columns)
    # Merge new columns into our main DataFrame
    df = pd.concat([df, new_df], axis=1)
    
    # Build an HTML table with two header rows.
    # Fixed columns: "ID" and "Metrics"
    fixed_cols = df.columns[:2].tolist()
    var_cols = df.columns[2:]
    
    # Group variable columns by project name (extracted from "Project (Date)")
    project_groups = {}
    for col in var_cols:
        if " (" in col and col.endswith(")"):
            proj = col.split(" (")[0]
            date_part = col.split(" (")[1][:-1]
            project_groups.setdefault(proj, []).append((date_part, col))
        else:
            project_groups.setdefault(col, []).append(("", col))
    
    # Build the HTML table string
    html = "<table>\n"
    # First header row: Fixed columns and then one cell per project spanning all its date columns.
    html += "  <tr>\n"
    html += '    <th rowspan="2">ID</th>\n'
    html += '    <th rowspan="2">Metrics</th>\n'
    for proj, cols in project_groups.items():
        colspan = len(cols)
        html += f'    <th colspan="{colspan}">{proj}</th>\n'
    html += "  </tr>\n"
    
    # Second header row: List each collection date for the project columns.
    html += "  <tr>\n"
    for proj, cols in project_groups.items():
        for date_part, col in cols:
            html += f'    <th>{date_part}</th>\n'
    html += "  </tr>\n"
    
    # Data rows:
    for i, row in df.iterrows():
        html += "  <tr>\n"
        html += f"    <td>{row['ID']}</td>\n"
        html += f"    <td>{row['Metrics']}</td>\n"
        for proj, cols in project_groups.items():
            for date_part, col in cols:
                html += f"    <td>{row[col]}</td>\n"
        html += "  </tr>\n"
    html += "</table>\n"
    
    # Write the HTML table into the Markdown file (GitHub Markdown renders HTML)
    with open(REPORT_FILE, "w") as file:
        file.write("# 🚀 Open Source Projects Metrics\n\n")
        file.write(html)
    
    print(f"✅ Updated {REPORT_FILE} successfully!")

if __name__ == "__main__":
    update_markdown()
