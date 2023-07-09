import { Link, useLocation } from "react-router-dom";

const palette = {
    "purple": ["#c029de", "#f1aaff", "#c93de5", "#e564ff", "#a419c0"],
    "green":  ["#2bde2b", "#a8ffa8", "#3ee53e", "#8bff8b", "#19c219"],
    "blue":  ["#2bb1de", "#a8e9ff", "#3ebbe5", "#66d9ff", "#1998c2"],
    "yellow":  ["#e1ce1b", "#ffef98", "#ffbf00", "#ffef56", "#d2b209"],
    "orange":  ["#de852b", "#ffd4a8", "#e5913e", "#ffb366", "#c26e19"],
    "red":  ["#de2b2b", "#ffa8a8", "#e53e3e", "#ff6666", "#c21919"],
}


// HomeButton
const HomeButton = ({name, img, txt, link, color, botRight=null, botLeft=null, topRight=null, topLeft=null}) => {
    const arr_color = palette[color];
    let dict_style = {"gridArea": name.toLowerCase().replaceAll(" ","")};
    arr_color.forEach((e, i) => {
        dict_style[`--color-button-${i+1}`] = e;
    });

    const correctSubtitle = (arr) => {
        if (arr != null) {
            return <>
                    <b>{arr[0]}</b>: {arr[1]}
                </>;
        } else {
            return "";
        }
    }

    return (
        <Link className={name} to={link} style={dict_style}>
                <img src={img}/>
                <span>{txt}</span>.
                <div className='bg' style={{"backgroundImage": `url(${img})`}}></div>
                <div className='bot-right'>{correctSubtitle(botRight)}</div>
                <div className='bot-left'>{correctSubtitle(botLeft)}</div>
                <div className='top-right'>{correctSubtitle(topRight)}</div>
                <div className='top-left'>{correctSubtitle(topLeft)}</div>
        </Link>

    )
};

export default HomeButton;
