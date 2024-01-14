
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBlr_R8Y_DmzscWTE2Z1qnPqK2HI9O8OLI",
  authDomain: "chat-room-2f8a3.firebaseapp.com",
  projectId: "chat-room-2f8a3",
  storageBucket: "chat-room-2f8a3.appspot.com",
  messagingSenderId: "345818991001",
  appId: "1:345818991001:web:b452f3f0b3cb27f62c2b08",
  measurementId: "G-KPQX11LTYT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const messaging = isSupported() ? getMessaging(app) : null;
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
});


function requestPermission() {
  console.log('Requesting permission...');
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Notification permission granted.');
    }})};

requestPermission();

// TypeError: undefined is not an object (evaluating 'navigator.serviceWorker.addEventListener')
// getImmediate @ main.8f831d26.js:3
// (anonymous) @ main.8f831d26.js:3
// (anonymous) @ main.8f831d26.js:3
// global code @ main.8f831d26.js:3
// main.8f831d26.js:3 Unhandled Promise Rejection: FirebaseError: Messaging: This browser doesn't support the API's required to use the Firebase SDK. (messaging/unsupported-browser).