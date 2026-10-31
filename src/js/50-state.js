/* ---------------- DURUM ---------------- */
function defaultState(){
  return {
    goalId:null, goalPrice:0, money:CONFIG.startMoney, day:1, rating:CONFIG.startRating,
    offered:0, accepted:0, complaints:0, streak:0, breakNext:false,
    orderIdx:0, orderLog:[], offers:[], dayEarned:0, dayTips:0, dayFuel:0, dayExpense:0, lastSeen:Date.now(),
    weather:'sunny', todayTags:[], todayMods:{feeMult:1,tipMult:1},
    owned:['helmet_std','jacket_std','gloves_std','scooter_std','bag_std'],
    equipped:{helmet:'helmet_std',jacket:'jacket_std',gloves:'gloves_std',scooter:'scooter_std',bag:'bag_std', side:null},
    usedNews:[], recentEvents:[], current:null, phase:'start', dayClosed:false, log:[],
    hayri:0, nebahat:0, dayDeliveries:[], dayReviews:[],
    kmSince:0, ferhat:0, ferhatYield:0, serviceState:null, energy:100, name:'', usedNotes:[], usedReviews:[], gifts:[],
    week:{ deliveries:0, earned:0, tips:0, fuel:0, complaints:0, breaks:0, skips:0, events:0, best:null }
  };
}
let S = defaultState();
let selectedGoal = null;

function save(){ if(!S.goalId) return; /* başlangıç ekranı kaydın üstüne yazmasın */ S.lastSeen = Date.now(); try{ localStorage.setItem(CONFIG.saveKey, JSON.stringify(S)); }catch(e){} }
function load(){ try{ const r = localStorage.getItem(CONFIG.saveKey); if(r){ const o = JSON.parse(r); if(o && o.goalId) return o; } }catch(e){} return null; }
function clearSave(){ try{ localStorage.removeItem(CONFIG.saveKey); }catch(e){} }

