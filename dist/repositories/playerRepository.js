import { Prisma } from "@prisma/client";
export const updatePlayerEntry = async (dbClient, playerId, { name, date_of_birth, settings }) => await dbClient.players.update({
    where: { id: playerId },
    data: {
        name,
        date_of_birth: new Date(date_of_birth),
        settings,
    },
});
export const fetchProfilePicKey = async (dbClient, playerId) => await dbClient.players.findFirst({
    where: { id: playerId },
    select: { profile_pic_r2_key: true },
});
export const fetchLastGame = async (dbClient, playerId) => await dbClient.players.findFirst({
    where: { id: playerId },
    select: { last_game: true },
});
export const nullifyLastGame = async (dbClient, playerId) => await dbClient.players.update({
    where: { id: playerId },
    data: {
        last_game: Prisma.NullableJsonNullValueInput.DbNull,
        last_game_saved_on: null,
    },
});
export const fetchLastGameTimestamp = async (dbClient, playerId) => await dbClient.players.findFirst({
    where: { id: playerId },
    select: { last_game_saved_on: true },
});
export const updateLastGameEntry = async (dbClient, playerId, { timestamp, lastGame }) => await dbClient.players.update({
    where: { id: playerId },
    data: {
        last_game: lastGame,
        last_game_saved_on: new Date(timestamp),
    },
});
export const updateProfilePicKey = async (dbClient, playerId, profilePicKey) => await dbClient.players.update({
    where: { id: playerId },
    data: { profile_pic_r2_key: profilePicKey },
});
export const fetchPlayer = async (dbClient, externalId, ssoService) => await dbClient.players.findFirst({
    where: { external_id: externalId, platform: ssoService },
});
export const createNewPlayer = async (dbClient, { sub, email, name }) => await dbClient.players.create({
    data: {
        external_id: sub,
        platform: "google",
        email: email,
        name: name,
        last_login_at: new Date(),
        created_at: new Date(),
        date_of_birth: null,
        settings: { controlPosition: "Right" },
    },
});
export const updateLastLogin = async (dbClient, playerId) => await dbClient.players.update({
    where: { id: playerId },
    data: { last_login_at: new Date() },
});
