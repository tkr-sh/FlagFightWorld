import { useEffect, useRef, useState } from "react";
import Footer from "../../layouts/Footer"


// Import images
//// Icons for footer
import settings from '../../assets/icons/gear-solid.svg';
import shop from '../../assets/icons/store-solid.svg';
import house from '../../assets/icons/house-chimney-solid.svg';
import friends from '../../assets/icons/user-group-solid.svg';
import profile from '../../assets/icons/id-card-solid.svg';
//// Icons for Home
import sword from '../../assets/icons/sword-solid.svg';
import game from '../../assets/icons/game-solid.svg';
import practice from '../../assets/icons/target-solid.svg';
import trophy from '../../assets/icons/trophy-solid.svg';
import collection from '../../assets/icons/collection-solid.svg';
import history from '../../assets/icons/history-solid.svg';

// Translation
import { useTranslation } from "react-i18next";


// Image associations
const icons_title = ['Settings', 'Shop', 'Home', 'Friends', 'Profile'];
const icons_name = {
    "Settings": <img src={settings}/>,
    "Shop": <img src={shop}/>,
    "Home": <img src={house}/>,
    "Friends": <img src={friends}/>,
    "Profile": <img src={profile}/>
}



// Display of the icons
const IconsDisplay = (name, updateClick, selected) => {
    // Hooks
    /// Translation
    const { t, i18n } = useTranslation();
    /// Location


    return (
        <li
            className={selected ? "selected": ''}
            onClick={() => updateClick(name)}
        >
            {icons_name[name]}
            <span>
                {t(name)}
            </span>
        </li>
    )
};




const Welcome = () => {
    // Hooks
    /// Ref
    const welcomeRef = useRef(null)
    /// States
    const [description, setDescription] = useState(<div></div>);
    const [selected, setSelected] = useState('Home');
    /// Translation
    const { t, i18n } = useTranslation();

    const closeWelcome = () => {
        welcomeRef.current.style.display = 'none';
        localStorage.setItem('new', false);
    }

    const updateClick = (name) => {
        setDescription(descriptionName[name]);
        setSelected(name);
    }


    const descriptionName = {
        "Settings": <div style={{lineHeight: "30px"}}>{t("Here is the part about the settings.")}<br/>
            {t("Here you can customize your experience, you can:")}
            <ul className="list-options">
                <li>
                    {t("Change your profile (your name, description, profile picture, banner ...)")}
                </li>
                <li>
                    {t("Manage social relations (Report users, block users)")}
                </li>
                <li>
                    {t("Manage informations like your language or notifications")}
                </li>
                <li>
                    {t("Disconnect from Flag Fight")}
                </li>
            </ul>
        </div>,
        "Shop": <div>{t("Here is the part about the Shop.")}<br/>
            {t("To buy items in the shop, you must have coins. You can get these coins by playing flag fight in multiplayer.")}<br/>
            {t("You will start with 1000 coins.")}<br/>
            {t("There is 3 differents things that you can do it the Shop:")}<br/>
            <ul className="list-options">
                <li>
                    <b>{t("Buy flags")}</b>. {t("In flag fight, you can buy flags and try to collect them all. But in addition to that, you can choose to represent any flag you have purchased by putting it on your profile.")}<br/>
                </li>
                <li>
                    <b>{t("Buy messages")}</b>. {t("In flag fight, you can buy messages, that you can send to your opponent during the game.")}<br/>
                </li>
                <li>
                    <b>{t("Buy profile customisation")}</b>. {t("In flag fight, you can buy profile customization. This is characterized by 3 things, being able to buy a banner, a GIF profl photo and a GIF banner.")}<br/>
                </li>
            </ul>
        </div>,
        "Home": <div>
            {t("The home is the place where you can easily navigate between the different pages.")}<br/>
            {t("Here are all the pages you can go to:")}<br/>
            <ul className="list-options">
                <li>
                    <img src={sword} className="icon-home"/><b>{t("Ranked games.")}</b> {t("Ranked games are games where the ELO (your level) is important. In ranked games, you will play with people of your level, the questions will be more adapted to your level.")}<br/>
                </li>
                <li>
                    <img src={game} className="icon-home"/><b>{t("Quick games.")}</b> {t("Quick games, are games without pressure, where losing does not affect your ELO. You can run into any type of player.")}<br/>
                </li>
                <li>
                    <img src={practice} className="icon-home"/><b>{t("Training.")}</b> {t("Training, is a single player mode, where you can train on any flag with very precise criteria, for a personalized learning while having fun!")}<br/>
                </li>
                <li>
                    <img src={trophy} className="icon-home"/><b>{t("Leaderboard.")}</b> {t("The leaderboard, is the place where you can see the ranking of everyone. You can filter the leaderboard by country, and even have a leaderboard that ranks the countries with the most ELO")}<br/>
                </li>
                <li>
                    <img src={collection} className="icon-home"/><b>{t("Collection.")}</b> {t("In collection, you can see all the items in the shop (also accessible from the shop), and you can filter them by the ones you have, and the ones you don't have.")}<br/>
                </li>
                <li>
                    <img src={history} className="icon-home"/><b>{t("History.")}</b> {t("History is where you can see the history of the games you have had.")}<br/>
                </li>
            </ul>
        </div>,
        "Friends": <div>
            {t("In the friend category, you can manage everything related to your friends or your notifications.")}<br/>
            {t("There is 4 things you can do:")}<br/>
            <ul className="list-options">
                <li>
                    <b>{t("Add a user.")}</b> {t("You can add a user as a friend by it's name.")}<br/>
                </li>
                <li>
                    <b>{t("Check your notifications.")}</b> {t("You can see all the notifications you have received and interact with them if it is not too late")}<br/>
                </li>
                <li>
                    <b>{t("Interact with your friends.")}</b> {t("You can interact with your friends, inviting them to play with you (as it is possible to play with your friends by inviting them, however you will not earn coins), you can also remove them from your friends.")}<br/>
                </li>
                <li>
                    <b>{t("Manage friend requests.")}</b> {t("You also have a tab specifically for managing friend requests that you have received. You can either accept or decline them.")}<br/>
                </li>
            </ul>
        </div>,
        "Profile": <div>
            {t("In the profile category, you can see your profile, and an overview of some quick data.")}<br/>
            {t("When you click on someone's name (like a friend), the page will have the same format.")}
        </div>,
    }




    useEffect(() => {
        updateClick("Home")
    }, []);



    return (
    <div ref={welcomeRef}>
        <div
            className="pop-bg"
            style={{
                position: "fixed",
                display: "block",
                margin: 0
            }}
            onClick={closeWelcome}
        />
        <div className="welcome">
            <header>
                {t("Welcome to")} Flag Fight!
            </header>
            <main style={{textAlign: "center"}}>
                <b style={{fontWeight: "600"}}>
                    {t("Flag Fight is a game about flags!")}<br/>
                    {t("Here is how you can use Flag Fight, click on icons to have more information:")}
                </b>

                <div
                    id="footer_nav"
                    style={{
                        position: "relative",
                        bottom: "auto",
                        height: "70px",
                        marginBlock: "20px"
                    }}
                >
                    <ul>
                        {icons_title.map(name => IconsDisplay(name, updateClick, selected === name))}
                    </ul>
                </div>
                {description}
            </main>
            <footer>
                <button onClick={closeWelcome}>
                    {t("START!")}
                </button>
            </footer>
        </div>
    </div>
    );
}


export default Welcome;