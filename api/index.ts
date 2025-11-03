import { cors } from "hono/cors";
import { logger } from "hono/logger";
import {
  createProfilePicUrlMapFromHighScores,
  getHighScores,
  getPersonalBest,
  saveScore,
} from "./services/scoreService.js";
import {
  deleteLastGame,
  getLastGame,
  getProfilePicKey,
  updateLastGame,
  updatePlayer,
  updatePlayerProfilePic,
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
} from "./validation.js";
import { deleteR2Object, getR2Url, uploadToR2 } from "./services/r2.js";
import {
  type LoginPayload,
  type SaveScorePayload,
  type UpdateLastGamePayload,
  type UpdatePlayerPayload,
} from "./types.js";
import prisma from "./prismaInstance.js";

const app = new Hono().basePath("/api");

app.use(
  cors({
    origin: ["https://localhost:5173", "https://turtle-quest.vercel.app"],
    credentials: true,
  })
);
app.use(logger());

app.post("login", zValidator("json", loginSchema), async (c) => {
  const body = await c.req.json<LoginPayload>();
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
        ? await getR2Url(player.profile_pic_r2_key)
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

    await prisma.$transaction(async (tx) => {
      await saveScore(playerId, body, tx);
      await deleteLastGame(c.get("playerId"), tx);
    });

    return c.json({ message: "Score saved successfully" });
  }
);

app.get("high-scores", async (c) => {
  const highScores = await getHighScores();
  const profilePicUrlMap = await createProfilePicUrlMapFromHighScores(
    highScores
  );

  return c.json(
    highScores.map(({ players, points, level, outcomes }) => ({
      playerName: players?.name,
      playerProfilePicUrl: profilePicUrlMap[players?.profile_pic_r2_key!],
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
    const body = await c.req.json<UpdatePlayerPayload>();

    await updatePlayer(c.get("playerId"), body);
    return c.json({ message: "Player updated successfully" });
  }
);

app.put(
  "game",
  authMiddleware,
  zValidator("json", gameUpdateSchema),
  async (c) => {
    const body = await c.req.json<UpdateLastGamePayload>();
    await updateLastGame(c.get("playerId"), body);
    return c.json({ message: "Game data updated successfully" });
  }
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

export default app;
