import { cors } from "hono/cors";
import { logger } from "hono/logger";
import {
  getHighScores,
  getPersonalBest,
  getScores,
  saveScore,
} from "./services/scoreService.js";
import {
  deleteLastGame,
  getProfilePicKey,
  updateLastGame,
  updatePlayer,
  updatePlayerProfilePic,
} from "./services/playerService.js";
import {
  getJWTExpectedExpiry,
  handleGoogleSSOLogin,
  handleMicrosoftEntraSSOLogin,
} from "./services/authService.js";
import { sign } from "hono/jwt";
import { authMiddleware } from "./middleware.js";
import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { zValidator } from "@hono/zod-validator";
import {
  gameUpdateSchema,
  loginSchema,
  playerUpdateSchema,
  pointInsertSchema,
} from "./validation.js";
import { deleteR2Object, getR2Url, uploadToR2 } from "./services/r2.js";
import {
  ScoresQueryOptions,
  type LoginPayload,
  type SaveScorePayload,
  type UpdateLastGamePayload,
  type UpdatePlayerPayload,
} from "./types.js";
import { enforceCamelCase } from "hono-camelcase";
import { players } from "@prisma/client";

const app = new Hono().basePath("/api");

app.use(
  cors({
    origin: ["https://localhost:5173", "https://turtle-quest.vercel.app"],
    credentials: true,
  }),
);
app.use(logger());

app.use(enforceCamelCase);

app.post("login", zValidator("json", loginSchema), async (c) => {
  const body = await c.req.json<LoginPayload>();

  let res: { player: players; isNewPlayer: boolean } | null = null;
  switch (body.provider) {
    case "google":
      res = await handleGoogleSSOLogin(body.credential);
      break;
    case "microsoft":
      res = await handleMicrosoftEntraSSOLogin(body.credential);
      break;
  }

  const { player, isNewPlayer } = res;

  const jwtExpiry = getJWTExpectedExpiry();
  const jwtToken = await sign(
    { id: player.id, email: player.email, exp: jwtExpiry },
    process.env.JWT_SECRET!,
  );
  setCookie(c, "Authorization", jwtToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    expires: new Date(jwtExpiry),
  });

  const personalBest = await getPersonalBest(player?.id ?? 0);

  return c.json({
    message: "Login successful",
    player: {
      ...player,
      date_of_birth: player?.date_of_birth?.toISOString().split("T")[0],
      last_game_saved_on: player?.last_game_saved_on
        ? new Date(player.last_game_saved_on).getTime()
        : null,
      profile_pic_url: player?.profile_pic_r2_key
        ? await getR2Url(player.profile_pic_r2_key)
        : null,
    },
    isNewPlayer,
    personalBest,
  });
});

app.post(
  "points",
  authMiddleware,
  zValidator("json", pointInsertSchema),
  async (c) => {
    const body = await c.req.json<SaveScorePayload>();
    const playerId = c.get("playerId");

    await saveScore(playerId, body);
    await deleteLastGame(playerId);

    return c.json({ message: "Score saved successfully" });
  },
);

app.get("high-scores", async (c) => {
  const highScores = await getHighScores();
  return c.json(highScores);
});

app.put(
  "player",
  authMiddleware,
  zValidator("json", playerUpdateSchema),
  async (c) => {
    const body = await c.req.json<UpdatePlayerPayload>();

    await updatePlayer(c.get("playerId"), body);
    return c.json({ message: "Player updated successfully" });
  },
);

app.put(
  "game",
  authMiddleware,
  zValidator("json", gameUpdateSchema),
  async (c) => {
    const body = await c.req.json<UpdateLastGamePayload>();
    try {
      await updateLastGame(c.get("playerId"), body);
      return c.json({ message: "Game data updated successfully" });
    } catch (error) {
      return c.json({ message: error }, 400);
    }
  },
);

app.post("logout", authMiddleware, async (c) => {
  deleteCookie(c, "Authorization");

  c.status(204);
  return c.json(undefined);
});

app.put("profile-pic", authMiddleware, async (c) => {
  const playerId = c.get("playerId");
  const blob = await c.req.blob();

  if (!blob.type.startsWith("image/")) {
    return c.json({ message: "Invalid file type" }, 400);
  }

  const oldKey = await getProfilePicKey(playerId);

  const fileExtension = blob.type.split("/")[1];
  const newKey = `/profile-pics/${playerId}.${fileExtension}`;
  const buffer = Buffer.from(await blob.arrayBuffer());
  const bucket = process.env.R2_BUCKET_NAME!;

  await uploadToR2(bucket, newKey, buffer, blob.type);
  await updatePlayerProfilePic(playerId, newKey);

  await deleteR2Object(bucket, oldKey!);

  return c.json({
    message: "Profile picture updated successfully",
    profilePicUrl: await getR2Url(newKey),
  });
});

app.get("scores", async (c) => {
  const options = {
    page: parseInt(c.req.query("page") ?? "1"),
    items: parseInt(c.req.query("items") ?? "20"),
    outcome: c.req.query("outcome")?.toUpperCase() as
      | "WIN"
      | "LOSS"
      | undefined,
    juniorsOnly: !!c.req.query("juniors"),
  } satisfies ScoresQueryOptions;
  const scores = await getScores(options);
  return c.json(scores);
});

export default app;
