import os
import requests
import markdown
from datetime import datetime

# Configuration: Load Confluence credentials and settings from environment variables.
CONFLUENCE_API_TOKEN = os.getenv("CONFLUENCE_API_TOKEN")
CONFLUENCE_EMAIL = os.getenv("CONFLUENCE_EMAIL")
CONFLUENCE_SPACE_KEY = os.getenv("CONFLUENCE_SPACE_KEY")
# Use a constant page title for the report.
PAGE_TITLE = "Open Source Metrics Report"
# Optional: Set a parent page ID if needed
CONFLUENCE_PARENT_PAGE_ID = os.getenv("CONFLUENCE_PARENT_PAGE_ID")

BASE_URL = "https://cardanofoundation.atlassian.net/wiki"
AUTH = (CONFLUENCE_EMAIL, CONFLUENCE_API_TOKEN)
HEADERS = {"Content-Type": "application/json"}

def convert_md_to_html(md_file):
    """Convert Markdown content to HTML using the markdown module."""
    with open(md_file, "r", encoding="utf-8") as f:
        md_content = f.read()
    html_content = markdown.markdown(md_content, extensions=["tables", "fenced_code"])
    return f"<div>{html_content}</div>"

def get_existing_page(title):
    """Check if a Confluence page with the given title exists."""
    url = f"{BASE_URL}/rest/api/content"
    params = {"title": title, "spaceKey": CONFLUENCE_SPACE_KEY}
    response = requests.get(url, headers=HEADERS, auth=AUTH, params=params)
    if response.status_code != 200:
        print(f"⚠️ Failed to check existing page: {response.status_code} - {response.text}")
        return None
    results = response.json().get("results", [])
    return results[0] if results else None

def update_page(page_id, title, body, version):
    """Update the existing Confluence page with the new content."""
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
    """Create a new Confluence page if one does not exist (fallback)."""
    url = f"{BASE_URL}/rest/api/content/"
    payload = {
        "type": "page",
        "title": title,
        "space": {"key": CONFLUENCE_SPACE_KEY},
        "body": {"storage": {"value": body, "representation": "storage"}},
    }
    if CONFLUENCE_PARENT_PAGE_ID:
        payload["ancestors"] = [{"id": int(CONFLUENCE_PARENT_PAGE_ID)}]
    response = requests.post(url, headers=HEADERS, auth=AUTH, json=payload)
    if response.status_code == 200:
        print("✅ Successfully created Confluence page.")
    else:
        print(f"❌ Failed to create page: {response.status_code} - {response.text}")

def push_to_confluence():
    # Convert the updated Markdown report to HTML.
    html_body = convert_md_to_html("open_source_metrics.md")
    
    # Use a fixed page title so that we always update the same page.
    title = PAGE_TITLE
    
    existing_page = get_existing_page(title)
    if existing_page:
        # Update the page with the new report content.
        update_page(existing_page["id"], title, html_body, existing_page["version"]["number"])
    else:
        # If no page is found, create one (this should happen only on the first run).
        create_page(title, html_body)

if __name__ == "__main__":
    push_to_confluence()
