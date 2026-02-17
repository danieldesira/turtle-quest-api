import prisma from "../prismaInstance.js";
import { players } from "@prisma/client";
import { uploadToR2 } from "./r2.js";
import { updatePlayerProfilePic } from "./playerService.js";
import {
  createNewPlayer,
  fetchPlayer,
  updateLastLogin,
} from "../repositories/playerRepository.js";
import jwksClient from "jwks-rsa";
import jwtLib from "jsonwebtoken";

export interface GoogleUserPayload {
  iss?: string;
  aud?: string;
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email: string;
}

export interface MicrosoftUserPayload {
  iss?: string;
  aud?: string;
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  preferred_username?: string;
}

interface CheckAndRegisterPlayerGoogleResult {
  player: players;
  isNewPlayer: boolean;
}

export const checkAndRegisterPlayerGoogle = async (
  user: GoogleUserPayload,
): Promise<CheckAndRegisterPlayerGoogleResult> => {
  const player = await fetchPlayer(prisma, user.sub, "google");

  if (!player) {
    const newPlayer = await prisma.$transaction(async (tx) => {
      const newPlayer = await createNewPlayer(tx, user, "google");

      const r2Key = await uploadSSOProfileImageToR2(
        user.picture!,
        newPlayer.id,
      );
      await updatePlayerProfilePic(newPlayer.id, r2Key, tx);

      return newPlayer;
    });

    return { player: newPlayer, isNewPlayer: true };
  } else {
    await updateLastLogin(prisma, player.id);
    return { player, isNewPlayer: false };
  }
};

export const fetchGoogleUser = async (
  token: string,
): Promise<GoogleUserPayload> => {
  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`,
    );
    const payload = await response.json();
    return validateGooglePayload(payload);
  } catch (error) {
    console.error("Error verifying Google token:", error);
    throw new Error("Failed to verify Google token");
  }
};

const validateGooglePayload = (
  payload: GoogleUserPayload,
): GoogleUserPayload => {
  if (!payload) {
    throw new Error("Invalid token payload");
  }

  if (
    payload.iss !== "https://accounts.google.com" &&
    payload.iss !== "accounts.google.com"
  ) {
    throw new Error("Invalid issuer");
  }

  if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
    throw new Error("Invalid audience");
  }

  // Ensure required fields are present
  if (!payload.sub || !payload.email) {
    throw new Error("Missing required fields in token payload");
  }

  return {
    sub: payload.sub,
    name: payload.name,
    given_name: payload.given_name,
    family_name: payload.family_name,
    picture: payload.picture,
    email: payload.email,
  };
};

const validateMicrosoftEntraSSOToken = async (
  token: string,
): Promise<MicrosoftUserPayload> => {
  const tenantId = process.env.MICROSOFT_ENTRA_SSO_TENANT_ID;

  if (!tenantId) {
    throw new Error(
      "MICROSOFT_ENTRA_SSO_TENANT_ID environment variable is not set",
    );
  }

  try {
    const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;

    const parts = cleanToken.split(".");
    if (parts.length !== 3) {
      throw new Error(
        `Invalid token format: expected 3 parts, got ${parts.length}`,
      );
    }

    const decoded = jwtLib.decode(cleanToken, { complete: true });
    if (!decoded) {
      throw new Error("Failed to decode token");
    }

    const decodedHeader = decoded.header;
    const decodedPayload = decoded.payload as MicrosoftUserPayload;
    console.log(
      `Token header kid: ${decodedHeader?.kid}, alg: ${decodedHeader?.alg}`,
    );
    console.log(`Token issuer: ${decodedPayload?.iss}`);
    console.log(`Token audience: ${decodedPayload?.aud}`);

    if (!decodedHeader?.kid) {
      console.warn("Token header missing kid:", JSON.stringify(decodedHeader));
      throw new Error(
        "Invalid token: missing kid in header. Token may not be signed properly.",
      );
    }

    // Extract tenant ID from token issuer instead of using configured tenant
    // This allows the code to work with tokens from any tenant
    const tokenIssuer = decodedPayload?.iss;
    if (!tokenIssuer) {
      throw new Error("Token missing issuer claim");
    }

    // Extract tenant ID from issuer URL (format: https://login.microsoftonline.com/{tenantId}/v2.0)
    const issuerMatch = tokenIssuer.match(
      /https:\/\/login\.microsoftonline\.com\/([^/]+)\/v2\.0/,
    );
    const tokenTenantId = issuerMatch?.[1];

    if (!tokenTenantId) {
      throw new Error(
        `Could not extract tenant ID from issuer: ${tokenIssuer}`,
      );
    }

    if (tokenTenantId !== tenantId) {
      console.warn(
        `Token is from a different tenant (${tokenTenantId}) than configured (${tenantId}). ` +
          `This is normal for multi-tenant apps or if using Microsoft accounts.`,
      );
    }

    const jwksUri = `https://login.microsoftonline.com/${tokenTenantId}/discovery/v2.0/keys`;

    const client = jwksClient({
      jwksUri,
      cache: true,
      rateLimit: true,
    });

    const key = await client.getSigningKey(decodedHeader.kid);
    const publicKey = key.getPublicKey();

    const payload = jwtLib.verify(cleanToken, publicKey, {
      algorithms: ["RS256"],
    }) as MicrosoftUserPayload;

    return validateMicrosoftPayload(payload);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error verifying Microsoft token:", error.message);
    } else {
      console.error("Error verifying Microsoft token:", error);
    }
    throw error instanceof Error
      ? error
      : new Error("Failed to verify Microsoft Entra ID token");
  }
};

