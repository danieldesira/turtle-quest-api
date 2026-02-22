import { DbClient, ScoresQueryOptions } from "../types";

export const fetchTop10Scores = async (dbClient: DbClient) =>
  await dbClient.scores.findMany({
    take: 10,
    orderBy: {
      points: "desc",
    },
    select: {
      points: true,
      level: true,
      duration: true,
      created_at: true,
      players: {
        select: {
          name: true,
          profile_pic_r2_key: true,
          external_id: true,
          sso_provider: true,
        },
      },
      outcome: true,
    },
  });

export const fetchBestScoreByPlayerId = async (
  dbClient: DbClient,
  playerId: number,
) =>
  await dbClient.scores.findFirst({
    where: { player_id: playerId },
    orderBy: [
      { points: "desc" },
      { level: "desc" },
      { outcome: "desc" },
      { duration: "desc" },
    ],
    select: {
      points: true,
      level: true,
      duration: true,
      outcome: true,
    },
  });

export const fetchScores = async (
  dbClient: DbClient,
  { page, items, outcome }: ScoresQueryOptions,
) =>
  await dbClient.scores.findMany({
    take: items,
    skip: (page - 1) * items,
    orderBy: {
      points: "desc",
    },
    select: {
      points: true,
      level: true,
      duration: true,
      created_at: true,
      players: {
        select: {
          name: true,
          profile_pic_r2_key: true,
        },
      },
      outcome: true,
    },
    where: {
      outcome,
    },
  });
