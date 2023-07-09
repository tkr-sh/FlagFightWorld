import React, { useState, useRef, useEffect, useContext } from 'react'; // Import hooks
import { FaGoogle, FaGithub, FaStackOverflow, FaDiscord, FaDotCircle } from 'react-icons/fa';
import video from '../assets/video/background.mp4'; // Import the background
import styles from "../style/SignUp.scss"; // Import the style only for this page
import { MessageNotificationContext } from '../hooks/useMessageNotification'; // Imort message notification
import HCaptcha from "@hcaptcha/react-hcaptcha"; // Import hcaptcha

function SignUp({login=false}) {
	// Hooks
	const backgroundVideo = useRef(null);
	const bgBlur = useRef(null);
	const formRef = useRef(null);
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [token, setToken] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isOpen, setIsOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
    const {handleError, handleInfo, handleCorrect} = useContext(MessageNotificationContext);


	// Handle form
	/// On submit
	const handleSubmit = async (e) => {
		// Prevent default behaviour of submitting a form
		e.preventDefault();
		// Create a Regex for e-mail
		const emailRegex = /^(?=.{5,256}$)(^[\w\d.-]+@[\w\d.-]+\.[\w]+$)/;


		// Verify that the password is the same a the "Confirm password"
		if (!login && password !== confirmPassword) {
			handleError("The password isn't the same in 'Password' and 'Confirm password'")
			return;
		}

		// Verify that the e-mail is valid
		if (!login && !emailRegex.test(email)) {
			handleError("Please enter a valid e-mail adress.")
			return;
		}


		// If the function hasn't returned => Form seems valid => Send request
		//// Options of the Request
		const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({email: email, pwd: password, name: username, token: token})
        }

		//// Sending the request
		// If the user wants to log in
		if (login) {
			await fetch(`http://localhost:5000/auth/login`, requestOptions)
			.then(rep => rep.json())
			.then(rep => {
				// If there is an error
				if (rep.err !== undefined) {
					console.error(rep.err);
					handleError(rep.err);
				} else { // Else change page
					localStorage
					.setItem("token", rep.token)

					setTimeout(() => {
						document.location.href = `http://localhost:3000`;
					}, 500);
				}
			})
		}
		// If the user wants to create an account
		else {
			await fetch(`http://localhost:5000/auth/createEmailAccount`, requestOptions)
			.then(rep => rep.json())
			.then(rep => {
				console.log(rep)
				// If there is an error
				if (rep.err !== undefined) {
					console.error(rep.err);
					handleError(rep.err);
				} else { // Else change page
					document.location.href = `http://localhost:3000/verify?email=${email}`;
				}
			})
		}
	}

	// oAuth2
	const handleOAuth2 = (oauth2) => {
		if (oauth2 === "discord")
			document.location.href = `https://discord.com/api/oauth2/authorize?client_id=1079720455407140944&redirect_uri=https%3A%2F%2Fwww.flagfight.world%2Fauth%2Fdiscord%2Fcallback&response_type=code&scope=email%20identify`
		else 
			document.location.href = `http://localhost:5000/auth/${oauth2}`;
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
		<div className='SignUp'>
			<video autoPlay muted loop ref={backgroundVideo}>
				<source src={video}  type="video/mp4"/>
			</video>
			<div className="signup-form" ref={formRef}>
				{
					login ? 
					<>
						<h1>Log in</h1>
						<p>Come back to Flag Fight and keep learning while having fun!</p>
					</> :
					<>
						<h1>Create an account!</h1>
						<p>Join all the users who have already signed up and start quizzing today!</p>
					</>
				}
				<form onSubmit={handleSubmit}>
					<label htmlFor="username">Username</label>
					<input 
						type="text" 
						id="username" 
						value={username} 
						onChange={e => setUsername(e.target.value)}
						placeholder='A username...'
						required
					/>
					{
						!login &&
						<>
							<label htmlFor="email">Email</label>
							<input 
								type="email" 
								id="email" 
								value={email} 
								onChange={e => setEmail(e.target.value)} 
								placeholder='your@e.mail'
								required
							/>
						</>
					}

					<label htmlFor="password">Password</label>
					<input 
						type="password" 
						id="password" 
						value={password} 
						onChange={e => setPassword(e.target.value)}
						placeholder="Password..."
						required
					/>

					{
					!login &&
					<>
						<label htmlFor="confirm-password">Confirm Password</label>
						<input 
							type="password" 
							id="confirm-password" 
							value={confirmPassword} 
							onChange={e => setConfirmPassword(e.target.value)} 
							placeholder="Confirm password..."
							required
						/>
					</>
					}
					<div style={{height: "10px"}}></div>
					<HCaptcha
						sitekey="46610255-7fdb-4f45-963c-40361f3d6e27"
						onVerify={(tkn) => setToken(tkn)}
						style={{marginTop: "1em"}}
						theme="dark"
					/>
					{/* <div 
						className="h-captcha"
						data-sitekey="46610255-7fdb-4f45-963c-40361f3d6e27"
						data-theme="dark"
						size="compact"
						style={{marginTop: "1em"}}
					></div> */}
					<button type="submit">
						{
							login ?
							"Log in":
							"Sign Up"
						}
					</button>
					<div className='spacer'/>
					<div className="oauth2-buttons">
						<button onClick={() => handleOAuth2("google")} className="google-button"><FaGoogle /></button>
						<button onClick={() => handleOAuth2("github")} className="github-button"><FaGithub /></button>
						<button onClick={() => handleOAuth2("discord")} className="discord-button"><FaDiscord /></button>
					</div>
				</form>
				{
					login ? 
					<h2>Don't have an account? <a href="/signup"><b>Sign up here</b></a>.</h2>:
					<h2>Already have an account? <a href="/login"><b>Log in here</b></a>.</h2>
				}
			</div>
		</div>
	);
}

export default SignUp;
