# 🚀 Open Source Metrics Dashboard

Monitor and visualize GitHub activity metrics for key open source projects.  
This repository automates data collection, generates monthly reports, and publishes:

- 📊 **A static summary page** (HTML & Markdown): https://darlisagc.github.io/Open_source_metrics/
- 📈 **An interactive dashboard** to explore trends over time: https://darlisagc.github.io/Open_source_metrics/dashboard/

> Track metrics like stars, forks, contributors, merged PRs, releases, and downloads—  
> all in one place, with automated updates.

---

## Metrics collected 

| ID | Metrics                                | Metric Description                                                      | Metric Category                  | Information Availability                   | Collection Method           | Frequency of Data Collection | Location                                 |
|----|----------------------------------------|-------------------------------------------------------------------------|----------------------------------|--------------------------------------------|-----------------------------|------------------------------|------------------------------------------|
| 1  | GitHub Stars                           | Measures interest/popularity.                                           | Community Engagement Metrics     | GitHub project main page                   | Manually / GitHub API        | Monthly                      | Confluence page / GitHub repository      |
| 2  | GitHub Forks                           | Indicates developers building on or modifying the project.              | Community Engagement Metrics     | GitHub project main page                   | Manually / GitHub API        | Monthly                      | Confluence page / GitHub repository      |
| 3  | GitHub Unique Contributors             | Community engagement and long-term sustainability.                      | Community Engagement Metrics     | GitHub project main page                   | Manually / GitHub API        | Monthly                      | Confluence page / GitHub repository      |
| 4  | GitHub Pull Requests (PRs) Merged      | Tracks active & collaborative contributions and code changes.           | Community Engagement Metrics     | GitHub project > Insights > Pulse (select 1 month: Merged PRs) | Manually / GitHub API?       | Monthly                      | Confluence page / GitHub repository      |
| 5  | Number of Releases                     | Responsiveness to bugs/features and user needs.                         | Code and Development Activity    | GitHub project main page > Releases        | Manually / GitHub API?       | Monthly                      | Confluence page                         |
| 6  | Downloads (NPM, Cargo, Apple Store, Google Play, DockerHub, Homebrew, etc.) | Usage in production / Usage trends / Real adoption.         | Adoption & Usage Metrics         | Various platforms (e.g., DockerHub, NPM, Cargo, etc.) | Manually                    | Monthly                      | Confluence page / GitHub repository      |


## Projects Tracked


