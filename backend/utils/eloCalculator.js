
/**
 * Calculate new ELO rating for two players
 * @param {number} ratingA - Current rating player 1
 * @param {number} ratingB - Same for player 2
 * @param {number} scoreA - 1 if A wins, 0.5 for tie, 0 if B wins
 * @returns {object} { newRatingA, newRatingB }
 */ 

export const calculateNewElo = (ratingA, ratingB, scoreA) => {
    const K = 32; // Decides how much rating changes per match

    // Calculate expected score for both players
    // expectedA: probability for player 1's victory (0 to 1)
    // If rating difference is 400, it is expected that the strongest will win ~90% of the time
    const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    const expectedB = 1 - expectedA;

    const scoreB = 1 - scoreA;

    // New rating = old rating + K * (actual score - expected score)
    const newRatingA = Math.round(ratingA + K * (scoreA - expectedA));
    const newRatingB = Math.round(ratingB + K * (scoreB - expectedB));

    return { newRatingA, newRatingB };
};