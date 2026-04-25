import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: 'AIzaSyBnYYU3V1dLiSWyuAdysmE_CWPhcEYSzSc',
    appId: '1:77901567813:web:cfbdd44a91c84ed316502c',
    messagingSenderId: '77901567813',
    projectId: 'unloque',
    authDomain: 'unloque.firebaseapp.com',
    storageBucket: 'unloque.firebasestorage.app',
    measurementId: 'G-X08N3W6WZB',
};

const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);
