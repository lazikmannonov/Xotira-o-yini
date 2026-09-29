const RASMLAR = [
    "🍎", "🚀", "🐱", "⚽",
    "🎸", "🌵", "🍕", "🌙",
    "🦊", "🎮", "🍔", "🐼",
    "⭐", "🚗", "🎧", "🌈"
];

const LEVELS = [
    { id: 1, name: "Easy", uz: "Oson", icon: "🟢", pairs: 4, time: 120, description: "4 juftlik • Boshlash uchun" },
    { id: 2, name: "Normal", uz: "Oddiy", icon: "🔵", pairs: 8, time: 120, description: "8 juftlik • Klassik rejim" },
    { id: 3, name: "Hard", uz: "Qiyin", icon: "🟠", pairs: 10, time: 100, description: "10 juftlik • Vaqt cheklangan" },
    { id: 4, name: "Expert", uz: "Ekspert", icon: "🔴", pairs: 12, time: 90, description: "12 juftlik • Juda qiyin" },
    { id: 5, name: "Master", uz: "Usta", icon: "🟣", pairs: 16, time: 120, description: "16 juftlik • Eng yuqori daraja" }
];

const REKORD_KEY = "xotira-rekordlar";
const PROGRESS_KEY = "xotira-progress";
const THEME_KEY = "xotira-rejim";

const $ = id => document.getElementById(id);

const levelScreen = $("levelScreen");
const levelsBox = $("levels");
const gameContent = $("gameContent");
const backLevels = $("backLevels");

const levelIcon = $("levelIcon");
const levelName = $("levelName");
const levelNumber = $("levelNumber");

const yurishlar = $("yurishlar");
const vaqt = $("vaqt");
const rekord = $("rekord");

const yulduz = $("yulduz");
const topilgan = $("topilgan");
const jami = $("jami");
const taxta = $("taxta");

const xabar = $("xabar");
const qayta = $("qayta");
const rejim = $("rejim");

const comboElement = $("combo");
const comboBox = $("comboBox");

const timeLimitBox = $("timeLimitBox");
const timeLimit = $("timeLimit");

const progressText = $("progressText");
const progressFill = $("progressFill");

const winModal = $("winModal");
const winTitle = $("winTitle");
const winText = $("winText");
const winMoves = $("winMoves");
const winTime = $("winTime");
const newRecord = $("newRecord");
const starsResult = $("starsResult");

const modalRestart = $("modalRestart");
const nextLevelBtn = $("nextLevelBtn");
const modalLevels = $("modalLevels");

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

let rekordlar = {};
let ochilganLevel = 1;


// =====================================================
// VAQT FORMAT
// =====================================================

function formatVaqt(seconds) {
    seconds = Math.max(0, Number(seconds) || 0);

    const daqiqa = Math.floor(seconds / 60);
    const soniya = seconds % 60;

    return (
        String(daqiqa).padStart(2, "0") +
        ":" +
        String(soniya).padStart(2, "0")
    );
}


// =====================================================
// REKORDLAR
// =====================================================

function rekordlarniOqish() {
    try {
        rekordlar =
            JSON.parse(localStorage.getItem(REKORD_KEY)) || {};

        if (typeof rekordlar !== "object") {
            rekordlar = {};
        }
    } catch {
        rekordlar = {};
    }
}

function rekordniSaqlash() {
    localStorage.setItem(
        REKORD_KEY,
        JSON.stringify(rekordlar)
    );
}


// =====================================================
// LEVEL PROGRESS
// =====================================================

function progressOqish() {
    const qiymat = Number(
        localStorage.getItem(PROGRESS_KEY)
    );

    if (
        Number.isFinite(qiymat) &&
        qiymat >= 1
    ) {
        ochilganLevel = Math.min(
            Math.floor(qiymat),
            LEVELS.length
        );
    } else {
        ochilganLevel = 1;
    }
}

function progressSaqlash() {
    localStorage.setItem(
        PROGRESS_KEY,
        String(ochilganLevel)
    );
}


// =====================================================
// DARK MODE
// =====================================================

function boshlangichRejim() {
    const dark =
        localStorage.getItem(THEME_KEY) === "dark";

    if (dark) {
        document.documentElement.setAttribute(
            "data-theme",
            "dark"
        );

        rejim.textContent = "☀️";
    } else {
        document.documentElement.removeAttribute(
            "data-theme"
        );

        rejim.textContent = "🌙";
    }
}

