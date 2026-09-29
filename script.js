const RASMLAR = [
    "🍎",
    "🚀",
    "🐱",
    "⚽",
    "🎸",
    "🌵",
    "🍕",
    "🌙",
    "🦊",
    "🎮",
    "🍔",
    "🐼",
    "⭐",
    "🚗",
    "🎧",
    "🌈"
];

const LEVELS = [
    {
        id: 1,
        name: "Easy",
        uz: "Oson",
        icon: "🟢",
        pairs: 4,
        time: 120,
        description: "4 juftlik • Boshlash uchun",
        difficulty: 1
    },
    {
        id: 2,
        name: "Normal",
        uz: "Oddiy",
        icon: "🔵",
        pairs: 8,
        time: 120,
        description: "8 juftlik • Klassik rejim",
        difficulty: 2
    },
    {
        id: 3,
        name: "Hard",
        uz: "Qiyin",
        icon: "🟠",
        pairs: 10,
        time: 100,
        description: "10 juftlik • Vaqt cheklangan",
        difficulty: 3
    },
    {
        id: 4,
        name: "Expert",
        uz: "Ekspert",
        icon: "🔴",
        pairs: 12,
        time: 90,
        description: "12 juftlik • Juda qiyin",
        difficulty: 4
    },
    {
        id: 5,
        name: "Master",
        uz: "Usta",
        icon: "🟣",
        pairs: 16,
        time: 120,
        description: "16 juftlik • Eng yuqori daraja",
        difficulty: 5
    }
];

const REKORD_KEY = "xotira-rekordlar";
const PROGRESS_KEY = "xotira-progress";
const THEME_KEY = "xotira-rejim";

const levelScreen = document.getElementById("levelScreen");
const levelsBox = document.getElementById("levels");
const gameContent = document.getElementById("gameContent");

const backLevels = document.getElementById("backLevels");
const levelIcon = document.getElementById("levelIcon");
const levelName = document.getElementById("levelName");
const levelNumber = document.getElementById("levelNumber");

const yurishlar = document.getElementById("yurishlar");
const vaqt = document.getElementById("vaqt");
const rekord = document.getElementById("rekord");
const yulduz = document.getElementById("yulduz");

const topilgan = document.getElementById("topilgan");
const jami = document.getElementById("jami");
const taxta = document.getElementById("taxta");
const xabar = document.getElementById("xabar");

const qayta = document.getElementById("qayta");
const rejim = document.getElementById("rejim");

const comboElement = document.getElementById("combo");
const comboBox = document.getElementById("comboBox");

const timeLimitBox = document.getElementById("timeLimitBox");
const timeLimit = document.getElementById("timeLimit");

const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");

const winModal = document.getElementById("winModal");
const winTitle = document.getElementById("winTitle");
const winText = document.getElementById("winText");
const winMoves = document.getElementById("winMoves");
const winTime = document.getElementById("winTime");
const newRecord = document.getElementById("newRecord");
const starsResult = document.getElementById("starsResult");

const modalRestart = document.getElementById("modalRestart");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const modalLevels = document.getElementById("modalLevels");

let tanlanganLevel = null;
let kartalar = [];
let birinchi = null;
let ikkinchi = null;
let qulflangan = false;

let yurish = 0;
let topilganSoni = 0;
let vaqtSon = 0;
let timer = null;
let oyinBoshlangan = false;

let combo = 0;
let bonusVaqt = 0;

let rekordlar = {};
let ochilganLevel = 1;
let oxirgiYulduz = 0;


/* =========================
   LOCAL STORAGE
========================= */

function rekordlarniOqish(){
    try{
        rekordlar = JSON.parse(localStorage.getItem(REKORD_KEY)) || {};
    }catch(e){
        rekordlar = {};
    }
}

function rekordniSaqlash(){
    localStorage.setItem(REKORD_KEY, JSON.stringify(rekordlar));
}

function progressOqish(){
    const qiymat = parseInt(localStorage.getItem(PROGRESS_KEY));

    if(!isNaN(qiymat) && qiymat >= 1){
        ochilganLevel = Math.min(qiymat, LEVELS.length);
    }else{
        ochilganLevel = 1;
    }
}

function progressSaqlash(){
    localStorage.setItem(PROGRESS_KEY, String(ochilganLevel));
}


/* =========================
   THEME
========================= */

