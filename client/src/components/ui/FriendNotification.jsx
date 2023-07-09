import { Outlet, Link } from "react-router-dom";

// FriendNotification
const FriendNotification = ({name, image, flag, date, URL, notif, type, friendRequests}) => {
    const description = type === "friendRequest" ?
    "{name} sent you a friend request {date} {time} ago." : 
    "{name} invited you to play {date} {time} ago.";


    let time = "minutes";

    if (date >= 60) {
        time = "hours";
        date = Math.floor(date/60);
    } else if (date >= 24 * 60) {
        time = "days";
        date = Math.floor(date/(24 * 60));
    } else if (date >= 24 * 60 * 365.25) {
        time = "years";
        date = Math.floor(date/(24 * 60 * 365.25));
    }

    return (
        <>
            {
                notif
                &&
                <div className="notif">
                    1
                </div>
            }
            <div className="friend-notification">
                <div>
                {
                    image &&
                    <img src={image} className="pfp" alt="pfp"/>
                }
                </div>
                <div style={{position: "relative"}}>
                    <h2>{name}</h2>
                    {
                        flag && 
                        <img src={`http://localhost:3000/flags/main/${flag}.svg`} className="country"/>
                    }
                    <p>
                    {description.formatUnicode({name: name, date:Math.round(date), time:time})}
                    </p>
                </div>
                {
                    type !== "friendRequest" ?
                    <Link to={URL}>
                        <button
                            style={
                                date > 5 ?
                                {
                                    backgroundColor: "#888",
                                    cursor: "not-allowed" 
                                } : 
                                {}
                            } 
                            title="Accept the game"
                        >
                            PLAY
                        </button>
                    </Link> : 
                    <button
                        style={
                            !friendRequests?.includes(name) ?
                            {
                                backgroundColor: "#888",
                                cursor: "not-allowed" 
                            } : 
                            {}
                        } 
                        title="Accept the game"
                        onClick={() => {}}
                    >
                        ACCEPT
                    </button>
                }
            </div>
        </>
    )
};

export default FriendNotification;
