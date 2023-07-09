import send from "../../assets/icons/send-solid.svg";
import reset from "../../assets/icons/reset-solid.svg";
import img from "../../assets/icons/image-solid.svg";
import { useState, useRef, useEffect, React } from 'react';
import useAuth from "../../hooks/useAuth";



// FriendPreview
const FriendPreview = ({name, profilePicture, country, refresh}) => {
    const {token, authFetch} = useAuth();


    const clickProfile = () => {
        document.location.href = `http://localhost:3000/profile?name=${name}`
    }


    const play = () => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({name: name})
        }
    
        authFetch(`http://localhost:5000/api/v1/send-game-request`, requestOptions)
        .then(() => {document.location.href = `http://localhost:3000/game/waiting?type=friend&name=${name}`});
    }

    const deny = () => {
        const requestOptions = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({name: name})
        }

        authFetch(`http://localhost:5000/api/v1/friend`, requestOptions)
        .then(refresh);
    }

    const block = () => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({name: name})
        }

        authFetch(`http://localhost:5000/api/v1/block-user`, requestOptions)
        .then(refresh);
    }



    return (
        <div className="friend-preview">
            {
                profilePicture &&
                <img onClick={clickProfile} src={profilePicture} className="pfp"/>
            }
            <h2 onClick={clickProfile}>{name}</h2>
            {
                country && 
                <img src={`http://localhost:3000/flags/main/${country}.svg`} className="country"/>
                // <img src={require(`../../../public/flags/main/${country}.svg`)} className="country"/>
            }
            <div className="content-button">
                <button className="send" title="Invite friend" onClick={play}>PLAY</button>
                <button className="remove" title="Remove friend" onClick={deny}/>
                <button className="block" title="Block user" onClick={block}></button>
                <button className="report" title="Remove user"></button>
            </div>
        </div>
    )
};

export default FriendPreview;