import os
import requests
import markdown
from datetime import datetime

# Load environment variables from GitHub Secrets
CONFLUENCE_API_TOKEN = os.getenv("CONFLUENCE_API_TOKEN")
CONFLUENCE_EMAIL = os.getenv("CONFLUENCE_EMAIL")
CONFLUENCE_SPACE_KEY = os.getenv("CONFLUENCE_SPACE_KEY")
CONFLUENCE_PARENT_PAGE_ID = os.getenv("CONFLUENCE_PARENT_PAGE_ID")  # Optional

BASE_URL = "https://cardanofoundation.atlassian.net/wiki"
AUTH = (CONFLUENCE_EMAIL, CONFLUENCE_API_TOKEN)
HEADERS = {"Content-Type": "application/json"}

def convert_md_to_html(md_file):
    with open(md_file, "r", encoding="utf-8") as f:
        md_content = f.read()
    # Convert Markdown to HTML using the Markdown module
    html_body = markdown.markdown(md_content, extensions=["tables", "fenced_code"])
    return f"<div>{html_body}</div>"

def get_existing_page(title):
    url = f"{BASE_URL}/rest/api/content"
    params = {"title": title, "spaceKey": CONFLUENCE_SPACE_KEY}
    response = requests.get(url, headers=HEADERS, auth=AUTH, params=params)
    if response.status_code != 200:
        print(f"⚠️ Failed to check existing page: {response.status_code} - {response.text}")
        return None
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
    if response.status_code == 200:
        print("✅ Successfully updated Confluence page.")
    else:
        print(f"❌ Failed to update page: {response.status_code} - {response.text}")

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
    if response.status_code == 200:
        print("✅ Successfully created new Confluence page.")
    else:
        print(f"❌ Failed to create page: {response.status_code} - {response.text}")

def push_to_confluence():
    report_title = f"Open Source Metrics Report - {datetime.today().strftime('%B %Y')}"
    print(f"📄 Publishing: {report_title}")
    html_body = convert_md_to_html("open_source_metrics.md")

    page = get_existing_page(report_title)
    if page:
        update_page(page["id"], report_title, html_body, page["version"]["number"])
    else:
        create_page(report_title, html_body)

if __name__ == "__main__":
    push_to_confluence()
