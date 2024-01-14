

import ChatBox from "./ChatBox"


const Right=(props)=>{

    return (
        <div className={`w-[65%] md:w-screen md:absolute bg-slate-900 bg-contain bg-blend-multiply h-full pb-4`} style={{backgroundImage:"url(./bg.png)"}}>
            <ChatBox setShow={props.setShow}/>
        </div>
    )
}

export default Right;