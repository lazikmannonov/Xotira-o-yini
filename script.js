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

let audioCtx = null;
let audioEnabled = true;


/* =====================================================
   VAQT
===================================================== */

function formatVaqt(seconds) {
    seconds = Math.max(0, Number(seconds) || 0);

    const minut = Math.floor(seconds / 60);
    const sekund = seconds % 60;

    return String(minut).padStart(2, "0") + ":" +
           String(sekund).padStart(2, "0");
}


/* =====================================================
   XAVFSIZ AUDIO
===================================================== */

function initAudio() {
    if (!audioEnabled) return null;

    try {
        if (!audioCtx) {
            const AudioContextClass =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContextClass) {
                audioEnabled = false;
                return null;
            }

            audioCtx = new AudioContextClass();
        }

        if (audioCtx.state === "suspended") {
            audioCtx.resume().catch(() => {});
        }

        return audioCtx;

    } catch (error) {
        audioEnabled = false;
        return null;
    }
}


function sound(type) {
    const ctx = initAudio();

    if (!ctx) return;

    const patterns = {
        click: [[520, 0.045, "sine", 0.035]],

        flip: [[390, 0.055, "triangle", 0.025]],

        match: [
            [520, 0.06, "sine", 0.035],
            [660, 0.07, "sine", 0.04],
            [820, 0.09, "sine", 0.045]
        ],

        wrong: [
            [210, 0.08, "sawtooth", 0.018],
            [150, 0.10, "sawtooth", 0.015]
        ],

        win: [
            [523, 0.07, "sine", 0.04],
            [659, 0.07, "sine", 0.045],
            [784, 0.08, "sine", 0.05],
            [1047, 0.13, "sine", 0.055]
        ],

        time: [
            [180, 0.12, "square", 0.018],
            [130, 0.15, "square", 0.015]
        ],

        button: [
            [330, 0.04, "sine", 0.025]
        ]
    };

    const pattern = patterns[type] || patterns.click;
    const now = ctx.currentTime;

    pattern.forEach(([freq, dur, wave, vol], index) => {
        try {
            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();

            const start = now + index * 0.045;

            oscillator.type = wave;
            oscillator.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(
                vol,
                start + 0.008
            );
            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                start + dur
            );

            oscillator.connect(gain);
            gain.connect(ctx.destination);

            oscillator.start(start);
            oscillator.stop(start + dur + 0.02);

        } catch (error) {
            // Ovoz ishlamasa ham o‘yin davom etadi
        }
    });
}


/* =====================================================
   LOCAL STORAGE
===================================================== */

function rekordlarniOqish() {
    try {
        const data = localStorage.getItem(REKORD_KEY);
        rekordlar = data ? JSON.parse(data) : {};

        if (
            !rekordlar ||
            typeof rekordlar !== "object" ||
            Array.isArray(rekordlar)
        ) {
            rekordlar = {};
        }

    } catch {
        rekordlar = {};
    }
}


function rekordniSaqlash() {
    try {
        localStorage.setItem(
            REKORD_KEY,
            JSON.stringify(rekordlar)
        );
    } catch {}
}


function progressOqish() {
    try {
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

    } catch {
        ochilganLevel = 1;
    }
}


function progressSaqlash() {
    try {
        localStorage.setItem(
            PROGRESS_KEY,
            String(ochilganLevel)
        );
    } catch {}
}


/* =====================================================
   DARK MODE
===================================================== */

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
    sound("button");

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

    rejim.classList.remove("theme-pop");
    void rejim.offsetWidth;
    rejim.classList.add("theme-pop");
}


/* =====================================================
   YULDUZLAR
===================================================== */

function levelYulduzlari(levelId) {
    const value = Number(
        rekordlar[levelId + "-stars"] || 0
    );

    if (value >= 3) return "⭐⭐⭐";
    if (value === 2) return "⭐⭐☆";
    if (value === 1) return "⭐☆☆";

    return "☆☆☆";
}


/* =====================================================
   BOSQICHLAR
===================================================== */

