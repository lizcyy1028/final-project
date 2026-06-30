// =========================================================
//  進場動畫：一堆隨機亂碼 → 解碼成 lizcyy.__ → 淡出進主畫面
// =========================================================

// 文字解碼效果（Text Scramble）：讓字元先隨機亂跳，再逐一鎖定成目標文字
class TextScramble {
    constructor(el) {
        this.el = el;
        // 亂碼會用到的字元池
        this.chars = "!<>-_\\/[]{}—=+*^?#abcdefghijklmnopqrstuvwxyz0123456789";
        this.update = this.update.bind(this);
    }

    // 從目前文字過渡到 newText，回傳一個動畫結束時 resolve 的 Promise
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => (this.resolve = resolve));
        this.queue = [];

        // 為每個字元安排「開始亂跳」與「鎖定完成」的時間點（用亂數錯開）
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || "";
            const to = newText[i] || "";
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end, char: "" });
        }

        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }

    // 每一影格更新一次畫面
    update() {
        let output = "";
        let complete = 0;

        for (let i = 0; i < this.queue.length; i++) {
            const item = this.queue[i];
            if (this.frame >= item.end) {
                // 已過鎖定時間 → 顯示最終字元
                complete++;
                output += item.to;
            } else if (this.frame >= item.start) {
                // 亂跳階段 → 隨機換字元（機率調高，閃爍更頻繁、更雜亂）
                if (!item.char || Math.random() < 0.5) {
                    item.char = this.chars[Math.floor(Math.random() * this.chars.length)];
                }
                output += `<span class="dud">${item.char}</span>`;
            } else {
                // 還沒輪到 → 維持原字元
                output += item.from;
            }
        }

        this.el.innerHTML = output;

        if (complete === this.queue.length) {
            this.resolve();   // 全部鎖定完成
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
}

// 產生指定長度的隨機亂碼字串
function randomGibberish(len) {
    const pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_/[]{}=+*?#";
    let s = "";
    for (let i = 0; i < len; i++) {
        s += pool[Math.floor(Math.random() * pool.length)];
    }
    return s;
}

const introEl = document.getElementById("intro");
const introTextEl = document.getElementById("intro-text");
const scramble = new TextScramble(introTextEl);
const finalText = "lizcyy";

// 小工具：等待指定毫秒（回傳 Promise，方便串接）
function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// 進場時先鎖住捲動，避免動畫期間能往下滑
document.body.style.overflow = "hidden";

// 流程：一堆亂碼（多跳幾次）→ 收斂成 lizcyy → 文字放大模糊淡出 → 黑幕上滑揭幕 + 主畫面浮現
scramble.setText(randomGibberish(32))                     // ① 一大串隨機亂碼
    .then(() => scramble.setText(randomGibberish(26)))    //   再換一批亂碼，更雜亂
    .then(() => scramble.setText(randomGibberish(18)))    //   逐漸變短，往中間收斂
    .then(() => scramble.setText(finalText))              // ② 解碼成 lizcyy
    .then(() => wait(900))                                // 讓 lizcyy 停留一下
    .then(() => {                                         // ③ 文字放大、模糊、淡出
        introTextEl.classList.add("out");
        return wait(450);
    })
    .then(() => {                                         // ④ 黑幕向上滑開，同時主畫面浮現
        introEl.classList.add("lift");
        document.body.style.overflow = "";
        const hero = document.querySelector(".hero-inner");
        if (hero) hero.classList.add("revealed");
        // 黑幕滑出後移除，避免擋住點擊
        setTimeout(() => { introEl.style.display = "none"; }, 900);
    });


// =========================================================
//  數字雨（Matrix Rain）背景動畫
//  綠色數字由上往下，像流水一樣不斷落下
// =========================================================

const fontSize = 13;   // 每個數字的字級（也決定每一欄的寬度，越小欄位越密集）

// 收集頁面上「所有」數字雨畫布（四個區塊各一張），每張各自維護自己的狀態
const matrixList = [];

// 依照某張畫布所在區塊的實際大小，設定尺寸並重新計算欄位
function setupOne(item) {
    // 畫布的容器就是它的父元素（hero / skills / projects / awards 區塊）
    item.canvas.width = item.container.clientWidth;
    item.canvas.height = item.container.clientHeight;

    // 畫布寬度 ÷ 字級 = 可以放幾欄數字
    item.columns = Math.floor(item.canvas.width / fontSize);

    // 為每一欄建立一個起始 y 位置（用隨機值讓每欄落下時間錯開）
    item.drops = [];
    for (let i = 0; i < item.columns; i++) {
        item.drops[i] = Math.floor((Math.random() * item.canvas.height) / fontSize);
    }
}

// 畫單一張畫布的一影格
function drawOne(item, isLight) {
    const ctx = item.ctx;

    // 拖尾用的「半透明覆蓋色」：必須跟背景同色，淺色用淺、深色用深
    ctx.fillStyle = isLight
        ? "rgba(245, 239, 224, 0.10)"   // 淺色主題(米黃)
        : "rgba(13, 17, 23, 0.08)";     // 深色主題
    ctx.fillRect(0, 0, item.canvas.width, item.canvas.height);

    // 數字顏色：淺底用較深的綠（高對比），深底用亮綠
    ctx.fillStyle = isLight ? "#009933" : "#00ff66";
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < item.drops.length; i++) {
        const text = Math.round(Math.random());     // 隨機 0 或 1
        const x = i * fontSize;
        const y = item.drops[i] * fontSize;
        ctx.fillText(text, x, y);

        // 落到底部後，隨機從頂端重新開始（連續不斷的雨）
        if (y > item.canvas.height && Math.random() > 0.975) {
            item.drops[i] = 0;
        }
        item.drops[i]++;
    }
}

