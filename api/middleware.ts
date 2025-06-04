import { Context } from "hono";
import {
  checkAndRegisterPlayerGoogle,
  fetchGoogleUser,
} from "../services/authService";
import { z } from "zod";
import { AuthSchema } from "./types";

export interface Environment extends Record<string, unknown> {
  externalId: string;
  ssoPlatform: string;
  isNewPlayer: boolean;
  player: string;
}

export const verifyGoogleToken = async (
  c: Context,
  next: () => Promise<void>
): Promise<Response | void> => {
  const token = c.req.header("Authorization");
  if (!token) {
    return c.json({ error: "Token missing" }, 401);
  }

  try {
    const payload = await fetchGoogleUser(token);

    const { player, isNewPlayer } = await checkAndRegisterPlayerGoogle(payload);

    c.set(
      "auth",
      AuthSchema.parse({
        player: {
          ...player,
          profile_pic: convertBytesToBase64(player.profile_pic),
          settings: JSON.parse(player.settings?.toString()!),
        },
        isNewPlayer,
      })
    );

    await next();
  } catch (error) {
    console.log(error);
    return c.json({ error: "Invalid token" }, 401);
  }
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

const convertBytesToBase64 = (bytes: Uint8Array | null): string | null => {
  if (!bytes) return null;
  return btoa(String.fromCharCode(...bytes));
};
