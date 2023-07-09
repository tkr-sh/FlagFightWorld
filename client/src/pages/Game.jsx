// Imports
/// NPM
import io from 'socket.io-client';
/// Hooks && React based
import { useState, useRef, useEffect, React } from 'react';
import { useTranslation, withTranslation, Trans } from 'react-i18next';
import { useSearchParams } from "react-router-dom";
/// Import components
import ReactComment from '../components/ui/HTMLComment';
/// Import utilities
import traduction from '../utils/convertCountry';
import randomChoice from '../utils/randomChoice';
/// Import images
import userimg from '../assets/img/user.png';
import fr from '../assets/img/fr.svg';


// Main
const Game = () => {
    // Hooks
    /// Ref
    const timerRef = useRef(null);
    /// States
    const [count, setCount] = useState(1);
    const [brightness, setBrightness] = useState([1, 1, 1, 1]);
    const [backgroundColor, setBackgroundColor] = useState([48, 48, 48]);
    const [answersQuiz, setAnswersQuiz] = useState(["url('../assets/img/Flag_of_Nepal.svg')", "", "", ""]);
    const [question, setQuestion] = useState("...");
    const [questionType, setQuestionType] = useState("flag");
    const [elo, setElo] = useState("0");
    /// Translation
    const { t, i18n } = useTranslation();
    /// Sockets
    const socket = io();
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [pingCount, setPingCount] = useState(0);
    /// URL
    const [searchParams, setSearchParams] = useSearchParams();



    // UseEffect
    /// Initialize the socket
    useEffect(() => {
        // Connection
        socket.on('connect', () => {
            setIsConnected(true);
        });

        // Disconnection
        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.emit("join", ""+searchParams.id);

        socket.on('pong', () => {
            setPingCount((ping) => ping + 1);
        });
        
        // Getting a question
        socket.on('getQuestion', (data) => {
            // Question
            setQuestion(() => data.question);
            // Possible answers
            setAnswersQuiz(() => data.answers);
        });

        socket.on('answerReturn', (data) => {
            // reactionReponse(data.correct);
            console.log(data.correct);
        });

        socket.on('answerReturnIndex', (data) => {
            reactionReponse(data.correct, data.indexCorrect);
            console.log(data.correct);
        });

        socket.on('gameStatus', (status) => {
            console.log(status);
        });

        // Turning off socket
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('pong');
            socket.off('getQuestion');
            socket.off('answerReturn');
            socket.off('gameStatus');
        };
    }, []);
    
    /// Basic fetch
    useEffect(() => {
        fetch("http://localhost:3000/api")
        .then(reponse => reponse.json())
        .then(data => setElo(() => data))
        .catch(e => `Error: ${e}`)
    }, []);



    // Variables
    const random_flags = Object.keys(traduction);
    const translation = traduction;


    // Functions
    //// Gets a random int
    const getRandomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min)) + min;
    }


    //// Send a ping
    const sendPing = () => {
        socket.emit('ping');
    }


    //// Send an answer
    const sendAnswer = (answer) => {
        socket.emit("answerGame", {
            gameId: searchParams.id,
            token: localStorage.getItem('token'),
            answer: answer,
        });
    }


    //// Generate a question
    const generateQuestion = () => {
        const answer = getRandomInt(0, 4);
        const possibilities = Array(4).map(getRandomInt(0, 4));

        return [answer, possibilities];
    }


    //// Creates the array of answers
    const generateAnswers = () => {
        let arrAnswers = [];

        while (arrAnswers.length != 4) {
            const choice = randomChoice(random_flags);
            if (!arrAnswers.includes(choice)) {
                arrAnswers.push(choice);
            }
        }

        return arrAnswers;
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


    //// Change the background color depending on the answer
    const reactionReponse = (isCorrect, indexCorrect) => {
        if (isCorrect) {
            setBackgroundColor(() => [48, 200, 48]);
        } else {
            setBackgroundColor(() => [200, 48, 48]);
        }

        // Setting the custom brightness
        setBrightness(() => [...Array(4).keys()].map(v => v === indexCorrect ? 2 : 0.5));

        // New question in 2s
        setTimeout(() => {
            // Restart the background color
            setBackgroundColor(() => [48, 48, 48]);
            setBrightness(() => Array(4).fill(1));

            // Pick a new question
            updateQuestion(getRandomInt(1,3)==1?'flag':'name','');
            // Update the question count
            setCount(prevCount => prevCount + 1);

            // Restart the    animation
            timerRestart();
        }, 2000);
    }


    //// Convert an array of int to a color
    const arrayToHex = (arr) => {
        return "#" + arr.map(v => v.toString(16)).join``;
    }






    const updateQuestion = (typeQuestion, question) => {
        setQuestionType(typeQuestion);

        // If the question is a flag
        if (typeQuestion === 'flag') {
            const answers = generateAnswers();
            setAnswersQuiz(() => answers.map(e => translation[e]));

            const questionTemp = randomChoice(answers);
            console.log(answers, questionTemp);

            setQuestion(() => require(`../../public/flags/main/${questionTemp}.svg`));

        // If the question is a name of a country
        } else if (typeQuestion === 'name') {
            const answers = generateAnswers();
            setAnswersQuiz(() => answers.map(img =>`${process.env.PUBLIC_URL}/flags/main/${img}.svg`)); 
            setQuestion(() => translation[randomChoice(answers)]);
        } else {
            console.error(`Unexpected type of question: ${typeQuestion}`);
        }
    } 



    return (
        <>
            <ReactComment text={'Informations about the game'}/>
            <p>{elo.user}</p>
            <div className="info-game">
                <ReactComment text={'Your profile'}/>
                <div className='left'>
                        <img src={userimg}/>
                        <p>TKirishima</p>
                        <img className='flag' src={fr}/>
                        <div>ELO: 1004</div>
                </div>

                <ReactComment text={'Question count'}/>
                {/* <div className='type-game' onClick={() => setCount(prevCount => prevCount%15 + 1)}> */}
                <div className='type-game' onClick={() => updateQuestion(getRandomInt(1,3)==1?'flag':'name','')}>
                    {count} / 15
                </div>

                <ReactComment text={'Your opponent'}/>
                <div className='right'>
                        <img src={userimg}/>
                        <p>TKirishima</p>
                        <div>ELO: 1004</div>

                        <img className='flag' src={fr}/>
                </div>

                <div className='timer' ref={timerRef}></div>
            </div>

            <p>Connected: { '' + isConnected }</p>
            <p>Number pong: { pingCount || '-' }</p>
            <button onClick={ sendPing }>Send ping</button>

            <ReactComment text={'Question'}/>
            <div className='question' style={{"backgroundColor": arrayToHex(backgroundColor.map(v => v - 24))}}>
                <p style={{"display": questionType !== 'name' ? 'none' : 'flex'}}>{t(question)}</p>
                <img src={question} style={{"display": questionType === 'name' ? 'none' : 'flex'}}/>
            </div>

            <ReactComment text={'Answer'}/>
            <div className='answer' style={{"backgroundColor": arrayToHex(backgroundColor)}}>
                {[...Array(4).keys()].map(i =>
                    <button
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
                )}
            </div>
        </>
    );
}

export default Game;
