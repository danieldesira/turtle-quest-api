import { Prisma } from "@prisma/client";
import prisma from "../prismaInstance.js";
import { HighScoresResult, SaveScorePayload } from "../types.js";
import { getR2Url } from "./r2.js";
import {
  fetchBestScoreByPlayerId,
  fetchTop10Scores,
  insertScore,
} from "../repositories/scoreRepository.js";

export const saveScore = async (
  playerId: number,
  payload: SaveScorePayload,
  transaction: Prisma.TransactionClient | null = null,
) => {
  const dbClient = transaction ? transaction : prisma;
  await insertScore(dbClient, playerId, payload);
};

export const getHighScores = async () => {
  const res = await fetchTop10Scores(prisma);
  const profilePicUrlMap = await createProfilePicUrlMapFromHighScores(res);
  return res.map(({ players, points, level, outcomes }) => ({
    playerIdentifier: `${players?.external_id}-${players?.sso_platform}`,
    playerName: players?.name,
    playerProfilePicUrl: profilePicUrlMap[players?.profile_pic_r2_key ?? ""],
    points,
    level,
    outcome: outcomes.desc,
  }));
};

export const getPersonalBest = async (playerId: number) =>
  await fetchBestScoreByPlayerId(prisma, playerId);

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
