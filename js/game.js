import {
  entrarComGoogle,
  observarUsuario,
  buscarResultado,
  salvarResultadoHeraclito
} from "./firebase-service.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ui = {
  loginScreen: document.getElementById("loginScreen"),
  loginBtn: document.getElementById("loginBtn"),
  authStatus: document.getElementById("authStatus"),
  start: document.getElementById("start"),
  startBtn: document.getElementById("startBtn"),
  loginStatus: document.getElementById("loginStatus"),
  gameWrap: document.getElementById("gameWrap"),
  phaseTitle: document.getElementById("phaseTitle"),
  phaseProgress: document.getElementById("phaseProgress"),
  estado: document.getElementById("estado"),
  estadoTexto: document.getElementById("estadoTexto"),
  playerName: document.getElementById("playerName"),
  xpFill: document.getElementById("xpFill"),
  score: document.getElementById("score"),
  acertos: document.getElementById("acertos"),
  erros: document.getElementById("erros"),
  elapsed: document.getElementById("elapsed"),
  missionTitle: document.getElementById("missionTitle"),
  missionText: document.getElementById("missionText"),
  progressText: document.getElementById("progressText"),
  progressFill: document.getElementById("progressFill"),
  phaseMap: document.getElementById("phaseMap"),
  modal: document.getElementById("activityModal"),
  activityKind: document.getElementById("activityKind"),
  activityTitle: document.getElementById("activityTitle"),
  activityText: document.getElementById("activityText"),
  activityBody: document.getElementById("activityBody"),
  activityMsg: document.getElementById("activityMsg"),
  activityPrimary: document.getElementById("activityPrimary"),
  activitySecondary: document.getElementById("activitySecondary")
};

const phases = [
  { id: 1, title: "Efeso", area: "polis", mission: "Leia as inscricoes iniciais e encontre Heraclito na cidade." },
  { id: 2, title: "Rio do fluxo", area: "river", mission: "Atravesse o rio e resolva os desafios sobre mudanca." },
  { id: 3, title: "Patio dos opostos", area: "opposites", mission: "Investigue os pares contrarios no patio do templo." },
  { id: 4, title: "Templo do logos", area: "temple", mission: "Reuna os conceitos e registre sua compreensao final." }
];

const states = [
  ["Viajante comum", "Observa o mundo como algo fixo."],
  ["Observador do fluxo", "Percebe que tudo se transforma."],
  ["Leitor dos opostos", "Entende a tensao entre contrarios."],
  ["Guardiao do logos", "Reconhece uma ordem racional no movimento."]
];

const stations = [
  {
    id: "prologo",
    phase: 1,
    x: 230,
    y: 330,
    kind: "reading",
    label: "Leitura",
    title: "Entrada em Efeso",
    text: "Heraclito viveu em Efeso, cidade grega da Asia Menor. Seu pensamento ficou conhecido por destacar a mudanca, o conflito dos opostos e a ideia de logos.\n\nNesta aula-jogo, voce acompanha um viajante que precisa atravessar lugares simbolicos. Cada lugar representa uma ideia filosofica.",
    reward: 10
  },
  {
    id: "fragmento-rio",
    phase: 1,
    x: 560,
    y: 340,
    kind: "choice",
    label: "Questao",
    title: "O rio como imagem filosofica",
    text: "A imagem do rio ajuda a pensar que a realidade nao esta parada. Mesmo quando parece a mesma, ela continua em movimento.",
    question: "Qual alternativa expressa melhor essa ideia?",
    options: ["O mundo e totalmente imovel.", "A realidade muda continuamente.", "So existe aparencia, nada pode ser pensado.", "A mudanca elimina toda ordem."],
    answer: 1,
    reward: 25
  },
  {
    id: "mapa-conceitos",
    phase: 1,
    x: 760,
    y: 366,
    kind: "match",
    label: "Associacao",
    title: "Primeiro mapa conceitual",
    text: "Associe cada conceito a sua melhor explicacao. Esta atividade prepara a travessia.",
    pairs: [
      ["Fluxo", "Movimento constante da realidade"],
      ["Logos", "Ordem racional que atravessa o mundo"],
      ["Opostos", "Tensoes que formam a realidade"]
    ],
    reward: 30
  },
  {
    id: "ordem-inicial",
    phase: 1,
    x: 1050,
    y: 345,
    kind: "order",
    label: "Sequencia",
    title: "Da aparencia ao problema filosofico",
    text: "Organize a sequencia de ideias para formar um caminho de investigacao: primeiro observamos, depois percebemos o problema, por fim buscamos uma explicacao.",
    prompt: "Clique nos blocos na ordem mais coerente.",
    items: ["Observamos o mundo", "Percebemos a mudanca", "Buscamos uma ordem"],
    answer: ["Observamos o mundo", "Percebemos a mudanca", "Buscamos uma ordem"],
    reward: 25
  },
  {
    id: "ponte-rio",
    phase: 2,
    x: 235,
    y: 315,
    kind: "reading",
    label: "Leitura",
    title: "Antes da travessia",
    text: "A frase atribuida a Heraclito, 'nao se entra duas vezes no mesmo rio', costuma ser usada para explicar que o rio muda e tambem muda quem entra nele.\n\nNo jogo, caminhar pelo rio simboliza aprender que viver e transformar-se.",
    reward: 10
  },
  {
    id: "travessia-um",
    phase: 2,
    x: 470,
    y: 245,
    kind: "tf",
    label: "Verdadeiro ou falso",
    title: "A travessia do fluxo",
    text: "Leia as afirmacoes e marque verdadeiro ou falso.",
    items: [
      { text: "Para Heraclito, a mudanca faz parte da realidade.", answer: true },
      { text: "A imagem do rio representa uma realidade completamente parada.", answer: false },
      { text: "O ser humano tambem participa do processo de transformacao.", answer: true }
    ],
    reward: 30
  },
  {
    id: "travessia-dois",
    phase: 2,
    x: 720,
    y: 405,
    kind: "choice",
    label: "Questao",
    title: "Depois da margem",
    text: "Ao atravessar o rio, o viajante descobre que a mudanca nao e apenas externa. A aprendizagem tambem modifica quem aprende.",
    question: "A melhor interpretacao da travessia e:",
    options: ["A experiencia muda o mundo e tambem o sujeito.", "O rio prova que nada existe.", "A mudanca impede qualquer pensamento.", "Heraclito defendia a imobilidade."],
    answer: 0,
    reward: 25
  },
  {
    id: "correnteza-ideias",
    phase: 2,
    x: 980,
    y: 240,
    kind: "order",
    label: "Sequencia",
    title: "A correnteza das ideias",
    text: "A imagem do rio nao serve apenas para falar da natureza. Ela tambem ajuda a pensar a experiencia humana.",
    prompt: "Monte a sequencia interpretativa.",
    items: ["O rio muda", "Quem entra tambem muda", "A realidade e processo"],
    answer: ["O rio muda", "Quem entra tambem muda", "A realidade e processo"],
    reward: 25
  },
  {
    id: "fogo-agua",
    phase: 3,
    x: 275,
    y: 270,
    kind: "reading",
    label: "Leitura",
    title: "O patio dos opostos",
    text: "Heraclito observava a realidade como uma tensao entre opostos: dia e noite, frio e quente, vida e morte, guerra e paz.\n\nEsses opostos nao precisam ser vistos apenas como destruicao. Eles ajudam a revelar o movimento do real.",
    reward: 10
  },
  {
    id: "opostos-vf",
    phase: 3,
    x: 570,
    y: 365,
    kind: "tf",
    label: "Verdadeiro ou falso",
    title: "Tensao dos contrarios",
    text: "Analise as afirmacoes sobre os opostos.",
    items: [
      { text: "Frio e quente podem ajudar a compreender uma mesma realidade em transformacao.", answer: true },
      { text: "Para Heraclito, os opostos nunca se relacionam.", answer: false },
      { text: "A tensao entre contrarios pode produzir equilibrio dinamico.", answer: true }
    ],
    reward: 30
  },
  {
    id: "caca-palavras",
    phase: 3,
    x: 850,
    y: 250,
    kind: "wordsearch",
    label: "Caca-palavras",
    title: "Palavras do patio",
    text: "Encontre os conceitos escondidos. Clique em cada palavra da lista para revelar sua posicao no quadro.",
    words: ["LOGOS", "RIO", "FLUXO", "FOGO", "OPOSTOS"],
    reward: 35
  },
  {
    id: "conflito-harmonia",
    phase: 3,
    x: 1080,
    y: 395,
    kind: "choice",
    label: "Questao",
    title: "Conflito e harmonia",
    text: "Em Heraclito, conflito nao significa apenas briga ou destruicao. Muitas vezes, ele indica tensao produtiva entre elementos diferentes.",
    question: "Qual exemplo combina melhor com essa ideia?",
    options: ["Um instrumento desafinado sem relacao entre as cordas.", "Uma lira afinada pela tensao correta das cordas.", "Um objeto parado para sempre.", "Uma cidade sem qualquer diferenca entre as pessoas."],
    answer: 1,
    reward: 25
  },
  {
    id: "templo-entrada",
    phase: 4,
    x: 260,
    y: 350,
    kind: "reading",
    label: "Leitura",
    title: "O templo do logos",
    text: "O logos pode ser entendido como uma ordem racional, uma medida ou uma razao que atravessa o mundo.\n\nA mudanca, portanto, nao precisa ser puro caos. Ha uma inteligibilidade no movimento.",
    reward: 10
  },
  {
    id: "forca-logos",
    phase: 4,
    x: 500,
    y: 430,
    kind: "hangman",
    label: "Forca",
    title: "Descubra o conceito final",
    text: "Complete a palavra que nomeia a ordem racional do mundo em Heraclito.",
    word: "LOGOS",
    hint: "Ordem racional que organiza o movimento.",
    reward: 35
  },
  {
    id: "logos-vf",
    phase: 4,
    x: 740,
    y: 440,
    kind: "tf",
    label: "Verdadeiro ou falso",
    title: "O logos organiza a mudanca",
    text: "Antes da sintese final, confira se a ideia de logos ficou clara.",
    items: [
      { text: "Logos pode ser entendido como uma razao ou ordem do mundo.", answer: true },
      { text: "Para Heraclito, mudanca e necessariamente ausencia total de sentido.", answer: false },
      { text: "O pensamento filosofico tenta compreender a ordem presente no movimento.", answer: true }
    ],
    reward: 30
  },
  {
    id: "sintese",
    phase: 4,
    x: 950,
    y: 455,
    kind: "choice",
    label: "Questao final",
    title: "Sintese da jornada",
    text: "Agora una as ideias da aula: fluxo, opostos e logos.",
    question: "Qual frase resume melhor o pensamento trabalhado na jornada?",
    options: ["Tudo permanece igual porque a razao impede a mudanca.", "Tudo flui, os opostos se tensionam e o logos da ordem ao movimento.", "A realidade e caos absoluto e nao pode ser compreendida.", "Os sentidos mostram apenas uma imobilidade perfeita."],
    answer: 1,
    reward: 40
  },
  {
    id: "reflexao-final",
    phase: 4,
    x: 1110,
    y: 350,
    kind: "reflection",
    label: "Reflexao",
    title: "O que mudou em sua leitura do mundo?",
    text: "Escreva uma resposta breve conectando pelo menos duas ideias da aula: fluxo, opostos ou logos.",
    prompt: "Explique com suas palavras uma situacao da vida em que algo muda, mas ainda parece ter uma ordem.",
    minLength: 80,
    reward: 35
  }
];

