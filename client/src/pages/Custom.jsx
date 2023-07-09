import "../style/Training.scss";
import { useState, useLayoutEffect, useEffect, useRef, memo, React } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPath, useSearchParams } from "react-router-dom";
import all from "../assets/icons/all-solid.svg";
import advanced from "../data/advanced.json";
import CustomSection from "../components/ui/CustomSection";
import { useTranslation } from "react-i18next";


const listContinent = [
    "All",
    "Africa",
    "Asia",
    "Europe",
    "North America",
    "Central America and Caribbean",
    "Oceania",
    "South America",
];

const listDifficulties = [
    "All",
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
]


const Custom = () => {

    const [country, setCountry] = useState([{title: "Country", allow: true}, {title: "Not country", allow: true}]);
    const [continent, setContinent] = useState(listContinent.map(e => {return {title: e, allow: false}}));
    const [difficulty, setDifficulty] = useState(listDifficulties.map(e => {return {title: e, allow: false}}));

    const {t, lang} = useTranslation()


    const generateURL = () => {

        const countryURL =
            country[0].allow ?
                (
                    country[1].allow ? 
                        0 :
                        1
                ) : 
                (
                    country[1].allow ? 
                        -1 :
                        0

                );
        const continentURL = continent.includes("All") ? true : JSON.stringify(continent.filter(d => d.allow).map(e => e.title));
        const diffURL = JSON.stringify(difficulty.filter(d => d.allow).map(d => listDifficulties.indexOf(d.title)));


        return `/game/offline?country=${countryURL}&continent=${continentURL}&difficulty=${diffURL}`;
    }


    return (
    <div className="custom-content">
        <div className="custom">
            <CustomSection title={t("Country")} arr={["Country", "Not country"]} fun={setCountry}/>
            <CustomSection title={t("Continent")} arr={listContinent} fun={setContinent}/>
            <CustomSection title={t("Difficulty")} arr={listDifficulties} fun={setDifficulty}/>
            <Link to={generateURL()}>
                <button className="go">GO!</button>
            </Link>
        </div>
    </div>
    );
};

export default Custom;