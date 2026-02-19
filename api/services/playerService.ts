import { Prisma } from "@prisma/client";
import prisma from "../prismaInstance.js";
import { UpdateLastGamePayload, UpdatePlayerPayload } from "../types.js";
import {
  fetchLastGameTimestamp,
  fetchProfilePicKey,
  nullifyLastGame,
  updateLastGameEntry,
  updatePlayerEntry,
  updateProfilePicKey,
} from "../repositories/playerRepository.js";

export const updateLastGame = async (
  playerId: number,
  { timestamp, lastGame }: UpdateLastGamePayload,
) => {
  const actualLastGameDate = (await fetchLastGameTimestamp(prisma, playerId))
    ?.last_game_saved_on;

  if (
    !actualLastGameDate ||
    new Date(actualLastGameDate).getTime() < timestamp
  ) {
    await updateLastGameEntry(prisma, playerId, { timestamp, lastGame });
  } else {
    throw new Error("Provided timestamp is older than the current last game.");
  }
};

export const updatePlayer = async (
  playerId: number,
  playerDetails: UpdatePlayerPayload,
) => await updatePlayerEntry(prisma, playerId, playerDetails);

export const updatePlayerProfilePic = async (
  playerId: number,
  profilePicUrl: string,
  transaction: Prisma.TransactionClient | null = null,
) => {
  const dbClient = transaction ? transaction : prisma;
  await updateProfilePicKey(dbClient, playerId, profilePicUrl);
};

export const deleteLastGame = async (playerId: number) =>
  await nullifyLastGame(prisma, playerId);

export const getProfilePicKey = async (playerId: number) =>
  (await fetchProfilePicKey(prisma, playerId))?.profile_pic_r2_key;
