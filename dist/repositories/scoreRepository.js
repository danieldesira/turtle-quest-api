export const insertScore = async (dbClient, playerId, { hasWon, level, points }) => await dbClient.scores.create({
    data: {
        player_id: playerId,
        outcome_id: hasWon ? 2 : 1,
        points: points,
        level: level,
        created_at: new Date(),
    },
});
export const fetchTop10Scores = async (dbClient) => await dbClient.scores.findMany({
    take: 10,
    orderBy: {
        points: "desc",
    },
    select: {
        points: true,
        level: true,
        created_at: true,
        players: {
            select: {
                name: true,
                profile_pic_r2_key: true,
            },
        },
        outcomes: {
            select: {
                desc: true,
            },
        },
    },
});
export const fetchBestScoreByPlayerId = async (dbClient, playerId) => await dbClient.scores.findFirst({
    where: { player_id: playerId },
    orderBy: [{ points: "desc" }, { level: "desc" }, { outcome_id: "desc" }],
    select: {
        points: true,
        level: true,
        outcomes: {
            select: {
                desc: true,
            },
        },
    },
});
