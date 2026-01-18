// ================= CONSTANTS =================
const GOLD_API_KEY = "goldapi-13qujjslsmkk93b0k-io";
const GOLD_OUNCE_GRAMS = 31.1034768;
const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes
const MARKET_ADJUSTMENT = 1.02; // 2% local market factor

// ================= TRANSLATIONS =================
const translations = {
  en: {
    title: "Egypt Gold Tracker",
    k24: "24K Pure Gold",
    k21: "21K Standard",
    k18: "18K Jewelry",
    coin: "Gold Coin (8g)",
    ounce: "Global Ounce",
    rate: "USD/EGP Bank",
    live: "Live Market",
    unit: "EGP / g",
    currency: "EGP",
    footer: "Prices updated every 10 minutes based on global gold price.",
    toggle: "AR",
  },
  ar: {
    title: "أسعار الذهب في مصر",
    k24: "عيار ٢٤ (نقي)",
    k21: "عيار ٢١ (الأكثر تداولاً)",
    k18: "عيار ١٨ (مشغولات)",
    coin: "جنيه ذهب (٨ جرام)",
    ounce: "الأونصة عالمياً",
    rate: "سعر الدولار",
    live: "سعر مباشر",
    unit: "ج.م / جرام",
    currency: "ج.م",
    footer: "يتم تحديث الأسعار كل ١٠ دقائق حسب السعر العالمي.",
    toggle: "EN",
  },
};

// ================= STATE =================
let currentLang = "en";
let currentTheme = "light";

// ================= DOM =================
const el = {
  p24: document.getElementById("p24"),
  p21: document.getElementById("p21"),
  p18: document.getElementById("p18"),
  pCoin: document.getElementById("pCoin"),
  ounceUSD: document.getElementById("ounceUSD"),
  egpRate: document.getElementById("egpRate"),
  timestamp: document.getElementById("timestamp"),
  langToggle: document.getElementById("langToggle"),
  themeToggle: document.getElementById("themeToggle"),
  sunIcon: document.getElementById("sunIcon"),
  moonIcon: document.getElementById("moonIcon"),
  mainTitle: document.getElementById("mainTitle"),
  updateText: document.getElementById("updateText"),
  refreshBtn: document.getElementById("refreshBtn"),
  footerText: document.getElementById("footerText"),
};

// ================= API =================
async function fetchGoldOunceUSD() {
  const res = await fetch("https://www.goldapi.io/api/XAU/USD", {
    headers: {
      "x-access-token": GOLD_API_KEY,
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  return data.price;
}

async function fetchUSDtoEGP() {
  const res = await fetch("https://open.er-api.com/v6/latest/USD");
  const data = await res.json();
  return data?.rates?.EGP ?? 48.5;
}

// ================= CALCULATIONS =================
function calcGram(ounceUSD, usdToEgp, purity) {
  return (ounceUSD / GOLD_OUNCE_GRAMS) * usdToEgp * purity;
}

function applyMarket(price) {
  return price * MARKET_ADJUSTMENT;
}

// ================= MAIN =================
async function fetchGoldData() {
  try {
    setLoading(true);

    const [ounceUSD, egpRate] = await Promise.all([
      fetchGoldOunceUSD(),
      fetchUSDtoEGP(),
    ]);

    const gold24 = applyMarket(calcGram(ounceUSD, egpRate, 1));
    const gold21 = applyMarket(calcGram(ounceUSD, egpRate, 0.875));
    const gold18 = applyMarket(calcGram(ounceUSD, egpRate, 0.75));
    const coin = gold21 * 8;

    updateUI({
      k24: Math.round(gold24),
      k21: Math.round(gold21),
      k18: Math.round(gold18),
      coin: Math.round(coin),
      ounceUSD,
      egpRate,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  } catch (err) {
    console.error("Gold fetch error:", err);
  } finally {
    setLoading(false);
  }
}

// ================= UI =================
function updateUI(data) {
  el.p24.textContent = data.k24.toLocaleString();
  el.p21.textContent = data.k21.toLocaleString();
  el.p18.textContent = data.k18.toLocaleString();
  el.pCoin.textContent = data.coin.toLocaleString();
  el.ounceUSD.textContent = `$${data.ounceUSD.toLocaleString()}`;
  el.egpRate.textContent = data.egpRate.toFixed(2);
  el.timestamp.textContent = data.timestamp;
}

function setLoading(state) {
  el.refreshBtn.classList.toggle("animate-spin", state);
  el.refreshBtn.style.opacity = state ? "0.5" : "1";
}

// ================= THEME =================
function toggleTheme() {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.classList.toggle("dark", currentTheme === "dark");
  el.sunIcon.classList.toggle("hidden", currentTheme !== "dark");
  el.moonIcon.classList.toggle("hidden", currentTheme === "dark");
  localStorage.setItem("gold_theme", currentTheme);
}

// ================= LANGUAGE =================
function toggleLanguage() {
  currentLang = currentLang === "en" ? "ar" : "en";
  document.body.classList.toggle("rtl", currentLang === "ar");

  const t = translations[currentLang];
  el.mainTitle.textContent = t.title;
  el.updateText.textContent = t.live;
  el.langToggle.textContent = t.toggle;
  el.footerText.textContent = t.footer;

  document.querySelector(".label-24k").textContent = t.k24;
  document.querySelector(".label-21k").textContent = t.k21;
  document.querySelector(".label-18k").textContent = t.k18;
  document.querySelector(".label-coin").textContent = t.coin;
  document.querySelector(".label-ounce").textContent = t.ounce;
  document.querySelector(".label-rate").textContent = t.rate;

  document
    .querySelectorAll(".unit-text")
    .forEach((e) => (e.textContent = t.unit));
  document
    .querySelectorAll(".unit-currency")
    .forEach((e) => (e.textContent = t.currency));

  localStorage.setItem("gold_lang", currentLang);
}

// ================= INIT =================
if (localStorage.getItem("gold_theme") === "dark") toggleTheme();
if (localStorage.getItem("gold_lang") === "ar") toggleLanguage();

el.langToggle.addEventListener("click", toggleLanguage);
el.themeToggle.addEventListener("click", toggleTheme);
el.refreshBtn.addEventListener("click", fetchGoldData);

fetchGoldData();
setInterval(fetchGoldData, REFRESH_INTERVAL);
