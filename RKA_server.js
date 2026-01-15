// ✅ Correct CommonJS import for Gemini 3
const { GoogleGenAI } = require("@google/genai");

// ✅ Initialize using the 'new' keyword and the correct class name
const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function runStrategicAnalysis(tradeHistory) {
    const response = await client.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: [{ role: "user", parts: [{ text: "Evaluate strategy: " + JSON.stringify(tradeHistory) }] }],
        config: {
            // ✅ NATIVE GEMINI 3 THINKING
            thinkingConfig: {
                thinkingLevel: "high" 
            },
            temperature: 1.0 
        }
    });

    // In this SDK version, .text is a property of the response
    return response.text;
}

// 🧠 AI PATTERN RECOGNITION ENGINE (All-Star Strategy + Head & Shoulders)
async function detectChartPatterns(candles) {
    // 1. Format Data
    let txt = "Index|Open|High|Low|Close\n";
    candles.forEach((c, i) => { 
        txt += `${i}|${Math.round(c[1])}|${Math.round(c[2])}|${Math.round(c[3])}|${Math.round(c[4])}\n` 
    });

    const prompt = `
    ROLE: Senior Technical Analyst for MCX Silver (5-min chart).
    TASK: Identify HIGH PROBABILITY patterns based on the statistical audit.
    
    STRATEGY RANKING & RULES:
    
    1. 👑 **Bull Flag (The Money Maker):**
       - LOGIC: High frequency, massive total return.
       - RULE: Sharp Pole (>0.25%) + Upper 50% Consolidation.
       - ACTION: BUY Breakout. Target: 100% Pole.

    2. 🎯 **Triple Bottom (The Sniper):**
       - LOGIC: Highest Accuracy (~60%+).
       - RULE: Three clear touches at support.
       - ACTION: BUY Neckline Break. Target: Pattern Height.

    3. 👤 **Head & Shoulders (The Reversal):**
       - LOGIC: Reliable Reversal (Win Rate ~50%).
       - RULE: Left Shoulder, Head (Highest), Right Shoulder. Neckline must be clear.
       - ACTION: SELL Breakdown (for H&S) or BUY Breakout (for Inv. H&S).
       - TARGET: Distance from Head to Neckline.

    4. 📉 **Descending Triangle (The Short):**
       - LOGIC: Reliable breakdown pattern (~54% Win Rate).
       - RULE: Flat Support + Lower Highs.
       - ACTION: SELL Breakdown. Target: Pattern Height.

    5. ⚠️ **Double Top/Bottom (CAUTION):**
       - LOGIC: Only profitable if perfect.
       - RULE: ONLY take if levels match exactly (Horizontal).
    
    EXECUTION RULES:
    - **STOP LOSS:** MUST be Structural (e.g., Right Shoulder, Swing Low).
    - **FILTER:** If price is chopping in a range, return "WAIT".

    DATA INPUT (Today Only):
    ${txt}

    OUTPUT (JSON ONLY):
    {
      "pattern": "Head & Shoulders", 
      "action": "SELL", 
      "confidence": 88, 
      "entry": 72500, 
      "stop": 72800, // Structural SL (Right Shoulder)
      "target": 71900
    }
    If no clear pattern, return: { "action": "WAIT" }
    `;

    try {
        const res = await client.models.generateContent({
            model: "gemini-2.0-flash", 
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: { responseMimeType: "application/json" }
        });
        const jsonString = res.text || res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        return JSON.parse(jsonString);
    } catch (e) { console.error("AI Brain Error:", e.message); return null; }
}



const express = require('express');
const app = express();
app.use(require('express').json());
const axios = require('axios');
// --- 🗄️ FIREBASE DATABASE (Secure Env Var Method) ---
const admin = require('firebase-admin');
// We read the JSON string from the Environment Variable
// ⚠️ MAKE SURE YOU ADDED 'FIREBASE_SERVICE_ACCOUNT' IN RENDER SETTINGS!
let serviceAccount;
try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (e) { console.error("❌ Firebase Key Error: Check Render Environment Variable"); }

