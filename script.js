const RASMLAR = ["🍎", "🚀", "🐱", "⚽", "🎸", "🌵", "🍕", "🌙"];
const REKORD_KALIT = "xotira-rekord";

const taxta = document.getElementById("taxta");
const yurishEl = document.getElementById("yurishlar");
const vaqtEl = document.getElementById("vaqt");
const rekordEl = document.getElementById("rekord");
const xabarEl = document.getElementById("xabar");
const qaytaBtn = document.getElementById("qayta");

let birinchi = null;
let band = false;
let topilgan = 0;
let yurishlar = 0;
let sekund = 0;
let taymer = null;

function aralashtir(royxat) {
  const nusxa = [...royxat];
  for (let i = nusxa.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nusxa[i], nusxa[j]] = [nusxa[j], nusxa[i]];
  }
  return nusxa;
}

function rekordniOqi() {
  try {
    const v = Number(localStorage.getItem(REKORD_KALIT));
    return v > 0 ? v : null;
  } catch {
    return null;
  }
}

function rekordniYoz(v) {
  try {
    localStorage.setItem(REKORD_KALIT, String(v));
  } catch {
    /* brauzer saqlashga ruxsat bermasa, e'tibor bermaymiz */
  }
}

function rekordniKorsat() {
  const r = rekordniOqi();
  rekordEl.textContent = r ? `${r} yurish` : "-";
}

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

function yangiOyin() {
  taymerniToxtat();
  birinchi = null;
  band = false;
  topilgan = 0;
  yurishlar = 0;
  sekund = 0;
  yurishEl.textContent = "0";
  vaqtEl.textContent = "0";
  xabarEl.textContent = "";
  rekordniKorsat();

  taxta.innerHTML = "";
  aralashtir([...RASMLAR, ...RASMLAR]).forEach((rasm) => {
    const karta = document.createElement("button");
    karta.type = "button";
    karta.className = "karta";
    karta.dataset.rasm = rasm;
    karta.setAttribute("aria-label", "Yopiq karta");
    karta.innerHTML =
      '<div class="ichki">' +
      '<div class="yuz orqa">?</div>' +
      '<div class="yuz old"></div>' +
      "</div>";
    karta.querySelector(".old").textContent = rasm; // textContent: xavfsiz
    karta.addEventListener("click", () => bos(karta));
    taxta.appendChild(karta);
  });
}

function bos(karta) {
  if (band) return;
  if (karta.classList.contains("ochiq") || karta.classList.contains("topilgan")) return;

  taymerniBoshla();
  karta.classList.add("ochiq");
  karta.setAttribute("aria-label", "Karta: " + karta.dataset.rasm);

  if (!birinchi) {
    birinchi = karta;
    return;
  }

  yurishlar++;
  yurishEl.textContent = yurishlar;
  const ikkinchi = karta;

  if (birinchi.dataset.rasm === ikkinchi.dataset.rasm) {
    [birinchi, ikkinchi].forEach((k) => {
      k.classList.remove("ochiq");
      k.classList.add("topilgan");
    });
    birinchi = null;
    topilgan++;
    if (topilgan === RASMLAR.length) yutdi();
  } else {
    band = true;
    const a = birinchi;
    birinchi = null;
    setTimeout(() => {
      [a, ikkinchi].forEach((k) => {
        k.classList.remove("ochiq");
        k.setAttribute("aria-label", "Yopiq karta");
      });
      band = false;
    }, 800);
  }
}

function yutdi() {
  taymerniToxtat();
  const eski = rekordniOqi();
  let matn = `Tabriklayman! ${yurishlar} yurish va ${sekund} soniyada topdingiz.`;
  if (!eski || yurishlar < eski) {
    rekordniYoz(yurishlar);
    matn += " Yangi rekord!";
  }
  xabarEl.textContent = matn;
  rekordniKorsat();
}

qaytaBtn.addEventListener("click", yangiOyin);
yangiOyin();
