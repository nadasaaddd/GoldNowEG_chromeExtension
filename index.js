const GOLD_OUNCE_GRAMS = 31.1034768;
const REFRESH_INTERVAL = 600000;

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
        footer: "Prices updated every 10 minutes based on official global parity.",
        toggle: "AR"
    },
    ar: {
        title: "أسعار الذهب في مصر",
        k24: "عيار ٢٤ (نقي)",
        k21: "عيار ٢١ (الأكثر طلباً)",
        k18: "عيار ١٨ (مشغولات)",
        coin: "جنيه ذهب (٨ جرام)",
        ounce: "الأونصة عالمياً",
        rate: "سعر الصرف البنكي",
        live: "سعر مباشر",
        unit: "ج.م / جرام",
        currency: "ج.م",
        footer: "يتم تحديث الأسعار كل ١٠ دقائق بناءً على السعر العالمي الرسمي.",
        toggle: "EN"
    }
};

let currentLang = 'en';
let currentTheme = 'light';

const elements = {
    p24: document.getElementById('p24'),
    p21: document.getElementById('p21'),
    p18: document.getElementById('p18'),
    pCoin: document.getElementById('pCoin'),
    ounceUSD: document.getElementById('ounceUSD'),
    egpRate: document.getElementById('egpRate'),
    timestamp: document.getElementById('timestamp'),
    langToggle: document.getElementById('langToggle'),
    themeToggle: document.getElementById('themeToggle'),
    sunIcon: document.getElementById('sunIcon'),
    moonIcon: document.getElementById('moonIcon'),
    mainTitle: document.getElementById('mainTitle'),
    updateText: document.getElementById('updateText'),
    refreshBtn: document.getElementById('refreshBtn'),
    footerText: document.getElementById('footerText')
};

async function fetchGoldData() {
    try {
        setLoading(true);
        const [goldRes, rateRes] = await Promise.all([
            fetch('https://api.gold-api.com/price/XAU'),
            fetch('https://open.er-api.com/v6/latest/USD')
        ]);

        const goldData = await goldRes.json();
        const rateData = await rateRes.json();

        const ounceUSD = goldData.price || 2050.00;
        const egpRate = rateData.rates.EGP || 48.50;

        const marketPremium = 1.025; 
        const pricePerGram24k = (ounceUSD / GOLD_OUNCE_GRAMS) * egpRate * marketPremium;
        
        updateUI({
            k24: Math.round(pricePerGram24k),
            k21: Math.round(pricePerGram24k * (21 / 24)),
            k18: Math.round(pricePerGram24k * (18 / 24)),
            coin: Math.round(pricePerGram24k * (21 / 24) * 8),
            ounceUSD,
            egpRate,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    } catch (err) {
        console.error('Fetch error:', err);
    } finally {
        setLoading(false);
    }
}

function updateUI(data) {
    elements.p24.innerText = data.k24.toLocaleString();
    elements.p21.innerText = data.k21.toLocaleString();
    elements.p18.innerText = data.k18.toLocaleString();
    elements.pCoin.innerText = data.coin.toLocaleString();
    elements.ounceUSD.innerText = `$${data.ounceUSD.toLocaleString()}`;
    elements.egpRate.innerText = data.egpRate.toFixed(2);
    elements.timestamp.innerText = data.timestamp;
}

function setLoading(isLoading) {
    elements.refreshBtn.classList.toggle('animate-spin', isLoading);
    elements.refreshBtn.style.opacity = isLoading ? '0.5' : '1';
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', currentTheme === 'dark');
    elements.sunIcon.classList.toggle('hidden', currentTheme !== 'dark');
    elements.moonIcon.classList.toggle('hidden', currentTheme === 'dark');
    localStorage.setItem('gold_tracker_theme', currentTheme);
}

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    document.body.classList.toggle('rtl', currentLang === 'ar');
    
    const t = translations[currentLang];
    elements.mainTitle.innerText = t.title;
    elements.updateText.innerText = t.live;
    elements.langToggle.innerText = t.toggle;
    elements.footerText.innerText = t.footer;

    const labels = {
        '.label-24k': t.k24, '.label-21k': t.k21, '.label-18k': t.k18,
        '.label-coin': t.coin, '.label-ounce': t.ounce, '.label-rate': t.rate
    };

    Object.entries(labels).forEach(([sel, text]) => {
        const el = document.querySelector(sel);
        if (el) el.innerText = text;
    });
    
    document.querySelectorAll('.unit-text').forEach(el => el.innerText = t.unit);
    document.querySelectorAll('.unit-currency').forEach(el => el.innerText = t.currency);

    localStorage.setItem('gold_tracker_lang', currentLang);
}

// Simplified Init
const savedTheme = localStorage.getItem('gold_tracker_theme');
if (savedTheme === 'dark') toggleTheme();

const savedLang = localStorage.getItem('gold_tracker_lang');
if (savedLang && savedLang !== currentLang) toggleLanguage();

elements.langToggle.addEventListener('click', toggleLanguage);
elements.themeToggle.addEventListener('click', toggleTheme);
elements.refreshBtn.addEventListener('click', fetchGoldData);

fetchGoldData();
setInterval(fetchGoldData, REFRESH_INTERVAL);