function rejimniAlmashtir() {
    const dark =
        document.documentElement.getAttribute(
            "data-theme"
        ) === "dark";

    if (dark) {
        document.documentElement.removeAttribute(
            "data-theme"
        );

        localStorage.setItem(
            THEME_KEY,
            "light"
        );

        rejim.textContent = "🌙";
    } else {
        document.documentElement.setAttribute(
            "data-theme",
            "dark"
        );

        localStorage.setItem(
            THEME_KEY,
            "dark"
        );

        rejim.textContent = "☀️";
    }
}


// =====================================================
// YULDUZLAR
// =====================================================

function levelYulduzlari(levelId) {
    const qiymat = Number(
        rekordlar[levelId + "-stars"] || 0
    );

    if (qiymat >= 3) return "⭐⭐⭐";
    if (qiymat === 2) return "⭐⭐☆";
    if (qiymat === 1) return "⭐☆☆";

    return "☆☆☆";
}


// =====================================================
// LEVEL LARNI CHIZISH
// =====================================================

function levelsniChiz() {
    levelsBox.innerHTML = "";

    LEVELS.forEach(level => {
        const ochiq =
            level.id <= ochilganLevel;

        const best =
            rekordlar[level.id] || null;

        const card =
            document.createElement("button");

        card.type = "button";

        card.className =
            "level-card" +
            (ochiq ? "" : " locked") +
            (best ? " completed" : "");

        card.innerHTML = `
            <div class="level-number">
                ${level.icon}
            </div>

            <div class="level-info">
                <strong>
                    ${level.id}. ${level.name}
                </strong>

                <small>
                    ${level.description}
                </small>
            </div>

            <div class="level-right">
                <div class="stars">
                    ${levelYulduzlari(level.id)}
                </div>

                <small>
                    ${
                        best
                            ? "Rekord: " + best
                            : ochiq
                                ? "Boshlash"
                                : "Qulflangan"
                    }
                </small>
            </div>

            <div class="lock">
                ${ochiq ? "→" : "🔒"}
            </div>
        `;

        if (ochiq) {
            card.addEventListener(
                "click",
                () => levelniBoshlash(level.id)
            );
        } else {
            card.disabled = true;
        }

        levelsBox.appendChild(card);
    });

    const tugagan =
        LEVELS.filter(
            level => rekordlar[level.id]
        ).length;

    progressText.textContent =
        `${tugagan} / ${LEVELS.length}`;

    progressFill.style.width =
        `${Math.max(
            20,
            (tugagan / LEVELS.length) * 100
        )}%`;
}


// =====================================================
// LEVELNI BOSHLASH
// =====================================================

function levelniBoshlash(levelId) {
    const level =
        LEVELS.find(
            item => item.id === levelId
        );

    if (!level) return;

    if (levelId > ochilganLevel) return;

    tanlanganLevel = level;

    timerniToxtatish();

    levelScreen.classList.add("hidden");
    gameContent.classList.remove("hidden");

    levelIcon.textContent =
        level.icon;

    levelName.textContent =
        level.name;

    levelNumber.textContent =
        `${level.id}-bosqich`;

    boshlangichOyin();
}


// =====================================================
// ARALASHTIRISH
// =====================================================

function aralashtir(massiv) {
    for (
        let i = massiv.length - 1;
        i > 0;
        i--
    ) {
        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            massiv[i],
            massiv[j]
        ] = [
            massiv[j],
            massiv[i]
        ];
    }
}


// =====================================================
// YANGI O'YIN
// =====================================================

function boshlangichOyin() {
    if (!tanlanganLevel) return;

    timerniToxtatish();

    kartalar = [];

    birinchi = null;
    ikkinchi = null;

    qulflangan = false;

    yurish = 0;
    topilganSoni = 0;

    combo = 0;

    vaqtSon = 0;

    oyinBoshlangan = true;

    yurishlar.textContent = "0";
    topilgan.textContent = "0";

    jami.textContent =
        tanlanganLevel.pairs;

    vaqt.textContent = "00:00";

    comboElement.textContent = "0";

    comboBox.classList.remove(
        "active"
    );

    xabar.textContent =
        "Bir xil kartalarni toping!";

    xabar.className = "xabar";

    rekord.textContent =
        rekordlar[
            tanlanganLevel.id
        ] || "—";

    yulduz.textContent = "0";

    timeLimit.textContent =
        formatVaqt(
            tanlanganLevel.time
        );

    timeLimitBox.classList.remove(
        "warning",
        "danger"
    );

    taxta.innerHTML = "";

    let nusxa =
        RASMLAR.slice(
            0,
            tanlanganLevel.pairs
        );

    nusxa = [
        ...nusxa,
        ...nusxa
    ];

    aralashtir(nusxa);

    nusxa.forEach(
        (emoji, index) => {
            const karta =
                document.createElement(
                    "button"
                );

            karta.type = "button";

            karta.className =
                "karta";

            karta.dataset.index =
                index;

            karta.dataset.value =
                emoji;

            karta.innerHTML = `
                <div class="karta-inner">

                    <div class="karta-front">
                    </div>

                    <div class="karta-back">
                        ${emoji}
                    </div>

                </div>
            `;

            karta.addEventListener(
                "click",
                () => kartaBosildi(karta)
            );

            taxta.appendChild(karta);

            kartalar.push(karta);
        }
    );

    taxta.style.gridTemplateColumns =
        "repeat(4, 1fr)";
}