function boshlangichRejim(){

    const saqlangan = localStorage.getItem(THEME_KEY);

    if(saqlangan === "dark"){
        document.documentElement.setAttribute("data-theme","dark");
        rejim.textContent = "☀️";
    }else{
        document.documentElement.removeAttribute("data-theme");
        rejim.textContent = "🌙";
    }
}

function rejimniAlmashtir(){

    const dark =
        document.documentElement.getAttribute("data-theme") === "dark";

    if(dark){
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem(THEME_KEY,"light");
        rejim.textContent = "🌙";
    }else{
        document.documentElement.setAttribute("data-theme","dark");
        localStorage.setItem(THEME_KEY,"dark");
        rejim.textContent = "☀️";
    }
}

rejim.addEventListener("click",rejimniAlmashtir);


/* =========================
   LEVELS
========================= */

function levelYulduzlari(levelId){

    const qiymat = Number(rekordlar[levelId + "-stars"] || 0);

    if(qiymat === 3) return "⭐⭐⭐";
    if(qiymat === 2) return "⭐⭐☆";
    if(qiymat === 1) return "⭐☆☆";

    return "☆☆☆";
}

function levelOchilganmi(levelId){
    return levelId <= ochilganLevel;
}

function levelsniChiz(){

    levelsBox.innerHTML = "";

    LEVELS.forEach(level => {

        const ochiq = levelOchilganmi(level.id);
        const stars = levelYulduzlari(level.id);
        const best = rekordlar[level.id] || null;

        const card = document.createElement("button");

        card.className =
            "level-card" +
            (ochiq ? "" : " locked") +
            (best ? " completed" : "");

        card.innerHTML = `
            <div class="level-number">${level.icon}</div>

            <div class="level-info">
                <strong>${level.id}. ${level.name}</strong>
                <small>${level.description}</small>
            </div>

            <div class="level-right">
                <div class="stars">${stars}</div>
                <small>${best ? "Rekord: " + best : "Ochish uchun"}</small>
            </div>

            <div class="lock">
                ${ochiq ? "→" : "🔒"}
            </div>
        `;

        if(ochiq){
            card.addEventListener("click",() => levelniBoshlash(level.id));
        }

        levelsBox.appendChild(card);
    });

    const tugagan = LEVELS.filter(
        level => rekordlar[level.id]
    ).length;

    progressText.textContent =
        `${tugagan} / ${LEVELS.length}`;

    progressFill.style.width =
        `${Math.max(20,(tugagan / LEVELS.length) * 100)}%`;
}


/* =========================
   LEVEL BOSHLASH
========================= */

function levelniBoshlash(levelId){

    tanlanganLevel =
        LEVELS.find(level => level.id === levelId);

    if(!tanlanganLevel) return;

    levelScreen.classList.add("hidden");
    gameContent.classList.remove("hidden");

    levelIcon.textContent = tanlanganLevel.icon;
    levelName.textContent = tanlanganLevel.name;
    levelNumber.textContent =
        `${tanlanganLevel.id}-bosqich`;

    boshlangichOyin();
}


/* =========================
   O‘YIN
========================= */

function boshlangichOyin(){

    clearInterval(timer);

    kartalar = [];
    birinchi = null;
    ikkinchi = null;
    qulflangan = false;

    yurish = 0;
    topilganSoni = 0;
    combo = 0;
    bonusVaqt = 0;
    vaqtSon = 0;
    oyinBoshlangan = false;

    yurishlar.textContent = "0";
    topilgan.textContent = "0";
    jami.textContent = tanlanganLevel.pairs;
    vaqt.textContent = "00:00";

    comboElement.textContent = "0";

    comboBox.classList.remove("active");

    xabar.textContent = "Bir xil kartalarni toping!";
    xabar.className = "xabar";

    const best = rekordlar[tanlanganLevel.id];

    rekord.textContent =
        best ? best : "—";

    yulduz.textContent = "0";

    timeLimit.textContent =
        formatVaqt(tanlanganLevel.time);

    timeLimitBox.classList.remove(
        "warning",
        "danger"
    );

    taxta.innerHTML = "";

    const rasmlar = RASMLAR
        .slice(0,tanlanganLevel.pairs);

    let nusxa = [
        ...rasmlar,
        ...rasmlar
    ];

    aralashtir(nusxa);

    nusxa.forEach((emoji,index) => {

        const karta = document.createElement("button");

        karta.className = "karta";

        karta.dataset.index = index;
        karta.dataset.value = emoji;

        karta.innerHTML = `
            <div class="karta-inner">
                <div class="karta-front"></div>
                <div class="karta-back">${emoji}</div>
            </div>
        `;

        karta.addEventListener(
            "click",
            () => kartaBosildi(karta)
        );

        taxta.appendChild(karta);

        kartalar.push(karta);
    });

    if(tanlanganLevel.pairs >= 12){
        taxta.style.gridTemplateColumns = "repeat(4,1fr)";
    }else{
        taxta.style.gridTemplateColumns = "repeat(4,1fr)";
    }

    oyinBoshlangan = true;
}


