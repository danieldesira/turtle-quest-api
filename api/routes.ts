import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { parseJsonBody, verifyGoogleToken } from "./middleware";
import {
  gameSchema,
  playerUpdateSchema,
  pointInsertSchema,
  settingsSchema,
} from "./validation";
import { validator } from "hono/validator";
import { PlayerSchema } from "./types";

export const aboutRoute = createRoute({
  method: "get",
  path: "/about",
  description: "Get API information",
  responses: {
    200: {
      description: "Success",
      content: {
        "application/json": {
          schema: z.object({
            project: z.string(),
            version: z.string(),
            author: z.object({
              name: z.string(),
              email: z.string(),
            }),
          }),
        },
      },
    },
  },
});

export const loginRoute = createRoute({
  method: "post",
  path: "/login",
  description: "Login player",
  security: [{ bearerAuth: [] }],
  middleware: [verifyGoogleToken],
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            player: PlayerSchema,
            isNewPlayer: z.boolean(),
          }),
        },
      },
    },
  },
});

export const registerPointsRoute = createRoute({
  method: "post",
  path: "/points",
  middleware: [
    verifyGoogleToken,
    validator("json", (value, c) => parseJsonBody(pointInsertSchema, value, c)),
  ],
  description: "Save player score",
  requestBody: {
    content: {
      "application/json": {
        pointInsertSchema,
      },
    },
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
});

export const getPointsRoute = createRoute({
  method: "get",
  path: "/points",
  middleware: [verifyGoogleToken],
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: z.array(
            z.object({
              points: z.number(),
              level: z.number(),
              player_won: z.string(),
              created_at: z.date(),
              player: z.object({ name: z.string().nullable() }).nullable(),
            })
          ),
        },
      },
    },
  },
});

export const getPlayerRoute = createRoute({
  method: "get",
  path: "/player",
  middleware: [verifyGoogleToken],
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: PlayerSchema,
        },
      },
    },
  },
});

export const updatePlayerRoute = createRoute({
  method: "put",
  path: "/player",
  middleware: [
    verifyGoogleToken,
    validator("json", (value, c) =>
      parseJsonBody(playerUpdateSchema, value, c)
    ),
  ],
  requestBody: {
    content: {
      "application/json": {
        playerUpdateSchema,
      },
    },
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
});

export const updateSettingsRoute = createRoute({
  method: "put",
  path: "/settings",
  middleware: [
    verifyGoogleToken,
    validator("json", (value, c) => parseJsonBody(settingsSchema, value, c)),
  ],
  requestBody: {
    content: {
      "application/json": { settingsSchema },
    },
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
});

export const updateGameRoute = createRoute({
  method: "put",
  path: "/game",
  middleware: [
    verifyGoogleToken,
    validator("json", (value, c) => parseJsonBody(gameSchema, value, c)),
  ],
  requestBody: {
    content: {
      "application/json": { settingsSchema },
    },
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
});
