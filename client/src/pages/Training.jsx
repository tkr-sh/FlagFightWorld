import "../style/Training.scss";
import { useState, useLayoutEffect, useEffect, useRef, memo, React } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPath, useSearchParams } from "react-router-dom";
import all from "../assets/icons/all-solid.svg";
import info from "../assets/icons/circle-info-solid.svg";
import advanced from "../data/advanced.json";
import { useTranslation } from "react-i18next";



const Training = () => {

    const [searchParams] = useSearchParams();
    const [country, setCountry] = useState(searchParams.get('country'));
    const [continent, setContinent] = useState(searchParams.get('continent'));
    const [difficulty, setDifficulty] = useState(searchParams.get('difficulty'));
    const navigate = useNavigate();
    /// Translation
    const { t, i18n } = useTranslation();

    const listContinent = [
        "Africa",
        "Asia",
        "Central America and Caribbean",
        "Europe",
        "North America",
        "Oceania",
        "South America",
    ];

    const listDifficulties = [
        "All difficulties",
        "Basic",
        "Beginner",
        "Easy",
        "Normal",
        "Novice",
        "Medium",
        "Intermediate",
        "Hard",
        "Advanced",
        "Expert",
        // "Impossible",
        // "Unknown",
    ]



    return (
    <div className="training">
        {
            country === null &&
            <>
                <header>
                    {t('Do you want to train on country ?')}
                    <span>
                        <img src={info}/>
                        <div>{t('"Country" is defined as a territory recognised by the United Nations')}</div>
                    </span>
                </header>
                <main>
                    <button onClick={() => setCountry(1)}>
                        {t('Country')}
                    </button>
                    <button onClick={() => setCountry(-1)}>
                        {t('No country')}
                    </button>
                    <button onClick={() => setCountry(0)}>
                        {t('Country & No Country')}
                    </button>

                    <Link to="/training/custom">
                        <button>
                            {t('Personnalized')}
                        </button>
                    </Link>
                </main>
            </>
        }
        {
            country !== null && continent === null &&
            <>
                <header>
                    {t('On which continent do you want to train?')}
                </header>
                <main>
                    <button onClick={() => setContinent(true)}>
                        <img src={all}/>
                        {t('All')}
                    </button>
                    {
                        listContinent.map(
                            c => 
                            <button onClick={() => setContinent(c)}>
                                <img src={`http://localhost:3000/${c.replaceAll(' ', '-').toLowerCase()}.svg`}/>
                                {t(c)}
                            </button>

                        )
                    }
                    <Link to="/training/custom">
                        <button>
                            {t('Personnalized')}
                        </button>
                    </Link>
                </main>
            </>
        }
        {
            country !== null &&
            continent !== null &&
            difficulty === null &&
            <>
                <header>
                    {t('On which difficulty do you want to train ?')}
                </header>
                <main>
                    {
                        listDifficulties.map(
                            (diff, i) => 
                            <button onClick={() => setDifficulty([i])}>
                                {i} - {t(diff)}
                            </button>
                        )
                    }
                    <Link to="/training/custom">
                        <button>
                            {t('Personnalized')}
                        </button>
                    </Link>
                </main>
            </>
        }
        {
            country !== null &&
            continent !== null &&
            difficulty !== null &&
            (
            () => {
                navigate(`/game/offline?country=${country}&continent=${JSON.stringify(continent)}&difficulty=${JSON.stringify(difficulty)}`);
            })()
        }
    </div>
    );
};

export default Training;