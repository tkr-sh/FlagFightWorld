// import logo from './logo.svg';
import { useState, useLayoutEffect, useEffect, useRef, memo, React } from 'react';
import useScript from '../hooks/useScript';
// IMport button
import HomeButton from '../components/ui/HomeButton';
// import "./style/App.scss"
import sword from '../assets/icons/sword-solid.svg';
import game from '../assets/icons/game-solid.svg';
import practice from '../assets/icons/target-solid.svg';
import trophy from '../assets/icons/trophy-solid.svg';
import collection from '../assets/icons/collection-solid.svg';
import history from '../assets/icons/history-solid.svg';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import capitalize from '../utils/Capitalize';
import { useTranslation } from 'react-i18next';


const Home = () => {
    /// Translation
    const { t, i18n } = useTranslation();
    const ref = useRef(null);
    const [ranking, setRanking] = useState({elo: localStorage.getItem('elo'), rank: "Loading...", league: "Loading..."})
    const [articleCount, setArticleCount] = useState({userFlag: -1, userChat: -1, totalFlag: 0, totalChat: 0})
    const {token, authFetch} = useAuth();

    const rankByElo = (elo) => {
            if (elo < 600) return "wood";
            if (elo < 1200) return "bronze";
            if (elo < 1800) return "silver";
            if (elo < 2400) return "platinium";
            if (elo < 3000) return "gold";
            if (elo < 3600) return "mercury";
            if (elo < 4000) return "diamond";
            return "uranium";
    }

    useEffect(() => {
        authFetch("http://localhost:5000/api/v1/ranking")
        .then(rep => {
            rep.league = capitalize(rankByElo(rep.elo));
            setRanking(() => rep)
        })
        .then(rep => console.log(rep));

        authFetch("http://localhost:5000/api/v1/article-count")
        .then(rep => setArticleCount(rep))
    }, [])

    const responsive = () => {
        if (ref.current) {
            if (window.innerHeight > window.innerWidth * 2.45) {
                ref.current.style.aspectRatio = "2/3.7";
                ref.current.style.height = "auto";
                ref.current.style.width = "NaN";
            } else {
                ref.current.style.aspectRatio = "auto";
                ref.current.style.height = "100%";
                ref.current.style.width = "100%";
                console.log(window.innerHeight, window.innerWidth)
            }
        }
    }

    window.addEventListener('resize', responsive);
    window.addEventListener('load', responsive);




    return (
        <>
            <div className="Home" ref={ref}>
                <HomeButton
                    name="competition"
                    img={sword}
                    txt={t("Ranking")}
                    color="purple"
                    botRight={[t("ELO"), ranking.elo]}
                    botLeft={[t("Rank"), ranking.rank]}
                    topLeft={[t("League"), t(ranking.league)]}
                    link="/game/waiting?type=ranked"
                />
                <HomeButton
                    name="quickgame"
                    img={game}
                    txt={t("Quick Game")}
                    color="green"
                    link="/game/waiting"
                />
                <HomeButton
                    name="practice"
                    img={practice}
                    txt={t("Practice")}
                    color="orange"
                    link="/training"
                />
                <HomeButton
                    name="leaderboard"
                    img={trophy}
                    txt={t("Top")}
                    color="yellow"
                    botRight={[t("ELO"), ranking.elo]}
                    botLeft={[t("Rank"), ranking.rank]}
                    topLeft={[t("League"), t(ranking.league)]}
                    link="/leaderboard"
                />
                <HomeButton
                    name="collection"
                    img={collection}
                    txt={t("Collection")}
                    color="blue"
                    botLeft={[t("Flags"), `${articleCount.userFlag}/${articleCount.totalFlag}`]}
                    topLeft={[t("Messages"), `${articleCount.userChat}/${articleCount.totalChat}`]}
                    link="/collection"
                />
                <HomeButton
                    name="history"
                    img={history}
                    txt={t("History")}
                    color="red"
                    link="/history"    
                />
            </div>
        </>
    );
}

export default memo(Home);
