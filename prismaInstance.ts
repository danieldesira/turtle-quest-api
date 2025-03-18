import { neonConfig, Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

const createPrismaInstance = () => {
  neonConfig.webSocketConstructor = WebSocket;
  const connectionString = process.env.DATABASE_URL;

  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  prisma = new PrismaClient({ adapter });
};

export const getPrismaInstance = () => {
  if (!prisma) {
    createPrismaInstance();
  }
  return prisma;
};
