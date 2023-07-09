import { useReducer, useRef } from "react";


const hexToArray = (str) => {
    let r,g,b;

    if (str.length === 7) {
        [r,g,b]=[str.slice(1,2),str.slice(3,2),str.slice(5,2)].map(c => parseInt(c, 16))
    } else if (str.length === 4) {
        [r,g,b]=[str[1],str[2],str[3]].map(c=>c+c).map(c => parseInt(c, 16));
    }

    return [r,g,b].join`, `
}



const Card = ({content, gridArea=null, color=null}) => {

    const cardRef = useRef(null);

    const styleCard = (e) => {
        const {left, top, width, height} = e.target.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;

        cardRef.current.style.transform = `rotateY(${(x - width/2)/15}deg) perspective(700px) rotateX(${(height/2 - y)/15}deg)`;
        cardRef.current.style.setProperty("--mouse-x", x+"px");
        cardRef.current.style.setProperty("--mouse-y", y+"px");
        cardRef.current.style.setProperty("--color-card", hexToArray(color));
    }

    const deStyleCard = (e) => {
        cardRef.current.style.transform = "perspective(700px)";
    }


    return <div
        className="card"
        onMouseMove={(e) => styleCard(e)}
        onMouseLeave={(e) => deStyleCard(e)}
        ref={cardRef}
        style={{
            gridArea: gridArea
        }}
    >
        {content}
    </div>;
}


export default Card;