/* =========================
   ARALASHTIRISH
========================= */

function aralashtir(massiv){

    for(let i = massiv.length - 1; i > 0; i--){

        const j =
            Math.floor(Math.random() * (i + 1));

        [
            massiv[i],
            massiv[j]
        ] = [
            massiv[j],
            massiv[i]
        ];
    }
}


/* =========================
   KARTA BOSISH
========================= */

function kartaBosildi(karta){

    if(
        !oyinBoshlangan ||
        qulflangan ||
        karta.classList.contains("ochiq") ||
        karta.classList.contains("topilgan")
    ){
        return;
    }

    if(!timer){
        timerniBoshlash();
    }

    karta.classList.add("ochiq");

    if(!birinchi){
        birinchi = karta;
        return;
    }

    ikkinchi = karta;
    yurish++;

    yurishlar.textContent = yurish;

    tekshirish();
}


/* =========================
   JUFTLIK TEKSHIRISH
========================= */

function tekshirish(){

    qulflangan = true;

    const mos =
        birinchi.dataset.value ===
        ikkinchi.dataset.value;

    if(mos){

        setTimeout(() => {

            birinchi.classList.add("topilgan");
            ikkinchi.classList.add("topilgan");

            topilganSoni++;

            topilgan.textContent =
                topilganSoni;

            combo++;

            comboElement.textContent =
                combo;

            comboBox.classList.remove("active");

            void comboBox.offsetWidth;

            comboBox.classList.add("active");

            if(combo >= 2){
                bonusVaqt += 3;
                vaqtSon = Math.max(
                    0,
                    vaqtSon - 3
                );

                xabar.textContent =
                    `🔥 ${combo} Combo! 3 soniya bonus!`;

                xabar.className =
                    "xabar success";
            }else{
                xabar.textContent =
                    "✓ Juftlik topildi!";

                xabar.className =
                    "xabar success";
            }

            birinchi = null;
            ikkinchi = null;
            qulflangan = false;

            if(
                topilganSoni ===
                tanlanganLevel.pairs
            ){
                yutdi();
            }

        },350);

    }else{

        combo = 0;
        comboElement.textContent = "0";

        setTimeout(() => {

            birinchi.classList.remove("ochiq");
            ikkinchi.classList.remove("ochiq");

            xabar.textContent =
                "Bu kartalar bir xil emas.";

            xabar.className =
                "xabar";

            birinchi = null;
            ikkinchi = null;
            qulflangan = false;

        },800);
    }
}


/* =========================
   TIMER
========================= */

function timerniBoshlash(){

    clearInterval(timer);

    timer = setInterval(() => {

        vaqtSon++;

        vaqt.textContent =
            formatVaqt(vaqtSon);

        const limit =
            tanlanganLevel.time;

        const qolgan =
            limit - vaqtSon;

        timeLimit.textContent =
            formatVaqt(Math.max(0,qolgan));

        if(qolgan <= 15){
            timeLimitBox.classList.add("danger");
            timeLimitBox.classList.remove("warning");
        }else if(qolgan <= 30){
            timeLimitBox.classList.add("warning");
        }

        if(qolgan <= 0){
            vaqtTugadi();
        }

    },1000);
}

function timerniToxtatish(){
    clearInterval(timer);
    timer = null;
}

function formatVaqt(seconds){

    const daqiqa =
        Math.floor(seconds / 60);

    const soniya =
        seconds % 60;

    return (
        String(daqiqa).padStart(2,"0") +
        ":" +
        String(soniya).padStart(2,"0")
    );
}


/* =========================
   VAQT TUGADI
========================= */

