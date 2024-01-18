import { addDoc, arrayUnion, collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { db, messaging } from "../firebase";
import { set_selected_chat } from "../Redux/storeSlice";
const ChatBox = (props) => {
    const current_select_chat = useSelector(state => state.selected_chat);
    const [current_select_chat_id,setCurrent_select_chat_id]=useState("");
    const user = useSelector(state => state.user);
    const [message, setMessage] = useState("");
    const messageList = useSelector(state => state.message_list)
    const [chat, setChat] = useState([]);
    const dispatch=useDispatch();
    const chatlist_check = () => {
        var id1 = user.id + current_select_chat.id;
        var id2 = current_select_chat.id + user.id;
        if (user.chatlist.indexOf(id1) !== -1) {
            setCurrent_select_chat_id(id1);
            return { status: true, id: id1 };
        } else if (user.chatlist.indexOf(id2) !== -1) {
            setCurrent_select_chat_id(id2);
            return { status: true, id: id2 };
        }
        else {
            return { status: false, id: null };
        }
    }
    const sendMessage = async () => {
        var id1 = user.id + current_select_chat.id;
        var haveChat = chatlist_check();
        if (!haveChat.status) {
            var timestamp = new Date().getTime();
            let tokenlist = [user.fcm_token, current_select_chat.fcm_token];

            updateDoc(doc(db, "users", `${user.id}`), {
                chatlist: arrayUnion(id1.toString())
            })
            updateDoc(doc(db, "users", `${current_select_chat.id}`), {
                chatlist: arrayUnion(id1.toString())
            })
            if (user.fcm_token.length > 0 && current_select_chat.fcm_token.length > 0) {
                current_select_chat.fcm_token.forEach(id => {
                    let bodyData = { "name": user.name.toString(), "message": message.toString(), "id": id, "icon": user.image };
                    var xmlrequest = new XMLHttpRequest();
                    xmlrequest.open("post", "https://sancho-chat-server.onrender.com/send");
                    xmlrequest.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                    try {
                        xmlrequest.send(JSON.stringify(bodyData));
                    } catch (error) {
                        console.log(error)
                    }
                })
            }
            setDoc(doc(db, "chatroom-info", id1), {
                user1: { name: user.name, image: user.image, id: user.id },
                user2: { name: current_select_chat.name, image: current_select_chat.image, id: current_select_chat.id },
                last_update: new Date().getTime(),
                id: id1
            })
            let docId = doc(collection(db, "chatroom-message", id1, "messages")).id;
            await setDoc(doc(db, "chatroom-message", id1, "messages", docId), {
                message: message,
                sentBy: user.id,
                time: timestamp,
                seen: false,
                id: docId
            }).then(val => {
                setMessage("");
            })
        } else {
            var timestamp = new Date().getTime();
            updateDoc(doc(db, "chatroom-info", haveChat.id), {
                last_update: timestamp
            })
            let docId = doc(collection(db, "chatroom-message", haveChat.id, "messages")).id;
            await setDoc(doc(db, "chatroom-message", haveChat.id, "messages", docId), {
                message: message,
                sentBy: user.id,
                time: timestamp,
                seen: false,
                id: docId
            }).then(val => {
                let bodyData = { "name": user.name.toString(), "message": message.toString(), "id": current_select_chat.fcm_token.toString(), "icon":user.image };
                if (user.fcm_token !== "" && current_select_chat.fcm_token !== "") {
                    var xmlrequest = new XMLHttpRequest();
                    xmlrequest.open("post", "https://sancho-chat-server.onrender.com/send");
                    xmlrequest.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                    try {
                        xmlrequest.send(JSON.stringify(bodyData));
                    } catch (error) {
                        console.log(error)
                    }
                }
                setMessage("");
            })
        }
    }

    useEffect(() => {
        console.log("curret select chat changed")
        if(user!==undefined){
            if(Object.keys(user).length>0){
                var check = chatlist_check();
                setChat([]);
                setMessage([]);
                console.log("curret select chat changed")
                messageList.forEach(item => {
                    if (item.id === user.current_select_chat) {
                        setChat([...item.message].reverse());
                        console.log("current chat set")
                        chat.forEach(each_chat => {
                            if (each_chat.seen === false && each_chat.sentBy !== user.id) {
                                try {
                                    updateDoc(doc(db, "chatroom-message", item.id, "messages", each_chat.id), { seen: true })
                                } catch (error) {
                                    console.log(error)
                                }
        
                            }
                        })
                    }
                })
            }
        }

    }, [current_select_chat,user])

    useEffect(()=>{
        console.log("new message to chage")
        messageList.forEach(item => {
            console.log(item.id)
            if (item.id === user.current_select_chat) {
                console.log("new get to chage")
                setChat([...item.message].reverse());
                [...item.message].forEach(each_chat => {
                    if (each_chat.seen === false && each_chat.sentBy !== user.id) {
                        console.log("trying to chage")
                        try {
                            updateDoc(doc(db, "chatroom-message", item.id, "messages", each_chat.id), { seen: true })
                        } catch (error) {
                            console.log(error)
                        }

                    }
                })
            }
        })
    },[messageList])

    const date_divider = (date1, date2) => {
        const time1 = new Date(date1).toLocaleDateString();
        const time2 = new Date(date2).toLocaleDateString();
        if (time2 !== time1) {
            return <div className="w-full p-4 py-8 flex justify-center"><span className="px-4 py-2 bg-slate-950 text-slate-500 text-xs">{time1}</span></div>
        } else {
            return <></>
        }
    }

    const user_typing=()=>{
        updateDoc(doc(db,"users",user.id),{typing:true}).catch(error=>{}).then(()=>{})
    }
    const user_not_typing=()=>{
        updateDoc(doc(db,"users",user.id),{typing:false}).catch(error=>{}).then(()=>{})
    }

    return (
        <div className={`w-full h-full`}>
            {Object.keys(current_select_chat).length > 0
                ? <>
                    <section className="flex flex-row items-center w-full bg-slate-900">
                        <span onClick={() => { props.setShow(false);dispatch(set_selected_chat({})) }}><i className="fi fi-br-angle-small-left text-md text-slate-400 m-2 hidden md:block"></i></span>
                        <section className=" w-full min-h-[8%] max-h-[8%] flex flex-row justify-between items-center px-2 py-4" >
                            <span className="flex flex-col items-center gap-1 w-[95%]">
                                <span className="text-sm font-semibold text-slate-200">{current_select_chat.name}</span>
                                <span className="text-xs text-slate-400">
                                    {current_select_chat.typing===true && current_select_chat.current_select_chat_id=== current_select_chat_id?
                                <>{current_select_chat.last_seen === "active" ? "typing..." : ` Last seen : ${new Date().toLocaleDateString() === new Date(current_select_chat.last_seen).toLocaleDateString() ? new Date(parseInt(current_select_chat.last_seen)).toLocaleDateString() : new Date(parseInt(current_select_chat.last_seen)).toLocaleTimeString()}`}</>
                                :<>{current_select_chat.last_seen === "active" ? "Active Now" : ` Last seen : ${new Date().toLocaleDateString() === new Date(current_select_chat.last_seen).toLocaleDateString() ? new Date(parseInt(current_select_chat.last_seen)).toLocaleDateString() : new Date(parseInt(current_select_chat.last_seen)).toLocaleTimeString()}`}</>    
                                }
                                    
                                </span>
                            </span>
                            <section className="w-8 h-8 rounded-full bg-cover flex bg-slate-700" style={{ backgroundImage: `url(${current_select_chat.image})` }}></section>

                        </section>
                    </section>

                    <section className={"h-full"}>
                        <section className={` flex flex-col-reverse items-end min-h-[86%] max-h-[86%] overflow-x-hidden w-full p-4 `}>
                            {chat.map((each_chat, i) => {
                                return <>
                                    {i !== chat.length - 1 && i !== 0 && date_divider(chat[i - 1].time, chat[i].time)}
                                    {each_chat.sentBy === user.id ? <section className="w-full flex justify-end my-1" key={i} >
                                        <span className=" p-2 px-5 bg-sky-900 text-white text-sm rounded-t-full rounded-bl-full flex flex-col items-start">
                                            <span>{each_chat.message}</span>
                                            <span className="flex flex-row gap-1 text-[0.65rem]  -bottom-1">
                                                {new Date(parseInt(each_chat.time)).toLocaleString('en-IN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                                {each_chat.seen === false ? <i className="fi fi-ss-check "></i> : <i className="fi fi-rs-check-double text-xs"></i>}</span>
                                        </span>
                                    </section>
                                        :
                                        <section className="w-full flex justify-start items-end gap-3 my-1" key={i}>
                                            <img src={current_select_chat.image} alt="chat" className="w-6 h-6 rounded-full -bottom-1" />
                                            <span className=" p-2 px-5 bg-rose-900 text-white text-sm rounded-t-full rounded-br-full flex flex-col items-start">
                                                <span>{each_chat.message}</span>
                                                <span className="flex flex-row gap-1 text-[0.65rem]  -bottom-1">
                                                    {new Date(parseInt(each_chat.time)).toLocaleString('en-IN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                    {each_chat.seen === false ? <i className="fi fi-ss-check "></i> : <i className="fi fi-rs-check-double text-xs"></i>}</span>
                                            </span>
                                        </section>}
                                </>
                            })}
                        </section>
                        <span className="flex flex-row justify-evenly items-center min-h-[5%] max-h-[5%] ">
                            <i className="fi fi fi-rs-grin text-lg w-10 h-10 p-2 flex justify-center items-center bg-rose-600 text-white rounded-full md:hidden"></i>
                            <input type="text" className="w-4/5 h-10 pl-2.5 bg-white border-0 focus:outline-0 rounded-full" placeholder="hi !! enter your message ." value={message} onChange={(e) => { setMessage(e.target.value) }} onFocus={()=>{user_typing()}} onBlur={()=>{user_not_typing()}}/>
                            <span onClick={() => { if(message!==""){sendMessage()} }} onKeyUp={(e)=>{if(e.keyCode===13 && message!==""){sendMessage()}}}><i className="fi fi-rs-paper-plane text-lg w-10 h-10 p-2 flex justify-center items-center bg-sky-900 text-white rounded-full"></i></span>
                        </span>
                    </section>
                </>
                : <>
                    <p>Select a user to chat</p>
                </>
            }

        </div>
    )
}
export default ChatBox;