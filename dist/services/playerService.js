import prisma from "../prismaInstance.js";
import { fetchLastGame, fetchLastGameTimestamp, fetchProfilePicKey, nullifyLastGame, updateLastGameEntry, updatePlayerEntry, updateProfilePicKey, } from "../repositories/playerRepository.js";
export const updateLastGame = async (playerId, { timestamp, lastGame }) => {
    const actualLastGameDate = (await fetchLastGameTimestamp(prisma, playerId))
        ?.last_game_saved_on;
    if (!actualLastGameDate ||
        new Date(actualLastGameDate).getTime() < timestamp) {
        await updateLastGameEntry(prisma, playerId, { timestamp, lastGame });
    }
};
export const updatePlayer = async (playerId, playerDetails) => await updatePlayerEntry(prisma, playerId, playerDetails);
export const updatePlayerProfilePic = async (playerId, profilePicUrl, transaction = null) => {
    const dbClient = transaction ? transaction : prisma;
    await updateProfilePicKey(dbClient, playerId, profilePicUrl);
};
export const getLastGame = async (playerId) => await fetchLastGame(prisma, playerId);
export const deleteLastGame = async (playerId, transaction = null) => {
    const dbClient = transaction ? transaction : prisma;
    await nullifyLastGame(dbClient, playerId);
};
export const getProfilePicKey = async (playerId) => (await fetchProfilePicKey(prisma, playerId))?.profile_pic_r2_key;
