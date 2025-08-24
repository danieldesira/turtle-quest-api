import { cors } from "hono/cors";
import { logger } from "hono/logger";
import {
  getHighScores,
  getPersonalBest,
  saveScore,
  SaveScorePayload,
} from "./services/scoreService.js";
import {
  deleteLastGame,
  getLastGame,
  getProfilePicKey,
  Player,
  updateLastGame,
  updatePlayer,
  updatePlayerProfilePic,
  updateSettings,
} from "./services/playerService.js";
import {
  checkAndRegisterPlayerGoogle,
  fetchGoogleUser,
  getJWTExpectedExpiry,
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
  settingsUpdateSchema,
} from "./validation.js";
import { getProfilePicUrl, uploadToR2 } from "./services/r2.js";

const app = new Hono().basePath("/api");

app.use(
  cors({
    origin: ["https://localhost:5173", "https://turtle-quest.vercel.app"],
    credentials: true,
  })
);
app.use(logger());

app.post("login", zValidator("json", loginSchema), async (c) => {
  const body = await c.req.json();
  const payload = await fetchGoogleUser(body.token);
  const { player, isNewPlayer } = await checkAndRegisterPlayerGoogle(payload);

  const jwtExpiry = getJWTExpectedExpiry();
  const jwtToken = await sign(
    { id: player.id, email: player.email, exp: jwtExpiry },
    process.env.JWT_SECRET!
  );
  setCookie(c, "Authorization", jwtToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    expires: new Date(jwtExpiry),
  });

  const lastGame = await getLastGame(player.id);

  const personalBest = await getPersonalBest(player.id);

  return c.json({
    message: "Login successful",
    player: {
      ...player,
      date_of_birth: player.date_of_birth?.toISOString().split("T")[0],
      last_game_saved_on: player.last_game_saved_on
        ? new Date(player.last_game_saved_on).getTime()
        : null,
      profile_pic_url: player.profile_pic_r2_key
        ? await getProfilePicUrl(player.profile_pic_r2_key)
        : null,
    },
    isNewPlayer,
    lastGame: lastGame?.last_game,
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
    return c.json({ message: "Score saved successfully" });
  }
);

app.get("high-scores", async (c) => {
  const highScores = await getHighScores();

  const profilePicUrlMap: Record<string, string> = {};
  for (const score of highScores) {
    if (!profilePicUrlMap[score.players?.name!]) {
      profilePicUrlMap[score.players?.name!] = await getProfilePicUrl(
        score.players?.profile_pic_r2_key!
      );
    }
  }

  return c.json(
    highScores.map(({ players, points, level, outcomes }) => ({
      playerName: players?.name,
      playerProfilePicUrl: profilePicUrlMap[players?.name!],
      points,
      level,
      outcome: outcomes.desc,
    }))
  );
});

app.put(
  "player",
  authMiddleware,
  zValidator("json", playerUpdateSchema),
  async (c) => {
    const body = await c.req.json();

    await updatePlayer(c.get("playerId"), body as Player);
    return c.json({ message: "Player updated successfully" });
  }
);

app.put(
  "settings",
  authMiddleware,
  zValidator("json", settingsUpdateSchema),
  async (c) => {
    const body = await c.req.json();
    await updateSettings(c.get("playerId"), body);
    return c.json({ message: "Settings updated successfully" });
  }
);

app.put(
  "game",
  authMiddleware,
  zValidator("json", gameUpdateSchema),
  async (c) => {
    const { lastGame, timestamp } = await c.req.json();

    await updateLastGame(c.get("playerId"), lastGame, timestamp);
    return c.json({ message: "Game data updated successfully" });
  }
);

app.delete("game", authMiddleware, async (c) => {
  await deleteLastGame(c.get("playerId"));
  c.status(204);
  return c.json(undefined);
});

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

  const fileExtension = blob.type.split("/")[1];
  const key = `/profile-pics/${playerId}.${fileExtension}`;
  const buffer = Buffer.from(await blob.arrayBuffer());
  const bucket = process.env.R2_BUCKET_NAME!;

  await uploadToR2(bucket, key, buffer, blob.type);

  await updatePlayerProfilePic(playerId, key);

  return c.json({
    message: "Profile picture updated successfully",
    profilePicUrl: await getProfilePicUrl(key),
  });
});

app.get("profile-pic", authMiddleware, async (c) => {
  const playerId = c.get("playerId");
  const profilePicKey = await getProfilePicKey(playerId);
  const profilePicUrl = await getProfilePicUrl(profilePicKey!);

  return c.json({
    profilePicUrl,
  });
});

export default app;
