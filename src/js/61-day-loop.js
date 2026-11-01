/* ---------------- BAŞLANGIÇ (soğuk açılış) ----------------
   Hedef seçilmeden başlanır: ilk fiş, ilk sürüş, Hayri Abi adını sorar, ilk ücret, sonra hedef reklamı. */
function startGame(){
  S = defaultState();
  S.name = ''; S.goalId = null; S.dayRounds = CONFIG.day1Rounds;
  META.metrics.sessions++;
  renderAllAvatars(); shownMoney = null; startDay();
}
function chooseGoal(id){
  const g = GOALS.find(x => x.id === id); if(!g) return;
  S.goalId = g.id; S.goalBase = g.price; S.goalPrice = g.price; S.taksitPaid = 0; S.taksitPaidAmt = 0; S.boxDelivered = false;
  renderHUD(); pop('Hedef seçildi', { big:true, at:$('hud-goalname') }); Haptic.task();
  nextOrder();
}

/* ---------------- GÜN AKIŞI ----------------
   rollDay(day): yarının haberini, havasını, özel gününü ve kuralını önceden çeker (YARIN kartı için). */
function rollDay(day){
  const r = { day, newsIds:[], weather:null, tags:[], mods:{ feeMult:1, tipMult:1, eventChance:null }, expense:0, special:null, rule:null, priceMult:1 };
  const g = goal(); const cat = g ? g.cat : 'all';
  let pool = NEWS.filter(n => (n.cat==='all' || n.cat===cat) && !S.usedNews.includes(n.id) && !(n.effect && n.effect.weather && day === 1));
  if(pool.length < 2){ S.usedNews = []; pool = NEWS.filter(n => n.cat==='all' || n.cat===cat); }
  const count = day === 1 ? 1 : (Math.random() < 0.3 ? 2 : 1);
  for(let i=0;i<count && pool.length;i++){ const n = pick(pool); r.newsIds.push(n.id); pool = pool.filter(x=>x!==n); S.usedNews.push(n.id);
    const e = n.effect || {}; if(e.weather) r.weather = e.weather; if(e.tags) r.tags.push(...e.tags); if(e.feeMult) r.mods.feeMult *= e.feeMult; if(e.tipMult) r.mods.tipMult *= e.tipMult; if(e.expense) r.expense += e.expense; if(e.priceMult) r.priceMult *= e.priceMult; if(e.eventChance !== undefined) r.mods.eventChance = e.eventChance; }
  // özel gün
  if(typeof SPECIAL_DAYS !== 'undefined' && CONFIG.specialDays.includes(day)){
    const seen = (S.specialAnnounced||[]); const cand = SPECIAL_DAYS.filter(s => !seen.includes(s.id) && !(s.id==='boykot' && rel('ferhat') < 2)) ; const sp = cand[0] || SPECIAL_DAYS[0];
    if(sp){ r.special = sp.id; const e = sp.effect || {}; if(e.weather) r.weather = e.weather; if(e.feeMult) r.mods.feeMult *= e.feeMult; if(e.tags) r.tags.push(...e.tags); if(e.eventChance !== undefined) r.mods.eventChance = e.eventChance; }
  }
  if(!r.weather) r.weather = day === 1 ? 'sunny' : weightedPick(Object.keys(WEATHER).map(k=>({k, weight:WEATHER[k].weight}))).k;
  // pazartesi kuralı
  if(typeof RULES !== 'undefined' && day % 7 === 1 && day > 1){ const rule = RULES.find(x => x.week === weekNo(day) && !S.rules.includes(x.id)); if(rule) r.rule = rule.id; }
  return r;
}

