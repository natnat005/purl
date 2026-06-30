import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBEeHjAga5sth0nh2g1EvRCOZTpEbWhV_g",
  authDomain: "stitchandlearn-bacee.firebaseapp.com",
  projectId: "stitchandlearn-bacee",
  storageBucket: "stitchandlearn-bacee.firebasestorage.app",
  messagingSenderId: "293781733665",
  appId: "1:293781733665:web:b07cceafd01ae1efa47e60",
  measurementId: "G-0LSFNW8QVF"
};
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);