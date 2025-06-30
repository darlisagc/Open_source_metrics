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

https://darlisagc.github.io/Open_source_metrics/dashboard/ 

### Tracked GitHub Repositories:
## 📊 Projects Tracked Under this Framework

| Category                            | Project / Repository                      | GitHub Link                                                                                   | OSSInsight Metrics Link                                                                |
|--------------------------------------|-------------------------------------------|-----------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| Open Source Ecosystem                | Google Summer of Code 2025 Ideas          | [cf-gsoc-ideas-page-2025](https://github.com/cardano-foundation/cf-gsoc-ideas-page-2025)      | [Analyze Cardano Foundation](https://ossinsight.io/analyze/cardano-foundation/cf-gsoc-ideas-page-2025#overview)        |
| Open Source Ecosystem                | Ledger on the Blockchain                  | [cf-lob-platform](https://github.com/cardano-foundation/cf-lob-platform)                      | [Analyze Cardano Foundation](https://ossinsight.io/analyze/cardano-foundation/cf-lob-platform#overview)                |
| Open Source Ecosystem                | Cardano IBC Incubator                     | [cardano-ibc-incubator](https://github.com/cardano-foundation/cardano-ibc-incubator)          | [Analyze Cardano Foundation](https://ossinsight.io/analyze/cardano-foundation/cardano-ibc-incubator#overview)           |
| Open Source Ecosystem                | Cardano Rosetta Java                      | [cardano-rosetta-java](https://github.com/cardano-foundation/cardano-rosetta-java)            | [Analyze Cardano Foundation](https://ossinsight.io/analyze/cardano-foundation/cardano-rosetta-java#overview)            |
| Open Source Ecosystem                | Cardano DevKit                            | [cf-devkit](https://github.com/cardano-foundation/cf-devkit)                                  | [Analyze Cardano Foundation](https://ossinsight.io/analyze/cardano-foundation/cf-devkit#overview)                       |
| Open Source Ecosystem                | Cardano Ballot                            | [cf-cardano-ballot](https://github.com/cardano-foundation/cf-cardano-ballot)                  | [Analyze Cardano Foundation](https://ossinsight.io/analyze/cardano-foundation/cf-cardano-ballot#overview)               |
| Open Source Ecosystem                | CIP-30 Data Signature Parser              | [cip30-data-signature-parser](https://github.com/cardano-foundation/cip30-data-signature-parser) | [Analyze Cardano Foundation](https://ossinsight.io/analyze/cardano-foundation/cip30-data-signature-parser#overview)      |
| Open Source Ecosystem                | Connect with Wallet                       | [cardano-connect-with-wallet](https://github.com/cardano-foundation/cardano-connect-with-wallet) | [Analyze Cardano Foundation](https://ossinsight.io/analyze/cardano-foundation/cardano-connect-with-wallet#overview)      |
| Open Source Ecosystem                | ADA Handle Resolver                       | [cf-adahandle-resolver](https://github.com/cardano-foundation/cf-adahandle-resolver)          | [Analyze Cardano Foundation](https://ossinsight.io/analyze/cardano-foundation/cf-adahandle-resolver#overview)           |
| Open Source Ecosystem                | Java Rewards Calculation                  | [cf-java-rewards-calculation](https://github.com/cardano-foundation/cf-java-rewards-calculation) | [Analyze Cardano Foundation](https://ossinsight.io/analyze/cardano-foundation/cf-java-rewards-calculation#overview)      |
| Open Source Ecosystem                | Cardano Client Lib                        | [cardano-client-lib](https://github.com/bloxbean/cardano-client-lib)                          | [Analyze BloxBean](https://ossinsight.io/analyze/bloxbean/cardano-client-lib#overview)                                   |
| Open Source Ecosystem                | Yaci DevKit                               | [yaci-devkit](https://github.com/bloxbean/yaci-devkit)                                        | [Analyze BloxBean](https://ossinsight.io/analyze/bloxbean/yaci-devkit#overview)                                           |
| Open Source Ecosystem                | Yaci                                      | [yaci](https://github.com/bloxbean/yaci)                                                      | [Analyze BloxBean](https://ossinsight.io/analyze/bloxbean/yaci#overview)                                                  |
| Open Source Ecosystem                | Yaci Store                                | [yaci-store](https://github.com/bloxbean/yaci-store)                                          | [Analyze BloxBean](https://ossinsight.io/analyze/bloxbean/yaci-store#overview)                                            |
| Open Source Ecosystem                | Economic Parameter Insights               | [cardano-economic-parameter-insights](https://github.com/cardano-foundation/cardano-economic-parameter-insights) | [Analyze Cardano Foundation](https://ossinsight.io/analyze/cardano-foundation/cardano-economic-parameter-insights#overview) |
| Open Source Ecosystem                | Blueprint and Ecosystem Monitoring        | [cardano-blueprint-and-ecosystem-monitoring](https://github.com/cardano-foundation/cardano-blueprint-and-ecosystem-monitoring) | [Analyze Cardano Foundation](https://ossinsight.io/analyze/cardano-foundation/cardano-blueprint-and-ecosystem-monitoring#overview) |

| Decentralized Trust & Identity       | Veridian Wallet                           | [veridian-wallet](https://github.com/cardano-foundation/veridian-wallet)                      | [Analyze Cardano Foundation](https://ossinsight.io/analyze/cardano-foundation/veridian-wallet#overview)                  |

| High Assurance Labs                  | Cardano Deposit Wallet                    | [cardano-deposit-wallet](https://github.com/cardano-foundation/cardano-deposit-wallet)        | [Analyze Cardano Foundation](https://ossinsight.io/analyze/cardano-foundation/cardano-deposit-wallet#overview)           |
| High Assurance Labs                  | Cardano Wallet                            | [cardano-wallet](https://github.com/cardano-foundation/cardano-wallet)                        | [Analyze Cardano Foundation](https://ossinsight.io/analyze/cardano-foundation/cardano-wallet#overview)                   |
| High Assurance Labs                  | Cardano Wallet Agda                       | [cardano-wallet-agda](https://github.com/cardano-foundation/cardano-wallet-agda)              | [Analyze Cardano Foundation](https://ossinsight.io/analyze/cardano-foundation/cardano-wallet-agda#overview)              |

| —                                    | Originate                                 | [originate](https://github.com/cardano-foundation/originate)                                  | [Analyze Cardano Foundation](https://ossinsight.io/analyze/cardano-foundation/originate#overview)                        |

| Survey Corps Team                    | Aiken                                     | [aiken-lang/aiken](https://github.com/aiken-lang/aiken)                                      | [Analyze Aiken](https://ossinsight.io/analyze/aiken-lang/aiken#overview)                                                  |
| Survey Corps Team                    | Ogmios                                    | [cardanosolutions/ogmios](https://github.com/CardanoSolutions/ogmios)                        |                                                                                    |
| Survey Corps Team                    | Kupo                                      | [cardanosolutions/kupo](https://github.com/CardanoSolutions/kupo)                            |                                                                                    |
| Survey Corps Team                    | Ogmios MDK                                | [CardanoSolutions/ogmios-mdk](https://github.com/CardanoSolutions/ogmios-mdk)                |                                                                                    |
| Survey Corps Team                    | Merkle Patricia Forestry                  | [aiken-lang/merkle-patricia-forestry](https://github.com/aiken-lang/merkle-patricia-forestry)|                                                                                    |
| Survey Corps Team                    | Aiken Stdlib                              | [aiken-lang/stdlib](https://github.com/aiken-lang/stdlib)                                    | [Analyze Stdlib](https://ossinsight.io/analyze/aiken-lang/stdlib#overview)                                               |
| Survey Corps Team                    | Aiken Fuzz                                | [aiken-lang/fuzz](https://github.com/aiken-lang/fuzz)                                        | [Analyze Fuzz](https://ossinsight.io/analyze/aiken-lang/fuzz#overview)                                                   |
| Survey Corps Team                    | Amaru                                     | [pragma-org/amaru](https://github.com/pragma-org/amaru)                                      | [Analyze Amaru](https://ossinsight.io/analyze/pragma-org/amaru#overview)                                                 |
| Survey Corps Team                    | Elm Cardano                               | [elm-cardano/elm-cardano](https://github.com/elm-cardano/elm-cardano)                        | [Analyze Elm Cardano](https://ossinsight.io/analyze/elm-cardano/elm-cardano#overview)                                    |
| Survey Corps Team                    | Elm Bech32                                | [elm-cardano/bech32](https://github.com/elm-cardano/bech32)                                  | [Analyze Elm Bech32](https://ossinsight.io/analyze/elm-cardano/bech32#overview)                                          |
| Survey Corps Team                    | Elm CBOR                                  | [elm-toulouse/cbor](https://github.com/elm-toulouse/cbor)                                    | [Analyze Elm CBOR](https://ossinsight.io/analyze/elm-toulouse/cbor#overview)                                             |


