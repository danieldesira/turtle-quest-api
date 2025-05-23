import { z } from "zod";
import { settingsSchema } from "./validation";

export const PlayerSchema = z.object({
  id: z.number(),
  external_id: z.string(),
  platform: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  created_at: z.date(),
  profile_pic: z.array(z.number()).nullable(),
  date_of_birth: z.date().nullable(),
  last_login_at: z.date().nullable(),
  settings: settingsSchema,
});

export const AuthSchema = z.object({
  player: PlayerSchema,
  isNewPlayer: z.boolean(),
});

// Type derived from the schema
export type Auth = z.infer<typeof AuthSchema>;
export type Player = z.infer<typeof PlayerSchema>;
