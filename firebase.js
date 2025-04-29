import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { ref, get } from "firebase/database";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const chatGPT_KEY = "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";



const firebaseConfig = {
  apiKey: "AIzaSyDZ146B7ZdaLXXAXvEK79XJqg_Jaf0LkR4",
  authDomain: "guietraft.firebaseapp.com",
  projectId: "guietraft",
  storageBucket: "guietraft.firebasestorage.app",
  messagingSenderId: "162907904177",
  appId: "1:162907904177:web:d444bde7da35a777ef2a90",
  measurementId: "G-W0WWPNVXES"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app);
export const fetchUserData = async (userId) => {
  try {
    const database = getDatabase(app);
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("No data available for this user.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};
  export const auth = getAuth(app);
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in.
      console.log("User is signed in:", user);
    } else {
      // No user is signed in.
      console.log("No user is signed in.");
    }
  });
  export { firebaseConfig, storage };