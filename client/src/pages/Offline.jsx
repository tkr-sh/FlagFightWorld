import "../style/Training.scss";
import { useState, useLayoutEffect, useCallback, useEffect, useRef, memo, React, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPath, useSearchParams } from "react-router-dom";
import all from "../assets/icons/all-solid.svg";
import arrow from "../assets/icons/extend-arrow-solid.svg";
import advanced from "../data/advanced.json";
import similarFlags from "../utils/similarFlags.json";
// import { useSocket } from '../hooks/useSocket';
import { MessageNotificationContext } from '../hooks/useMessageNotification';
/// Hooks && React based
import { useTranslation, withTranslation, Trans } from 'react-i18next';
/// Import components
import ReactComment from '../components/ui/HTMLComment';
import "../utils/shuffle.js";



const listContinent = [
    "Africa",
    "Asia",
    "Europe",
    "North America",
    "Central America and Caribbean",
    "Oceania",
    "South America",
];

const listDifficulties = [
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



const Offline = () => {
    const [searchParams] = useSearchParams();
    // Errors handle
    const {handleError, handleInfo, handleCorrect} = useContext(MessageNotificationContext);
    /// Ref
    const timerRef = useRef(null);
    const questionRef = useRef(null);
    const countDown = useRef(null);
    const spanCountDown = useRef(null);
    const chatRef = useRef([]);
    const turnRef = useRef("");
    const answersRef = useRef("");
    const correctRef = useRef("");
    const endRef = useRef(null);
    const validatingRef = useRef(false);
    /// Navigate
    const navigate = useNavigate();
    /// States
    const [test, setTest] = useState([3]);
    const [score, setScore] = useState(0);
    const [nbQuestion, setNbQuestion] = useState(1);
    const [listQuestion, setListQuestion] = useState([]);
    const [brightness, setBrightness] = useState([1, 1, 1, 1]);
    const [backgroundColor, setBackgroundColor] = useState([48, 48, 48]);
    const [answersQuiz, setAnswersQuiz] = useState(["", "", "", ""]);
    const [wrong, setWrong] = useState([]);
    const [question, setQuestion] = useState("...");
    const [questionType, setQuestionType] = useState("name");
    const [correct, setCorrect] = useState("");
    const [playerTimeOut, setPlayerTimeOut] = useState(null);
    const { t, i18n } = useTranslation();




    useEffect(() => {
        answersRef.current = answersQuiz;
    }, [answersQuiz]);

    useEffect(() => {
        correctRef.current = correct;
    }, [correct]);
    
    useEffect(() => {
        turnRef.current = nbQuestion;
    }, [nbQuestion]);




    //// Flushing the CSS
    function flushCss(element) {
        const dummy = element.offsetHeight;
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




    //// Convert an array of int to a color
    const arrayToHex = (arr) => {
        return "#" + arr.map(v => v.toString(16)).join``;
    }




    useEffect(() => {

        stopTimer();


        // Get country, continent and difficulty from URL
        let {country, continent, difficulty} =
            Object
            .fromEntries(searchParams)

        // Try to parse it
        try {
            country = +country;
            continent = JSON.parse(continent);
            difficulty = JSON.parse(difficulty);
        } catch {
            console.error("> Parsing error. <<<<<<<<<<<<<<<")
        }


        // If it's not defined
        if (country === undefined || isNaN(country)) country = 0;
        if (difficulty === undefined) difficulty = [0];
        if (continent === undefined) continent = true;


        if (
            advanced
            .filter(flag => 
                (difficulty.includes(flag.difficulty) || difficulty[0] == '0' ) &&
                (
                    (flag.isCountry && country === 1) ||
                    (!flag.isCountry && country === -1) ||
                    country === 0
                ) &&
                (continent === true || continent.includes(flag.continent))
            )
            .length === 0
        ) {
            handleError("No flag with that selection.");
            navigate("/training")
        }

        // Set the list of question to the filtered thing
        setListQuestion(
            advanced
            .filter(flag => 
                (difficulty.includes(flag.difficulty) || difficulty[0] == '0' ) &&
                (
                    (flag.isCountry && country === 1) ||
                    (!flag.isCountry && country === -1) ||
                    country === 0
                ) &&
                (continent === true || continent.includes(flag.continent))
            )
            .shuffle()
        );

        // Start the countdown
        startingCountDown();

    }, []);


    useEffect(() => {
        if (listQuestion) {
            // Start main loop
            setTimeout(() => {
                console.log(listQuestion)
                loopGame()
            }, 3_000);
        }
    }, [listQuestion])



    // Loop of the game
    const loopGame = (q=null) => {
        timerRestart()

        // Update the brightness & color of the question and answer 
        setBackgroundColor(() => [48, 48, 48]);
        setBrightness(() => Array(4).fill(1));

        // Clear the time out
        if (playerTimeOut) {
            clearTimeout(playerTimeOut);
        }

        // Get the question
        nextQuestion(q);

        // Get the current turn
        let turn = nbQuestion;



        // When the user took to much time to answer the question
        let tempTimeOut = setTimeout(async () => {
            if (nbQuestion === turn) {
                console.log("User took to much time");

                sendAnswer(-1);
            }
        }, 15_000);

        setPlayerTimeOut(() => tempTimeOut);
    };



    // Get the next question
    const nextQuestion = useCallback((q=null) => {
        let tempType = Math.random() > 0.5 ? "flag" : "name";
        // let similarFlag = Math.random() > 0.5;
        let similarFlag = Math.random() > 0.4;
        let tempQuestion = listQuestion[(q ?? turnRef.current) - 1 ];
        let tempAnswers = [];
        let tempCorrect;


        // If we need to pick random flags
        if (!similarFlag || !(tempQuestion?.extension in similarFlags)) {
            tempAnswers =
                listQuestion
                .filter(flag => 
                    flag.difficulty === tempQuestion.difficulty &&
                    flag.name !== tempQuestion.name
                )
                .shuffle()
                .slice(0, 3);
        }
        // If we need to pick similar flags
        else {
            tempAnswers =
                listQuestion
                .filter(
                    question => 
                    similarFlags[tempQuestion.extension].includes(question.extension)
                )
                .shuffle()
                .slice(0, 3);
        }

        // Add the question to the possible answers (which is the correct one)
        tempAnswers.push(tempQuestion);


        // If it doesn't have the good length, add elements to it
        if (tempAnswers?.length !== 4) {

            console.warn("Doesnt have enought flags: " + tempAnswers.map(tempAnswers => tempAnswers.name).join` ; `)
            
            let totIt = 0;
            for (let i = 0; i <= 4 - tempAnswers.length + 1; i++) {
                let tempNewPossibility = listQuestion[Math.floor(Math.random() * listQuestion.length)];

                totIt++;

                if (tempAnswers.map(e => e.name).includes(tempNewPossibility.name) && totIt < 100) {
                    i--;
                } else if (totIt < 100) {
                    tempAnswers.push(
                        tempNewPossibility
                    );
                } else {
                    tempAnswers.push(
                        advanced[Math.floor(Math.random() * advanced.length)]
                    );
                }
            }
                

            console.warn(tempAnswers)
        } 

        // Shuffle the array
        tempAnswers = tempAnswers.sort(() => Math.random() - .5);



        // If the question is the name of the flag
        if (tempType === 'name' && tempAnswers && tempQuestion) {
            tempCorrect = require(`../../public/flags/main/${tempQuestion.extension}.svg`);
            tempQuestion = tempQuestion.name;
            tempAnswers = tempAnswers.map(answer => require(`../../public/flags/main/${answer.extension}.svg`));
        }
        // If the question is the flag
        else if (tempType === 'flag' && tempAnswers && tempQuestion) {
            tempCorrect = tempQuestion.name;
            tempQuestion = require(`../../public/flags/main/${tempQuestion.extension}.svg`);
            tempAnswers = tempAnswers.map(answer => answer.name);
        }


        // Update the states
        setAnswersQuiz(tempAnswers);
        answersRef.current = tempAnswers;
        setQuestion(tempQuestion);
        setCorrect(tempCorrect);
        setQuestionType(tempType);
    });


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



    //// "Send" the answer to verify it
    const sendAnswer = (index) => {


        if (validatingRef.current) {
            return;
        } 


        validatingRef.current = true;

        let currentQuestion = nbQuestion;

        const userAnswer = index >= 0 ? answersRef.current[index] : "NaA";

        reactionReponse(userAnswer === correctRef.current, answersRef.current.indexOf(correctRef.current));
        
        // Update the wrong answers
        if (userAnswer !== correctRef.current) {
            setWrong((prev) => [...prev, turnRef.current - 1]);
        }

        // Clear the timeout that say that you were to late
        clearTimeout(playerTimeOut);



        // Create a timeout for the next question
        setTimeout(async () => {

            validatingRef.current = false;


            if (currentQuestion !== listQuestion.length) {
                // Increase the number of question that you're at
                setNbQuestion(prev => prev + 1);
                // + increase the score
                setScore(prev => prev + (userAnswer === correct));
    
                // Restart the loop
                loopGame(turnRef.current + 1);
            } else {
                // Increase the number of question that you're at
                setNbQuestion(prev => prev + 1);
                // + increase the score
                setScore(prev => prev + (userAnswer === correct));

                endRef.current.style.display = "flex";
            }
        }, 1_000);

        timerRestart();
        stopTimer();
    }


    return (
        <>
            <div className="over-solo" ref={endRef}>
                <div className="end-info">
                    <b style={{fontSize: "50px"}}>{t('Game Over!')}</b><br/>
                </div>
                {
                    wrong.length > 0 ?
                    <>
                        {t('Final score')}: {score}/{nbQuestion-1}
                        <span>{t('Errors')}:</span>
                        <div className="wrong-content">
                            <div className="wrong" style={{zIndex: 9999}}>
                                {
                                wrong.map(i =>
                                    <div><img src={`http://localhost:3000/flags/main/${listQuestion[i].extension}.svg`}/>{t(listQuestion[i].name)}</div>
                                )
                                }
                            </div>
                        </div>
                    </> :
                    <>
                        <span className="perfect">{t('Perfect!')}</span>
                        <div className="end-info">
                            {t('Final score')}: {score}/{nbQuestion-1}
                        </div>
                    </>
                }

                <div className="button-content">
                    <Link to="/">
                        <button>{t('Home')}</button>
                    </Link>
                    <Link to="/training">
                        <button>{t('Train again')}</button>
                    </Link>
                    <button onClick={() => window.location.reload()}>{t('Restart')}</button>
                </div>
            </div>

            <ReactComment text={'Countdown'}/>
            <div className='count-down' ref={countDown}>
                {test.map(e => <span ref={spanCountDown}>{e}</span>)}
            </div>

        <div className="game-content">
            <ReactComment text={'Informations about the game'}/>
            {/* <p>{elo.user}</p> */}
            <div className="info-game solo"  style={{backgroundColor: "#e5913e"}}>
                <Link to="/training" className="back">
                    <img src={arrow}/>
                </Link>
                <span>
                    <b>{t('Question')}</b>: {nbQuestion}/<b style={{fontWeight: 600}}>{listQuestion.length}</b>
                </span>
                <span>
                    <b>{t('Score')}</b>: {score}/<b style={{fontWeight: 600}}>{nbQuestion-1}</b>
                </span>
                <div className='timer' ref={timerRef}/>
            </div>



            <ReactComment text={'Question'}/>
            <div
                className='question'
                style={{
                    "backgroundColor": arrayToHex(backgroundColor.map(v => v - 24)),
                }}
                ref={questionRef}
            >
                {
                    (() => {

                        console.log(t(question))
                        console.log(t(question).match(/./gu).length)
                        console.log(t(question).match(/./gu).length > 20)
                    })()
                }
                {
                    questionType === 'name' && 
                    <p
                        style={{
                            "display": questionType !== 'name' ? 'none' : 'flex',
                            "scale": t(question).match(/./gu).length < 20 ? "1" : "0.5"
                        }}
                    >
                        {t(question)}
                    </p>
                }
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
                                "fontSize": questionType !== 'name' && answersQuiz[i]?.length > 50 ? "1.5em" : "2em"    
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
};

export default Offline;
