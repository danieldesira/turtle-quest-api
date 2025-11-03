import { Prisma } from "@prisma/client";
import prisma from "../prismaInstance.js";
import { HighScoresResult, SaveScorePayload } from "../types.js";
import { getR2Url } from "./r2.js";

export const saveScore = async (
  playerId: number,
  payload: SaveScorePayload,
  transaction: Prisma.TransactionClient | null = null
) => {
  const dbClient = transaction ? transaction : prisma;
  await dbClient.scores.create({
    data: {
      player_id: playerId,
      outcome_id: payload.hasWon ? 2 : 1,
      points: payload.points,
      level: payload.level,
      created_at: new Date(),
    },
  });
};

export const getHighScores = async () =>
  await prisma.scores.findMany({
    take: 10,
    orderBy: {
      points: "desc",
    },
    select: {
      points: true,
      level: true,
      created_at: true,
      players: {
        select: {
          name: true,
          profile_pic_r2_key: true,
        },
      },
      outcomes: {
        select: {
          desc: true,
        },
      },
    },
  });

export const getPersonalBest = async (playerId: number) =>
  await prisma.scores.findFirst({
    where: { player_id: playerId },
    orderBy: [{ points: "desc" }, { level: "desc" }, { outcome_id: "desc" }],
    select: {
      points: true,
      level: true,
      outcomes: {
        select: {
          desc: true,
        },
      },
    },
  });

export const createProfilePicUrlMapFromHighScores = async (
  highScores: HighScoresResult
) => {
  const profilePicUrlMap: Record<string, string> = {};
  for (const score of highScores) {
    if (!profilePicUrlMap[score.players?.profile_pic_r2_key!]) {
      profilePicUrlMap[score.players?.profile_pic_r2_key!] = await getR2Url(
        score.players?.profile_pic_r2_key!
      );
    }
  }
  return profilePicUrlMap;
};
