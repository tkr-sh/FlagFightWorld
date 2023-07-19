import { useState, useEffect, useRef } from "react";
import useAuth from "../hooks/useAuth";
import "../style/Leaderboard.scss";
import banner from "../assets/img/banner.jpg";
import flags from "../data/advanced.json";
import convertCountry from "../utils/convertCountry.json";
import PageSearch from "../components/ui/PageSearch";

// Icons
import start from "../assets/icons/backward-solid.svg"
import prev from "../assets/icons/caret-left-solid.svg"
import next from "../assets/icons/caret-right-solid.svg"
import end from "../assets/icons/forward-solid.svg"
import { useTranslation } from "react-i18next";




const Leaderboard = () => {
    const mountedPage = useRef(false);
    const mountedselectedFlag = useRef(false);
    const {token, authFetch} = useAuth();
    const [page, setPage] = useState(1);
    const [nbPage, setNbPage] = useState(1);
    const [showOption, setShowOption] = useState(false);
    const [countryLb, setCountryLb] = useState(false);
    const [selectedFlag, setSelectedFlag] = useState(null);
    const [leaderboardPlayer, setLeaderboardPlayer] = useState([]);
    const [leaderboardFlag, setLeaderboardFlag] = useState([]);
    const convertCountryReverse = Object.fromEntries(Object.entries(convertCountry).map(a => a.reverse()));
    /// Translation
    const { t, i18n } = useTranslation();


    const getFlagElo = () => {
        authFetch("http://localhost:3000/api/v1/flag-elo")
        .then(rep => {
            console.log(rep.sort((a,b) => a.elo < b.elo ? 1 : -1))
            setLeaderboardFlag(rep.sort((a,b) => a.elo < b.elo ? 1 : -1));
            setNbPage(Math.ceil(rep.length / 50))
        })
    }

    const getLeaderboard = (country=false, pageParam=false) => {
        if (!pageParam) {
            pageParam = page;
        }

        authFetch(`http://localhost:3000/api/v1/leaderboard?page=${pageParam}${country ? `&country=${country}` : ``}`)
        .then(rep => {
            console.log(rep)
            setLeaderboardPlayer(() => rep.lb);
            setNbPage(() => rep.pages);
        })
    }

    useEffect(() => {
        if (countryLb) {
            setNbPage(Math.ceil(leaderboardFlag.length / 50))
            getFlagElo();
        } else {
            setNbPage(() => Math.ceil(leaderboardPlayer.length / 50));
            setPage(() => 1);
            getLeaderboard(false, 1);
        }
    }, [countryLb]);

    useEffect(() => {
        if (mountedselectedFlag.current) {
            setLeaderboardPlayer(() => []);
            getLeaderboard(selectedFlag?.extension);
        } else {
            mountedselectedFlag.current = true
        }
    }, [selectedFlag])


    useEffect(() => {
        if (mountedPage.current) {
            if (countryLb) {
    
            } else {
                getLeaderboard();
            }
        } else {
            mountedPage.current = true;
        }
    }, [page])

    useEffect(() => {
        // getLeaderboard();
    }, [])

    return (
        <div className="Leaderboard">
            <div
                className="pop-bg" 
                style={{margin: "0", position: "fixed", display: showOption ? "block" : "none", zIndex: 1}}
                onClick={() => setShowOption(false)}
            />

            <div
                className="parameters"
                style={{height: (110 - countryLb * 60)  + "px" }}
            >
                <div className="type-leaderboard">
                    {t('Global leaderboard')}
                    <label className="switch">
                        <input
                            type="checkbox"
                            onClick={(e) => setCountryLb(e.target.checked)}
                        />
                        <span className="slider"></span>
                    </label>
                    {t('Flag leaderboard')}
                </div>
                {
                    !countryLb &&
                    <section>
                        <span>{t('Flag')}</span><br/>
                        <div className="select" onClick={() => setShowOption(prev => !prev)}>
                            {selectedFlag ?
                            <>
                                <img src={`http://localhost:3000/flags/main/${selectedFlag.extension}.svg`}/>
                                {t(selectedFlag.name)}
                            </>:
                            <>
                                <img src={`http://localhost:3000/flags/main/xx.svg`}/>
                                {t('All')}
                            </>}
                        </div>

                        <div className="options" style={{display: showOption ? "flex" : "none"}}>
                            <button onClick={() => {setSelectedFlag(null); setShowOption((prev) => !prev)}}>
                                {t('All')}
                            </button>

                            {
                                flags.map(flag => 
                                    <button
                                        onClick={() => {
                                            setSelectedFlag(() => {
                                                return {name: flag.name, extension: flag.extension}
                                            });

                                            setShowOption(prev => !prev);
                                        }}
                                    >
                                        <img src={`http://localhost:3000/flags/main/${flag.extension}.svg`}/>
                                        <span>
                                            {t(flag.name)}
                                        </span>
                                    </button>
                                    
                                )
                            }
                        </div>
                    </section>
                }
            </div>

            <main>
                <table>
                    <thead>
                        <tr>
                            <td className="lb-rank">
                            </td>
                            <td className="lb-flag">
                            </td>
                            <td className="lb-name">
                            {
                            !countryLb &&
                            t("Name")
                            }
                            </td>
                            <td className="lb-tot-elo">
                                {t('ELO')}
                            </td>
                            {
                            countryLb &&
                            <>
                                <td className="lb-players">
                                    {t('PLAYERS')}
                                </td>
                                <td className="lb-mean-elo">
                                    {t('MEAN ELO')}
                                </td>
                            </> 
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            countryLb ? 
                            leaderboardFlag
                            .slice((page - 1)* 50)
                            .slice(0, 50)
                            .map((flag,i) =>
                                <tr>
                                    <td className="lb-rank">
                                        #{i+(page-1)*50+1}
                                    </td>
                                    <td className="lb-flag">
                                        <div>
                                            <img src={`http://localhost:3000/flags/main/${convertCountryReverse[flag.flag]}.svg`}/>
                                        </div>
                                    </td>
                                    <td className="lb-name">
                                        {flag.flag}
                                        
                                    </td>
                                    <td className="lb-tot-elo">
                                        {flag.elo}
                                    </td>
                                    <td className="lb-players">
                                        {flag.tot}
                                    </td>
                                    <td className="lb-mean-elo">
                                        {Math.round(flag.elo / flag.tot || 0, 2)}
                                    </td>
                                </tr>
                            ) :
                            leaderboardPlayer.map((user, i) => 
                                <tr>
                                    <td className="lb-rank">
                                        #{i+1+(page-1)*50}
                                    </td>
                                    <td className="lb-flag">
                                        <div>
                                            <img src={`http://localhost:3000/flags/main/${user.country}.svg`}/>
                                        </div>
                                    </td>
                                    <td className="lb-name">
                                        <a href={`http://localhost:3000/profile?name=${user.name}`}>
                                            {user.name}
                                        </a>
                                        
                                    </td>
                                    <td className="lb-tot-elo">
                                        {user.elo}
                                    </td>
                                </tr>
                            )
                        }
                    </tbody>
                </table>
            </main>


            <PageSearch indexPage={page} nbPage={nbPage} updateParentPage={setPage}/>
        </div>
    );
};

export default Leaderboard;