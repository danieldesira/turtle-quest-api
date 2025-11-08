import { Prisma } from "@prisma/client";
import { DbClient, UpdateLastGamePayload, UpdatePlayerPayload } from "../types";

export const updatePlayerEntry = async (
  dbClient: DbClient,
  playerId: number,
  { name, date_of_birth, settings }: UpdatePlayerPayload
) =>
  await dbClient.players.update({
    where: { id: playerId },
    data: {
      name,
      date_of_birth: new Date(date_of_birth),
      settings,
    },
  });

export const fetchProfilePicKey = async (
  dbClient: DbClient,
  playerId: number
) =>
  await dbClient.players.findFirst({
    where: { id: playerId },
    select: { profile_pic_r2_key: true },
  });

export const fetchLastGame = async (dbClient: DbClient, playerId: number) =>
  await dbClient.players.findFirst({
    where: { id: playerId },
    select: { last_game: true },
  });

export const nullifyLastGame = async (dbClient: DbClient, playerId: number) =>
  await dbClient.players.update({
    where: { id: playerId },
    data: {
      last_game: Prisma.NullableJsonNullValueInput.DbNull,
      last_game_saved_on: null,
    },
  });

export const fetchLastGameTimestamp = async (
  dbClient: DbClient,
  playerId: number
) =>
  await dbClient.players.findFirst({
    where: { id: playerId },
    select: { last_game_saved_on: true },
  });

export const updateLastGameEntry = async (
  dbClient: DbClient,
  playerId: number,
  { timestamp, lastGame }: UpdateLastGamePayload
) =>
  await dbClient.players.update({
    where: { id: playerId },
    data: {
      last_game: lastGame,
      last_game_saved_on: new Date(timestamp),
    },
  });

export const updateProfilePicKey = async (
  dbClient: DbClient,
  playerId: number,
  profilePicKey: string
) =>
  await dbClient.players.update({
    where: { id: playerId },
    data: { profile_pic_r2_key: profilePicKey },
  });

export const fetchPlayer = async (
  dbClient: DbClient,
  externalId: string,
  ssoService: string
) =>
  await dbClient.players.findFirst({
    where: { external_id: externalId, platform: ssoService },
  });
