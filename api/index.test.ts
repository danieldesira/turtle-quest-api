import { beforeEach, describe, expect, test } from "vitest";
import { sign } from "hono/jwt";
import app from ".";
import { getScores } from "./services/scoreService";

describe("Game API - Authenticated Endpoints", () => {
  let authToken: string;
  const testPlayerId = 1;
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
          settings: { controlPosition: "Right", audioVolume: 0.8 },
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
          settings: { controlPosition: "Right", audioVolume: 0.8 },
        }),
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("message");
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

  test("PUT /player Missing Settings control position", async () => {
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
          settings: {
            audioVolume: 0.9,
          },
        }),
      }),
    );
    expect(res.status).toBe(400);
  });

  test("PUT /player Missing Settings audio volume", async () => {
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
          settings: {
            controlPosition: "Left",
          },
        }),
      }),
    );
    expect(res.status).toBe(400);
  });

  test("PUT /player Settings audio volume under 0", async () => {
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
          settings: { controlPosition: "Right", audioVolume: -0.1 },
        }),
      }),
    );
    expect(res.status).toBe(400);
  });

  test("PUT /player Settings audio volume over 1", async () => {
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
          settings: { controlPosition: "Right", audioVolume: 1.1 },
        }),
      }),
    );
    expect(res.status).toBe(400);
  });

  test("PUT /player Settings control position other", async () => {
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
          settings: {
            controlPosition: "Other",
            audioVolume: 0.8,
          },
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
          interactions:
            "Shrimp,265|Crab,5|NeptuneGrass,2|Nurdle,34|MaleTurtle,1|JaggedPlastic,1",
          level: 9,
          duration: 400,
        }),
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("message");
  });

  test("POST /points Win Single interaction", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          interactions: "Shrimp,265",
          level: 9,
          duration: 400,
        }),
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("message");
  });

  test("POST /points Win missing duration", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          interactions:
            "Shrimp,265|Crab,5|NeptuneGrass,2|Nurdle,34|MaleTurtle,1|JaggedPlastic,1",
          level: 9,
        }),
      }),
    );
    expect(res.status).toBe(400);
  });

  test("POST /points Win negative duration", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          interactions:
            "Shrimp,265|Crab,5|NeptuneGrass,2|Nurdle,34|MaleTurtle,1|JaggedPlastic,1",
          level: 9,
          duration: -200,
        }),
      }),
    );
    expect(res.status).toBe(400);
  });

  test("POST /points Invalid interactions", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          interactions: "Sabfsdfg",
          level: 9,
          duration: 200,
        }),
      }),
    );
    expect(res.status).toBe(400);
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
          interactions: "Shrimp,15|Crab,2|NeptuneGrass,2",
          level: 2,
          duration: 400,
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
          interactions:
            "Shrimp,265|Crab,5|NeptuneGrass,2|Nurdle,34|MaleTurtle,1|JaggedPlastic,1",
          level: -2,
          duration: 400,
        }),
      }),
    );
    expect(res.status).toBe(400);
  });

  test("POST /points Win missing interactions", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
        body: JSON.stringify({
          level: 9,
          duration: 300,
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
            interactions:
              "Shrimp,265|Crab,5|NeptuneGrass,2|Nurdle,34|MaleTurtle,1|JaggedPlastic,1",
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

  test("PUT /game single interaction", async () => {
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
            interactions: "Shrimp,200",
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

  test("PUT /game Invalid interaction", async () => {
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
            interactions: "qwetrsdr",
            characters: [
              {
                type: "Shrimp",
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
            interactions:
              "Shrimp,265|Crab,5|NeptuneGrass,2|Nurdle,34|MaleTurtle,1",
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

  test("PUT /game Missing interactions", async () => {
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
            interactions:
              "Shrimp,265|Crab,5|NeptuneGrass,2|Nurdle,34|MaleTurtle,1|JaggedPlastic,1",
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

  test("PUT /game Missing xp", async () => {
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
            interactions:
              "Shrimp,265|Crab,5|NeptuneGrass,2|Nurdle,34|MaleTurtle,1|JaggedPlastic,1",
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
            interactions:
              "Shrimp,265|Crab,5|NeptuneGrass,2|Nurdle,34|MaleTurtle,1|JaggedPlastic,1",
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
            interactions:
              "Shrimp,265|Crab,5|NeptuneGrass,2|Nurdle,34|MaleTurtle,1|JaggedPlastic,1",
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
            interactions:
              "Shrimp,265|Crab,5|NeptuneGrass,2|Nurdle,34|MaleTurtle,1|JaggedPlastic,1",
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
            interactions:
              "Shrimp,265|Crab,5|NeptuneGrass,2|Nurdle,34|MaleTurtle,1|JaggedPlastic,1",
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
            interactions:
              "Shrimp,265|Crab,5|NeptuneGrass,2|Nurdle,34|MaleTurtle,1|JaggedPlastic,1",
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
            interactions:
              "Shrimp,265|Crab,5|NeptuneGrass,2|Nurdle,34|MaleTurtle,1|JaggedPlastic,1",
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
            interactions:
              "Shrimp,265|Crab,5|NeptuneGrass,2|Nurdle,34|MaleTurtle,1|JaggedPlastic,1",
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
            interactions:
              "Shrimp,265|Crab,5|NeptuneGrass,2|Nurdle,34|MaleTurtle,1|JaggedPlastic,1",
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
            interactions:
              "Shrimp,265|Crab,5|NeptuneGrass,2|Nurdle,34|MaleTurtle,1|JaggedPlastic,1",
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
            interactions:
              "Shrimp,265|Crab,5|NeptuneGrass,2|Nurdle,34|MaleTurtle,1|JaggedPlastic,1",
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
            interactions:
              "Shrimp,265|Crab,5|NeptuneGrass,2|Nurdle,34|MaleTurtle,1|JaggedPlastic,1",
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
            interactions:
              "Shrimp,265|Crab,5|NeptuneGrass,2|Nurdle,34|MaleTurtle,1|JaggedPlastic,1",
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
            interactions:
              "Shrimp,265|Crab,5|NeptuneGrass,2|Nurdle,34|MaleTurtle,1|JaggedPlastic,1",
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

  test("POST /logout", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `Authorization=${authToken}`,
        },
      }),
    );
    expect(res.status).toBe(204);
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

  test("GET /scores no filters", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/scores"),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data.length).toBeLessThanOrEqual(20);
    data.forEach((entry: unknown) => {
      expect(entry).toHaveProperty("playerName");
      expect(entry).toHaveProperty("points");
      expect(entry).toHaveProperty("level");
      expect(entry).toHaveProperty("outcome");
    });
  });

  test("GET /scores with page filter", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/scores?page=2"),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeLessThanOrEqual(20);
    data.forEach((entry: unknown) => {
      expect(entry).toHaveProperty("playerName");
      expect(entry).toHaveProperty("points");
      expect(entry).toHaveProperty("level");
      expect(entry).toHaveProperty("outcome");
    });
  });

  test("GET /scores with items filter", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/scores?items=10"),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeLessThanOrEqual(10);
    data.forEach((entry: unknown) => {
      expect(entry).toHaveProperty("playerName");
      expect(entry).toHaveProperty("points");
      expect(entry).toHaveProperty("level");
      expect(entry).toHaveProperty("outcome");
    });
  });

  test("GET /scores with win outcome filter", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/scores?outcome=win"),
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as Awaited<ReturnType<typeof getScores>>;
    expect(Array.isArray(data)).toBe(true);
    data.forEach((entry) => {
      expect(entry).toHaveProperty("playerName");
      expect(entry).toHaveProperty("points");
      expect(entry).toHaveProperty("level");
      expect(entry).toHaveProperty("outcome");
      expect(entry.outcome.toLowerCase()).toBe("win");
    });
  });

  test("GET /scores with loss outcome filter", async () => {
    const res = await app.request(
      new Request("http://localhost:3000/api/scores?outcome=loss"),
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as Awaited<ReturnType<typeof getScores>>;
    expect(Array.isArray(data)).toBe(true);
    data.forEach((entry) => {
      expect(entry).toHaveProperty("playerName");
      expect(entry).toHaveProperty("points");
      expect(entry).toHaveProperty("level");
      expect(entry).toHaveProperty("outcome");
      expect(entry.outcome.toLowerCase()).toBe("loss");
    });
  });
});