function vaqtTugadi(){

    timerniToxtatish();

    oyinBoshlangan = false;
    qulflangan = true;

    xabar.textContent =
        "⏰ Vaqt tugadi! Qayta urinib ko‘ring.";

    xabar.className =
        "xabar danger";

    setTimeout(() => {

        if(confirm("Vaqt tugadi. O‘yinni qaytadan boshlaysizmi?")){
            boshlangichOyin();
        }

    },300);
}


/* =========================
   YUTISH
========================= */

function yutdi(){

    timerniToxtatish();

    oyinBoshlangan = false;

    const vaqtNatija = vaqtSon;

    const limit =
        tanlanganLevel.time;

    let stars = 1;

    if(yurish <= tanlanganLevel.pairs + 2){
        stars = 3;
    }else if(yurish <= tanlanganLevel.pairs + 6){
        stars = 2;
    }

    if(
        tanlanganLevel.id >= 3 &&
        vaqtNatija <= Math.floor(limit * .55)
    ){
        stars = Math.min(3,stars + 1);
    }

    oxirgiYulduz = stars;

    const oldStars =
        Number(
            rekordlar[tanlanganLevel.id + "-stars"] || 0
        );

    if(stars > oldStars){

        rekordlar[
            tanlanganLevel.id + "-stars"
        ] = stars;
    }

    let yangiRekord = false;

    const eskiRekord =
        rekordlar[tanlanganLevel.id];

    if(
        !eskiRekord ||
        yurish < Number(eskiRekord)
    ){

        rekordlar[tanlanganLevel.id] =
            yurish;

        yangiRekord = true;
    }

    rekordniSaqlash();

    if(
        tanlanganLevel.id < LEVELS.length &&
        ochilganLevel < tanlanganLevel.id + 1
    ){
        ochilganLevel =
            tanlanganLevel.id + 1;

        progressSaqlash();
    }

    yulduz.textContent =
        "⭐".repeat(stars);

    winTitle.textContent =
        `${tanlanganLevel.name} bajarildi!`;

    winText.textContent =
        stars === 3
            ? "Ajoyib natija! Siz juda yaxshi o‘ynadingiz."
            : "Bosqich muvaffaqiyatli bajarildi!";

    winMoves.textContent =
        yurish;

    winTime.textContent =
        formatVaqt(vaqtNatija);

    starsResult.textContent =
        "⭐".repeat(stars) +
        "☆".repeat(3 - stars);

    if(yangiRekord){
        newRecord.classList.remove("hidden");
    }else{
        newRecord.classList.add("hidden");
    }

    if(tanlanganLevel.id < LEVELS.length){

        nextLevelBtn.classList.remove("hidden");

        nextLevelBtn.textContent =
            `Keyingi bosqich →`;
    }else{

        nextLevelBtn.classList.add("hidden");

        winText.textContent =
            "🏆 Barcha bosqichlarni tugatdingiz!";
    }

    winModal.classList.remove("hidden");
}


/* =========================
   MODAL
========================= */

function modalniYopish(){
    winModal.classList.add("hidden");
}

modalRestart.addEventListener("click",() => {

    modalniYopish();
    boshlangichOyin();

});

nextLevelBtn.addEventListener("click",() => {

    const nextId =
        tanlanganLevel.id + 1;

    if(nextId <= LEVELS.length){

        modalniYopish();
        levelniBoshlash(nextId);
    }
});

modalLevels.addEventListener("click",() => {

    modalniYopish();

    gameContent.classList.add("hidden");
    levelScreen.classList.remove("hidden");

    levelsniChiz();
});

winModal.addEventListener("click",(e) => {

    if(e.target === winModal){
        modalniYopish();
    }
});

document.addEventListener("keydown",(e) => {

    if(
        e.key === "Escape" &&
        !winModal.classList.contains("hidden")
    ){
        modalniYopish();
    }
});


/* =========================
   RESTART
========================= */

qayta.addEventListener("click",() => {

    boshlangichOyin();

});


/* =========================
   LEVELGA QAYTISH
========================= */

backLevels.addEventListener("click",() => {

    timerniToxtatish();

    oyinBoshlangan = false;

    gameContent.classList.add("hidden");
    levelScreen.classList.remove("hidden");

    levelsniChiz();

});


/* =========================
   BOSHLASH
========================= */

rekordlarniOqish();
progressOqish();
boshlangichRejim();
levelsniChiz();
