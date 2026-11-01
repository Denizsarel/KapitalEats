/* ---------------- YARDIMCILAR ---------------- */
const $ = id => document.getElementById(id);
const fmt = n => Math.round(n).toLocaleString('tr-TR') + ' ₺';
const xfmt = n => String(+(+n).toFixed(2)).replace('.', ','); // çarpan: 1.6 → "1,6"
/* Cömert harcama (ilişki + eksi para) iç seste 'Başarısız' sayılmasın */
function voiceEffects(e){ e = e || {}; if(e.money < 0 && e.rel && Object.values(e.rel).some(v => v > 0) && !(e.rating < 0 || e.complaint || e.feeLost)) return Object.assign({}, e, { money:0 }); return e; }
const rnd = (a,b) => a + Math.random()*(b-a);
const rint = (a,b) => Math.floor(rnd(a,b+1));
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
function weightedPick(list){ const tot = list.reduce((s,x)=>s+(x.weight||1),0); let r = Math.random()*tot; for(const x of list){ r -= (x.weight||1); if(r<=0) return x; } return list[list.length-1]; }
const goal = () => GOALS.find(g=>g.id===S.goalId);
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
/* Hafıza olayı yardımcıları */
function memChoices(correct, wrongs, okOut, badOut){
  const list = [{ label: correct, ...okOut }, ...wrongs.slice(0,2).map(w => ({ label: w, ...badOut }))];
  return shuffle(list);
}
function decoyNums(correct, min, max, step=1){
  const out = new Set(); let tries = 0;
  while(out.size < 2 && tries++ < 50){ const n = correct + (Math.random()<0.5?-1:1) * step * rint(1,3); if(n !== correct && n >= min && n <= max) out.add(n); }
  while(out.size < 2){ out.add(min + step * out.size + (correct===min+step*out.size ? step*3 : 0)); }
  return [...out];
}
function decoyNames(correct){
  const out = new Set(); let tries = 0;
  while(out.size < 2 && tries++ < 50){ const n = pick(FIRST_NAMES) + ' ' + pick(SURNAME_INITIALS); if(n !== correct) out.add(n); }
  return [...out];
}
const acceptRate = () => S.offered ? S.accepted/S.offered : 1;
const wx = () => WEATHER[S.weather] || WEATHER.sunny;
const curHour = () => CONFIG.startHour + S.orderIdx * CONFIG.hoursPerRound;
const isNight = () => curHour() >= CONFIG.nightFrom;
const isWeekend = () => (S.day % 7 === 6 || S.day % 7 === 0);
const isMonday = () => S.day % 7 === 1 && S.day > 1;
const weekNo = (d) => Math.floor(((d || S.day) - 1) / 7) + 1;
const hourStr = () => String(curHour() % 24).padStart(2,'0') + ':00';
const wear = () => Math.min(100, Math.round(S.kmSince / CONFIG.serviceKm * 100));
const serviceQuote = () => CONFIG.serviceBase + wear() * CONFIG.serviceWearPrice;
/* Hatıra eşyaları (keepsake) sayıları burada okunur */
function P(key, base){
  switch(key){
    case 'floorEnergy': return hasKeepsake('hayri_key') ? base * 0.5 : base;
    case 'breakEnergy': return base + (hasKeepsake('hayri_glass') ? 10 : 0);
    case 'startEnergyBonus': return hasKeepsake('nebahat_bag') ? 10 : 0;
    case 'dailyExpense': return Math.max(0, base - (hasKeepsake('nuri_word') ? 40 : 0));
    case 'newAccountCost': return hasKeepsake('musti_id') ? 0 : base;
    default: return base;
  }
}
const energyCost = (o) => Math.round(CONFIG.energyBase + o.km * CONFIG.energyPerKm + P('floorEnergy', Math.max(0, (o.floor||1) - 3) * CONFIG.energyPerFloor) + (isNight() ? CONFIG.energyNight : 0) + (S.weather === 'rain' ? 4 : S.weather === 'snow' ? 9 : 0));
// Düşük enerji kötü sonuç ihtimalini artırır: enerji 0 → kötü sonuçlara +0,35
const badShift = () => Math.max(0, (40 - S.energy) / 40) * 0.35;
const slug = (t) => (t||'kurye').toLowerCase().replace(/ı/g,'i').replace(/ş/g,'s').replace(/ğ/g,'g').replace(/ç/g,'c').replace(/ö/g,'o').replace(/ü/g,'u').replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'') || 'kurye';
const COURIER_NAMES = ['Deniz','Umut','Eren','Yiğit','Cem','Ozan','Berk','Selin','Ece','Mert','Ali','Efe'];
const taksitSize = () => Math.max(0, Math.round((S.goalPrice - S.taksitPaidAmt) / Math.max(1, CONFIG.taksitCount - S.taksitPaid)));
const TAKSIT_STATUS = ['Sepette','Sipariş alındı','Hazırlanıyor','Kargoya verildi','Dağıtımda'];
const avgNet = () => { const h = S.netHistory.slice(-3); return h.length ? Math.round(h.reduce((a,b)=>a+b,0)/h.length) : 900; };

/* ---- Hissiyat: sayı akışı, uçan rakamlar, sarsıntı ---- */
function tweenNumber(el, from, to, ms=600){
  if(!el) return; const t0 = performance.now(); const d = to - from;
  if(!d || Math.abs(d) < 1){ el.textContent = fmt(to); return; }
  const step = (t) => { const k = Math.min(1, (t - t0)/ms); const e = 1 - Math.pow(1-k, 3); el.textContent = fmt(from + d*e); if(k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function pop(text, opts={}){
  const host = $('pops'); if(!host) return;
  const el = document.createElement('div'); el.className = 'pop' + (opts.neg ? ' neg' : '') + (opts.big ? ' big' : ''); el.textContent = text;
  const anchor = opts.at || $('hud-money'); const r = anchor ? anchor.getBoundingClientRect() : { left: 40, top: 80, width: 100 };
  if(!opts.big) el.style.left = Math.min(r.left + Math.min(r.width, 120) * 0.3 + (opts.dx||0), window.innerWidth - 140) + 'px'; el.style.top = (r.top + (opts.dy||0)) + 'px';
  host.appendChild(el); setTimeout(() => el.remove(), 1200);
}
function shake(){ const a = $('app'); if(!a) return; a.classList.remove('shake'); void a.offsetWidth; a.classList.add('shake'); }
let shownMoney = null;
function moneyChanged(){ const el = $('hud-money'); if(!el) return; const from = shownMoney == null ? S.money : shownMoney; tweenNumber(el, from, S.money); shownMoney = S.money; }
