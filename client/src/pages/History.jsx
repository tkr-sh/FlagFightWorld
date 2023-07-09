import { useState,  useEffect } from "react";
import "../style/History.scss"
import useAuth from '../hooks/useAuth';
import PageSearch from "../components/ui/PageSearch";
import userimg from '../assets/img/user.png';
import capitalize from "../utils/Capitalize";
import { useTranslation } from "react-i18next";


const History = () => {
    // Hooks
    /// States
    const [page, setPage] = useState(1);
    const [nbPage, setNbPage] = useState(1);
    const [games, setGames] = useState([]);
    /// Auth
    const {token, authFetch} = useAuth();
    /// Translation
    const { t, i18n } = useTranslation();



    useEffect(() => {
        if (page) {
            authFetch(`http://localhost:5000/api/v1/games?page=${page}`)
            .then(rep => {
                // setGames(rep);
                setGames(rep.games);
                setNbPage(rep.page);
            });
        }
    }, [page]);


    return (
        <div className="History">
            <main>
                {
                    games.map(game => {
                        const {players, type, turn} = game;
                        const tie = players[1].correct === players[0].correct;

                        return (
                        <div className="game">
                            <div className="left" style={{backgroundColor: tie ? "#888" : players[0].correct ? "#3C3" : "#C33"}}>
                                <img src={players[0].pfp ?? userimg} className="pfp"/>
                                <div>
                                    <h1>
                                        {players[0].name}
                                    </h1>
                                    {t("ELO")}: {players[0].elo}
                                </div>
                            </div>
                            <div className="right" style={{backgroundColor: tie ? "#888" : players[1].correct ? "#3C3" : "#C33"}}>
                                <div>
                                    <h1>
                                        {players[1].name}
                                    </h1>
                                    {t("ELO")}: {players[1].elo}
                                </div>
                                <img src={players[1].pfp ?? userimg} className="pfp"/>
                            </div>

                            <div className="more-info">
                                <span>
                                    <b>{t('Type')}:</b> {t(capitalize(type ?? ""))}
                                </span>
                                <span>
                                    <b>{t('Winner')}:</b> {tie ? t("Nobody") : players[0].correct ? players[0].name : players[1].name}
                                </span>
                                <span>
                                    <b>{t('Turn')}:</b> {turn}/{Math.max(40, turn)}
                                </span>
                            </div>
                        </div>)
                    })
                }
            </main>
            <PageSearch indexPage={page} nbPage={nbPage} updateParentPage={setPage}/>
        </div>
    );
}
 
export default History;