if (serviceAccount && !admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = serviceAccount ? admin.firestore() : null;




const { EMA, SMA, ATR, RSI } = require("technicalindicators");
const { Parser } = require('json2csv'); // 🆕 For Excel Download
// ✅ CORRECT IMPORT for Manual WebSocket
const UpstoxClient = require('upstox-js-sdk');
const protobuf = require("protobufjs"); // 🆕 REQUIRED


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- 🔒 PASSWORD LOCK SCREEN ---
function authMiddleware(req, res, next) {
    const password = process.env.ADMIN_PASSWORD;
    if (!password) return next(); // No password set? Let everyone in.

    // 1. Check if the user has the correct "cookie"
    const cookieString = req.headers.cookie || "";
    if (cookieString.includes(`auth=${password}`)) {
        return next(); // Password matches!
    }

    // 2. If not authenticated, show the Lock Screen
    // If this is a POST to /login, let it through so they can actually log in
    if (req.path === '/login' && req.method === 'POST') return next();

    // 3. Render the Lock Screen HTML
    res.send(`
        <!DOCTYPE html>
        <html style="background:#0f172a; color:white; font-family:sans-serif; height:100%;">
        <head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="display:flex; justify-content:center; align-items:center; height:100%; margin:0;">
            <form action="/login" method="POST" style="background:#1e293b; padding:40px; border-radius:15px; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
                <h2 style="margin-top:0; color:#38bdf8;">🛡️ Restricted Access</h2>
                <p style="color:#94a3b8; margin-bottom:20px;">Enter Admin Password</p>
                <input type="password" name="password" placeholder="Password" autofocus 
                    style="width:100%; padding:12px; border-radius:8px; border:1px solid #334155; background:#0f172a; color:white; margin-bottom:15px; outline:none;">
                <button type="submit" style="width:100%; padding:12px; background:#6366f1; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Unlock Dashboard 🔓</button>
            </form>
        </body>
        </html>
    `);
}

const STRATEGY_RULES = `
**1. STRATEGY: SUPERTREND (8, 2.9)**
* **Timeframe:** 5 Minutes
* **Buy:** SuperTrend flips GREEN (Price > Upper Band)
* **Sell:** SuperTrend flips RED (Price < Lower Band)

**2. INTRADAY RULES:**
* **No Entry:** After 11:00 PM
* **Hard Exit:** At 11:15 PM (Auto Square-off)
`;

const STRATEGY_PARAMS = {
    TRADE_PAUSE_MIN: 3,     // Cooldown in minutes after a trade
    MAX_TRADE_QTY: 1        // Default Quantity
};

// Apply the lock
app.use(authMiddleware);
// --- 🔑 ADMIN PASSWORD LOGIN ROUTE (Restored) ---
app.post('/login', (req, res) => {
    const password = process.env.ADMIN_PASSWORD;
    const userPassword = req.body.password;

    // Check if the typed password matches the Render Environment Variable
    if (userPassword === password) {
        // Set a cookie manually so you stay logged in for 30 days
        res.setHeader('Set-Cookie', `auth=${password}; HttpOnly; Max-Age=2592000; Path=/`); 
        res.redirect('/');
    } else {
        res.send(`<h1 style="color:red; text-align:center; margin-top:50px;">❌ WRONG PASSWORD <br> <a href="/">Try Again</a></h1>`);
    }
});




// --- 📜 UPSTOX PROTOBUF SCHEMA ---
// This definition translates the binary stream into readable numbers
// --- 📜 OFFICIAL UPSTOX PROTO SCHEMA ---
const PROTO_DEF = `
syntax = "proto3";
package com.upstox.marketdatafeederv3udapi.rpc.proto;

message LTPC {
  double ltp = 1;
  int64 ltt = 2;
  int64 ltq = 3;
  double cp = 4;
}

message MarketLevel {
  repeated Quote bidAskQuote = 1;
}

message MarketOHLC {
  repeated OHLC ohlc = 1;
}

message Quote {
  int64 bidQ = 1;
  double bidP = 2;
  int64 askQ = 3;
  double askP = 4;
}

message OptionGreeks {
  double delta = 1;
  double theta = 2;
  double gamma = 3;
  double vega = 4;
  double rho = 5;
}

message OHLC {
  string interval = 1;
  double open = 2;
  double high = 3;
  double low = 4;
  double close = 5;
  int64 vol = 6;
  int64 ts = 7;
}

enum Type {
  initial_feed = 0;
  live_feed = 1;
  market_info = 2;
}

message MarketFullFeed {
  LTPC ltpc = 1;
  MarketLevel marketLevel = 2;
  OptionGreeks optionGreeks = 3;
  MarketOHLC marketOHLC = 4;
  double atp = 5;
  int64 vtt = 6;
  double oi = 7;
  double iv = 8;
  double tbq = 9;
  double tsq = 10;
}

message IndexFullFeed {
  LTPC ltpc = 1;
  MarketOHLC marketOHLC = 2;
}

message FullFeed {
  oneof FullFeedUnion {
    MarketFullFeed marketFF = 1;
    IndexFullFeed indexFF = 2;
  }
}

message FirstLevelWithGreeks {
  LTPC ltpc = 1;
  Quote firstDepth = 2;
  OptionGreeks optionGreeks = 3;
  int64 vtt = 4;
  double oi = 5;
  double iv = 6;
}

message Feed {
  oneof FeedUnion {
    LTPC ltpc = 1;
    FullFeed fullFeed = 2;
    FirstLevelWithGreeks firstLevelWithGreeks = 3;
  }
  RequestMode requestMode = 4;
}

enum RequestMode {
  ltpc = 0;
  full_d5 = 1;
  option_greeks = 2;
  full_d30 = 3;
}

message MarketInfo {
  map<string, int32> segmentStatus = 1;
}

message FeedResponse {
  Type type = 1;
  map<string, Feed> feeds = 2; 
  int64 currentTs = 3;
  MarketInfo marketInfo = 4;
}
`;

// Initialize the Translator
let FeedResponse;
try {
    const root = protobuf.parse(PROTO_DEF).root;
    FeedResponse = root.lookupType("com.upstox.marketdatafeederv3udapi.rpc.proto.FeedResponse");
} catch (e) { console.error("❌ Proto Parse Error:", e); }


let botState = { 
    positionType: null, 
    entryPrice: 0, 
    currentStop: null, 
    totalPnL: 0, 
    quantity: 0,
    maxTradeQty: 1, // Default to 1 lot
    history: [], 
    slOrderId: null, 
    isTradingEnabled: true, 
    hiddenLogIds: [],
    maxRunUp: 0,
    maxDrawdown: 0,
    lastExitTime: 0,
    activeMonitors: {},
    activeContract: "MCX_FO|466029", 
    contractName: "SILVER MIC APRIL"
};


// --- 🔒 ENVIRONMENT VARIABLES ---
const { UPSTOX_USER_ID, UPSTOX_PIN, UPSTOX_TOTP_SECRET, API_KEY, API_SECRET, REDIRECT_URI, REDIS_URL } = process.env;



// --- GLOBAL VARIABLES ---
// --- GLOBAL VARIABLES ---
let ACCESS_TOKEN = null;
let lastKnownLtp = 0; 
let sseClients = []; 
let currentWs = null; 
// ✅ NEW: Store ATR here so WebSocket can read it instantly
let globalATR = 800; 
// ✅ NEW: For Rate Limiting (Throttle)
let lastSlUpdateTime = 0; 



// ✅ HELPER: Pair Detection (Finds matching Buy+Sell to highlight them)
function getPairedLogs(logs) {
    const pairedIds = new Set();
    // Sort by time ascending to match pairs chronologically
    const sorted = [...logs].sort((a,b) => new Date(a.time) - new Date(b.time)); 
    
    let openTrade = null;
    sorted.forEach(log => {
        if (log.status !== 'FILLED') return;
        
        if (!openTrade) {
            openTrade = log;
        } else {
            // Check if opposite types (Buy vs Sell)
            if ((openTrade.type === 'BUY' && log.type === 'SELL') || (openTrade.type === 'SELL' && log.type === 'BUY')) {
                pairedIds.add(openTrade.id);
                pairedIds.add(log.id);
                openTrade = null; // Reset pair bucket
            }
        }
    });
    return pairedIds;
}

// ✅ HELPER: Generate Consistent Log HTML (Grid Layout Fix)
// ✅ HELPER: Generate Log HTML (Complete Block)
function generateLogHTML(logs) {
    // Helper to group Entry/Exit pairs visually
    const pairedIds = getPairedLogs(logs); 

    return logs.map(t => {
        // 1. Manual Delete Button (Only for manual trades)
        const isManual = t.tag !== 'API_BOT' && t.status === 'FILLED';
        const deleteBtn = isManual 
            ? `<a href="/delete-log/${t.id}" style="color:#ef4444; font-size:10px; margin-left:5px; text-decoration:none;">[❌]</a>` 
            : '';
        
        // 2. Analyze Button Logic (Only show if PnL exists - meaning it's a closed trade)
        // We use 't.pnl !== undefined' to prevent it from showing on Entry orders
        const hasPnL = t.pnl !== undefined && t.pnl !== null;
        const analyzeBtn = (t.status === 'FILLED' && hasPnL) 
            ? `<br><a href="/analyze-sl/${t.id}" target="_blank" style="display:inline-block; margin-top:4px; background:#6366f1; color:white; padding:3px 8px; border-radius:4px; font-size:10px; text-decoration:none;">🧠 Analyze</a>` 
            : '';
        
        // 3. Metrics Info (RSI / Vol)
        const metrics = t.metrics || {}; 
        const extraInfo = metrics.rsi ? `RSI:${metrics.rsi} V:${metrics.volMult}x` : '';

        // 4. Background Styling (Highlight paired trades)
        const isPaired = pairedIds.has(t.id);
        const bgStyle = isPaired 
            ? 'background:linear-gradient(90deg, #1e293b 0%, #334155 100%); border-left: 3px solid #6366f1;' 
            : 'border-bottom:1px solid #334155;';

        // 5. Return HTML Row
        return `<div style="display:grid; grid-template-columns: 1.2fr 0.6fr 0.5fr 1fr 1fr 1fr 1.5fr; gap:5px; padding:10px; font-size:11px; align-items:center; ${bgStyle} margin-bottom:2px; border-radius:4px;">
            <span style="color:#94a3b8;">${t.time}</span> 
            
            <b style="text-align:center; color:${t.type === 'BUY' ? '#4ade80' : t.type === 'SELL' ? '#f87171' : '#fbbf24'}">
                ${t.type}
            </b> 
            
            <span style="text-align:center; color:#cbd5e1;">${t.qty}L</span> 
            
            <span style="text-align:right; color:#cbd5e1;">₹${t.orderedPrice || '-'}</span>
            
            <span style="text-align:right; font-weight:bold; color:white;">₹${t.executedPrice || '-'}</span> 
            
            <span style="text-align:right; font-weight:bold; color:${(t.pnl || 0) >= 0 ? '#4ade80' : '#f87171'};">
                ${hasPnL ? '₹' + t.pnl.toFixed(0) : ''} 
                <br><span style="font-size:9px; color:#64748b;">${extraInfo}</span>
                ${analyzeBtn} ${deleteBtn}
            </span>
            
            <span style="text-align:right; color:#64748b; font-family:monospace; overflow:hidden; text-overflow:ellipsis;">
                ${t.id || '-'}
            </span>
        </div>`;
    }).join('');
}
// --- 💾 DATABASE FUNCTIONS ---

// 1. SAVE SETTINGS (Switch, Position, SL - Fast & Frequent)
async function saveSettings() {
    if (!db) return;
    try {
        const settings = {
            positionType: botState.positionType,
            entryPrice: botState.entryPrice,
            currentStop: botState.currentStop,
            slOrderId: botState.slOrderId,
            isTradingEnabled: botState.isTradingEnabled,
            maxRunUp: botState.maxRunUp,
            quantity: botState.quantity,
            maxTradeQty: botState.maxTradeQty,
            totalPnL: botState.totalPnL,
            hiddenLogIds: botState.hiddenLogIds || [],
            updatedAt: new Date().toISOString()
        };
        await db.collection('bot').doc('strategy2').set(settings, { merge: true });
    } catch (e) { console.error("❌ Firebase Save Error:", e.message); }
}

// 2. SAVE TRADE (Logs & Heavy Analysis Data - Permanent)
async function saveTrade(tradeObj) {
    if (!db || !tradeObj || !tradeObj.id) return;
    try {
        await db.collection('trades_bot2').doc(tradeObj.id.toString()).set(tradeObj, { merge: true });
    } catch (e) { console.error(`❌ Could not save trade ${tradeObj.id}:`, e.message); }
}

// 3. LOAD STATE (Auto-Migrate from Redis to Firebase)
// --- 💾 SMART LOAD & CLEANUP ---
async function loadState() {
    if (!db) return;
    try {
        console.log("📂 Connecting to Firebase...");
        
        // 1. Load Settings
        const doc = await db.collection('bot').doc('strategy2').get();
        if (doc.exists) {
            const data = doc.data();
            
            // Restoration Logic
            botState.positionType = data.positionType;
            botState.entryPrice = data.entryPrice || 0;
            botState.currentStop = data.currentStop;
            botState.slOrderId = data.slOrderId;
            botState.isTradingEnabled = data.isTradingEnabled ?? true;
            botState.maxRunUp = data.maxRunUp || 0;
            botState.maxDrawdown = data.maxDrawdown || 0; // ✅ Load MAE Memory
            
            // ✅ CRITICAL FIX: LOAD SAVED QUANTITY PREFERENCE
            // If data.maxTradeQty exists, use it. If not, default to 1.
            botState.maxTradeQty = data.maxTradeQty || 1; 
            
            // Restore current position quantity (if any)
            botState.quantity = data.quantity || 0; 
            
            botState.hiddenLogIds = data.hiddenLogIds || [];
            
            // Restore Post-Exit Watcher (The 10-min recording)
            if (data.postExitWatch) {
                botState.postExitWatch = data.postExitWatch;
                console.log(`🎥 Resuming Post-Trade Watch for ID: ${botState.postExitWatch.id}`);
            }
            
            console.log(`⚙️ Settings Loaded. Trading Qty: ${botState.maxTradeQty} | Position: ${botState.positionType || 'NONE'}`);
        }

        // 2. Load Trades
        const snapshot = await db.collection('trades_bot2').orderBy('date', 'desc').limit(200).get();
        let rawHistory = [];
        snapshot.forEach(d => rawHistory.push(d.data()));

        // 3. 🧹 CLEANUP: Remove Duplicates
        // We keep the FIRST instance of every Order ID and discard the rest.
        const seenIds = new Set();
        botState.history = [];
        
        for (const trade of rawHistory) {
            if (!seenIds.has(trade.id)) {
                seenIds.add(trade.id);
                botState.history.push(trade);
            } else {
                // Found a duplicate! (The ghost copy)
                console.log(`🧹 Filtered out duplicate trade: ${trade.id}`);
            }
        }
        
        console.log(`✅ Loaded ${botState.history.length} unique trades.`);

    } catch (e) { console.error("❌ Firebase Load Error:", e.message); }
}
loadState();

async function saveState() { await saveSettings(); } // Backward compatibility wrapper
// --- TIME HELPERS ---
function getIST() { return new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"})); }
function formatDate(date) { return date.toISOString().split('T')[0]; }
function isApiAvailable() { const m = (getIST().getHours()*60)+getIST().getMinutes(); return m >= 330 && m < 1440; }
function isMarketOpen() { const t = getIST(); const m = (t.getHours()*60)+t.getMinutes(); return t.getDay()!==0 && t.getDay()!==6 && m >= 540 && m < 1430; }

// --- DASHBOARD HELPERS ---
function calculateLivePnL() {
    let uPnL = 0;
    if (botState.positionType === 'LONG') uPnL = (lastKnownLtp - botState.entryPrice) * botState.quantity;
    if (botState.positionType === 'SHORT') uPnL = (botState.entryPrice - lastKnownLtp) * botState.quantity;
    return (parseFloat(botState.totalPnL) + uPnL).toFixed(2);
}

// --- DASHBOARD HELPERS ---
function calculateLivePnL() {
    let uPnL = 0;
    if (botState.positionType === 'LONG') uPnL = (lastKnownLtp - botState.entryPrice) * botState.quantity;
    if (botState.positionType === 'SHORT') uPnL = (botState.entryPrice - lastKnownLtp) * botState.quantity;
    
    // ✅ NEW: Calculate Historical PnL by summing logs
    const historyPnL = botState.history.reduce((acc, log) => acc + (log.pnl || 0), 0);
    
    return { live: uPnL.toFixed(2), history: historyPnL.toFixed(2) };
}

// ✅ SUPERTREND CALCULATOR (8, 2.9)
function calculateSuperTrend(candles, period = 8, multiplier = 2.9) {
    const high = candles.map(c => c[2]);
    const low = candles.map(c => c[3]);
    const close = candles.map(c => c[4]);
    
    // Calculate ATR using the library
    const atrInput = { high, low, close, period };
    const atrValues = ATR.calculate(atrInput);

    let finalUpperBand = 0;
    let finalLowerBand = 0;
    let superTrend = [];
    let direction = 1; // 1 = Green, -1 = Red

    // Offset to align ATR array with Price array
    const offset = candles.length - atrValues.length;

    for(let i = 0; i < atrValues.length; i++) {
        const cIdx = i + offset;
        const mid = (high[cIdx] + low[cIdx]) / 2;
        const atr = atrValues[i];
        
        let basicUpper = mid + (multiplier * atr);
        let basicLower = mid - (multiplier * atr);

        let prevFinalUpper = (i===0) ? basicUpper : finalUpperBand;
        let prevFinalLower = (i===0) ? basicLower : finalLowerBand;
        let prevClose = (i===0) ? close[cIdx] : close[cIdx-1];

        // FINAL UPPER BAND LOGIC
        if (basicUpper < prevFinalUpper || prevClose > prevFinalUpper) {
            finalUpperBand = basicUpper;
        } else {
            finalUpperBand = prevFinalUpper;
        }

        // FINAL LOWER BAND LOGIC
        if (basicLower > prevFinalLower || prevClose < prevFinalLower) {
            finalLowerBand = basicLower;
        } else {
            finalLowerBand = prevFinalLower;
        }

        // DIRECTION FLIP
        let stValue = 0;
        if (direction === 1) { 
            stValue = finalLowerBand;
            if (close[cIdx] < finalLowerBand) {
                direction = -1; 
                stValue = finalUpperBand;
            }
        } else {
            stValue = finalUpperBand;
            if (close[cIdx] > finalUpperBand) {
                direction = 1; 
                stValue = finalLowerBand;
            }
        }

        superTrend.push({ 
            time: candles[cIdx][0], 
            value: stValue, 
            direction: direction === 1 ? 'BUY' : 'SELL' 
        });
    }
    return superTrend;
}

// ✅ UPDATED DASHBOARD PUSHER (Sends Logs too)
// ✅ UPDATED DASHBOARD PUSHER (Now sends Position Status)
function pushToDashboard() {
    const hasPosition = botState.positionType && botState.positionType !== 'NONE';
    const pnlData = calculateLivePnL();
    
    const todayStr = formatDate(getIST());
    const todayLogs = botState.history.filter(t => t.date === todayStr && !t.type.includes('SYSTEM') && t.status !== 'CANCELLED');
    const displayLogs = generateLogHTML(todayLogs);

    const data = JSON.stringify({ 
        price: lastKnownLtp, 
        pnl: pnlData.live,
        historicalPnl: pnlData.history,
        stop: hasPosition ? botState.currentStop : 0,
        slID: hasPosition ? botState.slOrderId : null,
        status: ACCESS_TOKEN ? "ONLINE" : "OFFLINE",
        isTrading: botState.isTradingEnabled,
        position: botState.positionType || 'NONE', // ✅ FIXED: Now sending Position Type
        logsHTML: displayLogs 
    });
    sseClients.forEach(c => { try { c.res.write(`data: ${data}\n\n`); } catch(e) {} });
}

// --- EXCHANGE SL MANAGEMENT ---
async function manageExchangeSL(side, qty, triggerPrice) {
    if(!ACCESS_TOKEN) return;

    // ✅ Safety: Ensure trigger price is a whole number for MCX
    const roundedTrigger = Math.round(triggerPrice);
    if (!roundedTrigger || roundedTrigger <= 0) {
        console.error("❌ SL Failed: Invalid Trigger Price (" + roundedTrigger + ")");
        return;
    }

    try {
        // If an old SL exists, try to cancel it first
        if (botState.slOrderId) {
            try {
                await axios.delete(`https://api.upstox.com/v2/order/cancel?order_id=${botState.slOrderId}`, { 
                    headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Accept': 'application/json' }
                });
            } catch (ignore) {}
        }
        
        console.log(`📝 Placing SL-M | Qty: ${qty} | Trigger: ${roundedTrigger} (Rounded for MCX)`);

        const res = await axios.post("https://api.upstox.com/v2/order/place", {
            quantity: qty, 
            product: "I", 
            validity: "DAY", 
            price: 0, 
            instrument_token: botState.activeContract, // ✅ Dynamic Contract Support
            order_type: "SL-M", 
            transaction_type: side === "BUY" ? "SELL" : "BUY", 
            trigger_price: roundedTrigger, 
            is_amo: false
        }, { headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' }});
        
        // ✅ Correctly capture Order ID for tracking
        botState.slOrderId = res.data?.data?.order_id || res.data?.order_id;
        console.log("✅ SL Placed Order ID:", botState.slOrderId);
        await saveSettings();

    } catch (e) { 
        const errMsg = e.response?.data?.errors?.[0]?.message || e.message;
        console.error(`❌ Exchange SL Placement Failed: ${errMsg}`); 
    }
}

async function modifyExchangeSL(oldStop, newTrigger) {
    if (!botState.slOrderId) return;
    try {
        // ✅ Fix: Use the passed 'oldStop' parameter to show correct transition
        console.log(`🔄 Trailing SL: ${Math.round(oldStop)} ➡️ ${Math.round(newTrigger)}`); 
        await axios.put("https://api.upstox.com/v2/order/modify", {
            order_id: botState.slOrderId,
            order_type: "SL-M",
            quantity: botState.quantity,
            trigger_price: Math.round(newTrigger),
            price: 0,
            validity: "DAY",
            disclosed_quantity: 0
        }, { headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Accept': 'application/json' }});
    } catch (e) { 
        const errMsg = e.response?.data?.errors?.[0]?.message || e.message;
        console.log(`❌ SL Modify Failed: ${errMsg}`);
    }
}
// --- 🔌 WEBSOCKET (High-Precision Recorder) ---
async function initWebSocket() {
    if (!ACCESS_TOKEN || currentWs) return;
    try {
        console.log("🔌 Initializing WS (V3 Binary Mode)...");
        const response = await axios.get("https://api.upstox.com/v3/feed/market-data-feed/authorize", { headers: { 'Authorization': 'Bearer ' + ACCESS_TOKEN, 'Accept': 'application/json' } });
        const WebSocket = require('ws'); 
        currentWs = new WebSocket(response.data.data.authorizedRedirectUri, { followRedirects: true });
        // ✅ ADD THIS BLOCK HERE (Prevents crash & resets for the 30s retry loop)
        currentWs.on('error', (error) => {
            console.error(`❌ WebSocket Error: ${error.message}`);
            currentWs = null; // This lets your main 30s loop try again later
        });
        currentWs.binaryType = "arraybuffer"; 

        currentWs.onopen = () => {
            console.log(`✅ WebSocket Connected! Subscribing to ${botState.activeContract}...`);
            const binaryMsg = Buffer.from(JSON.stringify({ 
                guid: "bot-" + Date.now(), 
                method: "sub", 
                data: { mode: "ltpc", instrumentKeys: [botState.activeContract] } 
            }));
            currentWs.send(binaryMsg);
        };
        currentWs.onmessage = async (msg) => {
            try {
                if (!FeedResponse) return;
                const buffer = new Uint8Array(msg.data);
                const message = FeedResponse.decode(buffer);
                const object = FeedResponse.toObject(message, { longs: String, enums: String, bytes: String, defaults: true, oneofs: true });

                if (object.feeds) {
                    for (const key in object.feeds) {
                        const feed = object.feeds[key];
                        let newPrice = feed.ltpc?.ltp || feed.fullFeed?.marketFF?.ltpc?.ltp || feed.fullFeed?.indexFF?.ltpc?.ltp;

                        if (newPrice > 0) {
                            const activeToken = botState.activeContract.split('|')[1]; 
                            
                            if (key.includes(activeToken) || Object.keys(object.feeds).length === 1) {
                                lastKnownLtp = newPrice;
                                // 🎯 [INSERT START] TARGET MONITORING
                            if (botState.positionType && botState.currentTarget) {
                                const isLongWin = (botState.positionType === 'LONG' && newPrice >= botState.currentTarget);
                                const isShortWin = (botState.positionType === 'SHORT' && newPrice <= botState.currentTarget);

                                if (isLongWin || isShortWin) {
                                    console.log(`🎯 BULLSEYE! Target Hit @ ₹${newPrice}. Exiting...`);
                                    const exitSide = botState.positionType === 'LONG' ? 'SELL' : 'BUY';
                                    
                                    // Reset target immediately to prevent double-firing
                                    botState.currentTarget = null; 
                                    
                                    // Execute Exit (PlaceOrder will handle SL cancellation)
                                    // We use 'await' but inside WS we can't block, so we just call it.
                                    placeOrder(exitSide, botState.quantity, newPrice, { reason: "Target Hit" }).catch(e => console.error(e));
                                    return; 
                                }
                            }
                            // 🎯 [INSERT END]

                                // --- INSIDE currentWs.onmessage (After getting newPrice) ---
                    
                                // 0️⃣ TICK RECORDER (For AI Analysis)
                                const tickTime = getIST(); 
                                const tickLog = { t: tickTime.toLocaleTimeString(), p: newPrice }; 
                                
                                // A) Record if currently IN A TRADE
                                if (botState.positionType) {
                                    if (!botState.currentTradeTicks) botState.currentTradeTicks = [];
                                    botState.currentTradeTicks.push(tickLog);
                                }
                                
                                // B) Record if in POST-EXIT WATCH (The 10 mins after trade)
                                if (botState.postExitWatch) {
                                    if (Date.now() < botState.postExitWatch.until) {
                                        // Find the completed trade in history
                                        const pastTrade = botState.history.find(t => t.id === botState.postExitWatch.id);
                                        if (pastTrade) {
                                            // Initialize array if missing
                                            if (!pastTrade.tickData) pastTrade.tickData = [];
                                            // Add tick
                                            pastTrade.tickData.push(tickLog);
                                            
                                            // OPTIONAL: Save every 1 min to prevent data loss if crash (modulo check)
                                            if (pastTrade.tickData.length % 12 === 0) saveTrade(pastTrade);
                                        }
                                    } else {
                                        // ✅ FIX 2: TIME EXPIRED - SAVE DATA PERMANENTLY
                                        console.log(`⏹️ Post-Trade Recording Finished for ${botState.postExitWatch.id}`);
                                        
                                        const finishedTrade = botState.history.find(t => t.id === botState.postExitWatch.id);
                                        if (finishedTrade) {
                                            await saveTrade(finishedTrade); // <--- CRITICAL FIX: Actually saves to Firestore
                                            console.log("💾 Post-Trade Data Saved to DB.");
                                        }
                                        
                                        botState.postExitWatch = null; 
                                        saveSettings(); 
                                    }
                                }
                                                    
                
                                // ✅ RULE 1: FIXED TRAILING STOP (2.5x ATR)
                                    // Use Pure Live ATR (No Min/Max limits)
                                    const liveATR = globalATR > 0 ? globalATR : 800;

                                    let newStop = botState.currentStop;
                                    let didChange = false;

                                    // ✅ SIMPLE FIXED GAP
                                    const trailingGap = liveATR * 2.5; 

                                    // --- APPLY THE TRAIL ---
                                    if (botState.positionType === 'LONG') {
                                        const trailingLevel = newPrice - trailingGap;
                                        
                                        // RATCHET: Only move UP
                                        // We use +50 buffer to avoid spamming Upstox with tiny updates
                                        if (trailingLevel > botState.currentStop + 50) { 
                                            newStop = trailingLevel; 
                                            didChange = true; 
                                        }
                                    } else {
                                        const trailingLevel = newPrice + trailingGap;
                                        
                                        // RATCHET: Only move DOWN
                                        if (trailingLevel < botState.currentStop - 50) { 
                                            newStop = trailingLevel; 
                                            didChange = true; 
                                        }
                                    }

                                    if (didChange) {
                                        const oldStop = botState.currentStop; 
                                        botState.currentStop = newStop;
                                        pushToDashboard(); 
                                        modifyExchangeSL(oldStop, newStop); 
                                    }

                                // 2️⃣ POST-TRADE MONITORING
                                const now = Date.now();
                                for (const oid in botState.activeMonitors) {
                                    const session = botState.activeMonitors[oid];
                                    session.data.push({ t: now, p: newPrice });
                                        
                                    if (newPrice > session.highestAfterExit) session.highestAfterExit = newPrice;
                                    if (newPrice < session.lowestAfterExit) session.lowestAfterExit = newPrice;

                                    if (now - session.startTime > 600000) {
                                        console.log(`✅ Finished Analyzing Trade ${oid}. Saving to Firebase.`);
                                        // ✅ Fix: Search history by looking for the ID in ANY field to be safer
                                        const logIndex = botState.history.findIndex(h => h.id == oid || (h.analysisData && h.analysisData.orderId == oid));
                                        
                                        // ✅ SAFETY FIX: Only save if log exists and analysis data is valid
                                        if (logIndex !== -1 && session.data && session.data.length > 0) {
                                            botState.history[logIndex].analysisData = {
                                                maxRunUp: session.maxRunUp,
                                                startTime: session.startTime, 
                                                data: session.data,        
                                                highAfter: session.highestAfterExit,
                                                lowAfter: session.lowestAfterExit
                                            };
                                            await saveTrade(botState.history[logIndex]);
                                        } else {
                                            // Prevents Firestore "Undefined" crash
                                            console.warn(`⚠️ Skipping Firestore save for ${oid}: Log not found or data empty.`);
                                        }
                                        
                                        delete botState.activeMonitors[oid]; 
                                    }
                                }
                                pushToDashboard(); 
                            }
                        }
                    }
                }
            } catch (e) { 
                console.error("❌ Decode Logic Error:", e.message); 
            }
        };
        currentWs.onclose = () => { currentWs = null; };
    } catch (e) { 
        currentWs = null; 
    }
}

// ============================================================
// 🔑 SLAVE AUTH SYSTEM (Listens to Bot 1)
// ============================================================
async function initSlaveAuth() {
    console.log("👀 Bot 2 is waiting for Token from Bot 1...");

    // LISTEN to the shared document in Real-Time
    db.collection('bot').doc('SHARED_AUTH').onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            const today = new Date().toDateString();
            
            // Only accept token if it was generated TODAY
            if (data.date === today && data.access_token) {
                if (ACCESS_TOKEN !== data.access_token) {
                    ACCESS_TOKEN = data.access_token;
                    console.log("✅ Bot 2 received fresh Access Token! Ready to trade.");
                    
                    // Restart WebSocket with new token
                    if (currentWs) try { currentWs.close(); } catch(e){}
                    initWebSocket();
                }
            } else {
                console.log("⚠️ Token in DB is old/expired. Waiting for Bot 1...");
            }
        }
    });
}

// Start Listening immediately
initSlaveAuth();




// --- DATA ENGINE ---
async function getMergedCandles() {
    const today = getIST();
    const tenDaysAgo = new Date(); tenDaysAgo.setDate(today.getDate() - 10);
    const urlIntraday = `https://api.upstox.com/v3/historical-candle/intraday/${encodeURIComponent(botState.activeContract)}/minutes/5`;
    const urlHistory = `https://api.upstox.com/v3/historical-candle/${encodeURIComponent(botState.activeContract)}/minutes/5/${formatDate(today)}/${formatDate(tenDaysAgo)}`;

    try {
        const [histRes, intraRes] = await Promise.all([
            axios.get(urlHistory, { headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` } }).catch(e => ({ data: { data: { candles: [] } } })),
            axios.get(urlIntraday, { headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` } }).catch(e => ({ data: { data: { candles: [] } } }))
        ]);
        const mergedMap = new Map();
        (histRes.data?.data?.candles || []).forEach(c => mergedMap.set(c[0], c));
        (intraRes.data?.data?.candles || []).forEach(c => mergedMap.set(c[0], c));
        return Array.from(mergedMap.values()).sort((a, b) => new Date(a[0]) - new Date(b[0]));
    } catch (e) { return []; }
}

// --- ✅ RESTORED: ORDER VERIFICATION LOGIC ---
async function fetchLatestOrderId() {
    try {
        const res = await axios.get("https://api.upstox.com/v2/order/retrieve-all", { headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Accept': 'application/json' }});
        if (res.data?.data?.length > 0) return res.data.data.sort((a, b) => new Date(b.order_timestamp) - new Date(a.order_timestamp))[0].order_id;
    } catch (e) { console.log("ID Fetch Failed: " + e.message); } return null;
}

// --- 🔎 FULL ROBUST VERIFICATION (Blocking Mode) ---
// --- 🔎 INTELLIGENT VERIFICATION (Full Logic: ID Swap, PnL, Slippage, Rate Limits) ---
async function verifyOrderStatus(orderId, context, tempLogId = null) {
    if (!orderId) return { status: 'FAILED' };

    console.log(`🔎 Verifying Order ${orderId} (Context: ${context})...`);
    
    let retryCount = 0;
    const maxRetries = 15; // Checks for ~30 seconds total

    while (retryCount < maxRetries) {
        // Wait 2s between checks (Avoid Rate Limits)
        await new Promise(r => setTimeout(r, 2000));
        retryCount++;

        try {
            // 1. Fetch Latest Order Data from Upstox
            const res = await axios.get("https://api.upstox.com/v2/order/retrieve-all", { 
                headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Accept': 'application/json' }
            });
            
            const order = res.data.data.find(o => o.order_id === orderId);
            
            if (!order) {
                console.log(`... Order ${orderId} not found yet (Attempt ${retryCount})`);
                continue; 
            }

            // ============================================
            // ✅ CASE 1: ORDER FILLED (COMPLETE)
            // ============================================
            if (order.status === 'complete') {
                const realPrice = parseFloat(order.average_price);
                const execTime = new Date(order.order_timestamp).toLocaleTimeString();
                
                console.log(`✅ Order Confirmed: ${order.transaction_type} @ ₹${realPrice}`);
                
                // --- A. UPDATE THE DASHBOARD LOG ---
                // Find by Real ID OR Temp ID (Passed from placeOrder)
                const logIndex = botState.history.findIndex(h => h.id === orderId || h.id === tempLogId);
                
                if (logIndex !== -1) {
                    // Update Core Data
                    botState.history[logIndex].id = orderId; // 🔄 Swap Temp ID for Real ID
                    botState.history[logIndex].executedPrice = realPrice;
                    botState.history[logIndex].time = execTime;
                    botState.history[logIndex].status = "FILLED";
                    
                    // Capture Filled Quantity
                    const filledQty = parseInt(order.filled_quantity);
                    if (filledQty) botState.history[logIndex].qty = filledQty;

                    // --- B. HANDLE EXIT LOGIC (STOP LOSS / TARGET HIT) ---
                    if (context === 'EXIT_CHECK') {
                        console.log("📝 Calculating Final PnL for Exit...");
                        
                        let tradePnL = 0;
                        const qty = botState.history[logIndex].qty;
                        const entryPrice = botState.entryPrice;

                        // Calculate PnL based on direction
                        if (order.transaction_type === 'SELL') tradePnL = (realPrice - entryPrice) * qty;
                        else tradePnL = (entryPrice - realPrice) * qty;

                        // Save PnL
                        botState.history[logIndex].pnl = tradePnL;
                        botState.totalPnL += tradePnL;
                        console.log(`💰 Final PnL: ₹${tradePnL.toFixed(0)}`);

                        // 💾 Save AI Data
                        botState.history[logIndex].tickData = [...(botState.currentTradeTicks || [])];
                        botState.history[logIndex].metrics = {
                            ...(botState.history[logIndex].metrics || {}),
                            mae: botState.maxDrawdown || 0,
                            mfe: botState.maxRunUp || 0
                        };

                        // 🎥 Start 10-Minute Post-Trade Watcher
                        botState.postExitWatch = { 
                            id: orderId, 
                            until: Date.now() + (10 * 60 * 1000) 
                        };
                        console.log(`🎥 Post-Trade Watcher Started for ID: ${orderId}`);

                        // 🧹 RESET GLOBAL BOT STATE
                        botState.positionType = null;
                        botState.entryPrice = 0;
                        botState.quantity = 0;
                        botState.currentTradeTicks = [];
                        botState.maxRunUp = 0;
                        botState.maxDrawdown = 0;
                    }
                    
                    // Save this specific trade to Firestore
                    await saveTrade(botState.history[logIndex]); 
                }
                
                await saveSettings();
                pushToDashboard(); 
                return { status: 'FILLED', price: realPrice }; 
            }

            // ============================================
            // ✅ CASE 2: SLIPPAGE / STUCK ORDER
            // ============================================
            if (order.status === 'trigger pending' || order.status === 'open') {
                if (retryCount >= 6) { // If still open after ~12 seconds
                    console.log(`⚠️ SLIPPAGE DETECTED: Order ${orderId} is still ${order.status}. Price likely gapped.`);
                    
                    // Revert State so bot knows we are still in the trade
                    // If SL (Sell) is open, we are still LONG.
                    if (context === 'EXIT_CHECK') {
                         botState.positionType = (order.transaction_type === 'BUY') ? 'SHORT' : 'LONG';
                         console.log(`🔄 State Reverted to ${botState.positionType}. Monitoring continues.`);
                    }

                    pushToDashboard();
                    return { status: 'SLIPPAGE' }; 
                }
            }
            
            // ============================================
            // ✅ CASE 3: FAILED / CANCELLED
            // ============================================
            if (['rejected', 'cancelled'].includes(order.status)) {
                console.error(`❌ Order ${order.status.toUpperCase()}: ${order.status_message}`);
                
                const logIndex = botState.history.findIndex(h => h.id === tempLogId || h.id === orderId);
                if (logIndex !== -1) {
                    botState.history[logIndex].id = orderId;
                    botState.history[logIndex].status = order.status.toUpperCase();
                    await saveTrade(botState.history[logIndex]);
                }

                // If Entry failed, clear state. If Exit failed, keep state (handled above).
                if (context !== 'EXIT_CHECK') { 
                    botState.positionType = null; 
                    botState.quantity = 0;
                }
                
                pushToDashboard();
                await saveSettings();
                return { status: 'FAILED' }; 
            }

        } catch (e) { 
            if (e.response && e.response.status === 429) {
                console.log("⚠️ Upstox Rate Limit hit. Pausing 5s...");
                await new Promise(r => setTimeout(r, 5000));
            } else {
                console.log(`⚠️ Verification Error (Attempt ${retryCount}): ${e.message}`); 
            }
        }
    }
    
    // ============================================
    // ✅ CASE 4: TIMEOUT
    // ============================================
    console.error(`❌ Verification Timeout for Order ${orderId}`);
    
    // Safety Fallback: Unlock state if stuck
    if (botState.positionType === 'EXITING') {
        console.log("🛑 Verification TIMEOUT. Reverting state to allow recovery.");
        botState.positionType = null; 
    }
    return { status: 'TIMEOUT' };
}
// --- STRICT PLACE ORDER (With Intent Logging & Error Detail) ---
// --- 🚀 ROBUST PLACE ORDER (Full Version) ---
async function placeOrder(type, qty, ltp, metrics = null) { 
    // 1. Basic Checks
    if (!ACCESS_TOKEN) { console.log("⚠️ No Access Token. Skipping Order."); return false; }
    if (!isApiAvailable()) { console.log("⚠️ API in Cooling Period. Skipping."); return false; }
    if (!botState.isTradingEnabled) { console.log("⚠️ Trading Disabled via Dashboard."); return false; }

    // 2. Calculate Limit Price (0.3% Buffer to ensure fill)
    const bufferAmount = ltp * 0.003;
    let limitPrice = type === "BUY" ? Math.round(ltp + bufferAmount) : Math.round(ltp - bufferAmount);

    console.log(`🚀 [INTENT] Sending ${type} Order: ${qty} Lot(s) @ ~₹${ltp} (Limit: ₹${limitPrice})`);

    // 3. Create Audit Log Entry
    const logId = "ORD-" + Date.now(); 
    const logEntry = { 
        date: formatDate(getIST()), 
        time: getIST().toLocaleTimeString(), 
        type: type, 
        qty: qty, 
        orderedPrice: ltp, 
        executedPrice: 0, 
        id: logId, 
        status: "SENT", 
        tag: "API_BOT", 
        metrics: metrics 
    };
    
    botState.history.unshift(logEntry);
    pushToDashboard(); // Update UI immediately

    try {
        // 4. Send API Request to Upstox
        const res = await axios.post("https://api.upstox.com/v3/order/place", {
            quantity: qty, 
            product: "I", 
            validity: "DAY", 
            price: limitPrice,
            instrument_token: botState.activeContract, 
            order_type: "LIMIT", 
            transaction_type: type, 
            disclosed_quantity: 0, 
            trigger_price: 0, 
            is_amo: false, 
            tag: "API_BOT"
        }, { 
            headers: { 
                'Authorization': `Bearer ${ACCESS_TOKEN}`, 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        let orderId = res.data?.data?.order_ids?.[0] || res.data?.data?.order_id;
        
        if (!orderId) {
            console.error("❌ API returned no Order ID:", res.data);
            throw new Error("No Order ID from Upstox");
        }

        console.log(`✅ Order Sent. ID: ${orderId}. Verifying status...`);

        // 5. Verify Execution (Wait for Fill)
        // We use your existing verifyOrderStatus helper
        const result = await verifyOrderStatus(orderId, 'ENTRY', logId); 

        if (result.status === 'FILLED') {
            console.log(`🎉 Order FILLED at ₹${result.price}`);

            // Update Log with real execution price
            const histIdx = botState.history.findIndex(h => h.id === orderId || h.id === logId);
            if(histIdx !== -1) {
                botState.history[histIdx].id = orderId; // Sync IDs
                botState.history[histIdx].executedPrice = result.price;
                botState.history[histIdx].status = "FILLED";
            }

            // Determine if this is an Entry or Exit
            // (If we have a position AND the type is opposite, it's an Exit)
            const isExit = botState.positionType && (
                (botState.positionType === 'LONG' && type === 'SELL') || 
                (botState.positionType === 'SHORT' && type === 'BUY')
            );

            if (!isExit) {
                // ===========================================
                // ✅ HANDLING NEW ENTRY
                // ===========================================
                botState.positionType = type === "BUY" ? 'LONG' : 'SHORT';
                botState.entryPrice = result.price; 
                botState.quantity = qty;
                botState.lastTradeTime = Date.now();
                botState.currentTradeTicks = []; // Reset tick recorder

                // --- A. SET TARGET (From AI or Default) ---
                if (metrics && metrics.target) {
                    botState.currentTarget = metrics.target;
                    console.log(`🎯 Target Locked at: ₹${botState.currentTarget}`);
                } else {
                    botState.currentTarget = null;
                }

                // --- B. SET STOP LOSS (Chart vs ATR) ---
                let slPrice;
                if (metrics && metrics.customStop) {
                    // Option 1: AI Provided Structural SL
                    console.log(`🛡️ Using AI Chart SL: ${metrics.customStop}`);
                    slPrice = metrics.customStop;
                } else {
                    // Option 2: Fallback to ATR
                    const liveATR = Math.max(globalATR, 500) || 1000;
                    const slPoints = Math.round((liveATR > 0 ? liveATR : 800) * 2.0); // 2x ATR
                    slPrice = type === "BUY" ? Math.round(result.price - slPoints) : Math.round(result.price + slPoints);
                    console.log(`⚠️ Using Fallback ATR SL: ${slPrice} (ATR: ${liveATR})`);
                }
                
                botState.currentStop = slPrice;
                
                // Save state before placing SL order
                await saveSettings();
                pushToDashboard();

                // --- C. PLACE EXCHANGE SL ORDER ---
                // This calls your existing helper to place a real SL-M order
                console.log("🛡️ Placing Physical Stop Loss on Exchange...");
                await manageExchangeSL(type, qty, slPrice); 
                
                return true;

            } else {
                // ===========================================
                // ✅ HANDLING EXIT / SQUARE OFF
                // ===========================================
                console.log("👋 Position Closed. Calculating PnL...");

                let pnl = 0;
                if(botState.positionType === 'LONG') pnl = (result.price - botState.entryPrice) * qty;
                if(botState.positionType === 'SHORT') pnl = (botState.entryPrice - result.price) * qty;
                
                // Update History Log with PnL
                if(histIdx !== -1) {
                    botState.history[histIdx].pnl = Math.round(pnl);
                    // Attach tick data for replay
                    botState.history[histIdx].tickData = [...(botState.currentTradeTicks || [])];
                }

                // 🛑 CRITICAL: CANCEL THE PENDING SL ORDER
                if (botState.slOrderId) {
                    console.log(`🗑️ Cancelling Pending SL Order: ${botState.slOrderId}`);
                    try {
                        await axios.delete(`https://api.upstox.com/v2/order/cancel?order_id=${botState.slOrderId}`, { 
                            headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Accept': 'application/json' }
                        });
                        console.log("✅ SL Order Cancelled.");
                        botState.slOrderId = null;
                    } catch (e) { 
                        console.error("⚠️ Failed to Cancel SL (Might be already executed):", e.message); 
                    }
                }

                // Start Post-Trade Watcher (Cooling)
                botState.lastExitTime = Date.now();
                botState.postExitWatch = { id: orderId, until: Date.now() + (10 * 60 * 1000) };
                
                // Reset State
                botState.positionType = null;
                botState.currentTarget = null;
                botState.currentStop = null;
                botState.currentTradeTicks = [];
                botState.entryPrice = 0;
                
                await saveSettings();
                pushToDashboard();
                return true;
            }
        } else {
            // Order was CANCELLED or REJECTED
            console.log(`❌ Order Status: ${result.status}. No Position taken.`);
            const histIdx = botState.history.findIndex(h => h.id === logId);
            if(histIdx !== -1) botState.history[histIdx].status = result.status;
            pushToDashboard();
            return false;
        }

    } catch (e) {
        console.error(`❌ Order Execution Failed: ${e.message}`);
        
        // Update Log to FAILED
        const histIdx = botState.history.findIndex(h => h.id === logId);
        if(histIdx !== -1) {
            botState.history[histIdx].status = "FAILED";
            botState.history[histIdx].note = e.message;
        }
        
        // Safety Reset
        if (!botState.positionType) botState.positionType = null; 
        
        pushToDashboard();
        return false;
    }
}


// --- TOKEN VALIDATION HELPER ---
// ✅ UPDATED: REAL TOKEN VALIDATION
async function validateToken() {
    if (!ACCESS_TOKEN) return false;

    try {
        // "Ping" Upstox to check if the token is still valid
        // We use the User Profile API as a lightweight check
        await axios.get('https://api.upstox.com/v2/user/profile', {
            headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Accept': 'application/json' }
        });
        return true;
    } catch (e) {
        // If Upstox returns 401, the token is definitely Invalid/Revoked
        if (e.response && e.response.status === 401) {
            console.log("⚠️ Token is Invalid/Revoked. Switching to OFFLINE.");
            ACCESS_TOKEN = null; // 🚨 This triggers the Dashboard to show OFFLINE
            
            // Kill the WebSocket too since the token is dead
            if (currentWs) {
                try { currentWs.close(); } catch(err) {}
                currentWs = null;
            }
            
            pushToDashboard(); // Force immediate UI update
            return false;
        }
        // If it's a different error (like network issue), we assume token is OK for now
        return true;
    }
}

// ============================================================
// 🤖 TRADING LOOP (Executes Every 30 Seconds)
// Strategy: SuperTrend (8, 2.9) | Intraday Only
// ============================================================
// ============================================================
// 🤖 TRADING LOOP (Executes Every 30 Seconds)
// Strategy: AI Pattern Recognition (Replaces SuperTrend)
// ============================================================
// ============================================================
// 🤖 TRADING LOOP (Intraday Isolated + Ghost SL Check)
// ============================================================
setInterval(async () => {
    // 1. SAFETY CHECKS (Slave Mode)
    if (!ACCESS_TOKEN) return; 

    // 2. WebSocket Watchdog: Reconnect if dropped
    if ((lastKnownLtp === 0 || !currentWs) && ACCESS_TOKEN) {
        console.log("⚠️ WebSocket dropped. Reconnecting...");
        initWebSocket();
        return; 
    }

    try {
        // --- 🕒 INTRADAY TIME MANAGEMENT ---
        const now = getIST();
        const currentMinutes = (now.getHours() * 60) + now.getMinutes();
        
        // Settings: 11:00 PM (Stop Entry) & 11:15 PM (Force Exit)
        const NO_NEW_TRADES_TIME = 1380; 
        const FORCE_EXIT_TIME = 1395;    

        // 🛑 LOGIC A: AUTO SQUARE-OFF (11:15 PM)
        if (currentMinutes >= FORCE_EXIT_TIME && botState.positionType && botState.positionType !== 'EXITING') {
            console.log(`⏰ [TIME LIMIT] 11:15 PM Reached. Forcing Intraday Square-off!`);
            const exitType = botState.positionType === 'LONG' ? 'SELL' : 'BUY';
            await placeOrder(exitType, botState.quantity, lastKnownLtp, { reason: "Intraday Time Limit" });
            return; 
        }

        // 🛡️ LOGIC B: GHOST SL CHECK (Safety Mechanism)
        // If Price crossed SL by 200 points but WS didn't catch it, manually check Order Status
        if (botState.positionType && botState.currentStop && botState.slOrderId) {
            const buffer = 200;
            const slBreached = (botState.positionType === 'LONG' && lastKnownLtp < (botState.currentStop - buffer)) ||
                               (botState.positionType === 'SHORT' && lastKnownLtp > (botState.currentStop + buffer));
            
            if (slBreached) {
                console.log("⚠️ Price crossed SL + Buffer! Checking if SL triggered at Exchange...");
                // Force a verification of the SL order
                await verifyOrderStatus(botState.slOrderId, 'EXIT_CHECK');
            }
        }

        // --- 📊 DATA ENGINE (Fetch Candles) ---
        const today = new Date();
        const tenDaysAgo = new Date(); tenDaysAgo.setDate(today.getDate() - 10);
        
        const urlIntraday = `https://api.upstox.com/v3/historical-candle/intraday/${encodeURIComponent(botState.activeContract)}/minutes/5`;
        const urlHistory = `https://api.upstox.com/v3/historical-candle/${encodeURIComponent(botState.activeContract)}/minutes/5/${formatDate(today)}/${formatDate(tenDaysAgo)}`;

        const [histRes, intraRes] = await Promise.all([
            axios.get(urlHistory, { headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` } }).catch(e => ({ data: { data: { candles: [] } } })),
            axios.get(urlIntraday, { headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` } }).catch(e => ({ data: { data: { candles: [] } } }))
        ]);

        // Merge & Sort Candles
        const mergedMap = new Map();
        (histRes.data?.data?.candles || []).forEach(c => mergedMap.set(c[0], c));
        (intraRes.data?.data?.candles || []).forEach(c => mergedMap.set(c[0], c));
        const candles = Array.from(mergedMap.values()).sort((a, b) => new Date(a[0]) - new Date(b[0]));

        if (candles.length > 0) {
            
            // 🛑 STRICT FILTER: REMOVE YESTERDAY'S DATA (Start from 9:00 AM Today)
            // This prevents "Ghost Patterns" from overnight gaps
            const todayStart = getIST();
            todayStart.setHours(9, 0, 0, 0); 

            // Only keep candles from TODAY
            const todaysCandles = candles.filter(c => new Date(c[0]) >= todayStart);

            const shortName = botState.contractName.replace("SILVER MIC ", ""); 
            console.log(`📊 [${shortName}] LTP: ${lastKnownLtp} | Candles Today: ${todaysCandles.length}`);

            const msSinceExit = Date.now() - botState.lastExitTime;
            const inCooling = msSinceExit < (STRATEGY_PARAMS.TRADE_PAUSE_MIN * 60000);

            // 🟢 STRATEGY ENGINE
            // Wait for at least 5 candles (9:25 AM) to form a pattern
            if (isMarketOpen() && currentMinutes < NO_NEW_TRADES_TIME && !inCooling && todaysCandles.length >= 5) {
                
                // 2. ASK AI: Run only in first 40s of a 5-min candle
                const nowSec = new Date().getSeconds();
                const nowMin = new Date().getMinutes();
                
                if (nowMin % 5 === 0 && nowSec < 40) { 
                    
                    if (!botState.lastAiCheck || botState.lastAiCheck !== nowMin) {
                        botState.lastAiCheck = nowMin;

                        console.log("🧠 Asking Gemini (Today's Data Only)...");
                        
                        // Pass ONLY today's candles to AI
                        const aiDecision = await detectChartPatterns(todaysCandles); 

                        botState.latestAi = aiDecision;
                        pushToDashboard(); 

                        if (aiDecision && aiDecision.action !== "WAIT" && aiDecision.confidence > 80) {
                            
                            // 🛑 CRITICAL FIX: DOUBLE LOCK
                            // 1. Check if we are flat (No Position)
                            // 2. Check if we are currently busy placing an order (Race Protection)
                            if (!botState.positionType && !botState.isOrdering) {
                                
                                const signalType = aiDecision.action;
                                
                                if (botState.isTradingEnabled) {
                                    console.log(`🚀 AI SIGNAL: ${aiDecision.pattern} (${signalType}) @ ${lastKnownLtp}`);

                                    // EXECUTE
                                    await placeOrder(signalType, botState.maxTradeQty, lastKnownLtp, {
                                        strategy: "AI Pattern",
                                        note: aiDecision.pattern,
                                        confidence: aiDecision.confidence,
                                        ai_entry: aiDecision.entry,
                                        customStop: aiDecision.stop,
                                        target: aiDecision.target
                                    });
                                } else {
                                    console.log(`💤 Signal Ignored: Trading is PAUSED.`);
                                }
                            }
                        } else {
                            console.log("🧠 AI says: WAIT");
                        }
                    }
                }
            }
            else if (todaysCandles.length < 5) {
                 // Log only once every 5 mins to reduce spam
                 if (new Date().getMinutes() % 5 === 0 && new Date().getSeconds() < 10) {
                     console.log(`⏳ Waiting for morning data (Found ${todaysCandles.length}/5 candles)...`);
                 }
            }
        }
    } catch (e) { 
        if(e.response?.status===401) { 
            console.log("⚠️ Token Expired. Waiting for refresh...");
            ACCESS_TOKEN = null; 
        } else {
            console.error("❌ Loop Error:", e.message);
        }
    }
}, 30000);



// --- 📡 API & DASHBOARD ---
app.get('/live-updates', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const id = Date.now();
    sseClients.push({ id, res });
    req.on('close', () => sseClients = sseClients.filter(c => c.id !== id));
});

app.get('/toggle-trading', async (req, res) => {
    botState.isTradingEnabled = !botState.isTradingEnabled;
    const action = botState.isTradingEnabled ? "RESUMED" : "PAUSED";
    
    // Create System Log
    const sysLog = {
        date: formatDate(getIST()),
        time: getIST().toLocaleTimeString(),
        type: "SYSTEM",
        id: "CMD-" + Date.now().toString().slice(-6),
        status: action,
        pnl: 0,
        tag: "MANUAL",
        orderedPrice: 0,
        executedPrice: 0
    };

    botState.history.unshift(sysLog);
    // 🔥 Firebase Save
    if(db) await saveSettings(); 
    
    console.log(`🔘 Trading Manually ${action} by User.`);
    pushToDashboard();
    res.redirect('/');
});

app.get('/delete-log/:id', async (req, res) => {
    const idToRemove = req.params.id;
    if (!botState.hiddenLogIds) botState.hiddenLogIds = [];
    botState.hiddenLogIds.push(idToRemove);

    // Remove from memory
    botState.history = botState.history.filter(h => h.id !== idToRemove);
    botState.totalPnL = botState.history.reduce((acc, log) => acc + (log.pnl || 0), 0);

    // 🔥 Firebase Delete
    try {
        if(db) await db.collection('trades_bot2').doc(idToRemove).delete();
        await saveSettings();
    } catch(e) { console.error("Firebase delete error", e); }

    res.redirect('/');
});

// --- 🏠 DASHBOARD ROUTE (Fixed Chart Version) ---
app.get('/', (req, res) => {
    // 1. Calculate PnL
    const todayStr = formatDate(getIST()); 
    const todayLogs = botState.history.filter(h => h.date === todayStr);
    const todayPnL = todayLogs.reduce((acc, log) => acc + (log.pnl || 0), 0);
    const historyPnL = botState.history.reduce((acc, log) => acc + (log.pnl || 0), 0);

    // 2. Prepare Logs
    const cleanLogs = todayLogs.filter(t => !t.type.includes('SYSTEM') && t.status !== 'CANCELLED' && t.status !== 'REJECTED');
    const displayLogs = generateLogHTML(cleanLogs);

    res.send(`
        <!DOCTYPE html><html style="background:#0f172a; color:white; font-family:sans-serif;">
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <script src="https://unpkg.com/lightweight-charts@3.8.0/dist/lightweight-charts.standalone.production.js"></script>
            <style>
                .tab-btn { background:#334155; border:none; color:white; padding:10px 20px; cursor:pointer; flex:1; }
                .tab-btn.active { background:#6366f1; font-weight:bold; }
                .panel { display:none; }
                .panel.active { display:block; }
            </style>
        </head>
        <body style="display:flex; justify-content:center; padding:10px; margin:0;">
            <div style="width:100%; max-width:650px; background:#1e293b; padding:15px; border-radius:15px;">
                
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <div>
                        <h2 style="color:#38bdf8; margin:0;">श्री Radha Kishan Silver</h2>
                        <div style="font-size:12px; color:#94a3b8;">${botState.contractName}</div>
                    </div>
                     <a href="/toggle-trading" id="toggle-btn" style="padding:8px 15px; border-radius:8px; text-decoration:none; color:white; font-weight:bold; background:${botState.isTradingEnabled?'#22c55e':'#ef4444'}">
                        ${botState.isTradingEnabled?'🟢 TRADING ON':'🔴 PAUSED'}
                    </a>
                </div>

                <div style="display:flex; gap:5px; margin-bottom:15px;">
                    <a href="/switch-contract?id=MCX_FO|458305&name=SILVER MIC FEB" 
                       style="flex:1; padding:8px; text-align:center; font-size:10px; border-radius:5px; text-decoration:none; 
                       background:${botState.activeContract.includes('458305') ? '#6366f1' : '#334155'}; color:white; border:1px solid #475569;">
                       FEB CONTRACT
                    </a>
                    <a href="/switch-contract?id=MCX_FO|466029&name=SILVER MIC APRIL" 
                       style="flex:1; padding:8px; text-align:center; font-size:10px; border-radius:5px; text-decoration:none; 
                       background:${botState.activeContract.includes('466029') ? '#6366f1' : '#334155'}; color:white; border:1px solid #475569;">
                       APRIL CONTRACT
                    </a>
                </div>

                <div style="display:flex; border-bottom:2px solid #334155; margin-bottom:15px;">
                    <button onclick="showTab('logs')" class="tab-btn active" id="btn-logs">📜 DASHBOARD</button>
                    <button onclick="showTab('chart')" class="tab-btn" id="btn-chart">📈 LIVE CHART</button>
                </div>

                <div id="logs-panel" class="panel active">
                    
                    <div style="text-align:center; padding:15px; border:1px solid #334155; border-radius:10px; margin-bottom:15px;">
                        <small style="color:#94a3b8;">LIVE PRICE</small><br><b id="live-price" style="font-size:24px; color:#fbbf24;">₹${lastKnownLtp || '---'}</b>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
                        <div style="background:#0f172a; padding:10px; text-align:center; border-radius:8px;"><small style="color:#94a3b8;">LIVE PNL</small><br><b id="live-pnl">₹${calculateLivePnL().live}</b></div>
                        <div style="background:#0f172a; padding:10px; text-align:center; border-radius:8px;"><small style="color:#94a3b8;">TODAY NET</small><br><b id="todays-pnl" style="color:${todayPnL >= 0 ? '#4ade80' : '#f87171'}">₹${todayPnL.toFixed(2)}</b></div>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
                        <div style="background:#0f172a; padding:10px; text-align:center; border-radius:8px;"><small style="color:#94a3b8;">TRAILING SL</small><br><b id="live-sl" style="color:#f472b6;">₹${botState.currentStop ? botState.currentStop.toFixed(0) : '---'}</b></div>
                        <div style="background:#0f172a; padding:10px; text-align:center; border-radius:8px;"><small style="color:#94a3b8;">EXCHANGE SL</small><br><b id="exch-sl" style="color:#f472b6;">₹${botState.currentStop ? botState.currentStop.toFixed(0) : '---'}</b><br><span id="exch-id" style="font-size:10px; color:#64748b;">${botState.slOrderId || 'NO ORDER'}</span></div>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
                        <div style="background:#0f172a; padding:10px; text-align:center; border-radius:8px;">
                            <small style="color:#94a3b8;">POSITION</small><br>
                            <b id="pos-type" style="color:#facc15;">${botState.positionType || 'NONE'}</b>
                        </div>
                        <div style="background:#0f172a; padding:10px; text-align:center; border-radius:8px;"><small style="color:#94a3b8;">STATUS</small><br><b id="live-status" style="color:${ACCESS_TOKEN?'#4ade80':'#ef4444'}">${ACCESS_TOKEN?'ONLINE':'OFFLINE'}</b></div>
                    </div>

                    <div style="margin-bottom:15px;">
                        <a href="/reports" style="display:block; width:100%; padding:15px; background:#334155; color:white; text-align:center; border-radius:8px; text-decoration:none; border:1px solid #475569;">
                            <b>📊 VIEW HISTORICAL REPORTS</b><br>
                            <small id="hist-btn-pnl" style="color:${historyPnL>=0?'#4ade80':'#f87171'}">Total: ₹${historyPnL.toFixed(2)}</small>
                        </a>
                    </div>

                    <div style="background:#0f172a; padding:15px; border-radius:10px; margin-bottom:15px; border:1px solid #334155;">
                        <form action="/update-qty" method="POST" style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="color:#94a3b8; font-size:14px;">TRADE QUANTITY:</span>
                            <div style="display:flex; gap:5px;">
                                <input type="number" name="qty" value="${botState.maxTradeQty}" min="1" max="10" 
                                    style="width:50px; background:#1e293b; color:white; border:1px solid #475569; padding:5px; border-radius:4px; text-align:center;">
                                <button type="submit" style="background:#6366f1; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:12px;">SET</button>
                            </div>
                        </form>
                    </div>

                    <div style="display:flex; gap:10px; margin-bottom:20px;">
                        <form action="/trigger-login" method="POST" style="flex:1;"><button style="width:100%; padding:12px; background:#6366f1; color:white; border:none; border-radius:8px; cursor:pointer;">🤖 AUTO-LOGIN</button></form>
                        <form action="/sync-price" method="POST" style="flex:1;"><button style="width:100%; padding:12px; background:#fbbf24; color:#0f172a; border:none; border-radius:8px; cursor:pointer;">🔄 SYNC PRICE</button></form>
                    </div>

                    <div style="display:grid; grid-template-columns: 1.2fr 0.6fr 0.5fr 1fr 1fr 1fr 1.5fr; gap:5px; padding:5px 10px; color:#94a3b8; border-bottom:1px solid #334155; font-size:11px; margin-bottom:5px;">
                        <span>Time</span> <span style="text-align:center;">Type</span> <span style="text-align:center;">Qty</span> <span style="text-align:right;">Ord</span> <span style="text-align:right;">Exec</span> <span style="text-align:right;">PnL</span> <span style="text-align:right;">ID</span>
                    </div>

                    <div id="logContent">${displayLogs}</div>
                </div>

                <div id="chart-panel" class="panel">
                    <div id="chart-status" style="text-align:center; padding:10px; color:#94a3b8; font-size:12px; display:none;">
                        ⚠️ Bot is OFFLINE. Click "Auto-Login" to load chart history.
                    </div>
                    <div id="tv-chart" style="width:100%; height:500px;"></div>
                </div>

            </div>

            <script>
                // 1. TABS LOGIC
                function showTab(name) {
                    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
                    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    document.getElementById(name+'-panel').classList.add('active');
                    document.getElementById('btn-'+name).classList.add('active');
                    if(name === 'chart') loadChart();
                }

                // 2. LIVE UPDATES
                const source = new EventSource('/live-updates');
                source.onmessage = (e) => {
                    const d = JSON.parse(e.data);
                    
                    document.getElementById('live-price').innerText = '₹' + d.price;
                    document.getElementById('live-pnl').innerText = '₹' + d.pnl;
                    document.getElementById('live-pnl').style.color = parseFloat(d.pnl) >= 0 ? '#4ade80' : '#f87171';
                    document.getElementById('hist-btn-pnl').innerText = 'Total: ₹' + d.historicalPnl;
                    
                    // Update Status Colors
                    const stat = document.getElementById('live-status');
                    stat.innerText = d.status;
                    stat.style.color = d.status === 'ONLINE' ? '#4ade80' : '#ef4444';
                    
                    // Show Chart Warning if Offline
                    if(d.status === 'OFFLINE') {
                        document.getElementById('chart-status').style.display = 'block';
                    } else {
                        document.getElementById('chart-status').style.display = 'none';
                    }

                    const pos = document.getElementById('pos-type');
                    pos.innerText = d.position;
                    pos.style.color = d.position === 'NONE' ? '#facc15' : (d.position === 'LONG' ? '#4ade80' : '#f87171');

                    const btn = document.getElementById('toggle-btn');
                    btn.innerText = d.isTrading ? "🟢 TRADING ON" : "🔴 PAUSED";
                    btn.style.background = d.isTrading ? "#22c55e" : "#ef4444";

                    if(d.logsHTML) document.getElementById('logContent').innerHTML = d.logsHTML;
                };

                // 3. CHART LOGIC
                let chart, candleSeries;
                async function loadChart() {
                    if(chart) return; 
                    
                    document.getElementById('tv-chart').innerHTML = '';
                    chart = LightweightCharts.createChart(document.getElementById('tv-chart'), {
                        layout: { background: { color: '#1e293b' }, textColor: '#DDD' },
                        grid: { vertLines: { color: '#334155' }, horzLines: { color: '#334155' } },
                        timeScale: { timeVisible: true, secondsVisible: false }
                    });
                    
                    candleSeries = chart.addCandlestickSeries({
                        upColor: '#26a69a', downColor: '#ef5350', borderVisible: false, wickUpColor: '#26a69a', wickDownColor: '#ef5350'
                    });
                    
                    try {
                        const res = await fetch('/api/chart-data');
                        const data = await res.json();
                        if(data && data.length > 0) {
                            candleSeries.setData(data);
                            chart.timeScale().fitContent();
                        }
                    } catch(e) { console.log("Chart Data Error:", e); }
                }
            </script>
        </body></html>
    `);
});

// --- SMART SYNC (PnL Replay + Data Protection) ---
// --- SMART SYNC (Full Replay Engine + Dynamic Contract Support) ---
// --- 🔄 FULL SMART SYNC (PnL Replay Engine + Multi-Contract Support) ---
// --- 🔄 FULL SMART SYNC (PnL Replay Engine + Multi-Contract Support) ---
// --- 🔄 FULL PRECISION SYNC (IST DATE LOCK + WEIGHTED PNL + MULTI-QTY) ---
app.post('/sync-price', async (req, res) => {
    if (!ACCESS_TOKEN) return res.redirect('/');
    try {
        console.log(`🔄 Syncing & Recalculating PnL for ${botState.contractName}...`);
        const activeToken = botState.activeContract.split('|')[1]; 

        // 1. Fetch all orders from Upstox
        const ordRes = await axios.get("https://api.upstox.com/v2/order/retrieve-all", { 
            headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Accept': 'application/json' }
        });
        
        // 2. Filter orders specifically for the ACTIVE contract
        const myOrders = (ordRes.data?.data || [])
            .filter(o => o.instrument_token && o.instrument_token.includes(activeToken)) 
            .filter(o => o.status !== 'cancelled' && o.status !== 'rejected')
            .filter(o => !botState.hiddenLogIds || !botState.hiddenLogIds.includes(o.order_id)) 
            .sort((a, b) => new Date(a.order_timestamp) - new Date(b.order_timestamp));

        let openPos = { side: null, price: 0, qty: 0 };
        const processedLogs = [];
        const todayStr = formatDate(getIST()); 

        // 3. Replay Engine: Reconstruct trades to calculate PnL
        myOrders.forEach(order => {
            const realPrice = parseFloat(order.average_price) || 0;
            const limitPrice = parseFloat(order.price) || 0;
            const execTime = new Date(order.order_timestamp).toLocaleTimeString();
            const txnType = order.transaction_type; 
            const status = order.status === 'complete' ? 'FILLED' : order.status.toUpperCase();
            let tradePnL = 0; 

            if (order.status === 'complete') {
                const qty = parseInt(order.quantity) || 1;
                if (openPos.qty === 0) {
                    openPos.side = txnType; openPos.price = realPrice; openPos.qty = qty;
                } else if (openPos.side !== txnType) {
                    if (openPos.side === 'BUY' && txnType === 'SELL') tradePnL = (realPrice - openPos.price) * openPos.qty;
                    else if (openPos.side === 'SELL' && txnType === 'BUY') tradePnL = (openPos.price - realPrice) * openPos.qty;
                    openPos.qty = 0; openPos.side = null; openPos.price = 0;
                }
            }

            // Restore metadata for the trade if it exists
            const existingLog = botState.history.find(h => h.id === order.order_id);
            const preservedData = (existingLog && existingLog.analysisData) ? existingLog.analysisData : null;
            const preservedTag = order.tag || (existingLog ? existingLog.tag : "MANUAL");

            const tradeLog = {
                date: todayStr, time: execTime, type: txnType, 
                qty: parseInt(order.quantity) || 1, // ✅ Dynamic Qty Sync
                orderedPrice: limitPrice,
                executedPrice: realPrice, id: order.order_id, status: status,
                pnl: tradePnL !== 0 ? tradePnL : null, 
                tag: preservedTag,
                analysisData: preservedData // ✅ Now guaranteed to be null or an object
            };
            
            processedLogs.unshift(tradeLog);
            if(db) saveTrade(tradeLog); 
        });

        // 4. Merge system logs back into history
        botState.history = botState.history.filter(h => h.type === 'SYSTEM' || (h.date && h.date !== todayStr));
        botState.history = [...processedLogs, ...botState.history];
        botState.totalPnL = botState.history.reduce((acc, log) => acc + (log.pnl || 0), 0);

        // 5. Update Position Status from Portfolio
        const posResponse = await axios.get('https://api.upstox.com/v2/portfolio/short-term-positions', { 
            headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
        });
        const pos = (posResponse.data?.data || []).find(p => p.instrument_token && p.instrument_token.includes(activeToken));
        
        if (pos && parseInt(pos.quantity) !== 0) {
            botState.positionType = parseInt(pos.quantity) > 0 ? 'LONG' : 'SHORT';
            botState.quantity = Math.abs(parseInt(pos.quantity));
            botState.entryPrice = parseFloat(pos.buy_price) || parseFloat(pos.average_price);

            const openOrders = ordRes.data?.data || [];
            const existingSL = openOrders.find(o => o.status === 'trigger pending' && o.order_type === 'SL-M' && o.instrument_token.includes(activeToken));

            if (existingSL) {
                botState.currentStop = parseFloat(existingSL.trigger_price);
                botState.slOrderId = existingSL.order_id;
            } else {
                const currentLtp = lastKnownLtp || botState.entryPrice;
                botState.currentStop = botState.positionType === 'LONG' ? (currentLtp - 1200) : (currentLtp + 1200);
            }
        } else { 
            botState.positionType = null; botState.currentStop = 0; botState.slOrderId = null; botState.quantity = 0;
        }
        
        if(db) await saveSettings();
    } catch (e) { console.error("Sync Error:", e.message); }
    res.redirect('/');
});

// ✅ CORRECT: Define PORT first, then use it
const PORT = process.env.PORT || 10000; // Define the port!

// ✅ NEW ROUTE: One-time PnL Reset
app.post('/reset-pnl', async (req, res) => {
    botState.totalPnL = 0;
    await saveState();
    pushToDashboard();
    res.redirect('/');
});

// ✅ REPORTS PAGE (Cleaned UI + Analyze Button)
app.get('/reports', (req, res) => {
    // 1. Group History by Date
    const grouped = {};
    const trades = botState.history.filter(h => h.status === 'FILLED' && !h.type.includes('SYSTEM'));

    trades.forEach(t => {
        if (!grouped[t.date]) grouped[t.date] = [];
        grouped[t.date].push(t);
    });

    // 2. Start HTML Construction
    let html = `<html><head><title>Trade Reports</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #f8fafc; padding: 20px; max-width: 1000px; margin: auto; }
        .date-card { background: #1e293b; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #334155; }
        .header-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 10px; margin-bottom: 10px; }
        .pnl-tag { font-weight: bold; padding: 4px 8px; border-radius: 4px; background: #0f172a; border: 1px solid #334155; }
        .btn { padding: 6px 12px; border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: bold; display: inline-block; }
        .btn-green { background: #22c55e; color: white; }
        .btn-blue { background: #6366f1; color: white; margin-left:5px;}
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { text-align: left; color: #94a3b8; padding: 8px; border-bottom: 1px solid #334155; }
        td { padding: 8px; border-bottom: 1px solid #334155; color: #e2e8f0; }
        .buy { color: #4ade80; } .sell { color: #f87171; }
    </style>
    </head><body>
    
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h2>📜 Historical Trade Reports</h2>
        <a href="/" style="text-decoration:none; color:#38bdf8; border:1px solid #38bdf8; padding:5px 10px; border-radius:4px;">🏠 Dashboard</a>
    </div>`;

    // 3. Sort Dates (Newest First)
    const sortedDates = Object.keys(grouped).sort((a,b) => new Date(b) - new Date(a));

    if(sortedDates.length === 0) {
        html += `<div style="text-align:center; color:#64748b; margin-top:50px;">No trades found yet.</div>`;
    }

    // 4. Build Table for Each Date
    sortedDates.forEach(date => {
        const dayTrades = grouped[date];
        const dayPnL = dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
        const pnlColor = dayPnL >= 0 ? '#4ade80' : '#f87171';
        
        html += `<div class="date-card">
            <div class="header-row">
                <div style="display:flex; align-items:center; gap:15px;">
                    <h3 style="margin:0;">📅 ${date}</h3>
                    <span class="pnl-tag" style="color:${pnlColor}">Day PnL: ₹${dayPnL.toFixed(0)}</span>
                </div>
                <a href="/download-day-excel?date=${date}" class="btn btn-green">📥 Excel</a>
            </div>
            <table>
            <tr><th>Time</th><th>Type</th><th>Qty</th><th>Price</th><th>PnL</th><th>Action</th></tr>`;
            
        dayTrades.forEach(t => {
            const rowColor = (t.pnl && t.pnl !== 0) ? (t.pnl > 0 ? 'rgba(74, 222, 128, 0.05)' : 'rgba(248, 113, 113, 0.05)') : 'transparent';
            
            // ✅ "Analyze" Button (Only shows if trade is closed/has PnL)
            const analyzeBtn = (t.pnl !== undefined) 
                ? `<a href="/analyze-sl/${t.id}" target="_blank" class="btn btn-blue">🧠 Analyze</a>` 
                : '-';

            html += `<tr style="background:${rowColor}">
                <td>${t.time}</td>
                <td class="${t.type === 'BUY' ? 'buy' : 'sell'}"><b>${t.type}</b></td>
                <td>${t.qty}</td>
                <td>${t.executedPrice}</td>
                <td style="font-weight:bold; color:${(t.pnl||0)>=0?'#4ade80':'#f87171'}">${t.pnl !== undefined ? '₹'+t.pnl : '-'}</td>
                <td>${analyzeBtn}</td>
            </tr>`;
        });
        html += `</table></div>`;
    });

    html += `</body></html>`;
    res.send(html);
});


// ============================================================
// ✅ AI ANALYSIS SYSTEM (Loading Screen + API + Caching)
// ============================================================

// ============================================================
// ✅ AI ANALYSIS SYSTEM (Loading Screen + API + Rich UI)
// ============================================================

// 1️⃣ THE LOADING SHELL (Instant Load)
app.get('/analyze-sl/:id', async (req, res) => {
    const tradeId = req.params.id;
    
    // Send a page that immediately shows a spinner, then fetches data via AJAX
    res.send(`
    <html>
    <head>
        <title>AI Analysis</title>
        <style>
            body { background:#0f172a; color:white; font-family:'Segoe UI', sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; }
            .loader { border: 4px solid #334155; border-top: 4px solid #6366f1; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin:auto; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .container { text-align:center; }
        </style>
    </head>
    <body>
        <div class="container" id="loading">
            <div class="loader"></div>
            <h3 style="color:#94a3b8; margin-top:20px;">🤖 Gemini is analyzing trade #${tradeId}...</h3>
            <p style="color:#64748b; font-size:12px;">This may take 5-10 seconds.</p>
        </div>
        <div id="content" style="width:100%; height:100%; display:none;"></div>

        <script>
            // Check for refresh flag in URL
            const urlParams = new URLSearchParams(window.location.search);
            const forceRefresh = urlParams.get('refresh') === 'true';

            // Call the API
            fetch('/api/generate-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tradeId: '${tradeId}', force: forceRefresh })
            })
            .then(res => res.text())
            .then(html => {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('content').style.display = 'block';
                document.getElementById('content').innerHTML = html;
            })
            .catch(err => {
                document.getElementById('loading').innerHTML = '<h3 style="color:#f87171">❌ Error loading analysis</h3><p>'+err+'</p>';
            });
        </script>
    </body>
    </html>
    `);
});


// 2️⃣ THE HEAVY API (Handles Cache, Calculations & Gemini)
app.post('/api/generate-analysis', async (req, res) => {
    try {
        const { tradeId, force } = req.body;
        const docRef = db.collection('trades_bot2').doc(tradeId);
        const doc = await docRef.get();
        if (!doc.exists) return res.send("Trade not found.");
        
        const t = doc.data();

        // --- CHECK CACHE (If analysis exists and we are NOT forcing refresh) ---
        if (t.aiAnalysis && !force) {
            console.log(`⚡ Serving Cached Analysis for ${tradeId}`);
            return res.send(renderAnalysisHTML(t, t.aiAnalysis, tradeId));
        }

        // --- PREPARE DATA FOR GEMINI (Your Custom Logic) ---
        const exitPrice = t.executedPrice || t.orderedPrice || 0;
        const totalPnL = t.pnl || 0;
        const qty = t.qty || 1;
        
        // ✅ Retrieve MAE/MFE Correctly
        const maxRunUp = t.metrics?.mfe || t.analysisData?.maxRunUp || t.maxRunUp || 0;
        const maxDrawdown = t.metrics?.mae || t.analysisData?.maxDrawdown || t.maxDrawdown || 0;

        let positionType = "UNKNOWN";
        let entryPrice = 0;
        if (t.type === 'BUY') { 
            positionType = "SHORT"; 
            entryPrice = exitPrice + (totalPnL / qty); 
        } else if (t.type === 'SELL') { 
            positionType = "LONG"; 
            entryPrice = exitPrice - (totalPnL / qty);
        }

        // ✅ In-Trade Tick Sampling (For Volatility Context)
        const inTradeRaw = t.tickData || [];
        const inTradeSample = inTradeRaw.filter((_, i) => i % 5 === 0);

        // ✅ Post-Exit Snapshots Logic
        const postExitData = t.analysisData ? t.analysisData.data : [];
        const startTime = t.analysisData ? t.analysisData.startTime : Date.now();
        function getPriceAt(min) {
            if (!postExitData.length) return null;
            const target = startTime + (min * 60 * 1000);
            return postExitData.reduce((prev, curr) => Math.abs(curr.t - target) < Math.abs(prev.t - target) ? curr : prev);
        }
        const snap1 = getPriceAt(1);
        const snap5 = getPriceAt(5);
        const snap10 = getPriceAt(10);

        const prompt = `
            Act as a Quantitative Strategy Consultant. 
            Goal: Optimize my strategy based on this specific trade.

            **1. TRADE REALITY:**
            * Position: ${positionType} (${qty} Lots)
            * Entry: ${entryPrice.toFixed(2)} | Exit: ${exitPrice}
            * **Result:** ₹${totalPnL} (Per Lot: ₹${(totalPnL/qty).toFixed(0)})
            
            **2. RISK METRICS:**
            * **Max Profit (MFE):** ₹${maxRunUp}
            * **Max Loss (MAE):** ₹${maxDrawdown}

            **3. IN-TRADE PATH:**
            * Price Path: ${JSON.stringify(inTradeSample.map(d=>d.p))}
            
            **4. POST-EXIT PATH:**
            * 1 Min Later: ${snap1?.p || 'N/A'}
            * 5 Mins Later: ${snap5?.p || 'N/A'}
            * 10 Mins Later: ${snap10?.p || 'N/A'}

            **YOUR TASK:**
            1. **Best Initial SL:** Look at the MAE (${maxDrawdown}). Was my SL too tight or too loose?
            2. **Best Trailing Logic:** Did I get shaken out by noise?
            3. **Profit Taking:** I reached +₹${maxRunUp}. Should I have locked it?
            
            **OUTPUT FORMAT (Strict HTML):**
            <h3>🚀 Optimal Strategy Parameters</h3>
            <ul>
                <li><b>Best Initial SL:</b> [Value] (Reason)</li>
                <li><b>Best Trailing Gap:</b> [Value] (Reason)</li>
                <li><b>Best Target/Lock:</b> [Value] (Reason)</li>
            </ul>
            <h3>💰 Simulation</h3>
            <p>Potential Outcome: <b>₹[Amount]</b> (vs Actual ₹${totalPnL})</p>
            <h3>📉 Technical Insight</h3>
            [Brief comment on price action]
        `;

        // --- CALL GEMINI ---
        const result = await client.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: { thinkingConfig: { thinkingLevel: "high" } }
        });
        
        const aiText = result.text ? result.text.replace(/\n/g, '<br>') : "AI Unavailable";

        // --- SAVE TO CACHE ---
        await docRef.set({ aiAnalysis: aiText }, { merge: true });

        // --- RETURN RENDERED HTML ---
        res.send(renderAnalysisHTML(t, aiText, tradeId));

    } catch (e) {
        console.error(e);
        res.send("Server Error: " + e.message);
    }
});

// 3️⃣ HELPER FUNCTION TO GENERATE HTML (Now RESTORED with Full UI)
function renderAnalysisHTML(t, analysisText, tradeId) {
    const totalPnL = t.pnl || 0;
    const exitPrice = t.executedPrice || t.orderedPrice || 0;
    const qty = t.qty || 1;
    // Retrieve MAE/MFE for display
    const maxRunUp = t.metrics?.mfe || t.analysisData?.maxRunUp || t.maxRunUp || 0;
    const maxDrawdown = t.metrics?.mae || t.analysisData?.maxDrawdown || t.maxDrawdown || 0;
    
    const tradeDate = (t.date && t.time) ? `${t.date} ${t.time}` : "Unknown Date";

    // Position Calc
    let positionType = "UNKNOWN";
    let entryPrice = 0;
    if (t.type === 'BUY') { 
        positionType = "SHORT"; entryPrice = exitPrice + (totalPnL / qty); 
    } else if (t.type === 'SELL') { 
        positionType = "LONG"; entryPrice = exitPrice - (totalPnL / qty);
    }

    // Post-Exit Logic for Table
    const postExitData = t.analysisData ? t.analysisData.data : [];
    const startTime = t.analysisData ? t.analysisData.startTime : Date.now();
    function getPriceAt(min) {
        if (!postExitData.length) return null;
        const target = startTime + (min * 60 * 1000);
        return postExitData.reduce((prev, curr) => Math.abs(curr.t - target) < Math.abs(prev.t - target) ? curr : prev);
    }
    const snap1 = getPriceAt(1);
    const snap3 = getPriceAt(3);
    const snap5 = getPriceAt(5);
    const snap10 = getPriceAt(10);

    // ✅ FULL UI RESTORED BELOW
    return `
    <div style="background:#0f172a; color:white; font-family:'Segoe UI', sans-serif; padding:30px; min-height:100vh;">
        <div style="max-width:900px; margin:auto;">
            
            <div style="background:#1e293b; border-radius:15px; padding:20px; border:1px solid #334155; margin-bottom:25px; box-shadow:0 10px 30px rgba(0,0,0,0.3);">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #475569; padding-bottom:15px; margin-bottom:15px;">
                    <div>
                        <h2 style="margin:0; color:#38bdf8;">🚀 Strategy Optimizer</h2>
                        <div style="color:#94a3b8; font-size:13px;">${tradeDate}</div>
                    </div>
                    
                    <div style="display:flex; gap:10px; align-items:center;">
                        <a href="/analyze-sl/${tradeId}?refresh=true" style="background:#f59e0b; padding:8px 15px; border-radius:5px; text-decoration:none; color:#0f172a; font-weight:bold; font-size:12px;">
                            🔄 Refresh
                        </a>
                        <div style="text-align:right;">
                            <div style="font-size:12px; color:#cbd5e1;">ACTUAL TOTAL PnL</div>
                            <div style="font-size:24px; font-weight:bold; color:${totalPnL>=0?'#4ade80':'#f87171'}">
                                ${totalPnL>=0?'+':''}₹${totalPnL}
                            </div>
                        </div>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:15px; text-align:center; margin-bottom:10px;">
                    <div style="background:#0f172a; padding:10px; border-radius:10px;">
                        <div style="font-size:10px; color:#94a3b8;">POSITION</div>
                        <div style="font-weight:bold; color:#fbbf24; font-size:14px;">${positionType} (${qty} Lots)</div>
                    </div>
                    <div style="background:#0f172a; padding:10px; border-radius:10px;">
                        <div style="font-size:10px; color:#94a3b8;">ENTRY PRICE</div>
                        <div style="font-weight:bold; font-size:14px;">${entryPrice.toFixed(0)}</div>
                    </div>
                    <div style="background:#0f172a; padding:10px; border-radius:10px;">
                        <div style="font-size:10px; color:#94a3b8;">EXIT PRICE</div>
                        <div style="font-weight:bold; font-size:14px;">${exitPrice}</div>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:15px; text-align:center;">
                    <div style="background:#0f172a; padding:10px; border-radius:10px; border:1px solid #334155;">
                        <div style="font-size:10px; color:#94a3b8;">MAX RUN-UP (MFE)</div>
                        <div style="font-weight:bold; color:#4ade80; font-size:14px;">+₹${maxRunUp}</div>
                    </div>
                    <div style="background:#0f172a; padding:10px; border-radius:10px; border:1px solid #334155;">
                        <div style="font-size:10px; color:#94a3b8;">MAX DRAWDOWN (MAE)</div>
                        <div style="font-weight:bold; color:#f87171; font-size:14px;">-₹${maxDrawdown}</div>
                    </div>
                </div>
            </div>

            <div style="background:#1e293b; padding:30px; border-radius:15px; border:1px solid #4f46e5; margin-bottom:25px; line-height:1.7; color:#e2e8f0;">
                ${analysisText}
            </div>

            <div style="background:#1e293b; padding:20px; border-radius:15px; border:1px solid #334155; margin-bottom:25px;">
                <h3 style="margin-top:0; color:#cbd5e1; font-size:16px; border-bottom:1px solid #475569; padding-bottom:10px;">⏱️ Post-Exit Price Snapshots</h3>
                ${postExitData.length > 0 ? `
                <table style="width:100%; border-collapse:collapse; color:#cbd5e1; font-size:14px;">
                    <tr style="text-align:left; color:#94a3b8;">
                        <th style="padding:10px;">Offset</th><th>Price</th><th>Diff</th>
                    </tr>
                    <tr style="border-bottom:1px solid #334155;">
                        <td style="padding:10px;">+1 Min</td><td>${snap1?.p || '-'}</td>
                        <td style="color:${snap1 && ((positionType=='LONG' && snap1.p > exitPrice) || (positionType=='SHORT' && snap1.p < exitPrice)) ? '#4ade80' : '#f87171'}">${snap1 ? (snap1.p - exitPrice).toFixed(0) : '-'}</td>
                    </tr>
                    <tr style="border-bottom:1px solid #334155;">
                        <td style="padding:10px;">+3 Mins</td><td>${snap3?.p || '-'}</td>
                        <td>${snap3 ? (snap3.p - exitPrice).toFixed(0) : '-'}</td>
                    </tr>
                    <tr>
                        <td style="padding:10px;">+5 Mins</td><td>${snap5?.p || '-'}</td>
                        <td>${snap5 ? (snap5.p - exitPrice).toFixed(0) : '-'}</td>
                    </tr>
                </table>
                ` : `<div style="text-align:center; color:#facc15;">⚠️ No Post-Exit Data Yet.</div>`}
            </div>

            <div style="margin-top:20px; text-align:center;">
                <a href="/reports" style="color:#64748b; text-decoration:none;">&larr; Back to Reports</a>
            </div>
        </div>
    </div>
    `;
}

// ✅ EXCEL DOWNLOADER (FIXED: Strict Pairing + Chronological Order)
app.get('/download-day-excel', (req, res) => {
    try {
        const targetDate = req.query.date;
        const allTrades = botState.history;
        
        // 1. Filter for EXIT TRADES ONLY (Must have PnL)
        // We assume any trade with a valid PnL (even 0) is an Exit.
        // We filter out any trade where pnl is undefined or null.
        const exitTrades = allTrades.filter(t => 
            t.date === targetDate && 
            t.status === 'FILLED' && 
            t.pnl !== undefined && 
            t.pnl !== null
        );

        const pairedRows = [];
        const usedEntryIds = new Set(); 

        // 2. Iterate through Exits to find their Entry
        exitTrades.forEach(exitTrade => {
            
            // Find the matching Entry in the MAIN history (not just dayTrades)
            // The Entry must be OLDER than the Exit (Index > Exit Index in 'allTrades')
            const exitIndex = allTrades.indexOf(exitTrade);
            
            // Search backwards in time (indices larger than exitIndex)
            const entryTrade = allTrades.slice(exitIndex + 1).find(t => 
                t.status === 'FILLED' &&
                t.qty === exitTrade.qty &&
                t.type !== exitTrade.type && // Opposite type
                !t.pnl && // Entries usually don't have PnL
                !usedEntryIds.has(t.id) // Ensure we haven't paired it already
            );

            if (entryTrade) {
                usedEntryIds.add(entryTrade.id);
                
                // Determine Direction (LONG/SHORT)
                const direction = entryTrade.type === 'BUY' ? 'LONG' : 'SHORT';
                const m = entryTrade.metrics || {}; 

                pairedRows.push({
                    "DATE": entryTrade.date, // Use Entry Date (matches your sheet)
                    "TYPE": direction,
                    "QUANTITY": exitTrade.qty,
                    "ENTRY PRICE": entryTrade.executedPrice,
                    "ENTRY TIME": entryTrade.time,
                    "EXIT PRICE": exitTrade.executedPrice,
                    "EXIT TIME": exitTrade.time,
                    "PnL": exitTrade.pnl,
                    "E50": m.e50 || '-',
                    "E200": m.e200 || '-',
                    "VOLUME": m.vol || '-',
                    "AVG VOLUME": m.avgVol || '-',
                    "VOLUME MULTIPLE": m.volMult || '-',
                    "RSI": m.rsi || '-'
                });
            }
        });

        // 3. SORT CHRONOLOGICALLY (Oldest Entry First)
        // Your sheet starts at 9:00 AM.
        pairedRows.sort((a, b) => {
            // Convert time strings "HH:MM:SS" to comparison
            // Helper to parse time assuming same date
            const tA = new Date(`1970/01/01 ${a["ENTRY TIME"]}`).getTime();
            const tB = new Date(`1970/01/01 ${b["ENTRY TIME"]}`).getTime();
            return tA - tB;
        });

        if (pairedRows.length === 0) {
            return res.send(`No complete trades found for ${targetDate}. (Make sure trades have PnL)`);
        }

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(pairedRows);

        res.header('Content-Type', 'text/csv');
        res.attachment(`Silver_Report_${targetDate}.csv`);
        res.send(csv);

    } catch (e) {
        console.error("Excel Gen Error:", e);
        res.status(500).send("Error generating Excel: " + e.message);
    }
});


app.post('/ask-trade-question', async (req, res) => {
    try {
        console.log("💬 Chat Request Received");
        const { tradeId, question } = req.body;
        
        // 1. Fetch the trade again so AI knows the context
        const doc = await db.collection('trades_bot2').doc(tradeId).get();
        if (!doc.exists) return res.json({ answer: "Error: Trade not found." });
        const t = doc.data();

        // 2. Send context + Question to Gemini 3.0
        const result = await client.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ 
                role: "user", 
                parts: [{ text: `
                    SYSTEM: You are a strict trading coach.
                    RULES: ${STRATEGY_RULES}
                    
                    CONTEXT: User is asking about a specific trade.
                    Trade Data: Type=${t.type}, P/L=${t.pnl}, Buy=${t.buyPrice}, Sell=${t.sellPrice}, Time=${t.timestamp}.
                    
                    USER QUESTION: "${question}"
                    
                    ANSWER: Keep it brief, specific to this trade, and based on the rules.
                ` }] 
            }]
        });

        // 3. Send AI answer back to the chat box
        res.json({ answer: result.text });

    } catch (e) {
        console.error("Chat Error:", e);
        res.status(500).json({ answer: "Server Error: " + e.message });
    }
});

