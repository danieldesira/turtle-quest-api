import { DbClient, SaveScorePayload } from "../types";

export const insertScore = async (
  dbClient: DbClient,
  playerId: number,
  { hasWon, level, points }: SaveScorePayload,
) =>
  await dbClient.scores.create({
    data: {
      player_id: playerId,
      outcome_id: hasWon ? 2 : 1,
      points: points,
      level: level,
      created_at: new Date(),
    },
  });

export const fetchTop10Scores = async (dbClient: DbClient) =>
  await dbClient.scores.findMany({
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
          external_id: true,
          sso_platform: true,
        },
      },
      outcomes: {
        select: {
          desc: true,
        },
      },
    },
  });

export const fetchBestScoreByPlayerId = async (
  dbClient: DbClient,
  playerId: number,
) =>
  await dbClient.scores.findFirst({
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
