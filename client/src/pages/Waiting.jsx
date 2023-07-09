// Imports
/// NPM
import io from 'socket.io-client';
/// Hooks && React based
import { useState, useRef, useEffect, useContext, React, memo } from 'react';
import { useTranslation, withTranslation, Trans } from 'react-i18next';
import { createPath, useSearchParams } from "react-router-dom";
import { MessageNotificationContext } from '../hooks/useMessageNotification';
import useAuth from '../hooks/useAuth';
// import HomeButton from '../components/ui/HomeButton';
import ListFlag from '../components/ui/ListFlag';
/// Import utilities
import traduction from '../utils/convertCountry';
/// Import images
import backArrow from '../assets/icons/extend-arrow-solid.svg';
/// Import custom SCSS
import "../style/Waiting.scss";
import { Link, useNavigate } from 'react-router-dom';



const socket = io();


const difficulties = [
    "All difficulties",
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
    // "Impossible",
    // "Unknown",
]

const continents = [
    "All continents",
    "Europe",
    "Asia",
    "Africa",
    "Oceania",
    "North America",
    "South America",
    "Central America and Caribbean",
]


// Main
const Waiting = () => {
    // Hooks
    /// Ref
    const timerRef = useRef(null);
    const divID = useRef(null);
    const flagsRef = useRef(null);
    const resizeRef = useRef(null);
    const dot1 = useRef(null);
    const dot2 = useRef(null);
    const dot3 = useRef(null);
    /// States
    const [divHeight, setDivHeight] = useState("50vh");
    const [difficulty, setDifficulty] = useState(0);
    const [isCountry, setIsCountry] = useState(false);
    const [continent, setContinent] = useState(false);
    const [timeWaiting, setTimeWaiting] = useState(0);
    const [gameId, setGameId] = useState("");
    /// Translation
    const { t, i18n } = useTranslation();
    /// Sockets
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [pingCount, setPingCount] = useState(0);
    /// URL
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    /// More
    const {handleError, handleInfo, handleCorrect} = useContext(MessageNotificationContext);
    const {token, authFetch} = useAuth();
    const random_flags = Object.keys(traduction);



    const formatTime = (time) => {
        return `${parseInt(time/60)}:${(""+time%60).padStart(2, '0')}`
    }


    const updateTimer = () => {
        setTimeWaiting((prev) => prev + 1);

        setTimeout(() => {
            updateTimer()
        }, 1_000)
    }
    


    const reset_animation = (n) => {
        let el = eval(`dot${n}.current`);
        el.style.animation = 'none';
        const useless = el.offsetHeight; /* trigger reflow */
        el.style.animation = null; 
    }



    const dotJumpLoop = (n=1) => {

        reset_animation(n);

        setTimeout(() => {
            if (n !== 3)
                dotJumpLoop(n+1)
            else 
                dotJumpLoop(1)
        }, n !== 3 ? 450 : 1500);
    };



    // UseEffect
    /// Initialize the socket
    useEffect(() => {

        if (searchParams.get('id') !== null) {
            navigate(`/Game/Online?id=${searchParams.get('id')}`)
        }


        // Connection
        socket.on('connect', () => {
            setIsConnected(true);
        });


        // Ping
        socket.on("ping", () => {
            console.log("pong");
        });

        // Disconnection
        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        
        socket.on("stopWaiting", () => {
            console.log("Going to change of page...")
            navigate(`/Game/Online?id=${divID.current.defaultValue}`)
        });

        
        socket.on("log", (data) => {
            console.log(data)
        });

        socket.on("returnGameId", (data) => {
            chekingData(data)
        });

        socket.emit("joinGame", {token: localStorage.token, type: searchParams.get('type') || "quickgame", name: searchParams.get("name") || null});

        // resizeRef.current.addEventListener("mousedown", handleMouseDown);


        window.addEventListener("mouseup", (e) => {
            if (divID.current) {
                divID.current.drag = false;
            }
        });

        window.addEventListener("mousemove", (e) => {
            if (divID.current && divID.current.drag) {
                setDivHeight(() => window.innerHeight - 10 - Math.min(+e.y, +window.innerHeight)+"px");
            }
        });

        resizeRef.current.addEventListener("mousedown", (e) => {
            if (divID.current) {
                divID.current.drag = true;
            }
        });


        dotJumpLoop();

        updateTimer();
        

        // resizeRef.current.addEventListener("mousemove", handleMouse);



        // Turning off socket
        return () => {
            socket.off('ping');
            socket.off('connect');
            socket.off('disconnect');
            socket.off('stopWaiting');
            socket.off('log');
            socket.off('returnGameId');
            socket.disconnect();
            // window.removeEventListener("mousemove", handleMouse);
            // window.removeEventListener("resize", handleMouse)
        };
    }, []);






    // window.addEventListener("mouseup", handleMouseUp);


    const deleteWaitingGame = () => {
        console.log("quitting");
        console.log(divID.current.defaultValue);
        if (divID.current.defaultValue) {

            const requestOptions = {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({id: divID.current.defaultValue})
            }

            authFetch(`http://localhost:5000/api/v1/waiting`, requestOptions);
        }
    }


    


    const chekingData = (data) => {
        console.log(data)
        if (data.waiting) {
            socket.emit("join", data.id);
            divID.current.defaultValue = data.id;
        } else if (data.err) {
            handleError(data.err);
        } else {
            navigate(`/Game/Online?id=${data.id}`)
        }
    }

    
    return (

        <div id="waiting-content">
            <div ref={divID} defaultValue='3' drag="false"/>

            <header style={{backgroundColor: searchParams.get('type') !== 'ranked' ? searchParams.get('type') === 'friend' ? "#D66" : "#7C4" : "#c93de5"}}>
                <span>
                    <b>{t('Waiting')}</b>: {formatTime(timeWaiting)}
                </span>
                <span>
                    <b>{t('Type')}</b>: {t(searchParams.get('type') ?? "Quickgame")}
                </span>

                <Link to="/home" onClick={deleteWaitingGame}>
                    <img className='back-icon' src={backArrow}/>
                </Link>
            </header>


            <main>
                {t(searchParams.get('type') === "friend" ? "Waiting" : "Searching")}
                {[1,2,3].map(n =>
                    <span ref={eval("dot"+n)} onClick={() => reset_animation(n)}>.</span>
                )}
            </main>

            <div ref={resizeRef} id="resize">

            </div>


            <footer style={{height: divHeight}}>
                <div id="filter">
                    <select name="Difficulty" id="difficulty" onChange={e => setDifficulty(() => +e.target.value)}>
                        {difficulties.map((elem, index) => {
                            return <option value={index}>{t(elem)}</option>
                        })}
                    </select>

                    <button style={{backgroundColor: isCountry ? "#3C3" : "#C33"}} onClick={() => setIsCountry((prevBool) => !prevBool)}>
                        {t('UNO Country')}
                    </button>

                    <select name="continent" id="continent" onChange={e => setContinent(() => e.target.value)}>
                        {continents.map(continent => {
                            return <option value={continent === "All continents" ? "" : continent}>{t(continent)}</option>
                        })}
                    </select>
                </div>
                <div id="flag-content">
                    <ListFlag difficulty={difficulty} isCountry={isCountry} continent={continent}/>
                </div>
            </footer>
        </div>
    );
}

export default memo(Waiting);
