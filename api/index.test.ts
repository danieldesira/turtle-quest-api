import { describe, expect, test } from "vitest";
import app from ".";

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
      expect(entry).toHaveProperty("playerProfilePicUrl");
      expect(entry).toHaveProperty("level");
      expect(entry).toHaveProperty("outcome");
    });
  });
});
