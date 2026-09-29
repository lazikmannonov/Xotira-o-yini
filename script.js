const RASMLAR = [
"🍎",
"🚀",
"🐱",
"⚽",
"🎸",
"🌵",
"🍕",
"🌙"
];

const REKORD_KALIT = "xotira-rekord";
const REJIM_KALIT = "xotira-rejim";

const taxta = document.getElementById("taxta");
const yurishEl = document.getElementById("yurishlar");
const vaqtEl = document.getElementById("vaqt");
const rekordEl = document.getElementById("rekord");
const xabarEl = document.getElementById("xabar");
const qaytaBtn = document.getElementById("qayta");
const rejimBtn = document.getElementById("rejim");

const topilganEl = document.getElementById("topilgan");

const winModal = document.getElementById("winModal");
const winText = document.getElementById("winText");
const winMoves = document.getElementById("winMoves");
const winTime = document.getElementById("winTime");
const newRecordEl = document.getElementById("newRecord");
const modalRestart = document.getElementById("modalRestart");

let birinchi = null;
let band = false;
let topilgan = 0;
let yurishlar = 0;
let sekund = 0;
let taymer = null;

/* =========================
RANDOM
========================= */

function aralashtir(royxat) {
const nusxa = [...royxat];

for (let i = nusxa.length - 1; i > 0; i--) {
const j = Math.floor(Math.random() * (i + 1));

```
[nusxa[i], nusxa[j]] = [
  nusxa[j],
  nusxa[i]
];

}

return nusxa;
}

/* =========================
RECORD
========================= */

function rekordniOqi() {
try {
const v = Number(
localStorage.getItem(REKORD_KALIT)
);

return v > 0 ? v : null;

} catch {
return null;
}
}

function rekordniYoz(v) {
try {
localStorage.setItem(
REKORD_KALIT,
String(v)
);
} catch {
// Saqlash ishlamasa, o'yin davom etadi.
}
}

function rekordniKorsat() {
const rekord = rekordniOqi();

rekordEl.textContent = rekord
? `${rekord}`
: "-";
}

/* =========================
TIMER
========================= */

function taymerniToxtat() {
clearInterval(taymer);
taymer = null;
}

function taymerniBoshla() {
if (taymer) return;

taymer = setInterval(() => {
sekund++;

vaqtEl.textContent = sekund;

}, 1000);
}

/* =========================
THEME
========================= */

function rejimniOqi() {
try {
return localStorage.getItem(REJIM_KALIT);
} catch {
return null;
}
}

function rejimniYoz(rejim) {
try {
localStorage.setItem(
REJIM_KALIT,
rejim
);
} catch {
// Hech narsa qilmaymiz.
}
}

function rejimniOrnat(rejim) {

document.documentElement.setAttribute(
"data-theme",
rejim
);

rejimBtn.textContent =
rejim === "dark"
? "☀️"
: "🌙";
}

function rejimniAlmashtir() {

const hozirgi =
document.documentElement.getAttribute(
"data-theme"
) || "light";

const yangi =
hozirgi === "dark"
? "light"
: "dark";

rejimniOrnat(yangi);
rejimniYoz(yangi);
}

function boshlangichRejim() {

const saqlangan = rejimniOqi();

if (saqlangan === "dark" || saqlangan === "light") {
rejimniOrnat(saqlangan);
return;
}

const tizimDark =
window.matchMedia &&
window.matchMedia(
"(prefers-color-scheme: dark)"
).matches;

rejimniOrnat(
tizimDark ? "dark" : "light"
);
}

/* =========================
BOARD
========================= */

function yangiOyin() {

taymerniToxtat();

yopModal();

birinchi = null;
band = false;
topilgan = 0;
yurishlar = 0;
sekund = 0;

yurishEl.textContent = "0";
vaqtEl.textContent = "0";

topilganEl.textContent = "0";

xabarEl.textContent = "";
xabarEl.className = "xabar";

rekordniKorsat();

taxta.innerHTML = "";

const kartalar = aralashtir([
...RASMLAR,
...RASMLAR
]);

kartalar.forEach((rasm, index) => {

const karta =
  document.createElement("button");

karta.type = "button";

karta.className = "karta";

karta.dataset.rasm = rasm;

karta.dataset.index = index;

karta.setAttribute(
  "aria-label",
  "Yopiq karta"
);

karta.innerHTML = `
  <div class="ichki">

    <div class="yuz orqa"></div>

    <div class="yuz old"></div>

  </div>
`;

karta.querySelector(
  ".old"
).textContent = rasm;

karta.addEventListener(
  "click",
  () => bos(karta)
);

taxta.appendChild(karta);

});
}

/* =========================
CARD CLICK
========================= */

function bos(karta) {

if (band) return;

if (
karta.classList.contains("ochiq") ||
karta.classList.contains("topilgan")
) {
return;
}

taymerniBoshla();

karta.classList.add("ochiq");

karta.setAttribute(
"aria-label",
"Ochiq karta: " +
karta.dataset.rasm
);

if (!birinchi) {

birinchi = karta;

return;

}

yurishlar++;

yurishEl.textContent = yurishlar;

const ikkinchi = karta;

if (
birinchi.dataset.rasm ===
ikkinchi.dataset.rasm
) {

[birinchi, ikkinchi].forEach(
  (k) => {

    k.classList.remove("ochiq");

    k.classList.add("topilgan");

    k.setAttribute(
      "aria-label",
      "Topilgan karta: " +
      k.dataset.rasm
    );
  }
);

birinchi = null;

topilgan++;

topilganEl.textContent =
  topilgan;

if (
  topilgan === RASMLAR.length
) {
  yutdi();
}

return;

}

band = true;

const a = birinchi;

birinchi = null;

setTimeout(() => {

[a, ikkinchi].forEach(
  (k) => {

    k.classList.remove("ochiq");

    k.setAttribute(
      "aria-label",
      "Yopiq karta"
    );
  }
);

band = false;

}, 800);
}

/* =========================
WIN
========================= */

function yutdi() {

taymerniToxtat();

const eski = rekordniOqi();

const yangiRekord =
!eski || yurishlar < eski;

if (yangiRekord) {
rekordniYoz(yurishlar);
}

winMoves.textContent =
yurishlar;

winTime.textContent =
sekund;

winText.textContent =
`${yurishlar} yurish va ${sekund} soniyada barcha juftliklarni topdingiz.`;

if (yangiRekord) {

newRecordEl.classList.add(
  "show"
);

xabarEl.textContent =
  "🎉 Yangi rekord o‘rnatildi!";

xabarEl.classList.add(
  "success"
);

} else {

newRecordEl.classList.remove(
  "show"
);

xabarEl.textContent =
  "🎉 Ajoyib! Barcha juftliklar topildi.";

xabarEl.classList.add(
  "success"
);

}

rekordniKorsat();

setTimeout(() => {
ochModal();
}, 450);
}

/* =========================
MODAL
========================= */

function ochModal() {

winModal.classList.add("active");

winModal.setAttribute(
"aria-hidden",
"false"
);

document.body.style.overflow =
"hidden";
}

function yopModal() {

winModal.classList.remove(
"active"
);

winModal.setAttribute(
"aria-hidden",
"true"
);

document.body.style.overflow =
"";
}

/* =========================
EVENTS
========================= */

qaytaBtn.addEventListener(
"click",
yangiOyin
);

modalRestart.addEventListener(
"click",
yangiOyin
);

rejimBtn.addEventListener(
"click",
rejimniAlmashtir
);

winModal
.querySelector(".modal-overlay")
.addEventListener(
"click",
yopModal
);

document.addEventListener(
"keydown",
(event) => {

if (
  event.key === "Escape" &&
  winModal.classList.contains("active")
) {
  yopModal();
}

}
);

/* =========================
START
========================= */

boshlangichRejim();

yangiOyin();
