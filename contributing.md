# Contributing Code

The project is built in Typescript using the Hono framework, Zod for payload validation and Prisma ORM
for Postgres. It follows an N-Tier architecture with repository and service layers. The code is pretty
self-explanatory but in case you need further clarifications, you may open a Github issue or contact
me via email. Below, you will find some useful commands for common chores:

- `npx prisma migrate dev`: Create and run database migrations. The schema is found under `prisma/schema.prisma`.
- `npm start`: Run project in local environment.
- `npm run test`: Run integration tests.
- `npm run lint`: Check for recommended coding standards.
- `npm run format`: Format the code using `Prettier`.
