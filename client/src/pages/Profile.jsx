// Imports
/// Hooks
import { useState, useEffect, useRef, React, useContext } from 'react';
import { createPath, Link, useSearchParams, useNavigate } from "react-router-dom";
import useAuth from '../hooks/useAuth.jsx';
/// Utils
import { updateJson } from '../utils/UpdateJson.js';
import capitalize from '../utils/Capitalize.js';
/// Icons
import user from '../assets/img/user.png';
import camera from '../assets/icons/camera-solid.svg';
import image from '../assets/icons/image-solid.svg';
import banner from '../assets/img/banner.jpg';
import statsImg from '../assets/icons/stats-solid.svg';
import userPlus from '../assets/icons/user-plus-solid.svg'
import block from '../assets/icons/block-solid.svg'
import report from '../assets/icons/report-solid.svg'
import userGroup from '../assets/icons/user-group-solid.svg'
import userCheck from '../assets/icons/user-check-solid.svg'
import userHeart from '../assets/icons/user-heart-solid.svg'
import friendIcon from '../assets/icons/friends-solid.svg'
import clock from '../assets/icons/clock-regular.svg'
import UploadImage from '../components/ui/UploadImage.jsx';
import { useTranslation } from 'react-i18next';
import { MessageNotificationContext } from '../hooks/useMessageNotification.jsx';
import Report from '../components/ui/Report.jsx';



const goodNameStats = {
    nbGames: "Games",
    winRate: "Win Rate",
    maxElo: "Max ELO"
}



