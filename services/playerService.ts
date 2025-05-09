import { Prisma } from "@prisma/client";
import { getPrismaInstance } from "../prismaInstance";

export interface Player {
  name: string;
  date_of_birth: string;
}

export const updateJsonField = async (
  playerId: number,
  fieldName: string,
  value: object
) => {
  const prisma = getPrismaInstance();
  await prisma.players.update({
    where: { id: playerId },
    data: { [fieldName]: JSON.stringify(value) },
  });
};

export const updatePlayer = async (
  playerId: number,
  { name, date_of_birth }: Player
) => {
  const prisma = getPrismaInstance();
  await prisma.players.update({
    where: { id: playerId },
    data: { name, date_of_birth: new Date(date_of_birth) },
  });
};

export const getLastGame = async (playerId: number) => {
  const prisma = getPrismaInstance();
  return await prisma.players.findFirst({
    where: { id: playerId },
    select: { last_game: true },
  });
};

export const deleteLastGame = async (playerId: number) => {
  const prisma = getPrismaInstance();
  await prisma.players.update({
    where: { id: playerId },
    data: { last_game: Prisma.NullableJsonNullValueInput.DbNull },
  });
};
