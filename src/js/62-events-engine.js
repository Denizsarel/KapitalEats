/* ---------------- OLAYLAR ---------------- */
function eligible(e){
  if(e.minDay && S.day < e.minDay) return false;
  if(e.weather && !e.weather.includes(S.weather)) return false;
  const tagsNow = S.todayTags.concat(isNight() ? ['night'] : ['day']);
  if(e.tags && !e.tags.some(t => tagsNow.includes(t))) return false;
  if(e.km && (S.current.order.km < e.km[0] || S.current.order.km > e.km[1])) return false;
  if(e.condition && !e.condition(S, S.current.order)) return false;
  return true;
}
function pickEvent(){
  const pool = EVENTS.filter(eligible);
  const forced = pool.filter(e => e.priority);
  if(forced.length) return weightedPick(forced);
  // Hava riski mesafeyle büyür: 9 km karda olay neredeyse kesin.
  const risk = CONFIG.eventChance + wx().risk * 2 * (S.current.order.km / CONFIG.maxDistanceKm);
  if(Math.random() > risk) return null;
  let fresh = pool.filter(e => !S.recentEvents.includes(e.id));
  if(!fresh.length) fresh = pool;
  return fresh.length ? weightedPick(fresh) : null;
}
function showEvent(ev){
  S.recentEvents.unshift(ev.id); S.recentEvents = S.recentEvents.slice(0, CONFIG.recentEventMemory);
  S.current.eventId = ev.id;
  // Dinamik olaylar siparişin detaylarından (ad, daire, tutar...) metin ve seçenek üretir.
  const built = ev.build ? ev.build(S.current.order, S) : { text: ev.text, choices: ev.choices };
  const choices = built.choices;
  $('ev-title').textContent = ev.title;
  $('ev-stage').textContent = [ev.stage, wx().emoji + ' ' + wx().name, S.current.order.district].filter(Boolean).join(' · ');
  $('ev-text').textContent = built.text;
  $('ev-result').hidden = true;
  $('ev-choices').hidden = false;
  $('ev-choices').innerHTML = choices.map((c,i)=>`<button class="btn" data-i="${i}">${c.label}</button>`).join('');
  $('ev-choices').querySelectorAll('button').forEach(b => b.onclick = () => resolveChoice(ev, choices[+b.dataset.i]));
  show('s-event');
}
function resolveChoice(ev, choice){
  let out = choice;
  if(choice.outcomes){
    // Düşük enerji: kötü sonuçların (negatif etkili) şansı artar.
    const isBadOut = (oc) => { const e = oc.effects||{}; return (e.money<0)||(e.rating<0)||e.feeLost||e.complaint; };
    const shift = badShift();
    const weights = choice.outcomes.map(oc => Math.max(0.01, oc.chance + (isBadOut(oc) ? shift : -shift)));
    const tot = weights.reduce((x,y)=>x+y,0); let r = Math.random()*tot; out = choice.outcomes[choice.outcomes.length-1];
    for(let i=0;i<choice.outcomes.length;i++){ r -= weights[i]; if(r <= 0){ out = choice.outcomes[i]; break; } }
  }
  const d = applyEffects(out.effects || {});
  $('ev-choices').hidden = true;
  $('ev-result-text').textContent = out.result || '';
  const v = innerVoice(out.effects, ev.id);
  if(v && v.kind === 'fail') Sfx.buzz(); else if(v) Sfx.coin();
  $('ev-voice').hidden = !v;
  if(v){ $('ev-voice').className = 'voice ' + v.kind; $('ev-voice').innerHTML = `<b>[${v.q[0]} · ${v.kind==='fail'?'Başarısız':'Başarılı'}]</b> ${v.q[1]}`; }
  $('ev-delta').innerHTML = d.map(x => `<span class="${x.v>=0?'plus':'minus'}">${x.t}</span>`).join('');
  $('ev-result').hidden = false;
  $('btn-ev-next').textContent = S.current.skip ? 'Devam' : 'Teslim Et';
  S.log.unshift(`G${S.day} · ${ev.title}: ${choice.label.replace(/^\S+\s/,'')}`);
  renderHUD();
}
function applyEffects(e){
  const c = S.current, o = c.order, d = [];
  if(e.tip){ const t = Math.round(e.tip * S.todayMods.tipMult); c.tip += t; d.push({t:`+${fmt(t)} bahşiş`, v:1}); }
  if(e.tipPct){ const t = Math.round(o.fee * e.tipPct * S.todayMods.tipMult); c.tip += t; d.push({t:`+${fmt(t)} bahşiş`, v:1}); }
  if(e.money){ c.extraMoney += e.money; d.push({t:`${e.money>0?'+':''}${fmt(e.money)}`, v:e.money}); }
  if(e.feeLost){ c.feeLost = true; d.push({t:`Ücret ödenmedi (−${fmt(o.fee)})`, v:-1}); }
  if(e.rating){ c.ratingDelta += e.rating; d.push({t:`${e.rating>0?'+':''}${e.rating.toFixed(1)} ⭐`, v:e.rating}); }
  if(e.complaint){ c.ratingDelta -= 0.3; S.offered += 1; S.complaints += 1; S.week.complaints += 1; d.push({t:`Müşteri şikayeti (${S.complaints}/${CONFIG.maxComplaints})`, v:-1}); }
  if(e.goalPrice){ const old = S.goalPrice; S.goalPrice = Math.round(old*e.goalPrice/10)*10; d.push({t:`Hedef fiyatı ${fmt(old)} → ${fmt(S.goalPrice)}`, v: e.goalPrice>1?-1:1}); flashPrice(e.goalPrice>1); }
  if(e.breakNext){ S.breakNext = true; d.push({t:'☕ Sonraki sipariş: mola', v:0}); }
  if(e.expense){ S.dayExpense = Math.max(0, S.dayExpense + e.expense); d.push({t:`Günlük gider ${e.expense<0?'−':'+'}${fmt(Math.abs(e.expense))}`, v:-e.expense}); }
  if(e.hayri){ S.hayri = (S.hayri||0) + e.hayri; }
  if(e.ferhat){ S.ferhat = (S.ferhat||0) + 1; if(e.ferhat === 'yield') S.ferhatYield = (S.ferhatYield||0) + 1; }
  if(e.wearSet !== undefined){ S.kmSince = Math.round(CONFIG.serviceKm * e.wearSet / 100); d.push({t:`🔧 Aşınma %${e.wearSet}`, v:1}); }
  if(e.wearAdd){ S.kmSince += Math.round(CONFIG.serviceKm * e.wearAdd / 100); d.push({t:`🔧 Aşınma +%${e.wearAdd}`, v:-1}); }
  if(e.nebahat !== undefined){ S.nebahat = (S.nebahat||0) + e.nebahat; }
  if(e.complaint) c.bad = true;
  if(e.feeLost) c.bad = true;
  if(e.streakReset){ S.streak = 0; }
  if(e.energy){ S.energy = clamp(S.energy + e.energy, 0, CONFIG.energyMax); if(e.energy > 0) c.energyGain = (c.energyGain||0) + e.energy; d.push({t:`⚡ ${e.energy>0?'+':''}${e.energy}`, v:e.energy}); }
  if(e.giftItem){ const pool = SHOP.filter(x => !S.owned.includes(x.id) && x.price > 0 && x.price <= 2800 && x.slot !== 'side'); if(pool.length){ const g = pick(pool); S.owned.push(g.id); S.equipped[g.slot] = g.id; S.gifts.push(g.id); renderAllAvatars(); d.push({t:`🎁 ${g.name}`, v:1}); } else { c.extraMoney += 100; d.push({t:'+100 ₺ (Hayri Abi\'nin cebinden)', v:1}); } }
  if(e.skipDelivery){ c.skip = true; }
  return d;
}