function startDay(){
  const roll = S.tomorrow && S.tomorrow.day === S.day ? S.tomorrow : rollDay(S.day);
  S.tomorrow = null;
  S.orderIdx = 0; S.orderLog = []; S.offers = []; S.current = null; S.dayEarned = 0; S.dayTips = 0; S.dayFuel = 0; S.dayCut = 0; S.dayTaskBonus = 0; S.dayDeliveries = []; S.dayReviews = []; S.shiftEnded = false;
  S.dayRounds = S.day === 1 ? CONFIG.day1Rounds : CONFIG.ordersPerDay;
  S.todayMods = { feeMult: roll.mods.feeMult * (S.tomorrowFeeMult || 1), tipMult: roll.mods.tipMult, eventChance: roll.mods.eventChance }; S.tomorrowFeeMult = 1;
  S.todayTags = roll.tags.slice(); S.weather = roll.weather; S.streak = 0; S.breakNext = false; S.usedNotes = []; S.resourceToday = {}; S.warnedToday = false; S.cbToday = false; S.nightDeliveries = 0; S.surgeRounds = [];
  S.energy = clamp(CONFIG.energyMax + P('startEnergyBonus', 0), 0, CONFIG.energyMax + 10);
  S.dayExpense = P('dailyExpense', CONFIG.dailyExpense) + S.extraDaily + roll.expense;
  if(S.newAccountDays > 0){ S.todayTags.push('yeni_hesap'); if(S.newAccountDays === 3) S.todayMods.feeMult *= 0.85; S.newAccountDays--; }
  // şikayet erimesi
  if(S.complaints > 0 && S.day - (S.lastComplaintDay||0) >= CONFIG.complaintDecayDays){ S.complaints--; S.lastComplaintDay = S.day; }
  // kurallar
  if(roll.rule && !S.rules.includes(roll.rule)) S.rules.push(roll.rule);
  const ruleEffects = activeRuleEffects();
  if(ruleEffects.feeMult) S.todayMods.feeMult *= ruleEffects.feeMult;
  if(ruleEffects.expense) S.dayExpense += ruleEffects.expense;
  if(ruleEffects.surge){ const a = rint(2, S.dayRounds), b = rint(2, S.dayRounds); S.surgeRounds = Array.from(new Set([a,b])); }
  // özel gün
  S.special = null;
  if(roll.special && typeof SPECIAL_DAYS !== 'undefined'){ const sp = SPECIAL_DAYS.find(s => s.id === roll.special); if(sp){ S.special = { id:sp.id, name:sp.name, emoji:sp.emoji, day:S.day, cleared:null }; S.specialStats = { deliveries:0, complaints:0 }; if(!S.specialAnnounced.includes(sp.id)) S.specialAnnounced.push(sp.id); } }
  else { const nextDay = CONFIG.specialDays.find(d => d > S.day); if(nextDay && nextDay - S.day <= 2 && typeof SPECIAL_DAYS !== 'undefined'){ const cand = SPECIAL_DAYS.filter(s => !S.specialAnnounced.includes(s.id) && !(s.id==='boykot' && rel('ferhat') < 2)); const sp = cand[0] || SPECIAL_DAYS[0]; if(sp) S.special = { id:sp.id, name:sp.name, emoji:sp.emoji, day:nextDay, announce:true }; } }
  // hedef fiyatı: sadece ödenmemiş kısım etkilenir; tavan var
  let priceCard = '';
  if(S.goalId && roll.priceMult !== 1){
    const old = S.goalPrice; const remaining = old - S.taksitPaidAmt;
    let np = Math.round((S.taksitPaidAmt + remaining * roll.priceMult) / 10) * 10;
    np = Math.min(np, Math.round(S.goalBase * CONFIG.goalInflationCap / 10) * 10); np = Math.max(np, S.taksitPaidAmt);
    S.goalPrice = np; const up = np > old;
    if(np !== old){ priceCard = `<div class="priceline"><span class="old">${fmt(old)}</span><span>→</span><span class="new" style="color:${up?'var(--bad)':'var(--good)'}">${fmt(np)}</span><span class="tag ${up?'up':'down'}">${up?'▲ vade farkı':'▼ indirim'} ${Math.round(Math.abs(roll.priceMult-1)*100)}%</span></div>`; setTimeout(()=>flashPrice(up), 50); }
  }
  // arklar ve görev
  scheduleArcs();
  S.task = pickTask();
  // eski müşteriler / müdavimler sayaçları
  S.returningUsedRound = -1;
  renderBulletin(roll, priceCard);
  renderHUD(); show('s-news');
  if(S.taksitPaid >= CONFIG.taksitCount && !EVENTS.some(e => e.id === 'kargo_ferhat')) { showWin(); }
}

function activeRuleEffects(){
  const out = {}; if(typeof RULES === 'undefined') return out;
  S.rules.forEach(id => { const r = RULES.find(x => x.id === id); if(!r) return; const e = r.effect || {}; Object.keys(e).forEach(k => { if(k === 'feeMult') out.feeMult = (out.feeMult||1) * e.feeMult; else if(k === 'expense') out.expense = (out.expense||0) + e.expense; else out[k] = e[k]; }); });
  if(S.program && typeof PROGRAMS !== 'undefined'){ const p = PROGRAMS.find(x => x.id === S.program); if(p && p.effect){ if(p.effect.feeMult) out.feeMult = (out.feeMult||1) * p.effect.feeMult; Object.keys(p.effect).forEach(k => { if(k !== 'feeMult') out[k] = p.effect[k]; }); } }
  return out;
}

