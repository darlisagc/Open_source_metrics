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

# File names for persistent data and final Markdown report
DATA_FILE = "open_source_metrics_data.csv"
REPORT_FILE = "open_source_metrics.md"

def get_github_metrics(repo):
    """Fetch GitHub metrics for the given repository."""
    url = f"https://api.github.com/repos/{repo}"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        data = response.json()
        stars = data.get("stargazers_count", 0)
        forks = data.get("forks_count", 0)
        # Contributors: fetch first page and count returned items.
        contributors_url = f"{url}/contributors?per_page=1"
        contributors_response = requests.get(contributors_url, headers=HEADERS)
        contributors = len(contributors_response.json()) if contributors_response.status_code == 200 else 0
        # Merged PRs: count closed PRs with a "merged_at" timestamp.
        prs_url = f"{url}/pulls?state=closed&per_page=100"
        prs_response = requests.get(prs_url, headers=HEADERS)
        merged_prs = sum(1 for pr in prs_response.json() if pr.get("merged_at"))
        # Commit Frequency: number of commits (up to 100)
        commits_url = f"{url}/commits?per_page=100"
        commits_response = requests.get(commits_url, headers=HEADERS)
        commit_frequency = len(commits_response.json())
        # Dependent Projects: not available via API; use placeholder.
        dependents_count = "Check manually"
        return [stars, forks, contributors, merged_prs, commit_frequency, dependents_count]
    else:
        print(f"Error fetching {repo}: {response.status_code}")
        return ["N/A"] * 6

def update_markdown():
    date_label = datetime.now().strftime("%d/%m/%Y")
    # Fixed list of metrics (each row represents a metric)
    metrics_list = [
        "GitHub Stars",
        "GitHub Forks",
        "GitHub Contributors",
        "GitHub Pull Requests (PRs) Merged",
        "GitHub Commit Frequency",
        "GitHub Dependent Projects"
    ]
    
    # Load existing data or create new DataFrame with fixed columns "ID" and "Metrics"
    if os.path.exists(DATA_FILE):
        df = pd.read_csv(DATA_FILE)
    else:
        df = pd.DataFrame({
            "ID": range(1, len(metrics_list) + 1),
            "Metrics": metrics_list
        })
    
    # For each repository, get the latest metrics and create a new column.
    new_columns = {}
    for project_name, repo in REPOS.items():
        repo_data = get_github_metrics(repo)
        # Ensure the new data list has the same length as the DataFrame (should be 6)
        if len(repo_data) < len(df):
            repo_data.extend([""] * (len(df) - len(repo_data)))
        elif len(repo_data) > len(df):
            df = df.reindex(range(len(repo_data)))
        col_name = f"{project_name} ({date_label})"
        new_columns[col_name] = repo_data
    new_df = pd.DataFrame(new_columns)
    # Merge the new columns into the DataFrame.
    df = pd.concat([df, new_df], axis=1)
    
    # Save updated data to the CSV file.
    df.to_csv(DATA_FILE, index=False)
    
    # Build an HTML table with two header rows.
    # The first two columns are fixed ("ID" and "Metrics").
    fixed_cols = df.columns[:2].tolist()
    var_cols = df.columns[2:]
    
    # Group the variable columns by project name.
    project_groups = {}
    for col in var_cols:
        # Expect col in format "Project Name (Date)"
        if " (" in col and col.endswith(")"):
            proj, date_part = col.split(" (")
            date_part = date_part[:-1]  # remove the trailing ")"
            project_groups.setdefault(proj, []).append((date_part, col))
        else:
            project_groups.setdefault(col, []).append(("", col))
    
    # Start building the HTML table.
    html = "<table>\n"
    # First header row: fixed headers and then merged project names.
    html += "  <tr>\n"
    html += '    <th rowspan="2">ID</th>\n'
    html += '    <th rowspan="2">Metrics</th>\n'
    for proj, cols in project_groups.items():
        colspan = len(cols)
        html += f'    <th colspan="{colspan}">{proj}</th>\n'
    html += "  </tr>\n"
    
    # Second header row: collection dates for each project.
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
    
    # Write the HTML table into the Markdown report file.
    with open(REPORT_FILE, "w") as f:
        f.write("# 🚀 Open Source Projects Metrics\n\n")
        f.write(html)
    
    print(f"✅ Updated {REPORT_FILE} successfully!")

if __name__ == "__main__":
    update_markdown()
