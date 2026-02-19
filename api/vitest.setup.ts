import { config } from "dotenv";

config({ path: ".env.test" });

const { default: prisma } = await import("./prismaInstance.js");

const playerId = 100000;

const testPlayer = await prisma.players.findUnique({ where: { id: playerId } });
if (!testPlayer) {
  await prisma.players.create({
    data: {
      id: playerId,
      external_id: "test-user-abc",
      sso_provider: "google",
      email: "test@example.com",
      name: "Test Player",
      created_at: new Date(),
    },
  });
}

console.log(`Test user created with ID ${playerId}`);
