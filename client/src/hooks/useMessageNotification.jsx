import { createContext, useState } from 'react';

export const MessageNotificationContext = createContext();

export const MessageNotificationProvier = ({ children }) => {
    const [showMessage, setShowMessage] = useState(false);
    const [message, setMessage] = useState("");
    const [type, setType] = useState("err");
    const [timeOutId, setTimeOutId] = useState(null);

    const resetTimer = () => {
        if (timeOutId) {
            clearInterval(timeOutId);
        }
        const tempTimeOut = setTimeout(() => handleHide(), 10_000)
        setTimeOutId(tempTimeOut);
    }

    const handleError = (msg) => {
        setType("err");
        setMessage(msg);
        setShowMessage(true);
        resetTimer();
    };

    const handleInfo = (msg) => {
        setType("info");
        setMessage(msg);
        setShowMessage(true);
        resetTimer();
    };

    const handleCorrect = (msg) => {
        setType("correct");
        setMessage(msg);
        setShowMessage(true);
        resetTimer();
    };

    const handleHide = () => {
        setShowMessage(false);
    };

    return (
        <MessageNotificationContext.Provider value={{ showMessage, handleHide, handleError, handleInfo, handleCorrect, message, type }}>
            {children}
        </MessageNotificationContext.Provider>
    );
};