// 👆👆👆 END OF STEP 3 👆👆👆


// ... [Bottom of file] ...


// --- 🧠 AI STRATEGY OPTIMIZATION (Historical Analysis) ---
app.get('/ai-overall-optimization', async (req, res) => {
    try {
        console.log("🧠 Gemini 3.0 Flash: Starting Global Strategy Analysis...");
        
        // Fetch your Firebase logs
        const snapshot = await db.collection('trades_bot2').get();
        let tradeLogs = [];
        snapshot.forEach(doc => tradeLogs.push(doc.data()));

        // ✅ Correct SDK call with Thinking Capability
        const result = await client.models.generateContent({
            model: "gemini-3-pro-preview", 
            contents: [{ 
                role: "user", 
                parts: [{ text: `Analyze my Silver trading strategy performance: ${JSON.stringify(tradeLogs)}` }] 
            }],
            config: {
                thinkingConfig: {
                    includeThoughts: true, 
                    thinkingLevel: "high" // 🧠 Max reasoning for your stop-loss logic
                },
                temperature: 1.0 
            }
        });

        // ✅ The new SDK uses .text() as a function
        const aiResponse = result.text.replace(/\n/g, '<br>'); // ✅ Works (it's a string)
        res.send(`
            <body style="background:#0f172a; color:white; font-family:sans-serif; padding:40px;">
                <div style="max-width:800px; margin:auto; background:#1e293b; padding:30px; border-radius:15px; border:1px solid #4f46e5;">
                    <h1 style="color:#38bdf8;">🧠 Strategy Optimization (Gemini 3.0 Flash)</h1>
                    <div style="line-height:1.8; color:#e2e8f0;">${aiResponse}</div>
                    <br><a href="/" style="display:inline-block; padding:10px 20px; background:#6366f1; color:white; text-decoration:none; border-radius:8px;">🏠 Back to Dashboard</a>
                </div>
            </body>
        `);
    } catch (e) {
        console.error("AI Error:", e);
        res.status(500).send("AI Strategy Error: " + e.message);
    }
});;

