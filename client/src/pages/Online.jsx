// Imports
/// NPM
import io from 'socket.io-client';
// import { useSocket } from '../hooks/useSocket';
/// Hooks && React based
import { useState, useRef, useEffect, useContext, memo, React } from 'react';
import { useTranslation, withTranslation, Trans } from 'react-i18next';
import { createPath, useSearchParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
/// Import components
import ReactComment from '../components/ui/HTMLComment';
import HomeButton from '../components/ui/HomeButton';
/// Import utilities
import traduction from '../utils/convertCountry';
import randomChoice from '../utils/randomChoice';
/// Import images
import userimg from '../assets/img/user.png';
import { MessageNotificationContext } from '../hooks/useMessageNotification';
import chatIcon from "../assets/icons/comments-solid.svg";
import { useNavigate } from 'react-router-dom';


const socket = io();



// Main
const Online = () => {
    // Hooks
    /// Ref
    const timerRef = useRef(null);
    const questionRef = useRef(null);
    const countDown = useRef(null);
    const spanCountDown = useRef(null);
    const endScreenRef = useRef(null);
    const userNameRef = useRef(null);
    const player1Ref = useRef(null);
    const player2Ref = useRef(null);
    const chatRef = useRef([]);
    /// States
    const [status, setStatus] = useState("tie");
    const [count, setCount] = useState(1);
    const [test, setTest] = useState([0]);
    const [brightness, setBrightness] = useState([1, 1, 1, 1]);
    const [backgroundColor, setBackgroundColor] = useState([48, 48, 48]);
    const [answersQuiz, setAnswersQuiz] = useState(["", "", "", ""]);
    const [question, setQuestion] = useState("...");
    const [questionType, setQuestionType] = useState("name");
    const [gameInfo, setGameInfo] = useState({name: [], elo: [], pfp: [], country: [], status: '', round: '', type: 'quickgame', typeQuestion: "name", question: "...", answers: ["", "", "", ""]});
    const [playerName, setPlayerName] = useState();
    const [coinWin, setCoinWin] = useState(0);
    const [eloWin, setEloWin] = useState(0);
    const [showChat, setShowChat] = useState(false);
    const [chat, setChat] = useState(["Nooooooooooooooooooo"]);
    /// Sockets
    const [isConnected, setIsConnected] = useState(socket.connected);
    /// Translation
    const { t, i18n } = useTranslation();
    /// URL
    const [searchParams, setSearchParams] = useSearchParams();
    /// Personalized hook
    const {token, authFetch} = useAuth();
    const {handleError, handleInfo, handleCorrect} = useContext(MessageNotificationContext);
    const navigate = useNavigate();




    useEffect(() => {

        socket.off('chat')

        // When you receive a message from your opponent
        socket.on("chat", (data) => {
            const index = +(data.fromUser === gameInfo.name[1]);

            console.log(gameInfo)
            console.log(index)
            console.log(gameInfo.name.join` ; `)
            console.log(data.fromUser)

            chatRef.current[index].style.transform = `translateX(0px)`;
            chatRef.current[index].textContent = data.chat;
            chatRef.current[index].style.fontSize = data.chat.match(/./gu).length === 1 ? "70px" : "30px";
            chatRef.current[index].style.paddingBlock = data.chat.match(/./gu).length === 1 ? "0px" : "5px";
            
            setTimeout(() => {
                chatRef.current[index].style.transform = `translateX(${!index ? '-' : ''}150px)`;
            }, 5_000);
        });
        
    }, [gameInfo]);



    // UseEffect
    /// Initialize the socket
    useEffect(() => {

        stopTimer();

        // Get the information about the game
        authFetch(`http://localhost:3000/api/v1/game-informations?token=${localStorage.getItem('token')}&gameId=${searchParams.get('id')}`, {headers: {"Custom-Header": "Test"}})
        .then(response => {
            setGameInfo(() => response);
            // If the game has already started
            if (response.question !== '...') {
                setQuestion(() => response.question);
                setAnswersQuiz(() => response.answers);
                setQuestionType(() => response.typeQuestion);
            }
        })

        // Get the name of the user
        authFetch(`http://localhost:3000/api/v1/name/:token?token=${localStorage.getItem('token')}`, {headers: {"Custom-Header": "Test"}})
        .then(response => {
            userNameRef.current.innerHTML = response.name;
        });

        // Get the personnal articles
        authFetch(`http://localhost:3000/api/v1/personnal-articles`)
        .then(response => {
            setChat(() => response.chat)
        });


        // Connection
        socket.on('connect', () => {
            console.log("%cPRINT OF DEBUG", "background-color: #336; color: #fff")
        });

        // Disconnection
        socket.on('disconnect', () => {
            console.log("%cPRINT OF DEBUG", "background-color: #336; color: #fff")
        });

        // Join the game 
        socket.emit("join", ""+searchParams.get("id"));


        // Result of the game when its over
        socket.on('endResult', (data) => {
            const getType = obj => Object.prototype.toString.call(obj).slice(8, -1);

            if (getType(data) !== "Array") {
                console.log(`DEBUG: ${data?.debug}\nDEBUG: ${data?.err}\nTYPE: ${typeof data}`);
                if (data?.err) {
                    handleError(data.err)
                }
                return;
            }
            const playerData = data.filter(player => player.name === userNameRef.current.innerHTML)[0];

            setCoinWin(() => playerData.coins)
            
            if (playerData.elo) {
                setEloWin(() => playerData.elo);
            }
        });

        
        // When you receive a message from your opponent
        socket.on("chat", (data) => {
            const index = +(data.fromUser === gameInfo.name[1]);

            console.log(gameInfo)
            console.log(index)
            console.log(gameInfo.name.join` ; `)
            console.log(data.fromUser)

            chatRef.current[index].style.transform = `translateX(0px)`;
            chatRef.current[index].textContent = data.chat;
            chatRef.current[index].style.fontSize = data.chat.match(/./gu).length === 1 ? "70px" : "30px";
            chatRef.current[index].style.paddingBlock = data.chat.match(/./gu).length === 1 ? "0px" : "5px";
            
            setTimeout(() => {
                chatRef.current[index].style.transform = `translateX(${!index ? '-' : ''}150px)`;
            }, 5_000);
        });

        
        // Getting a question
        socket.on('getQuestion', (data) => {
            updateQuestion(data.type, data.question, data.answers);
            timerRestart();
        });


        // Get the answer (global to the room)
        socket.on('answerReturn', (data) => {
            if (player1Ref.current.innerHTML === data.name) {
                player1Ref.current.style.color = data.correct ? "#6D6" : "#D66" 
            } else {
                player2Ref.current.style.color = data.correct ? "#6D6" : "#D66" 
            }
        });
        
        // Get the status of the game
        socket.on('gameStatus', updateStatus);

        // When the game is starting
        socket.on('gameStarting', (data) => {
            startingCountDown();
        });

        // Say that the player is ready to play
        socket.emit('ready', {token: localStorage.token, id: ""+searchParams.get("id")});


        // Turning off socket
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('pong');
            socket.off('getQuestion');
            socket.off('answerReturn');
            socket.off('gameStatus');
            socket.off('gameStarting');
            socket.off('chat');
            socket.disconnect();
        };
    }, []);



    useEffect(() => {
        let timeout;

        if (question === '...') {
            // If the game hasn't started in one minute
            timeout = setTimeout(() =>{
                console.log(gameInfo)
                console.log(question)
        
                if (question === '...') {
                    handleError("Game aborted. The other user didn't connected.");
                    navigate("/home");
                }
            }, 60_000);
        }

        return () => clearInterval(timeout);
    }, [question]);


    // Add an event listener for the "beforeunload" event
    window.addEventListener("beforeunload", () => {
        // Close the connection when the user leaves the page
        socket.close();
    });




    // Variables
    const random_flags = Object.keys(traduction);
    const translation = traduction;
    const reverseTranslation = Object.fromEntries(Object.entries(translation).map(a => a.reverse()));


    // Functions
    //// Gets a random int
    const getRandomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    //// Update the status of the game
    const updateStatus = (status) => {
        console.log("%cPRINT OF DEBUG", "background-color: #336; color: #fff")
        console.log(status);
        setPlayerName(userNameRef.current.innerHTML);

        if (typeof status !== 'string') {
            if (status.winner !== undefined && status.status === "end") {
                const winner = status.winner;
                status = winner === userNameRef.current.innerHTML ? "win" : "lost"
            } else {
                status = status.status;
            }
        }

        if (status === 'continue') {
            hideEndScreen();
        }


        setStatus(() => status);
        
        setTimeout(() => {
            if (status == "continue") {
                // Restart the background color
                player1Ref.current.style.color = "#fff";
                player2Ref.current.style.color = "#fff";
                setBackgroundColor(() => [48, 48, 48]);
                setBrightness(() => Array(4).fill(1));

                // Update the question count
                setCount(prevCount => prevCount + 1);

                // Restart the  animation
                timerRestart();
            } else {
                showEndScreen();
            }
        }, 1_000);
    }


    //// Send a chat
    const sendChat = (chat) => {
        socket.emit("chat", {
            token: token,
            chat: chat,
            id: ""+searchParams.get("id")
        });
    }



    //// Flushing the CSS
    function flushCss(element) {
        const dummy = element.offsetHeight;
    }


    //// Animation when starting 
    const startingCountDown = (n=3) => {

        // Update the position of the timer
        console.log(questionRef.current.offsetHeight)
        console.log(questionRef.current.getBoundingClientRect().top)
        countDown.current.style.height = questionRef.current.offsetHeight + "px";
        countDown.current.style.top = questionRef.current.getBoundingClientRect().top + "px";


        // Put the element in a constant
        const span = spanCountDown.current;

        // Removing transition
        span.style.transition = "none";

        // Changing style
        span.style.fontSize = "2000px";
        countDown.current.style.display = "flex";

        // Flushing CSS
        flushCss(span);

        // Restore the transition
        span.style.transition = "";

        // Update the font size (with the transition)
        span.style.fontSize = "100px";


        setTest(() => [n]);

        setTimeout(() => {
            if (n > 1)
                startingCountDown(n-1)
            else 
                countDown.current.style.display = "none";
        }, 1000);
    };



    //// Send an answer
    const sendAnswer = (answer) => {

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({token: localStorage.getItem('token'), answer: answer, gameId: searchParams.get("id")})
        }

        authFetch(`http://localhost:3000/api/v1/answer-game`, requestOptions)
        .then(json => {
            // console.log(json);
            // console.log(json.err)
            if (json.err === undefined) {
                reactionReponse(json.correct, json.indexCorrect);
            } else {
                handleError(json.err)
                console.error(json.err)
            }
        })
        .catch(e => `Error: ${e}`);
    }




    //// Get the name of the other player
    const otherPlayer = () => {
        const playerName = userNameRef.current.innerHTML;
        return gameInfo.name.filter(name => name !== playerName)[0];
    }


    //// Convert a path to an image to the flag
    const pathToName = (path) => {
        const name = path.split`/`.slice(-1)[0].split`.`[0];
        console.log(name);
        return translation[name];
    }


    //// Restart the animation of the timer
    const timerRestart = () => {
        timerRef.current.style.animation = 'none';
        const useless = timerRef.current.offsetHeight;
        timerRef.current.style.animation = null;
    }


    //// Stop the timer
    const stopTimer = () => {
        timerRef.current.style.animation = 'none';
        const useless = timerRef.current.offsetHeight;
    }



    //// Change the background color depending on the answer
    const reactionReponse = (isCorrect, indexCorrect) => {

        if (isCorrect) {
            setBackgroundColor(() => [48, 200, 48]);
        } else {
            setBackgroundColor(() => [200, 48, 48]);
        }

        // Setting the custom brightness
        setBrightness(() => [...Array(4).keys()].map(v => v === indexCorrect ? 2 : 0.5));
    }



    //// Convert an array of int to a color
    const arrayToHex = (arr) => {
        return "#" + arr.map(v => v.toString(16)).join``;
    }



    //// Update some questions
    const updateQuestion = (typeQuestion, question, answers) => {
        setQuestionType(typeQuestion);

        // If the question is a flag
        if (typeQuestion === 'flag') {
            console.log("Flag")
            setAnswersQuiz(answers);
            setQuestion(require(`../../public/flags/main/${question}.svg`));
        }
        
        // If the question is a name of a country
        else if (typeQuestion === 'name') {
            console.log("Name")
            setAnswersQuiz(answers.map(img =>`${process.env.PUBLIC_URL}/flags/main/${img}.svg`)); 
            setQuestion(question);
        }
        
        // Else error on type of question
        else {
            console.error(`Unexpected type of question: ${typeQuestion}`);
        }
    }



    //// Show & Hide end-screen
    const showEndScreen = () => endScreenRef.current.style.transform = "translateY(0vh)";
    const hideEndScreen = () => endScreenRef.current.style.transform = "translateY(100vh)";



    return (
        <>
            {/* <button style={{zIndex: "9999999999999999999999999"}} onClick={() => console.log(gameInfo) | console.log(questionType)}>Info</button> */}
            <span style={{display: "none"}} ref={userNameRef}></span>
            <ReactComment text={'Temporary screen'}/>
            <div
                id="end-screen"
                style={{backgroundColor: status !== 'tie' && status !== 'tie-end' ? status !== 'lost' ? '#3C3' : '#C33' : '#888' }}
                ref={endScreenRef}
            >
                <header>
                    <div className='left'>
                        <div className='main-info'>
                            <img src={gameInfo.pfp[0] ? `${gameInfo.pfp[0]}` : userimg}/>
                            <p>{gameInfo.name[0]}</p>
                        </div>
                        <img className='flag' src={`http://localhost:3000/flags/main/${gameInfo.country[0] ? gameInfo.country[0] : 'xx'}.svg`}/>
                    </div>
                    <div className='right'>
                        <div className='main-info'>
                            <p>{gameInfo.name[1]}</p>
                            <img src={gameInfo.pfp[1] ? `${gameInfo.pfp[1]}` : userimg}/>
                        </div>
                        <img className='flag' src={`http://localhost:3000/flags/main/${gameInfo.country[1] ? gameInfo.country[1] : 'xx'}.svg`}/>
                    </div>
                </header>
                <div id="end-content">
                    <h1>{t(status !== 'tie' && status !== "tie-end" ? status !== 'lost' ? 'You won!' : 'You lost!' : "It's a tie!")}</h1>
                    <div id="more-info">
                        <h2>{t('Round')}: <span>{count}/{Math.max(40, count)}</span></h2>
                        <h2>{t('Type')}: <span>{t(gameInfo.type)}</span></h2>
                        {
                            status !== 'tie' &&
                            <h2>{t('Coins')}: <span>+{coinWin}</span></h2>
                        }
                        {
                            gameInfo.type === 'ranked' &&
                            <h2>{t('ELO')}: <span>{(eloWin>0 ? '+' : '') + eloWin}</span></h2>
                        }
                    </div>

                    {status === 'tie' 
                    && 
                    <div id="continue-playing">
                    {t('Do you want to continue ?')}
                    </div>
                    }
                </div>
                <footer id="button-content" style={{color: status !== 'tie' && status !== 'tie-end' ? status !== 'lost' ? '#3C3' : '#C33' : '#888' }}>
                    { status !== 'tie' ?
                    <>
                        <a href="/home">
                            <button>{t('Home')}</button>
                        </a>
                        <a href="/game/waiting">
                            <button>{t('Play again')}</button>
                        </a>
                        <a href={"/game/waiting?type=friend&name=" + otherPlayer()}>
                            <button>{t( status === 'lost' ? 'Revenge' : 'Rematch' )}</button>
                        </a>
                    </>:
                    <>
                        <button id="yes" onClick={() => socket.emit("handleTie", {token: token, continue: true, gameId: searchParams.get("id")})}>Yes</button>
                        <button id="no" onClick={() => socket.emit("handleTie", {token: token, continue: false, gameId: searchParams.get("id")})}>No</button>
                    </>}
                </footer>
            </div>

            <ReactComment text={'Countdown'}/>
            <div className='count-down' ref={countDown}>
                {test.map(e => <span ref={spanCountDown}>{e}</span>)}
            </div>


        <div className="game-content">
            <ReactComment text={'Informations about the game'}/>
            {/* <p>{elo.user}</p> */}
            <div className="info-game"  style={{backgroundColor: gameInfo.type !== 'ranked' ? gameInfo.type === 'friend' ? "#D66" : "#7C4" : "#c93de5"}}>
                <ReactComment text={'Your profile'}/>
                <div className='left'>
                        <img src={gameInfo.pfp[0] ? `${gameInfo.pfp[0]}` : userimg}/>
                        <p ref={player1Ref}>{gameInfo.name[0]}</p>
                        <img className='flag' src={`http://localhost:3000/flags/main/${gameInfo.country[0] ? gameInfo.country[0] : 'xx'}.svg`}/>
                        <div>{t('ELO')}: {gameInfo.elo[0]}</div>
                </div>

                <ReactComment text={'Question count'}/>
                {/* <div className='type-game' onClick={() => setCount(prevCount => prevCount%15 + 1)}> */}
                <div className='type-game' onClick={() => updateQuestion(getRandomInt(1,3)==1?'flag':'name','')}>
                    {count} / 40
                </div>

                <ReactComment text={'Your opponent'}/>
                <div className='right'>
                        <img src={gameInfo.pfp[1] ? `${gameInfo.pfp[1]}` : userimg}/>
                        <p ref={player2Ref}>{gameInfo.name[1]}</p>
                        <div>{t('ELO')}: {gameInfo.elo[1]}</div>

                        <img className='flag' src={`http://localhost:3000/flags/main/${gameInfo.country[1] ? gameInfo.country[1] : 'xx'}.svg`}/>
                </div>

                <div className='timer' ref={timerRef}/>
            </div>

            <ReactComment text={'Question'}/>
            <div className='question' style={{"backgroundColor": arrayToHex(backgroundColor.map(v => v - 24))}} ref={questionRef}>
                {
                [0, 1].map((i) => {
                    console.log(i);
                    return <div className={'chat-player-'+-~i} ref={el => chatRef.current[i] = el}></div>
                })
                }
                <div className='game-chat'>
                    <img src={chatIcon} onClick={() => setShowChat(prev => !prev)}/>
                    <div className='content' style={{display: showChat ? "flex" : "none"}}>
                        {
                            // chat.join` ; `
                        }
                        {
                            chat.length > 0 ?
                            chat.map(message => {
                                return <button
                                    onClick={() => {
                                        sendChat(message);
                                        setShowChat(false);
                                    }}
                                >
                                    {message}
                                </button>
                            }) :
                            <span>{t("You don't have any message, but you can buy some after the game.")}</span>
                        }
                    </div>
                </div>
                {questionType === 'name' && <p style={{"display": questionType !== 'name' ? 'none' : 'flex'}}>{t(question)}</p>}
                {questionType === 'flag' && <img src={question} style={{"display": questionType === 'name' ? 'none' : 'flex'}}/>}
            </div>

            <ReactComment text={'Answer'}/>
            <div className='answer' style={{"backgroundColor": arrayToHex(backgroundColor)}}>
                {[...Array(4).keys()].map(i => {
                    return <button
                        className={
                            brightness[i] == 1 ? "no-answer" : (brightness[i] == 2 ? "good-answer" : "bad-answer")
                        }

                        style={
                            {
                                "backgroundImage": questionType === 'name' ? `url(${answersQuiz[i]})` : 'none',
                                "backgroundColor": arrayToHex(backgroundColor.map(v => v + 24)),
                                "fontSize": questionType !== 'name' && answersQuiz[i].length > 50 ? "1.5em" : "2em"    
                            }
                        }
                        
                        onClick={() => sendAnswer(i)}
                    >
                        {questionType === 'name' ? '' : t(answersQuiz[i])}
                    </button>
                }
                )}
            </div>
        </div>
        </>
    );
}

export default memo(Online);