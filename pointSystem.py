from math import exp, log, sqrt, ceil



def diff_elo(win: bool, diff: int) -> float:

    """ Returns a bonus based on the difference of ELO of the two players"""

    if (win and diff >= 0) or (diff < 0 and not win) :
        return (1 + abs(diff) / 750) * exp(abs(diff) / 1750)
    else:
        return 1 / ((1 + abs(diff) / 750) * exp(abs(diff) / 1750))



def turns(win: bool, turn: int) -> float:

    """ Returns a coefficient by the amout of turns played """

    if win:
        return turn ** (1/16)
    else:
        return 2 / ( turn ** (1 / sqrt(15)))




def rank(rank: str) -> tuple[float, float]:

    """Return differents coefficients based on the rank of the user

    Arguments:
        rank {str} The rank of the user

    Raises:
        TypeError: When the rank isn't correct

    Returns:
        Tuple of float:
        - A coefficient of trophies lost / won depending on the rank
        - A coefficient that reduce loss of trophie
    """

    match rank:
        case "wood":
            return (84.43, 2)
        case "bronze":
            return (63.33, 1 + 1/2)
        case "silver":
            return (46.44, 1 + 1/4)
        case "platinium":
            return (38.00, 1 + 1/8)
        case "gold":
            return (29.55, 1 + 1/16)
        case "mercury":
            return (21.11, 1 + 1/32)
        case "diamond":
            return (12.66, 1 + 1/64)
        case "uranium":
            return (5.00, 1)
        case _:
            raise TypeError(f"{rank} isn't a valid rank")



def rank_by_elo(elo: int) -> str:

    """ Return the rank of somebody by it's ELO """

    if elo < 600:
        return "wood"
    if elo < 1200:
        return "bronze"
    if elo < 1800:
        return "silver"
    if elo < 2400:
        return "platinium"
    if elo < 3000:
        return "gold"
    if elo < 3600:
        return "mercury"
    if elo < 4000:
        return "diamond"
    return "uranium"




def main_formula(win: bool, turn: int, your_elo: int, other_elo: int) -> int:

    RANK = rank_by_elo(your_elo)
    DIFF_COEF = diff_elo(win, other_elo - your_elo)
    TURN_COEF = turns(win, turn)
    (ELO_COEF, LOSS_COEF) = rank(RANK)

    print(f"{DIFF_COEF=}, {TURN_COEF=}, {ELO_COEF=}, {LOSS_COEF=}")

    if win:
        return DIFF_COEF * TURN_COEF * ELO_COEF
    else:
        return DIFF_COEF * TURN_COEF * ELO_COEF / LOSS_COEF





if __name__ == '__main__':
    print("<=== Low ELO ===>")
    print(main_formula(True, 5, 440, 527))
    print(main_formula(False, 5, 440, 527))
    print(main_formula(True, 5, 527, 440))
    print(main_formula(False, 5, 527, 440))
    print("<=== High ELO ===>")
    print(main_formula(True, 40, 4020, 3895))
    print(main_formula(False, 40, 4020, 3895))
    print(main_formula(True, 40, 3895, 4020))
    print(main_formula(False, 40, 3895, 4020))
    print("<=== High difference of ELO ===>")
    print(main_formula(True, 50, 1000, 3000))
    print(main_formula(False, 50, 3000, 1000))
    print(main_formula(False, 50, 1000, 3000))
    print(main_formula(True, 50, 3000, 1000))