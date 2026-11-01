/* ---------------- DURUM ----------------
   S    : bu koşu (hedef, gün, para, puan...). Kayıt: CONFIG.saveKey, sürüm CONFIG.saveVersion; migrate() eski kayıtları taşır.
   META : mahalle. Karakterler, arklar, olgular, müşteriler, eşyalar, geçmiş koşular. Hiçbir son bunu silmez. */
function defaultMeta(){
  return {
    v:1,
    chars:{ hayri:0, nebahat:0, ferhat:0, musti:0, nuri:0 },
    arcs:{},                       // arc → { step, due, defer, flags, done }
    facts:{},                      // key → { day, run }
    customers:[],                  // teslim edilen müşteriler (en fazla 40)
    seenEvents:{},                 // eventId → [seçim indeksleri]
    keepsakes:[], endings:[], runs:[],
    owned:['helmet_std','jacket_std','gloves_std','scooter_std','bag_std'],
    equipped:{ helmet:'helmet_std', jacket:'jacket_std', gloves:'gloves_std', scooter:'scooter_std', bag:'bag_std', side:null },
    gifts:[], unlockedRestaurants:[], storyLog:[],
    ticketNo:48213, lastPlayDate:null, streakDays:0,
    metrics:{ sessions:0, maxDay:0, fired:0, wins:0, continues:0, newAccounts:0 }
  };
}
let META = defaultMeta();
function loadMeta(){ try{ const r = localStorage.getItem(CONFIG.metaKey); if(r){ const o = JSON.parse(r); META = Object.assign(defaultMeta(), o); META.chars = Object.assign(defaultMeta().chars, o.chars||{}); META.equipped = Object.assign(defaultMeta().equipped, o.equipped||{}); META.metrics = Object.assign(defaultMeta().metrics, o.metrics||{}); } }catch(e){} }
function saveMeta(){ try{ localStorage.setItem(CONFIG.metaKey, JSON.stringify(META)); }catch(e){} }

function defaultState(){
  return {
    v:CONFIG.saveVersion, account:1, name:'',
    goalId:null, goalPrice:0, goalBase:0, taksitPaid:0, taksitPaidAmt:0, boxDelivered:false,
    money:CONFIG.startMoney, day:1, rating:CONFIG.startRating,
    offered:0, accepted:0, complaints:0, lastComplaintDay:0, cleanStreak:0, streak:0, breakNext:false,
    orderIdx:0, dayRounds:CONFIG.ordersPerDay, orderLog:[], offers:[], current:null,
    dayEarned:0, dayTips:0, dayFuel:0, dayCut:0, dayExpense:0, dayTaskBonus:0, dayDeliveries:[], dayReviews:[],
    netHistory:[], lastSeen:Date.now(),
    weather:'sunny', todayTags:[], todayMods:{ feeMult:1, tipMult:1, eventChance:null }, tomorrow:null, tomorrowFeeMult:1,
    reserved:null, reserveOn:true, usedReserved:false,
    task:null, resourceToday:{}, warnedToday:false, cbToday:false,
    todayArc:null, arcDone:false, phone:null, knock:null, forceEvent:null,
    rules:[], program:null, special:null, specialAnnounced:[], specialStats:{ deliveries:0, complaints:0 }, surgeRounds:[], nightDeliveries:0,
    extraDaily:0, newAccountDays:0, endingAvailable:null, shiftEnded:false, debt:0,
    usedNews:[], usedNotes:[], usedReviews:[], recentEvents:[],
    kmSince:0, serviceState:null, energy:CONFIG.energyMax,
    hayri:0, nebahat:0, ferhat:0, ferhatYield:0,
    phase:'start', dayClosed:false, log:[],
    week:{ deliveries:0, earned:0, tips:0, fuel:0, complaints:0, breaks:0, skips:0, events:0, best:null, specialCleared:false }
  };
}
let S = defaultState();
let selectedGoal = null;

/* Eski kayıtları yeni yapıya taşır; eksik alanları varsayılanlarla doldurur. Kozmetikler ve karakterler META'ya geçer. */
function migrate(o){
  const d = defaultState();
  const s = Object.assign(d, o);
  s.week = Object.assign(defaultState().week, o.week || {});
  s.todayMods = Object.assign(defaultState().todayMods, o.todayMods || {});
  if(!o.v || o.v < 8){
    if(Array.isArray(o.owned)) META.owned = Array.from(new Set([...META.owned, ...o.owned]));
    if(o.equipped) META.equipped = Object.assign(META.equipped, o.equipped);
    ['hayri','nebahat','ferhat'].forEach(k => { if(o[k]) META.chars[k] = Math.max(META.chars[k] || 0, o[k]); });
    s.goalBase = s.goalBase || (GOALS.find(g => g.id === s.goalId) || {}).price || s.goalPrice;
    s.v = 8;
  }
  return s;
}
function save(){ if(!S.goalId && S.day === 1 && S.phase === 'start') return; S.lastSeen = Date.now(); try{ localStorage.setItem(CONFIG.saveKey, JSON.stringify(S)); }catch(e){} saveMeta(); }
function load(){
  try{
    let r = localStorage.getItem(CONFIG.saveKey);
    if(!r){ for(const k of CONFIG.legacySaveKeys){ r = localStorage.getItem(k); if(r) break; } }
    if(r){ const o = JSON.parse(r); if(o && (o.goalId || o.day > 1 || o.phase !== 'start')) return migrate(o); }
  }catch(e){}
  return null;
}
function clearSave(){ try{ localStorage.removeItem(CONFIG.saveKey); CONFIG.legacySaveKeys.forEach(k => localStorage.removeItem(k)); }catch(e){} }

/* Olgular ve ilişkiler (içerik dosyaları build() içinde okur) */
const fact = k => META.facts[k];
const hasFact = k => !!META.facts[k];
function writeFact(k){ if(!META.facts[k]) META.facts[k] = { day:S.day, run:(META.runs||[]).length + 1 }; }
const rel = n => META.chars[n] || 0;
function arcState(arc){ if(!META.arcs[arc]) META.arcs[arc] = { step:1, due:null, defer:0, flags:{}, done:false }; return META.arcs[arc]; }
const hasKeepsake = id => META.keepsakes.includes(id);
