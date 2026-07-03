import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { firebaseConfig, GAME_ID_HERACLITO } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export function observarUsuario(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function entrarComGoogle() {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
}

export async function sair() {
  await signOut(auth);
}

export function resultadoRef(uid, gameId = GAME_ID_HERACLITO) {
  return doc(db, "resultados", `${gameId}_${uid}`);
}

export async function buscarResultado(uid, gameId = GAME_ID_HERACLITO) {
  const snap = await getDoc(resultadoRef(uid, gameId));
  return snap.exists() ? snap.data() : null;
}

export async function salvarResultadoHeraclito({
  uid,
  nome,
  email,
  turma = "",
  pontuacao,
  acertos,
  erros,
  tempoSegundos,
  detalhesQuestoes = []
}) {
  const ref = resultadoRef(uid, GAME_ID_HERACLITO);
  const existente = await getDoc(ref);

  if (existente.exists()) {
    throw new Error("Este aluno já realizou esta atividade.");
  }

  await setDoc(ref, {
    gameId: GAME_ID_HERACLITO,
    uid,
    nome,
    email,
    turma,
    pontuacao,
    acertos,
    erros,
    tempoSegundos,
    detalhesQuestoes,
    concluido: true,
    criadoEm: serverTimestamp()
  });
}
