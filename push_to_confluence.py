import os
import requests
import base64
import sys
from datetime import datetime
import subprocess

CONFLUENCE_API_TOKEN = os.getenv("CONFLUENCE_API_TOKEN")
CONFLUENCE_EMAIL = os.getenv("CONFLUENCE_EMAIL")
CONFLUENCE_SPACE_KEY = os.getenv("CONFLUENCE_SPACE_KEY")
CONFLUENCE_PARENT_PAGE_ID = os.getenv("CONFLUENCE_PARENT_PAGE_ID")  # Optional

BASE_URL = "https://your-domain.atlassian.net/wiki"  # Replace with your actual Confluence base URL
AUTH = (CONFLUENCE_EMAIL, CONFLUENCE_API_TOKEN)
HEADERS = {"Content-Type": "application/json"}

# Convert Markdown to HTML using Pandoc
def convert_md_to_html(md_file):
    html_file = "report.html"
    subprocess.run(["pandoc", md_file, "-f", "markdown", "-t", "html", "-s", "-o", html_file])
    with open(html_file, "r", encoding="utf-8") as f:
        return f.read()

def get_existing_page(title):
    url = f"{BASE_URL}/rest/api/content"
    params = {"title": title, "spaceKey": CONFLUENCE_SPACE_KEY}
    response = requests.get(url, headers=HEADERS, auth=AUTH, params=params)
    results = response.json().get("results", [])
    return results[0] if results else None

def update_page(page_id, title, body, version):
    url = f"{BASE_URL}/rest/api/content/{page_id}"
    payload = {
        "id": page_id,
        "type": "page",
        "title": title,
        "space": {"key": CONFLUENCE_SPACE_KEY},
        "body": {"storage": {"value": body, "representation": "storage"}},
        "version": {"number": version + 1}
    }
    response = requests.put(url, headers=HEADERS, auth=AUTH, json=payload)
    return response.status_code == 200

def create_page(title, body):
    payload = {
        "type": "page",
        "title": title,
        "space": {"key": CONFLUENCE_SPACE_KEY},
        "body": {"storage": {"value": body, "representation": "storage"}},
    }
    if CONFLUENCE_PARENT_PAGE_ID:
        payload["ancestors"] = [{"id": int(CONFLUENCE_PARENT_PAGE_ID)}]
    url = f"{BASE_URL}/rest/api/content/"
    response = requests.post(url, headers=HEADERS, auth=AUTH, json=payload)
    return response.status_code == 200

def push_to_confluence():
    report_title = f"Open Source Metrics Report - {datetime.today().strftime('%B %Y')}"
    html_body = convert_md_to_html("open_source_metrics.md")

    page = get_existing_page(report_title)
    if page:
        success = update_page(page["id"], report_title, html_body, page["version"]["number"])
        print("✅ Updated existing Confluence page." if success else "❌ Failed to update page.")
    else:
        success = create_page(report_title, html_body)
        print("✅ Created new Confluence page." if success else "❌ Failed to create page.")

if __name__ == "__main__":
    push_to_confluence()
