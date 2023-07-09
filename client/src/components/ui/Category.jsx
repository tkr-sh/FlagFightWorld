import { useTranslation } from "react-i18next";
import Article from './Article';

// Category
const Category = ({title, top_articles, show_article, personnal_articles, refresh}) => {
    /// Translation
    const { t, i18n } = useTranslation();
    console.warn(personnal_articles)
    console.warn(top_articles)

    return (
        <>
            <h1>{t(title)}</h1>
            <div className="article-content">
                <div className="responsive">
                    {
                    personnal_articles &&
                    top_articles.map(o =>
                        <Article
                            {...o}
                            bought={personnal_articles?.includes(o?.flag) || personnal_articles.includes(o?.message)}
                            refresh={refresh}
                        />
                    )}
                </div>
            </div>
            <p onClick={show_article} style={{cursor: "pointer"}}>
                {t('See all the items')}
            </p>
        </>
    )
};

export default Category;