let user = null;
let started = false;
let paused = true;
let score = 100;
let acertos = 0;
let erros = 0;
let startTime = 0;
let elapsedTimer = null;
let activeStation = null;
let details = [];
let keys = {};
let particles = [];
let t = 0;

const player = {
  x: 110,
  y: 330,
  r: 15,
  speed: 3.7,
  power: 0,
  direction: "down",
  moving: false,
  walkFrame: 0
};

const TILE = 32;
const polisProps = [
  { type: "olive", x: 1120, y: 420, scale: 1.05, block: 28 },
  { type: "olive", x: 1045, y: 520, scale: .82, block: 24 },
  { type: "cypress", x: 1180, y: 182, scale: 1.08, block: 22 },
  { type: "cypress", x: 1140, y: 245, scale: .86, block: 20 },
  { type: "amphora", x: 505, y: 432, scale: .8, block: 16 },
  { type: "amphora", x: 1010, y: 388, scale: .68, block: 15 },
  { type: "crate", x: 342, y: 438, scale: 1, block: 18 },
  { type: "crate", x: 390, y: 438, scale: .86, block: 17 },
  { type: "chest", x: 930, y: 505, scale: .85, block: 18 },
  { type: "scrollStand", x: 930, y: 350, scale: .9, block: 18 },
  { type: "lamp", x: 660, y: 235, scale: .8, block: 14 },
  { type: "brokenColumn", x: 238, y: 515, scale: 1, block: 18 },
  { type: "laurel", x: 825, y: 430, scale: .72, block: 14 }
];

const polisNpcs = [
  { role: "merchant", x: 210, y: 392, direction: "right", bob: .2 },
  { role: "soldier", x: 665, y: 285, direction: "down", bob: .55 },
  { role: "priestess", x: 880, y: 300, direction: "left", bob: .8 },
  { role: "fisher", x: 1110, y: 505, direction: "left", bob: .35 }
];

const riverRoute = [[150, 315], [235, 315], [470, 245], [720, 405], [980, 240], [1130, 330]];
const riverStones = [
  [235, 315], [350, 285], [470, 245], [590, 320], [720, 405], [850, 322], [980, 240], [1100, 310]
];

window.addEventListener("keydown", event => {
  keys[event.key.toLowerCase()] = true;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) event.preventDefault();
});
window.addEventListener("keyup", event => { keys[event.key.toLowerCase()] = false; });

observarUsuario(async currentUser => {
  if (!currentUser) {
    user = null;
    ui.loginScreen.classList.remove("hidden");
    ui.start.classList.add("hidden");
    ui.startBtn.disabled = true;
    ui.authStatus.textContent = "Entre para continuar.";
    return;
  }
  user = currentUser;
  ui.loginScreen.classList.add("hidden");
  ui.start.classList.remove("hidden");
  ui.startBtn.disabled = false;
  ui.startBtn.textContent = "Iniciar aula-jogo";
  ui.playerName.textContent = currentUser.displayName || currentUser.email || "Jovem viajante";
  ui.loginStatus.textContent = `Aluno: ${currentUser.displayName || currentUser.email}`;
  try {
    const resultado = await buscarResultado(currentUser.uid);
    if (resultado) {
      ui.startBtn.disabled = true;
      ui.startBtn.textContent = "Atividade ja realizada";
      ui.loginStatus.textContent = `Voce ja realizou esta atividade. Pontuacao registrada: ${resultado.pontuacao}.`;
    }
  } catch (error) {
    ui.loginStatus.textContent = "Login confirmado. Nao foi possivel verificar tentativa anterior agora.";
    console.error(error);
  }
});

ui.loginBtn.addEventListener("click", async () => {
  ui.loginBtn.disabled = true;
  ui.authStatus.textContent = "Abrindo login do Google...";
  try {
    await entrarComGoogle();
  } catch (error) {
    ui.authStatus.textContent = "Nao foi possivel entrar. Tente novamente.";
    ui.loginBtn.disabled = false;
    console.error(error);
  }
});