app.get('/switch-contract', async (req, res) => {
    const newId = req.query.id;
    const newName = req.query.name;

    // 🛑 TEMPORARILY REMOVED: Position check bypassed as requested
    // if (botState.positionType) { ... }

    if (!newId || newId === botState.activeContract) return res.redirect('/');

    const oldName = botState.contractName;

    // 1. Unsubscribe from old contract
    if (currentWs && currentWs.readyState === 1) {
        const unsubMsg = Buffer.from(JSON.stringify({ 
            guid: "unsub-" + Date.now(), 
            method: "unsub", 
            data: { mode: "ltpc", instrumentKeys: [botState.activeContract] } 
        }));
        currentWs.send(unsubMsg);
    }

    // 2. Update State
    botState.activeContract = newId;
    botState.contractName = newName;
    lastKnownLtp = 0; 

    // 3. Log the change
    const sysLog = {
        date: formatDate(getIST()),
        time: getIST().toLocaleTimeString(),
        type: "SYSTEM",
        id: "SWITCH-" + Date.now().toString().slice(-4),
        status: "CONTRACT_CHANGED",
        pnl: 0,
        tag: "MANUAL",
        orderedPrice: 0,
        executedPrice: 0,
        reason: `Changed from ${oldName} to ${newName}`
    };
    botState.history.unshift(sysLog);

    // 4. Resubscribe to new contract
    if (currentWs && currentWs.readyState === 1) {
        const subMsg = Buffer.from(JSON.stringify({ 
            guid: "sub-" + Date.now(), 
            method: "sub", 
            data: { mode: "ltpc", instrumentKeys: [botState.activeContract] } 
        }));
        currentWs.send(subMsg);
    }

    await saveSettings();
    console.log(`🔄 Contract Switched: ${oldName} ➡️ ${newName}`);
    res.redirect('/');
});