/* Sabah bülteni: takvim, haberler, kural, özel gün, hava, görev, telefon (Musti) */
function renderBulletin(roll, priceCard){
  $('news-day').textContent = `GÜN ${S.day} · SABAH BÜLTENİ`;
  renderCalendar();
  const cards = [];
  if(S.day === 1 && S.account === 1){
    cards.push(`<div class="card news platform"><div class="kicker">KAPİTALEATS</div><h3>Hoş geldiniz! 🎉</h3><p class="muted">KapitalEats ailesine katıldığınız için çok mutluyuz. Unutmayın: siz bir çalışan değil, bir İş Ortağısınız! 💪 İlk siparişiniz hazır. Fişi dikkatle okuyun, kapıda sorulabilir.</p></div>`);
  }
  roll.newsIds.forEach(id => {
    const n = NEWS.find(x => x.id === id); if(!n) return; const e = n.effect || {}; const tags = [];
    if(e.feeMult) tags.push(`<span class="tag info">Bugün ücretler ×${e.feeMult}</span>`);
    if(e.tipMult) tags.push(`<span class="tag info">Bugün bahşiş ×${e.tipMult}</span>`);
    if(e.expense) tags.push(`<span class="tag up">Bugün ek gider +${fmt(e.expense)}</span>`);
    if(e.eventChance === 0) tags.push(`<span class="tag">Bugün olay yok</span>`);
    if(!Object.keys(e).length) tags.push(`<span class="tag">Etkisi yok. Şimdilik.</span>`);
    cards.push(`<div class="card news"><div class="kicker">${esc(n.kicker)}</div><h3>${esc(n.headline)}</h3><p class="muted">${esc(n.body)}</p>${e.priceMult ? priceCard : ''}<div class="delta">${tags.join('')}</div></div>`);
  });
  if(roll.rule && typeof RULES !== 'undefined'){ const r = RULES.find(x => x.id === roll.rule); if(r) cards.push(`<div class="card news platform"><div class="kicker">KULLANIM KOŞULLARI GÜNCELLENDİ</div><h3>${esc(r.title)}</h3><p class="muted">${esc(r.body)}</p><div class="delta"><span class="tag info">Madde ${S.rules.length + 13}/b · Kabul edilmiş sayılır</span></div></div>`); }
  if(S.special && typeof SPECIAL_DAYS !== 'undefined'){ const sp = SPECIAL_DAYS.find(s => s.id === S.special.id); if(sp){
    if(S.special.announce) cards.push(`<div class="card news"><div class="kicker">${S.special.day - S.day} GÜN SONRA</div><h3>${esc(sp.emoji||'⭐')} ${esc(sp.name)}</h3><p class="muted">${esc(sp.announce)}</p></div>`);
    else cards.push(`<div class="card news" style="border-left-color:var(--accent2)"><div class="kicker" style="color:var(--accent2)">BUGÜN ÖZEL GÜN</div><h3>${esc(sp.emoji||'⭐')} ${esc(sp.name)}</h3><p class="muted">${esc(sp.morning)}</p><div class="delta"><span class="tag info">Hedef: ${sp.target.deliveries} teslimat, en fazla ${sp.target.maxComplaints} şikayet</span>${sp.effect.feeMult?`<span class="tag info">Ücretler ×${sp.effect.feeMult}</span>`:''}</div></div>`);
  } }
  if(isWeekend() && S.day > 1){ S.todayTags.push('weekend'); S.todayMods.feeMult *= CONFIG.weekendFeeMult; cards.push(`<div class="card wxcard"><div class="ico">🎉</div><div><h3>Hafta sonu</h3><p class="muted small">Pijamalı kapılar, uzun siparişler, geç kahvaltılar. Ücretler yüksek.</p><div class="delta" style="margin-top:6px"><span class="tag info">Ücretler ×${CONFIG.weekendFeeMult}</span></div></div></div>`); }
  const w = wx(); S.todayMods.feeMult *= w.feeMult;
  cards.push(`<div class="card wxcard"><div class="ico">${w.emoji}</div><div><h3>Bugün hava: ${w.name}</h3><p class="muted small">${esc(w.blurb)}</p><div class="delta" style="margin-top:6px">${w.feeMult!==1?`<span class="tag info">Ücretler ×${w.feeMult}</span>`:''}${w.risk?`<span class="tag up">Olay riski ↑</span>`:''}</div></div></div>`);
  if(S.task) cards.push(taskHTML());
  if(S.todayArc && S.todayArc.mode === 'phone') cards.push(`<div id="phone-card"></div>`);
  $('news-list').innerHTML = cards.join('');
  if(S.todayArc && S.todayArc.mode === 'phone') renderPhoneCard();
}
function renderCalendar(){
  const cells = [];
  for(let i=0;i<7;i++){
    const d = S.day + i; const ics = [];
    if(d % 7 === 1 && d > 1 && typeof RULES !== 'undefined' && RULES.some(r => r.week === weekNo(d))) ics.push('📜');
    if(CONFIG.specialDays.includes(d)) ics.push('⭐');
    if(d % 7 === 0) ics.push('🏁');
    if(S.goalId && S.taksitPaid < CONFIG.taksitCount){ const need = taksitSize() - S.money; const daysTo = need <= 0 ? 0 : Math.ceil(need / Math.max(300, avgNet())); if(daysTo === i) ics.push('💳'); }
    if(i > 0 && wear() + i * 14 >= 100 && !ics.includes('🔧') && (wear() + (i-1) * 14 < 100)) ics.push('🔧');
    cells.push(`<div class="cell ${i===0?'today':''}"><b>${i===0?'Bugün':'G'+d}</b><div class="ic">${ics.join('')}</div></div>`);
  }
  $('calendar').innerHTML = cells.join('');
}

