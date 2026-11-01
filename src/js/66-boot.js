/* ---------------- OLAY BAĞLAMA ---------------- */
$('btn-start').onclick = startGame;
$('btn-goal-go').onclick = () => { if(selectedGoal) chooseGoal(selectedGoal); };
$('btn-news-go').onclick = () => { if(S.shiftEnded) endDay(); else nextOrder(); };
$('btn-ev-next').onclick = () => {
  if(S.boxDelivered && currentEvent && currentEvent.id === 'kargo_ferhat'){ finishDelivery(); return; }
  if(S.current && S.current.skip){ S.rating = clamp(S.rating + (S.current.ratingDelta||0),1,5); S.money += S.current.extraMoney + S.current.tip - S.current.order.fuel; S.dayFuel += S.current.order.fuel; S.orderIdx++; renderHUD(); if(!checkFired()) nextOrder(); }
  else finishDelivery();
};
$('btn-res-next').onclick = () => { if(S.boxDelivered){ showWin(); return; } nextOrder(); };
$('btn-sleep').onclick = sleep;
$('btn-again').onclick = restart;
$('btn-fired-musti').onclick = newAccount;
$('btn-fired-quit').onclick = () => { bankRun('fired'); clearSave(); restart(); };
$('btn-continue').onclick = () => { const o = load(); if(!o) return; S = o; META.metrics.continues++; renderAllAvatars(); shownMoney = null; renderHUD(); showAway(); };
$('btn-away-go').onclick = resume;
$('btn-skip').onclick = skipRound;
$('btn-endshift').onclick = endShift;
$('btn-toggle-shop').onclick = () => { const w = $('de-shopwrap'); w.hidden = !w.hidden; if(!w.hidden) w.scrollIntoView({ behavior:'smooth', block:'start' }); };
$('btn-haptic').onclick = (e) => { e.stopPropagation(); Haptic.toggle(); renderHUD(); };
$('btn-week-go').onclick = () => { S.week = defaultState().week; S.day++; S.dayClosed = false; S.leakShown = false; startDay(); };
$('btn-sound').onclick = (e) => { e.stopPropagation(); Sfx.toggle(); renderHUD(); };
$('hud-day').onclick = openMahalle;
$('btn-mahalle-start').onclick = () => { returnScreen = 's-start'; renderMahalle(); show('s-mahalle'); };
$('btn-mahalle-back').onclick = () => { const back = returnScreen || 's-start'; returnScreen = null; const el = $(back); if(!el || back === 's-mahalle'){ resume(); return; } document.querySelectorAll('.screen').forEach(s => s.hidden = (s.id !== back)); $('hud').hidden = (back === 's-start'); };
$('scene').onclick = () => { if(S.phase === 's-ride' && performance.now() - rideStarted >= CONFIG.rideSkipAfterMs) arrive(); };
$('ride-text').onclick = $('scene').onclick;

