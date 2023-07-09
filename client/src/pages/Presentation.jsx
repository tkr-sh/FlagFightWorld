import { useEffect, useRef, useState } from "react";
import "../style/Presentation.scss";
import ReactDOM from 'react-dom';
import advanced from "../data/advanced.json";
import sword from "../assets/icons/sword-solid.svg";
import collection from "../assets/icons/collection-solid.svg";
import friends from "../assets/icons/friends-solid.svg";
import target from "../assets/icons/target-solid.svg";
import convertCountry  from "../utils/convertCountry.json";
import Card from "../components/ui/Card";
import flagFightIcon from "../assets/icons/flagfight.svg";
import githubIcon from "../assets/icons/github.svg";
import { Link } from 'react-router-dom';


const Presentation = () => {

    const getNext = () => {
        return advanced[Math.floor(Math.random() * advanced.length)].extension;
    }


    const switchRef = useRef([]);
    const styleBoxRef = useRef(null);
    const firstElem = useRef(null);
    const [currentElement, setCurrentElement] = useState(0);
    const [flagArr, setFlagArr] = useState([getNext(), getNext()])




    useEffect(() => {
        mainLoop();
    }, []);


    const mainLoop = () => {
        setTimeout(() => {
            rotateElements();
            mainLoop();
        }, 2_000);
    }


    const rotateElements = () => {

        const heightElem = window.getComputedStyle(firstElem.current).getPropertyValue("height");
        firstElem.current.style.marginTop = "-"+heightElem;


        setTimeout(() => {
            setFlagArr(p => [p[1], p[1]]);
        }, 1_000);

        setTimeout(() => {
            firstElem.current.style.transition = "none";
            firstElem.current.style.marginTop = "0px";
            const dummy = firstElem.current.offsetHeight;
            firstElem.current.style.transition = "";

            setFlagArr(p => [p[0], getNext()]);
        }, 1_100);

        setCurrentElement(e => e + 1);
    }


    return <div className="Presentation">

        {/* First Page */}
        <section className="page">
            <div className="space"/>
            <img src={flagFightIcon} className="ffi"/>
            <section className="first-section">
                <h1>Learn the flag of</h1>
                <div className="switch" ref={switchRef}>
                    {
                        flagArr.map((flag,i) =>
                            <div className="element" ref={i === 0 ? firstElem : null}>
                                <img src={`/flags/main/${flag}.svg`}/>
                                <i>{convertCountry[flag]}</i>
                            </div>
                        )
                    }
                </div>
                <h1>with <b style={{fontWeight: "700"}}>Flag Fight</b></h1>
            </section>
            <div className="container">
                <div className="chevron"></div>
                <div className="chevron"></div>
                <div className="chevron"></div>
            </div>
        </section>


        {/* Second Page */}
        <section className="page">
            <div className="card-content">



                {/* Card for ranked */}
                <Card
                    content={
                        <>
                            <img src={sword}/>
                            <div
                                className="description-card"
                                dangerouslySetInnerHTML={{
                                    __html: `Play <b>online</b> with players from all over the world.<br/><br/>There are several types of games, with <b>friends</b>, for <b>fun</b> or <b>ranked</b>.`
                                }}
                            />
                        </>
                    }
                    gridArea={"ranked"}
                    color={"#6cf"}
                />


                {/* Card for single player */}
                <Card
                    content={
                        <>
                            <div
                                className="description-card"
                                dangerouslySetInnerHTML={{
                                    __html: `<b>Learn</b> any flag in <b>single player</b>, without pressure.<br/><br/>You can <b>customize</b> your learning with a multitude of filters.`
                                }}
                            >
                            </div>
                            <img src={target}/>
                        </>
                    }
                    gridArea={"solo"}
                    color={"#f83"}
                />

                {/* Card for social */}
                <Card
                    content={
                        <>
                            <div
                                className="description-card"
                                dangerouslySetInnerHTML={{
                                    __html: `Add your <b>friends</b> or people you want to <b>play with</b>.<br/><br/><b>Customize your profile</b> with a description, photo, banner and more!`
                                }}
                            >
                            </div>
                            <img src={friends} />
                        </>
                    }
                    gridArea={"social"}
                    color={"#e45"}
                />


                {/* Card for ranked */}
                <Card
                    content={
                        <>
                            <img src={collection}/>
                            <div
                                className="description-card"
                                dangerouslySetInnerHTML={{
                                    __html: `Collect <b>flags</b> and <b>messages</b> that you can send in the game and put on your profile!`
                                }}
                            >
                            </div>
                        </>
                    }
                    gridArea={"collection"}
                    color={"#A3B"}
                />

            </div>
        </section>



        {/* Third Page */}
        <section className="page last-page">
            <div className="connect"/>
            <h2>Join Flag Fight<br/>and learn all the flags</h2>
            <span>Don't wait any longer, learn flags while having fun, with a multitude of options to learn! Sign up for flag fight or log in.</span>
            <div className="button-content">
                <Link to="/signup">
                    <button>Sign up</button>
                </Link>
                <Link to="/login">
                    <button>Log in</button>
                </Link>
            </div>
        </section>


        <footer>
            <h1> FlagFight </h1>

            <a href="https://github.com/aderepas/flagfight">
                
                <img
                    alt="Github"
                    src={githubIcon}
                />
                GitHub
            </a>

            <span className="credit">Flag Fight © 2023</span>
        </footer>
    </div>;
}


export default Presentation;
