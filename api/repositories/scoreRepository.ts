import { OutcomeType, Prisma } from "@prisma/client";
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
  { page, items, outcome, juniorsOnly }: ScoresQueryOptions,
) =>
  (await dbClient.$queryRaw`select *
    from fetch_scores(${outcome}, ${juniorsOnly}, ${items}, ${page})`) as Array<{
    player_name: string;
    profile_pic_r2_key?: string;
    player_age?: number;
    level: number;
    duration: number;
    points: number;
    outcome: OutcomeType;
    created_at: Date;
  }>;

export const countScores = async (
  dbClient: DbClient,
  outcome?: OutcomeType,
  juniorsOnly?: boolean,
) => {
  // Use raw SQL to filter by age < 16
  const result =
    (await dbClient.$queryRaw`SELECT COUNT(*)::int as count FROM scores s INNER JOIN players p ON s.player_id = p.id WHERE (${outcome ? Prisma.sql`outcome = ${outcome}` : Prisma.sql`true`}) AND (${juniorsOnly ? Prisma.sql`EXTRACT(YEAR FROM AGE(p.date_of_birth)) < 16` : `true`})`) as Array<{
      count: number;
    }>;
  return result[0].count || 0;
};
