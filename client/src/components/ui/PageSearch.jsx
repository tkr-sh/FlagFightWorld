import { useState } from "react"

// Icons
import start from "../../assets/icons/backward-solid.svg"
import prev from "../../assets/icons/caret-left-solid.svg"
import next from "../../assets/icons/caret-right-solid.svg"
import end from "../../assets/icons/forward-solid.svg"


const PageSearch = ({indexPage, nbPage, updateParentPage}) => {

    const [page, setPage] = useState(indexPage);
    const updatePage = (funcUpdate) => {
        updateParentPage(funcUpdate);
        setPage(funcUpdate);
    }


    return (
        <div className="page-search">
            <img
                src={start}
                style={{opacity: +(page!==1)}}
                onClick={() => updatePage(() => 1)}
            />
            <img
                src={prev}
                style={{opacity: +(page!==1)}}
                onClick={() => updatePage(page => Math.max(page - 1, 1))}
            />
            {[...Array(7).keys()].map(i => {
                const n = i - 3

                if (n + page < 1 || n + page > nbPage) {
                    console.log(n, i)
                    return;
                }

                if (i === 0) {
                    return <><button onClick={() => updatePage(() => 1)}>1</button> ...</>
                } else if (i === 3) {
                    return <button className="selected">{page}</button>
                } else if (i === 6) {
                    return (<>... <button onClick={() => updatePage(() => nbPage)}>{nbPage}</button></>)
                } else {
                    return <><button onClick={() => updatePage(() => page + n)}>{page + n}</button></>
                }
                
            })
            }

            <img
                src={next}
                style={{opacity: +(page!==nbPage && nbPage>1)}}
                onClick={() => updatePage(page => Math.min(page + 1, nbPage))}
            />
            <img
                src={end}
                style={{opacity: +(page!==nbPage && nbPage>1)}}
                onClick={() => updatePage(() => nbPage)}
            />
        </div>
    )
} 


export default PageSearch;