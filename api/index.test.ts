import { beforeEach, describe, expect, test } from "vitest";
import { sign } from "hono/jwt";
import app from ".";

describe("Game API - Authenticated Endpoints", () => {
  let authToken: string;
  const testPlayerId = 100_000;
  const testPlayerEmail = "test@example.com";

  beforeEach(async () => {
    authToken = await sign(
      {
        id: testPlayerId,
        email: testPlayerEmail,
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      process.env.JWT_SECRET!,
    );
  });

  test("PUT /player", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/player", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          name: "Updated Test Player",
          date_of_birth: "1990-01-01",
          settings: { controlPosition: "Right" },
        }),
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("message");
  });

  test("POST /points Win", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          points: 1500,
          level: 9,
          hasWon: true,
        }),
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("message");
  });

  test("POST /points Loss", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          points: 500,
          level: 2,
          hasWon: false,
        }),
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("message");
  });

  test("POST /points Negative Level", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          points: 500,
          level: -2,
          outcome: "Loss",
        }),
      }),
    );
    expect(res.status).toBe(400);
  });
});

describe("Game API", () => {
  test("GET /high-scores", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/high-scores"),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data.length).toBeLessThanOrEqual(10);
    data.forEach((entry: unknown) => {
      expect(entry).toHaveProperty("playerName");
      expect(entry).toHaveProperty("points");
      expect(entry).toHaveProperty("level");
      expect(entry).toHaveProperty("outcome");
    });
  });
});
