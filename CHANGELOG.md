# Changelog

## 0.1.5 - 03/11/2025 15:10 UTC+1

- Update Vercel CLI to 48.8.0
- Refactor payload types for improved maintainability and type-safety
- Add http file for endpoint testing from within the IDE
- Fixed incorrect behaviour: last game not saving if last timestamp is null

## 0.1.4 - 25/08/2025 13:20 UTC+1

- Update Vercel CLI to 46.0.0
- Move profile pictures to Cloudflare R2 Object Storage
- Rename `/points` endpoint to `/high-scores` and include profile picture URL
- Cleanup `/high-scores` response
- Delete old profile picture on upload if necessary

## 0.1.3 - 12/08/2025 13:10

- Move all source files to the `/api` folder
- Refactor imports to include the `.js` extension
- Update the Vercel package to 44.7.3
- Cleanup Neon-related packages and code
- Log SQL queries

## 0.1.2 - 11/08/2025 19:15

- Move to Vercel Serverless rather than Edge

## 0.1.1 - 11/08/2025 19:00

- Add postinstall step in attempt to fix Prisma issue on Vercel

## 0.1.0 - 11/08/2025 18:20

- Remove `/api/about` endpoint
- Set up Google authentication
- Create endpoints for account management, points and game progress

## 0.0.0 - 25/08/2024

- Initial release with just an `/api/about` endpoint
- Initial Hono/Vercel setup
