import { Outlet, Link } from "react-router-dom";
import Footer from "../layouts/Footer.js";
import Header from "../layouts/Header.js";

const MainLayout = () => {
    return (
        <>
            <Header />
            <main id="main_page">
                <Outlet />
            </main>
            <Footer />
        </>
    )
};

export default MainLayout;
