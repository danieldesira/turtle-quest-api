import prisma from "../prismaInstance.js";
import { SaveScorePayload, ScoresQueryOptions } from "../types.js";
import { getR2Url } from "./r2.js";
import {
  countScores,
  fetchBestScoreByPlayerId,
  fetchScores,
  fetchTop10Scores,
} from "../repositories/scoreRepository.js";
import redis from "../redisClient.js";

export const saveScore = async (
  playerId: number,
  { interactions, level, duration }: SaveScorePayload,
) =>
  await redis.rPush(
    "scoreQueue",
    JSON.stringify({
      playerId,
      interactions,
      level,
      duration,
      timestamp: new Date().toISOString(),
    }),
  );

export const getHighScores = async () => {
  const res = await fetchTop10Scores(prisma);
  const r2Keys = res
    .map((s) => s.players?.profile_pic_r2_key)
    .filter((key) => typeof key === "string");
  const profilePicUrlMap = await createProfilePicUrlMap(r2Keys);
  return res.map(({ players, points, level, outcome, duration }) => ({
    playerIdentifier: `${players?.external_id}-${players?.sso_provider}`,
    playerName: players?.name,
    playerProfilePicUrl: profilePicUrlMap[players?.profile_pic_r2_key ?? ""],
    points,
    level,
    outcome,
    duration,
  }));
};

export const getPersonalBest = async (playerId: number) => {
  const res = await fetchBestScoreByPlayerId(prisma, playerId);
  if (res) {
    const { points, level, duration, outcome } = res;
    return { points, level, duration, outcome };
  } else {
    return null;
  }
};

const createProfilePicUrlMap = async (r2Keys: string[]) => {
  const profilePicUrlMap: Record<string, string> = {};
  for (const key of r2Keys) {
    if (!profilePicUrlMap[key]) {
      profilePicUrlMap[key] = await getR2Url(key);
    }
  }
  return profilePicUrlMap;
};

export const getScores = async (options: ScoresQueryOptions) => {
  const res = await fetchScores(prisma, options);
  const r2Keys = res
    .map((s) => s.players?.profile_pic_r2_key)
    .filter((key) => typeof key === "string");
  const profilePicUrlMap = await createProfilePicUrlMap(r2Keys);
  const count = await countScores(prisma, options.outcome);

  return {
    scores: res.map(({ players, points, level, outcome, duration }) => ({
      playerName: players?.name,
      playerProfilePicUrl: profilePicUrlMap[players?.profile_pic_r2_key ?? ""],
      playerAge: players?.date_of_birth
        ? getPlayerAge(players?.date_of_birth)
        : undefined,
      level,
      outcome,
      duration,
      points,
    })),
    totalPages: Math.ceil(count / options.items),
    currentPage: options.page,
  };
};

const getPlayerAge = (dateOfBirth: Date) => {
  const currentDate = new Date();
  const birthYear = dateOfBirth.getFullYear();
  const birthMonth = dateOfBirth.getMonth();
  return (
    currentDate.getFullYear() -
    birthYear -
    (currentDate.getMonth() - birthMonth < 0 ? 1 : 0)
  );
};
