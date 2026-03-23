import prisma from "../prismaInstance.js";
import { players } from "@prisma/client";
import { uploadToR2 } from "./r2.js";
import { updatePlayerProfilePic } from "./playerService.js";
import {
  createNewPlayer,
  fetchPlayer,
  updateLastLogin,
} from "../repositories/playerRepository.js";
import * as jose from "jose";

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
  tid?: string;
}

export interface FacebookUserPayload {
  id: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  name_format?: string;
  short_name?: string;
  name?: string;
  picture?: {
    data: {
      height: number;
      width: number;
      is_silhouette: boolean;
      url: string;
    };
  };
  email?: string;
}

interface CheckAndRegisterPlayerGoogleResult {
  player: players;
  isNewPlayer: boolean;
}

const checkAndRegisterPlayerGoogle = async (
  user: GoogleUserPayload,
): Promise<CheckAndRegisterPlayerGoogleResult> => {
  const player = await fetchPlayer(prisma, user.sub, "google");

  if (!player) {
    const newPlayer = await prisma.$transaction(async (tx) => {
      const newPlayer = await createNewPlayer(tx, {
        externalId: user.sub,
        ssoProvider: "google",
        name: user.name!,
        email: user.email,
      });

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

const fetchGoogleUser = async (token: string): Promise<GoogleUserPayload> => {
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

const validateAndDecodeJwtBearer = (token: string) => {
  const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;

  const parts = cleanToken.split(".");
  if (parts.length !== 3) {
    throw new Error(
      `Invalid token format: expected 3 parts, got ${parts.length}`,
    );
  }

  const decoded = jose.decodeJwt(cleanToken);
  if (!decoded) {
    throw new Error("Failed to decode token");
  }

  return { cleanToken, decoded };
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
    const { cleanToken, decoded } = validateAndDecodeJwtBearer(token);

    const jwksUri = `https://login.microsoftonline.com/${(decoded as MicrosoftUserPayload).tid}/discovery/v2.0/keys`;

    const payload = (await verifyJwtToken(
      cleanToken,
      decoded,
      jwksUri,
    )) as MicrosoftUserPayload;

    return validateMicrosoftPayload(payload);
  } catch (error) {
    console.error("Error verifying Microsoft token:", { error });
    throw new Error("Failed to verify Microsoft Entra ID token");
  }
};

const verifyJwtToken = async (
  token: string,
  decodedPayload: jose.JWTPayload,
  jwksUri: string,
) => {
  const JWKS = jose.createRemoteJWKSet(new URL(jwksUri));
  const { payload } = await jose.jwtVerify(token, JWKS, {
    issuer: decodedPayload.iss,
    audience: decodedPayload.aud,
  });
  return payload;
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

const checkAndRegisterPlayerMicrosoft = async (
  user: MicrosoftUserPayload,
): Promise<CheckAndRegisterPlayerGoogleResult> => {
  const player = await fetchPlayer(prisma, user.sub, "microsoft");

  if (!player) {
    const newPlayer = await prisma.$transaction(async (tx) => {
      const newPlayer = await createNewPlayer(tx, {
        name: user.name!,
        email: user.email!,
        externalId: user.sub,
        ssoProvider: "microsoft",
      });
      return newPlayer;
    });

    return { player: newPlayer, isNewPlayer: true };
  } else {
    await updateLastLogin(prisma, player.id);
    return { player, isNewPlayer: false };
  }
};

export const handleMicrosoftEntraSSOLogin = async (
  token: string,
): Promise<CheckAndRegisterPlayerGoogleResult> => {
  const user = await validateMicrosoftEntraSSOToken(token);
  return await checkAndRegisterPlayerMicrosoft(user);
};

export const handleGoogleSSOLogin = async (token: string) => {
  const user = await fetchGoogleUser(token);
  return await checkAndRegisterPlayerGoogle(user);
};

const fetchFacebookUser = async (
  token: string,
): Promise<FacebookUserPayload> => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v25.0/me?access_token=${token}&fields=id%2Cname%2Cbirthday%2Cemail%2Cpicture`,
    );
    return await response.json();
  } catch (error) {
    console.error("Error verifying Facebook token:", error);
    throw new Error("Failed to verify Facebook token");
  }
};

const checkAndRegisterPlayerFacebook = async (
  user: FacebookUserPayload,
): Promise<CheckAndRegisterPlayerGoogleResult> => {
  const player = await fetchPlayer(prisma, user.id, "facebook");

  if (!player) {
    const newPlayer = await prisma.$transaction(async (tx) => {
      const newPlayer = await createNewPlayer(tx, {
        externalId: user.id,
        ssoProvider: "facebook",
        email: user.email!,
        name: user.name!,
      });

      if (user.picture) {
        const r2Key = await uploadSSOProfileImageToR2(
          user.picture.data.url,
          newPlayer.id,
        );
        await updatePlayerProfilePic(newPlayer.id, r2Key, tx);
      }

      return newPlayer;
    });

    return { player: newPlayer, isNewPlayer: true };
  } else {
    await updateLastLogin(prisma, player.id);
    return { player, isNewPlayer: false };
  }
};

export const handleFacebookSSOLogin = async (token: string) => {
  const user = await fetchFacebookUser(token);
  return await checkAndRegisterPlayerFacebook(user);
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