ui.startBtn.addEventListener("click", () => {
  if (!user) return;
  ui.start.classList.add("hidden");
  ui.gameWrap.classList.remove("hidden");
  started = true;
  paused = false;
  startTime = Date.now();
  elapsedTimer = setInterval(updateElapsed, 1000);
  updateHUD();
});

ui.activitySecondary.addEventListener("click", closeActivity);

function currentPhaseId() {
  const remaining = stations.find(station => !station.done);
  return remaining ? remaining.phase : 4;
}

function currentPhase() {
  return phases.find(phase => phase.id === currentPhaseId()) || phases[0];
}

function phaseStations() {
  const phaseId = currentPhaseId();
  return stations.filter(station => station.phase === phaseId);
}

function nextStation() {
  return stations.find(station => !station.done);
}

function updateHUD() {
  const phase = currentPhase();
  const completed = stations.filter(station => station.done).length;
  const station = nextStation();
  const state = states[Math.min(player.power, states.length - 1)];
  const progress = Math.round((completed / stations.length) * 100);

  ui.phaseTitle.textContent = phase.title;
  ui.phaseProgress.textContent = `Estacao ${Math.min(completed + 1, stations.length)} de ${stations.length}`;
  ui.estado.textContent = state[0];
  ui.estadoTexto.textContent = state[1];
  ui.score.textContent = Math.max(0, Math.round(score));
  ui.acertos.textContent = acertos;
  ui.erros.textContent = erros;
  ui.missionTitle.textContent = station ? station.title : "Jornada concluida";
  ui.missionText.textContent = station ? `${phase.mission} Proximo marco: ${station.label}.` : "Salve o resultado e volte ao painel.";
  ui.progressText.textContent = `${progress}%`;
  ui.progressFill.style.width = `${progress}%`;
  ui.xpFill.style.width = `${progress}%`;
  renderPhaseMap();
  updateElapsed();
}

function updateElapsed() {
  if (!startTime || !ui.elapsed) return;
  const seconds = Math.max(0, Math.round((Date.now() - startTime) / 1000));
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const rest = String(seconds % 60).padStart(2, "0");
  ui.elapsed.textContent = `${minutes}:${rest}`;
}

function renderPhaseMap() {
  if (!ui.phaseMap) return;
  const currentId = currentPhaseId();
  ui.phaseMap.innerHTML = "";
  phases.forEach(phase => {
    const phaseTotal = stations.filter(station => station.phase === phase.id).length;
    const phaseDone = stations.filter(station => station.phase === phase.id && station.done).length;
    const item = document.createElement("li");
    if (phaseDone === phaseTotal) item.className = "done";
    else if (phase.id === currentId) item.className = "current";
    item.innerHTML = `<span>${phase.title}</span><strong>${phaseDone}/${phaseTotal}</strong>`;
    ui.phaseMap.appendChild(item);
  });
}

function movePlayer() {
  if (paused || !started) return;
  const left = keys.arrowleft || keys.a;
  const right = keys.arrowright || keys.d;
  const up = keys.arrowup || keys.w;
  const down = keys.arrowdown || keys.s;
  let dx = 0;
  let dy = 0;
  if (left) { dx -= player.speed; player.direction = "left"; }
  if (right) { dx += player.speed; player.direction = "right"; }
  if (up) { dy -= player.speed; player.direction = "up"; }
  if (down) { dy += player.speed; player.direction = "down"; }
  if (dx && dy) {
    dx *= .707;
    dy *= .707;
  }
  player.moving = Boolean(dx || dy);
  if (player.moving) player.walkFrame += .18;
  const nextX = player.x + dx;
  const nextY = player.y + dy;
  if (!isWorldBlocked(nextX, player.y)) player.x = nextX;
  if (!isWorldBlocked(player.x, nextY)) player.y = nextY;
  player.x = Math.max(player.r, Math.min(canvas.width - player.r, player.x));
  player.y = Math.max(player.r, Math.min(canvas.height - player.r, player.y));
}

function isWorldBlocked(x, y) {
  const area = currentPhase().area;
  if (isTerrainBlocked(area, x, y)) return !canEscapeBlockedTerrain(area, x, y);
  if (area !== "polis") return false;
  return polisProps.some(prop => {
    return isCircleBlocked(x, y, prop.x, prop.y + 14, player.r + prop.block * prop.scale);
  }) || polisNpcs.some(npc => isCircleBlocked(x, y, npc.x, npc.y + 16, player.r + 18));
}

function canEscapeBlockedTerrain(area, nextX, nextY) {
  if (!isTerrainBlocked(area, player.x, player.y)) return false;
  if (area === "river") {
    return riverSafeDistance(nextX, nextY) < riverSafeDistance(player.x, player.y) + .1;
  }
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  return Math.hypot(nextX - centerX, nextY - centerY) < Math.hypot(player.x - centerX, player.y - centerY);
}

function isCircleBlocked(nextX, nextY, obstacleX, obstacleY, radius) {
  const nextDistance = Math.hypot(nextX - obstacleX, nextY - obstacleY);
  if (nextDistance >= radius) return false;
  const currentDistance = Math.hypot(player.x - obstacleX, player.y - obstacleY);
  return currentDistance >= radius || nextDistance <= currentDistance + .1;
}

function isTerrainBlocked(area, x, y) {
  if (x < 24 || x > canvas.width - 24 || y < 24 || y > canvas.height - 24) return true;
  if (area === "polis") return isPolisTerrainBlocked(x, y);
  if (area === "river") return isRiverTerrainBlocked(x, y);
  if (area === "opposites") return y < 235 || y > 575;
  if (area === "temple") return y < 285 || y > 575 || (x > 360 && x < 980 && y < 405);
  return false;
}

function polisTileTypeAt(x, y) {
  const col = Math.floor(x / TILE);
  const row = Math.floor(y / TILE);
  if (row >= 16) return "water";
  if (row >= 14) return "shore";
  if (col >= 21 && col <= 35 && row >= 2 && row <= 8) return "templeFloor";
  if (col >= 8 && col <= 20 && row >= 8 && row <= 12) return "plaza";
  if (row >= 9 && row <= 11 && col >= 2 && col <= 35) return "road";
  if (col >= 16 && col <= 18 && row >= 3 && row <= 14) return "road";
  if (col >= 25 && col <= 27 && row >= 8 && row <= 14) return "road";
  if (col <= 5 && row <= 5) return "garden";
  if (col >= 35 && row <= 7) return "garden";
  return "grass";
}

function isPolisTerrainBlocked(x, y) {
  const footY = y + player.r;
  const tile = polisTileTypeAt(x, footY);
  if (tile === "water") return true;
  const templeFootprint = x > 712 && x < 1118 && y > 55 && y < 232;
  if (templeFootprint) return true;
  return false;
}

function isRiverTerrainBlocked(x, y) {
  const bridgeBand = y > 294 && y < 342 && x > 180 && x < 1100;
  const onRoute = riverRoute.some((point, index) => {
    if (!index) return false;
    return distanceToSegment(x, y, riverRoute[index - 1][0], riverRoute[index - 1][1], point[0], point[1]) < 72;
  });
  const onStone = riverStones.some(([sx, sy]) => Math.hypot(x - sx, y - sy) < 56);
  if (bridgeBand || onRoute || onStone) return false;
  return x > 185 && x < canvas.width - 185;
}

function riverSafeDistance(x, y) {
  if (x <= 185 || x >= canvas.width - 185) return 0;
  const routeDistance = riverRoute.reduce((closest, point, index) => {
    if (!index) return closest;
    const distance = distanceToSegment(x, y, riverRoute[index - 1][0], riverRoute[index - 1][1], point[0], point[1]);
    return Math.min(closest, distance);
  }, Infinity);
  const stoneDistance = riverStones.reduce((closest, [sx, sy]) => Math.min(closest, Math.hypot(x - sx, y - sy)), Infinity);
  return Math.min(routeDistance - 72, stoneDistance - 56);
}

