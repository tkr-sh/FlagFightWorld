import capitalize from "../utils/Capitalize";
import {useLocation} from "react-router-dom";
import { useTranslation } from "react-i18next";

const name_corr = {
  'settings': 'gear',
  'shop': 'store',
  'home': 'house-chimney',
  'friends': 'user-group',
  'profile': 'id-card',
  'leaderboard': 'trophy',
  'collection': 'collection',
  'history': 'history',
  'training': 'target',
  'custom': 'gear'
}
  
const Header = () => {

    /// Translation
    const { t, i18n } = useTranslation();
    const { pathname } = useLocation();

    console.log(pathname)
    console.log(pathname.split("/"))
    console.log(pathname.split("/").slice(-1)[0])

    const name = pathname !== '/' && pathname != null ? capitalize(pathname?.split("/")?.slice(-1)[0]) : 'Home';

    console.warn(name)
    console.warn(name.toLowerCase)
    console.warn(name_corr[name.toLowerCase()])
  
    return (
      <header id="main_header">
        <div></div>
        <span>{t(name)}</span>
        <div>
          <img src={name.toLowerCase() in name_corr ? require(`../assets/icons/${name_corr[name.toLowerCase()]}-solid.svg`) : ""}/>
        </div>
      </header>
    );
}
  
export default Header;
  