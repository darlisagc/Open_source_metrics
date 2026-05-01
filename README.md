# 🚀 Open Source Metrics Dashboard

Monitor and visualize GitHub activity metrics for key open source projects.  
This repository automates data collection, generates weekly reports, and publishes:

- 📊 **A static summary page** (HTML & Markdown): https://darlisagc.github.io/Open_source_metrics/
- 📈 **An interactive dashboard** to explore trends over time: https://darlisagc.github.io/Open_source_metrics/dashboard/

> Track metrics like stars, forks, contributors, merged PRs, releases, and downloads—  
> all in one place, with automated updates.

---

## Metrics collected 

| ID | Metrics                                | Metric Description                                                      | Metric Category                  | Information Availability                   | Collection Method           | Frequency of Data Collection | Location                                 |
|----|----------------------------------------|-------------------------------------------------------------------------|----------------------------------|--------------------------------------------|-----------------------------|------------------------------|------------------------------------------|
| 1  | GitHub Stars                           | Measures interest/popularity.                                           | Community Engagement Metrics     | GitHub project main page                   | Manually / GitHub API        | Weekly                       | Confluence page / GitHub repository      |
| 2  | GitHub Forks                           | Indicates developers building on or modifying the project.              | Community Engagement Metrics     | GitHub project main page                   | Manually / GitHub API        | Weekly                       | Confluence page / GitHub repository      |
| 3  | GitHub Unique Contributors             | Community engagement and long-term sustainability.                      | Community Engagement Metrics     | GitHub project main page                   | Manually / GitHub API        | Weekly                       | Confluence page / GitHub repository      |
| 4  | GitHub Pull Requests (PRs) Merged      | Tracks active & collaborative contributions and code changes.           | Community Engagement Metrics     | GitHub project > Insights > Pulse (select 1 month: Merged PRs) | Manually / GitHub API       | Weekly                       | Confluence page / GitHub repository      |
| 5  | Number of Releases                     | Responsiveness to bugs/features and user needs.                         | Code and Development Activity    | GitHub project main page > Releases        | Manually / GitHub API       | Weekly                       | Confluence page                         |
| 6  | Downloads (NPM, Cargo, Apple Store, Google Play, DockerHub, Homebrew, etc.) | Usage in production / Usage trends / Real adoption.         | Adoption & Usage Metrics         | Various platforms | Manually                    | Weekly                       | Confluence page / GitHub repository      |


## Projects Tracked

The list of tracked repositories is **discovered automatically** every run. The script lists every repository (including forks and archived) for these orgs:

- [`cardano-foundation`](https://github.com/orgs/cardano-foundation/repositories?type=all)
- [`bloxbean`](https://github.com/bloxbean)

…and unions that with a small static list of additional repos defined in [`github_metrics.py`](./github_metrics.py) (`EXTRA_REPOS`):

- [`aiken-lang/aiken`](https://github.com/aiken-lang/aiken), [`merkle-patricia-forestry`](https://github.com/aiken-lang/merkle-patricia-forestry), [`stdlib`](https://github.com/aiken-lang/stdlib), [`fuzz`](https://github.com/aiken-lang/fuzz)
- [`CardanoSolutions/ogmios`](https://github.com/CardanoSolutions/ogmios), [`kupo`](https://github.com/CardanoSolutions/kupo), [`ogmios-mdk`](https://github.com/CardanoSolutions/ogmios-mdk)
- [`pragma-org/amaru`](https://github.com/pragma-org/amaru)
- [`elm-cardano/elm-cardano`](https://github.com/elm-cardano/elm-cardano), [`bech32`](https://github.com/elm-cardano/bech32)
- [`elm-toulouse/cbor`](https://github.com/elm-toulouse/cbor)

Each repo's primary language is captured at collection time so the dashboard can filter projects by language.