function distanceToSegment(px, py, ax, ay, bx, by) {
  const vx = bx - ax;
  const vy = by - ay;
  const wx = px - ax;
  const wy = py - ay;
  const lengthSq = vx * vx + vy * vy;
  const tValue = lengthSq ? Math.max(0, Math.min(1, (wx * vx + wy * vy) / lengthSq)) : 0;
  const cx = ax + tValue * vx;
  const cy = ay + tValue * vy;
  return Math.hypot(px - cx, py - cy);
}

function checkStations() {
  if (paused || !started) return;
  const station = nextStation();
  if (!station) {
    openFinal();
    return;
  }
  const distance = Math.hypot(player.x - station.x, player.y - station.y);
  if (distance < 48) openStation(station);
}

function openStation(station) {
  paused = true;
  activeStation = station;
  ui.modal.classList.remove("hidden");
  ui.activityKind.textContent = station.label;
  ui.activityTitle.textContent = station.title;
  ui.activityText.textContent = station.text;
  ui.activityBody.innerHTML = "";
  ui.activityMsg.textContent = "";
  ui.activityMsg.className = "activity-msg";
  ui.activityPrimary.classList.remove("hidden");
  ui.activitySecondary.classList.add("hidden");
  ui.activityPrimary.disabled = false;

  const handlers = {
    reading: renderReading,
    choice: renderChoice,
    tf: renderTrueFalse,
    match: renderMatch,
    wordsearch: renderWordSearch,
    hangman: renderHangman,
    order: renderOrder,
    reflection: renderReflection
  };
  handlers[station.kind](station);
}

function renderReading(station) {
  ui.activityPrimary.textContent = "Registrar leitura";
  ui.activityPrimary.onclick = () => completeStation(station, true, "Leitura concluida.");
}

function renderChoice(station) {
  const question = document.createElement("p");
  question.className = "question-line";
  question.textContent = station.question;
  const options = document.createElement("div");
  options.className = "options";
  station.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "option";
    button.textContent = `${String.fromCharCode(65 + index)}) ${option}`;
    button.onclick = () => {
      const correct = index === station.answer;
      button.classList.add(correct ? "correct" : "wrong");
      options.querySelectorAll("button").forEach(item => item.disabled = true);
      completeStation(station, correct, correct ? "Resposta correta." : "Resposta incorreta. Leia a explicacao e siga.");
    };
    options.appendChild(button);
  });
  ui.activityBody.append(question, options);
  ui.activityPrimary.classList.add("hidden");
}

function renderTrueFalse(station) {
  const list = document.createElement("div");
  list.className = "tf-list";
  const responses = new Map();
  station.items.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "tf-row";
    const text = document.createElement("strong");
    text.textContent = item.text;
    const actions = document.createElement("div");
    actions.className = "activity-actions";
    ["Verdadeiro", "Falso"].forEach((label, labelIndex) => {
      const button = document.createElement("button");
      button.className = "btn ghost";
      button.textContent = label;
      button.onclick = () => {
        responses.set(index, labelIndex === 0);
        row.querySelectorAll("button").forEach(itemButton => itemButton.classList.remove("primary"));
        button.classList.add("primary");
      };
      actions.appendChild(button);
    });
    row.append(text, actions);
    list.appendChild(row);
  });
  ui.activityBody.appendChild(list);
  ui.activityPrimary.textContent = "Conferir respostas";
  ui.activityPrimary.onclick = () => {
    if (responses.size < station.items.length) {
      ui.activityMsg.textContent = "Responda todas as afirmacoes antes de conferir.";
      return;
    }
    let correctCount = 0;
    [...list.children].forEach((row, index) => {
      const correct = responses.get(index) === station.items[index].answer;
      row.classList.add(correct ? "correct" : "wrong");
      if (correct) correctCount++;
    });
    completeStation(station, correctCount === station.items.length, `${correctCount} de ${station.items.length} respostas corretas.`);
  };
}

function renderMatch(station) {
  const shuffled = [...station.pairs].sort(() => Math.random() - .5);
  const list = document.createElement("div");
  list.className = "match-list";
  let solved = 0;

  station.pairs.forEach(([concept, explanation]) => {
    const row = document.createElement("div");
    row.className = "tf-row";
    const title = document.createElement("strong");
    title.textContent = concept;
    const answers = document.createElement("div");
    answers.className = "options";
    shuffled.forEach(([, option]) => {
      const button = document.createElement("button");
      button.className = "match-btn";
      button.textContent = option;
      button.onclick = () => {
        const correct = option === explanation;
        button.classList.add(correct ? "correct" : "wrong");
        if (correct) {
          row.querySelectorAll("button").forEach(item => item.disabled = true);
          solved++;
          if (solved === station.pairs.length) completeStation(station, true, "Mapa conceitual concluido.");
        } else {
          erros++;
          score = Math.max(0, score - 8);
          updateHUD();
        }
      };
      answers.appendChild(button);
    });
    row.append(title, answers);
    list.appendChild(row);
  });
  ui.activityBody.appendChild(list);
  ui.activityPrimary.classList.add("hidden");
}

function renderWordSearch(station) {
  const grid = makeWordGrid(station.words);
  const layout = document.createElement("div");
  layout.className = "word-layout";
  const gridEl = document.createElement("div");
  gridEl.className = "word-grid";
  grid.letters.flat().forEach((letter, index) => {
    const cell = document.createElement("span");
    cell.className = "word-cell";
    cell.textContent = letter;
    cell.dataset.index = String(index);
    gridEl.appendChild(cell);
  });

  const list = document.createElement("div");
  list.className = "word-list";
  let found = 0;
  station.words.forEach(word => {
    const button = document.createElement("button");
    button.className = "word-chip";
    button.textContent = word;
    button.onclick = () => {
      if (button.classList.contains("found")) return;
      button.classList.add("found");
      grid.positions[word].forEach(([row, col]) => {
        const index = row * 12 + col;
        gridEl.querySelector(`[data-index="${index}"]`).classList.add("hit");
      });
      found++;
      if (found === station.words.length) completeStation(station, true, "Todos os conceitos foram encontrados.");
    };
    list.appendChild(button);
  });

  layout.append(gridEl, list);
  ui.activityBody.appendChild(layout);
  ui.activityPrimary.classList.add("hidden");
}

function renderHangman(station) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const guessed = new Set();
  let misses = 0;
  const word = document.createElement("div");
  word.className = "hangman-word";
  const hint = document.createElement("p");
  hint.textContent = `Dica: ${station.hint}`;
  const missesText = document.createElement("p");
  const letters = document.createElement("div");
  letters.className = "letters";

  function refresh() {
    word.innerHTML = "";
    station.word.split("").forEach(letter => {
      const slot = document.createElement("span");
      slot.textContent = guessed.has(letter) ? letter : "";
      word.appendChild(slot);
    });
    missesText.textContent = `Erros na forca: ${misses} de 6`;
    const won = station.word.split("").every(letter => guessed.has(letter));
    if (won) completeStation(station, true, "Conceito descoberto.");
    if (misses >= 6) completeStation(station, false, `A palavra era ${station.word}.`);
  }

  alphabet.forEach(letter => {
    const button = document.createElement("button");
    button.className = "letter-btn";
    button.textContent = letter;
    button.onclick = () => {
      button.disabled = true;
      button.classList.add("used");
      guessed.add(letter);
      if (!station.word.includes(letter)) misses++;
      refresh();
    };
    letters.appendChild(button);
  });

  ui.activityBody.append(hint, word, missesText, letters);
  ui.activityPrimary.classList.add("hidden");
  refresh();
}

