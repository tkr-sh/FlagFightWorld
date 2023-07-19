import React, { useState, useRef, useEffect, useContext } from 'react'; // Import hooks
import video from '../assets/video/background.mp4'; // Import the background
import { MessageNotificationContext } from '../hooks/useMessageNotification'; // Imort message notification
import { useSearchParams } from 'react-router-dom';


// Verify Mails
const VerifyMail = () => {
    // Hooks
    const [searchParams] = useSearchParams();
	const backgroundVideo = useRef(null);
	const formRef = useRef(null);
	const [email, setEmail] = useState(searchParams.get("email"));
	const [code, setCode] = useState("");
    const {handleError, handleInfo, handleCorrect} = useContext(MessageNotificationContext);


	// Handle form
	/// On submit
	const handleSubmit = async (e) => {
		// Prevent default behaviour of submitting a form
		e.preventDefault();

		// Options of the request
		//// Sending the email and the code
		const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({email: email, code: code})
        }


		// Verify the code for the email
		await fetch("http://localhost:3000/auth/verify", requestOptions)
		.then(rep => rep.json())
		.then(rep => {
			if (rep.err !== null && rep.err !== undefined) {
				handleError(rep.err);
			} else {
				localStorage.setItem("token", rep.token);

				setTimeout(() => {
					document.location.href = "http://localhost:3000";
				}, 500);
			}
		});
	}


	/**
	 * Resize the video
	 */
	const resizeVideo = () => {
		const {videoHeight, videoWidth} = backgroundVideo.current;
		const coef = videoWidth/videoHeight;

		console.log(coef)

		if (isNaN(coef)) {
			setTimeout(resizeVideo, 100)
		}

		if (window.innerWidth < window.innerHeight * coef) {
			backgroundVideo.current.style.width = "auto";
			backgroundVideo.current.style.height = "100vh";
			backgroundVideo.current.style.left = `calc((-100vh * ${coef}) / 2 + 50vw)`;
			backgroundVideo.current.style.top = `0`;
		} else {
			// backgroundVideo.current.style.left = `${}px`;
			backgroundVideo.current.style.top = `calc((-100vw * ${1/coef}) / 2 + 50vh)`;
			backgroundVideo.current.style.left = `0`;
			backgroundVideo.current.style.width = "100%";
			backgroundVideo.current.style.height = "auto";
		}
	}

	// UseEffect
	useEffect(() => {
		// Resize Video
		resizeVideo();
		window.addEventListener("resize", resizeVideo);
	}, []);

	return (
		<div className='verify-email'>
			<video autoPlay muted loop ref={backgroundVideo}>
				<source src={video}  type="video/mp4"/>
			</video>
			<div className="signup-form verify-box" ref={formRef}>
                <h1>We sent a mail to {email === null ? "your e-mail adress" : <i>"{email}"</i>} with the code.</h1>
                <h3>Don't forget to check your spams!</h3>   
                <form className='verify-form' onSubmit={handleSubmit}>
                    <input
                        type="text" 
                        id="username" 
                        onChange={e => setCode(e.target.value)}
                        placeholder='XXXXXX'
                        maxLength={6}
                        required
                    />
                    <button type="submit">
						SUBMIT THE CODE
					</button>
                </form>
			</div>
		</div>
	);
}

export default VerifyMail;
