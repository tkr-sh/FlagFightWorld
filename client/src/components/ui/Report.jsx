import { useContext, useReducer, useRef, useState } from "react";
import useAuth from "../../hooks/useAuth";
import { MessageNotificationContext } from "../../hooks/useMessageNotification";
import "../../style/Report.scss";


const listCategory = [
    "Spam",
    "Insults or harassment",
    "Glorification of violence",
    "Misleading information",
    "Degrading behavior or profile picture",
    "Other",
]

// Report
const Report = ({name=undefined, close=undefined}) => {
    const {token, authFetch} = useAuth();
    const description = useRef(null);
    const [userName, setUserName] = useState(name);
    const [category, setCategory] = useState("");
    const [listUser, setListUser] = useState([])
   //// Error message
   const {handleError, handleInfo, handleCorrect} = useContext(MessageNotificationContext);




    /// Search a user by it's name
    const searchUser = (name) => {
        authFetch(`http://localhost:5000/api/v1/user?name=${name}`)
        .then(rep => setListUser(rep || []))
    }


    const submit = () => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({name: userName, type: category, description: description.current.value})
        }

        authFetch(`http://localhost:5000/api/v1/report-user`, requestOptions)
        .then(rep => {
            if ("err" in rep) {
                handleError(rep.err)
            } else if ("msg" in rep) {
                handleCorrect(rep.msg)
            }


            if (close !== undefined) {
                close();
            }
        });
    }



    return <div className="Report">
        {
            // Checking if we need to report a specific user
            userName === undefined ?
            // If the user is undefined => Look for a user
            <>
                Report a user
                <input placeholder="Enter a username..." onChange={(e) => searchUser(e.target.value)} type="search"/>

                {
                    listUser.length > 0 &&
                    <div className="content">
                        {
                            listUser.map(
                                user =>
                                <button title="Click on the user to report him" onClick={() => setUserName(user.name)}>
                                    <img src={user.pfp}/>
                                    {user.name}
                                </button>
                            )
                        }
                    </div>
                }
            </> :
            // Report section
            <>
                Reporting: <span style={{fontWeight: 400}}>{userName}</span>
                {
                    category === '' ?
                    <div className="content">
                    {
                        listCategory.map(
                            c => 
                            <button onClick={() => setCategory(c)}>
                                {c}
                            </button>
                        )
                    }
                    </div>:
                    <form onSubmit={(e) => {e.preventDefault(); submit(e)}}>
                        <textarea
                            className="form-report"
                            placeholder={`Report ${userName}...`}
                            ref={description}
                        />
                        <button type="submit">
                            SUBMIT
                        </button>
                    </form>
                }
            </>
        }

    </div>;
}


export default Report;