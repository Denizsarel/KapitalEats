/* ---------------- OLAYLAR ---------------- */
const RESOURCE_EVENTS = { enerji_bitiyor:'enerji', bayildin:'enerji', motor_ariza:'motor' };
function eligible(e){
  if(e.minDay && S.day < e.minDay) return false;
  if(e.weather && !e.weather.includes(S.weather)) return false;
  const tagsNow = S.todayTags.concat(isNight() ? ['night'] : ['day']);
  if(e.tags && !e.tags.some(t => tagsNow.includes(t))) return false;
  if(e.km && (S.current.order.km < e.km[0] || S.current.order.km > e.km[1])) return false;
  if(e.requires && !e.requires.every(hasFact)) return false;
  if(e.forbids && e.forbids.some(hasFact)) return false;
  if(RESOURCE_EVENTS[e.id] && S.resourceToday[RESOURCE_EVENTS[e.id]]) return false;
  if(e.condition){ try{ if(!e.condition(S, S.current.order)) return false; }catch(err){ return false; } }
  return true;
}
/* Motor yedeği: Hayri Abi arkı yüklenmemişse ilk gün adını soran tek kart */
const ENGINE_NAME_BEAT = { arc:'hayri', step:1, mode:'ticket', dueGap:2, hook:'Hayri Abi oğlundan mektup var dedi.', hookShort:"Hayri'nin mektubu",
  build: (o, S) => ({ title:'KAPICI DAİRESİ', text:'Kapıcı dairesinin kapısı aralık, içeriden çay kokusu geliyor. Ellilerinde, bıyıklı, elinde ince belli bardak. "Hayri. Otuz bir yıldır buradayım, bina benim sayılır, o ayrı. Sen yenisin. Adın ne oğlum?"',
    choices:[ { label:'Adını söyle', result:'Bir kere daha söyledi, ağzına oturtur gibi. "Asansör sağda. Kuryeye yasak ama ilk günün, görmedim."', effects:{ rel:{hayri:1}, rating:0.1 } } ] }) };
