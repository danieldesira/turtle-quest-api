import { z } from "zod";
import { pointInsertSchema } from "./validation";
import { getHighScores } from "./services/scoreService";

export type SaveScorePayload = z.infer<typeof pointInsertSchema>;

export type HighScores = Awaited<ReturnType<typeof getHighScores>>;
