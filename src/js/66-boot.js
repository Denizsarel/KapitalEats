/* ---------------- OLAY BAĞLAMA ---------------- */
$('btn-start').onclick = startGame;
$('btn-news-go').onclick = () => { nextOrder(); };
$('btn-ev-next').onclick = () => { if(S.current.skip){ S.rating = clamp(S.rating + S.current.ratingDelta,1,5); S.money += S.current.extraMoney + S.current.tip - S.current.order.fuel; S.dayFuel += S.current.order.fuel; S.orderIdx++; renderHUD(); if(!checkWin() && !checkFired()) nextOrder(); } else finishDelivery(); };
$('btn-res-next').onclick = nextOrder;
$('btn-sleep').onclick = sleep;
$('btn-again').onclick = restart;
$('btn-fired-again').onclick = restart;
$('btn-continue').onclick = () => { const o = load(); if(!o) return; S = Object.assign(defaultState(), o); renderAllAvatars(); renderHUD(); showAway(); };
$('btn-away-go').onclick = resume;
$('btn-skip').onclick = skipRound;

/* Çevrimdışı gelir: son kayıttan bu yana geçen saat × yan gelir. Yan gelir yoksa 0 ₺ ve bir espri. */
function showAway(){
  const hours = Math.min(CONFIG.idleCapHours, Math.max(0, (Date.now() - (S.lastSeen||Date.now())) / 3600000));
  if(hours < 0.1) return resume();
  const side = SHOP.find(x => x.id === S.equipped.side);
  const h = hours.toFixed(1).replace('.',',');
  let html;
  if(side){
    const gross = Math.round(side.idle.perHour * hours), cut = Math.round(gross * side.idle.cut), net = gross - cut;
    S.money += net;
    html = `<p><b>${h} saat</b> yoktun. ${side.name} çalıştı.</p>
      <div class="summary"><span>Kazanç</span><span>+${fmt(gross)}</span><span>Kesinti (benzin, komisyon, "işletme gideri")</span><span style="color:var(--bad)">−${fmt(cut)}</span><span class="tot">Hesabına geçen</span><span class="tot" style="color:var(--good)">+${fmt(net)}</span></div>
      <p class="muted small">Hesap ${hours >= CONFIG.idleCapHours ? 'sadece 8 saat için işledi. Sonrası "sistem bakımı".' : 'dakikası dakikasına işledi. Bu sefer.'}</p>`;
  } else {
    html = `<p><b>${h} saat</b> yoktun. Hesabına geçen: <b>0 ₺</b>.</p>
      <p class="muted">Kapitalizm uyumaz ama sen uyudun. Dükkanda "Yan gelir" eşyaları var: motor sen yokken de çalışabilir.</p>`;
  }
  $('away-card').innerHTML = html;
  renderHUD(); show('s-away');
}

function resume(){
  // Kaldığı yere göre devam: sürüş/olay ortasındaysa siparişi yeniden göster.
  if(S.phase === 's-week') { showWeek(); }
  else if(S.dayClosed) { renderDaySummary(); renderService(); renderShop(); renderHUD(); show('s-dayend'); }
  else if(S.phase === 's-news') { show('s-news'); }
  else if(S.orderIdx >= CONFIG.ordersPerDay) { endDay(); }
  else { nextOrder(); }
}

/* ---------------- BOOT ---------------- */
function boot(data){
  renderGoals(); renderAllAvatars();
  $('name-input').placeholder = pick(COURIER_NAMES) + ' (boş bırakırsan biz seçeriz)';
  if(data && data.goalId){ S = Object.assign(defaultState(), data); renderAllAvatars(); renderHUD(); resume(); return; }
  // Eski sürüm kaydı varsa görmezden gel (yapı değişti)
  const saved = load();
  if(saved){ $('btn-continue').hidden = false; }
  show('s-start');
}
const hot = window.claude && window.claude.hot;
if(hot && hot.snapshot){ try{ hot.snapshot(() => S); }catch(e){} }
if(hot && hot.ready){ hot.ready(boot); } else { boot(hot && hot.data); }

