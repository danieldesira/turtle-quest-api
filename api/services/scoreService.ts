import { Prisma } from "@prisma/client";
import prisma from "../prismaInstance.js";
import {
  HighScoresResult,
  InsertScoreRow,
  SaveScorePayload,
} from "../types.js";
import { getR2Url } from "./r2.js";
import {
  fetchBestScoreByPlayerId,
  fetchTop10Scores,
  insertScore,
} from "../repositories/scoreRepository.js";
import redis from "../redisClient.js";

export const saveScore = async (
  playerId: number,
  payload: SaveScorePayload,
  transaction: Prisma.TransactionClient | null = null,
) => {
  const dbClient = transaction ? transaction : prisma;
  const row = await insertScore(dbClient, playerId, payload);

  const currentScoreListAwaitingReview = JSON.parse(
    (await redis.get("scores")) || "[]",
  ) as InsertScoreRow[];
  currentScoreListAwaitingReview.push(row);
  await redis.set("scores", JSON.stringify(currentScoreListAwaitingReview));
};

export const getHighScores = async () => {
  const res = await fetchTop10Scores(prisma);
  const profilePicUrlMap = await createProfilePicUrlMapFromHighScores(res);
  return res.map(({ players, points, level, outcomes, duration }) => ({
    playerIdentifier: `${players?.external_id}-${players?.sso_platform}`,
    playerName: players?.name,
    playerProfilePicUrl: profilePicUrlMap[players?.profile_pic_r2_key ?? ""],
    points,
    level,
    outcome: outcomes.desc,
    duration,
  }));
};

export const getPersonalBest = async (playerId: number) => {
  const res = await fetchBestScoreByPlayerId(prisma, playerId);
  if (res) {
    const { points, level, duration, outcomes } = res;
    return { points, level, duration, outcome: outcomes.desc };
  } else {
    return null;
  }
};

export const createProfilePicUrlMapFromHighScores = async (
  highScores: HighScoresResult,
) => {
  const profilePicUrlMap: Record<string, string> = {};
  for (const score of highScores) {
    if (
      score.players?.profile_pic_r2_key &&
      !profilePicUrlMap[score.players?.profile_pic_r2_key]
    ) {
      profilePicUrlMap[score.players?.profile_pic_r2_key] = await getR2Url(
        score.players?.profile_pic_r2_key,
      );
    }
  }
  return profilePicUrlMap;
};