/* ---------------- GÖREV (Günün Görevi) ---------------- */
let TASK_RT = null;
function pickTask(){
  if(typeof TASKS === 'undefined' || !TASKS.length || S.day === 1) { TASK_RT = null; return null; }
  const fake = Math.random() < 0.25; let pool = TASKS.filter(t => !!t.fake === fake); if(!pool.length) pool = TASKS;
  const t = weightedPick(pool); let m; try{ m = t.make(S); }catch(e){ TASK_RT = null; return null; }
  if(!m || typeof m.test !== 'function') { TASK_RT = null; return null; }
  TASK_RT = { id:t.id, test:m.test };
  return { id:t.id, text:m.text, target:m.target || 1, reward: t.fake ? 0 : clamp(m.reward || 200, CONFIG.taskRewardMin, CONFIG.taskRewardMax), progress:0, done:false, fake:!!t.fake };
}
function ensureTaskRT(){ if(S.task && (!TASK_RT || TASK_RT.id !== S.task.id) && typeof TASKS !== 'undefined'){ const t = TASKS.find(x => x.id === S.task.id); if(t){ try{ const m = t.make(S); TASK_RT = { id:t.id, test:m.test }; }catch(e){ TASK_RT = null; } } } }
function track(kind, data){
  if(!S.task || S.task.done) return; ensureTaskRT(); if(!TASK_RT) return;
  let ok = false; try{ ok = !!TASK_RT.test(kind, data || {}); }catch(e){ ok = false; }
  if(!ok) return;
  S.task.progress++;
  if(S.task.progress >= S.task.target){ S.task.done = true; S.dayTaskBonus = S.task.reward; Sfx.task(); Haptic.task(); setTimeout(()=>pop(S.task.reward ? `Görev ✓ +${fmt(S.task.reward)}` : 'Görev ✓', { big:true }), 200); }
}
function taskHTML(){
  const t = S.task; if(!t) return '';
  const pct = clamp(t.progress / t.target * 100, 0, 100);
  return `<div class="task ${t.done?'done':''}" id="task-card"><div class="ico">🎯</div><div style="flex:1;display:grid;gap:4px"><div class="small"><b>Günün Görevi</b> · ${esc(t.text)}</div><div class="bar"><i style="width:${pct}%;background:${t.done?'var(--good)':'var(--accent2)'}"></i></div><div class="small muted">${t.done ? (t.reward ? `Tamamlandı · ${fmt(t.reward)} bonus gün sonunda` : 'Tamamlandı · Ödül: topluluğumuzun sevgisi 💙') : `${t.progress}/${t.target} · ${t.reward ? fmt(t.reward) + ' bonus' : 'Ödül: topluluğumuzun sevgisi 💙'}`}</div></div></div>`;
}

/* ---------------- ARKLAR: günün hikaye saati ---------------- */
function scheduleArcs(){
  S.todayArc = null; S.arcDone = false; S.phone = null; S.knock = null;
  if(typeof ARC_BEATS === 'undefined' || !ARC_BEATS.length) return;
  const arcs = Array.from(new Set(ARC_BEATS.map(b => b.arc)));
  const cands = [];
  arcs.forEach(arc => {
    const A = arcState(arc); if(A.done) return;
    const b = ARC_BEATS.find(x => x.arc === arc && x.step === A.step); if(!b){ A.done = true; return; }
    if(A.due == null) A.due = b.step === 1 ? (b.startDay || 2) : S.day;
    if(A.due > S.day) return;
    if(b.gate){ let ok = true; try{ ok = !!b.gate(S, A); }catch(e){ ok = true; } if(!ok){ A.due = S.day + 1; return; } }
    cands.push({ arc, b, A });
  });
  if(!cands.length) return;
  cands.sort((x,y) => (y.A.defer - x.A.defer) || (x.b.step - y.b.step) || (x.A.due - y.A.due));
  const c = cands[0];
  const maxRound = Math.max(2, Math.min(4, S.dayRounds - 2));
  S.todayArc = { arc:c.arc, step:c.b.step, mode:c.b.mode, round: c.b.mode === 'ticket' ? (S.day === 1 ? 1 : rint(2, maxRound)) : null };
}
const todayBeat = () => S.todayArc ? ARC_BEATS.find(b => b.arc === S.todayArc.arc && b.step === S.todayArc.step) : null;

