 /////////////
// IMPORTS //
/////////////
// React
import { useState, useEffect, React } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, json } from "react-router-dom";
import io from 'socket.io-client';
// Style
import "./style/App.scss";
// Pages
import MainLayout from "./pages/MainLayout";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";
import Settings from "./pages/Settings";
import Shop from "./pages/Shop";
import NoPage from "./pages/404";
import Waiting from "./pages/Waiting";
import Game from "./pages/Game";
import SignUp from './pages/SignUp';
import Online from './pages/Online';
import Test from './pages/Test';
import Leaderboard from './pages/Leaderboard';
import Collection from './pages/Collection';
import History from './pages/History';
import Training from './pages/Training';
import Offline from './pages/Offline';
import Custom from './pages/Custom';
import Presentation from './pages/Presentation';
import VerifyMail from './pages/VerifyMail';
import StockToken from './pages/StockToken';
import MessageNotification from './components/ui/MessageNotification';
import { MessageNotificationProvier } from './hooks/useMessageNotification';
import FriendGlobalNotification from './components/ui/FriendGlobalNotification';
import userPfp from "./assets/img/user.png"
import useAuth from './hooks/useAuth';
import Welcome from './components/ui/Welcome';


const socket = io();



// App
const App = () => {
    const [notification, setNotification] = useState([]);
    const {token, authFetch} = useAuth();

	// Filter the notification to remove the data that needs to be removed
	const removeNotification = (data) => {
		setNotification(
			(prev) =>
				prev.filter((notif) => JSON.stringify(notif) !== JSON.stringify(data)) 
		);
	}

    const showNotif = (name) => localStorage.getItem(name) !== false;



    // UseEffect
    useEffect(() => {
        // If the token is valid
        if (token !== null && token !== undefined) {

            // Join the room to receive the notification 
            socket.emit('join', token);

            // When you receive a notification
            socket.on("notification", (data) => {

                // If the user refuses to have notifications
                //// Friend notification
                if (data.type === "friendRequest" && !showNotif("friendNotif")) {
                    return;
                }
                //// Game notification 
                if (data.type === "gameRequest" && !showNotif("gameNotif")) {
                    return;
                }





                // Handle the notification
                let yesFunc, noFunc;

                if (data.type === "friendRequest") {

                    const requestOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', },
                        body: JSON.stringify({name: data.name})
                    }

                    yesFunc = () => {
                        authFetch(`http://localhost:3000/api/v1/send-friend-request`, requestOptions);
                    }

                    noFunc = () => {
                        authFetch(`http://localhost:3000/api/v1/deny-friend-request`, requestOptions);
                    }
                } else {
                    yesFunc = () => document.location.href = `http://localhost:3000/game/waiting?type=friend&name=${data.name}`;
                    noFunc = () => {};
                }


                data.yesFunc = yesFunc;
                data.noFunc = noFunc;


                setNotification((prev) => [...prev, data]);

				// Remove the notification after 10 seconds
                setTimeout(() => {
                    removeNotification(data)
                }, 15_000);
            });
        }
    }, []);



    return (
        <BrowserRouter>
        <MessageNotificationProvier>
			<div className='global-notification-content'>
				{
				notification.map((notif, i) => <FriendGlobalNotification {...notif} hide={() => removeNotification(notif)} />)
				}
			</div>
            {
                localStorage.getItem('new') === null && localStorage.getItem('token') !== null ?
                <Welcome/>:
                ""
            }

            <MessageNotification/>
            <Routes>
                {   
                    token === null &&
                    <Route index element={<Presentation />}/>
                }
                <Route path="/" element={<MainLayout />} >
                    <Route index element={<Home />} />
                    {
                        token !== null &&
                        <Route path="home" element={<Home />} />
                    }
                    <Route path="profile" element={<Profile />} />
                    <Route path="friends" element={<Friends />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="leaderboard" element={<Leaderboard />} />
                    <Route path="shop" element={<Shop />} />
                    <Route path="collection" element={<Collection />} />
                    <Route path="history" element={<History />} />
                    <Route path="training">
                        <Route index element={<Training />} />
                        <Route path="custom" element={<Custom />} />
                    </Route>
                    <Route path="*" element={<NoPage />} />
                </Route>
                <Route path="/game">
                    {/* <Route index element={<Waiting />} /> */}
                    {/* <Route path="game" element={<Game />} /> */}
                    <Route path="waiting" element={<Waiting />}/>
                    <Route path="online" element={<Online />} />
                    <Route path="offline" element={<Offline />} />
                    {/* <Route path="test" element={<Test />} /> */}
                </Route>
                <Route path="/signup" element={<SignUp />}/>
                <Route path="/login" element={<SignUp login={true} />}/>
                <Route path="/verify" element={<VerifyMail />}/>
                <Route path="/stockToken" element={<StockToken />}/>
            </Routes>
        </MessageNotificationProvier>
        </BrowserRouter>
    );
}

export default App;
