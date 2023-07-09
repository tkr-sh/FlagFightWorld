import arrow from "../../assets/icons/extend-arrow-solid.svg";
import send from "../../assets/icons/send-solid.svg";
import reset from "../../assets/icons/reset-solid.svg";
import img from "../../assets/icons/image-solid.svg";
import { useState, useRef, useEffect, useContext, React } from 'react';
import useAuth from "../../hooks/useAuth";
import { MessageNotificationContext } from '../../hooks/useMessageNotification';
import { useTranslation } from "react-i18next";



const correspondance = {
    "Username": [false, "signature", false],
    "Description": [true, "bio", false],
    "Banner": [false, "scroll", true],
    "Profile picture": [false, "pfp", true],
    "Blocked users": [true, "block", false],
    "Report user": [true, "report", false],
    "Change language": [true, "language", false],
    "Notifications": [true, "bell", false],
    "Term of services": [true, "file-contract", false],
    "Privacy policy": [true, "privacy", false],
    "Log out": [false, "log-out", false],
    "Delete account": [false, "trash", false],
}

const disconnect = (name) => {
    return ["Log out", "Delete account"].includes(name);
}


const correspondance_title = {
    "Banner": "banner",
    "Profile picture": "pfp",
    "Description": "bio",
    "Username": "name"
}


// SettingsButton
const SettingsButton = ({title, func, txt}) => {
    // Hooks
    /// Ref
    const buttonRef = useRef(null);
    const inputRef = useRef(null);
    const buttonContentRef = useRef(null);
    /// States
    const [selectImage, setSelectImage] = useState(null);
    const [pop, img_name, img_input] = correspondance[title];
    const [imgInfo, setImgInfo] = useState(undefined);
    /// Auth
    const {token, authFetch} = useAuth();
    /// Context 
    const {handleError, handleInfo, handleCorrect} = useContext(MessageNotificationContext);
    /// Translation
    const { t, i18n } = useTranslation();

    const showButtons = () => {
        buttonContentRef.current.style.visibility = "visible";
        buttonContentRef.current.style.opacity = "1";
        inputRef.current.style.right = "80px";
    };

    const hideButtons = () => {
        buttonContentRef.current.style.visibility = "hidden";
        buttonContentRef.current.style.opacity = "0";
        inputRef.current.style.right = "20px";
        if (txt && !img_input) {
            inputRef.current.value = inputRef.current.defaultValue;
        }
    };

    const isImg = () => ["Banner", "Profile picture"].includes(title)


    useEffect(() => {
        if (imgInfo && isImg()) {
            fetchUpdateInformation(imgInfo)
        }
    }, [imgInfo]);


    const fetchUpdateInformation = (data) => {
        const json = JSON.stringify({
            data: data,
            type: correspondance_title[title],
            token: localStorage.getItem("token")
        });
        console.log(`token=${localStorage.getItem('token')}`)

        authFetch('http://localhost:5000/api/v1/informations', {
            method: "PUT",
            headers: { 'Content-Type': 'application/json', },
            body: json
        })
        .then(rep => {
            if (rep.err) {
                handleError(rep.err)
            } else if (rep.debug) {
                handleCorrect(rep.debug);
            }
        });
    }



    const updateInformation = () => {
        if (isImg()) {

            const headers = {
                'Content-Type': 'application/octet-stream',
                'Authorization': `Client-ID e9e12fc97324173`,
            }
            
            // Envoyer la requête
            fetch('https://api.imgur.com/3/image', {
                method: "POST",
                headers: headers,
                body: selectImage
            })
            .then(response => response.json())
            .then(response => {
                setImgInfo(() => {return {id: response.data.id, extension: response.data.link.split`.`.slice(-1)[0]}});
            })
            .catch(error => {
                console.log(error);
            });
    
        } else {
            fetchUpdateInformation(inputRef.current.value)
        }
    }


    return (
        <>
            <button
                ref={buttonRef}
                onClick={func}
                style={pop || disconnect(title) ? {"cursor": "pointer"} : {}}
            >
                <img src={require(`../../assets/icons/${img_name}-solid.svg`)} className={disconnect(title) ? "red-img" : ""}/>
                <span style={{color: disconnect(title) ? "#E66" : ""}}>
                    {t(title)}
                </span>


                {/* For username */}
                {txt && !img_input ?
                <>
                    <input className="input-name" ref={inputRef} onClick={showButtons} defaultValue={txt} name="name"/>
                </>:
                ""}

                {/* For uploading an image */}
                {txt && img_input ?
                <>
                    <label ref={inputRef} htmlFor={txt} className="upload-image-setting">
                        <img src={img}/>
                    </label>
                    <input
                        id={txt}
                        type="file"
                        name={txt}
                        onChange={(event) => {
                            console.log(event.target.files[0]);
                            setSelectImage(() => event.target.files[0]);
                            showButtons();
                        }}
                    />
                </>:
                ""
                }


                {/* The button to submit */}
                {txt ?
                <div className="button_content" ref={buttonContentRef}>
                    <button className="send" onClick={updateInformation}>
                        <img src={send}/>
                    </button>
                    <button className="delete" onClick={hideButtons}>
                        <img src={reset}/>
                    </button>
                </div> :
                ""}



                {/* For a pop-up */}
                {pop ?
                <img src={arrow} className="extend"/>:
                ""}
            </button>
    </>
    )
};

export default SettingsButton;
