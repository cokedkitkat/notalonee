// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAvgL56HxEBrIQRSbpTS0AnoDx_CWXEPQY",
  authDomain: "not-alone-49006.firebaseapp.com",
  projectId: "not-alone-49006",
  storageBucket: "not-alone-49006.firebasestorage.app",
  messagingSenderId: "910211705155",
  appId: "1:910211705155:web:b1b3f1609354a45bb527f6",
  measurementId: "G-7WEWKJFKJY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);