// =====================================================
// KARTA BOSILISHI
// =====================================================

function kartaBosildi(karta) {
    if (!oyinBoshlangan) return;

    if (qulflangan) return;

    if (
        karta.classList.contains(
            "ochiq"
        )
    ) return;

    if (
        karta.classList.contains(
            "topilgan"
        )
    ) return;

    if (!timer) {
        timerniBoshlash();
    }

    karta.classList.add(
        "ochiq"
    );

    if (!birinchi) {
        birinchi = karta;
        return;
    }

    if (karta === birinchi) return;

    ikkinchi = karta;

    yurish++;

    yurishlar.textContent =
        yurish;

    tekshirish();
}


// =====================================================
// JUFTLIKNI TEKSHIRISH
// =====================================================

function tekshirish() {
    if (!birinchi || !ikkinchi) {
        return;
    }

    qulflangan = true;

    const birinchiKarta =
        birinchi;

    const ikkinchiKarta =
        ikkinchi;

    const mos =
        birinchiKarta.dataset.value ===
        ikkinchiKarta.dataset.value;

    if (mos) {
        setTimeout(() => {

            birinchiKarta.classList.add(
                "topilgan"
            );

            ikkinchiKarta.classList.add(
                "topilgan"
            );

            topilganSoni++;

            topilgan.textContent =
                topilganSoni;

            combo++;

            comboElement.textContent =
                combo;

            comboBox.classList.remove(
                "active"
            );

            void comboBox.offsetWidth;

            comboBox.classList.add(
                "active"
            );

            if (combo >= 2) {

                vaqtSon =
                    Math.max(
                        0,
                        vaqtSon - 3
                    );

                vaqt.textContent =
                    formatVaqt(
                        vaqtSon
                    );

                const qolgan =
                    tanlanganLevel.time -
                    vaqtSon;

                timeLimit.textContent =
                    formatVaqt(
                        Math.max(
                            0,
                            qolgan
                        )
                    );

                xabar.textContent =
                    `🔥 ${combo} Combo! 3 soniya bonus!`;

                xabar.className =
                    "xabar success";

            } else {

                xabar.textContent =
                    "✓ Juftlik topildi!";

                xabar.className =
                    "xabar success";
            }

            birinchi = null;
            ikkinchi = null;

            qulflangan = false;

            if (
                topilganSoni ===
                tanlanganLevel.pairs
            ) {
                yutdi();
            }

        }, 350);

    } else {

        combo = 0;

        comboElement.textContent =
            "0";

        setTimeout(() => {

            birinchiKarta.classList.remove(
                "ochiq"
            );

            ikkinchiKarta.classList.remove(
                "ochiq"
            );

            xabar.textContent =
                "Bu kartalar bir xil emas.";

            xabar.className =
                "xabar";

            birinchi = null;
            ikkinchi = null;

            qulflangan = false;

        }, 800);
    }
}


// =====================================================
// TIMER
// =====================================================

function timerniBoshlash() {
    timerniToxtatish();

    timer = setInterval(() => {

        if (!oyinBoshlangan) {
            timerniToxtatish();
            return;
        }

        vaqtSon++;

        vaqt.textContent =
            formatVaqt(
                vaqtSon
            );

        const qolgan =
            tanlanganLevel.time -
            vaqtSon;

        timeLimit.textContent =
            formatVaqt(
                Math.max(
                    0,
                    qolgan
                )
            );

        if (qolgan <= 15) {

            timeLimitBox.classList.add(
                "danger"
            );

            timeLimitBox.classList.remove(
                "warning"
            );

        } else if (qolgan <= 30) {

            timeLimitBox.classList.add(
                "warning"
            );

            timeLimitBox.classList.remove(
                "danger"
            );

        } else {

            timeLimitBox.classList.remove(
                "warning",
                "danger"
            );
        }

        if (qolgan <= 0) {
            vaqtTugadi();
        }

    }, 1000);
}

