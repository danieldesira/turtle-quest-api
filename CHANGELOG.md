# Changelog

## 0.5.0b -

- Internal changes:
  - Update Prisma to 7.6.0
  - Update Vercel CLI to 50.40.0
  - Update Jose to 6.2.2
  - Update Hono to 4.12.11
  - Update aws-sdk to 3.1019.0
  - Update Vitest to 4.1.2
- Authentication:
  - Support for Facebook SSO
  - Fix: Assign profile pic url on Google/FB signup

## 0.4.8b - 15/03/2026 15:45 UTC+1

- 3rd Party Package Updates:
  - Hono 4.12.8
  - Jose 6.2.1
  - Prisma 7.5.0
  - AWS SDK 3.1009.0
  - Vercel CLI 50.32.5
  - Vitest 4.1.0
- `GET /api/scores`:
  - `juniors` being assigned to any value now means true
  - Remove `profilePicR2Key` from response
- Drop CORS support from community site (new one will serve scores through a "by-pass" API)

## 0.4.7.1b - 04/03/2026 17:15 UTC+1

- Uninstall jsonwebtoken
- Set vitest as a development dependency

## 0.4.7b - 03/03/2026 17:00 UTC+1

- Refactor: Use Jose for Microsoft Entra authentication verification and uninstall jwks-rsa

## 0.4.6.2b - 03/03/2026 15:10 UTC+1

- Downgrade JWKS-RSA to 3.2.2
- Add Microsoft login to `api.http`
- Update `PUT /player` endpoint in `api.http`

## 0.4.6.1b - 03/03/2026 14:00 UTC+1

- Fix issue with JWKS-RSA 4 import and invocation
- Update Vercel CLI to 50.25.6

## 0.4.6b - 03/03/2026 10:30 UTC+1

- `PUT /game` and `POST /points`:
  - Require `remainingResets` which may be a number between 0 to 3
  - Update integration tests
- Add `resets_used` to `scores` table and output in get endpoints
- Package updates:
  - Prisma 7.4.2
  - Vercel CLI 50.25.4
  - Hono 4.12.3
  - jwks-rsa 4.0.1
  - AWS SDK 3.1000.0

## 0.4.5.1b - 26/02/2026 10:45 UTC+1

- Update CORS URL to https://turtle-site-five.vercel.app

## 0.4.5b - 25/02/2026 20:10 UTC+1

- Package updates:
  - Vercel CLI 50.23.2
  - AWS SDK S3 Client 3.997.0
  - Hono 4.12.2
  - Prisma 7.4.1
- `GET /scores`: Fix outcome order to show wins before losses

## 0.4.4b - 25/02/2026 13:15 UTC+1

- `GET /scores`: Fix page count when using junior-only filter
- Fix CORS issue for https://turtle-react-app.vercel.app

## 0.4.3b - 24/02/2026 22:00 UTC+1

- `GET /scores` improvements:
  - Add pagination details to response
  - Add `playerAge` to individual scores
  - Add junior-only filter
  - Internal: Move query to Postgres function
- Add CORS-support for the new site: `https://turtle-react-app.vercel.app/`

## 0.4.2b - 22/02/2026 21:00 UTC+1

- Fix outdated `sso_platform` references
- `POST /points`:
  - Drop `points` in payload
  - Require `interactions` string in payload expected to match the following regex: `/[a-zA-Z]+,[0-9]+(|[a-zA-Z]+,[0-9]+)*/`
  - Save payload directly to Redis (no saving to Postgres from REST API)
- New `GET /scores` endpoint accepting query string with `page`, `items` and `outcome` params
- Internal:
  - Refactor profile pic mapping in `GET /high-scores` and `GET /scores`
  - `scores` table: `outcome_id` converted to `outcome` enum
  - Test player ID updated to 1

## 0.4.1b - 18/02/2026 0:50 UTC+1

- Update packages:
  - AWS-SDK to 3.992.0
  - Redis to 5.11.0
  - Vitest to 4.0.18
  - Vercel to 50.18.1
  - Prettier to 3.8.1
- `POST /login`: Rename `service` to `provider` in payload

## 0.4.0b - 17/02/2026 21:30 UTC+1

