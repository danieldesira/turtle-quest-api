import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionString,
    },
  },
  log: ["query", "info", "warn", "error"],
});

export default prisma;
