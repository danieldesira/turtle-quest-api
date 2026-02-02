import { createMiddleware } from "hono/factory";
import { decode, verify } from "hono/jwt";
import { getCookie } from "hono/cookie";

type ContextVariables = {
  playerId: number;
};

export const authMiddleware = createMiddleware<{ Variables: ContextVariables }>(
  async (c, next) => {
    const authorizationCookie = getCookie(c, "Authorization");
    if (!authorizationCookie) {
      return c.json({ message: "Player not authorised" }, 401);
    }

    if (!verify(authorizationCookie, process.env.JWT_SECRET!, "HS256")) {
      return c.json({ message: "Player not authorised" }, 401);
    }

    const { payload } = decode(authorizationCookie);

    if (!payload || !payload.id) {
      return c.json({ message: "Player not authorised" }, 401);
    }

    c.set("playerId", Number(payload.id));
    await next();
  },
);

export const camelCaseMiddleware = createMiddleware(async (c, next) => {
  await next();

  const response = await c.res.json();
  const transformedResponseData: Record<string, unknown> =
    convertObjectKeysToCamelCase(response);

  c.res = new Response(JSON.stringify(transformedResponseData), {
    headers: c.res.headers,
    status: c.res.status,
  });
});

const convertKeyToCamelCase = (key: string) =>
  key
    .split("_")
    .map((part, index) =>
      index
        ? `${part[0].toUpperCase()}${part.substring(1)}`
        : `${part[0].toLowerCase()}${part.substring(1)}`,
    )
    .join("");

const convertObjectKeysToCamelCase = (data: Record<string, unknown>) => {
  if (Array.isArray(data)) {
    for (let count = 0; count < data.length; count++) {
      data[count] = convertCurrentValue(data[count]);
    }
    return data;
  } else {
    const transformedData: Record<string, unknown> = {};
    for (const key in data) {
      transformedData[convertKeyToCamelCase(key)] = convertCurrentValue(
        data[key],
      );
    }
    return transformedData;
  }
};

const convertCurrentValue = (value: unknown) =>
  typeof value === "object" && value !== null
    ? convertObjectKeysToCamelCase(value as Record<string, unknown>)
    : value;