const Profile = () => {
    // Hooks
    /// Ref
    const imgIcon = useRef(null)
    /// Params
    const [searchParams] = useSearchParams();
    /// States
    const [self, setSelf] = useState(localStorage.getItem('name') === searchParams.get('name') || !searchParams.get('name'));
    const [userData, setUserData] = useState(self ? {
        banner: localStorage.getItem("banner") || banner,
        pfp: localStorage.getItem("pfp") || user,
        name: localStorage.getItem("name") || "User",
        country: localStorage.getItem("country") || `xx`,
        bio: localStorage.getItem("bio") ?? "...",
        elo: localStorage.getItem("elo") ||  0,
        friends: []
    } : {
        banner: banner,
        pfp: user,
        name: "User",
        country: `xx`,
        bio: "...",
        elo:  0,
        friends: []
    });
    const [stats, setStats] = useState([]);
    const [relation, setRelation] = useState("None");
    const [uploadImage, setUploadImage] = useState(false);
    const [friendList, setFriendList] = useState(localStorage.getItem("listFriends") == null ? [] : JSON.parse(localStorage.getItem("listFriends")));
    const [showReport, setShowReport] = useState(false);
    /// Auth
    const {token, authFetch} = useAuth();
    /// Navigate
    const navigate = useNavigate();
    /// Translation
    const { t, i18n } = useTranslation();
    //// Error message
    const {handleError, handleInfo, handleCorrect} = useContext(MessageNotificationContext);





    // Functions
    /// When the user hover the banner
    const hoverBanner = () => {
        imgIcon.current.style.opacity = "1";
    }
    
    /// When the user doesn't hove the banner anymore
    const leaveBanner = () => {
        imgIcon.current.style.opacity = "0";
    }

    /// Send a friend request to someone
    const sendFriendRequest = () => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({name: userData.name})
        }

        authFetch(`http://localhost:5000/api/v1/send-friend-request`, requestOptions)
        .then(rep => {
            if (rep.err !== undefined) {
                handleError(rep.err);
            }

            getRelation() // Update the relation between the users
        });
    }


    /// Get the rank of a user by his ELO
    const rankByElo = (elo) => {
        if (elo === 0) return "None";
        if (elo < 600) return "wood";
        if (elo < 1200) return "bronze";
        if (elo < 1800) return "silver";
        if (elo < 2400) return "platinium";
        if (elo < 3000) return "gold";
        if (elo < 3600) return "mercury";
        if (elo < 4000) return "diamond";
        return "uranium";
    }

    /// Update the localstorage with the information of the user
    const updateLocalStorage = (json) => {
        const elementsToUpdate = [
            "banner",
            "pfp",
            "name",
            "country",
            "bio",
            "elo",
            "friends",
        ]

        elementsToUpdate.map(element => {
            if (json[element]) {
                localStorage.setItem(element, json[element] ?? "...");
            }
        });
    }


    const getStats = () => {
        
        authFetch(`http://localhost:5000/api/v1/stats` + (searchParams.get('name') !== null ? `?name=${searchParams.get('name')}` : ""))
        .then(rep => setStats(() => rep));
    }


    /// Get the new relation between the 2 users again
    const getRelation = () => {
        authFetch(`http://localhost:5000/api/v1/relations?name=`+searchParams.get("name"))
        .then(rep => setRelation(() => rep.relation));
    }



    const blockFunc = () => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({name: searchParams.get("name")})
        }

        authFetch(`http://localhost:5000/api/v1/block-user`, requestOptions)
        .then(getRelation);
    }


    useEffect(() => {
        if (searchParams.get('name') !== null) {
            getRelation();

            authFetch("http://localhost:5000/api/v1/player-informations?name="+searchParams.get('name'))
            .then(rep => {
                setUserData(prevJson => updateJson(prevJson, rep));
                console.log(rep)

                // Get our name
                authFetch("http://localhost:5000/api/v1/name/:token?token="+localStorage.getItem("token"))
                .then(rep2 => setSelf(() => rep2.name === searchParams.get('name')))
            })
        } else {
            // Set our own profile
            setSelf(true);

            // Get our name
            authFetch("http://localhost:5000/api/v1/name/:token?token="+localStorage.getItem("token"))
            .then(rep => {

                authFetch("http://localhost:5000/api/v1/player-informations?name="+rep.name)
                .then(rep2 => {
                    if (rep2 !== userData) {
                        console.log("update")
                        setUserData(prevJson => updateJson(prevJson, rep2));
                        updateLocalStorage(rep2);
                    }
                });

            });
        }


        getStats();
    }, []);


    /// If it's our profile, get our friends
    useEffect(() => {
        if (self) {
            authFetch(`http://localhost:5000/api/v1/friends`)
            .then(rep => {
                setFriendList(rep);
                localStorage.setItem("listFriends", JSON.stringify(rep));
            });
        }
    }, [self]);



    useEffect(() => {
        console.log(friendList);
    }, [friendList]);

    

    return (
        <div className="Profile">
                {
                    uploadImage === "pfp" &&
                    <>
                        <UploadImage
                            name="Profile picture"
                            link="http://localhost:5000/api/v1/informations"
                            exitFunction={() => setUploadImage(false)}
                            type="pfp"
                            requestOptions={{
                                method: "PUT",
                                headers: { 'Content-Type': 'application/json', },
                            }}
                        />
                        <div
                            className='pop-bg'
                            style={{display: "block", position: "fixed", margin: 0}}
                            onClick={() => setUploadImage(false)}
                        />
                    </>
                }

                {
                    uploadImage === "banner" &&
                    <>
                        <UploadImage
                            name="Banner"
                            link="http://localhost:5000/api/v1/informations"
                            exitFunction={() => setUploadImage(false)}
                            type="banner"
                            requestOptions={{
                                method: "PUT",
                                headers: { 'Content-Type': 'application/json', },
                            }}
                        />
                        <div
                            className='pop-bg'
                            style={{display: "block", position: "fixed", margin: 0}}
                            onClick={() => setUploadImage(false)}
                        />
                    </>
                }


            <div className='main_profile'>
                {
                    !self ?
                    <img className='banner' src={userData.banner === false ? banner : userData.banner}/> :
                    <img
                    className='banner self-profile'
                        src={userData.banner === false ? banner : userData.banner}
                        onMouseOver={hoverBanner}
                        onMouseLeave={leaveBanner}
                        onClick={() => self && setUploadImage(prev => prev ? false : "banner")}
                    />
                }
                <img src={image} id='img-icon' ref={imgIcon}/>


                <div className={self ? 'pfp-content self-profile' : 'pfp-content'} onClick={() => self && setUploadImage(prev => prev ? false : "pfp")}>
                    <img src={userData.pfp} id="pfp"/>
                    <img src={camera} id="camera-pfp"/>
                </div>

                <div id='orga'>
                    <div className='dummydiv'></div>
                    <h1>{userData.name}</h1>
                    <div style={{"display": "flex", "alignItems": "center"}}>
                        <img src={`http://localhost:3000/flags/main/${userData.country}.svg`} className="flag"/>
                    </div>
                </div>

                <p>{userData.bio}</p>

                <div className='sub'>
                    <span className='left'><b>{t('ELO')}:</b>&nbsp;{userData.elo}</span>
                    <span className='right'><b>{t('Rank')}:</b>&nbsp;{t(capitalize(rankByElo(userData.elo)))}</span>
                </div>
            </div>

            <div className='stats' >
                <main>
                    <img src={statsImg} className="icon-category"/>

                    <title>{t('Statistics')}</title>
                    <div className='info_content'>
                        {
                            [...Object.keys(stats)].map(key =>{
                                return <article>{capitalize(goodNameStats[key] ?? key)}: {key === "created" ? new Date(stats[key]).toLocaleDateString("en-US") : stats[key]}</article>    
                            })
                        }
                    </div>
                    {/* <button className='big'>{t('More info')}</button> */}
                </main>
                {/* <button className='small'>{t('More info')}</button> */}
            </div>

            <div className='friends'>
                <img src={userGroup} className="icon-category"/>
                <title>{t('Social')}</title>
                {
                    self ?
                    // If it's our profile
                    <>
                        <div className='info_content'>
                            {
                            friendList === undefined &&
                            friendList?.isArray() &&
                            friendList?.map(friend =>
                                <a href={`http://localhost:3000/profile?name=${friend.name}`}>
                                    <article style={{order: friend.friend+2*friend.online}}>
                                        {friend.friend ?
                                            friend.online ?
                                                <div className='online'/> :
                                                <div className='offline'/>
                                                :
                                            <img src={clock} className="pending"/>
                                        }
                                        &nbsp;{friend.name}
                                    </article>
                                </a>
                            )}
                        </div>

                        <button
                            className='big'
                            onClick={() => navigate("/friends")}
                        >
                            {t('More info')}
                        </button>

                        <button
                            className='small'
                            onClick={() => document.location.href = "http://localhost:3000/friends"}
                        >
                            {t('More info')}
                        </button>
                    </>
                    :

                    // If it's the profile of someone else
                    <div className='content-button'>
                        <button className={`friend-button ${relation ?? 'none'}`} onClick={sendFriendRequest}>
                            {
                                (() => {
                                    switch (relation) {
                                        // Case they are friends
                                        case "friends":
                                            return (
                                                <>
                                                    <img src={friendIcon}/>
                                                    <span>Friends</span>
                                                </>
                                            );
                                        
                                        // Case the user follows you
                                        case "followed":
                                            return (
                                                <>
                                                    <img src={userHeart}/>
                                                    <span>Follows you</span>
                                                </>
                                            );

                                        // Case you follow this user
                                        case "following":
                                            return (
                                                <>
                                                    <img src={userCheck}/>
                                                    <span>Following</span>
                                                </>
                                            );

                                        // Case there is no relation
                                        case "none":
                                        default: 
                                            return (
                                            <>
                                                <img src={userPlus}/>
                                                <span>Add user</span>
                                            </>
                                        );
                                    }
                                })()
                            }
                        </button>   
                        <button className='block-button' onClick={blockFunc}>
                            <img src={block}/>
                            <span>{t('Block')}</span>
                        </button>

                        {
                            showReport &&
                            <>
                                <Report
                                    close={() => setShowReport(false)}
                                    name={userData.name}
                                />
                                <div
                                    className="pop-bg"
                                    style={{
                                        position: "fixed",
                                        display: "block",
                                        margin: 0
                                    }}
                                    onClick={() => setShowReport(false)}
                                />
                            </>
                        }
                        <button className='report-button' onClick={() => setShowReport(true)}>
                            <img src={report}/>
                            <span>{t('Report')}</span>
                        </button>
                    </div>
                }
            </div>
        </div>
    );
}

export default Profile;
