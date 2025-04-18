import { handle } from "hono/vercel";
import { version } from "../package.json";
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
  updatePlayer,
} from "../services/playerService";
import { OpenAPIHono } from "@hono/zod-openapi";
import {
  deleteGameRoute,
  getGameRoute,
  getPlayerRoute,
  getPointsRoute,
  loginRoute,
  registerPointsRoute,
  updateGameRoute,
  updatePlayerRoute,
  updateSettingsRoute,
} from "./routes";
import { Auth } from "./types";
import { swaggerUI } from "@hono/swagger-ui";

export const config = {
  runtime: "edge",
};

const app = new OpenAPIHono().basePath("/api");

app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version,
    title: "Turtle Quest API",
  },
});

app.use(cors());
app.use(logger());

app.openapi(loginRoute, (c) => {
  const { player, isNewPlayer } = c.get("auth") as Auth;

  return c.json({
    message: "Login successful",
    player,
    isNewPlayer,
  });
});

app.openapi(registerPointsRoute, async (c) => {
  const { player } = c.get("auth") as Auth;

  const body = await c.req.json<SaveScorePayload>();

  await saveScore(player.id, body);
  return c.json({ message: "Score saved successfully" });
});

app.openapi(getPointsRoute, async (c) => {
  const { player } = c.get("auth") as Auth;

  const highScores = await getHighScores();
  const personalBest = await getPersonalBest(player.id);

  return c.json({ highScores, personalBest });
});

app.openapi(getPlayerRoute, (c) => {
  const { player } = c.get("auth") as Auth;
  return c.json(player);
});

app.openapi(updatePlayerRoute, async (c) => {
  const { player } = c.get("auth") as Auth;
  const body = await c.req.json();
  await updatePlayer(player.id, body as Player);
  return c.json({ message: "Player updated successfully" });
});

app.openapi(updateSettingsRoute, async (c) => {
  const { player } = c.get("auth") as Auth;
  const body = await c.req.json();
  await updateJsonField(player.id, "settings", body);
  return c.json({ message: "Settings updated successfully" });
});

app.openapi(updateGameRoute, async (c) => {
  const { player } = c.get("auth") as Auth;
  const body = await c.req.json();
  await updateJsonField(player.id, "last_game", body);
  return c.json({ message: "Game data updated successfully" });
});

app.openapi(getGameRoute, async (c) => {
  const { player } = c.get("auth") as Auth;
  const res = await getLastGame(player.id);
  const lastGame = res?.last_game
    ? JSON.parse(res.last_game?.toString())
    : null;
  return c.json(lastGame);
});

app.openapi(deleteGameRoute, async (c) => {
  const { player } = c.get("auth") as Auth;
  await deleteLastGame(player.id);
  c.status(204);
  return c.json(undefined);
});

app.get("/swagger", swaggerUI({ url: "/api/doc" }));

export default handle(app);
