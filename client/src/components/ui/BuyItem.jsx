import { useEffect, useContext } from "react";
import convertCountry from "../../utils/convertCountry.json"
import useAuth from "../../hooks/useAuth";
import { MessageNotificationContext } from '../../hooks/useMessageNotification';
import { useTranslation } from "react-i18next";


// BuyItem
const BuyItem = ({name, type, price, closeFunction, refresh=false, setBought}) => {
    /// Context
    const {handleError, handleInfo, handleCorrect} = useContext(MessageNotificationContext);
    const {token, authFetch} = useAuth();
    /// Translation
    const { t, i18n } = useTranslation();

    const buyItem = () => {
        authFetch("http://localhost:3000/api/v1/buy-article",
            {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({name: name}),
            }
        )
        .then(rep => {
            if (rep.err == undefined) {
                handleCorrect(rep.msg);
                setBought(true)
            } else {
                handleError(rep.err)
            }

            if (refresh) {
                refresh()
            }
        });

        closeFunction();
    }

    return (
        <div className="buyItem">

            <h1>Do you really want to buy the {type.toLowerCase()} "<i>{type === "flag" ? convertCountry[name] : name}</i>" for {price} coins ?</h1>

            {type === "flag" &&
            <div className="content-image">
                <img src={`http://localhost:3000/flags/main/${name}.svg`}/>
                <span>{t('Flag preview')}</span>
            </div>
            }


            <div className="content-button">
                <button className="yes" onClick={() => buyItem()}>Yes</button>
                <button className="no" onClick={() => closeFunction()}>No</button>
            </div>

        </div>
    )
}

export default BuyItem;
