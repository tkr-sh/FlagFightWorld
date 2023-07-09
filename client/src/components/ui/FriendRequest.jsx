import send from "../../assets/icons/send-solid.svg";
import reset from "../../assets/icons/reset-solid.svg";
import img from "../../assets/icons/image-solid.svg";
import { useState, useRef, useEffect, React } from 'react';
import formatUnicode from "../../utils/formatUnicode"
import { Outlet, Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

// FriendRequest
const FriendRequest = ({name, profilePicture, country, refresh}) => {
    // Hook
    const {token, authFetch} = useAuth();


    const clickProfile = () => {
        document.location.href = `http://localhost:3000/profile?name=${name}`
    }


    const accept = () => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({name: name})
        }
    
        authFetch(`http://localhost:5000/api/v1/send-friend-request`, requestOptions)
        .then(refresh);
    }


    const deny = () => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({name: name})
        }

        authFetch(`http://localhost:5000/api/v1/deny-friend-request`, requestOptions)
        .then(refresh);
    }


    return (
        <div className="friend-request">
            <div>
            {
                profilePicture &&
                <img src={profilePicture} className="pfp" onClick={clickProfile}/>
            }
            </div>
            <div style={{position: "relative"}}>
                <h2  onClick={clickProfile}>{name}</h2>
                {
                    country && 
                    <img src={require(`../../../public/flags/main/${country}.svg`)} className="country"/>
                }
                <p>
                    Sent you a friend request
                </p>
            </div>
            <div>
                <button title="Accept the friend request" className="accept" onClick={accept}/>
                <button title="Deny the friend request" className="deny" onClick={deny}/>
            </div>
        </div>
    )
};

export default FriendRequest;
