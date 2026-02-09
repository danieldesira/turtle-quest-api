import { z } from "zod";
import {
  gameUpdateSchema,
  loginSchema,
  playerUpdateSchema,
  pointInsertSchema,
} from "./validation";
import { Prisma, PrismaClient } from "@prisma/client";
import { fetchTop10Scores, insertScore } from "./repositories/scoreRepository";

export type SaveScorePayload = z.infer<typeof pointInsertSchema>;

export type HighScoresResult = Awaited<ReturnType<typeof fetchTop10Scores>>;

export type LoginPayload = z.infer<typeof loginSchema>;

export type UpdatePlayerPayload = z.infer<typeof playerUpdateSchema>;

export type UpdateLastGamePayload = z.infer<typeof gameUpdateSchema>;

export type DbClient = PrismaClient | Prisma.TransactionClient;

export type InsertScoreRow = Awaited<ReturnType<typeof insertScore>>;
