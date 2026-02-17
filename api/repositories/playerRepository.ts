import { Prisma } from "@prisma/client";
import { DbClient, UpdateLastGamePayload, UpdatePlayerPayload } from "../types";
import {
  GoogleUserPayload,
  MicrosoftUserPayload,
} from "../services/authService";

export const updatePlayerEntry = async (
  dbClient: DbClient,
  playerId: number,
  { name, dateOfBirth, settings }: UpdatePlayerPayload,
) =>
  await dbClient.players.update({
    where: { id: playerId },
    data: {
      name,
      date_of_birth: dateOfBirth ? new Date(dateOfBirth) : null,
      settings,
    },
  });

export const fetchProfilePicKey = async (
  dbClient: DbClient,
  playerId: number,
) =>
  await dbClient.players.findFirst({
    where: { id: playerId },
    select: { profile_pic_r2_key: true },
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
  playerId: number,
) =>
  await dbClient.players.findFirst({
    where: { id: playerId },
    select: { last_game_saved_on: true },
  });

export const updateLastGameEntry = async (
  dbClient: DbClient,
  playerId: number,
  { timestamp, lastGame }: UpdateLastGamePayload,
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
  profilePicKey: string,
) =>
  await dbClient.players.update({
    where: { id: playerId },
    data: { profile_pic_r2_key: profilePicKey },
  });

export const fetchPlayer = async (
  dbClient: DbClient,
  externalId: string,
  ssoService: string,
) =>
  await dbClient.players.findFirst({
    where: { external_id: externalId, sso_provider: ssoService },
  });

export const createNewPlayer = async (
  dbClient: DbClient,
  { sub, email, name }: GoogleUserPayload | MicrosoftUserPayload,
  provider: "google" | "microsoft",
) =>
  await dbClient.players.create({
    data: {
      external_id: sub,
      sso_provider: provider,
      email: email!,
      name: name,
      last_login_at: new Date(),
      created_at: new Date(),
      date_of_birth: null,
      settings: { controlPosition: "Right", audioVolume: 0.5 },
    },
  });

export const updateLastLogin = async (dbClient: DbClient, playerId: number) =>
  await dbClient.players.update({
    where: { id: playerId },
    data: { last_login_at: new Date() },
  });
