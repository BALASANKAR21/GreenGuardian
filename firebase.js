"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBZFysPakXskPgbz6zPvxMHHCgheckmQkA",
  authDomain: "greenguardian-1b7df.firebaseapp.com",
  projectId: "greenguardian-1b7df",
  storageBucket: "greenguardian-1b7df.firebasestorage.app",
  messagingSenderId: "72180697477",
  appId: "1:72180697477:web:a5b2b89d7be0b812e01cec",
  measurementId: "G-392TM242WK"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const database = getDatabase(app);

export { app, auth, database };
