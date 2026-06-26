// firebase-config.js
// Projeto: Filosofia Interativa
// Este arquivo conecta a plataforma ao Firebase.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCPbMtmFdj4H8N-XnpmJeTF7i2HzYSL6aM",
  authDomain: "filosofia-interativa.firebaseapp.com",
  projectId: "filosofia-interativa",
  storageBucket: "filosofia-interativa.firebasestorage.app",
  messagingSenderId: "856293312942",
  appId: "1:856293312942:web:80e8e778aee1ba9711e03f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
