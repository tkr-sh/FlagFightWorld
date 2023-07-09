import arrow from "../../assets/icons/extend-arrow-solid.svg";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";


const CustomSection = ({title, arr, fun}) => {

    const [hide, setHide] = useState(true);
    const [values, setValues] = useState([]);
    const [newArr, setNewArr] = useState(arr);
    const {t, lang} = useTranslation();


    useEffect(() => {
        let tempValues = [];

        for (let e of arr) {
            tempValues.push({
                title: e,
                allow: false
            });
        }

        setValues(() => tempValues);
    }, []);


    // Change a value
    const changeValue = (val) => {
        let tempValues = values;


        // In the case it's "All"
        if (val === "All") {
            const turnOff = tempValues.filter(v => v.title === "All")[0].allow;


            tempValues = tempValues.map(
                v => {
                    return {
                        title: v.title,
                        allow: v.title === "All" ? !turnOff : turnOff,
                    }
                }
            );
        }
        // Else, just invert the state of the button
        else {
            tempValues = tempValues.map(
                v => {
    
                    console.log(v.title, val)
    
                    return {
                        title: v.title,
                        allow: v.title === val ? !v.allow : v.allow 
                    }
                }
            );
        }

        fun(tempValues);
        setValues(() => tempValues);
        console.log("Changing val", val.title)
    }

    const changeHide = () => {
        setHide(prev => !prev);
    }

    return(
        <section style={{height: hide ? "50px" : "auto"}}>
            <header onClick={changeHide}>
                <img
                    alt={"Hide/Show"}
                    src={arrow}
                    className="hide-and-show"
                    style={{transform: `rotateZ(-${hide?90:0}deg)`}}
                />
                {title}
            </header>
            <main style={{display: !hide ? "flex" : "none"}}>
                {
                    values
                    ?.map(
                        e => {

                            let tempBool = e.allow ? "#3B5" : "#B35";
                            return (
                                <button
                                    style={{ background: tempBool }}
                                    onClick={() => changeValue(e.title)}
                                >
                                    {t(e.title)}
                                </button>
                            );
                        }
                    )
                }
            </main>
        </section>
    );
}


export default CustomSection;