/* ---------------- SİPARİŞ ÜRETİMİ ---------------- */
function addressFor(d){ const floor = rint(1,7), perFloor = rint(2,4); return { hood: pick(d.hoods), street: pick(d.streets), no: rint(2,48), building: pick(BUILDINGS), floor, apt: (floor-1)*perFloor + rint(1,perFloor) }; }
function restaurantsFor(districtName){ const all = RESTAURANTS.filter(r => r.areas.includes(districtName)); return all.length ? all : RESTAURANTS; }
function buildLines(r){
  const lines = []; let tries = 0;
  const n = Math.min(r.menu.length, Math.random() < 0.2 ? 1 : rint(2,4));
  while(lines.length < n && tries++ < 40){ const c = pick(r.menu); if(n === 1 && !c[3]) continue; if(lines.some(l=>l.name===c[1])) continue; lines.push({ emoji:c[0], name:c[1], price:c[2], qty: c[3] ? 1 : rint(1,3) }); }
  return lines;
}
function feeFor(km, bulk, roundIdx){
  let m = S.todayMods.feeMult * (isNight()?CONFIG.nightFeeMult:1) * (0.6 + 0.4*acceptRate());
  if(S.rating < 3.5) m *= CONFIG.lowRatingFeeMult;
  if(S.surgeRounds.includes((roundIdx == null ? S.orderIdx : roundIdx) + 1)) m *= 1.5;
  return Math.round((CONFIG.baseFee + km*CONFIG.feePerKm + bulk*CONFIG.bulkFee) * m * rnd(0.9,1.15));
}
function genOrder(opts={}){
  let r, d, addr, customer, note, regular = null, returning = null;
  if(opts.story){ // hikaye fişi: sabit adres
    const a = opts.story.address || {}; d = DISTRICTS.find(x => x.name === a.district) || pick(DISTRICTS); r = pick(restaurantsFor(d.name));
    addr = { hood:a.hood || pick(d.hoods), street:a.street || pick(d.streets), no:a.no || rint(2,48), building:a.building || pick(BUILDINGS), floor:a.floor || rint(1,7), apt:a.apt || rint(1,12) }; customer = a.customer || (pick(FIRST_NAMES) + ' ' + pick(SURNAME_INITIALS));
  } else if(opts.returning){ // eski müşteri
    returning = opts.returning; d = DISTRICTS.find(x => x.name === returning.district) || pick(DISTRICTS); r = pick(restaurantsFor(d.name));
    addr = { hood:returning.hood, street:returning.street, no:returning.no, building:returning.building, floor:returning.floor, apt:returning.apt }; customer = returning.customer;
  } else if(typeof REGULARS !== 'undefined' && REGULARS.length && Math.random() < CONFIG.regularChance && S.day > 1){ // müdavim
    regular = pick(REGULARS); d = DISTRICTS.find(x => x.hoods.includes(regular.hood)) || pick(DISTRICTS); r = pick(restaurantsFor(d.name));
    addr = addressFor(d); addr.hood = regular.hood; customer = regular.name;
  } else {
    r = pick(RESTAURANTS); d = DISTRICTS.find(x => x.name === pick(r.areas)) || pick(DISTRICTS); addr = addressFor(d); customer = pick(FIRST_NAMES) + ' ' + pick(SURNAME_INITIALS);
  }
  let km = rint(1, CONFIG.maxDistanceKm);
  if(hasKeepsake('ferhat_alley') && ['Kadıköy','Üsküdar'].includes(d.name)) km = Math.max(1, km - 1);
  if(S.special && S.special.day === S.day && S.special.id === 'kar') km = Math.max(5, km);
  const lines = buildLines(r);
  const total = lines.reduce((t,l)=>t+l.price*l.qty, 0), bulk = lines.reduce((t,l)=>t+l.qty, 0);
  const fee = Math.round(feeFor(km, bulk, opts.roundIdx) * (opts.feeMult || 1));
  if(regular && regular.note) note = { text: regular.note.replace('{floor}', addr.floor).replace('{apt}', addr.apt), key: regular.noteKey, value: regular.noteValue };
  else if(returning) note = { text: returning.lastGood ? pick(['Geçen seferki kurye gibi olsun lütfen.','Kapıyı biliyorsunuz zaten.','Yine siz misiniz? Güzel.']) : (returning.lastEvent && /KÖPEK/i.test(returning.lastEvent) ? 'Köpek yok artık. Lütfen paketi fırlatmayın.' : pick(['Bu sefer düzgün olsun.','Geçen sefer sorun yaşandı, dikkat.','Zile bir kere basın yeter.'])), key:null };
  else if(opts.story) note = { text: opts.note || '', key: opts.noteKey || null, value: opts.noteValue };
  else note = pickNote(addr);
  if(opts.noteKey){ const n = NOTES.find(x => x.key === opts.noteKey); if(n) note = { text: n.text.replace('{floor}', addr.floor).replace('{apt}', addr.apt), key:n.key, value:n.value }; }
  const blurbs = d.blurbs || null;
  return {
    rest:r.name, restTag:r.tag, lines, total, bulk, emoji: lines[0].emoji, customer,
    hood:addr.hood, street:addr.street, no:addr.no, building:addr.building, floor:addr.floor, apt:addr.apt,
    payment: Math.random() < 0.25 ? 'nakit' : 'online',
    district:d.name, districtDat:d.dat, districtTip:d.tip, blurb: blurbs ? (isNight() ? blurbs.night : blurbs.day) || d.blurb : d.blurb, km, fee, fuel: km*CONFIG.fuelPerKm,
    eta: 8 + km*3 + rint(0,6), note: note.text, noteKey: note.key, noteValue: note.value,
    story: opts.story ? opts.story.arc : null, returning: !!returning, returningNote: returning ? returning.lastEvent : null, voice: regular ? regular.voice : (returning ? returning.voice : null),
    surge: S.surgeRounds.includes(S.orderIdx + 1)
  };
}
function ticketHTML(o, idx){
  const tag = o.story ? `<div class="tagline">Tanıdık adres · ${esc(o.building)}</div>` : (o.returning ? `<div class="tagline ret">Geri dönen${o.returningNote ? ' · ' + esc(o.returningNote.toLowerCase()) : ''}</div>` : '');
  return `<div class="ticket pick ${o.story?'story-ticket':''}" data-i="${idx}">
    ${tag}<div class="rest">${esc(o.rest)}</div>
    <div class="note" style="margin:0 0 6px">${esc(o.restTag)}</div>
    <div class="items">${o.lines.map(l=>`<span><span>${l.emoji} ${l.qty}× ${esc(l.name)}</span><span>${fmt(l.price*l.qty)}</span></span>`).join('')}</div>
    <div class="addr"><b>${esc(o.customer)}</b> · ${esc(o.hood)}, ${esc(o.street)} No:${o.no} ${esc(o.building)}, Kat ${o.floor}, Daire ${o.apt}<br>${esc(o.district)} · ${o.km} km · ~${o.eta} dk</div>
    ${o.note ? `<div class="note" ${S.day===1 && S.orderIdx===0 ? 'style="background:#ffe9a8;padding:4px 6px;border-radius:4px"' : ''}>“${esc(o.note)}”</div>` : ''}
    <div class="meta"><div class="l">Sipariş tutarı ${fmt(o.total)}<br><span class="pay">${o.payment==='nakit'?'KAPIDA NAKİT':'ONLINE ÖDENDİ'}</span><br>Benzin ≈ −${fmt(o.fuel)} · Enerji ≈ −${energyCost(o)}</div><div style="text-align:right"><div class="fee">${fmt(o.fee)}</div>${o.surge?'<div class="surge">🔥 yoğunluk ×1,5</div>':''}${isNight()?'<div class="small" style="color:#8a1c1c;font-weight:700">🌙 gece ×'+CONFIG.nightFeeMult+'</div>':''}</div></div>
    <button class="take" data-i="${idx}">Bu siparişi al</button>
  </div>`;
}
function renderDots(){
  $('order-dots').innerHTML = Array.from({length:S.dayRounds},(_,i)=>`<i class="${S.orderLog[i]||''} ${i===S.orderIdx?'cur':''}"></i>`).join('');
}
function makeOffers(){
  if(S.day === 1 && S.orderIdx === 0){ // öğretici: tek fiş, Köfteci Yakup → Ayşe K., Moda
    const o = genOrder({ story:{ arc:null, address:{ district:'Kadıköy', hood:'Moda', street:'Moda Cad.', no:14, building:'Yıldız Apt.', floor:3, apt:7, customer:'Ayşe K.' } }, noteKey:'knock' });
    o.rest = 'Köfteci Yakup'; const r = RESTAURANTS.find(x => x.name === o.rest); if(r){ o.restTag = r.tag; o.lines = [{ emoji:r.menu[0][0], name:r.menu[0][1], price:r.menu[0][2], qty:1 }, { emoji:'🥛', name:'Ayran', price:50, qty:2 }]; o.total = o.lines.reduce((t,l)=>t+l.price*l.qty,0); }
    o.km = 2; o.fee = 212; o.fuel = 12; o.eta = 14; o.story = (S.todayArc && S.todayArc.arc === 'hayri' && S.todayArc.round === 1) ? 'hayri' : null; o.payment = 'online';
    return [o];
  }
  if(S.day === 1 && S.orderIdx === 1){ // öğretici: açık takas
    const a = genOrder({ noteKey:'knock' }), b = genOrder({ noteKey:'knock' });
    a.km = 2; a.fee = 150; a.fuel = 12; a.eta = 14; b.km = 8; b.fee = 290; b.fuel = 48; b.eta = 34; S.forceEvent = 'kapi_kac_kere';
    return [a, b];
  }
  const n = rint(CONFIG.offersPerRound[0], CONFIG.offersPerRound[1]);
  const offers = [];
  if(S.todayArc && S.todayArc.mode === 'ticket' && !S.arcDone && S.orderIdx + 1 === S.todayArc.round){ const beat = todayBeat(); if(beat) offers.push(genOrder({ story:{ arc:S.todayArc.arc, address:beat.address } })); }
  if(S.day > 1 && META.customers.length >= 3 && Math.random() < CONFIG.returningChance){ const c = pick(META.customers); offers.push(genOrder({ returning:c })); }
  while(offers.length < n) offers.push(genOrder());
  return offers;
}
function nextOrder(){
  if(S.orderIdx >= S.dayRounds || S.shiftEnded){ return endDay(); }
  if(S.breakNext){ return takeBreak(); }
  if(S.day === 1 && S.orderIdx === 1 && !S.goalId){ selectedGoal = null; renderGoals(); $('btn-goal-go').disabled = true; show('s-goal'); return; }
  if(S.reserved && S.reserveOn && !S.usedReserved && S.orderIdx === 0){ S.offers = [S.reserved]; S.usedReserved = true; S.current = null; renderOrderScreen(true); setTimeout(() => choose(0), 700); return; }
  S.offers = makeOffers(); S.current = null;
  renderOrderScreen(false);
}
function renderOrderScreen(auto){
  $('order-no').textContent = `Tur ${S.orderIdx+1}/${S.dayRounds} · ${hourStr()}${isNight()?' 🌙':''}`;
  renderDots();
  $('offers').innerHTML = S.offers.map(ticketHTML).join('');
  $('offers').querySelectorAll('.take').forEach(b => { b.disabled = !!auto; b.onclick = (ev) => { ev.stopPropagation(); choose(+b.dataset.i); }; });
  $('order-tip').hidden = !(S.day === 1 && S.orderIdx === 1);
  $('btn-endshift').hidden = !(S.orderIdx >= 2 && S.day > 1);
  let hint;
  if(S.day === 1 && S.orderIdx === 0) hint = 'Fişi oku. Kapıda sorulacak.';
  else if(auto) hint = 'Dün akşam ayırdığın sipariş. Motor zaten çalışıyor.';
  else if(S.task && !S.task.done && Math.random() < 0.67) hint = `Günün Görevi · ${esc(S.task.text)} · ${S.task.progress}/${S.task.target}`;
  else if(acceptRate() < 0.7 && S.offered >= 4) hint = 'Algoritma sana ucuz siparişleri gösteriyor. Tur geçmek bedava değildi.';
  else if(S.rating < 3.5) hint = 'Puanınız 3,5\'in altında. Fırsatlar sizin için yeniden sıralandı 💙';
  else if(S.streak >= CONFIG.streakBonusAt-1) hint = `${S.streak} teslimat üst üste. Bir tane daha: ${fmt(CONFIG.streakBonus)} Performans Bonusu! 🔥`;
  else if(isNight() && curHour() === CONFIG.nightFrom) hint = `Gece tarifesi başladı: ücretler ×${CONFIG.nightFeeMult} 🌙`;
  else if(S.energy < CONFIG.energyLow) hint = `Enerjin ${S.energy}. Dikkatin dağınık, her şey biraz daha riskli.`;
  else hint = pick(PLATFORM_MSGS);
  $('order-hint').innerHTML = `<b>🔔 KapitalEats</b><span>${hint}</span>`;
  $('btn-skip').disabled = auto || (S.day === 1 && S.orderIdx === 0);
  $('btn-skip').hidden = auto;
  Sfx.ding();
  renderHUD(); show('s-order');
}
function choose(i){
  const o = S.offers[i]; if(!o || S.current) return; // çift dokunma koruması
  S.current = { order:o, tip:0, extraMoney:0, feeLost:false, ratingDelta:0 };
  $('btn-skip').disabled = true;
  document.querySelectorAll('#offers .ticket').forEach((t,j) => {
    if(j === i){ const st = document.createElement('div'); st.className='stamp ok'; st.innerHTML='<span>KABUL</span>'; t.appendChild(st); }
    else t.classList.add('dim');
    t.querySelector('.take').disabled = true;
  });
  S.offered++; S.accepted++; S.streak++;
  S.orderLog[S.orderIdx] = 'ok';
  Sfx.stamp(); Haptic.stamp();
  track('accept', { km:o.km, district:o.district });
  setTimeout(ride, CONFIG.stampMs);
}
function skipRound(){
  S.offered++; S.streak = 0; S.week.skips++;
  S.orderLog[S.orderIdx] = 'no';
  document.querySelectorAll('#offers .ticket').forEach(t => { t.classList.add('dim'); const st = document.createElement('div'); st.className='stamp no'; st.innerHTML='<span>RED</span>'; t.appendChild(st); });
  $('btn-skip').disabled = true; Sfx.buzz();
  track('skip', {});
  if(S.todayArc && S.todayArc.mode === 'ticket' && S.orderIdx + 1 === S.todayArc.round && !S.arcDone){ const A = arcState(S.todayArc.arc); A.due = S.day + 1; A.defer++; S.todayArc = null; }
  setTimeout(()=>{ S.orderIdx++; if(!checkFired()) nextOrder(); }, 500);
}
function endShift(){ S.shiftEnded = true; endDay(); }
function takeBreak(){
  S.breakNext = false; S.streak = 0; S.week.breaks++; const gain = P('breakEnergy', CONFIG.breakEnergy); S.energy = clamp(S.energy + gain, 0, CONFIG.energyMax);
  S.orderLog[S.orderIdx] = 'break';
  S.money -= CONFIG.breakCost; S.dayExpense += CONFIG.breakCost;
  $('res-title').textContent = '☕ MOLA';
  $('res-summary').innerHTML = `<span>Çay + simit</span><span style="color:var(--bad)">−${fmt(CONFIG.breakCost)}</span><span>⚡ Enerji</span><span style="color:var(--good)">+${gain}</span><span class="tot">Kazanç</span><span class="tot">0 ₺</span>`;
  $('res-note').textContent = pick(['On bir dakika kimse aramadı. Çay ince belli bardakta, simit sıcak. Sonra telefon titreşti.','Büfenin önünde bir tabure, bir çay, bir kedi. Kedi simidin susamına talip, sen de kediye.','Çaycı "yine mi sen" dedi, gülümsedi, şekeri sormadan iki attı. Doğru bilmişti.']);
  track('break', {});
  $('res-task').hidden = true;
  S.orderIdx++;
  $('btn-res-next').textContent = S.orderIdx >= S.dayRounds ? 'Günü Bitir' : 'Sonraki Sipariş';
  renderHUD(); show('s-result');
}

