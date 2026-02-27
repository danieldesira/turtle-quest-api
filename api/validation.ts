import { z } from "zod";

export const loginSchema = z.object({
  credential: z.string(),
  provider: z.enum(["google", "microsoft"]),
});

const interactionsSchema = z
  .string()
  .regex(/[a-zA-Z]+,[0-9]+(|[a-zA-Z]+,[0-9]+)*/);

export const pointInsertSchema = z.object({
  interactions: interactionsSchema,
  level: z.number().positive().max(9),
  duration: z.number().positive(),
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
    interactions: interactionsSchema,
    remainingResets: z.number().max(3).min(0),
  }),
  timestamp: z.number(),
});