function arcEventFor(arc, step){
  const beat = (typeof ARC_BEATS !== 'undefined' && ARC_BEATS.find(b => b.arc === arc && b.step === step)) || (arc === 'hayri' && step === 1 ? ENGINE_NAME_BEAT : null);
  return beat ? { id:'arc_'+arc, arc, beat, title:'', stage:'Mahalle' } : null;
}
function pickEvent(){
  const o = S.current.order;
  // 1) hikaye: bu sipariş hikaye fişiyse ya da ertelenmiş bir ark varsa
  if(S.todayArc && !S.arcDone){
    const A = arcState(S.todayArc.arc), beat = todayBeat() || (S.todayArc.arc === 'hayri' && S.todayArc.step === 1 ? ENGINE_NAME_BEAT : null);
    const fires = (S.todayArc.mode === 'ticket' && (o.story === S.todayArc.arc || A.defer >= 1)) || (S.todayArc.mode === 'ride' && beat && (o.km >= (beat.minKm || 0) || A.defer >= 1));
    if(fires){ const ev = arcEventFor(S.todayArc.arc, S.todayArc.step); if(ev) return ev; }
  }
  if(S.day === 1 && S.orderIdx === 0 && !S.arcDone && S.todayArc == null){ const ev = arcEventFor('hayri', 1); if(ev){ S.todayArc = { arc:'hayri', step:1, mode:'ticket', round:1 }; return ev; } }
  // 2) öğretici zorlaması
  if(S.forceEvent){ const ev = EVENTS.find(e => e.id === S.forceEvent); S.forceEvent = null; if(ev) return ev; }
  const pool = EVENTS.filter(eligible);
  const forced = pool.filter(e => e.priority);
  if(forced.length) return weightedPick(forced);
  // 3) şans: hava riski mesafeyle büyür; haber günün olay şansını sabitleyebilir
  const base = S.todayMods.eventChance != null ? S.todayMods.eventChance : CONFIG.eventChance;
  const risk = base === 0 ? 0 : base + wx().risk * 2 * (o.km / CONFIG.maxDistanceKm);
  if(Math.random() > risk) return null;
  let fresh = pool.filter(e => !S.recentEvents.includes(e.id));
  if(!fresh.length) fresh = pool;
  if(!fresh.length) return null;
  const weighted = fresh.map(e => ({ e, weight: (e.weight || 1) * (META.seenEvents[e.id] ? 1 : CONFIG.unseenWeight) }));
  return weightedPick(weighted).e;
}
let currentEvent = null, currentBuilt = null;
function showEvent(ev){
  currentEvent = ev;
  const o = S.current.order;
  let built;
  if(ev.beat){ const A = arcState(ev.arc); try{ built = ev.beat.build(o, S, A); }catch(err){ console.error('arc build', err); return finishDelivery(); } S.arcDone = true; }
  else {
    S.recentEvents.unshift(ev.id); S.recentEvents = S.recentEvents.slice(0, CONFIG.recentEventMemory);
    if(RESOURCE_EVENTS[ev.id]) S.resourceToday[RESOURCE_EVENTS[ev.id]] = 1;
    if(ev.id === 'destek_uyari') S.warnedToday = true;
    try{ built = ev.build ? ev.build(o, S) : { text: ev.text, choices: ev.choices }; }catch(err){ console.error('event build', err); return finishDelivery(); }
  }
  if(!built || !built.choices || !built.choices.length) return finishDelivery();
  currentBuilt = built;
  S.current.eventId = ev.beat ? ev.arc : ev.id;
  $('ev-title').textContent = built.title || ev.title || '';
  $('ev-stage').textContent = [ev.beat ? 'Mahalle' : ev.stage, wx().emoji + ' ' + wx().name, o.district].filter(Boolean).join(' · ');
  $('ev-text').textContent = built.text;
  $('ev-name').hidden = !(ev.beat && !S.name); $('ev-name').value = '';
  $('ev-result').hidden = true; $('ev-choices').hidden = false;
  $('ev-choices').innerHTML = built.choices.map((c,i)=>`<button class="btn" data-i="${i}">${esc(c.label)}</button>`).join('');
  $('ev-choices').querySelectorAll('button').forEach(b => b.onclick = () => resolveChoice(ev, +b.dataset.i));
  show('s-event');
}
function pickOutcome(choice){
  if(!choice.outcomes) return choice;
  const isBadOut = (oc) => { const e = oc.effects||{}; return (e.money<0)||(e.rating<0)||e.feeLost||e.complaint; };
  const shift = badShift();
  const weights = choice.outcomes.map(oc => Math.max(0.01, oc.chance + (isBadOut(oc) ? shift : -shift)));
  const tot = weights.reduce((x,y)=>x+y,0); let r = Math.random()*tot;
  for(let i=0;i<choice.outcomes.length;i++){ r -= weights[i]; if(r <= 0) return choice.outcomes[i]; }
  return choice.outcomes[choice.outcomes.length-1];
}
function resolveChoice(ev, idx){
  let built = currentBuilt;
  // Adını yeni söylediyse metinler yeniden kurulsun (Hayri'nin repliğinde adı geçsin)
  if(ev.beat && !S.name){ const typed = ($('ev-name').value || '').trim(); S.name = typed || pick(COURIER_NAMES); try{ built = ev.beat.build(S.current.order, S, arcState(ev.arc)); }catch(e){} $('ev-name').hidden = true; }
  const choice = built.choices[idx] || currentBuilt.choices[idx];
  const out = pickOutcome(choice);
  if(ev.beat) S.arcCtx = arcState(ev.arc);
  const d = applyEffects(out.effects || {});
  S.arcCtx = null;
  // destek uyarısı: itiraz %40 bir şikayeti arşivler
  if(ev.id === 'destek_uyari' && /itiraz/i.test(choice.label)){ if(Math.random() < 0.4 && S.complaints > 0){ S.complaints--; d.push({t:'Şikayet arşivlendi', v:1}); } else d.push({t:'İtiraz reddedildi', v:-1}); }
  if(ev.id === 'kargo_ferhat') S.boxDelivered = true;
  if(ev.beat) advanceArc(ev.arc, ev.beat, choice);
  else { (META.seenEvents[ev.id] = META.seenEvents[ev.id] || []).push(idx); track('event', { eventId: ev.id, label: choice.label }); }
  $('ev-choices').hidden = true;
  $('ev-result-text').textContent = out.result || '';
  const v = innerVoice(voiceEffects(out.effects), ev.beat ? ev.arc : ev.id);
  if(v && v.kind === 'fail'){ Sfx.buzz(); Haptic.bad(); } else if(v){ Sfx.coin(); }
  $('ev-voice').hidden = !v;
  if(v){ $('ev-voice').className = 'voice ' + v.kind; $('ev-voice').innerHTML = `<b>[${esc(v.q[0])} · ${v.kind==='fail'?'Başarısız':'Başarılı'}]</b> ${esc(v.q[1])}`; }
  $('ev-delta').innerHTML = d.map(x => `<span class="${x.v>=0?'plus':'minus'}">${esc(x.t)}</span>`).join('');
  $('ev-result').hidden = false;
  $('btn-ev-next').textContent = S.current.skip ? 'Devam' : 'Teslim Et';
  S.log.unshift(`G${S.day} · ${built.title || ev.title}: ${choice.label}`);
  if(ev.beat) META.storyLog.push({ day:S.day, arc:ev.arc, step:ev.beat.step, label:choice.label });
  const e = out.effects || {}; if(e.feeLost || e.complaint || (e.money && e.money <= -200)) shake();
  renderHUD();
}
function advanceArc(arc, beat, choice){
  const A = arcState(arc);
  if(beat.final || (choice.final)) { A.done = true; }
  else { A.step = beat.step + 1; A.due = S.day + (beat.dueGap || 2); }
  A.defer = 0; S.arcDone = true;
  META.chars[arc] = META.chars[arc] || 0;
  saveMeta();
}
/* Etkiler. Teslimat bağlamında S.current üzerinden; telefon/kapı kartlarında doğrudan kasaya işler. */
function applyEffects(e){
  const c = S.current || { order:{ fee:0, floor:1 }, tip:0, extraMoney:0, standalone:true }, o = c.order || { fee:0 }, d = [];
  if(e.tip){ const t = Math.round(e.tip * S.todayMods.tipMult); c.tip += t; d.push({t:`+${fmt(t)} bahşiş`, v:1}); }
  if(e.tipPct){ const t = Math.round(o.fee * e.tipPct * S.todayMods.tipMult); c.tip += t; d.push({t:`+${fmt(t)} bahşiş`, v:1}); }
  if(e.money){ c.extraMoney += e.money; d.push({t:`${e.money>0?'+':''}${fmt(e.money)}`, v:e.money}); }
  if(e.feeLost){ c.feeLost = true; d.push({t:`Ücret ödenmedi (−${fmt(o.fee)})`, v:-1}); }
  if(e.rating){ c.ratingDelta = (c.ratingDelta||0) + e.rating; d.push({t:`${e.rating>0?'+':''}${e.rating.toFixed(1)} ⭐`, v:e.rating}); }
  if(e.complaint){ const dbl = activeRuleEffects().complaintsDouble ? 2 : 1; c.ratingDelta = (c.ratingDelta||0) - 0.3; S.offered += 1; S.complaints += dbl; S.lastComplaintDay = S.day; S.week.complaints += 1; if(S.special && S.special.day === S.day) S.specialStats.complaints++; d.push({t:`Müşteri şikayeti (${S.complaints}/${CONFIG.maxComplaints})`, v:-1}); c.bad = true; }
  if(e.goalPrice && S.goalId){ const old = S.goalPrice; S.goalPrice = Math.min(Math.round(old*e.goalPrice/10)*10, Math.round(S.goalBase*CONFIG.goalInflationCap/10)*10); d.push({t:`Hedef fiyatı ${fmt(old)} → ${fmt(S.goalPrice)}`, v: e.goalPrice>1?-1:1}); flashPrice(e.goalPrice>1); }
  if(e.breakNext){ S.breakNext = true; d.push({t:'☕ Sonraki tur: mola', v:0}); }
  if(e.expense){ S.dayExpense = Math.max(0, S.dayExpense + e.expense); d.push({t:`Günlük gider ${e.expense<0?'−':'+'}${fmt(Math.abs(e.expense))}`, v:-e.expense}); }
  if(e.expenseDaily){ S.extraDaily += e.expenseDaily; d.push({t:`Kira payı ${e.expenseDaily>0?'+':'−'}${fmt(Math.abs(e.expenseDaily))}/gün`, v:-e.expenseDaily}); }
  if(e.hayri){ META.chars.hayri += e.hayri; S.hayri = (S.hayri||0) + e.hayri; }
  if(e.nebahat !== undefined){ META.chars.nebahat += e.nebahat; S.nebahat = (S.nebahat||0) + e.nebahat; }
  if(e.ferhat){ META.chars.ferhat += 1; S.ferhat = (S.ferhat||0) + 1; if(e.ferhat === 'yield') S.ferhatYield = (S.ferhatYield||0) + 1; }
  if(e.rel){ Object.keys(e.rel).forEach(k => { META.chars[k] = (META.chars[k]||0) + e.rel[k]; d.push({t:`${CHAR_NAME[k]||k} ${e.rel[k]>0?'+':''}${e.rel[k]}`, v:e.rel[k]}); }); }
  if(e.sets && S.arcCtx){ Object.assign(S.arcCtx.flags, e.sets); }
  if(e.fact){ writeFact(e.fact); }
  if(e.keepsake && !META.keepsakes.includes(e.keepsake)){ META.keepsakes.push(e.keepsake); d.push({t:`Hatıra: ${KEEPSAKE_NAME[e.keepsake]||e.keepsake}`, v:1}); Sfx.tada(); Haptic.big(); }
  if(e.unlockRestaurant && e.unlockRestaurant.name && !RESTAURANTS.some(r => r.name === e.unlockRestaurant.name)){ RESTAURANTS.push(e.unlockRestaurant); META.unlockedRestaurants.push(e.unlockRestaurant); d.push({t:`Yeni restoran: ${e.unlockRestaurant.name}`, v:1}); }
  if(e.ending){ S.endingAvailable = e.ending; d.push({t:'Yeni bir son açıldı', v:1}); }
  if(e.wearSet !== undefined){ S.kmSince = Math.round(CONFIG.serviceKm * e.wearSet / 100); d.push({t:`🔧 Aşınma %${e.wearSet}`, v:1}); }
  if(e.wearAdd){ S.kmSince += Math.round(CONFIG.serviceKm * e.wearAdd / 100); d.push({t:`🔧 Aşınma +%${e.wearAdd}`, v:-1}); }
  if(e.feeLost) c.bad = true;
  if(e.streakReset){ S.streak = 0; }
  if(e.energy){ S.energy = clamp(S.energy + e.energy, 0, CONFIG.energyMax); if(e.energy > 0) c.energyGain = (c.energyGain||0) + e.energy; d.push({t:`⚡ ${e.energy>0?'+':''}${e.energy}`, v:e.energy}); }
  if(e.giftItem){ const pool = SHOP.filter(x => !META.owned.includes(x.id) && x.price > 0 && x.price <= 2800 && x.slot !== 'side' && !x.hidden); const ferhat = SHOP.find(x => x.id === 'helmet_ferhat'); const g = (S.arcCtx && S.arcCtx === META.arcs.ferhat && ferhat && !META.owned.includes('helmet_ferhat')) ? ferhat : (pool.length ? pick(pool) : null); if(g){ META.owned.push(g.id); META.equipped[g.slot] = g.id; META.gifts.push(g.id); renderAllAvatars(); d.push({t:`🎁 ${g.name}`, v:1}); } else { c.extraMoney += 100; d.push({t:'+100 ₺', v:1}); } }
  if(e.skipDelivery){ c.skip = true; }
  if(c.standalone){ S.money += (c.tip||0) + (c.extraMoney||0); if(c.ratingDelta) S.rating = clamp(S.rating + c.ratingDelta, Math.max(1, (S.dayStartRating||5) - 1), 5); }
  return d;
}
/* Telefon kartı (Musti) sabah bülteninde; kapı kartı (Nuri Bey) gün sonunda. Aynı yapı, farklı kap. */
function renderArcCard(hostId, kind){
  const host = $(hostId); if(!host || !S.todayArc || S.arcDone) { if(host) host.innerHTML = ''; return; }
  const beat = todayBeat(); if(!beat) return;
  const A = arcState(S.todayArc.arc); let built; try{ built = beat.build({ fee:0, floor:1, district:'', lines:[{name:''}] }, S, A); }catch(e){ console.error('arc card', e); return; }
  const who = CHAR_NAME[S.todayArc.arc] || '';
  const inner = kind === 'phone'
    ? `<div class="phone"><div class="from">💬 ${esc(who)} · ${S.day === 1 ? 'şimdi' : 'sabah 08:14'}</div><div class="sms">${esc(built.text)}</div><div class="actions one" id="${hostId}-choices">${built.choices.map((c,i)=>`<button class="btn" data-i="${i}">${esc(c.label)}</button>`).join('')}</div><div id="${hostId}-result" hidden></div></div>`
    : `<div class="card accent"><div class="event-title">${esc(built.title)}</div><div class="stage">${esc(who)} · kapıda</div><p class="event-text" style="margin-top:8px">${esc(built.text)}</p><div class="actions one" id="${hostId}-choices" style="margin-top:10px">${built.choices.map((c,i)=>`<button class="btn" data-i="${i}">${esc(c.label)}</button>`).join('')}</div><div id="${hostId}-result" hidden></div></div>`;
  host.innerHTML = inner;
  host.querySelectorAll('button').forEach(b => b.onclick = () => {
    const choice = built.choices[+b.dataset.i]; const out = pickOutcome(choice);
    S.arcCtx = A; const saved = S.current; S.current = null; const d = applyEffects(out.effects || {}); S.current = saved; S.arcCtx = null;
    advanceArc(S.todayArc.arc, beat, choice);
    META.storyLog.push({ day:S.day, arc:S.todayArc.arc, step:beat.step, label:choice.label });
    const v = innerVoice(voiceEffects(out.effects), S.todayArc.arc);
    $(hostId+'-choices').hidden = true;
    $(hostId+'-result').innerHTML = `<div class="result-box" style="margin-top:8px">${esc(out.result||'')}</div>${v?`<div class="voice ${v.kind}" style="margin-top:6px"><b>[${esc(v.q[0])} · ${v.kind==='fail'?'Başarısız':'Başarılı'}]</b> ${esc(v.q[1])}</div>`:''}<div class="delta" style="margin-top:6px">${d.map(x=>`<span class="${x.v>=0?'plus':'minus'}">${esc(x.t)}</span>`).join('')}</div>`;
    $(hostId+'-result').hidden = false;
    if(kind === 'knock') renderYarin();
    renderHUD(); save();
  });
}
function renderPhoneCard(){ renderArcCard('phone-card', 'phone'); }
