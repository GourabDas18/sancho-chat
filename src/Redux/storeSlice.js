import { createSlice } from "@reduxjs/toolkit";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
const initialState = {
    user: {},
    available_user: [],
    selected_chat: {},
    message_list: [],
    chatlist: []
}


const storeSlice = createSlice({
    name: "storeSlice",
    initialState: initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            console.log('user update');
        },
        set_available_user: (state, action) => {
            state.available_user = action.payload;
            console.log("available")
        }
        ,
        set_selected_chat: (state, action) => {
            console.log("setting user one time--------------------")
            if(Object.keys(action.payload).length>0){
                if(action.payload.type==="self"){
                    
                        if(action.payload.data.current_select_chat_id!==undefined && state.user.current_select_chat !==action.payload.data.current_select_chat_id){
                            updateDoc(doc(db,"users",state.user.id),{
                                current_select_chat:action.payload.data.current_select_chat_id
                            }).catch(error=>{}).then(()=>{console.log("doc update")})
                        }else{
                            if(state.user.current_select_chat !== ""){
                                updateDoc(doc(db,"users",state.user.id),{
                                    current_select_chat:""
                                }).catch(error=>{}).then(()=>{console.log("doc update blank")})
                            }
                        }
                    
                }
    
                state.selected_chat = action.payload.data;
            }else{
                if(Object.keys(state.user).length>0){
                    state.selected_chat={}
                    updateDoc(doc(db,"users",state.user.id),{
                        current_select_chat:""  
                    }).catch(error=>{}).then(()=>{console.log("clear selection")})
                }
            }

            console.log("action payload done");
       
        },
        set_chat_list: (state, action) => {
            state.chatlist = action.payload;
            console.log("chatlist")
        },
        set_message_list: (state, action) => {
            console.log("message list set")
            const { id, message } = action.payload;
            let haveMessage = false;
            state.message_list.forEach(element => {
                if (element.id === id) {
                    message.forEach(item => {
                        var havemessage = false;
                        element.message.forEach(message => {
                            if (message.id === item.id) {
                                havemessage = true;
                                if (message.seen !== item.seen) {
                                    message.seen = true;
                                }
                            }
                        });
                        if (havemessage === false) {
                            element.message.push(item)
                        }
                    })
                    haveMessage = true;
                }
                element.message.sort((a, b) => parseInt(a.time) - parseInt(b.time));
            });
            if (haveMessage === false) {
                state.message_list = [...state.message_list, { id: id, message: [...message] }];
            }
        },
        set_log_out : (state,action)=>{
            state.user= {};
            state.available_user= [];
            state.selected_chat= {};
            state.message_list= [];
            state.chatlist= [];
        }
    }
})

export const { setUser, set_available_user, set_selected_chat, set_message_list, set_chat_list,set_log_out } = storeSlice.actions;
export default storeSlice.reducer;