function timerniToxtatish() {

    if (timer !== null) {

        clearInterval(timer);

        timer = null;
    }
}


// =====================================================
// VAQT TUGASHI
// =====================================================

function vaqtTugadi() {

    if (!oyinBoshlangan) return;

    timerniToxtatish();

    oyinBoshlangan = false;

    qulflangan = true;

    xabar.textContent =
        "⏰ Vaqt tugadi! Qayta urinib ko‘ring.";

    xabar.className =
        "xabar danger";

    setTimeout(() => {

        if (
            winModal.classList.contains(
                "hidden"
            )
        ) {
            boshlangichOyin();
        }

    }, 1000);
}


// =====================================================
// YUTISH
// =====================================================

function yutdi() {

    if (!tanlanganLevel) return;

    timerniToxtatish();

    oyinBoshlangan = false;

    qulflangan = true;

    const vaqtNatija =
        vaqtSon;

    const limit =
        tanlanganLevel.time;

    let stars = 1;

    if (
        yurish <=
        tanlanganLevel.pairs + 2
    ) {

        stars = 3;

    } else if (
        yurish <=
        tanlanganLevel.pairs + 6
    ) {

        stars = 2;
    }

    if (
        tanlanganLevel.id >= 3 &&
        vaqtNatija <=
            Math.floor(
                limit * 0.55
            )
    ) {

        stars =
            Math.min(
                3,
                stars + 1
            );
    }

    const starsKey =
        tanlanganLevel.id +
        "-stars";

    const oldStars =
        Number(
            rekordlar[starsKey] || 0
        );

    if (stars > oldStars) {
        rekordlar[starsKey] =
            stars;
    }

    const eskiRekord =
        rekordlar[
            tanlanganLevel.id
        ];

    let yangiRekord = false;

    if (
        !eskiRekord ||
        yurish <
            Number(eskiRekord)
    ) {

        rekordlar[
            tanlanganLevel.id
        ] = yurish;

        yangiRekord = true;
    }

    rekordniSaqlash();

    if (
        tanlanganLevel.id <
            LEVELS.length &&
        ochilganLevel <
            tanlanganLevel.id + 1
    ) {

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
        formatVaqt(
            vaqtNatija
        );

    starsResult.textContent =
        "⭐".repeat(stars) +
        "☆".repeat(
            3 - stars
        );

    if (yangiRekord) {

        newRecord.classList.remove(
            "hidden"
        );

    } else {

        newRecord.classList.add(
            "hidden"
        );
    }

    if (
        tanlanganLevel.id <
        LEVELS.length
    ) {

        nextLevelBtn.classList.remove(
            "hidden"
        );

        nextLevelBtn.textContent =
            "Keyingi bosqich →";

    } else {

        nextLevelBtn.classList.add(
            "hidden"
        );

        winText.textContent =
            "🏆 Barcha bosqichlarni tugatdingiz!";
    }

    winModal.classList.remove(
        "hidden"
    );
}


// =====================================================
// MODAL
// =====================================================

function modalniYopish() {

    winModal.classList.add(
        "hidden"
    );
}


// =====================================================
// EVENTLAR
// =====================================================

rejim.addEventListener(
    "click",
    rejimniAlmashtir
);

modalRestart.addEventListener(
    "click",
    () => {

        modalniYopish();

        boshlangichOyin();
    }
);

nextLevelBtn.addEventListener(
    "click",
    () => {

        if (!tanlanganLevel) return;

        const nextId =
            tanlanganLevel.id + 1;

        if (
            nextId <=
            LEVELS.length
        ) {

            modalniYopish();

            levelniBoshlash(
                nextId
            );
        }
    }
);

modalLevels.addEventListener(
    "click",
    () => {

        modalniYopish();

        timerniToxtatish();

        oyinBoshlangan = false;

        gameContent.classList.add(
            "hidden"
        );

        levelScreen.classList.remove(
            "hidden"
        );

        levelsniChiz();
    }
);

winModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            winModal
        ) {

            modalniYopish();
        }
    }
);

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            !winModal.classList.contains(
                "hidden"
            )
        ) {

            modalniYopish();
        }
    }
);

qayta.addEventListener(
    "click",
    () => {

        boshlangichOyin();
    }
);

backLevels.addEventListener(
    "click",
    () => {

        timerniToxtatish();

        oyinBoshlangan = false;

        gameContent.classList.add(
            "hidden"
        );

        levelScreen.classList.remove(
            "hidden"
        );

        levelsniChiz();
    }
);


// =====================================================
// ISHGA TUSHIRISH
// =====================================================

rekordlarniOqish();

progressOqish();

boshlangichRejim();

levelsniChiz();
