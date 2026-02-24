import { z } from "zod";
import {
  gameUpdateSchema,
  loginSchema,
  playerUpdateSchema,
  pointInsertSchema,
} from "./validation";
import { Prisma, PrismaClient } from "@prisma/client";

export type SaveScorePayload = z.infer<typeof pointInsertSchema>;

export type LoginPayload = z.infer<typeof loginSchema>;

export type UpdatePlayerPayload = z.infer<typeof playerUpdateSchema>;

export type UpdateLastGamePayload = z.infer<typeof gameUpdateSchema>;

export type DbClient = PrismaClient | Prisma.TransactionClient;

export type ScoresQueryOptions = {
  page: number;
  items: number;
  outcome?: "WIN" | "LOSS";
  juniorsOnly?: boolean;
};
