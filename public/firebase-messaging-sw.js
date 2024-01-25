// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing the generated config
var firebaseConfig = {
    apiKey: "AIzaSyBlr_R8Y_DmzscWTE2Z1qnPqK2HI9O8OLI",
    authDomain: "chat-room-2f8a3.firebaseapp.com",
    projectId: "chat-room-2f8a3",
    storageBucket: "chat-room-2f8a3.appspot.com",
    messagingSenderId: "345818991001",
    appId: "1:345818991001:web:b452f3f0b3cb27f62c2b08",
    measurementId: "G-KPQX11LTYT"
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.data.icon
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});