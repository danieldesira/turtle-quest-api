import { config } from "dotenv";

config({ path: ".env.test" });

const { default: prisma } = await import("./prismaInstance.js");

const playerId = 1;

const testPlayer = await prisma.players.findUnique({ where: { id: playerId } });
if (!testPlayer) {
  await prisma.players.create({
    data: {
      id: playerId,
      email: "test@example.com",
      name: "Test Player",
      created_at: new Date(),
    },
  });
}

console.log(`Test user created with ID ${playerId}`);
