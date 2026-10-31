#!/usr/bin/env node
// İçerik doğrulayıcı: veri dosyalarını (src/js/3*,4*) motor olmadan yükler, şemaları ve yazım kurallarını denetler.
//   node tools/validate-content.js            → rapor; sert hatalarda çıkış kodu 1
const fs = require('fs'), path = require('path'), vm = require('vm');
const dir = path.join(__dirname, '..', 'src', 'js');
const files = fs.readdirSync(dir).filter(f => /^(3|4)\d-.*\.js$/.test(f)).sort();
const code = files.map(f => `// ---- ${f}\n` + fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
const stubs = `
const pick = a => a[0]; const rint = (a,b) => a; const rnd = (a,b) => a; const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const fmt = n => Math.round(n).toLocaleString('tr-TR') + ' ₺'; const shuffle = a => a;
const memChoices = (c, w, ok, bad) => [{label:c, ...ok}, ...w.slice(0,2).map(x=>({label:x, ...bad}))];
const decoyNums = () => [1,2]; const decoyNames = () => ['A B.','C D.'];
const wear = () => 40; const isNight = () => false; const isWeekend = () => false; const curHour = () => 14;
const wx = () => ({name:'Güneşli', emoji:'☀️', risk:0, feeMult:1});
const META = { chars:{hayri:0,nebahat:0,ferhat:0,musti:0,nuri:0}, arcs:{}, facts:{}, customers:[], keepsakes:[], endings:[], runs:[] };
const fact = k => META.facts[k]; const hasFact = k => !!META.facts[k]; const rel = n => META.chars[n]||0;
const S = { day:3, money:3000, rating:4.4, energy:70, streak:2, complaints:0, weather:'sunny', todayTags:[], orderIdx:2, goalId:'termos', goalPrice:9500, taksitPaid:1, account:1, name:'Deniz', program:null, rules:[], hayri:1, nebahat:1, ferhat:1, ferhatYield:0, kmSince:40, breakNext:false, week:{} };
`;
const ctx = vm.createContext({ console, Math, JSON, Date, String, Number, Array, Object, RegExp, Set, Map, window:{}, localStorage:{getItem(){return null}, setItem(){}, removeItem(){}}, document:{} });
const errors = [], warns = [];
try { vm.runInContext(stubs + '\n' + code + '\n;globalThis.__out = { EVENTS, ARC_BEATS: typeof ARC_BEATS!=="undefined"?ARC_BEATS:[], TASKS: typeof TASKS!=="undefined"?TASKS:[], SPECIAL_DAYS: typeof SPECIAL_DAYS!=="undefined"?SPECIAL_DAYS:[], RULES: typeof RULES!=="undefined"?RULES:[], PROGRAMS: typeof PROGRAMS!=="undefined"?PROGRAMS:[], DISTRICTS, RESTAURANTS, NOTES, PLATFORM_MSGS, INNER_VOICE, REVIEWS, SHOP, S, META };', ctx, { filename: 'content.js' }); }
catch (e) { console.error('LOAD ERROR:', e.message); process.exit(1); }
const O = ctx.__out;
const EMOJI = /\p{Extended_Pictographic}/u;
const words = s => String(s).trim().split(/\s+/).filter(Boolean).length;
const ALLOWED = new Set(['money','tip','tipPct','rating','feeLost','complaint','energy','expense','breakNext','streakReset','wearSet','wearAdd','goalPrice','giftItem','skipDelivery','rel','sets','fact','keepsake','unlockRestaurant','ending','expenseDaily','hayri','nebahat','ferhat']);
const KEEPSAKES = new Set(['hayri_key','hayri_glass','nebahat_bag','ferhat_alley','nuri_word','musti_id']);
const sampleOrder = { rest:'Köfteci Yakup', restTag:'', lines:[{emoji:'🥩',name:'Köfte porsiyon',price:460,qty:1}], total:460, customer:'Ayşe K.', hood:'Moda', street:'Moda Cad.', no:14, building:'Yıldız Apt.', floor:3, apt:7, payment:'nakit', district:'Kadıköy', districtDat:"Kadıköy'e", km:4, fee:150, fuel:24, note:'', noteKey:'knock', noteValue:3, story:null };
function checkChoices(where, choices){
  if(!Array.isArray(choices) || choices.length < 2 || choices.length > 3) return errors.push(`${where}: 2-3 seçenek gerekir (${choices && choices.length})`);
  choices.forEach((c,i) => {
    if(!c.label) errors.push(`${where}: seçenek ${i} label yok`);
    else { if(EMOJI.test(c.label)) errors.push(`${where}: label emoji içeriyor: "${c.label}"`); if(c.label.length > 34) warns.push(`${where}: label uzun (${c.label.length}): "${c.label}"`); }
    const outs = c.outcomes || [c];
    if(c.outcomes){ const tot = c.outcomes.reduce((t,o)=>t+(o.chance||0),0); if(Math.abs(tot-1) > 0.011) errors.push(`${where}: outcomes toplamı ${tot.toFixed(2)} (1 olmalı)`); }
    outs.forEach(o => {
      if(o.result && words(o.result) > 75) warns.push(`${where}: result ${words(o.result)} kelime (≤70)`);
      Object.keys(o.effects || {}).forEach(k => { if(!ALLOWED.has(k)) errors.push(`${where}: bilinmeyen etki "${k}"`); });
      if(o.effects && o.effects.keepsake && !KEEPSAKES.has(o.effects.keepsake)) errors.push(`${where}: bilinmeyen keepsake ${o.effects.keepsake}`);
    });
  });
}
// EVENTS
const ids = new Set();
O.EVENTS.forEach(e => {
  if(ids.has(e.id)) errors.push(`EVENTS: tekrar id ${e.id}`); ids.add(e.id);
  let built; try { built = e.build ? e.build(sampleOrder, O.S) : { text:e.text, choices:e.choices }; } catch(err){ return errors.push(`EVENTS ${e.id}: build hata: ${err.message}`); }
  if(!built || !built.choices) return errors.push(`EVENTS ${e.id}: choices yok`);
  checkChoices(`EVENTS ${e.id}`, built.choices);
  if(built.text && words(built.text) > 80) warns.push(`EVENTS ${e.id}: metin ${words(built.text)} kelime`);
});
// ARC_BEATS
const byArc = {};
O.ARC_BEATS.forEach(b => (byArc[b.arc] = byArc[b.arc] || []).push(b));
Object.entries(byArc).forEach(([arc, beats]) => {
  beats.sort((a,b)=>a.step-b.step);
  beats.forEach((b,i) => {
    const w = `ARC ${arc}#${b.step}`;
    if(b.step !== i+1 && !beats.some(x => x.step === i+1)) errors.push(`${w}: adımlar ardışık değil`);
    if(b.step === 1 && !b.startDay) errors.push(`${w}: step 1 için startDay gerekir`);
    if(!['ticket','ride','phone','knock'].includes(b.mode)) errors.push(`${w}: mode geçersiz (${b.mode})`);
    if(b.mode === 'ticket'){ if(!b.address) errors.push(`${w}: ticket için address gerekir`); else if(!O.DISTRICTS.some(d => d.name === b.address.district)) errors.push(`${w}: ilçe yok: ${b.address.district}`); }
    if(b.mode === 'ride' && !b.minKm) warns.push(`${w}: ride için minKm önerilir`);
    if(!b.hookShort || b.hookShort.length > 24) errors.push(`${w}: hookShort yok ya da >24 (${b.hookShort && b.hookShort.length})`);
    if(!b.hook || b.hook.length > 95) errors.push(`${w}: hook yok ya da >90`);
    if(typeof b.dueGap !== 'number') errors.push(`${w}: dueGap sayı olmalı`);
    const A = { step:b.step, due:3, defer:0, flags:{} };
    let built; try { built = b.build(sampleOrder, O.S, A); } catch(err){ return errors.push(`${w}: build hata: ${err.message}`); }
    if(!built || !built.title || !built.text) return errors.push(`${w}: build title/text döndürmedi`);
    if(built.title.length > 30) warns.push(`${w}: başlık uzun`);
    if(words(built.text) > 80) warns.push(`${w}: metin ${words(built.text)} kelime (≤70)`);
    checkChoices(w, built.choices);
  });
  if(!beats.some(b => b.final)) errors.push(`ARC ${arc}: final:true olan beat yok`);
  if(beats.length < 4) warns.push(`ARC ${arc}: sadece ${beats.length} beat`);
});
// TASKS
O.TASKS.forEach(t => {
  const w = `TASK ${t.id}`;
  let m; try { m = t.make(O.S); } catch(err){ return errors.push(`${w}: make hata ${err.message}`); }
  if(!m || !m.text || !m.target || typeof m.test !== 'function') errors.push(`${w}: make {text,target,reward,test} döndürmeli`);
  else { if(m.text.length > 70) warns.push(`${w}: text uzun`); if(!t.fake && !(m.reward > 0)) errors.push(`${w}: reward > 0 olmalı`); }
});
// SPECIAL / RULES
O.SPECIAL_DAYS.forEach(s => { if(!s.id || !s.name || !s.effect || !s.target || !s.announce || !s.morning) errors.push(`SPECIAL ${s.id}: eksik alan`); });
O.RULES.forEach(r => { if(!r.id || !r.week || !r.title || !r.body || !r.effect) errors.push(`RULE ${r.id}: eksik alan`); });
// Style lint over string literals of content files
const strings = []; code.replace(/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g, (m, q, s) => { if(s.length > 20 && /[a-zçğıöşü]/i.test(s)) strings.push(s); return m; });
const sentences = strings.flatMap(s => s.split(/(?<=[.!?…])\s+/).filter(x => x.trim()));
const stat = (n, d) => d ? Math.round(n/d*100) : 0;
const short = sentences.filter(s => words(s) <= 3).length, long = sentences.filter(s => words(s) >= 15).length;
const dedi = (code.match(/ dedi[.,"' ]/g) || []).length, kap = (code.match(/kapitaliz/gi) || []).length;
const banned = ['Sen değilsin.','Kaydet.','belli değil','bilinmiyor','ikiniz de biliyorsunuz'].map(b => [b, (code.split(b).length-1)]).filter(x => x[1]);
const emojiLabels = (code.match(/label:\s*['"`]\s*\p{Extended_Pictographic}/gu) || []).length;
const report = { files, events:O.EVENTS.length, arcs:Object.fromEntries(Object.entries(byArc).map(([k,v])=>[k,v.length])), tasks:O.TASKS.length, special:O.SPECIAL_DAYS.length, rules:O.RULES.length,
  style:{ sentences:sentences.length, short3words_pct:stat(short,sentences.length), long15words_pct:stat(long,sentences.length), dedi_count:dedi, kapitalizm_count:kap, banned, emoji_labels:emojiLabels },
  errors, warns };
console.log(JSON.stringify(report, null, 1));
if(kap) errors.push('"kapitalizm" metinde geçiyor');
process.exit(errors.length ? 1 : 0);
