import coin from '../../assets/img/coin.svg';
import convertCountry from '../../utils/convertCountry.json';
import continent from '../../data/continent.json';
import { useEffect, useState, useContext, useReducer, useRef } from "react";
import BuyItem from "./BuyItem";
import correct from "../../assets/icons/check-solid.svg";
import useAuth from "../../hooks/useAuth";
import { MessageNotificationContext } from '../../hooks/useMessageNotification';
import { useTranslation } from "react-i18next";



// Article
const Article = ({flag=null, price=0, message=null, img=null, style=null, bought=false, refresh=false}) => {

    const [hidden, setHidden] = useState(true);
    const [hiddenFlag, setHiddenFlag] = useState(true);
    const {token, authFetch} = useAuth();
    const boughtVar = useRef(bought);
    const {handleError, _, handleCorrect} = useContext(MessageNotificationContext);
    /// Translation
    const { t, i18n } = useTranslation();

    const clickArticle = () => {
        if (boughtVar.current && !flag) {
            console.log("You already have this article");
        } else if (boughtVar.current) {
            setHiddenFlag((prev) => !prev)
        } else {
            setHidden((prevHidden) => !prevHidden)
        }
    }


    const changeFlag = () => {
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({data: flag, type: "country"})
        }

        
        authFetch(`http://localhost:5000/api/v1/informations`, requestOptions)
        .then(rep => {
            if (rep.err) {
                handleError(rep.err);
            } else if (rep.debug) {
                handleCorrect(rep.debug);

            }
        });
    }

    return (
        <>
            {
                !hiddenFlag &&
                <>
                 <div className="buyItem">

                    <h1>Do you want to set {convertCountry[flag]} as your flag ?</h1>
                    
                    <div className="content-image">
                        <img src={`http://localhost:3000/flags/main/${flag}.svg`}/>
                        <span>{convertCountry[flag]}</span>
                    </div>


                    <div className="content-button">
                        <button className="yes" onClick={() => changeFlag()}>Yes</button>
                        <button className="no" onClick={() => setHiddenFlag(true)}>No</button>
                    </div>

                    </div>
                    
                    <div
                        className="pop-bg"
                        style={{display: "block", position: "fixed", margin: "0"}}
                        onClick={() => setHiddenFlag((prevHidden) => !prevHidden)}
                    />
                </>
            }


            {
                !hidden &&
                <>
                    <BuyItem
                        price={price}
                        type={img !== null ? "advantage" : flag === null ? "message" : "flag"}
                        name={flag === null ? message : flag}
                        closeFunction={() => setHidden((prevHidden) => !prevHidden)}
                        refresh={refresh}
                        setBought={(value) => {boughtVar.current = value}}
                    />
                    <div
                        className="pop-bg"
                        style={{display: "block", position: "fixed", margin: "0"}}
                        onClick={() => setHidden((prevHidden) => !prevHidden)}
                    />
                </>
            }

            <div
                className="article"
                style={message != null && img == null ? {"backgroundColor": "#fff", ...style} : {...style}}
                onClick={clickArticle}
            >
                <header>
                    {
                    flag != null ?
                    <>
                        <h1>{t(convertCountry[flag])}</h1>
                        <p>{t(continent[convertCountry[flag]])}</p>
                    </>:
                    ""
                    }
                    {
                    message != null ?
                    <>
                        <h1>{t(message)}</h1>
                    </>:
                    ""
                    }
                </header>


                {
                    flag != null ?
                    <img src={`http://localhost:3000/flags/main/${flag}.svg`}/>:
                    ""
                }
                {
                    img != null && message != null?
                    <>
                        <img src={require(`../../assets/img/${img}`)}/>
                        <div className="description-image">{message}</div>
                    </>:
                    ""
                }
                {
                    message != null && img == null?
                    <>
                        <span style={message.match(/./gu).length === 1 ? {fontSize: "50px"}: {}}>{t(message)}</span>
                    </>:
                    ""
                }


                <footer>
                   {
                    bought ? 
                    <img src={correct}/> :
                    <h1>{price}<img src={coin}/></h1>
                    }
                </footer>
            </div>
        </>
    )
};

export default Article;
