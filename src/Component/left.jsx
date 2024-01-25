import { useDispatch, useSelector } from "react-redux";
import { db, messaging } from "../firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { setUser, set_log_out, set_selected_chat } from "../Redux/storeSlice";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../firebase";
import Menu_home from "../Part/Menu_home";
import Menu_chats from "../Part/Menu_chats";
const Left = (props) => {
    const { setShow } = props;
    const user = useSelector(state => state.user);
    const message_list = useSelector(state => state.message_list);
    const [new_message, setnew_message] = useState(0);
    const dispatch = useDispatch();
    const provider = new GoogleAuthProvider();
    const [menu, setMenu] = useState("home");
    const user_login = useCallback(async () => {
        signInWithPopup(auth, provider).then((credential) => {
            var login_detail = { id: credential.user.uid, name: credential.user.displayName, mail: credential.user.email, chatlist: [], image: credential.user.photoURL, active_status: "active", fcm_token: "" }
            setDoc(doc(db, "users", credential.user.uid), login_detail).then(val => {
                dispatch(setUser(login_detail));
            }).catch(error => { console.log(error); alert("Please Try Again") });

        }).catch(error => {
            return "error";
        });
    }, [dispatch, setUser])
    useEffect(() => {
        let no = 0;
        message_list.forEach(list => {
            no += new_message_count(list.message);
        })
        setnew_message(no);
    }, [message_list,user])

    const new_message_count = useCallback((list) => {
        var unseen_no = 0;
        var i = list.length-1;
        while (i >=0 ) {
            if(list[i]!==undefined){
                if (list[i].seen == false ) {
                    if (list[i].sentBy !== user.id) {
                        unseen_no++;
                    };
                }
            }
        else {
                return unseen_no;
            }
            i--;
        }
        return unseen_no;
    }, [])

    const signout = () => {
        let confirm = window.confirm("Are you want to log out ?");
        if (confirm) {
            signOut(auth).then(() => {
                window.alert("You have log out succesfully.");
                const idb = window.indexedDB;
                let _delete = idb.deleteDatabase("chatroom");
                _delete.onsuccess = () => {
                    dispatch(set_log_out());
                }
            }).catch(err => { window.alert("Please try again.") })
        }
    }

    useEffect(()=>{
        dispatch(set_selected_chat({}));
    },[menu])

    return (
        <div className={`flex flex-col w-[35%] md:w-screen z-10 md:relative bg-slate-800 min-h-full ${props.show == false ? "md:translate-x-0" : "md:translate-x-full"}`}>
            <div className="flex flex-row h-full">
                <section className="flex w-20 h-full bg-slate-950 text-white flex-col justify-between items-center py-4">
                    {user !== undefined && <>{Object.keys(user).length === 0 ?
                        <span className="w-12 h-12 bg-slate-700 rounded-full flex justify-center items-center border-2 border-green-500 cursor-pointer">
                            <i className="fi fi-rr-user text-slate-400" onClick={() => { user_login() }}></i>
                        </span>
                        : <span className="w-11 h-11 bg-slate-700 bg-cover rounded-full flex justify-center items-center border-2 border-green-500 cursor-pointer" style={{ backgroundImage: `url(${user.image})` }}>

                        </span>
                    }
                    </>
                    }

                    <span className="flex flex-col gap-10 text-lg text-slate-300 items-center">
                        <i className={`fi fi-ss-home hover:text-slate-500 cursor-pointer ${menu === "home" ? "px-3 py-2 bg-slate-800 rounded-full" : ""}`} onClick={() => { setMenu("home")  }}></i>
                        <i className={`fi fi-sr-comment hover:text-slate-500 cursor-pointer ${menu === "chats" ? "px-3 py-2 bg-slate-800 rounded-full" : ""}`} onClick={() => { setMenu("chats"); }}><span className="text-sm text-yellow-300 font-semibold absolute">{new_message > 0 ? new_message : ""}</span></i>
                        <i className={`fi fi-ss-users-medical hover:text-slate-500 cursor-pointer ${menu === "" ? "px-3 py-2 bg-slate-800 rounded-full" : ""}`}></i>
                    </span>
                    <span className="w-12 h-12 bg-slate-700 rounded-full flex justify-center items-center">
                        <i className="fi fi-bs-sign-out-alt" onClick={() => { signout() }}></i>
                    </span>
                </section>
                <section className="w-full">
                    {menu === "home" ?
                        <>
                            <Menu_home setShow={setShow} />
                        </> : <></>
                    }
                    {menu === "chats" ?
                        <Menu_chats setShow={setShow} />

                        : <></>
                    }
                </section>
            </div>

        </div>
    )
}
export default Left;