import { Prisma } from "@prisma/client";
import prisma from "../prismaInstance.js";
import { UpdateLastGamePayload, UpdatePlayerPayload } from "../types.js";
import {
  fetchLastGame,
  fetchLastGameTimestamp,
  fetchProfilePicKey,
  nullifyLastGame,
  updateLastGameEntry,
  updatePlayerEntry,
  updateProfilePicKey,
} from "../repositories/playerRepository.js";

export const updateLastGame = async (
  playerId: number,
  { timestamp, lastGame }: UpdateLastGamePayload
) => {
  const actualLastGameDate = (await fetchLastGameTimestamp(prisma, playerId))
    ?.last_game_saved_on;

  if (
    !actualLastGameDate ||
    new Date(actualLastGameDate).getTime() < timestamp
  ) {
    await updateLastGameEntry(prisma, playerId, { timestamp, lastGame });
  }
};

export const updatePlayer = async (
  playerId: number,
  playerDetails: UpdatePlayerPayload
) => await updatePlayerEntry(prisma, playerId, playerDetails);

export const updatePlayerProfilePic = async (
  playerId: number,
  profilePicUrl: string,
  transaction: Prisma.TransactionClient | null = null
) => {
  const dbClient = transaction ? transaction : prisma;
  await updateProfilePicKey(dbClient, playerId, profilePicUrl);
};

export const getLastGame = async (playerId: number) =>
  await fetchLastGame(prisma, playerId);

export const deleteLastGame = async (
  playerId: number,
  transaction: Prisma.TransactionClient | null = null
) => {
  const dbClient = transaction ? transaction : prisma;
  await nullifyLastGame(dbClient, playerId);
};

export const getProfilePicKey = async (playerId: number) =>
  (await fetchProfilePicKey(prisma, playerId))?.profile_pic_r2_key;
