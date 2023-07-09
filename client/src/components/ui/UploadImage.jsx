import cross from "../../assets/icons/xmark-solid.svg";
import { ReactComponent as BackSVG } from "../../assets/icons/image-solid.svg";
import { ReactComponent as DropSVG } from "../../assets/icons/drop-solid.svg"
import { useState, useRef, useEffect, useContext, React } from 'react';
import useAuth from "../../hooks/useAuth";
import { MessageNotificationContext } from '../../hooks/useMessageNotification';
import { useTranslation } from "react-i18next";


// UploadImage
const UploadImage = ({name, link, type, requestOptions, exitFunction}) => {
    // Hooks
    /// States
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState();
    const [dragOver, setDragOver] = useState(false);
    /// Auth
    const {token, authFetch} = useAuth();
    /// Notifications
    const {handleError, handleInfo, handleCorrect} = useContext(MessageNotificationContext);
    /// Translation
    const { t, i18n } = useTranslation();



    useEffect(() => {
        if (!selectedFile) {
            setPreview(undefined);
            return;
        }

        console.log(selectedFile)

        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);

        // free memory when ever this component is unmounted
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile])


    const uploadTheImage = () => {

        if (selectedFile) {
            const headers = {
                'Content-Type': 'application/octet-stream',
                'Authorization': `Client-ID e9e12fc97324173`,
            }
            
            // Send the request
            fetch('https://api.imgur.com/3/image', {
                method: "POST",
                headers: headers,
                body: selectedFile
            })
            .then(response => response.json())
            .then(response => {
                const json = JSON.stringify({
                    data: {id: response.data.id, extension: response.data.link.split`.`.slice(-1)[0]},
                    type: type,
                });
        
                authFetch(link, {...requestOptions, body: json})
                .then(rep => {
                    if (rep.debug) {
                        handleCorrect(rep.debug);
                    } else if (rep.err) {
                        handleError(rep.err);
                    }
                });
            })
            .catch(error => {
                console.log(error);
            });
        }
    }


    const onSelectFile = (e) => {
        setSelectedFile(e.target.files[0]);
    }


    // When the file is dropped
    const dropHandler = (ev) => {
        ev.preventDefault();


        setDragOver(false);
      
        if (ev.dataTransfer.items) {
             // Use DataTransferItemList interface to access the file(s)
            [...ev.dataTransfer.items].forEach((item, i) => {
                // If dropped items aren't files, reject them
                if (item.kind === 'file') {
                    const file = item.getAsFile();
                    console.log(`… file[${i}].name = ${file.name}`);
                    setSelectedFile(file)
                }
            });
        } else {
            // Use DataTransfer interface to access the file(s)
            [...ev.dataTransfer.files].forEach((file, i) => {
                console.log(`… file[${i}].name = ${file.name}`);
                setSelectedFile(file.getAsFile());
            });
        }
    }


    return (
        <div className="upload-image">
            <img
                src={cross}
                className="cross"
                onClick={exitFunction}
            />

            <p>
                {
                    t('Upload an image for the "{v}"').formatUnicode({v: t(name).toLowerCase()}).replaceAll('"', '')
                }
            </p>
            {
                !selectedFile ?
                <section
                    onDrop={(event) => dropHandler(event)}
                    onDragOver={(event) => {setDragOver(true); event.preventDefault()}}
                    onDragLeave={() => setDragOver(false)}
                >
                    {
                        dragOver ?
                        <DropSVG/> :
                        <BackSVG/> 
                    }
                    <span>
                    {
                        t(!dragOver ? 
                        "Drag and drop an image here":
                        "You can drop the image now!")
                    }
                    </span> <br/>
                    {t('OR')} 
                    <label htmlFor="uploadimage">
                        {t('Choose an image from your computer')}
                    </label>
                    <input
                        type="file"
                        name="uploadimage"
                        id="uploadimage"
                        onChange={onSelectFile}
                        accept="image/*"
                    />
                </section> :
                <img src={preview} className="preview"/>
            }
            <div className="content-button">
                <button
                    className={selectedFile ? `hoverable` : ""}
                    style={{backgroundColor: "#C34"}}
                    onClick={() => setSelectedFile(null)}
                >
                    {t('Remove image')}
                </button>
                <button
                    className={selectedFile ? `hoverable` : ""}
                    onClick={uploadTheImage}
                >
                    {t('Post an image')}
                </button>
            </div>
        </div>
    );
};

export default UploadImage;
