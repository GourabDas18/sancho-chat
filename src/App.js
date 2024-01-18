
import { useCallback, useEffect, useState } from 'react';
import "../src/firebase";
import './App.css';
import Left from './Component/left';
import Right from './Component/Right';
import { auth, db, messaging, onMessageListener } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, limit, onSnapshot, query, updateDoc, orderBy, where } from 'firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, set_available_user, set_message_list } from './Redux/storeSlice';
import { getToken } from 'firebase/messaging';
function App() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const [chatList, setChatList] = useState([]);
  const [listening_chatList, setlistening_ChatList] = useState([]);
  const [show, setShow] = useState(false);
  const [height, setHeight] = useState(window.innerHeight);

  const localstorage_chat_save = (id) => {
    console.log(id, "localstorage")
    const idb = window.indexedDB;
    const reqest = idb.open("chatroom", 2);

    reqest.onupgradeneeded = () => {
      const localdb = reqest.result;
      localdb.createObjectStore("message_list", { autoIncrement: true, keyPath: "id" });
    }

    reqest.onsuccess = () => {
      const localdb = reqest.result;
      let tx = localdb.transaction("message_list", "readwrite");
      var store = tx.objectStore("message_list");
      var getdata = store.get(id);
      getdata.onsuccess = () => {
        if (getdata.result === undefined) {
          onSnapshot(query(collection(db, "chatroom-message", id, "messages"), orderBy("time", "desc")), snapshot => {
            let allmessageData = [];
            snapshot.forEach(snap => allmessageData.push(snap.data()))
            dispatch(set_message_list({ id: id, message: allmessageData }));
            if (allmessageData.length > 0) {
              update_localdb({ id: id, message: allmessageData });
            }
          })
        } else {
          const openingcursor = store.openCursor();
          openingcursor.onsuccess = () => {
            const cursor = openingcursor.result;
            if (cursor) {
              if (cursor.value.id === id) {
                dispatch(set_message_list({ id: cursor.value.id, message: cursor.value.message }));
                var messagelist = cursor.value.message;
                var lastmessage = messagelist[messagelist.length - 1];
                var message_time = lastmessage.time;
                onSnapshot(query(collection(db, "chatroom-message", id, "messages"), where("time", ">=", message_time), orderBy("time", "desc")), snapshot => {
                  let allmessageData = [];
                  console.log("{id:id,message:allmessageData} have chat", { id: id, message: allmessageData })
                  snapshot.forEach(snap => allmessageData.push(snap.data()))
                  dispatch(set_message_list({ id: id, message: allmessageData }));
                  update_localdb({ id: id, message: allmessageData });
                })
              };
              cursor.continue()
            }
          }

        }
      }
      localdb.close();
    }
  }

  const update_localdb = (data) => {
    const idb = window.indexedDB;
    const reqest = idb.open("chatroom", 2);

    reqest.onupgradeneeded = () => {
      const localdb = reqest.result;
      localdb.createObjectStore("message_list", { autoIncrement: true, keyPath: "id" });
    }
    reqest.onsuccess = () => {
      const localdb = reqest.result;
      let tx = localdb.transaction("message_list", "readwrite");
      var store = tx.objectStore("message_list");
      var getdata = store.get(data.id);
      getdata.onsuccess = () => {
        if (getdata.result === undefined) {
          store.put(data);
        } else {
          const openingcursor = store.openCursor();
          openingcursor.onsuccess = () => {
            const cursor = openingcursor.result;
            if (cursor) {
              if (cursor.value.id === data.id) {
                let have_seen_true_message = false;
                let totalmessagecount = cursor.value.message.length;
                data.message.forEach(item => {
                  if (item.seen === true) {
                    have_seen_true_message = true;
                  }
                  var message_lists = cursor.value.message;
                  let havedata = false;
                  message_lists.forEach((message, i) => {
                    if (message.id === item.id) {
                      havedata = true;
                      if (message.seen !== item.seen) {
                        cursor.value.message[i].seen = true;
                      }
                    }
                  });
                  if (havedata === false) { cursor.value.message.push(item) }
                });
                const updatecursor = cursor.update(cursor.value);
                updatecursor.onsuccess = () => { console.log("update cursor"); if (have_seen_true_message) { localdb_seen_update(totalmessagecount, data.id) } }
              }
              cursor.continue();
            }

          }
        }
      }
    }

  }

  const localdb_seen_update = (no, id) => {
    const idb = window.indexedDB;
    const reqest = idb.open("chatroom", 2);

    reqest.onupgradeneeded = () => {
      const localdb = reqest.result;
      localdb.createObjectStore("message_list", { autoIncrement: true, keyPath: "id" });
    }
    reqest.onsuccess = () => {
      const localdb = reqest.result;
      let tx = localdb.transaction("message_list", "readwrite");
      var store = tx.objectStore("message_list");
      var getdata = store.get(id);
      getdata.onsuccess = () => {
        const openingcursor = store.openCursor();
        openingcursor.onsuccess = () => {
          const cursor = openingcursor.result;
          if (cursor) {
            if (cursor.value.id === id) {
              cursor.value.message.forEach((item, i) => {
                if (i < no) {
                  if (item.seen === false) {
                    item.seen = true
                  }
                }
              });
              const updatecursor = cursor.update(cursor.value);
              updatecursor.onsuccess = () => { console.log("update cursor") }
            }
            cursor.continue();
          }
        }
      }
    }
  }
  useEffect(() => { setHeight(window.innerHeight); }, [window.innerHeight])
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        onSnapshot(doc(db, "users", user.uid), snapshot => {
          if(snapshot){
            dispatch(setUser(snapshot.data()));
            var fcm_tokenlist = snapshot.data()?.fcm_token;
            try {
              getToken(messaging).then(token => {
                let tokenlist = [...new Set([...fcm_tokenlist, token])];
                updateDoc(doc(db, "users", user.uid), {
                  fcm_token: tokenlist,
                })
              }).catch(error => console.log("error ----", error))
            } catch (error) {
              console.log(error)
            }
            onSnapshot(query(collection(db, "users"), limit(20)), (snapshot) => {
              var users = [];
              snapshot.forEach(user => {
                users.push(user.data());
              });
              dispatch(set_available_user([...users.filter(eachuser => eachuser.id !== user.uid)]))
            })
          }

        });

      }
    })
  }, [dispatch])

  useEffect(() => {
    if(user!==undefined){
      if (Object.keys(user).length > 0) {
        setlistening_ChatList([]);
      } else {
      }
      let chatList = [];
      if (Object.keys(user).length > 0) {
        chatList = user.chatlist;
        let remaining_chats = [...chatList.filter(chat => listening_chatList.indexOf(chat) === -1)];
        remaining_chats.forEach(id => {
          console.log("local storage called", id)
          localstorage_chat_save(id)
          setlistening_ChatList([...listening_chatList, id])
        })
      }
    }

  }, [user])

useEffect(()=>{
  window.onblur = () => {
    if(user!==undefined){
      if (Object.keys(user).length > 0) {
        updateDoc(doc(db, "users", user.id), {
          active_status: new Date().getTime().toString()
        })
      }
    }
  }

  window.onfocus = () => {
    if(user!==undefined){
      if (Object.keys(user).length > 0) {
        updateDoc(doc(db, "users", user.id), {
          active_status: "active"
        })
      }
    }
  }

},[user])

  window.onresize = useCallback(() => {
    setHeight(window.innerHeight)
  }, [setHeight])

  onMessageListener().then(payload => {
    let notification = new Notification(payload.notification.title, { body: payload.notification.body, icon: payload.data.icon })
    notification.show();
    console.log(payload);
  }).catch(err => console.log('failed: ', err));



  return (

    <div className={`App flex flex-row md:flex-col`} style={{ height: height + "px" }}>
      <Left setShow={setShow} show={show} />
      <Right setShow={setShow} />
    </div>
  );
}

export default App;
