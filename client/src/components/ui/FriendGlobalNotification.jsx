import { useState, useRef } from "react";
import cross from "../../assets/icons/xmark-solid.svg";
import convertCountry from "../../utils/convertCountry.json"

const FriendGlobalNotification = ({txt, name, pfp, flag, hide, yesFunc, noFunc}) => {
    const notifRef = useRef(null);
    const closeRef = useRef(null);

    const styleGlobalNotification = () => {
        notifRef.current.style.opacity = "0.8";
        notifRef.current.style.scale = "0.9";
        closeRef.current.style.opacity = "0.8";
    }

    const deStyleGlobalNotification = () => {
        notifRef.current.style.opacity = "1";
        notifRef.current.style.scale = "1";
        closeRef.current.style.opacity = "0";
    }

    return (
        <>
            <div className="friend-global-notification" onClick={hide} ref={notifRef}>
                <img
                    src={cross}
                    className="close"
                    ref={closeRef}
                    onMouseEnter={styleGlobalNotification}
                    onMouseLeave={deStyleGlobalNotification}
                    alt="Close"
                />
                <main onMouseEnter={styleGlobalNotification} onMouseLeave={deStyleGlobalNotification}>
                    <div>
                        <img
                            alt="The pfp of a user"
                            src={pfp}
                            className="pfp"
                        />
                        <div>
                            {name}
                            <img
                                src={`http://localhost:3000/flags/main/${flag??'xx'}.svg`}
                                className="flag"
                                title={convertCountry[flag] ?? "Not a country"}
                                alt="Flag of the friend"
                            />
                        </div>
                    </div>
                    <p>
                        {txt}
                    </p>
                </main>


                <div className="content-button">
                    <button onClick={() => { yesFunc(); hide()}}>Accept</button>
                    <button style={{background: "#A22"}} onClick={() => { noFunc(); hide()}}>Deny</button>
                </div>
            </div>
        </>
    );
}


export default FriendGlobalNotification;
