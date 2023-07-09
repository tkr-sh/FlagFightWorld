import "../../style/ChangeBio.scss"
import arrow from "../../assets/icons/extend-arrow-solid.svg";
import { useEffect, useReducer, useRef, useState } from "react";
import useAuth from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";

const ChangeBio = () => {
    const {token, authFetch} = useAuth();
    const bioAreaRef = useRef(null);
    const [bio, setBio] = useState("Loading...");
    const { t, i18n } = useTranslation();


    /**
     * Resize the height of the bio depending on the number of characters
     */
    const changeHeightBio = () => {
        bioAreaRef.current.style.height = bioAreaRef.current.value.toString().split('\n').length * 25 + "px";
    }

    /**
     * UseEffect
     */
    useEffect(() => {
        authFetch(`http://localhost:5000/api/v1/bio`)
        .then(rep => {
            bioAreaRef.current.value = rep.bio;
            setBio(() => rep.bio);
            changeHeightBio();
        });
    }, []);


    /**
     * Submit the biodescription
     */
    const submit = () => {
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({data: bioAreaRef.current.value.toString(), type: "bio"})
        }

        authFetch(`http://localhost:5000/api/v1/informations`, requestOptions);
    }



    return (
        <>
            <div className="Change-Bio">
                <div className="content-part">
                    <div className="part">
                        <header>
                            {t('Before')}
                        </header>
                        <div className="bio-content">
                            {bio}
                        </div>
                    </div>
                    <img
                        src={arrow}
                        alt={"Back"}
                        className="arrow"
                    />
                    <div className="part"> 
                        <header>
                            {t('After')}
                        </header>
                        <textarea
                            className="bio-content"
                            onKeyUp={(e) => {console.log(e); changeHeightBio(e.value)}}
                            ref={bioAreaRef}
                        >
                            {t('Loading') + "..."}
                        </textarea>
                    </div>
                </div>
                <button onClick={submit}>
                    {t('SUBMIT')}
                </button>
            </div>
        </>
    );
}

export default ChangeBio;
