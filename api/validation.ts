import { z } from "zod";

export const loginSchema = z.object({
  token: z.string(),
  service: z.enum(["google"]),
});

export const pointInsertSchema = z.object({
  points: z.number(),
  level: z.number().positive(),
  hasWon: z.boolean().optional(),
  duration: z.number().optional(),
});

export const playerUpdateSchema = z.object({
  name: z.string(),
  dateOfBirth: z.string().date().optional(),
  settings: z.object({
    controlPosition: z.enum(["Left", "Right"]),
    audioVolume: z.number().min(0).max(1),
  }),
});

export const gameUpdateSchema = z.object({
  lastGame: z.object({
    characters: z.array(
      z.object({
        x: z.number(),
        y: z.number(),
        direction: z.enum(["Up", "Down", "Left", "Right"]),
        type: z.string(),
      }),
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
    duration: z.number(),
  }),
  timestamp: z.number(),
});