function renderOrder(station) {
  const prompt = document.createElement("p");
  prompt.textContent = station.prompt;
  const slots = document.createElement("div");
  slots.className = "order-slots";
  const options = document.createElement("div");
  options.className = "order-list";
  const selected = [];
  const shuffled = [...station.items].sort(() => Math.random() - .5);

  shuffled.forEach(item => {
    const button = document.createElement("button");
    button.className = "order-btn";
    button.textContent = item;
    button.onclick = () => {
      selected.push(item);
      button.disabled = true;
      const pill = document.createElement("span");
      pill.className = "order-pill";
      pill.textContent = `${selected.length}. ${item}`;
      slots.appendChild(pill);
    };
    options.appendChild(button);
  });

  ui.activityBody.append(prompt, slots, options);
  ui.activityPrimary.textContent = "Conferir sequencia";
  ui.activityPrimary.onclick = () => {
    if (selected.length < station.answer.length) {
      ui.activityMsg.textContent = "Complete todos os blocos antes de conferir.";
      return;
    }
    const correct = station.answer.every((item, index) => selected[index] === item);
    completeStation(station, correct, correct ? "Sequencia coerente." : "A sequencia nao ficou ideal, mas a ideia foi registrada.", selected.join(" > "));
  };
}

function renderReflection(station) {
  const prompt = document.createElement("p");
  prompt.textContent = station.prompt;
  const textarea = document.createElement("textarea");
  textarea.className = "reflection-box";
  textarea.placeholder = "Escreva sua reflexao aqui...";
  ui.activityBody.append(prompt, textarea);
  ui.activityPrimary.textContent = "Registrar reflexao";
  ui.activityPrimary.onclick = () => {
    const answer = textarea.value.trim();
    if (answer.length < station.minLength) {
      ui.activityMsg.textContent = `Escreva um pouco mais para registrar sua reflexao. Minimo: ${station.minLength} caracteres.`;
      return;
    }
    const hasConcept = ["fluxo", "opostos", "logos", "mudanca", "ordem"].some(term => answer.toLowerCase().includes(term));
    completeStation(station, hasConcept, hasConcept ? "Reflexao registrada com conceito filosofico." : "Reflexao registrada. Tente citar fluxo, opostos ou logos na proxima vez.", answer);
  };
}

function completeStation(station, correct, message, resposta = message) {
  if (station.done) return;
  station.done = true;
  details.push({
    fase: station.phase,
    tipo: station.kind,
    pergunta: station.title,
    acertou: correct,
    resposta
  });
  if (correct) {
    acertos++;
    score += station.reward;
    player.power = Math.min(states.length - 1, player.power + 1);
    makeGlow(player.x, player.y, "#e7b84a");
    ui.activityMsg.classList.add("ok");
  } else {
    erros++;
    score = Math.max(0, score - Math.ceil(station.reward / 2));
    makeGlow(player.x, player.y, "#b8393f");
    ui.activityMsg.classList.add("danger");
  }
  ui.activityMsg.textContent = message;
  ui.activityPrimary.classList.remove("hidden");
  ui.activityPrimary.textContent = nextStation() ? "Continuar jornada" : "Ver sintese final";
  ui.activityPrimary.onclick = () => {
    closeActivity();
    if (!nextStation()) openFinal();
  };
  ui.activityBody.querySelectorAll("button").forEach(button => button.disabled = true);
  updateHUD();
}

function closeActivity() {
  ui.modal.classList.add("hidden");
  activeStation = null;
  paused = false;
  const station = nextStation();
  if (station) {
    const spawn = findSafeSpawnNear(station);
    player.x = spawn.x;
    player.y = spawn.y;
  }
}

function findSafeSpawnNear(station) {
  const offsets = [
    [-125, 0], [-90, 58], [-90, -58], [-45, 78], [-45, -78],
    [0, 88], [0, -88], [72, 58], [72, -58], [118, 0],
    [-160, 0], [160, 0], [0, 125]
  ];
  for (const [dx, dy] of offsets) {
    const x = Math.max(70, Math.min(canvas.width - 70, station.x + dx));
    const y = Math.max(70, Math.min(canvas.height - 70, station.y + dy));
    if (!isSpawnBlocked(x, y, station.phase)) return { x, y };
  }
  return { x: Math.max(70, Math.min(canvas.width - 70, station.x)), y: Math.max(70, Math.min(canvas.height - 70, station.y + 70)) };
}

function isSpawnBlocked(x, y, phaseId) {
  const phase = phases.find(item => item.id === phaseId) || currentPhase();
  if (isTerrainBlocked(phase.area, x, y)) return true;
  if (phase.area !== "polis") return false;
  return polisProps.some(prop => Math.hypot(x - prop.x, y - (prop.y + 14)) < player.r + prop.block * prop.scale)
    || polisNpcs.some(npc => Math.hypot(x - npc.x, y - (npc.y + 16)) < player.r + 18);
}

function openFinal() {
  if (paused && activeStation) return;
  paused = true;
  updateElapsed();
  ui.modal.classList.remove("hidden");
  ui.activityKind.textContent = "Conclusao";
  ui.activityTitle.textContent = "A jornada filosofica foi concluida";
  ui.activityText.textContent = "Voce percorreu as ideias centrais de Heraclito: o fluxo da realidade, a tensao dos opostos e o logos como ordem racional do movimento.";
  ui.activityBody.innerHTML = `<div class="activity-text">Pontuacao final: ${Math.max(0, Math.round(score))}\nAcertos: ${acertos}\nErros: ${erros}\nTempo de aula: ${ui.elapsed.textContent}</div>`;
  ui.activityMsg.textContent = "";
  ui.activityPrimary.classList.remove("hidden");
  ui.activityPrimary.textContent = "Salvar resultado";
  ui.activityPrimary.disabled = false;
  ui.activityPrimary.onclick = finishGame;
  ui.activitySecondary.classList.add("hidden");
}

async function finishGame() {
  paused = true;
  if (elapsedTimer) clearInterval(elapsedTimer);
  const tempoSegundos = Math.round((Date.now() - startTime) / 1000);
  ui.activityPrimary.disabled = true;
  ui.activityTitle.textContent = "Salvando resultado";
  ui.activityText.textContent = "Aguarde um instante enquanto o resultado e registrado.";
  try {
    await salvarResultadoHeraclito({
      uid: user.uid,
      nome: user.displayName || "Aluno",
      email: user.email || "",
      pontuacao: Math.max(0, Math.round(score)),
      acertos,
      erros,
      tempoSegundos,
      detalhesQuestoes: details
    });
    ui.activityTitle.textContent = "Resultado registrado";
    ui.activityText.textContent = `Pontuacao final: ${Math.max(0, Math.round(score))}. Acertos: ${acertos}. Erros: ${erros}.`;
    ui.activityPrimary.textContent = "Voltar ao painel";
    ui.activityPrimary.disabled = false;
    ui.activityPrimary.onclick = () => { location.href = "painel.html"; };
  } catch (error) {
    ui.activityTitle.textContent = "Nao foi possivel salvar";
    ui.activityText.textContent = error.message || "Verifique a conexao e tente novamente.";
    ui.activityPrimary.textContent = "Tentar salvar novamente";
    ui.activityPrimary.disabled = false;
    ui.activityPrimary.onclick = finishGame;
    console.error(error);
  }
}

function makeWordGrid(words) {
  const size = 12;
  const letters = Array.from({ length: size }, () => Array.from({ length: size }, () => ""));
  const positions = {};
  const placements = {
    LOGOS: [0, 1, 0, 1],
    RIO: [2, 2, 1, 0],
    FLUXO: [4, 0, 0, 1],
    FOGO: [6, 7, 1, 0],
    OPOSTOS: [10, 3, 0, 1]
  };
  words.forEach(word => {
    const [row, col, dr, dc] = placements[word];
    positions[word] = [];
    word.split("").forEach((letter, index) => {
      const r = row + dr * index;
      const c = col + dc * index;
      letters[r][c] = letter;
      positions[word].push([r, c]);
    });
  });
  const filler = "HERACLITOEFESOLOGOSRIOFLUXOOPostos".toUpperCase().replace(/[^A-Z]/g, "");
  let cursor = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!letters[r][c]) {
        letters[r][c] = filler[cursor % filler.length];
        cursor++;
      }
    }
  }
  return { letters, positions };
}

