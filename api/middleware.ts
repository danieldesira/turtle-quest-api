import { Context } from "hono";
import { z } from "zod";
import { createMiddleware } from "hono/factory";
import { decode, verify } from "hono/jwt";
import { getCookie } from "hono/cookie";

type ContextVariables = {
  playerId: number;
};

export const authMiddleware = createMiddleware<{ Variables: ContextVariables }>(
  async (c, next) => {
    const authorizationCookie = getCookie(c, "Authorization");
    if (!authorizationCookie) {
      return c.json({ message: "Player not authorised" }, 401);
    }

    if (!verify(authorizationCookie, process.env.JWT_SECRET!)) {
      return c.json({ message: "Player not authorised" }, 401);
    }

    const { payload } = decode(authorizationCookie);

    if (!payload || !payload.id) {
      return c.json({ message: "Player not authorised" }, 401);
    }

    c.set("playerId", Number(payload.id));
    await next();
  }
);
