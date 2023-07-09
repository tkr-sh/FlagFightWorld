// // Import images
import settings from '../assets/icons/gear-solid.svg';
import shop from '../assets/icons/store-solid.svg';
import house from '../assets/icons/house-chimney-solid.svg';
import friends from '../assets/icons/user-group-solid.svg';
import profile from '../assets/icons/id-card-solid.svg';

// Router
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';


// Image associations
const icons_title = ['Settings', 'Shop', 'Home', 'Friends', 'Profile'];
const icons_name = {
    "Settings": <img src={settings} alt="Settings"/>,
    "Shop": <img src={shop} alt="Shop"/>,
    "Home": <img src={house} alt="Home"/>,
    "Friends": <img src={friends} alt="Friends"/>,
    "Profile": <img src={profile} alt="Profile"/>
}



// Display of the icons
const IconsDisplay = (name) => {
    // Hooks
    /// Translation
    const { t, i18n } = useTranslation();
    /// Location
    const { pathname } = useLocation();


    const link_to = `/${name.toLowerCase()}`
    const selectedPage = pathname?.split("/")?.slice(-1)[0] === name.toLowerCase()
    const className = name.toLowerCase() + "-footer";
    return (
        <Link to={link_to}>
            <li className={`${["Shop", "Friends"].includes(name) ?  "darken " : "" }${className}${selectedPage ? " selected" : ""}`}>
                {icons_name[name]}
                <span>
                    {t(name)}
                </span>
            </li>
        </Link>
    )
};



// Main
const Footer = () => {
    return (
        <footer id="footer_nav">
            <ul>
                {icons_title.map(name =>  IconsDisplay(name))}
            </ul>

        </footer>
    )
};

export default Footer;
