import { useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { set_chat_list, set_selected_chat } from "../Redux/storeSlice";

const Menu_chats = (props) => {
    const user = useSelector(state => state.user);
    const chatlistinfo = useSelector(state=>state.chatlist);
    const available_user = useSelector(state => state.available_user);
    const mydetails = useSelector(state=>state.user);
    const message_list = useSelector(state => state.message_list);
    const [chatUser, setChatUser] = useState([]);
    const [search, setSearch] = useState("");
    const dispatch = useDispatch();
    const new_message_count= useCallback((list,i)=>{
        var unseen_no=0;
        var last_unseen="";
        var last_unseen_set=false;
        var i =x.length-1;
        while (i>=0) {
            console.log("i jacche",i)
            if(i>0){
                if(x[i].b==false){
                    if(!last_unseen_set){
                        last_unseen_set=true;
                        last_unseen=x[i].a;
                    };
                    unseen_no++;
                    i--;
                }else{
                    return unseen_no;
                }
            }
        }
    },[])
    useEffect(() => {
        let chat_collection = [];
        if(Object.keys(user).length>0){
            user.chatlist.forEach(chat => {
                available_user.forEach(user => {
                    if (chat.includes(user.id)) {
                        chat_collection.push({ name: user.name, id: user.id, chatId: chat, image: user.image, last_seen: user.active_status, message: [], newMessage : 0 })
                    }
                })
            });
        }
        chat_collection.forEach(chat => {
            message_list.forEach(item => {
                if (item.id === chat.chatId) {
                    chat.message = item.message[item.message.length-1];
                    chat.newMessage = new_message_count(item.message,1);
                }
            })
        });
        setChatUser([...chat_collection]);
        dispatch(set_chat_list([...chat_collection]));
    }, [user, message_list, available_user])

    useEffect(()=>{
        if(search===""){
            setChatUser([...chatlistinfo]);
        }else{
            setChatUser([...chatlistinfo.filter(user=>user.name.toUpperCase().includes(search.toUpperCase()))])
        }
    },[search,chatlistinfo])


    const current_user_set=useCallback((id)=>{
        var userData = available_user.filter(user=>user.id===id);
        var info = {name:userData[0].name,image:userData[0].image,id:userData[0].id,last_seen:userData[0].active_status,fcm_token:userData[0].fcm_token};
        dispatch(set_selected_chat(info));
       },[available_user]) 
    return (
        <div className="p-4 py-2 w-full flex flex-col items-center">
            <section className="bg-slate-800 w-[80%] flex justify-evenly items-center">
                <i className="fi fi-bs-search mx-2 text-slate-400"></i>
                <input type="search" onChange={e => setSearch(e.target.value)} className="w-[90%] bg-slate-900 text-slate-400 border-0 rounded-full focus:outline-none p-3" />
            </section>
            <span className="py-2 flex flex-wrap w-full">
                {chatUser.length > 0 ?
                    <>
                        {chatUser.map((user, i) => {
                            return <span className="w-full my-2 p-2 bg-slate-600 rounded-t-2xl rounded-b-2xl shadow-md rounded-tl-none" key={i} onClick={()=>{current_user_set(user.id);props.setShow(true);}}>
                                <section className="flex flex-row gap-2 mb-2 relative items-center">
                                    <img src={user.image} alt={user.name} className=" w-12 h-12 rounded-full border-2 shadow-md" />
                                    <span className="flex flex-col items-start w-full">
                                        <span className="w-full flex flex-row justify-between items-center">
                                        <section className="font-semibold text-slate-300">{user.name}</section>
                                        {user.last_seen === "active" ?
                                        <section className="w-2 h-2 bg-green-600 absolute right-1 top-1 rounded-full"></section>
                                        : <>
                                        <section className="text-xs">
                                                last active : {new Date(parseInt(user.last_seen)).toLocaleString('en-IN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </section>
                                        </>
                                        }
                                        </span>
                                        
                                        <section className="w-full flex flex-row justify-between overflow-hidden whitespace-nowrap text-ellipsis font-semibold text-left">
                                            <span>
                                            {user.message.sentBy === mydetails.id ?
                                        <>me :</>
                                        :<></>    
                                        }    
                                            {user.message.seen === false ?
                                                <i className="fi fi-ss-check text-xs mx-1"></i> : <i className="fi fi-rs-check-double text-xs mx-1"></i>
                                            } 
                                            {user.message.message}
                                            </span>
                                            {user.newMessage>0?
                                        <> <span className="text-yellow-700 text-xs w-6 h-6 flex justify-center items-center bg-yellow-200 rounded-full">{user.newMessage}</span></>
                                        :<></>    
                                        }
                                           
                                        </section>
                                        {user.last_seen !== "active" ?
                                            <section className="text-xs">
                                                sent at : {new Date(parseInt(user.message.time)).toLocaleString('en-IN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </section>
                                            : <></>
                                        }
                                    </span>

                                    
                                    <span></span>
                                </section>
                            </span>
                        })}

                    </>
                    : <>
                        <section className="flex items-center justify-center text-slate-500 text-center h-[60vh] w-[100%]">You have not talk with anyone yet.</section>
                    </>
                }
            </span>
        </div>
    )
}

export default Menu_chats;