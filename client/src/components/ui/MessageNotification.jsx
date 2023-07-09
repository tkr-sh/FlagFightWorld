import { useEffect, useContext, useState } from 'react';
import '../../style/MessageNotification.scss';
import {MessageNotificationContext} from '../../hooks/useMessageNotification'
import { ReactComponent as XmarkSVG } from '../../assets/icons/xmark-solid.svg'
import { ReactComponent as InfoSVG } from '../../assets/icons/circle-info-solid.svg'
import { ReactComponent as CheckSVG } from '../../assets/icons/check-solid.svg'


const MessageNotification = () => {
    const {showMessage, message, type, handleHide} = useContext(MessageNotificationContext);

    const colors = {
        err: {
            backgroundColor: "#B43E",
            color: "#fcc",
            fill: "#fcc",
            icon: <XmarkSVG/>
        },

        info: {
            backgroundColor: "#467E",
            color: "#cef",
            fill: "#cef",
            icon: <InfoSVG/>
        },

        correct: {
            backgroundColor: "#4B6E",
            color: "#cfd",
            fill: "#cfd",
            icon: <CheckSVG/>
        }
    }

    useEffect(() => {

    }, [showMessage])

    return showMessage && (
    <> 
        <div className="ErrorMessage" onClick={handleHide} style={{...colors[type], icon: "none"}}>
            {
                colors[type].icon
            }
            {message}
        </div>
    </>);
}

export default MessageNotification;
