// Import the necessary functions from the modular Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCd_r02Ja2SLrH9lig286NZf7lL1ZE50ic",
  authDomain: "throttlefury-58c81.firebaseapp.com",
  projectId: "throttlefury-58c81",
  storageBucket: "throttlefury-58c81.appspot.com",
  messagingSenderId: "258258955889",
  appId: "1:258258955889:web:6e0d438d4af113b57e35d0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