- Update to Prisma 7.4.0 and AWS SDK 3.990.0
- Cleanup and speedup Google authentication
- Introduce support for Microsoft Entra ID
- Delete redundant `.config.js` files
- DB schema: rename `sso_platform` to `sso_provider`

## 0.3.4b - 12/02/2026 01:00 UTC+1

- Update Vercel CLI to 50.15.1 and AWS-SDK
- Update DB schema: `duration` and `player_id` converted to `NOT NULL`
- `POST /points`: Update `duration` to required and positive number
- Refactor Redis scores data structure to a queue

## 0.3.3b - 10/02/2026 19:10 UTC+1

- Save inserted scores into Redis store for cheat detection
- Update Hono to 4.11.9, Zod to 4.3.6 and Zod-Hono middleware to 0.7.6
- Add script to delete scores for test player
- Remove `hasWon` payload property support in `POST /points` (Deduced from `level`)

## 0.3.2b - 08/02/2026 19:35 UTC+1

- Remove redundant `lastGame` property from `/login` response
- Create new players with `audioVolume` value defined as `0.5`
- Update `hono-camelcase` to 0.2.5 properly fixing error in `/logout`
- Add test for `/logout`

## 0.3.1b - 06/02/2026 15:40 UTC+1

- Update `hono-camelcase` to 0.2.3 fixing error in `/logout`
- Update Vercel CLI to 50.12.3

## 0.3.0b - 05/02/2026 19:00 UTC+1

- Create initial DB migration
- Add more documentation including GPL license and code of conduct
- Update AWS SDK and various other packages
- Uninstall `@vercel/postgres`
- `camelCase` middleware: Fix: `null` was being converted to `{}` and transform into NPM package
- Add `duration` to scores
- Restructure `personalBest` property to expose `outcome` directly in the `POST /login` response
- Update integration tests
- `PUT /player`: Change `dateOfBirth` to optional and add `audioVolume`

## 0.2.1b - 02/02/2026 13:30 UTC+1

- Update Vercel CLI to 50.9.6
- Update Prisma to 7.3.0
- Fix issues with new camelCase middleware:
  - Bug when no camel cases found
  - Array keys where being converted to strings
- Update payload for `PUT /player` to expect `dateOfBirth` in camelCase

## 0.2.0b - 01/02/2026 23:30 UTC+1

- Update Vercel CLI to 50.5.0
- Upgrade Prisma ORM to 7.x
- Install and setup `eslint`
- Install and setup `prettier`
- Setup local-only integration tests
- Fix: Level should be positive
- `PUT /game`: Return `400` if timestamp is older than the last game saved
- Expose `playerIdentifier` in `/high-scores` composed of `external_id` and `sso_platform`
- Refactor `scoreService.ts`
- In `players` table, rename `platform` field to `sso_platform`
- Middleware to enforce camel case for responses

## 0.1.6a - 08/11/2025 18:35 UTC+1

- Save last game as object allowing Postgres to apply formatting on it's own
- Update Vercel CLI to 48.9.0
- Create repository layer for improved maintanability

## 0.1.5a - 03/11/2025 15:10 UTC+1

- Update Vercel CLI to 48.8.0
- Refactor payload types for improved maintainability and type-safety
- Add http file for endpoint testing from within the IDE
- Fixed incorrect behaviour: last game not saving if last timestamp is null

## 0.1.4a - 25/08/2025 13:20 UTC+1

- Update Vercel CLI to 46.0.0
- Move profile pictures to Cloudflare R2 Object Storage
- Rename `/points` endpoint to `/high-scores` and include profile picture URL
- Cleanup `/high-scores` response
- Delete old profile picture on upload if necessary

## 0.1.3a - 12/08/2025 13:10

- Move all source files to the `/api` folder
- Refactor imports to include the `.js` extension
- Update the Vercel package to 44.7.3
- Cleanup Neon-related packages and code
- Log SQL queries

## 0.1.2a - 11/08/2025 19:15

- Move to Vercel Serverless rather than Edge

## 0.1.1a - 11/08/2025 19:00

- Add postinstall step in attempt to fix Prisma issue on Vercel

## 0.1.0a - 11/08/2025 18:20

- Remove `/api/about` endpoint
- Set up Google authentication
- Create endpoints for account management, points and game progress

## 0.0.0a - 25/08/2024

- Initial release with just an `/api/about` endpoint
- Initial Hono/Vercel setup