/* ---------------- SÜRÜŞ ---------------- */
let rideTimer = null, rideStarted = 0;
function ride(){
  const o = S.current.order;
  $('ride-text').innerHTML = `<span class="dots-anim">${esc(o.districtDat)} gidiliyor</span><br><span class="muted">${o.km} km · ${esc(o.hood)} · ${isNight()?'🌙':wx().emoji}</span><span style="font-family:var(--body);font-size:14px;display:block;margin-top:10px;color:var(--fg)">${esc(o.blurb)}</span>`;
  const sc = $('scene'); sc.classList.toggle('rain', S.weather==='rain'); sc.classList.toggle('snow', S.weather==='snow');
  const h = curHour(); sc.classList.toggle('night', h >= CONFIG.nightFrom); sc.classList.toggle('dusk', h >= 17 && h < CONFIG.nightFrom); sc.classList.toggle('day', h < 17);
  renderAvatar($('ride-avatar'));
  $('ride-skip').hidden = true;
  show('s-ride'); Sfx.engineStart(); rideStarted = performance.now();
  const dur = S.day === 1 && S.orderIdx === 0 ? Math.max(CONFIG.rideMs, 2500) : CONFIG.rideMs;
  clearTimeout(rideTimer);
  setTimeout(() => { if(S.phase === 's-ride') $('ride-skip').hidden = false; }, CONFIG.rideSkipAfterMs);
  rideTimer = setTimeout(arrive, dur);
}
function arrive(){
  clearTimeout(rideTimer); rideTimer = null;
  if(S.phase !== 's-ride') return;
  Sfx.engineStop();
  const ev = pickEvent();
  if(ev) showEvent(ev); else finishDelivery();
}
