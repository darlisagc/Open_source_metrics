import requests
import os
import pandas as pd
from datetime import datetime

# GitHub Repositories to track
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
    "Cardano Client Core": "bloxbean/cardano-client-core",
    "Yaci Devkit": "bloxbean/yaci-devkit",
    "Yaci": "bloxbean/yaci",
    "Yaci Store": "bloxbean/yaci-store"
}

# Map GitHub repos to Maven Central (groupId, artifactId)
MAVEN_COORDS = {
    "bloxbean/cardano-client-lib": ("com.bloxbean.cardano", "cardano-client-lib"),
    "bloxbean/cardano-client-core": ("com.bloxbean.cardano", "cardano-client-core"),
    "bloxbean/yaci-devkit": ("com.bloxbean", "yaci-devkit"),
    "bloxbean/yaci-store": ("com.bloxbean", "yaci-store"),
    "cardano-foundation/cf-java-rewards-calculation": ("org.cardanofoundation", "cf-java-rewards-calculation")
}

# GitHub API Token (optional)
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}

# Output files
REPORT_FILE = "open_source_metrics.md"
CSV_FILE = "open_source_metrics_data.csv"

# ------------------- GitHub Metric Functions -------------------

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

# ------------------- Maven Central -------------------

def get_maven_total_downloads(group_id, artifact_id):
    url = f'https://search.maven.org/solrsearch/select?q=g:"{group_id}"+AND+a:"{artifact_id}"&rows=1&wt=json'
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        try:
            return data["response"]["docs"][0].get("downloadCount", "Not available")
        except (IndexError, KeyError):
            return "Not available"
    return "Error"

# ------------------- Combined Metrics -------------------

def get_github_metrics(repo):
    url = f"https://api.github.com/repos/{repo}"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        data = response.json()
        contributors_count = get_contributors_count(repo)
        merged_prs = get_merged_prs_count(repo)
        releases_count = get_releases_count(repo)

        maven_downloads = "N/A"
        if repo in MAVEN_COORDS:
            group_id, artifact_id = MAVEN_COORDS[repo]
            maven_downloads = get_maven_total_downloads(group_id, artifact_id)

        return [
            data.get("stargazers_count", 0),
            data.get("forks_count", 0),
            contributors_count,
            merged_prs,
            releases_count,
            maven_downloads
        ]
    return ["N/A"] * 6

# ------------------- Report Generation -------------------

def update_reports():
    report_date = datetime.today().strftime("%d/%m/%Y")
    metrics_list = [
        "GitHub Stars",
        "GitHub Forks",
        "GitHub Contributors",
        "GitHub PRs Merged",
        "GitHub Releases",
        "Maven Total Downloads"
    ]

    md_content = f"# 🚀 Open Source Metrics Report\n\n📅 Data collected on **{report_date}**\n\n"
    csv_data = []

    for project_name, repo in REPOS.items():
        md_content += f"## 📌 {project_name}\n"
        md_content += f"| Metric | {report_date} |\n"
        md_content += "|--------|----------------:|\n"
        repo_metrics = get_github_metrics(repo)
        row = {"Project": project_name}
        for idx, metric in enumerate(metrics_list):
            value = repo_metrics[idx]
            row[metric] = value
            md_content += f"| {metric} | {value} |\n"
        csv_data.append(row)
        md_content += "\n"

    totals = {metric: 0 for metric in metrics_list}
    for row in csv_data:
        for metric in metrics_list:
            try:
                totals[metric] += int(row[metric])
            except (ValueError, TypeError):
                pass

    md_content += f"## 📊 Totals Across All Projects (as of {report_date})\n"
    md_content += f"| Metric | Total |\n"
    md_content += "|--------|-------:|\n"
    for metric in metrics_list:
        md_content += f"| {metric} | {totals[metric]} |\n"

    with open(REPORT_FILE, "w") as f:
        f.write(md_content)
    print(f"✅ Markdown report saved to {REPORT_FILE}")

    df = pd.DataFrame(csv_data)
    df.to_csv(CSV_FILE, index=False)
    print(f"✅ CSV data saved to {CSV_FILE}")

# ------------------- Run Script -------------------

if __name__ == "__main__":
    update_reports()
