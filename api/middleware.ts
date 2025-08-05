import { Context } from "hono";
import { z } from "zod";
import { fetchJWT } from "../services/authService";
import { createMiddleware } from "hono/factory";

type ContextVariables = {
  playerId: number;
};

export const parseJsonBody = (
  schema: z.ZodObject<any>,
  value: object,
  c: Context
) => {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    return c.json({ error: parsed.error }, 422);
  }
  return parsed.data;
};

export const authMiddleware = createMiddleware<{ Variables: ContextVariables }>(
  async (c, next) => {
    c.set("playerId", -1);

    const token = c.req.header("Authorization");
    if (!token) {
      return c.json({ message: "Player not authorised" }, 401);
    }

    const jwt = await fetchJWT(token);
    if (jwt) {
      c.set("playerId", jwt.player_id);
      await next();
    } else {
      return c.json({ message: "Player not authorised" }, 401);
    }
  }
);
