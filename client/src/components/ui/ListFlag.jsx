import advanced from "../../data/advanced.json"
import { useTranslation } from "react-i18next";

// ListFlag
const ListFlag = ({difficulty=0, isCountry, continent}) => {
    /// Translation
    const { t, i18n } = useTranslation();

    return (
        <>
            {
                advanced
                .filter(flag =>
                    (difficulty <= 0 || flag.difficulty === difficulty) &&
                    (!isCountry || flag.isCountry) &&
                    (!continent || flag.continent === continent)
                )
                .map(flag =>
                    <div className="list-flag-elem">
                        <img
                            src={`${process.env.PUBLIC_URL}/flags/main/${flag.extension}.svg`}
                            alt={flag.extension}
                        />
                        <span>
                            {t(flag.name)}
                        </span>
                    </div>
                )
            }
        </>
    );
};

export default ListFlag;
