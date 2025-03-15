import requests
import os
import pandas as pd
import re
from datetime import datetime

# Define repository list
REPOS = {
    "CF LOB Platform": "cardano-foundation/cf-lob-platform",
    "Cardano IBC Incubator": "cardano-foundation/cardano-ibc-incubator",
    "Cardano Rosetta Java": "cardano-foundation/cardano-rosetta-java",
    "Cardano Devkit": "cardano-foundation/cf-devkit",  # Adjusted name if needed.
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
    Get the number of unique contributors for a given repository using pagination.
    This function uses 100 items per page and checks the 'Link' header to determine
    the total number of pages.
    """
    base_url = f"https://api.github.com/repos/{repo}/contributors?per_page=100&anon=true"
    response = requests.get(base_url, headers=HEADERS)
    if response.status_code != 200:
        print(f"Error fetching contributors for {repo}: {response.status_code}")
        return "N/A"
    
   
