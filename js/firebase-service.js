// firebase-service.js
// Funções centrais de login, logout, consulta e salvamento de pontuação.

import { auth, db } from "./firebase-config.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const COLECAO_HERACLITO = "resultados_heraclito";

export function observarUsuario(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function entrarComGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return await signInWithPopup(auth, provider);
}

export async function sair() {
  await signOut(auth);
}

export function usuarioAtual() {
  return auth.currentUser;
}

export async function buscarResultadoHeraclito(uid) {
  const ref = doc(db, COLECAO_HERACLITO, uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function alunoJaJogouHeraclito(uid) {
  const resultado = await buscarResultadoHeraclito(uid);
  return resultado !== null;
}

export async function salvarResultadoHeraclito({ pontuacao, acertos, erros, tempoSegundos, transformacaoFinal }) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const ref = doc(db, COLECAO_HERACLITO, user.uid);
  const jaExiste = await getDoc(ref);

  if (jaExiste.exists()) {
    throw new Error("Esta atividade já foi registrada para este aluno.");
  }

  await setDoc(ref, {
    uid: user.uid,
    nome: user.displayName || "Aluno sem nome",
    email: user.email || "",
    jogo: "Heráclito — Logos e Movimento",
    pontuacao,
    acertos,
    erros,
    tempoSegundos,
    transformacaoFinal,
    concluido: true,
    criadoEm: serverTimestamp()
  });
}

export function protegerPaginaLogin() {
  observarUsuario((user) => {
    if (user) {
      window.location.href = "painel.html";
    }
  });
}

export function protegerPaginaAluno() {
  observarUsuario((user) => {
    if (!user) {
      window.location.href = "../../index.html";
    }
  });
}
