import { useTranslation } from "react-i18next";



// SettingsPopOut
const SettingsPopOut = ({innerRef, title, func, hide}) => {

    const { t, i18n } = useTranslation();

    return (
        <div className="content-main-popout" ref={innerRef} onClick={hide}>
            <div className="main-popout"  onClick={(e) => {e.stopPropagation();}}>
                <header>{t(title)}</header>
                <main

                    className={
                        title === "Term Of Services" || title === "Privacy Policy" ?
                        "legal":
                        ""
                    }

                    style={
                    title === "Term Of Services" || title === "Privacy Policy" ?
                        {
                            display: "flex",
                            justifyContent: "flex-start",
                            alignItems: "center",
                        }
                        :
                        (
                            title === "Notifications" ?
                            {
                                height: "auto",
                            } :
                            {

                            }
                        )
                    }
                >
                    {func ? func() : ""}
                </main>
            </div>
        </div>
    );
};

export default SettingsPopOut;
