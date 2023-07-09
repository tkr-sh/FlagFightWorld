export const diffElo = (win, diff) => {
    if ((win && diff >= 0) || (diff < 0 && !win)) {
        return (1 + Math.abs(diff) / 750) * Math.exp(Math.abs(diff) / 1750);
    } else {
        return 1 / ((1 + Math.abs(diff) / 750) * Math.exp(Math.abs(diff) / 1750));
    }
};
    
export const turns = (win, turn) => {
    if (win) {
        return Math.pow(turn, 1/16);
    } else {
        return 2 / (Math.pow(turn, 1 / Math.sqrt(15)));
    }
};


export const rank = (rank) => {
    switch (rank) {
        case "wood":
            return [84.43, 4];
        case "bronze":
            return [63.33, 1 + 2];
        case "silver":
            return [46.44, 1 + 1];
        case "platinium":
            return [38.00, 1 + 1/2];
        case "gold":
            return [29.55, 1 + 1/4];
        case "mercury":
            return [21.11, 1 + 1/8];
        case "diamond":
            return [12.66, 1 + 1/16];
        case "uranium":
            return [5.00, 1];
        default:
            throw new TypeError(`${rank} isn't a valid rank`);
    }
};

const ranks = ["wood", "bronze", "silver", "platinium", "gold", "mercury", "diamond", "uranium"]
export default ranks;



export const rankByElo = (elo) => {
    if (elo < 600) return "wood";
    if (elo < 1200) return "bronze";
    if (elo < 1800) return "silver";
    if (elo < 2400) return "platinium";
    if (elo < 3000) return "gold";
    if (elo < 3600) return "mercury";
    if (elo < 4000) return "diamond";
    return "uranium";
};

export const mainFormula = (win, turn, your_elo, other_elo) => {
    const RANK = rankByElo(your_elo);
    const DIFF_COEF = diffElo(win, other_elo - your_elo);
    const TURN_COEF = turns(win, turn);
    const [ELO_COEF, LOSS_COEF] = rank(RANK);

    console.log(`DIFF_COEF=${DIFF_COEF}, TURN_COEF=${TURN_COEF}, ELO_COEF=${ELO_COEF}, LOSS_COEF=${LOSS_COEF}`);

    if (win) {
        return Math.ceil(DIFF_COEF * TURN_COEF * ELO_COEF);
    } else {
        return -Math.floor(DIFF_COEF * TURN_COEF * ELO_COEF / LOSS_COEF);
    }
}
