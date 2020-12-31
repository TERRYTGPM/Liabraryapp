import firebase from 'firebase';
require("@firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyAmR13KamQpJg-XcILGME8Kp8rDPS1CChA",
  authDomain: "yeay-part-2.firebaseapp.com",
  projectId: "yeay-part-2",
  storageBucket: "yeay-part-2.appspot.com",
  messagingSenderId: "567064923588",
  appId: "1:567064923588:web:6006e0cfe285f8638ba891"
};

firebase.initializeApp(firebaseConfig);
export default firebase.firestore();