function levelsniChiz() {
    levelsBox.innerHTML = "";

    LEVELS.forEach(level => {
        const ochiq = level.id <= ochilganLevel;
        const best = rekordlar[level.id] || null;

        const card = document.createElement("button");

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
                <strong>${level.id}. ${level.name}</strong>
                <small>${level.description}</small>
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
            card.addEventListener("click", () => {
                sound("button");
                levelniBoshlash(level.id);
            });
        } else {
            card.disabled = true;
        }

        levelsBox.appendChild(card);
    });

    const tugagan = LEVELS.filter(
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


/* =====================================================
   LEVELNI BOSHLASH
===================================================== */

function levelniBoshlash(levelId) {
    const level = LEVELS.find(
        item => item.id === levelId
    );

    if (!level || levelId > ochilganLevel) {
        return;
    }

    tanlanganLevel = level;

    timerniToxtatish();

    levelScreen.classList.add("hidden");
    gameContent.classList.remove("hidden");

    levelIcon.textContent = level.icon;
    levelName.textContent = level.name;
    levelNumber.textContent =
        `${level.id}-bosqich`;

    boshlangichOyin();
}


/* =====================================================
   ARALASHTIRISH
===================================================== */

function aralashtir(massiv) {
    for (let i = massiv.length - 1; i > 0; i--) {
        const j = Math.floor(
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


/* =====================================================
   YANGI O‘YIN
===================================================== */

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
    jami.textContent = tanlanganLevel.pairs;
    vaqt.textContent = "00:00";

    comboElement.textContent = "0";
    comboBox.classList.remove("active");

    xabar.textContent =
        "Bir xil kartalarni toping!";

    xabar.className = "xabar";

    rekord.textContent =
        rekordlar[tanlanganLevel.id] || "—";

    yulduz.textContent = "0";

    timeLimit.textContent =
        formatVaqt(tanlanganLevel.time);

    timeLimitBox.classList.remove(
        "warning",
        "danger"
    );

    taxta.innerHTML = "";

    let nusxa = RASMLAR.slice(
        0,
        tanlanganLevel.pairs
    );

    nusxa = [...nusxa, ...nusxa];

    aralashtir(nusxa);

    nusxa.forEach((emoji, index) => {
        const karta = document.createElement("button");

        karta.type = "button";
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

    taxta.style.gridTemplateColumns =
        "repeat(4, 1fr)";
}


/* =====================================================
   KARTA BOSILDI
===================================================== */

function kartaBosildi(karta) {
    if (!oyinBoshlangan) return;
    if (qulflangan) return;

    if (
        karta.classList.contains("ochiq") ||
        karta.classList.contains("topilgan")
    ) {
        return;
    }

    /*
       Birinchi bosishda ovoz va timer ishga tushadi.
       Audio xato qilsa ham karta ishlashda davom etadi.
    */
    sound("flip");

    if (!timer) {
        timerniBoshlash();
    }

    karta.classList.add("ochiq");

    if (!birinchi) {
        birinchi = karta;
        return;
    }

    if (karta === birinchi) {
        return;
    }

    ikkinchi = karta;

    yurish++;

    yurishlar.textContent = yurish;

    const statBox =
        yurishlar.parentElement;

    statBox.classList.remove("stat-pop");

    void statBox.offsetWidth;

    statBox.classList.add("stat-pop");

    tekshirish();
}


/* =====================================================
   JUFTLIKNI TEKSHIRISH
===================================================== */

function tekshirish() {
    if (!birinchi || !ikkinchi) {
        return;
    }

    qulflangan = true;

    const a = birinchi;
    const b = ikkinchi;

    const mos =
        a.dataset.value === b.dataset.value;

    if (mos) {
        setTimeout(() => {
            sound("match");

            a.classList.add("topilgan");
            b.classList.add("topilgan");

            topilganSoni++;

            topilgan.textContent =
                topilganSoni;

            combo++;

            comboElement.textContent =
                combo;

            comboBox.classList.remove("active");

            void comboBox.offsetWidth;

            comboBox.classList.add("active");

            a.classList.add("match-burst");
            b.classList.add("match-burst");

            setTimeout(() => {
                a.classList.remove("match-burst");
                b.classList.remove("match-burst");
            }, 600);

            if (combo >= 2) {
                vaqtSon = Math.max(
                    0,
                    vaqtSon - 3
                );

                tempoYangilash();

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
        comboElement.textContent = "0";

        a.classList.add("wrong");
        b.classList.add("wrong");

        sound("wrong");

        setTimeout(() => {
            a.classList.remove(
                "ochiq",
                "wrong"
            );

            b.classList.remove(
                "ochiq",
                "wrong"
            );

            xabar.textContent =
                "Bu kartalar bir xil emas.";

            xabar.className = "xabar";

            birinchi = null;
            ikkinchi = null;

            qulflangan = false;

        }, 750);
    }
}


/* =====================================================
   VAQT
===================================================== */

function tempoYangilash() {
    vaqt.textContent =
        formatVaqt(vaqtSon);

    const qolgan =
        tanlanganLevel.time - vaqtSon;

    timeLimit.textContent =
        formatVaqt(
            Math.max(0, qolgan)
        );
}


/* =====================================================
   TIMER
===================================================== */

function timerniBoshlash() {
    timerniToxtatish();

    timer = setInterval(() => {
        if (!oyinBoshlangan) {
            timerniToxtatish();
            return;
        }

        vaqtSon++;

        tempoYangilash();

        const qolgan =
            tanlanganLevel.time - vaqtSon;

        if (qolgan <= 15) {
            timeLimitBox.classList.add("danger");
            timeLimitBox.classList.remove("warning");

        } else if (qolgan <= 30) {
            timeLimitBox.classList.add("warning");
            timeLimitBox.classList.remove("danger");

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


/* =====================================================
   VAQT TUGADI
===================================================== */

function vaqtTugadi() {
    if (!oyinBoshlangan) {
        return;
    }

    timerniToxtatish();

    oyinBoshlangan = false;
    qulflangan = true;

    sound("time");

    xabar.textContent =
        "⏰ Vaqt tugadi! Qayta urinib ko‘ring.";

    xabar.className =
        "xabar danger";

    taxta.classList.add("board-shake");

    setTimeout(() => {
        taxta.classList.remove("board-shake");

        if (
            winModal.classList.contains("hidden")
        ) {
            boshlangichOyin();
        }

    }, 1000);
}


/* =====================================================
   YUTISH
===================================================== */

function yutdi() {
    if (!tanlanganLevel) return;

    timerniToxtatish();

    oyinBoshlangan = false;
    qulflangan = true;

    sound("win");

    document.body.classList.add(
        "victory-flash"
    );

    setTimeout(() => {
        document.body.classList.remove(
            "victory-flash"
        );
    }, 800);

    const vaqtNatija = vaqtSon;
    const limit = tanlanganLevel.time;

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
        Math.floor(limit * 0.55)
    ) {
        stars = Math.min(
            3,
            stars + 1
        );
    }

    const starsKey =
        tanlanganLevel.id + "-stars";

    const oldStars =
        Number(
            rekordlar[starsKey] || 0
        );

    if (stars > oldStars) {
        rekordlar[starsKey] = stars;
    }

    const eskiRekord =
        rekordlar[tanlanganLevel.id];

    let yangiRekord = false;

    if (
        !eskiRekord ||
        yurish < Number(eskiRekord)
    ) {
        rekordlar[tanlanganLevel.id] =
            yurish;

        yangiRekord = true;
    }

    rekordniSaqlash();

    if (
        tanlanganLevel.id < LEVELS.length &&
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

    winMoves.textContent = yurish;

    winTime.textContent =
        formatVaqt(vaqtNatija);

    starsResult.textContent =
        "⭐".repeat(stars) +
        "☆".repeat(3 - stars);

    newRecord.classList.toggle(
        "hidden",
        !yangiRekord
    );

    if (
        tanlanganLevel.id < LEVELS.length
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

    winModal.classList.remove("hidden");
}


/* =====================================================
   MODAL
===================================================== */

function modalniYopish() {
    winModal.classList.add("hidden");
}


/* =====================================================
   EVENTLAR
===================================================== */

rejim.addEventListener(
    "click",
    rejimniAlmashtir
);


modalRestart.addEventListener(
    "click",
    () => {
        sound("button");
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

        if (nextId <= LEVELS.length) {
            sound("button");
            modalniYopish();
            levelniBoshlash(nextId);
        }
    }
);


modalLevels.addEventListener(
    "click",
    () => {
        sound("button");

        modalniYopish();
        timerniToxtatish();

        oyinBoshlangan = false;
        qulflangan = false;

        birinchi = null;
        ikkinchi = null;

        gameContent.classList.add("hidden");
        levelScreen.classList.remove("hidden");

        levelsniChiz();
    }
);


winModal.addEventListener(
    "click",
    event => {
        if (event.target === winModal) {
            modalniYopish();
        }
    }
);


document.addEventListener(
    "keydown",
    event => {
        if (
            event.key === "Escape" &&
            !winModal.classList.contains("hidden")
        ) {
            modalniYopish();
        }
    }
);


qayta.addEventListener(
    "click",
    () => {
        sound("button");
        boshlangichOyin();
    }
);


backLevels.addEventListener(
    "click",
    () => {
        sound("button");

        timerniToxtatish();

        oyinBoshlangan = false;
        qulflangan = false;

        birinchi = null;
        ikkinchi = null;

        gameContent.classList.add("hidden");
        levelScreen.classList.remove("hidden");

        levelsniChiz();
    }
);


/* =====================================================
   ISHGA TUSHIRISH
===================================================== */

rekordlarniOqish();
progressOqish();
boshlangichRejim();
levelsniChiz();
