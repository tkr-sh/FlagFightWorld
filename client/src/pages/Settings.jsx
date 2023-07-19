// import logo from './logo.svg';
import { useState, useEffect, useRef, React, memo } from 'react';
import SettingsButton from '../components/ui/SettingsButton';
import SettingsPopOut from '../components/ui/SettingsPopOut';
import Report from '../components/ui/Report';
import ChangeBio from '../components/ui/ChangeBio';
// import Profile from './components/profile';
import languages from '../utils/languages';
import languagesTraduction from '../utils/languagesTraduction';
import { useTranslation, withTranslation, Trans } from 'react-i18next';
import i18next from '../utils/translationInit';
import useAuth from '../hooks/useAuth';
import block from '../assets/icons/block-solid.svg'
import TOS from '../data/TOS.json'
import PP from '../data/PP.json'
import SettingsToggle from '../components/ui/SettingsToggle';


// Settings toggle
const listSettings = () => {

    const localNotif = (name) => localStorage.getItem(name) !== false;

    return <>
        <SettingsToggle
            name="Friend requests"
            initialCheck={localNotif("friendNotif")}
            func={(bool) => localStorage.setItem('friendNotif', bool)}
        />

        <SettingsToggle
            name="Game requests"
            initialCheck={localNotif("gameNotif")}
            func={(bool) => localStorage.setItem('gameNotif', bool)}
        />
    </>
}


// Term Of Services
const contentTOS = () => {
    const title = <center><b>Last modified</b>: {TOS.lastModified}</center>;
    const content = <div dangerouslySetInnerHTML={{__html: TOS.content}}></div>

    return <>{title}<br/>{content}</>;
}

// Privacy Policy
const contentPP = () => {
    const title = <center><b>Last modified</b>: {PP.lastModified}</center>;
    const content = <div dangerouslySetInnerHTML={{__html: PP.content}}></div>

    return <>{title}<br/>{content}</>;
}


// Change the language
const changeLanguageMain = () => {
    let arr_tot = [];

    for (let language of languages) {
        arr_tot.push(
        <button onClick={() => i18next.changeLanguage(language, (err,t) => {})} className='content'>
            <img src={`http://localhost:3000/flags/lang/${language}.svg`} className="flag-lang"/>{languagesTraduction[language]}
        </button>
        );
    }

    return arr_tot;
}






// Settings
const Settings = () => {
    // Hooks
    //// Ref
    const popOutBgRef = useRef(null);
    const popOutLanguage = useRef(null);
    const popOutBlocked = useRef(null);
    const popOutTOS = useRef(null);
    const popOutPP = useRef(null);
    const popOutToggle = useRef(null);
    const username = useRef(null);
    const allPopOut = [popOutLanguage, popOutBlocked, popOutTOS, popOutPP, popOutToggle];
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [showReport, setShowReport] = useState(false);
    const [showBio, setShowBio] = useState(false);
    // More
    const { t, i18n } = useTranslation();
    const {token, authFetch} = useAuth();




    /**
     * Get blocked users
     */
    const getBlocked = () => {
        authFetch('http://localhost:3000/api/v1/blocked-users')
        .then(rep => setBlockedUsers(rep));
    }


    /**
     * When the component is mounted, get blocked users
     */
    useEffect(() => {
        getBlocked()
    }, []); 

    
    const showing = () => {
        console.log("showing");
        if (popOutBgRef?.current !== null) {
            console.log(`Showing "a" menu.`)
            // ref.current.style.display = "block";
            popOutBgRef.current.style.display = "block";
        }
    };
            
    const hidding = () => {
        if (popOutBgRef !== null) {
            console.log(`Hidding "a" menu.`)
            // ref.current.style.display = "none";
            popOutBgRef.current.style.display = "none";
            allPopOut.map(e => e.current.style.display = "none");
        }

        setShowReport(false);
        setShowBio(false);
    };

    /**
     * Function to log out the user
     */
    const logOut = () => {
        localStorage.clear();
        document.location.href = `http://localhost:3000`;
    }


    /**
     * Function to unclock a user
     * 
     * @param {String} name 
     */
    const unblockUser = (name) => {
        const requestOptions = {
            method: "POST",
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({name: name})
        }

        authFetch(`http://localhost:3000/api/v1/block-user`, requestOptions)
        .then(getBlocked);
    }


    const changeLanguage = () => {
        showing();
        popOutLanguage.current.style.display = "block";
    };

    const showCategory = (ref) => {
        showing();
        if (eval(ref)?.current !== null) {
            eval(ref).current.style.display = "flex";
        }
    }


    const showBlockedUsers = () => {
        let arr_tot = [];

        if (blockedUsers.err !== undefined) {
            return <></>
        }

        for (let user of blockedUsers) {
            arr_tot.push(
            <button className='content responsive'>
                <img src={user.pfp} className="pfp"/>
                {user.name}
                <img className='flag' src={`http://localhost:3000/flags/main/${user.country}.svg`}/>
                <button className='block-button' onClick={() => unblockUser(user.name)}>
                    <img src={block}/>
                </button>
            </button>
            );
        }
        
        if (arr_tot.length === 0) {
            arr_tot = <span className='no-content'>No user blocked</span>
        }


        return arr_tot;
    }


    return (
        <div className="Settings">
            <h1>{t('Profile')}</h1>
            <SettingsButton
                title="Username"
                txt={localStorage.getItem('name') ?? "..."}
            />
            <SettingsButton title="Description" func={() => {setShowBio(true); popOutBgRef.current.style.display = "block"}}/>
            <SettingsButton title="Banner" txt="banner"/>
            <SettingsButton title="Profile picture" txt="pfp"/>
            
            <h1>{t("Social")}</h1>
            <SettingsButton title="Blocked users" func={() => showCategory('popOutBlocked')}/>
            <SettingsButton title="Report user" func={() => {setShowReport(true); popOutBgRef.current.style.display = "block"}}/>

            <h1>{t("More")}</h1>
            <SettingsButton title="Change language" func={() => showCategory('popOutLanguage')}/>
            <SettingsButton title="Notifications" func={() => showCategory('popOutToggle')}/>
            <SettingsButton title="Term of services" func={() => showCategory('popOutTOS')}/>
            <SettingsButton title="Privacy policy" func={() => showCategory('popOutPP')}/>

            <h1>{t("Quit")}</h1>
            <SettingsButton title="Log out" func={logOut}/>
            <SettingsButton title="Delete account" func={logOut}/>

            <div className='pop-bg' ref={popOutBgRef} onClick={hidding}></div>

            {
                showReport &&
                <Report close={hidding}/>
            }
            {
                showBio && 
                <ChangeBio />
            }
            <SettingsPopOut innerRef={popOutToggle} title="Notifications" func={listSettings} hide={hidding}/>
            <SettingsPopOut innerRef={popOutPP} title="Privacy Policy" func={contentPP} hide={hidding}/>
            <SettingsPopOut innerRef={popOutTOS} title="Term Of Services" func={contentTOS} hide={hidding}/>
            <SettingsPopOut innerRef={popOutLanguage} title="Change language" func={changeLanguageMain} hide={hidding}/>
            <SettingsPopOut innerRef={popOutBlocked} title="Blocked users" func={showBlockedUsers} hide={hidding}/>
        </div>
    );
}

export default memo(Settings);
