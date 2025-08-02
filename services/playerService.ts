import { Prisma } from "@prisma/client";
import prisma from "../prismaInstance";
import { convertBase64ToBytes } from "../utils/files";

export interface Player {
  name: string;
  date_of_birth: string;
  profile_pic: string;
}

export const updateJsonField = async (
  playerId: number,
  fieldName: string,
  value: object
) =>
  await prisma.players.update({
    where: { id: playerId },
    data: { [fieldName]: JSON.stringify(value) },
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
  { name, date_of_birth, profile_pic }: Player
) =>
  await prisma.players.update({
    where: { id: playerId },
    data: {
      name,
      date_of_birth: new Date(date_of_birth),
      profile_pic: convertBase64ToBytes(profile_pic),
    },
  });

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
