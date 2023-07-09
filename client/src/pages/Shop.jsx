// import logo from './logo.svg';
import { useState, useEffect, useRef, useContext, React } from 'react';
// import "./style/App.scss"
import Category from '../components/ui/Category';
import Article from '../components/ui/Article';
import coin from '../assets/img/coin.svg';
import useAuth from '../hooks/useAuth';
import advanced from "../data/advanced.json"
import messages from "../utils/chat.json"
import cross from "../assets/icons/xmark-solid.svg"
import { FaCarCrash } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';



// Safely get personnal articles using a try/catch
const persoArticlesFunc = () => {
    try {
        const v = JSON.parse(localStorage.getItem('personnalArticles'));
        return v;
    } catch {
        return [];
    }
}


// Get time between now and the refresh
const timeDiff = () => {
    let now = new Date();
    let [h, m, s] = [now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()];

    return h*3600 + m*60 + s;
}


// Format the int to time
const formatDate = (d) => {
    let diff = 24*3600 - d;

    return diff > 0 ?
    [diff/3600|0, (diff/60|0)%60, diff%60].map(n => (""+n).padStart(2, '0')).join`:`:
    "Updating the articles... Come back in 10 seconds";
}




// Shop
const Shop = () => {
    let promotion = localStorage.getItem('promotionFlag');

    try {
        promotion = JSON.parse(promotion)
    } catch {
        promotion = []
    }

    // Hooks
    /// References
    const shopContentRef = useRef(null);
    const darkeningBackgroundRef = useRef(null);
    const allArticles = useRef(null)
    const moneyRef = useRef(null);
    const shadowRef = useRef(null);
    /// States
    const [timer, setTimer] = useState(timeDiff());
    const [coins, setCoins] = useState(localStorage.getItem('coins'));
    const [itemPromotion, setItemPromotion] = useState({flag: promotion ?? [], chat: []});
    const [showArticles, setShowArticles] = useState(false);
    const [showFlags, setShowFlags] = useState(false);
    const [showMsgs, setShowMsgs] = useState(false);
    const [showMyArticles, setShowMyArticles] = useState(1);
    const [personnalArticles, setPersonnalArticles] = useState({flag: persoArticlesFunc() ?? [], chat: null});
    /// Hook for fetching with our token
    const {token, authFetch } = useAuth();
    /// Translation
    const { t, i18n } = useTranslation();


    const loopTimer = () => {
        setTimer(p => p + 1);
        setTimeout(loopTimer, 1_000);
    }


    // Use effect on load
    useEffect(() => {

        setTimeout(() => {
            // handleError("You need ti bkabbkl je ne sais pas vr   iment quoi");
        }, 1_000)


        if (shopContentRef.current) {
            shopContentRef.current.onscroll = scrollFunction;
        }

        // Get the coins
        getCoins();

        // Get the item promotions
        authFetch("http://localhost:5000/api/v1/item-promotion")
        .then(rep => {
            setItemPromotion(() => rep);

            if (typeof rep.flag === 'object' && rep.flag !== null)
                localStorage.setItem('promotionFlag', JSON.stringify(rep.flag));
        })

        // Get the personnal articles of theuser
        authFetch("http://localhost:5000/api/v1/personnal-articles")
        .then(rep => setPersonnalArticles(() => rep))
        .then(rep => console.log(rep));

        loopTimer();
    }, []);



    // Update the localStorage
    useEffect(() => {
        if (typeof personnalArticles === 'object' && personnalArticles !== null)
            localStorage.setItem('personnalArticles', personnalArticles);
    }, [personnalArticles]);

    useEffect(() => {
        if (typeof coins === 'object' && coins !== null)
            localStorage.setItem('coins', coins);
    }, [coins]);



    const getCoins = () => {
        authFetch("http://localhost:5000/api/v1/coins")
        .then(rep => setCoins(() => rep.coins))
        .then(rep => console.log(rep));
    }

    const scrollFunction = () => {
        if (shopContentRef.current.scrollTop > 0) {
            // For the money
            moneyRef.current.style.height = "25px";
            moneyRef.current.style.fontSize = "14px";
            // For the shop content
            shopContentRef.current.style.height = "calc(100% - 25px)";
            shopContentRef.current.style.marginTop = "25px";
            // For the shop shadow
            shadowRef.current.style.display = "block";
        } else {
            // For the money
            moneyRef.current.style.fontSize = "25px";
            moneyRef.current.style.height = "50px";
            // For the shop content
            shopContentRef.current.style.height = "calc(100% - 50px)";
            shopContentRef.current.style.marginTop = "50px";
            // For the shop shadow
            shadowRef.current.style.display = "none";
        }
    }

    const hideAllArticles = () => {
        setShowArticles((prev) => !prev);
    }


    const categoryAttributes = (str) => {
        if (str === "flag") {
            // console.warn(str, itemPromotion)
            return itemPromotion.flag.map(flag => {return {flag: flag, price: 500}});
        }

        if (str === "msg") {
            return itemPromotion.chat.map(chat => {return {message: chat, price: 500}});
        }

        if (str === "customization") {
            return [
                {
                    message: "Banner",
                    img: "background.jpg",
                    price: 50_000,
                }, {
                    message: "Banner GIF",
                    img: "wallpaper.gif",
                    price: 200_000,
                }, {
                    message: "Profile picture GIF",
                    img: "pfp.gif",
                    price: 100_000,
                }
            ];
        }
    } 

    return (
        <div className="Shop">
            <div className='money' ref={moneyRef}>
                {t('Money')}: {coins}<img src={coin}/>
                <span className='shop-timer'>
                    {formatDate(timer)}
                </span>
            </div>
            <div className='shadow-money' ref={shadowRef}></div>

            <div className='shop-content' ref={shopContentRef}>
                <Category
                    title="Flags"
                    top_articles={categoryAttributes("flag")}
                    show_article={hideAllArticles}
                    personnal_articles={personnalArticles?.flag}
                    refresh={getCoins}
                />
                <br/>
                <Category
                    title="Messages"
                    top_articles={categoryAttributes("msg")}
                    show_article={hideAllArticles}
                    personnal_articles={personnalArticles?.chat}
                    refresh={getCoins}
                />
                <br/>
                <Category
                    title="Customization"
                    top_articles={categoryAttributes("customization")}
                    show_article={hideAllArticles}
                    personnal_articles={[personnalArticles?.banner ? "Banner" : ""] + [personnalArticles?.pfpGif ? "Profile picture GIF" : ""] + [personnalArticles?.bannerGif ? "Banner GIF" : ""]}
                    refresh={getCoins}
                />
            </div>

            <div
                className='darkening-bg'
                ref={darkeningBackgroundRef}
                onClick={() => hideAllArticles()}
                style={{display: showArticles ? "block" : "none"}}
            />

    
            <div className='all-articles' ref={allArticles} style={{display: showArticles ? "block" : "none"}}>
                <header className='header-all-articles'>
                    {t('All articles')}
                    <div className='cross' onClick={hideAllArticles}>
                        <img src={cross}/>
                    </div>
                </header>

                <div className='options-content'>
                    <button
                        onClick={() => setShowFlags(prev => !prev)}
                        style={{backgroundColor: showFlags ? "#3c3" : "#c33"}}
                    >
                        {t('Flags')}
                    </button>

                    <button
                        onClick={() => setShowMsgs(prev => !prev)}
                        style={{backgroundColor: showMsgs ? "#3c3" : "#c33"}}
                    >
                        {t('Messages')}
                    </button>

                    <button
                        onClick={() => setShowMyArticles(prev => -~prev%3)}
                        style={{backgroundColor: ["#c33", "#999", "#3c3"][showMyArticles]}}
                        className="show-my-articles"
                    >
                        <span>{t('My articles')}</span>
                        <span>{[t("No"), t("Both"), t("Only")][showMyArticles]}</span>
                    </button>
                </div>

                <div className='content'>
                {
                    showFlags &&
                    personnalArticles?.flag !== null &&
                    (
                        showMyArticles === 2 ?
                        personnalArticles
                        ?.flag
                        ?.map(flag => 
                            <Article
                            flag={flag}
                            price={1000 - itemPromotion.flag.includes(flag) * 500}
                            style={{height: "200px", order: 1 - itemPromotion.flag.includes(flag)}}
                            bought={true}
                            />
                        ) :
                        advanced
                        .filter(flag =>
                            (showMyArticles === 0 && !personnalArticles?.flag?.includes(flag.extension)) ||
                            showMyArticles === 1
                        )
                        .map(flag =>
                            {
                                console.debug(personnalArticles?.flag?.join(` ; `) + " <====> "+ flag.extension)
                                const boolTemp = personnalArticles?.flag?.includes(flag.extension);
                                console.log(boolTemp)
                                if (flag.extension === 'ru') {
                                    console.error(boolTemp, flag, personnalArticles?.flag)
                                }
                                return <Article
                                    flag={flag.extension}
                                    price={1000 - itemPromotion.flag.includes(flag.extension) * 500}
                                    style={{height: "200px", order: 1 - itemPromotion.flag.includes(flag.extension)}}
                                    bought={boolTemp}
                                />
                            }
                        )
                    )
                }
                {
                    showMsgs &&
                    personnalArticles?.chat !== null &&
                    messages
                    .filter(msg =>
                        (showMyArticles === 0 && !personnalArticles?.chat?.includes(msg)) ||
                        showMyArticles === 1 ||
                        (showMyArticles === 2 && personnalArticles?.chat?.includes(msg))
                    )
                    .map(msg =>
                        <Article
                            message={msg}
                            price={1000 - itemPromotion.chat.includes(msg) * 500}
                            style={{height: "200px", order: 1 - itemPromotion.chat.includes(msg)}}
                            bought={personnalArticles?.chat.includes(msg)}
                        />
                    )
                }
                </div>

            </div>
        </div>
    );
}

export default Shop;