// 每一影格：所有畫布一起畫（主題只判斷一次，效能較好）
function drawAll() {
    const isLight = document.body.classList.contains("light");
    matrixList.forEach((item) => drawOne(item, isLight));
}

// 初始化：把每一張 .matrix-bg 畫布都註冊進來
document.querySelectorAll(".matrix-bg").forEach((canvas) => {
    const item = {
        canvas: canvas,
        ctx: canvas.getContext("2d"),
        container: canvas.parentElement,   // 所在區塊
    };
    matrixList.push(item);
    setupOne(item);
});

setInterval(drawAll, 50);   // 每 50 毫秒重畫一次

// 視窗大小改變、或圖片載入造成區塊高度變化時，重新計算每張畫布尺寸
window.addEventListener("resize", () => matrixList.forEach(setupOne));
window.addEventListener("load", () => matrixList.forEach(setupOne));


// =========================================================
//  按鈕標籤：顯示「使用者目前所在的狀態」
//  主題鈕：純圖示（深色亮月亮、淺色亮太陽，由 CSS 切換）
//  語言鈕：地球圖示 + 目前語言代碼（中文→「中」、英文→「EN」）
// =========================================================
const themeBtn = document.getElementById("theme-toggle");
const langBtn = document.getElementById("lang-toggle");
const langLabel = document.getElementById("lang-label");

function updateLabels() {
    const lang = localStorage.getItem("lang") || "zh";          // 目前語言
    // 語言鈕顯示「目前」所在的語言代碼
    langLabel.textContent = (lang === "zh") ? "中" : "EN";
}


// =========================================================
//  左上：深／淺色主題切換
// =========================================================

// 套用主題：light → 加上 class；dark → 移除
function applyTheme(theme) {
    if (theme === "light") {
        document.body.classList.add("light");
    } else {
        document.body.classList.remove("light");
    }
    localStorage.setItem("theme", theme);   // 記住選擇，下次造訪自動套用
    updateLabels();                         // 同步更新按鈕上顯示的目前狀態
}

// 載入時讀取先前儲存的主題（預設深色）
applyTheme(localStorage.getItem("theme") || "dark");

// 點擊按鈕：在 light / dark 之間切換
themeBtn.addEventListener("click", function () {
    const isLight = document.body.classList.contains("light");
    applyTheme(isLight ? "dark" : "light");
});


// =========================================================
//  右上：中／英文語言切換
// =========================================================

// 套用語言：把所有帶 data-zh／data-en 的元素換成對應文字
function applyLang(lang) {
    // 找出全部需要翻譯的元素
    const items = document.querySelectorAll("[data-zh]");
    items.forEach(function (el) {
        // 用 innerHTML 才能保留 <br> 等標籤
        el.innerHTML = el.getAttribute("data-" + lang);
    });

    document.documentElement.lang = (lang === "zh") ? "zh-Hant" : "en";
    localStorage.setItem("lang", lang);     // 記住選擇
    updateLabels();                         // 同步更新按鈕上顯示的目前狀態
}

// 載入時讀取先前儲存的語言（預設中文）
applyLang(localStorage.getItem("lang") || "en");   // 預設語言：英文（新訪客第一次造訪即顯示英文）

// 點擊按鈕：在 zh / en 之間切換
langBtn.addEventListener("click", function () {
    const current = localStorage.getItem("lang") || "zh";
    applyLang(current === "zh" ? "en" : "zh");
});


// =========================================================
//  捲動進場淡入（Micro-interaction）
//  用 IntersectionObserver 偵測元素「捲進畫面」，再加上 .reveal-in 觸發淡入
// =========================================================
const revealTargets = document.querySelectorAll(
    ".section-title, .skill-card, .project, .award-item, .awards-subtitle"
);

// 只有支援 IntersectionObserver 才啟用（不支援就維持原樣顯示，不會壞掉）
if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal-in");  // 進場
                io.unobserve(entry.target);                // 只觸發一次
            }
        });
    }, {
        threshold: 0.12,                       // 露出約 12% 就觸發
        rootMargin: "0px 0px -40px 0px",       // 提早一點點觸發，手感更自然
    });

    revealTargets.forEach(function (el) {
        el.classList.add("reveal");   // 先設為隱藏狀態，再交給 observer 顯現
        io.observe(el);
    });
}


// =========================================================
//  導覽列高亮（Scrollspy）＋ 回到頂端按鈕
// =========================================================
const toTopBtn = document.getElementById("to-top");
const navAnchors = document.querySelectorAll(".nav-links a");
const allSections = document.querySelectorAll("section[id]");

function onScroll() {
    // ① 捲動超過 500px 後顯示「回到頂端」
    if (window.scrollY > 500) {
        toTopBtn.classList.add("show");
    } else {
        toTopBtn.classList.remove("show");
    }

    // ② 找出目前畫面所在的區塊，對應的導覽連結加上 .active 高亮
    let currentId = "";
    allSections.forEach(function (sec) {
        if (window.scrollY >= sec.offsetTop - 130) {
            currentId = sec.id;
        }
    });
    navAnchors.forEach(function (a) {
        a.classList.toggle("active", a.getAttribute("href") === "#" + currentId);
    });
}

window.addEventListener("scroll", onScroll);
onScroll();   // 初始先跑一次

// 點擊回到頂端：平滑捲回最上面
toTopBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
});