function drawScene() {
  const phase = currentPhase();
  ctx.imageSmoothingEnabled = false;
  if (phase.area === "river") drawRiverScene();
  else if (phase.area === "opposites") drawOppositesScene();
  else if (phase.area === "temple") drawTempleScene();
  else drawPolisScene();
  drawJourneyPath();
  drawStations();
  drawPlayer();
  drawParticles();
}

function drawPolisScene() {
  drawPolisTilemap();
  drawTopDownParthenon(720, 58);
  drawMarket();
  [...polisProps, ...polisNpcs].sort((a, b) => a.y - b.y).forEach(item => {
    if (item.role) drawNpc(item);
    else drawWorldProp(item);
  });
}

function tileNoise(col, row) {
  const value = Math.sin(col * 91.17 + row * 37.43) * 43758.5453;
  return value - Math.floor(value);
}

function drawPolisTilemap() {
  const rows = Math.ceil(canvas.height / TILE);
  const cols = Math.ceil(canvas.width / TILE);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * TILE;
      const y = row * TILE;
      drawTile(polisTileTypeAt(x + TILE / 2, y + TILE / 2), x, y, col, row);
    }
  }
}

function drawTile(type, x, y, col, row) {
  const noise = tileNoise(col, row);
  if (type === "water") {
    ctx.fillStyle = noise > .5 ? "#247b91" : "#2f8799";
    ctx.fillRect(x, y, TILE + 1, TILE + 1);
    ctx.strokeStyle = "rgba(203,240,231,.32)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 13 + Math.sin(t * 2 + col) * 2);
    ctx.quadraticCurveTo(x + 20, y + 7, x + 35, y + 13);
    ctx.stroke();
    return;
  }
  if (type === "shore") {
    ctx.fillStyle = noise > .5 ? "#c7a66c" : "#b9965d";
    ctx.fillRect(x, y, TILE + 1, TILE + 1);
    ctx.fillStyle = "rgba(92,72,43,.3)";
    ctx.fillRect(x + 8 + noise * 18, y + 12, 3, 2);
    return;
  }
  if (type === "plaza" || type === "templeFloor") {
    ctx.fillStyle = type === "templeFloor" ? (noise > .5 ? "#d8c7a2" : "#cdb990") : (noise > .5 ? "#b9aa86" : "#aa9975");
    ctx.fillRect(x, y, TILE + 1, TILE + 1);
    ctx.strokeStyle = "rgba(82,65,43,.22)";
    ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);
    ctx.fillStyle = "rgba(255,244,212,.18)";
    ctx.fillRect(x + 5, y + 5, 11, 5);
    return;
  }
  if (type === "garden") {
    ctx.fillStyle = noise > .5 ? "#4f6d3d" : "#5f7d46";
    ctx.fillRect(x, y, TILE + 1, TILE + 1);
    ctx.fillStyle = noise > .55 ? "#7f9d52" : "#3f653d";
    ctx.fillRect(x + 8, y + 8, 8, 5);
    ctx.fillRect(x + 18, y + 20, 6, 4);
    return;
  }
  if (type === "road") {
    ctx.fillStyle = noise > .5 ? "#b9a176" : "#a88f68";
    ctx.fillRect(x, y, TILE + 1, TILE + 1);
    ctx.strokeStyle = "rgba(73,58,39,.2)";
    ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);
    ctx.fillStyle = "rgba(239,219,168,.18)";
    ctx.fillRect(x + 4, y + 4, 9, 7);
    ctx.fillRect(x + 18, y + 18, 8, 6);
    return;
  }
  ctx.fillStyle = noise > .5 ? "#657a4e" : "#708356";
  ctx.fillRect(x, y, TILE + 1, TILE + 1);
  ctx.strokeStyle = "rgba(35,67,43,.16)";
  ctx.beginPath();
  ctx.moveTo(x + 8 + noise * 20, y + 29);
  ctx.lineTo(x + 11 + noise * 20, y + 22);
  ctx.stroke();
}

