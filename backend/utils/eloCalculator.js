const K = 32;

// Original two-player Elo; kept for reference and direct 1v1 use
export const calculateNewElo = (ratingA, ratingB, scoreA) => {
    const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    const expectedB = 1 - expectedA;
    const scoreB = 1 - scoreA;
    return {
        newRatingA: Math.round(ratingA + K * (scoreA - expectedA)),
        newRatingB: Math.round(ratingB + K * (scoreB - expectedB))
    };
};

// Multi-player Elo: run pairwise comparisons for every pair of players.
// The winner (winnerIndex) gets score 1 against every other player;
// all others get score 0 against the winner and 0.5 against each other.
// Returns an array of new ratings in the same order as the input.
export const calculateNewEloMultiplayer = (ratings, winnerIndex) => {
    const n = ratings.length;
    const deltas = new Array(n).fill(0);

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const expected_i = 1 / (1 + Math.pow(10, (ratings[j] - ratings[i]) / 400));
            const expected_j = 1 - expected_i;

            let score_i, score_j;
            if (i === winnerIndex) {
                score_i = 1; score_j = 0;
            } else if (j === winnerIndex) {
                score_i = 0; score_j = 1;
            } else {
                // Neither is the winner; treat as a draw between non-winners
                score_i = 0.5; score_j = 0.5;
            }

            deltas[i] += K * (score_i - expected_i);
            deltas[j] += K * (score_j - expected_j);
        }
    }

    return ratings.map((r, i) => Math.round(r + deltas[i]));
};
