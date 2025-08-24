import { Prisma } from "@prisma/client";
import prisma from "../prismaInstance.js";

export interface Player {
  name: string;
  date_of_birth: string;
}

export const updateSettings = (playerId: number, value: object) =>
  prisma.players.update({
    where: { id: playerId },
    data: { settings: value },
  });

export const updateLastGame = async (
  playerId: number,
  lastGame: object,
  timestamp: number
) => {
  const actualLastGameDate = (
    await prisma.players.findFirst({
      where: { id: playerId },
      select: { last_game_saved_on: true },
    })
  )?.last_game_saved_on;

  if (actualLastGameDate) {
    const actualLastGameTimestamp = new Date(actualLastGameDate).getTime();
    if (actualLastGameTimestamp < timestamp) {
      await prisma.players.update({
        where: { id: playerId },
        data: {
          last_game: JSON.stringify(lastGame),
          last_game_saved_on: new Date(timestamp),
        },
      });
    }
  }
};

export const updatePlayer = async (
  playerId: number,
  { name, date_of_birth }: Player
) =>
  await prisma.players.update({
    where: { id: playerId },
    data: {
      name,
      date_of_birth: new Date(date_of_birth),
    },
  });

export const updatePlayerProfilePic = async (
  playerId: number,
  profilePicUrl: string,
  transaction: Prisma.TransactionClient | null = null
) => {
  const dbClient = transaction ? transaction : prisma;
  await dbClient.players.update({
    where: { id: playerId },
    data: { profile_pic_r2_key: profilePicUrl },
  });
};

export const getLastGame = async (playerId: number) =>
  await prisma.players.findFirst({
    where: { id: playerId },
    select: { last_game: true },
  });

export const deleteLastGame = async (playerId: number) =>
  await prisma.players.update({
    where: { id: playerId },
    data: {
      last_game: Prisma.NullableJsonNullValueInput.DbNull,
      last_game_saved_on: null,
    },
  });

export const getProfilePicKey = async (playerId: number) =>
  (
    await prisma.players.findFirst({
      where: { id: playerId },
      select: { profile_pic_r2_key: true },
    })
  )?.profile_pic_r2_key;
