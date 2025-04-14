import { getPrismaInstance } from "../prismaInstance";

export interface Player {
  name: string;
  dob: string;
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

export const updatePlayer = async (playerId: number, { name, dob }: Player) => {
  const prisma = getPrismaInstance();
  await prisma.players.update({
    where: { id: playerId },
    data: { name, date_of_birth: new Date(dob) },
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
    data: { last_game: {} },
  });
};