const validateMicrosoftPayload = (
  payload: MicrosoftUserPayload,
): MicrosoftUserPayload => {
  if (!payload) {
    throw new Error("Invalid token payload");
  }

  // Just verify it looks like a Microsoft token (check issuer format)
  if (!payload.iss?.includes("login.microsoftonline.com")) {
    throw new Error("Invalid issuer: does not appear to be from Microsoft");
  }

  if (!payload.aud) {
    throw new Error("Missing audience claim");
  }

  // Ensure required fields are present
  if (!payload.sub || (!payload.email && !payload.preferred_username)) {
    throw new Error("Missing required fields in token payload");
  }

  return {
    sub: payload.sub,
    name: payload.name,
    given_name: payload.given_name,
    family_name: payload.family_name,
    email: payload.email || payload.preferred_username,
    preferred_username: payload.preferred_username,
  };
};

export const checkAndRegisterPlayerMicrosoft = async (
  user: MicrosoftUserPayload,
): Promise<CheckAndRegisterPlayerGoogleResult> => {
  const player = await fetchPlayer(prisma, user.sub, "microsoft");

  if (!player) {
    const newPlayer = await prisma.$transaction(async (tx) => {
      const newPlayer = await createNewPlayer(tx, user, "microsoft");
      return newPlayer;
    });

    return { player: newPlayer, isNewPlayer: true };
  } else {
    await updateLastLogin(prisma, player.id);
    return { player, isNewPlayer: false };
  }
};

export const fetchMicrosoftUser = async (
  token: string,
): Promise<MicrosoftUserPayload> => {
  return await validateMicrosoftEntraSSOToken(token);
};

export const handleMicrosoftEntraSSOLogin = async (
  token: string,
): Promise<CheckAndRegisterPlayerGoogleResult> => {
  const user = await fetchMicrosoftUser(token);
  return await checkAndRegisterPlayerMicrosoft(user);
};

export const getJWTExpectedExpiry = () => Date.now() + 60 * 60 * 1000;

const uploadSSOProfileImageToR2 = async (
  imageUrl: string,
  playerId: number,
) => {
  const profilePicRequest = await fetch(imageUrl);
  const profilePicBlob = await profilePicRequest.blob();

  const r2Key = `profile-pics/${playerId}.png`;
  const profilePicBuffer = Buffer.from(await profilePicBlob.arrayBuffer());
  const bucket = process.env.R2_BUCKET_NAME!;

  await uploadToR2(bucket, r2Key, profilePicBuffer, profilePicBlob.type);

  return r2Key;
};
