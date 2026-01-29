#!/usr/bin/env python3
"""
Open Source Metrics Report Generator
Generates visual statistics reports for Cardano Foundation repositories
"""

import json
import os
from datetime import datetime

# Load data
with open('metrics_history.json', 'r') as f:
    data = json.load(f)

METRICS = [
    "GitHub Stars",
    "GitHub Forks",
    "GitHub Contributors",
    "GitHub Pull Requests (PRs) Merged",
    "Number of Releases",
    "Downloads"
]

def parse_value(val):
    """Parse metric value, handling 'Github downloads X' format"""
    if isinstance(val, int):
        return val
    if isinstance(val, str):
        if 'N/A' in val:
            return 0
        import re
        nums = re.findall(r'\d+', val)
        return int(nums[0]) if nums else 0
    return 0

def get_trend(first, last):
    """Determine trend direction and percentage"""
    if first == 0:
        if last > 0:
            return "up", 100, "🟢"
        return "same", 0, "⚪"

    change = ((last - first) / first) * 100
    if change > 5:
        return "up", change, "🟢"
    elif change < -5:
        return "down", change, "🔴"
    else:
        return "same", change, "🟡"

def generate_html_report():
    """Generate comprehensive HTML report with charts"""

    # Calculate stats for all projects
    project_stats = {}

    for project_name, project_data in sorted(data.items()):
        dates = project_data.get('dates', [])
        metrics_data = project_data.get('data', {})

        if len(dates) < 2:
            continue

        stats = {
            'dates': dates,
            'metrics': {},
            'has_improvement': False,
            'has_decline': False
        }

        for metric in METRICS:
            values = metrics_data.get(metric, [])
            parsed = [parse_value(v) for v in values]

            if len(parsed) >= 2:
                first_val = parsed[0]
                last_val = parsed[-1]
                trend, change, icon = get_trend(first_val, last_val)

                stats['metrics'][metric] = {
                    'values': parsed,
                    'first': first_val,
                    'last': last_val,
                    'change': change,
                    'trend': trend,
                    'icon': icon
                }

                if trend == 'up':
                    stats['has_improvement'] = True
                elif trend == 'down':
                    stats['has_decline'] = True

        project_stats[project_name] = stats

    # Calculate overall totals
    totals = {metric: {'first': 0, 'last': 0} for metric in METRICS}

    for project_name, stats in project_stats.items():
        for metric, mdata in stats['metrics'].items():
            totals[metric]['first'] += mdata['first']
            totals[metric]['last'] += mdata['last']

    # Generate HTML
    html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Open Source Metrics Report - Cardano Foundation</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
            color: #e0e0e0;
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 8px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .subtitle { color: #888; margin-bottom: 40px; font-size: 1.1rem; }
        .date { color: #666; font-size: 0.9rem; margin-bottom: 40px; }

        /* Overview Section */
        .overview {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 40px;
        }
        .overview h2 { font-size: 1.5rem; margin-bottom: 20px; color: #fff; }
        .overview-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 20px;
        }
        .overview-card {
            background: rgba(255,255,255,0.05);
            border-radius: 16px;
            padding: 20px;
            text-align: center;
        }
        .overview-card .label { color: #888; font-size: 0.85rem; margin-bottom: 8px; }
        .overview-card .value { font-size: 2rem; font-weight: 700; color: #fff; }
        .overview-card .change { font-size: 0.9rem; margin-top: 8px; }
        .change.up { color: #10b981; }
        .change.down { color: #ef4444; }
        .change.same { color: #888; }

        /* Charts */
        .chart-section {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 40px;
        }
        .chart-section h2 { font-size: 1.3rem; margin-bottom: 20px; color: #fff; }
        .chart-container { height: 400px; }

        /* Projects Grid */
        .projects-section h2 { font-size: 1.8rem; margin-bottom: 30px; color: #fff; }
        .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
        }
        .project-card {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 24px;
            transition: all 0.3s ease;
        }
        .project-card:hover {
            border-color: rgba(102, 126, 234, 0.5);
            transform: translateY(-2px);
        }
        .project-card h3 {
            font-size: 1.1rem;
            margin-bottom: 16px;
            color: #fff;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .project-card .badge {
            font-size: 0.7rem;
            padding: 4px 8px;
            border-radius: 12px;
            font-weight: 500;
        }
        .badge.improved { background: rgba(16, 185, 129, 0.2); color: #10b981; }
        .badge.declined { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .badge.stable { background: rgba(136, 136, 136, 0.2); color: #888; }

        .metrics-table {
            width: 100%;
            border-collapse: collapse;
        }
        .metrics-table td {
            padding: 10px 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            font-size: 0.9rem;
        }
        .metrics-table tr:last-child td { border-bottom: none; }
        .metrics-table .metric-name { color: #888; }
        .metrics-table .metric-value { text-align: right; font-weight: 600; color: #fff; }
        .metrics-table .metric-change { text-align: right; font-size: 0.85rem; width: 100px; }

        /* Summary Tables */
        .summary-section {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 40px;
        }
        .summary-section h2 { font-size: 1.5rem; margin-bottom: 20px; color: #fff; }
        .summary-table {
            width: 100%;
            border-collapse: collapse;
        }
        .summary-table th, .summary-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .summary-table th {
            color: #888;
            font-weight: 500;
            font-size: 0.85rem;
            text-transform: uppercase;
        }
        .summary-table td { font-size: 0.9rem; }
        .summary-table tr:hover { background: rgba(255,255,255,0.02); }

        .footer {
            text-align: center;
            color: #666;
            margin-top: 60px;
            padding-top: 30px;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Open Source Metrics Report</h1>
        <p class="subtitle">Cardano Foundation Project Analytics</p>
        <p class="date">Generated: """ + datetime.now().strftime("%B %d, %Y at %H:%M") + """</p>

        <!-- Overall Summary -->
        <div class="overview">
            <h2>📈 Overall Portfolio Summary</h2>
            <div class="overview-grid">
"""

    # Add overview cards
    for metric in METRICS:
        first = totals[metric]['first']
        last = totals[metric]['last']
        trend, change, icon = get_trend(first, last)

        change_class = trend
        change_text = f"{icon} {'+' if change > 0 else ''}{change:.1f}%"
        if trend == 'same':
            change_text = "⚪ No change"

        short_name = metric.replace("GitHub ", "").replace(" (PRs)", "")

        html += f"""
                <div class="overview-card">
                    <div class="label">{short_name}</div>
                    <div class="value">{last:,}</div>
                    <div class="change {change_class}">{change_text}</div>
                </div>
"""

    html += """
            </div>
        </div>

        <!-- Overall Trends Chart -->
        <div class="chart-section">
            <h2>📉 Portfolio Trends Over Time</h2>
            <div class="chart-container">
                <canvas id="overallChart"></canvas>
            </div>
        </div>

        <!-- Top Performers -->
        <div class="summary-section">
            <h2>🏆 Top Performers (Most Growth)</h2>
            <table class="summary-table">
                <thead>
                    <tr>
                        <th>Repository</th>
                        <th>Stars</th>
                        <th>Forks</th>
                        <th>Contributors</th>
                        <th>PRs Merged</th>
                    </tr>
                </thead>
                <tbody>
"""

    # Calculate growth scores and sort
    growth_scores = []
    for project_name, stats in project_stats.items():
        if 'GitHub Stars' in stats['metrics']:
            stars_change = stats['metrics'].get('GitHub Stars', {}).get('change', 0)
            forks_change = stats['metrics'].get('GitHub Forks', {}).get('change', 0)
            contrib_change = stats['metrics'].get('GitHub Contributors', {}).get('change', 0)
            prs_change = stats['metrics'].get('GitHub Pull Requests (PRs) Merged', {}).get('change', 0)
            avg_growth = (stars_change + forks_change + contrib_change + prs_change) / 4
            growth_scores.append((project_name, avg_growth, stats))

    growth_scores.sort(key=lambda x: x[1], reverse=True)

    for project_name, _, stats in growth_scores[:10]:
        stars = stats['metrics'].get('GitHub Stars', {})
        forks = stats['metrics'].get('GitHub Forks', {})
        contrib = stats['metrics'].get('GitHub Contributors', {})
        prs = stats['metrics'].get('GitHub Pull Requests (PRs) Merged', {})

        html += f"""
                    <tr>
                        <td><strong>{project_name}</strong></td>
                        <td>{stars.get('last', 0):,} <span class="change {stars.get('trend', 'same')}">{stars.get('icon', '⚪')}</span></td>
                        <td>{forks.get('last', 0):,} <span class="change {forks.get('trend', 'same')}">{forks.get('icon', '⚪')}</span></td>
                        <td>{contrib.get('last', 0):,} <span class="change {contrib.get('trend', 'same')}">{contrib.get('icon', '⚪')}</span></td>
                        <td>{prs.get('last', 0):,} <span class="change {prs.get('trend', 'same')}">{prs.get('icon', '⚪')}</span></td>
                    </tr>
"""

    html += """
                </tbody>
            </table>
        </div>

        <!-- Needs Attention -->
        <div class="summary-section">
            <h2>⚠️ Needs Attention (Declining Metrics)</h2>
            <table class="summary-table">
                <thead>
                    <tr>
                        <th>Repository</th>
                        <th>Metric</th>
                        <th>Previous</th>
                        <th>Current</th>
                        <th>Change</th>
                    </tr>
                </thead>
                <tbody>
"""

    declining = []
    for project_name, stats in project_stats.items():
        for metric, mdata in stats['metrics'].items():
            if mdata['trend'] == 'down' and mdata['change'] < -10:
                declining.append((project_name, metric, mdata))

    declining.sort(key=lambda x: x[2]['change'])

    for project_name, metric, mdata in declining[:10]:
        short_metric = metric.replace("GitHub ", "").replace(" (PRs)", "")
        html += f"""
                    <tr>
                        <td><strong>{project_name}</strong></td>
                        <td>{short_metric}</td>
                        <td>{mdata['first']:,}</td>
                        <td>{mdata['last']:,}</td>
                        <td class="change down">🔴 {mdata['change']:.1f}%</td>
                    </tr>
"""

    if not declining:
        html += """
                    <tr>
                        <td colspan="5" style="text-align: center; color: #10b981;">✅ No significant declines detected!</td>
                    </tr>
"""

    html += """
                </tbody>
            </table>
        </div>

        <!-- Individual Projects -->
        <div class="projects-section">
            <h2>📁 Individual Repository Reports</h2>
            <div class="projects-grid">
"""

    # Add individual project cards
    for project_name, stats in sorted(project_stats.items()):
        badge_class = "stable"
        badge_text = "Stable"
        if stats['has_improvement'] and not stats['has_decline']:
            badge_class = "improved"
            badge_text = "Growing"
        elif stats['has_decline'] and not stats['has_improvement']:
            badge_class = "declined"
            badge_text = "Declining"
        elif stats['has_improvement'] and stats['has_decline']:
            badge_class = "stable"
            badge_text = "Mixed"

        html += f"""
                <div class="project-card">
                    <h3>
                        {project_name}
                        <span class="badge {badge_class}">{badge_text}</span>
                    </h3>
                    <table class="metrics-table">
"""

        for metric in METRICS:
            if metric in stats['metrics']:
                mdata = stats['metrics'][metric]
                short_name = metric.replace("GitHub ", "").replace(" (PRs)", "")
                change_text = f"{mdata['icon']} {'+' if mdata['change'] > 0 else ''}{mdata['change']:.1f}%"
                if mdata['trend'] == 'same':
                    change_text = f"{mdata['icon']} —"

                html += f"""
                        <tr>
                            <td class="metric-name">{short_name}</td>
                            <td class="metric-value">{mdata['last']:,}</td>
                            <td class="metric-change change {mdata['trend']}">{change_text}</td>
                        </tr>
"""

        html += """
                    </table>
                </div>
"""

    # Prepare chart data
    all_dates = set()
    for stats in project_stats.values():
        all_dates.update(stats['dates'])

    sorted_dates = sorted(all_dates, key=lambda d: datetime.strptime(d, "%d/%m/%Y"))

    # Aggregate data by date
    chart_data = {metric: [] for metric in METRICS}
    for date in sorted_dates:
        totals_for_date = {metric: 0 for metric in METRICS}
        for stats in project_stats.values():
            if date in stats['dates']:
                idx = stats['dates'].index(date)
                for metric in METRICS:
                    if metric in stats['metrics']:
                        values = stats['metrics'][metric]['values']
                        if idx < len(values):
                            totals_for_date[metric] += values[idx]

        for metric in METRICS:
            chart_data[metric].append(totals_for_date[metric])

    html += """
            </div>
        </div>

        <div class="footer">
            <p>Generated by Open Source Metrics Dashboard • Cardano Foundation</p>
        </div>
    </div>

    <script>
        const ctx = document.getElementById('overallChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: """ + json.dumps([d.replace('/2025', '').replace('/2026', '') for d in sorted_dates]) + """,
                datasets: [
                    {
                        label: 'Stars',
                        data: """ + json.dumps(chart_data['GitHub Stars']) + """,
                        borderColor: '#F59E0B',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Forks',
                        data: """ + json.dumps(chart_data['GitHub Forks']) + """,
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Contributors',
                        data: """ + json.dumps(chart_data['GitHub Contributors']) + """,
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'PRs Merged',
                        data: """ + json.dumps(chart_data['GitHub Pull Requests (PRs) Merged']) + """,
                        borderColor: '#8B5CF6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#888' }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#888' }
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#888' }
                    }
                }
            }
        });
    </script>
</body>
</html>
"""

    return html

# Generate the report
html_content = generate_html_report()

# Save to file
with open('statistics_report.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("✅ Report generated: statistics_report.html")
print(f"   Total projects analyzed: {len(data)}")