/* Kaldığın yer: açık hikayeler, hava, sonra çevrimdışı gelir */
function showAway(){
  const hours = Math.min(CONFIG.idleCapHours, Math.max(0, (Date.now() - (S.lastSeen||Date.now())) / 3600000));
  const side = SHOP.find(x => x.id === META.equipped.side);
  const h = hours.toFixed(1).replace('.',',');
  const hook = tomorrowHook();
  let html = `<p><b>Gün ${S.day}</b> · ${wx().emoji} ${wx().name}${S.goalId ? ` · ${goal().emoji} ${S.taksitPaid}/${CONFIG.taksitCount} taksit` : ''}</p><p class="small">${esc(hook.hook)}</p>`;
  if(hours >= 0.25){
    if(side && side.id === 'side_cousin' && hasFact('musti_gone') && S.day < fact('musti_gone').day + 5){
      html += `<p class="small muted" style="margin-top:8px">${h} saat yoktun. Motor park halinde; Musti ortada yok, kira da yok.</p>`;
    } else if(side){
      const gross = Math.round(side.idle.perHour * hours), cut = Math.round(gross * side.idle.cut), net = gross - cut;
      S.money += net;
      html += `<div class="summary" style="margin-top:8px"><span>${esc(side.name)} · ${h} saat</span><span>+${fmt(gross)}</span><span>Kesinti (benzin, komisyon)</span><span style="color:var(--bad)">−${fmt(cut)}</span><span class="tot">Hesabına geçen</span><span class="tot" style="color:var(--good)">+${fmt(net)}</span></div>`;
    } else {
      S.energy = clamp(S.energy + 10, 0, CONFIG.energyMax);
      html += `<p class="small muted" style="margin-top:8px">${h} saat yoktun. Nebahat Teyze kapıya folyoda börek bırakmış, üstünde "ısıt" yazıyor. +10 enerji.</p>`;
    }
  }
  $('away-card').innerHTML = html;
  renderHUD(); show('s-away');
}
function resume(){
  if(S.phase === 's-fired' && S.firedReason) { showFired(S.firedReason); return; }
  if(S.phase === 's-week') { showWeek(); }
  else if(S.won || (!S.goalId && S.day > 1)) { restart(); }
  else if(S.dayClosed) { renderDayEnd(); show('s-dayend'); }
  else if(S.phase === 's-news') { renderBulletin(S.todayRoll || { newsIds:[] }, S.todayPriceCard || ''); show('s-news'); }
  else if(S.phase === 's-goal' || (S.day === 1 && S.orderIdx === 1 && !S.goalId)) { selectedGoal = null; renderGoals(); $('btn-goal-go').disabled = true; show('s-goal'); }
  else if(S.boxDelivered && S.phase === 's-result') { showWin(); }
  else if(S.orderIdx >= S.dayRounds) { endDay(); }
  else {
    // sürüş ya da olay ortasında kaldıysa: o siparişi geri al, turu yeniden teklif et
    if(S.current && (S.phase === 's-ride' || S.phase === 's-event')){ S.offered = Math.max(0, S.offered - 1); S.accepted = Math.max(0, S.accepted - 1); S.streak = Math.max(0, S.streak - 1); delete S.orderLog[S.orderIdx]; if(S.current.order && S.current.order.reserved) S.usedReserved = false; S.current = null; S.forceEvent = null; }
    nextOrder();
  }
}
function renderStart(){
  const saved = load();
  $('btn-continue').hidden = !saved;
  $('btn-start').textContent = saved ? 'Yeni koşu başlat' : 'Mesaiye Başla';
  $('btn-start').classList.toggle('primary', !saved); $('btn-start').classList.toggle('ghost', !!saved);
  const runs = META.runs.length;
  $('start-meta').textContent = runs ? `${runs} koşu · sonlar ${META.endings.length}/3 · Hayri Abi ${rel('hayri')} kez, Nebahat Teyze ${rel('nebahat')} kez` : '';
  $('btn-mahalle-start').hidden = !(runs || Object.keys(META.facts).length);
  if(saved) $('start-card').querySelector('p').textContent = `Gün ${saved.day}${saved.goalId ? `, ${(GOALS.find(g=>g.id===saved.goalId)||{}).name || ''}` : ''}. Kaldığın yerde Hayri Abi, Nebahat Teyze ve bir fiş bekliyor.`;
}
/* ---------------- BOOT ---------------- */
function boot(data){
  loadMeta();
  (META.unlockedRestaurants || []).forEach(r => { if(!RESTAURANTS.some(x => x.name === r.name)) RESTAURANTS.push(r); });
  renderAllAvatars();
  if(data && (data.goalId || data.day > 1)){ S = migrate(data); renderAllAvatars(); renderHUD(); resume(); return; }
  renderStart();
  show('s-start');
  if(location.protocol.startsWith('http') && 'serviceWorker' in navigator){ try{ navigator.serviceWorker.register('sw.js').catch(()=>{}); }catch(e){} }
}
const hot = window.claude && window.claude.hot;
if(hot && hot.snapshot){ try{ hot.snapshot(() => S); }catch(e){} }
if(hot && hot.ready){ hot.ready(boot); } else { boot(hot && hot.data); }