function drawWorldProp(prop) {
  ctx.save();
  ctx.translate(prop.x, prop.y);
  ctx.scale(prop.scale, prop.scale);
  ctx.fillStyle = "rgba(8,18,20,.24)";
  ctx.beginPath();
  ctx.ellipse(0, 24, 24, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  if (prop.type === "amphora") {
    drawPixelObject("amphora", -24, -38, 3);
  } else if (prop.type === "crate") {
    drawPixelObject("crate", -22, -10, 3);
  } else if (prop.type === "chest") {
    drawPixelObject("chest", -24, -14, 3);
  } else if (prop.type === "scrollStand") {
    drawPixelObject("scrollStand", -22, -34, 3);
  } else if (prop.type === "lamp") {
    drawPixelObject("lamp", -15, -43, 3);
  } else if (prop.type === "brokenColumn") {
    drawPixelObject("brokenColumn", -24, -22, 3);
  } else if (prop.type === "laurel") {
    drawPixelObject("laurel", -25, -28, 3);
  } else {
    ctx.fillStyle = "#79502d";
    ctx.fillRect(-5, -2, 10, 34);
    ctx.fillStyle = prop.type === "cypress" ? "#234b38" : "#3f653d";
    if (prop.type === "cypress") {
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(0, -8 - i * 17, 14 - i * 2, 28, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      for (let i = 0; i < 7; i++) {
        const angle = i * Math.PI * 2 / 7;
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * 15, -12 + Math.sin(angle) * 12, 15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

function drawTopDownParthenon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(20,15,10,.2)";
  ctx.fillRect(-18, 168, 420, 22);
  ctx.fillStyle = "#9a7d55";
  ctx.fillRect(-28, 154, 438, 24);
  ctx.fillStyle = "#c5ad84";
  ctx.fillRect(-18, 132, 418, 24);
  ctx.fillStyle = "#e6d7b6";
  ctx.fillRect(0, 0, 380, 150);
  ctx.strokeStyle = "#7a5b38";
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, 380, 150);
  ctx.fillStyle = "#b99b6b";
  ctx.fillRect(72, 34, 236, 82);
  ctx.fillStyle = "#6f5133";
  ctx.fillRect(82, 44, 216, 62);
  ctx.fillStyle = "#d8c7a2";
  ctx.fillRect(91, 52, 198, 46);

  const column = (cx, cy) => {
    ctx.fillStyle = "#6f5133";
    ctx.fillRect(cx - 10, cy - 10, 20, 20);
    ctx.fillStyle = "#f4e8ca";
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8d704b";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.fillRect(cx - 4, cy - 8, 3, 16);
  };

  for (let i = 0; i < 8; i++) {
    const cx = 34 + i * 45;
    column(cx, 24);
    column(cx, 126);
  }
  for (let i = 1; i < 3; i++) {
    column(24, 42 + i * 28);
    column(356, 42 + i * 28);
  }

  ctx.fillStyle = "#d2bd91";
  ctx.fillRect(155, 150, 70, 22);
  ctx.fillStyle = "#8a673d";
  ctx.fillRect(166, 42, 48, 60);
  ctx.fillStyle = "#f2d477";
  ctx.fillRect(184, 51, 12, 42);
  ctx.restore();
}

function drawPixelObject(type, x, y, scale) {
  const px = (cx, cy, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + cx * scale, y + cy * scale, w * scale, h * scale);
  };
  const dark = "#2a1b13";
  if (type === "amphora") {
    px(5, 0, 6, 2, dark); px(4, 2, 8, 2, "#73321d"); px(2, 4, 12, 4, "#b85d2c");
    px(1, 8, 14, 6, "#ca7432"); px(2, 14, 12, 4, "#9c4a27"); px(4, 18, 8, 2, dark);
    px(0, 6, 2, 6, dark); px(14, 6, 2, 6, dark); px(5, 9, 6, 2, "#ffd178");
  } else if (type === "crate") {
    px(0, 1, 15, 12, dark); px(1, 2, 13, 10, "#9f5e27"); px(2, 3, 11, 2, "#c18037");
    px(2, 9, 11, 2, "#6f3f1e"); px(3, 5, 2, 5, "#70401d"); px(10, 5, 2, 5, "#70401d");
  } else if (type === "chest") {
    px(0, 3, 16, 10, dark); px(1, 1, 14, 5, "#d79827"); px(1, 6, 14, 7, "#96531e");
    px(7, 5, 2, 4, "#ffd96b"); px(2, 2, 12, 1, "#ffe28a");
  } else if (type === "scrollStand") {
    px(2, 0, 12, 13, dark); px(3, 1, 10, 11, "#e0bd79"); px(4, 3, 8, 1, "#82512a");
    px(4, 6, 8, 1, "#82512a"); px(4, 9, 6, 1, "#82512a"); px(6, 13, 4, 5, "#6c4527");
  } else if (type === "lamp") {
    px(6, 7, 3, 12, "#4b2a19"); px(2, 16, 11, 3, dark); px(3, 12, 9, 5, "#a85a24");
    px(6, 0, 3, 3, "#fff0a8"); px(5, 3, 5, 5, "#f0a22c"); px(4, 6, 7, 3, "#c54e28");
  } else if (type === "brokenColumn") {
    px(1, 10, 16, 4, dark); px(2, 6, 11, 5, "#d9c8a5"); px(5, 0, 8, 7, "#eee2c3");
    px(5, 2, 8, 1, "#a48d66"); px(7, 7, 3, 8, "#cbb78f");
  } else if (type === "laurel") {
    for (let i = 0; i < 7; i++) {
      px(2 + i, 8 - i, 3, 4, i % 2 ? "#2f7c44" : "#4f9b50");
      px(13 - i, 8 - i, 3, 4, i % 2 ? "#2f7c44" : "#4f9b50");
    }
    px(7, 12, 5, 2, "#d9a236");
  }
}

function drawNpc(npc) {
  ctx.save();
  const idle = Math.sin(t * 2 + npc.bob) * .7;
  ctx.translate(npc.x, npc.y + idle);
  const palettes = {
    merchant: { tunic: "#a8672c", trim: "#e0a147", hair: "#2b1b14", skin: "#c9895d" },
    soldier: { tunic: "#7f3127", trim: "#b9b9b9", hair: "#3c2718", skin: "#c9895d", helmet: "#b4ad9d" },
    priestess: { tunic: "#eee1c9", trim: "#8d3c8f", hair: "#3d2242", skin: "#d49b6c" },
    fisher: { tunic: "#2d7d91", trim: "#91d5d5", hair: "#1e1c1a", skin: "#bf8058" }
  };
  drawPixelPerson({
    direction: npc.direction,
    moving: false,
    walk: t + npc.bob,
    scale: 3,
    palette: palettes[npc.role] || palettes.merchant
  });
  ctx.restore();
}

function drawRiverScene() {
  const rows = Math.ceil(canvas.height / TILE);
  const cols = Math.ceil(canvas.width / TILE);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * TILE;
      const y = row * TILE;
      const noise = tileNoise(col, row);
      if (x < 170 || x > canvas.width - 202) {
        drawTile(noise > .65 ? "garden" : "grass", x, y, col, row);
      } else if (x < 214 || x > canvas.width - 246) {
        drawTile("shore", x, y, col, row);
      } else {
        drawTile("water", x, y, col, row);
      }
    }
  }
  ctx.fillStyle = "rgba(37,67,48,.35)";
  ctx.fillRect(0, 0, 170, canvas.height);
  ctx.fillRect(canvas.width - 170, 0, 170, canvas.height);
  drawRiverShrine(46, 260);
  drawRiverShrine(1115, 260);
  drawRiverCrossing();
}

function drawRiverCrossing() {
  ctx.save();
  ctx.strokeStyle = "rgba(238,215,161,.28)";
  ctx.lineWidth = 80;
  ctx.lineCap = "round";
  ctx.beginPath();
  riverRoute.forEach(([x, y], index) => {
    if (index) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  });
  ctx.stroke();
  ctx.strokeStyle = "rgba(64,47,31,.58)";
  ctx.lineWidth = 12;
  ctx.setLineDash([22, 28]);
  ctx.stroke();
  ctx.setLineDash([]);
  riverStones.forEach(([x, y], index) => {
    ctx.fillStyle = index % 2 ? "#c7b18b" : "#b6a07a";
    ctx.strokeStyle = "#5f4930";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, y + 10, 48, 24, Math.sin(index) * .28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.16)";
    ctx.fillRect(x - 20, y - 2, 24, 5);
  });
  ctx.restore();
}

function drawRiverShrine(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(0,0,0,.18)";
  ctx.fillRect(-16, 120, 150, 20);
  ctx.fillStyle = "#d8c9a7";
  ctx.fillRect(0, 0, 112, 16);
  ctx.fillRect(-8, 112, 128, 16);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = "#efe2c3";
    ctx.fillRect(12 + i * 36, 16, 14, 96);
    ctx.fillStyle = "rgba(89,65,39,.24)";
    ctx.fillRect(18 + i * 36, 16, 3, 96);
  }
  ctx.restore();
}

