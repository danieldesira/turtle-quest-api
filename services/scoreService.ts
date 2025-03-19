import { getPrismaInstance } from "../prismaInstance";

export interface SaveScorePayload {
  points: number;
  level: number;
  hasWon: boolean;
}

export const saveScore = async (
  playerId: number,
  payload: SaveScorePayload
) => {
  const prisma = getPrismaInstance();
  await prisma.score.create({
    data: {
      player_id: playerId,
      player_won: payload.hasWon ? "1" : "0",
      points: payload.points,
      level: payload.level,
      created_at: new Date(),
    },
  });
};

export const getHighScores = async () => {
  const prisma = getPrismaInstance();
  return await prisma.score.findMany({
    take: 10,
    orderBy: {
      points: "desc",
    },
    select: {
      points: true,
      level: true,
      player_won: true,
      created_at: true,
      player: {
        select: {
          name: true,
        },
      },
    },
  });
};
