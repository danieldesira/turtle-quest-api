import { z } from "zod";

export const loginSchema = z.object({
  token: z.string(),
  service: z.enum(["google"]),
});

export const pointInsertSchema = z.object({
  points: z.number(),
  level: z.number(),
  hasWon: z.boolean().optional(),
});

export const settingsUpdateSchema = z.object({
  controlPosition: z.enum(["Left", "Right"]),
});

export const playerUpdateSchema = z.object({
  name: z.string(),
  date_of_birth: z.string().date(),
  profile_pic: z.string(),
});

export const gameUpdateSchema = z.object({
  lastGame: z.object({
    characters: z.array(
      z.object({
        x: z.number(),
        y: z.number(),
        direction: z.number(),
        type: z.string(),
      })
    ),
    levelNo: z.number(),
    turtle: z.object({
      x: z.number(),
      y: z.number(),
      direction: z.enum(["Up", "Down", "Left", "Right"]),
      food: z.number(),
      health: z.number(),
      oxygen: z.number(),
      stomachCapacity: z.number(),
    }),
    xp: z.number(),
  }),
  timestamp: z.number(),
});
