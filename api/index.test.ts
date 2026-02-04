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
          dateOfBirth: "1990-01-01",
          settings: { controlPosition: "Right" },
        }),
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("message");
  });

  test("PUT /player Missing Name", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/player", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          dateOfBirth: "1990-01-01",
          settings: { controlPosition: "Right" },
        }),
      }),
    );
    expect(res.status).toBe(400);
  });

  test("PUT /player Missing DOB", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/player", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          name: "Updated Test Player",
          settings: { controlPosition: "Right" },
        }),
      }),
    );
    expect(res.status).toBe(400);
  });

  test("PUT /player Missing Settings", async () => {
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
        }),
      }),
    );
    expect(res.status).toBe(400);
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

  test("PUT /game", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/game", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          lastGame: {
            turtle: {
              x: 400,
              y: 300,
              direction: "Left",
              oxygen: 73,
              food: 30,
              health: 90,
              stomachCapacity: 55,
              isMama: false,
            },
            levelNo: 5,
            xp: 1050,
            characters: [
              {
                type: "Shrimp",
                x: 150,
                y: 200,
                direction: "Right",
              },
              {
                type: "PlasticBag",
                x: 600,
                y: 400,
                direction: "Left",
              },
            ],
            duration: 200,
          },
          timestamp: new Date().getTime(),
        }),
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("message");
  });

  test("PUT /game Past timestamp", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/game", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          lastGame: {
            turtle: {
              x: 400,
              y: 300,
              direction: "Left",
              oxygen: 73,
              food: 30,
              health: 90,
              stomachCapacity: 55,
              isMama: false,
            },
            levelNo: 5,
            xp: 1050,
            characters: [
              {
                type: "Shrimp",
                x: 150,
                y: 200,
                direction: "Right",
              },
              {
                type: "PlasticBag",
                x: 600,
                y: 400,
                direction: "Left",
              },
            ],
            duration: 200,
          },
          timestamp: new Date().getTime() - 2_000_000,
        }),
      }),
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toHaveProperty("message");
  });

  test("PUT /game Missing XP", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/game", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          lastGame: {
            turtle: {
              x: 400,
              y: 300,
              direction: "Left",
              oxygen: 73,
              food: 30,
              health: 90,
              stomachCapacity: 55,
              isMama: false,
            },
            levelNo: 5,
            characters: [
              {
                type: "Shrimp",
                x: 150,
                y: 200,
                direction: "Right",
              },
              {
                type: "PlasticBag",
                x: 600,
                y: 400,
                direction: "Left",
              },
            ],
            duration: 200,
          },
          timestamp: new Date().getTime(),
        }),
      }),
    );
    expect(res.status).toBe(400);
  });

  test("PUT /game Missing levelNo", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/game", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          lastGame: {
            turtle: {
              x: 400,
              y: 300,
              direction: "Left",
              oxygen: 73,
              food: 30,
              health: 90,
              stomachCapacity: 55,
              isMama: false,
            },
            xp: 1050,
            characters: [
              {
                type: "Shrimp",
                x: 150,
                y: 200,
                direction: "Right",
              },
              {
                type: "PlasticBag",
                x: 600,
                y: 400,
                direction: "Left",
              },
            ],
            duration: 200,
          },
          timestamp: new Date().getTime(),
        }),
      }),
    );
    expect(res.status).toBe(400);
  });

  test("PUT /game Missing turtle", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/game", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          lastGame: {
            levelNo: 5,
            xp: 1050,
            characters: [
              {
                type: "Shrimp",
                x: 150,
                y: 200,
                direction: "Right",
              },
              {
                type: "PlasticBag",
                x: 600,
                y: 400,
                direction: "Left",
              },
            ],
            duration: 200,
          },
          timestamp: new Date().getTime(),
        }),
      }),
    );
    expect(res.status).toBe(400);
  });

  test("PUT /game Missing turtle x", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/game", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          lastGame: {
            turtle: {
              y: 300,
              direction: "Left",
              oxygen: 73,
              food: 30,
              health: 90,
              stomachCapacity: 55,
              isMama: false,
            },
            levelNo: 5,
            xp: 1050,
            characters: [
              {
                type: "Shrimp",
                x: 150,
                y: 200,
                direction: "Right",
              },
              {
                type: "PlasticBag",
                x: 600,
                y: 400,
                direction: "Left",
              },
            ],
            duration: 200,
          },
          timestamp: new Date().getTime(),
        }),
      }),
    );
    expect(res.status).toBe(400);
  });

  test("PUT /game Missing turtle y", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/game", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          lastGame: {
            turtle: {
              x: 400,
              direction: "Left",
              oxygen: 73,
              food: 30,
              health: 90,
              stomachCapacity: 55,
              isMama: false,
            },
            levelNo: 5,
            xp: 1050,
            characters: [
              {
                type: "Shrimp",
                x: 150,
                y: 200,
                direction: "Right",
              },
              {
                type: "PlasticBag",
                x: 600,
                y: 400,
                direction: "Left",
              },
            ],
            duration: 200,
          },
          timestamp: new Date().getTime(),
        }),
      }),
    );
    expect(res.status).toBe(400);
  });

  test("PUT /game Missing turtle direction", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/game", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          lastGame: {
            turtle: {
              x: 400,
              y: 300,
              oxygen: 73,
              food: 30,
              health: 90,
              stomachCapacity: 55,
              isMama: false,
            },
            levelNo: 5,
            xp: 1050,
            characters: [
              {
                type: "Shrimp",
                x: 150,
                y: 200,
                direction: "Right",
              },
              {
                type: "PlasticBag",
                x: 600,
                y: 400,
                direction: "Left",
              },
            ],
            duration: 200,
          },
          timestamp: new Date().getTime(),
        }),
      }),
    );
    expect(res.status).toBe(400);
  });

  test("PUT /game Missing turtle oxgyen", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/game", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          lastGame: {
            turtle: {
              x: 400,
              y: 300,
              direction: "Left",
              food: 30,
              health: 90,
              stomachCapacity: 55,
              isMama: false,
            },
            levelNo: 5,
            xp: 1050,
            characters: [
              {
                type: "Shrimp",
                x: 150,
                y: 200,
                direction: "Right",
              },
              {
                type: "PlasticBag",
                x: 600,
                y: 400,
                direction: "Left",
              },
            ],
            duration: 200,
          },
          timestamp: new Date().getTime(),
        }),
      }),
    );
    expect(res.status).toBe(400);
  });

  test("PUT /game Missing turtle food", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/game", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          lastGame: {
            turtle: {
              x: 400,
              y: 300,
              direction: "Left",
              oxygen: 73,
              health: 90,
              stomachCapacity: 55,
              isMama: false,
            },
            levelNo: 5,
            xp: 1050,
            characters: [
              {
                type: "Shrimp",
                x: 150,
                y: 200,
                direction: "Right",
              },
              {
                type: "PlasticBag",
                x: 600,
                y: 400,
                direction: "Left",
              },
            ],
            duration: 200,
          },
          timestamp: new Date().getTime(),
        }),
      }),
    );
    expect(res.status).toBe(400);
  });

  test("PUT /game Missing turtle health", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/game", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          lastGame: {
            turtle: {
              x: 400,
              y: 300,
              direction: "Left",
              oxygen: 73,
              food: 30,
              stomachCapacity: 55,
              isMama: false,
            },
            levelNo: 5,
            xp: 1050,
            characters: [
              {
                type: "Shrimp",
                x: 150,
                y: 200,
                direction: "Right",
              },
              {
                type: "PlasticBag",
                x: 600,
                y: 400,
                direction: "Left",
              },
            ],
            duration: 200,
          },
          timestamp: new Date().getTime(),
        }),
      }),
    );
    expect(res.status).toBe(400);
  });

  test("PUT /game Missing turtle stomachCapacity", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/game", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          lastGame: {
            turtle: {
              x: 400,
              y: 300,
              direction: "Left",
              oxygen: 73,
              food: 30,
              health: 90,
              isMama: false,
            },
            levelNo: 5,
            xp: 1050,
            characters: [
              {
                type: "Shrimp",
                x: 150,
                y: 200,
                direction: "Right",
              },
              {
                type: "PlasticBag",
                x: 600,
                y: 400,
                direction: "Left",
              },
            ],
            duration: 200,
          },
          timestamp: new Date().getTime(),
        }),
      }),
    );
    expect(res.status).toBe(400);
  });

  test("PUT /game Missing character type", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/game", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          lastGame: {
            turtle: {
              x: 400,
              y: 300,
              direction: "Left",
              oxygen: 73,
              food: 30,
              health: 90,
              isMama: false,
            },
            levelNo: 5,
            xp: 1050,
            characters: [
              {
                x: 150,
                y: 200,
                direction: "Right",
              },
            ],
            duration: 200,
          },
          timestamp: new Date().getTime(),
        }),
      }),
    );
    expect(res.status).toBe(400);
  });

  test("PUT /game Missing character x", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/game", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          lastGame: {
            turtle: {
              x: 400,
              y: 300,
              direction: "Left",
              oxygen: 73,
              food: 30,
              health: 90,
              isMama: false,
            },
            levelNo: 5,
            xp: 1050,
            characters: [
              {
                type: "Shrimp",
                y: 200,
                direction: "Right",
              },
            ],
            duration: 200,
          },
          timestamp: new Date().getTime(),
        }),
      }),
    );
    expect(res.status).toBe(400);
  });

  test("PUT /game Missing character y", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/game", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          lastGame: {
            turtle: {
              x: 400,
              y: 300,
              direction: "Left",
              oxygen: 73,
              food: 30,
              health: 90,
              isMama: false,
            },
            levelNo: 5,
            xp: 1050,
            characters: [
              {
                type: "Shrimp",
                x: 150,
                direction: "Right",
              },
            ],
            duration: 200,
          },
          timestamp: new Date().getTime(),
        }),
      }),
    );
    expect(res.status).toBe(400);
  });

  test("PUT /game Missing character direction", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/game", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          lastGame: {
            turtle: {
              x: 400,
              y: 300,
              direction: "Left",
              oxygen: 73,
              food: 30,
              health: 90,
              isMama: false,
            },
            levelNo: 5,
            xp: 1050,
            characters: [
              {
                type: "Shrimp",
                x: 150,
                y: 200,
              },
            ],
            duration: 200,
          },
          timestamp: new Date().getTime(),
        }),
      }),
    );
    expect(res.status).toBe(400);
  });

  test("PUT /game Missing duration", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/game", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          lastGame: {
            turtle: {
              x: 400,
              y: 300,
              direction: "Left",
              oxygen: 73,
              food: 30,
              health: 90,
              stomachCapacity: 55,
              isMama: false,
            },
            levelNo: 5,
            xp: 1050,
            characters: [
              {
                type: "PlasticBag",
                x: 600,
                y: 400,
                direction: "Left",
              },
            ],
          },
          timestamp: new Date().getTime(),
        }),
      }),
    );
    expect(res.status).toBe(400);
  });
});

describe("Game API - Public Endpoints", () => {
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
