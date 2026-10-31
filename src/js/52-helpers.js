/* ---------------- YARDIMCILAR ---------------- */
const $ = id => document.getElementById(id);
const fmt = n => Math.round(n).toLocaleString('tr-TR') + ' ₺';
const rnd = (a,b) => a + Math.random()*(b-a);
const rint = (a,b) => Math.floor(rnd(a,b+1));
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
function weightedPick(list){ const tot = list.reduce((s,x)=>s+(x.weight||1),0); let r = Math.random()*tot; for(const x of list){ r -= (x.weight||1); if(r<=0) return x; } return list[list.length-1]; }
const goal = () => GOALS.find(g=>g.id===S.goalId);
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
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
const hourStr = () => String(curHour() % 24).padStart(2,'0') + ':00';
const wear = () => Math.min(100, Math.round(S.kmSince / CONFIG.serviceKm * 100));
const energyCost = (o) => Math.round(CONFIG.energyBase + o.km * CONFIG.energyPerKm + (isNight() ? CONFIG.energyNight : 0) + (S.weather === 'rain' ? 4 : S.weather === 'snow' ? 9 : 0));
// Düşük enerji kötü sonuç ihtimalini artırır: enerji 0 → kötü sonuçlara +0,35
const badShift = () => Math.max(0, (40 - S.energy) / 40) * 0.35;
const slug = (t) => (t||'kurye').toLowerCase().replace(/ı/g,'i').replace(/ş/g,'s').replace(/ğ/g,'g').replace(/ç/g,'c').replace(/ö/g,'o').replace(/ü/g,'u').replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'') || 'kurye';
const COURIER_NAMES = ['Deniz','Umut','Eren','Yiğit','Cem','Ozan','Berk','Selin','Ece','Mert','Ali','Efe'];
const serviceQuote = () => CONFIG.serviceBase + wear() * CONFIG.serviceWearPrice;