app.post('/update-qty', async (req, res) => {
    try {
        const newQty = parseInt(req.body.quantity || req.body.qty); // Handle 'quantity' or 'qty' name
        
        if (newQty && newQty > 0) {
            botState.maxTradeQty = newQty; // Update Memory
            await saveSettings(); // 💾 CRITICAL: Save to Firebase/File
            console.log(`✅ Trade Quantity Updated to: ${botState.maxTradeQty} Lots`);
        }
        res.redirect('/'); // Go back to dashboard
    } catch (e) {
        console.error("Update Qty Error:", e);
        res.status(500).send("Error updating quantity");
    }
});


// ✅ RULE 5: EXCEL DOWNLOAD ROUTE
// ✅ EXCEL DOWNLOAD ROUTE (Fixed Date & Metrics)
app.get('/download-excel', (req, res) => {
    try {
        // 1. Filter & Sort Trades
        // We only want FILLED trades that are actual buys/sells (not system logs)
        const trades = botState.history
            .filter(t => t.status === 'FILLED' && !t.type.includes('SYSTEM'))
            // Sort Descending (Newest First) -> Combines Date + Time strings safely
            .sort((a,b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
        
        // 2. Map Data to Excel Columns
        const excelData = trades.map(t => {
            // Safely access metrics (defaults to empty object if missing)
            const m = t.metrics || {};
            
            return {
                "DATE": t.date, // ✅ Uses the trade's specific date
                "TYPE": t.type,
                "QUANTITY": t.qty,
                "ENTRY PRICE": t.orderedPrice, 
                "ENTRY TIME": t.time,
                "EXIT PRICE": t.executedPrice,
                "PnL": t.pnl || 0,
                
                // ✅ METRICS COLUMNS (Now populated correctly)
                "E50": m.e50 || '-',
                "E200": m.e200 || '-',
                "AVG VOLUME": m.avgVol || '-',
                "VOLUME MULTIPLE": m.volMult || '-',
                "RSI": m.rsi || '-',
                "ATR": m.atr || '-'
            };
        });

        // 3. Convert JSON to CSV
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(excelData);

        // 4. Send File Download
        res.header('Content-Type', 'text/csv');
        res.attachment(`Silver_Trades_${formatDate(getIST())}.csv`);
        res.send(csv);

    } catch (e) {
        console.error("Excel Gen Error:", e);
        res.status(500).send("Error generating Excel: " + e.message);
    }
});
// ✅ AUTO-RECOVERY: If server restarts, wait 20s (to let it settle) then Auto-Login
setTimeout(() => {
    // Only try to login if market is OPEN and we are NOT logged in
    if (isMarketOpen() && !ACCESS_TOKEN) {
        console.log("♻️ Crash Recovery Detected: Attempting Auto-Login...");
        performAutoLogin();
    }
}, 20000); // 20-second delay to prevent crashing a cold server

// 📊 API to feed the Dashboard Chart
app.get('/api/chart-data', async (req, res) => {
    try {
        const candles = await getMergedCandles();
        // Convert Upstox format to TradingView format
        const chartData = candles.map(c => ({
            time: (new Date(c[0]).getTime() / 1000) + 19800, // Adjust for IST
            open: c[1], high: c[2], low: c[3], close: c[4]
        }));
        res.json(chartData);
    } catch(e) { 
        // 🛑 THIS WAS MISSING
        res.json([]); 
    } 
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
