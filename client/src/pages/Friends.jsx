import { useState, useEffect, useRef, useContext, React } from 'react';
import bell from '../assets/icons/bell-solid.svg';
import friendImg from '../assets/icons/user-group-solid.svg';
import addUser from '../assets/icons/user-plus-solid.svg';
import clock from '../assets/icons/clock-regular.svg';
import friendsImg from '../assets/icons/friends-solid.svg';
import reception from '../assets/icons/reception-solid.svg';
import FriendPreview from '../components/ui/FriendPreview';
import FriendNotification from '../components/ui/FriendNotification';
import FriendRequest from '../components/ui/FriendRequest';
import userPfp from '../assets/img/user.png';
import ReactComment from '../components/ui/HTMLComment';
// import "./style/App.scss"
import { useTranslation, withTranslation, Trans } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import { MessageNotificationContext } from '../hooks/useMessageNotification';


const Friends = () => {
    // Hooks
    //// States
    const [userName, setUserName] = useState("");
    const [friendRequests, setFriendRequests] = useState([]);
    const [friends, setFriends] = useState(localStorage.getItem("listFriends") == null || localStorage.getItem("listFriends") == '{"err":"Invalid token"}' ? [] : JSON.parse(localStorage.getItem("listFriends")));
    const [notifications, setNotifications] = useState([]);
    const [selectedWindow, setSelectedWindow] = useState(1);
    const [userSelection, setUserSelection] = useState([{name: "Loading...", pfp: userPfp}]);
    //// Ref
    const selectorFriends = useRef(null);
    const popOut = useRef(null);
    const mainFriends = useRef(null);
    //// Auth request
    const {token, authFetch} = useAuth();
    //// Translation
    const { t, i18n } = useTranslation();
    //// Error message
    const {handleError, handleInfo, handleCorrect} = useContext(MessageNotificationContext);



    // Functions
    //// Get the list of friends of the user
    const getMyFriends = () => {
        authFetch(`http://localhost:3000/api/v1/friends`)
        .then(rep => {
            setFriends(rep);
            localStorage.setItem("listFriends", JSON.stringify(rep));
        });
    }

    //// Send friend request 
    const sendFriendRequest = (name) => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({name: name})
        }

        authFetch(`http://localhost:3000/api/v1/send-friend-request`, requestOptions)
        .then((rep) => {
            // Check if there is an error
            if (rep.err) {
                handleError(rep.err);
            }
             // Update the relation between the users
            else {
                getMyFriends();
                getFriendRequests();
            }
        });
    }


    //// Get all the friend requests of the user
    const getFriendRequests = () => {
        authFetch(`http://localhost:3000/api/v1/friend-requests`)
        .then(rep => setFriendRequests(rep))
    }

    //// Refresh the friends of the user
    const refreshFriends = () => {
        setTimeout(() => {
            getMyFriends();
            getFriendRequests();
            refreshFriends();
        }, 60_000);
    }

    /// Search a user by it's name
    const searchUser = (name) => {
        authFetch(`http://localhost:3000/api/v1/user?name=${name}`)
        .then(rep => setUserSelection(rep || []))
        setUserName(name);
    }

    /// Function when you scroll the list of friends
    const scrollFunction = () => {
        if (mainFriends.current.scrollTop > 0) {
            selectorFriends.current.style.height = window.innerWidth > 600 ? "40px" : "30px";
            mainFriends.current.style.height = `calc( 100% - 115px - ${window.innerWidth > 600 ? 10 : 0 }px)`;
            popOut.current.style.top = window.innerWidth > 600 ? "95px" : "85px";
        } else {
            mainFriends.current.style.height = `calc( 100% - 135px - ${window.innerWidth > 600 ? 20 : 0 }px)`;
            selectorFriends.current.style.height = window.innerWidth > 600 ? "70px" : "50px";
            popOut.current.style.top = window.innerWidth > 600 ? "125px" : "105px";
        }
    };

    //// Get the notifications of the user
    const getNotification = () => {
        authFetch("http://localhost:3000/api/v1/notification")
        .then((rep) => {
            rep = rep.map(notif => {
                const type = notif.description === "Send you a friend request!" ? "friendRequest" : "gameRequest";


                notif.date = (new Date().getTime() - new Date(notif.created).getTime()) / 1000 / 60
                notif.name = notif.title;
                notif.type = type;
                notif.URL = type === "friendRequest" ? "" : `/game/waiting?type=friend&name=${notif.title}`
                
                return notif;
            })
            console.log(new Date(new Date() - new Date(rep.created)))
            setNotifications(() => rep);    
        });
    }



    //// useEffect
    useEffect(() => {
        if (mainFriends.current) {
            mainFriends.current.onscroll = scrollFunction;
        }

        getMyFriends();
        getFriendRequests();
        refreshFriends();
        getNotification();
    }, []);

    


    console.log(localStorage.getItem("listFriends") )
    console.log(friends)

    return (
        <div className="Friends">
            <div className='selector-friends' ref={selectorFriends}>
                <button onClick={() => setSelectedWindow(0)}><img src={bell}/>{t('Notifications')}</button>
                <button onClick={() => setSelectedWindow(1)}><img src={friendImg}/>{t('Friends')}</button>
                <button onClick={() => setSelectedWindow(2)}><img src={reception}/>{t('Friend requests')}</button>
            </div>
            
            <ReactComment text={'The textarea to add friends'}/>
            <textarea onChange={(e) => searchUser(e.target.value)} placeholder={t("Add a friend...")}/>

            <ReactComment text={'The pop-out where you can see people with name'}/>
            <div className='popOut' ref={popOut} style={{display: userName.length > 0 ? "flex" : 'none'}}>
                {userSelection.length > 0 &&
                friends !== undefined &&
                friends !== null &&
                Array.isArray(friends) ?
                userSelection.map(
                    user => {

                        const theyAreFriends = friends?.filter(f => f.friend)?.map(f => f.name)?.includes(user.name);
                        const pending = friends?.map(f => f.name)?.includes(user.name);

                        return <div>
                        <img src={user.pfp}/>
                        <span onClick={() => document.location.href = `http://localhost:3000/profile?name=${user.name}`}>
                            {user.name}
                        </span>


                        <button
                            onClick={() => sendFriendRequest(user.name)}
                            style={{
                                backgroundColor: theyAreFriends ? "#3B5" : ( pending ? "#C83" : "none" )
                            }}    
                        >
                            <img
                                src={
                                    theyAreFriends ?
                                        friendsImg :
                                        (
                                            pending ?
                                            clock :
                                            addUser
                                        )
                                }
                            />
                        </button>
                    </div>
                    }
                ) :
                <p style={{textAlign: "center", fontSize: "16px", fontWeight: "600"}}>
                    No user with that name.
                </p>
                }
            </div>

            <ReactComment text={'The main window'}/>
            <main ref={mainFriends}>
                
                <div style={{display: selectedWindow === 0 ? "flex" : "none"}} className="notification-content">
                    {
                        notifications.map(
                            notification => {
                                return <FriendNotification {...notification} friendRequests={friendRequests}/>
                            }
                        )
                    }
                </div>
                
                <div style={{display: selectedWindow === 1 ? "block" : "none"}}>
                    <ReactComment text={'Online friends'}/>
                    <h1>
                        {
                            console.log(friends)
                        }
                        {t('Online')} - {friends.filter(friend => friend.online).length}
                        <div id='online'/>
                    </h1>
                    <div className='friend-content'>
                        {
                            friends
                            .filter(friend => friend.online)
                            .map(
                                friend =>
                                <FriendPreview
                                    name={friend.name}
                                    country={friend.country}
                                    profilePicture={friend.pfp}
                                    refresh={getMyFriends}    
                                />
                            )
                        }
                    </div>

                    <ReactComment text={'Offline friends'}/>
                    <h1>
                        {
                            console.log(friends)
                        }
                        {t('Offline')} - {friends.filter(friend => !friend.online && friend.friend).length}
                        <div id='offline'/>
                    </h1>
                    <div className='friend-content'>
                        {
                            friends
                            .filter(friend => !friend.online && friend.friend)
                            .map(
                                friend =>
                                <FriendPreview
                                    name={friend.name}
                                    country={friend.country}
                                    profilePicture={friend.pfp}
                                    refresh={getMyFriends}    
                                />
                            )
                        }
                    </div>


                    <ReactComment text={'Pending friend request'}/>
                    <h1>
                        {
                            console.log(friends)
                        }
                        {t('Pending')} - {friends.filter(friend => !friend.friend).length}
                        <img src={clock}/>
                    </h1>
                    <div className='friend-content'>
                        {
                            friends
                            .filter(friend => !friend.online)
                            .map(
                                friend =>
                                <FriendPreview
                                    name={friend.name}
                                    country={friend.country}
                                    profilePicture={friend.pfp}
                                    refresh={getMyFriends}    
                                />
                            )
                        }
                    </div>
                </div>

                <div style={{display: selectedWindow === 2 ? "flex" : "none"}} className="notification-content">
                    {
                        friendRequests.length > 0 ?
                        friendRequests.map((user) =>
                            <FriendRequest
                                name={user.name}
                                country={user.country}
                                profilePicture={user.pfp}
                                date={10}
                                refresh={getFriendRequests}
                            />
                        ) :
                        <p style={{textAlign: "center", fontSize: "20px"}}>{t('No friend requests for the moment')}</p>
                    }
                </div>
            </main>
        </div>
    );
}

export default Friends;
