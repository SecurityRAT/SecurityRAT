## Changes

- Switched from **Java8** to **Java11**.
- Restructured the project:
  - Separated frontend from backend.
  - Now using maven multi-module project.
- Updated backend dependencies.
- Application is now released as JAR instead of WAR.

## Bug Fixes

- Resolved an issue where creating Jira ticket (in batch mode) without labels did not work.
- Fixed issues when using SecurityRAT with a Jira instance running on a URL path.
