import { z } from "zod";
import {
  gameUpdateSchema,
  loginSchema,
  playerUpdateSchema,
  pointInsertSchema,
} from "./validation";
import { getHighScores } from "./services/scoreService";
import { Prisma, PrismaClient } from "@prisma/client";

export type SaveScorePayload = z.infer<typeof pointInsertSchema>;

export type HighScoresResult = Awaited<ReturnType<typeof getHighScores>>;

export type LoginPayload = z.infer<typeof loginSchema>;

export type UpdatePlayerPayload = z.infer<typeof playerUpdateSchema>;

export type UpdateLastGamePayload = z.infer<typeof gameUpdateSchema>;

export type DbClient = PrismaClient | Prisma.TransactionClient;
