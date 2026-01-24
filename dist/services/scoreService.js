import prisma from "../prismaInstance.js";
import { getR2Url } from "./r2.js";
import { fetchBestScoreByPlayerId, fetchTop10Scores, insertScore, } from "../repositories/scoreRepository.js";
export const saveScore = async (playerId, payload, transaction = null) => {
    const dbClient = transaction ? transaction : prisma;
    await insertScore(dbClient, playerId, payload);
};
export const getHighScores = async () => await fetchTop10Scores(prisma);
export const getPersonalBest = async (playerId) => await fetchBestScoreByPlayerId(prisma, playerId);
export const createProfilePicUrlMapFromHighScores = async (highScores) => {
    const profilePicUrlMap = {};
    for (const score of highScores) {
        if (!profilePicUrlMap[score.players?.profile_pic_r2_key ?? ""]) {
            profilePicUrlMap[score.players?.profile_pic_r2_key ?? ""] =
                await getR2Url(score.players?.profile_pic_r2_key ?? "");
        }
    }
    return profilePicUrlMap;
};