| Project / Repository                    | GitHub Link                                                                                   |
|-----------------------------------------|----------------------------------------------------------------------------------------------|
| cf-gsoc-ideas-page-2025                 | [https://github.com/cardano-foundation/cf-gsoc-ideas-page-2025](https://github.com/cardano-foundation/cf-gsoc-ideas-page-2025)           |
| cf-lob-platform                         | [https://github.com/cardano-foundation/cf-lob-platform](https://github.com/cardano-foundation/cf-lob-platform)                           |
| cardano-ibc-incubator                   | [https://github.com/cardano-foundation/cardano-ibc-incubator](https://github.com/cardano-foundation/cardano-ibc-incubator)               |
| cardano-rosetta-java                    | [https://github.com/cardano-foundation/cardano-rosetta-java](https://github.com/cardano-foundation/cardano-rosetta-java)                 |
| cf-devkit                               | [https://github.com/cardano-foundation/cf-devkit](https://github.com/cardano-foundation/cf-devkit)                                       |
| cf-cardano-ballot                       | [https://github.com/cardano-foundation/cf-cardano-ballot](https://github.com/cardano-foundation/cf-cardano-ballot)                       |
| cip30-data-signature-parser             | [https://github.com/cardano-foundation/cip30-data-signature-parser](https://github.com/cardano-foundation/cip30-data-signature-parser)   |
| cardano-connect-with-wallet             | [https://github.com/cardano-foundation/cardano-connect-with-wallet](https://github.com/cardano-foundation/cardano-connect-with-wallet)   |
| cf-adahandle-resolver                   | [https://github.com/cardano-foundation/cf-adahandle-resolver](https://github.com/cardano-foundation/cf-adahandle-resolver)               |
| cf-java-rewards-calculation             | [https://github.com/cardano-foundation/cf-java-rewards-calculation](https://github.com/cardano-foundation/cf-java-rewards-calculation)   |
| cardano-client-lib                      | [https://github.com/bloxbean/cardano-client-lib](https://github.com/bloxbean/cardano-client-lib)                                         |
| yaci-devkit                             | [https://github.com/bloxbean/yaci-devkit](https://github.com/bloxbean/yaci-devkit)                                                     |
| yaci                                    | [https://github.com/bloxbean/yaci](https://github.com/bloxbean/yaci)                                                                   |
| yaci-store                              | [https://github.com/bloxbean/yaci-store](https://github.com/bloxbean/yaci-store)                                                       |
| cardano-economic-parameter-insights      | [https://github.com/cardano-foundation/cardano-economic-parameter-insights](https://github.com/cardano-foundation/cardano-economic-parameter-insights)  |
| cardano-blueprint-and-ecosystem-monitoring | [https://github.com/cardano-foundation/cardano-blueprint-and-ecosystem-monitoring](https://github.com/cardano-foundation/cardano-blueprint-and-ecosystem-monitoring) |
| veridian-wallet                         | [https://github.com/cardano-foundation/veridian-wallet](https://github.com/cardano-foundation/veridian-wallet)                           |
| cardano-deposit-wallet                  | [https://github.com/cardano-foundation/cardano-deposit-wallet](https://github.com/cardano-foundation/cardano-deposit-wallet)             |
| cardano-wallet                          | [https://github.com/cardano-foundation/cardano-wallet](https://github.com/cardano-foundation/cardano-wallet)                             |
| cardano-wallet-agda                     | [https://github.com/cardano-foundation/cardano-wallet-agda](https://github.com/cardano-foundation/cardano-wallet-agda)                   |
| originate                               | [https://github.com/cardano-foundation/originate](https://github.com/cardano-foundation/originate)                                      |
| aiken-lang/aiken                        | [https://github.com/aiken-lang/aiken](https://github.com/aiken-lang/aiken)                                                             |
| cardanosolutions/ogmios                 | [https://github.com/CardanoSolutions/ogmios](https://github.com/CardanoSolutions/ogmios)                                               |
| cardanosolutions/kupo                   | [https://github.com/CardanoSolutions/kupo](https://github.com/CardanoSolutions/kupo)                                                   |
| CardanoSolutions/ogmios-mdk             | [https://github.com/CardanoSolutions/ogmios-mdk](https://github.com/CardanoSolutions/ogmios-mdk)                                       |
| aiken-lang/merkle-patricia-forestry     | [https://github.com/aiken-lang/merkle-patricia-forestry](https://github.com/aiken-lang/merkle-patricia-forestry)                       |
| aiken-lang/stdlib                       | [https://github.com/aiken-lang/stdlib](https://github.com/aiken-lang/stdlib)                                                           |
| aiken-lang/fuzz                         | [https://github.com/aiken-lang/fuzz](https://github.com/aiken-lang/fuzz)                                                               |
| pragma-org/amaru                        | [https://github.com/pragma-org/amaru](https://github.com/pragma-org/amaru)                                                             |
| elm-cardano/elm-cardano                 | [https://github.com/elm-cardano/elm-cardano](https://github.com/elm-cardano/elm-cardano)                                               |
| elm-cardano/bech32                      | [https://github.com/elm-cardano/bech32](https://github.com/elm-cardano/bech32)                                                         |
| elm-toulouse/cbor                       | [https://github.com/elm-toulouse/cbor](https://github.com/elm-toulouse/cbor)                                                           |


