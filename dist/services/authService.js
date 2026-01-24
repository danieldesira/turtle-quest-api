import prisma from "../prismaInstance.js";
import { uploadToR2 } from "./r2.js";
import { updatePlayerProfilePic } from "./playerService.js";
import { createNewPlayer, fetchPlayer, updateLastLogin, } from "../repositories/playerRepository.js";
export const checkAndRegisterPlayerGoogle = async (user) => {
    const player = await fetchPlayer(prisma, user.sub, "google");
    if (!player) {
        const newPlayer = await prisma.$transaction(async (tx) => {
            const newPlayer = await createNewPlayer(tx, user);
            const r2Key = await uploadSSOProfileImageToR2(user.picture, newPlayer.id);
            await updatePlayerProfilePic(newPlayer.id, r2Key, tx);
            return newPlayer;
        });
        return { player: newPlayer, isNewPlayer: true };
    }
    else {
        await updateLastLogin(prisma, player.id);
        return { player, isNewPlayer: false };
    }
};
export const fetchGoogleUser = async (token) => {
    try {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${token}`);
        if (!response.ok) {
            const idTokenResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
            if (!idTokenResponse.ok) {
                throw new Error(`Failed to verify token: ${idTokenResponse.statusText}`);
            }
            const payload = await idTokenResponse.json();
            return validateGooglePayload(payload);
        }
        const payload = await response.json();
        return validateGooglePayload(payload);
    }
    catch (error) {
        console.error("Error verifying Google token:", error);
        throw new Error("Failed to verify Google token");
    }
};
const validateGooglePayload = (payload) => {
    if (!payload) {
        throw new Error("Invalid token payload");
    }
    if (payload.iss !== "https://accounts.google.com" &&
        payload.iss !== "accounts.google.com") {
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
export const getJWTExpectedExpiry = () => Date.now() + 60 * 60 * 1000;
const uploadSSOProfileImageToR2 = async (imageUrl, playerId) => {
    const profilePicRequest = await fetch(imageUrl);
    const profilePicBlob = await profilePicRequest.blob();
    const r2Key = `profile-pics/${playerId}.png`;
    const profilePicBuffer = Buffer.from(await profilePicBlob.arrayBuffer());
    const bucket = process.env.R2_BUCKET_NAME;
    await uploadToR2(bucket, r2Key, profilePicBuffer, profilePicBlob.type);
    return r2Key;
};
