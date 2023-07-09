
import { useState, useRef, useEffect } from "react";
// import "./style/App.scss"
import Article from '../components/ui/Article';
import useAuth from '../hooks/useAuth';
import advanced from "../data/advanced.json"
import messages from "../utils/chat.json"
import cross from "../assets/icons/xmark-solid.svg"
import { useTranslation } from "react-i18next";



const Collection = () => {
    // Hooks
    /// References
    const shopContentRef = useRef(null);
    const darkeningBackgroundRef = useRef(null);
    const allArticles = useRef(null)
    const moneyRef = useRef(null);
    const shadowRef = useRef(null);
    /// States
    const [coins, setCoins] = useState(localStorage.getItem('coins'));
    const [itemPromotion, setItemPromotion] = useState({flag: JSON.parse(localStorage.getItem('promotionFlag')) ?? [], chat: []});
    const [showArticles, setShowArticles] = useState(true);
    const [showFlags, setShowFlags] = useState(false);
    const [showMsgs, setShowMsgs] = useState(false);
    const [showMyArticles, setShowMyArticles] = useState(1);
    const [personnalArticles, setPersonnalArticles] = useState({flag: [], chat: []});
    /// Hook for fetching with our token
    const {token, authFetch } = useAuth();
    /// Translation
    const { t, i18n } = useTranslation();
    
    // Use effect on load
    useEffect(() => {
        if (shopContentRef.current) {
            shopContentRef.current.onscroll = scrollFunction;
        }

        // Get the coins
        getCoins();

        // Get the item promotions
        authFetch("http://localhost:5000/api/v1/item-promotion")
        .then(rep => {
            setItemPromotion(() => rep);
            console.log(localStorage.getItem('promotionFlag'))
            console.log(JSON.parse(localStorage.getItem('promotionFlag')))
            localStorage.setItem('promotionFlag', JSON.stringify(rep.flag));
        })

        // Get the personnal articles of theuser
        authFetch("http://localhost:5000/api/v1/personnal-articles")
        .then(rep => setPersonnalArticles(() => rep))
        .then(rep => console.log(rep))
    }, []);

    useEffect(() => {
        console.trace(personnalArticles)
    }, [personnalArticles]);


    useEffect(() => {
        localStorage.setItem('coins', coins);
    }, [coins])


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

    return (
    <div className="Collection">

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
                (
                    showMyArticles === 2 ?
                    personnalArticles
                    .flag
                    .map(flag => 
                        <Article
                            flag={flag}
                            price={1000 - itemPromotion.flag.includes(flag) * 500}
                            style={{height: "200px", order: 1 - itemPromotion.flag.includes(flag)}}
                            bought={true}
                        />
                    ) :
                    advanced
                    .filter(flag =>
                        (showMyArticles === 0 && !personnalArticles.flag.includes(flag.extension)) ||
                        showMyArticles === 1
                    )
                    .map(flag =>
                        {
                            console.debug(personnalArticles.flag.join` ; ` + " <====> "+ flag.extension)
                            const boolTemp = personnalArticles.flag.includes(flag.extension);
                            console.log(boolTemp)
                            if (flag.extension === 'ru') {
                                console.error(boolTemp, flag, personnalArticles.flag)
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
                messages
                .filter(msg =>
                    (showMyArticles === 0 && !personnalArticles.chat.includes(msg)) ||
                    showMyArticles === 1 ||
                    (showMyArticles === 2 && personnalArticles.chat.includes(msg))
                )
                .map(msg =>
                    <Article
                        message={msg}
                        price={1000 - itemPromotion.chat.includes(msg) * 500}
                        style={{height: "200px", order: 1 - itemPromotion.chat.includes(msg)}}
                        bought={personnalArticles.chat.includes(msg)}
                    />
                )
            }
            </div>

    </div> );
}
 
export default Collection;