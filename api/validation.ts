import { z } from "zod";

export const pointInsertSchema = z.object({
  points: z.number({
    invalid_type_error: "points should be a number",
    required_error: "points is required",
  }),
  level: z.number({
    invalid_type_error: "level should be a number",
    required_error: "level is required",
  }),
  hasWon: z
    .boolean({ invalid_type_error: "hasWon should be a boolean" })
    .optional(),
});

export const settingsSchema = z.object({
  controlPosition: z.enum(["Left", "Right"]),
});

export const playerUpdateSchema = z.object({
  name: z.string(),
  date_of_birth: z.string().date(),
  profile_pic: z.string(),
});

export const gameSchema = z.object({
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
      direction: z.number(),
      food: z.number(),
      health: z.number(),
      oxygen: z.number(),
      stomachCapacity: z.number(),
    }),
    xp: z.number(),
  }),
  timestamp: z.number(),
});
