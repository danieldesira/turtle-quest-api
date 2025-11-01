import { z } from "zod";
import {
  gameUpdateSchema,
  loginSchema,
  playerUpdateSchema,
  pointInsertSchema,
  settingsUpdateSchema,
} from "./validation";
import { getHighScores } from "./services/scoreService";

export type SaveScorePayload = z.infer<typeof pointInsertSchema>;

export type HighScoresResult = Awaited<ReturnType<typeof getHighScores>>;

export type LoginPayload = z.infer<typeof loginSchema>;

export type UpdatePlayerPayload = z.infer<typeof playerUpdateSchema>;

export type UpdateSettingsPayload = z.infer<typeof settingsUpdateSchema>;

export type UpdateLastGamePayload = z.infer<typeof gameUpdateSchema>;
