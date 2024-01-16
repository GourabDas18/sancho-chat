import { useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { set_selected_chat } from "../Redux/storeSlice";
import { auth, db } from "../firebase";
import { GoogleAuthProvider,signInWithPopup } from "firebase/auth";
import { setDoc,doc, getDoc } from "firebase/firestore";
import { setUser } from "../Redux/storeSlice";

const Menu_home=(props)=>{
    const all_available_user=useSelector(state=>state.available_user);
    const selected_chat=useSelector(state=>state.selected_chat);
    const [user_show,setUser_show]=useState([]);
    const [search,setSearch]=useState("");
    const dispatch = useDispatch();
    useEffect(()=>{
        if(search===""){
            setUser_show([...all_available_user]);
        }else{
            setUser_show([...all_available_user.filter(user=>user.name.toUpperCase().includes(search.toUpperCase()))])
        }

        if(Object.keys(selected_chat).length>0){
            current_user_set(selected_chat.id);
        }
    },[search,all_available_user])

   const current_user_set=useCallback((id)=>{
    var userData = all_available_user.filter(user=>user.id===id);
    var info = {name:userData[0].name,image:userData[0].image,id:userData[0].id,last_seen:userData[0].active_status,fcm_token:userData[0].fcm_token};
    dispatch(set_selected_chat(info));
   },[all_available_user]) 

   const provider = new GoogleAuthProvider();
   const user_login = useCallback(async () => {
    signInWithPopup(auth, provider).then((credential) => {
        var login_detail = { id: credential.user.uid, name: credential.user.displayName, mail: credential.user.email, chatlist: [], image: credential.user.photoURL, active_status: "active",fcm_token:"" }
        getDoc(doc(db, "users", credential.user.uid)).then(snapshot=>{
            if(snapshot){
                dispatch(setUser(snapshot.data()));
            }else{
                setDoc(doc(db, "users", credential.user.uid), login_detail).then(val => {
                    dispatch(setUser(login_detail));
                }).catch(error => { console.log(error); alert("Please Try Again") });
            }
        });


    }).catch(error => {
        return "error";
    });
}, [dispatch, setUser])

    return(
        <div className="p-4 py-2 w-full flex flex-col items-center">
            <p className=" p-2 text-slate-500 ">Available User</p>
            <section className="bg-slate-800 w-[80%] flex justify-evenly items-center">
            <i className="fi fi-bs-search mx-2 text-slate-400"></i>
            <input type="search" onChange={e=>setSearch(e.target.value)} className="w-[90%] bg-slate-900 text-slate-400 border-0 rounded-full focus:outline-none p-3"/>
            </section>
             <span className="py-2 flex flex-wrap">
            {all_available_user.length>0?
            <>
            {user_show.map((user,i)=>{
                return <section key={i} style={{backgroundImage:`url(${user.image})`}} className="w-28 h-32 bg-cover rounded-lg border-2 border-slate-200 m-6 flex justify-start items-end cursor-pointer" onClick={()=>{current_user_set(user.id);props.setShow(true);}}>
                   <span className="text-sm text-slate-200 p-2 ">{user.name}</span> 
                </section>
            })}
            
            </>
            :<>
            <div className="flex flex-col items-center">
            <span className="text-slate-200">No User</span>
            <div className="text-slate-300 my-20 flex flex-col items-center gap-3 p-14 bg-slate-950">
            Please
            <button className="bg-slate-300 text-slate-600 mx-3 w-20 h-8" onClick={()=>{user_login()}}>Log In</button>
            and continue.
            </div>
            </div>
            
            </>    
        }
            </span>
        </div>
    )

}

export default Menu_home;