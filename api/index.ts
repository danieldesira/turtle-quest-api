import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import {
  getHighScores,
  getPersonalBest,
  saveScore,
  SaveScorePayload,
} from "../services/scoreService";
import {
  deleteLastGame,
  getLastGame,
  Player,
  updateJsonField,
  updateLastGame,
  updatePlayer,
} from "../services/playerService";
import {
  checkAndRegisterPlayerGoogle,
  fetchGoogleUser,
  revokeJWT,
  saveJWT,
} from "../services/authService";
import { convertBytesToBase64 } from "../utils/files";
import { sign } from "hono/jwt";
import { authMiddleware } from "./middleware";
import { Hono } from "hono";

export const config = {
  runtime: "edge",
};

const app = new Hono().basePath("/api");

app.use(cors());
app.use(logger());

app.post("login", async (c) => {
  const body = await c.req.json();
  const payload = await fetchGoogleUser(body.token);
  const { player, isNewPlayer } = await checkAndRegisterPlayerGoogle(payload);

  const jwtExpiry = Date.now() + 60 * 60 * 1000;
  const jwtToken = await sign(
    { email: player.email, exp: jwtExpiry },
    process.env.JWT_SECRET!
  );
  await saveJWT(jwtToken, player.id, new Date(jwtExpiry));

  const lastGame = await getLastGame(player.id);

  const personalBest = await getPersonalBest(player.id);

  return c.json({
    message: "Login successful",
    player: {
      ...player,
      date_of_birth: player.date_of_birth?.toISOString().split("T")[0],
      profile_pic: convertBytesToBase64(player.profile_pic),
      last_game_saved_on: player.last_game_saved_on
        ? new Date(player.last_game_saved_on).getTime()
        : null,
    },
    isNewPlayer,
    lastGame,
    personalBest,
    jwtToken,
  });
});

app.post("points", authMiddleware, async (c) => {
  const body = await c.req.json<SaveScorePayload>();
  const playerId = c.get("playerId");

  await saveScore(playerId, body);
  return c.json({ message: "Score saved successfully" });
});

app.get("points", async (c) => {
  const highScores = await getHighScores();
  return c.json({ highScores });
});

app.put("player", authMiddleware, async (c) => {
  const body = await c.req.json();

  await updatePlayer(c.get("playerId"), body as Player);
  return c.json({ message: "Player updated successfully" });
});

app.put("settings", authMiddleware, async (c) => {
  const body = await c.req.json();
  await updateJsonField(c.get("playerId"), "settings", body);
  return c.json({ message: "Settings updated successfully" });
});

app.put("game", authMiddleware, async (c) => {
  const { lastGame, timestamp } = await c.req.json();

  await updateLastGame(c.get("playerId"), lastGame, timestamp);
  return c.json({ message: "Game data updated successfully" });
});

app.delete("game", authMiddleware, async (c) => {
  await deleteLastGame(c.get("playerId"));
  c.status(204);
  return c.json(undefined);
});

app.post("logout", authMiddleware, async (c) => {
  await revokeJWT(c.get("playerId"));

  c.status(204);
  return c.json(undefined);
});

export default handle(app);