function drawOppositesScene() {
  const split = canvas.width / 2;
  ctx.fillStyle = "#f4d38b";
  ctx.fillRect(0, 0, split, canvas.height);
  ctx.fillStyle = "#172638";
  ctx.fillRect(split, 0, split, canvas.height);
  ctx.fillStyle = "#c45f3b";
  ctx.beginPath();
  ctx.arc(210, 130, 62, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dce8ff";
  ctx.beginPath();
  ctx.arc(1030, 120, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8c5334";
  ctx.fillRect(0, 430, canvas.width, 210);
  drawSun(205, 120, 58);
  ctx.fillStyle = "#d8e7f4";
  ctx.beginPath();
  ctx.arc(1035, 120, 55, .35, Math.PI * 1.65);
  ctx.fill();
  drawColumns(510, 170, 4, "#f7e4bd");
  drawColumns(780, 170, 4, "#d2d9e5");
}

function drawTempleScene() {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#27384b");
  sky.addColorStop(1, "#111c27");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#3b4656";
  ctx.fillRect(0, 440, canvas.width, 200);
  drawHills("#17232e", 355, 70, 1.7);
  drawColumns(390, 120, 9, "#ece0c7");
  ctx.fillStyle = "#e7b84a";
  ctx.font = "700 58px Georgia,serif";
  ctx.textAlign = "center";
  ctx.fillText("LOGOS", canvas.width / 2, 100);
}

function drawSun(x, y, radius) {
  const glow = ctx.createRadialGradient(x, y, 4, x, y, radius);
  glow.addColorStop(0, "#fff8c7");
  glow.addColorStop(.45, "#f5c85b");
  glow.addColorStop(1, "rgba(245,200,91,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawHills(color, baseline, amplitude, frequency) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  ctx.lineTo(0, baseline);
  for (let x = 0; x <= canvas.width; x += 32) {
    const y = baseline - Math.sin(x / 170 * frequency) * amplitude - Math.cos(x / 91) * amplitude * .34;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.fill();
}

function drawWaterLines(top, bottom, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  for (let y = top + 18; y < bottom; y += 22) {
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += 40) {
      const wave = y + Math.sin(x / 45 + t * 1.2) * 4;
      if (x === 0) ctx.moveTo(x, wave);
      else ctx.lineTo(x, wave);
    }
    ctx.stroke();
  }
}

function drawJourneyPath() {
  const active = phaseStations().filter(station => !station.done);
  if (!active.length) return;
  ctx.save();
  ctx.strokeStyle = "rgba(255,242,177,.86)";
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.setLineDash([2, 28]);
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  active.forEach(station => ctx.lineTo(station.x, station.y));
  ctx.stroke();
  ctx.restore();
}

function drawColumns(x, y, count, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x - 35, y - 28, count * 70 + 70, 28);
  ctx.fillRect(x - 15, y + 238, count * 70 + 30, 24);
  for (let i = 0; i < count; i++) {
    const cx = x + i * 70;
    ctx.fillRect(cx, y, 28, 240);
    ctx.fillStyle = "rgba(100,70,40,.12)";
    ctx.fillRect(cx + 10, y, 4, 240);
    ctx.fillStyle = color;
  }
}

function drawMarket() {
  for (let i = 0; i < 4; i++) {
    const x = 80 + i * 125;
    ctx.fillStyle = "rgba(16,23,18,.22)";
    ctx.fillRect(x + 4, 426, 78, 10);
    ctx.fillStyle = "#5a3921";
    ctx.fillRect(x + 8, 356, 8, 76);
    ctx.fillRect(x + 65, 356, 8, 76);
    ctx.fillStyle = "#d9bc77";
    ctx.fillRect(x + 14, 386, 54, 38);
    ctx.fillStyle = i % 2 ? "#2f7891" : "#a84d36";
    ctx.fillRect(x, 344, 82, 12);
    ctx.fillStyle = i % 2 ? "#f0d38b" : "#f5c75e";
    for (let stripe = 0; stripe < 5; stripe++) ctx.fillRect(x + stripe * 17, 344, 8, 12);
    ctx.fillStyle = "#302014";
    ctx.fillRect(x - 4, 340, 90, 5);
    drawPixelObject(i % 2 ? "crate" : "amphora", x + 25, 388, 2);
    drawPixelObject(i % 2 ? "scrollStand" : "crate", x + 45, 390, 2);
  }
}

function drawStations() {
  const station = nextStation();
  if (!station) return;
  ctx.save();
  ctx.translate(station.x, station.y);
  const colors = { reading: "#66c5d6", choice: "#e7b84a", tf: "#e7b84a", match: "#c45f3b", wordsearch: "#c45f3b", hangman: "#c45f3b", order: "#9cc36a", reflection: "#d39be5" };
  const symbols = { reading: "L", choice: "?", tf: "V", match: "A", wordsearch: "C", hangman: "F", order: "S", reflection: "R" };
  ctx.shadowColor = colors[station.kind];
  ctx.shadowBlur = 22 + Math.sin(t * 3) * 5;
  ctx.fillStyle = colors[station.kind];
  ctx.beginPath();
  ctx.arc(0, 0, 31 + Math.sin(t * 4) * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#102533";
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#ffe39a";
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#fff8e8";
  ctx.font = "900 22px Arial";
  ctx.textAlign = "center";
  ctx.fillText(symbols[station.kind] || "?", 0, 8);
  const label = `${station.id ? stations.indexOf(station) + 1 : ""}. ${station.title}`.toUpperCase();
  ctx.font = "900 15px Georgia,serif";
  const labelWidth = Math.min(265, Math.max(150, ctx.measureText(label).width + 30));
  ctx.fillStyle = "rgba(244,218,164,.96)";
  ctx.strokeStyle = "#70431d";
  ctx.lineWidth = 3;
  ctx.fillRect(-labelWidth / 2, 45, labelWidth, 42);
  ctx.strokeRect(-labelWidth / 2, 45, labelWidth, 42);
  ctx.fillStyle = "#25170c";
  ctx.fillText(label, 0, 71, labelWidth - 18);
  ctx.restore();
}

function drawPixelPerson({ direction, moving, walk, scale, palette }) {
  const s = scale;
  const step = moving ? Math.sign(Math.sin(walk * Math.PI)) : 0;
  const side = direction === "left" || direction === "right";
  const facing = direction === "left" ? -1 : 1;
  const px = (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect((x - 8) * s, (y - 24) * s, w * s, h * s);
  };

  ctx.save();
  ctx.scale(facing, 1);
  px(4, 21, 8, 2, "rgba(0,0,0,.25)");
  px(5, 0, 6, 1, "#1f1712");
  px(3, 1, 10, 2, palette.hair);
  px(2, 3, 12, 3, palette.hair);
  px(3, 4, 10, 6, palette.skin);
  if (direction === "up") {
    px(2, 4, 12, 5, palette.hair);
  } else if (side) {
    px(9, 6, 2, 1, "#1d1511");
    px(11, 7, 1, 1, "#7b432b");
  } else {
    px(5, 6, 2, 1, "#1d1511");
    px(9, 6, 2, 1, "#1d1511");
    px(7, 8, 3, 1, "#7b432b");
  }
  if (palette.helmet) {
    px(2, 0, 12, 4, palette.helmet);
    px(7, -3, 2, 3, "#9b2e22");
  }

  px(3, 10, 10, 9, "#1f1712");
  px(4, 10, 8, 8, palette.tunic);
  px(4, 13, 8, 2, palette.trim);
  px(7, 10, 2, 8, "rgba(255,255,255,.2)");

  const armSwing = moving ? step : 0;
  px(1, 11 + Math.max(0, armSwing), 3, 7, "#1f1712");
  px(12, 11 + Math.max(0, -armSwing), 3, 7, "#1f1712");
  px(1, 11 + Math.max(0, armSwing), 2, 6, palette.skin);
  px(13, 11 + Math.max(0, -armSwing), 2, 6, palette.skin);

  const leftLeg = moving ? step : 0;
  const rightLeg = moving ? -step : 0;
  px(4, 18 + Math.max(0, leftLeg), 3, 5, "#2c2019");
  px(9, 18 + Math.max(0, rightLeg), 3, 5, "#2c2019");
  px(3, 22 + Math.max(0, leftLeg), 5, 2, "#1d1410");
  px(8, 22 + Math.max(0, rightLeg), 5, 2, "#1d1410");
  ctx.restore();
}

function drawPlayer() {
  ctx.save();
  const bob = player.moving ? Math.abs(Math.sin(player.walkFrame * Math.PI)) * 2 : Math.sin(t * 2) * .45;
  const glow = ["#ffffff", "#66c5d6", "#c45f3b", "#e7b84a"][Math.min(player.power, 3)];
  ctx.translate(player.x, player.y - bob);
  ctx.shadowColor = glow;
  ctx.shadowBlur = player.power ? 14 : 0;
  drawPixelPerson({
    direction: player.direction,
    moving: player.moving,
    walk: player.walkFrame,
    scale: 3,
    palette: {
      tunic: player.power >= 3 ? "#d9a42f" : "#eee1c9",
      trim: "#9f4d2d",
      hair: "#2b1d17",
      skin: "#d29a6e"
    }
  });
  ctx.shadowBlur = 0;
  if (player.power) {
    ctx.fillStyle = glow;
    for (let i = 0; i < player.power; i++) {
      const angle = t * 1.8 + i * Math.PI * 2 / player.power;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * 33, Math.sin(angle) * 22 - 18, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function makeGlow(x, y, color) {
  for (let i = 0; i < 34; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - .5) * 5,
      vy: (Math.random() - .5) * 5,
      life: 44,
      color,
      r: 3 + Math.random() * 5
    });
  }
}

function drawParticles() {
  particles = particles.filter(particle => particle.life-- > 0);
  particles.forEach(particle => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += .035;
    ctx.globalAlpha = Math.max(0, particle.life / 44);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

function loop() {
  t += 0.018;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawScene();
  movePlayer();
  checkStations();
  requestAnimationFrame(loop);
}

updateHUD();
loop();
