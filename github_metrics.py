import requests
import os
import json
import csv
from datetime import datetime, timedelta

# -------------------- Configuration --------------------

# GitHub repositories to track
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

# GitHub API token (optional, for higher rate limits)
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}

# Output files
MARKDOWN_REPORT_FILE = "open_source_metrics.md"
CSV_FILE = "open_source_metrics_data.csv"
HISTORY_FILE = "metrics_history.json"

# List of metrics to collect (order matters)
METRICS_LIST = [
    "GitHub Stars",
    "GitHub Forks",
    "GitHub Contributors",
    "GitHub PRs Merged",
    "GitHub Releases",
    "GitHub Release Downloads",
    "Maven Monthly Downloads"
]

# -------------------- GitHub Metric Functions --------------------

def get_contributors_count(repo):
    count = 0
    page = 1
    while True:
        url = f"https://api.github.com/repos/{repo}/contributors?per_page=100&page={page}&anon=true"
        response = requests.get(url, headers=HEADERS)
        if response.status_code != 200:
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
    merged_count = 0
    page = 1
    while True:
        url = f"https://api.github.com/repos/{repo}/pulls?state=closed&per_page=100&page={page}"
        response = requests.get(url, headers=HEADERS)
        if response.status_code != 200:
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
    count = 0
    page = 1
    while True:
        url = f"https://api.github.com/repos/{repo}/releases?per_page=100&page={page}"
        response = requests.get(url, headers=HEADERS)
        if response.status_code != 200:
            return "N/A"
        releases = response.json()
        if not releases:
            break
        count += len(releases)
        if len(releases) < 100:
            break
        page += 1
    return count

def get_github_release_downloads(repo):
    url = f"https://api.github.com/repos/{repo}/releases"
    response = requests.get(url, headers=HEADERS)
    if response.status_code != 200:
        return "N/A"
    releases = response.json()
    total_downloads = 0
    for release in releases:
        for asset in release.get("assets", []):
            total_downloads += asset.get("download_count", 0)
    return total_downloads

def get_github_metrics(repo):
    url = f"https://api.github.com/repos/{repo}"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        data = response.json()
        contributors_count = get_contributors_count(repo)
        merged_prs = get_merged_prs_count(repo)
        releases_count = get_releases_count(repo)
        github_downloads = get_github_release_downloads(repo)
        maven_monthly_downloads = ""  # Placeholder
        return [
            data.get("stargazers_count", 0),
            data.get("forks_count", 0),
            contributors_count,
            merged_prs,
            releases_count,
            github_downloads,
            maven_monthly_downloads
        ]
    return ["N/A"] * 7

# -------------------- Historical Data Functions --------------------

def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    else:
        return {}

def save_history(history):
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

def update_history(simulated_date=None):
    # Use simulated_date if provided; otherwise, use today's date.
    current_date = simulated_date if simulated_date else datetime.today().strftime("%d/%m/%Y")
    history = load_history()
    
    for project_name, repo in REPOS.items():
        metrics = get_github_metrics(repo)
        if project_name not in history:
            # Initialize history for the project
            history[project_name] = {"dates": [], "data": {metric: [] for metric in METRICS_LIST}}
        # Only add new data if this date hasn't been recorded yet for the project.
        if current_date not in history[project_name]["dates"]:
            history[project_name]["dates"].append(current_date)
            for idx, metric in enumerate(METRICS_LIST):
                history[project_name]["data"][metric].append(metrics[idx])
    save_history(history)
    return history, current_date

# -------------------- Markdown Report Generation --------------------

def generate_markdown_report(history, current_date):
    md_content = "# 🚀 Open Source Metrics Report\n\n"
    md_content += f"_Data collected up to **{current_date}**_\n\n"
    
    for project_name in REPOS.keys():
        md_content += f"### 📌 {project_name}\n\n"
        # Get collected dates and metrics for the project
        dates = history.get(project_name, {}).get("dates", [])
        data = history.get(project_name, {}).get("data", {})
        
        # Create table header with the collected dates
        header = "| Metric | " + " | ".join(dates) + " |\n"
        separator = "|" + "--------|" * (len(dates) + 1) + "\n"
        md_content += header + separator
        
        # For each metric, add a row of values
        for metric in METRICS_LIST:
            values = data.get(metric, [])
            row = f"| {metric} | " + " | ".join(str(v) for v in values) + " |\n"
            md_content += row
        md_content += "\n"
    
    return md_content

def update_markdown_reports(simulated_date=None):
    history, current_date = update_history(simulated_date)
    md_content = generate_markdown_report(history, current_date)
    
    with open(MARKDOWN_REPORT_FILE, "w", encoding="utf-8") as f:
        f.write(md_content)
    print(f"✅ Markdown report updated and saved to {MARKDOWN_REPORT_FILE}")

# -------------------- CSV Report Generation --------------------

def generate_csv_report(history):
    # Get the union of dates across all projects.
    all_dates = set()
    for project in history:
        for d in history[project]["dates"]:
            all_dates.add(d)
    # Sort dates by real date
    all_dates = sorted(list(all_dates), key=lambda x: datetime.strptime(x, "%d/%m/%Y"))
    
    # Build CSV header: start with "Project", then one column per metric for each date.
    headers = ["Project"]
    for date in all_dates:
        for metric in METRICS_LIST:
            headers.append(f"{metric} ({date})")
    
    # Build rows for each project.
    rows = []
    for project in sorted(REPOS.keys()):
        row = [project]
        project_history = history.get(project, {})
        proj_dates = project_history.get("dates", [])
        proj_data = project_history.get("data", {})
        # For each expected date (in sorted order), add metric values. If a date is missing, fill with blanks.
        for date in all_dates:
            if date in proj_dates:
                idx = proj_dates.index(date)
                for metric in METRICS_LIST:
                    val_list = proj_data.get(metric, [])
                    # Ensure the index exists; otherwise, add an empty string.
                    row.append(val_list[idx] if idx < len(val_list) else "")
            else:
                row.extend([""] * len(METRICS_LIST))
        rows.append(row)
    
    # Write the CSV file.
    with open(CSV_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)
    print(f"✅ CSV data updated and saved to {CSV_FILE}")

def update_csv_report():
    # Load the latest history
    history = load_history()
    generate_csv_report(history)

# -------------------- Main: Simulate Two Runs --------------------

if __name__ == "__main__":
    # Simulate data collection for yesterday and today.
    yesterday = (datetime.today() - timedelta(days=1)).strftime("%d/%m/%Y")
    today = datetime.today().strftime("%d/%m/%Y")
    
    # Simulate report updates for yesterday's data.
    update_markdown_reports(simulated_date=yesterday)
    
    # Then simulate report updates for today's data.
    update_markdown_reports(simulated_date=today)
    
    # Finally, update the CSV file based on the complete history.
    update_csv_report()
