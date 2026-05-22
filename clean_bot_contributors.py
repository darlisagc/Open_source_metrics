#!/usr/bin/env python3
"""
Clean bot usernames from external_contributors_history.json.

Removes bot accounts from all contributor lists and recalculates counts.
"""

import json
import shutil
import os

INPUT_FILE = "/Users/darlisaconsoni/Open_source_metrics/external_contributors_history.json"
DASHBOARD_COPY = "/Users/darlisaconsoni/Open_source_metrics/dashboard/external_contributors_history.json"

BOTS = {"dependabot[bot]", "github-actions[bot]", "actions-user", "web-flow"}


def clean_list(contributors):
    """Remove bot usernames from a list of contributors."""
    return [c for c in contributors if c not in BOTS]


def main():
    # Load the data
    with open(INPUT_FILE, "r") as f:
        data = json.load(f)

    # Track removals for reporting
    total_removed = 0

    # Process each period
    for period in data["periods"]:
        period_label = period.get("label", period.get("period", "unknown"))

        # Process each repo in the period
        for repo_name, repo_data in period["repos"].items():
            new_before = len(repo_data.get("new_contributors", []))
            ret_before = len(repo_data.get("returning_contributors", []))

            # Remove bots from contributor arrays
            repo_data["new_contributors"] = clean_list(repo_data.get("new_contributors", []))
            repo_data["returning_contributors"] = clean_list(repo_data.get("returning_contributors", []))

            new_after = len(repo_data["new_contributors"])
            ret_after = len(repo_data["returning_contributors"])

            removed = (new_before - new_after) + (ret_before - ret_after)
            if removed > 0:
                print(f"  [{period_label}] {repo_name}: removed {removed} bot(s)")
                total_removed += removed

            # Recalculate counts
            repo_data["new_count"] = len(repo_data["new_contributors"])
            repo_data["returning_count"] = len(repo_data["returning_contributors"])
            repo_data["total_external"] = repo_data["new_count"] + repo_data["returning_count"]

        # Process summary
        summary = period["summary"]
        summary["all_contributors"] = clean_list(summary.get("all_contributors", []))

        # Recalculate summary totals from repo data
        total_new = sum(r["new_count"] for r in period["repos"].values())
        total_returning = sum(r["returning_count"] for r in period["repos"].values())

        summary["total_new"] = total_new
        summary["total_returning"] = total_returning
        summary["total_external"] = total_new + total_returning

        print(f"  [{period_label}] Summary: total_external={summary['total_external']}, "
              f"total_new={summary['total_new']}, total_returning={summary['total_returning']}, "
              f"all_contributors count={len(summary['all_contributors'])}")

    # Clean all_time_contributors (it's a dict)
    all_time = data.get("all_time_contributors", {})
    bots_found_in_all_time = [b for b in BOTS if b in all_time]
    for bot in bots_found_in_all_time:
        del all_time[bot]
        total_removed += 1
    if bots_found_in_all_time:
        print(f"\n  Removed from all_time_contributors: {bots_found_in_all_time}")
    print(f"  all_time_contributors count after cleaning: {len(all_time)}")

    print(f"\nTotal bot entries removed: {total_removed}")

    # Write cleaned JSON back
    with open(INPUT_FILE, "w") as f:
        json.dump(data, f, indent=2)
        f.write("\n")
    print(f"\nWritten cleaned data to: {INPUT_FILE}")

    # Copy to dashboard directory
    os.makedirs(os.path.dirname(DASHBOARD_COPY), exist_ok=True)
    shutil.copy2(INPUT_FILE, DASHBOARD_COPY)
    print(f"Copied cleaned data to: {DASHBOARD_COPY}")


if __name__ == "__main__":
    main()
