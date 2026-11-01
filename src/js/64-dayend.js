/* ---------------- GÜN SONU ---------------- */
function endDay(){
  S.money -= S.dayExpense;
  if(S.task && S.task.done && S.task.reward){ S.money += S.task.reward; }
  if(S.debt > 0){ const pay = Math.min(S.debt, 170, Math.max(0, S.money)); S.debt -= pay; S.money -= pay; S.debtPaidToday = pay; } else S.debtPaidToday = 0;
  const net = S.dayEarned + S.dayTips - S.dayFuel - S.dayCut - S.dayExpense + (S.task && S.task.done ? S.task.reward : 0);
  S.lastNet = net; S.isRecord = S.netHistory.length >= 1 && net > Math.max(...S.netHistory); S.netHistory.push(net); if(S.netHistory.length > 30) S.netHistory.shift();
  // özel gün sonucu
  if(S.special && S.special.day === S.day && typeof SPECIAL_DAYS !== 'undefined'){ const sp = SPECIAL_DAYS.find(s => s.id === S.special.id); if(sp){ const ok = S.specialStats.deliveries >= sp.target.deliveries && S.specialStats.complaints <= sp.target.maxComplaints; S.special.cleared = ok; if(ok){ S.week.specialCleared = true; if(S.complaints > 0) S.complaints--; writeFact('special_'+sp.id); } else if(S.goalId){ S.goalPrice = Math.min(Math.round(S.taksitPaidAmt + (S.goalPrice - S.taksitPaidAmt) * 1.05), Math.round(S.goalBase * CONFIG.goalInflationCap)); } } }
  // gece kotası
  const ruleFx = activeRuleEffects(); S.tomorrowFeeMult = (ruleFx.nightQuota && S.nightDeliveries < ruleFx.nightQuota) ? 0.9 : 1;
  // ark ertelemesi: bugün ateşlenmediyse yarına kalır
  if(S.todayArc && !S.arcDone && S.todayArc.mode !== 'knock'){ const A = arcState(S.todayArc.arc); A.due = S.day + 1; A.defer++; }
  S.dayClosed = true;
  S.dayReviews = makeReviews(); S.serviceState = null;
  S.tomorrow = rollDay(S.day + 1);
  S.reserved = makeReserved(S.tomorrow); S.usedReserved = false;
  if(META.metrics.maxDay < S.day) META.metrics.maxDay = S.day;
  renderDayEnd(); show('s-dayend');
  Haptic.task(); if(S.isRecord) Sfx.tada();
  // ilk gün: kurulum önerisi (platform diliyle)
  if(S.day === 1) setTimeout(() => pop('Gün 1 tamamlandı', { big:true }), 300);
}
function makeReserved(roll){
  if(!roll || S.day < 1) return null;
  const saveMods = S.todayMods, saveW = S.weather, saveIdx = S.orderIdx;
  S.todayMods = Object.assign({}, roll.mods); S.weather = roll.weather; S.orderIdx = 0;
  let o = null; try{ o = genOrder({ feeMult: CONFIG.reservedFeeMult }); }catch(e){ o = null; }
  S.todayMods = saveMods; S.weather = saveW; S.orderIdx = saveIdx;
  return o;
}
function renderDayEnd(){
  // kutlama
  const net = S.lastNet || 0, prev = S.netHistory.length >= 2 ? S.netHistory[S.netHistory.length-2] : null;
  const cmp = prev == null ? 'İlk gün defteri açıldı.' : (prev === 0 ? '' : `Dünden ${net >= prev ? '+' : ''}${Math.round((net - prev) / Math.max(1, Math.abs(prev)) * 100)}%`);
  let specialLine = '';
  if(S.special && S.special.day === S.day && typeof SPECIAL_DAYS !== 'undefined'){ const sp = SPECIAL_DAYS.find(x => x.id === S.special.id); if(sp) specialLine = `<div class="small" style="margin-top:4px;color:${S.special.cleared?'var(--good)':'var(--bad)'}">${esc(sp.emoji||'⭐')} ${esc(sp.name)}: ${esc(S.special.cleared ? sp.clearText : sp.failText)}</div>`; }
  $('de-celebrate').innerHTML = `<div class="small muted">GÜN ${S.day} · ${S.shiftEnded ? 'vardiya erken bitti' : 'vardiya bitti'}</div><div class="net" id="de-net">${fmt(0)}</div><div class="cmp">${esc(cmp)}</div>${S.isRecord ? '<div class="rec">REKOR GÜN</div>' : ''}${specialLine}${dayMomentHTML()}`;
  setTimeout(() => tweenNumber($('de-net'), 0, net, 900), 100);
  renderDaySummary(); renderTaksit(); renderKnock(); renderEnding(); renderService(); renderShop(); renderYarin(); renderHUD();
  $('de-shopwrap').hidden = true; $('btn-toggle-shop').textContent = `Usta Cemil ve Dükkan${wear() >= 70 ? ' · 🔧 bakım gerekiyor' : ''}`;
}
function dayMomentHTML(){
  const d = S.dayDeliveries; if(!d.length) return '';
  const best = d.slice().sort((a,b) => (b.tip + (b.delta>0?50:0)) - (a.tip + (a.delta>0?50:0)))[0];
  const line = best.tip > 60 ? `${best.customer} bahşişi fişin arasına katlamış. ${fmt(best.tip)}.` : best.delta > 0 ? `${best.customer} kapıda bir saniye fazla durdu, puan verdi.` : best.bad ? `${best.customer} şikayet etti. Yemek: ${best.item.replace(/\s*\(.*?\)/,'')}.` : `${d.length} kapı, ${d.length} "buyrun". ${best.rest} en sıcak gelen oldu.`;
  return `<div class="voice ok" style="text-align:left;margin-top:6px"><b>[GÜNÜN ANI]</b> ${esc(line)}</div>`;
}
function renderDaySummary(){
  const acc = S.orderLog.filter(x=>x==='ok').length;
  $('de-summary').innerHTML = `
    <span>Teslimat</span><span>${acc}/${S.dayRounds}</span>
    <span>Kazanılan ücret</span><span>+${fmt(S.dayEarned)}</span>
    <span>Bahşiş</span><span>+${fmt(S.dayTips)}</span>
    ${S.dayCut?`<span>Kurye Katkı Payı</span><span style="color:var(--bad)">−${fmt(S.dayCut)}</span>`:''}
    ${S.task && S.task.done ? `<span>Görev bonusu</span><span style="color:var(--good)">+${fmt(S.task.reward)}</span>` : (S.task ? `<span class="muted small">Görev tamamlanmadı</span><span class="muted small">${esc(S.task.text)}</span>` : '')}
    <span>Benzin</span><span style="color:var(--bad)">−${fmt(S.dayFuel)}</span>
    <span>Günlük gider (simit, çay, motor${S.extraDaily?', kira payı':''})</span><span style="color:var(--bad)">−${fmt(S.dayExpense)}</span>
    ${S.debtPaidToday?`<span>Musti'ye borç</span><span style="color:var(--bad)">−${fmt(S.debtPaidToday)}</span>`:''}
    <span class="tot">Kasa</span><span class="tot">${fmt(S.money)}</span>
    ${S.goalId?`<span class="muted small">Sonraki taksit</span><span class="muted small">${S.taksitPaid>=CONFIG.taksitCount?'ödendi':fmt(taksitSize())}</span>`:''}`;
  const rv = S.dayReviews || [];
  $('de-reviews').innerHTML = rv.length ? `<h2>Bugünkü Yorumlar</h2>` + rv.map(r => `<div class="review"><div class="who">${esc(r.name)} <span class="muted">· ${pick(['az önce','1 saat önce','2 saat önce','bugün'])}</span></div><div>${esc(r.text)}</div></div>`).join('')
    : `<h2>Bugünkü Yorumlar</h2><div class="review muted">Bugün kimse yorum yazmadı.</div>`;
}
/* Taksit: oyuncu ne zaman ödeyeceğine karar verir */
function renderTaksit(){
  const host = $('de-taksit'); if(!S.goalId || S.taksitPaid >= CONFIG.taksitCount){ host.innerHTML = S.goalId && S.taksitPaid >= CONFIG.taksitCount && !S.boxDelivered ? `<div class="card platform news"><div class="kicker">KARGO TAKİP</div><h3>Paketiniz dağıtımda 📦</h3><p class="muted">Kuryeniz: Ferhat. Tahmini teslimat: yarın, ilk teslimatınızda. Kapıda olun 💙</p></div>` : ''; return; }
  const size = taksitSize(); const can = S.money >= size;
  host.innerHTML = `<div class="card taksitbtn"><div class="small"><b>${goal().emoji} ${esc(goal().name)}</b> · ${S.taksitPaid}/${CONFIG.taksitCount} taksit ödendi · Kargo durumu: ${TAKSIT_STATUS[S.taksitPaid]}</div><div class="small muted">Sonraki taksit ${fmt(size)}${can ? '' : ` · ${fmt(size - S.money)} eksik, ortalama günle ${Math.max(1, Math.ceil((size - S.money)/Math.max(300, avgNet())))} gün`}</div><button class="btn ${can?'primary':'ghost'}" id="btn-taksit" ${can?'':'disabled'}>Taksit öde (${fmt(size)})</button></div>`;
  const b = $('btn-taksit'); if(b) b.onclick = payTaksit;
}
function payTaksit(){
  const size = taksitSize(); if(S.money < size) return;
  S.money -= size; S.taksitPaidAmt += size; S.taksitPaid++;
  Sfx.tada(); Haptic.big(); pop('ÖDENDİ', { big:true, at:$('hud-goalname') });
  if(S.taksitPaid >= CONFIG.taksitCount){ S.taksitPaidAmt = S.goalPrice; if(!EVENTS.some(e => e.id === 'kargo_ferhat')){ showWin(); return; } }
  renderDaySummary(); renderTaksit(); renderYarin(); renderHUD(); save();
}
function renderKnock(){ const host = $('de-knock'); host.innerHTML = ''; if(S.todayArc && S.todayArc.mode === 'knock' && !S.arcDone) renderArcCard('de-knock', 'knock'); }
function renderEnding(){
  const host = $('de-ending'); host.innerHTML = '';
  if(S.endingAvailable === 'borek' && S.goalId && S.money >= S.goalPrice * 0.6){
    host.innerHTML = `<div class="card" style="border-color:var(--accent2)"><b>Bir başka son</b><p class="small muted" style="margin-top:4px">Nebahat Teyze'nin mutfağı açık, kasanda hedefin yarısından fazlası var. Hedefi bırakıp bu parayı mutfağa koyabilirsin. Story olmaz, beğeni olmaz.</p><button class="btn ghost" id="btn-borek" style="margin-top:8px">Börek Sonu</button></div>`;
    $('btn-borek').onclick = () => showEnding('borek');
  }
}
/* Usta Cemil: bakım + pazarlık */
function renderService(){
  const w = wear(), q = serviceQuote(), st = S.serviceState || {};
  let html = `<div class="svc-head"><div class="ico">🔧</div><div><b>Motor aşınması %${w}</b><div class="small muted">${w < 30 ? 'Cemil Usta motora baktı, "boşuna gelmişsin" dedi, yine de karbüratörü dinledi.' : w < 60 ? 'Cemil Usta kulağını motora dayadı, "hmm" dedi. Bu sesin bir fiyatı var.' : w < 90 ? 'Cemil Usta sigarasını söndürdü, motorun yanına çömeldi. Sana bakmadı.' : 'Cemil Usta motora baktı, sonra sana: "Bununla mı geldin?"'}</div></div></div>
    <div class="bar"><i style="width:${w}%;background:${w>=80?'var(--bad)':w>=50?'var(--accent2)':'var(--good)'}"></i></div>`;
  if(st.done){ html += `<p class="small">${esc(st.text)}</p>`; }
  else if(w < 15){ html += `<p class="small muted">Bakım gerekmiyor. Cemil Usta çay ikram etti, parasını almadı.</p>`; }
  else if(!st.quoted){ html += `<p class="small">Cemil Usta motora söyledi, sana değil: "Bu ${fmt(q)} tutar. Parça ayrı."</p><div class="actions"><button class="btn ghost" id="btn-haggle">Pazarlık yap</button><button class="btn primary" id="btn-service" ${S.money<q?'disabled':''}>Öde (${fmt(q)})</button></div>`; }
  else { html += `<p class="small">${esc(st.text)}</p><div class="actions one"><button class="btn primary" id="btn-service" ${S.money<st.price?'disabled':''}>Öde (${fmt(st.price)})</button></div>`; }
  $('service').innerHTML = html;
  const bh = $('btn-haggle'), bs = $('btn-service');
  if(bh) bh.onclick = () => {
    Sfx.click(); const r = Math.random();
    if(r < 0.45) S.serviceState = { quoted:true, price: Math.round(q*0.8/10)*10, text: `"Hemşehrim olduğun için ${fmt(Math.round(q*0.8/10)*10)}." Hemşehrisi değilsin; Cemil Usta bunu biliyor, fiyatı yine de yazdı.` };
    else if(r < 0.8) S.serviceState = { quoted:true, price: q, text: `Cemil Usta motora güldü. "Pazarlık mı istiyormuş? Fiyat fiyattır." ${fmt(q)}.` };
    else S.serviceState = { quoted:true, price: Math.round(q*1.1/10)*10, text: `Cemil Usta anahtarı tezgaha bıraktı. "Pazarlıkla gelene parça da ayrı, işçilik de ayrı." ${fmt(Math.round(q*1.1/10)*10)}.` };
    renderService();
  };
  if(bs) bs.onclick = () => {
    const price = (S.serviceState && S.serviceState.price) || q; if(S.money < price) return;
    S.money -= price; S.kmSince = 0; Sfx.coin(); Haptic.coin();
    S.serviceState = { done:true, text: `Bakım yapıldı, ${fmt(price)}. Motor yeni gibi çalışıyor; Cemil Usta "bir dahakine erken gel" dedi, motora.` };
    S.log.unshift(`G${S.day} · Motor bakımı: ${fmt(price)}`);
    renderService(); renderShop(); renderHUD(); renderDaySummary(); renderTaksit();
  };
}
function renderShop(){
  renderAvatar($('shop-avatar'));
  $('shop').innerHTML = SHOP.filter(i => !i.hidden || META.owned.includes(i.id)).map(i => {
    const owned = META.owned.includes(i.id), eq = META.equipped[i.slot]===i.id;
    const can = owned || S.money >= i.price;
    return `<button class="item ${owned?'owned':''} ${eq?'eq':''}" data-id="${i.id}" ${can?'':'disabled'}>
      <div class="sw" style="background:${i.color}"></div>
      <div class="nm">${esc(i.name)}</div>
      <div class="pr">${eq?(i.slot==='side'?'AKTİF':'GİYİLİYOR'):owned?(i.slot==='side'?'Sahipsin · aktif et':'Sahipsin · giy'):fmt(i.price)}</div>
      <div class="ds">${esc(i.desc)}</div></button>`;
  }).join('');
  $('shop').querySelectorAll('.item').forEach(b => b.onclick = () => buy(b.dataset.id));
}
function buy(id){
  const it = SHOP.find(x=>x.id===id); if(!it) return;
  if(!META.owned.includes(id)){ if(S.money < it.price) return; S.money -= it.price; META.owned.push(id); S.log.unshift(`G${S.day} · Satın alındı: ${it.name}`); Sfx.coin(); Haptic.coin(); }
  META.equipped[it.slot] = id;
  renderAllAvatars(); renderHUD(); renderShop(); renderDaySummary(); renderTaksit(); saveMeta();
}
/* YARIN kartı: hava sızıntısı, hikaye kancası, taksit mesafesi, ayrılmış sipariş */
function tomorrowHook(){
  if(typeof ARC_BEATS !== 'undefined' && ARC_BEATS.length){
    const day = S.day + 1, cands = [];
    Array.from(new Set(ARC_BEATS.map(b => b.arc))).forEach(arc => { const A = META.arcs[arc]; const step = A ? A.step : 1; const b = ARC_BEATS.find(x => x.arc === arc && x.step === step); if(!b || (A && A.done)) return; const due = A && A.due != null ? A.due : (b.startDay || 2); cands.push({ b, due, defer: A ? A.defer : 0 }); });
    // yarın hangisi ateşlenecekse onu söyle: scheduleArcs ile aynı sıra (erteleme, adım, vade)
    const due = cands.filter(c => c.due <= day).sort((x,y) => (y.defer - x.defer) || (x.b.step - y.b.step) || (x.due - y.due));
    if(due.length) return { hook: due[0].b.hook, short: due[0].b.hookShort, tomorrow:true };
    cands.sort((x,y) => (x.due - y.due));
    if(cands.length) return { hook: `${cands[0].b.hook.replace(/\.$/, '')} · ${cands[0].due - S.day} gün sonra.`, short: cands[0].b.hookShort, tomorrow:false };
  }
  if(S.special && S.special.day > S.day) return { hook:`${S.special.name} ${S.special.day - S.day === 1 ? 'yarın' : S.special.day - S.day + ' gün sonra'}.`, short:S.special.name };
  if(wear() >= 70) return { hook:'Motor sabah ilk yokuşta öksürecek. Cemil Usta biliyor.', short:'Cemil Usta' };
  return { hook:'Sakin bir gün görünüyor. Görünüyor.', short:'yeni gün' };
}
function renderYarin(){
  const t = S.tomorrow; if(!t){ $('de-yarin').innerHTML = ''; return; }
  const w = WEATHER[t.weather] || WEATHER.sunny; const n = NEWS.find(x => x.id === t.newsIds[0]);
  const leakOk = Math.random() < 0.8 || S.leakShown; S.leakShown = true; S.leakWrong = !leakOk;
  const wxLine = leakOk ? `${w.emoji} ${w.name}${t.mods.feeMult !== 1 ? `, ücret ×${t.mods.feeMult.toFixed(2).replace(/\.?0+$/,'')}` : ''}${n ? ` · ${n.kicker.toLowerCase()}: ${n.headline}` : ''}` : `${pick(Object.values(WEATHER)).emoji} Meteoroloji "parçalı" dedi. Her şey olabilir.`;
  const hook = tomorrowHook(); S.hookShort = hook.short;
  const size = taksitSize(); const need = size - S.money;
  const taksitLine = !S.goalId ? '' : S.taksitPaid >= CONFIG.taksitCount ? 'Kutu yolda.' : need <= 0 ? `${S.taksitPaid+1}. taksit hazır, ödemedin. Sabah yine burada.` : `${S.taksitPaid+1}. taksite ${fmt(need)}: ${Math.ceil(need / Math.max(300, avgNet())) <= 1 ? 'iyi bir günle bir gün' : Math.ceil(need / Math.max(300, avgNet())) + ' gün'}.`;
  const r = S.reserved;
  $('de-yarin').innerHTML = `<div class="hd">YARIN</div>
    <div class="row"><span class="ic">${w.emoji}</span><span>${esc(wxLine)}</span></div>
    <div class="row"><span class="ic">📍</span><span>${esc(hook.hook)}</span></div>
    ${taksitLine ? `<div class="row"><span class="ic">💳</span><span>${esc(taksitLine)}</span></div>` : ''}
    ${r ? `<div class="row"><span class="ic">📦</span><div style="flex:1;display:grid;gap:6px"><div class="small">Sabah için ayrılmış sipariş <span class="muted">(ücret ×${CONFIG.reservedFeeMult})</span></div><div class="mini"><span>${esc(r.rest)} → ${esc(r.hood)}, ${r.km} km</span><b>${fmt(r.fee)}</b></div><label class="switch ${S.reserveOn?'on':''}" id="sw-reserve"><i></i>${S.reserveOn ? 'Al, sabah direkt yola çık' : 'Alma, sabah fişlere bak'}</label></div></div>` : ''}`;
  const sw = $('sw-reserve'); if(sw) sw.onclick = () => { S.reserveOn = !S.reserveOn; renderYarin(); save(); };
  $('btn-sleep').textContent = `Uyu → Yarın: ${hook.short}`;
}
function sleep(){
  if(S.day % 7 === 0){ showWeek(); return; }
  S.day++; S.dayClosed = false; S.leakShown = false; startDay();
}
/* Haftalık sertifika */
function showWeek(){
  const W = S.week, wk = S.day / 7;
  const net = W.earned + W.tips - W.fuel;
  const ferhat = W.deliveries + rint(5,14);
  const awards = [];
  if(W.complaints === 0) awards.push(['🏅','Sıfır Şikayet','Bu hafta hiçbir müşteri "geri bildirim" bırakmadı. Teşekkür de bırakmadı; o rozet henüz tasarım aşamasında.']);
  else awards.push(['📋','Gelişime Açık',`${W.complaints} geri bildirim. Platform bunları "büyüme fırsatı" diye sınıflandırdı.`]);
  if(W.breaks === 0) awards.push(['🔥','Kesintisiz İş Ortağı','Yedi gün, sıfır mola. Verimlilik yüzde yüz; bel ayrı bir rapor.']);
  else awards.push(['☕','Mola Ustası',`${W.breaks} mola, her biri 40 ₺, her biri bir çay bardağı.`]);
  if(W.tips > W.earned * 0.15) awards.push(['💸','Bahşiş Mıknatısı',`Bahşişler ücretin %${Math.round(W.tips/Math.max(1,W.earned)*100)}'i. İnsanlar ya seviyor ya acıyor; kasa farkı bilmiyor.`]);
  else awards.push(['🪙','Nakit Yok Kurbanı',`Bahşiş ${fmt(W.tips)}. "Yarın veririm" diyenler bu hafta da gelmedi.`]);
  if(W.skips >= 3) awards.push(['🚫','Seçici',`${W.skips} tur geçildi. Algoritma not aldı, algoritma hep not alır.`]);
  if(W.best) awards.push(['⭐','Haftanın Teslimatı',`${W.best.customer}: ${fmt(W.best.total)}. Olay: "${W.best.title}".`]);
  const youWon = W.specialCleared;
  $('cert').innerHTML = `
    <div class="cert-head">HAFTANIN KURYESİ</div>
    <div class="cert-sub">${wk}. hafta · ${youWon ? 'resmi belge' : 'katılım sertifikası'}</div>
    <div class="cert-name">${youWon ? esc(S.name || 'Sen') : 'Hızlı Ferhat'}</div>
    <p class="small" style="margin-top:4px">${youWon ? `${esc(S.name)}, ${W.deliveries} teslimat ve temiz bir özel gün. Ferhat ${ferhat} teslimatla ikinci; sertifikayı kapıcı dairesinde asılı göreceksin.` : `Hızlı Ferhat, ${ferhat} teslimat. Sen ${W.deliveries}. Bu sertifika yine de senin; platform herkese basıyor.`}</p>
    <div class="summary" style="margin-top:10px">
      <span>Teslimat</span><span>${W.deliveries}</span>
      <span>Ücret</span><span>+${fmt(W.earned)}</span>
      <span>Bahşiş</span><span>+${fmt(W.tips)}</span>
      <span>Benzin</span><span style="color:var(--bad)">−${fmt(W.fuel)}</span>
      <span class="tot">Haftalık net</span><span class="tot" style="color:${net>=0?'var(--good)':'var(--bad)'}">${fmt(net)}</span>
    </div>
    <div class="awards">${awards.map(a=>`<div class="award"><div class="ico">${a[0]}</div><div><b>${a[1]}</b><div class="small muted">${esc(a[2])}</div></div></div>`).join('')}</div>
    <div class="cert-stamp">ONAYLANDI<br><span>otomatik</span></div>`;
  Sfx.tada(); Haptic.big();
  show('s-week');
}
