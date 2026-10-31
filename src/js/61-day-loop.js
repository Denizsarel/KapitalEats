/* ---------------- BAŞLANGIÇ ---------------- */
function renderGoals(){
  $('goals').innerHTML = GOALS.map(g => `
    <button class="goal ${selectedGoal===g.id?'sel':''}" data-id="${g.id}">
      <div class="emoji">${g.emoji}</div>
      <div><div>${g.name}</div><div class="desc">${g.desc}</div></div>
      <div class="price">${fmt(g.price)}</div>
    </button>`).join('');
  $('goals').querySelectorAll('.goal').forEach(b => b.onclick = () => { selectedGoal = b.dataset.id; renderGoals(); $('btn-start').disabled = false; });
}
function startGame(){
  const keep = { owned:S.owned, equipped:S.equipped };
  const typed = ($('name-input').value || '').trim();
  S = Object.assign(defaultState(), keep);
  S.name = typed || pick(COURIER_NAMES);
  S.goalId = selectedGoal; S.goalPrice = goal().price;
  renderAllAvatars(); renderHUD(); startDay();
}

/* ---------------- GÜN AKIŞI ---------------- */
function startDay(){
  S.orderIdx = 0; S.orderLog = []; S.dayEarned = 0; S.dayTips = 0; S.dayFuel = 0; S.dayExpense = CONFIG.dailyExpense; S.dayDeliveries = []; S.dayReviews = [];
  S.todayMods = {feeMult:1, tipMult:1}; S.todayTags = []; S.weather = null; S.streak = 0; S.breakNext = false; S.energy = CONFIG.energyMax; S.usedNotes = [];
  // 1 haber (bazen 2) seç; kategoriye uygun ya da genel. Aynı haber tekrar etmesin.
  const g = goal();
  let pool = NEWS.filter(n => (n.cat==='all' || n.cat===g.cat) && !S.usedNews.includes(n.id));
  if(pool.length < 2){ S.usedNews = []; pool = NEWS.filter(n => n.cat==='all' || n.cat===g.cat); }
  const count = Math.random() < 0.3 ? 2 : 1;
  const chosen = [];
  for(let i=0;i<count && pool.length;i++){ const n = pick(pool); chosen.push(n); pool = pool.filter(x=>x!==n); S.usedNews.push(n.id); }
  $('news-day').textContent = `GÜN ${S.day} · SABAH BÜLTENİ`;
  const cards = chosen.map(n => {
    const e = n.effect || {}; const tags = [];
    let priceHtml = '';
    if(e.priceMult){
      const old = S.goalPrice; S.goalPrice = Math.round(old * e.priceMult / 10) * 10;
      const up = e.priceMult > 1;
      priceHtml = `<div class="priceline"><span class="old">${fmt(old)}</span><span>→</span><span class="new" style="color:${up?'var(--bad)':'var(--good)'}">${fmt(S.goalPrice)}</span><span class="tag ${up?'up':'down'}">${up?'▲':'▼'} ${Math.round(Math.abs(e.priceMult-1)*100)}%</span></div>`;
      setTimeout(()=>flashPrice(up), 50);
    }
    if(e.feeMult){ S.todayMods.feeMult *= e.feeMult; tags.push(`<span class="tag info">Bugün ücretler ×${e.feeMult}</span>`); }
    if(e.tipMult){ S.todayMods.tipMult *= e.tipMult; tags.push(`<span class="tag info">Bugün bahşiş ×${e.tipMult}</span>`); }
    if(e.expense){ S.dayExpense += e.expense; tags.push(`<span class="tag up">Bugün ek gider +${fmt(e.expense)}</span>`); }
    if(e.weather){ S.weather = e.weather; }
    if(e.tags){ S.todayTags.push(...e.tags); }
    if(!Object.keys(e).length) tags.push(`<span class="tag">Etkisi yok. Şimdilik.</span>`);
    return `<div class="card news"><div class="kicker">${n.kicker}</div><h3>${n.headline}</h3><p class="muted">${n.body}</p>${priceHtml}<div class="delta">${tags.join('')}</div></div>`;
  });
  if(isWeekend()){ S.todayTags.push('weekend'); S.todayMods.feeMult *= CONFIG.weekendFeeMult; cards.push(`<div class="card wxcard"><div class="ico">🎉</div><div><h3>Hafta sonu</h3><p class="muted small">Herkes evde, herkes aç, kimse mutfağa girmiyor. Ücretler yüksek, kapıyı açanlar pijamalı.</p><div class="delta" style="margin-top:6px"><span class="tag info">Ücretler ×${CONFIG.weekendFeeMult}</span></div></div></div>`); }
  // Hava: haber belirlemediyse rastgele
  if(!S.weather){ S.weather = weightedPick(Object.keys(WEATHER).map(k=>({k, weight:WEATHER[k].weight}))).k; }
  const w = wx(); S.todayMods.feeMult *= w.feeMult;
  cards.push(`<div class="card wxcard"><div class="ico">${w.emoji}</div><div><h3>Bugün hava: ${w.name}</h3><p class="muted small">${w.blurb}</p><div class="delta" style="margin-top:6px">${w.feeMult!==1?`<span class="tag info">Ücretler ×${w.feeMult}</span>`:''}${w.risk?`<span class="tag up">Olay riski ↑</span>`:''}</div></div></div>`);
  $('news-list').innerHTML = cards.join('');
  renderHUD(); show('s-news');
}

function genOrder(){
  const r = pick(RESTAURANTS);
  const d = DISTRICTS.find(x => x.name === pick(r.areas)) || pick(DISTRICTS);
  const km = rint(1, CONFIG.maxDistanceKm);
  // Ürünler: 1-4 kalem, hepsi aynı restoranın menüsünden. Tek kalem sadece "solo" ürünlerde.
  const lines = []; let tries = 0;
  const n = Math.min(r.menu.length, Math.random() < 0.2 ? 1 : rint(2,4));
  while(lines.length < n && tries++ < 40){
    const c = pick(r.menu);
    if(n === 1 && !c[3]) continue;
    if(lines.some(l=>l.name===c[1])) continue;
    lines.push({ emoji:c[0], name:c[1], price:c[2], qty: c[3] ? 1 : rint(1,3) });
  }
  const total = lines.reduce((t,l)=>t+l.price*l.qty, 0);
  const bulk = lines.reduce((t,l)=>t+l.qty, 0);
  const fee = Math.round((CONFIG.baseFee + km*CONFIG.feePerKm + bulk*CONFIG.bulkFee) * (0.6 + 0.4*acceptRate()) * S.todayMods.feeMult * (isNight()?CONFIG.nightFeeMult:1) * rnd(0.9,1.15));
  const floor = rint(1,7), perFloor = rint(2,4), apt = (floor-1)*perFloor + rint(1,perFloor);
  const base = { floor, apt };
  const note = pickNote(base);
  return {
    rest:r.name, restTag:r.tag, lines, total, bulk,
    emoji: lines[0].emoji,
    customer: pick(FIRST_NAMES) + ' ' + pick(SURNAME_INITIALS),
    hood: pick(d.hoods), street: pick(d.streets), no: rint(2,48), building: pick(BUILDINGS), floor, apt,
    payment: Math.random() < 0.25 ? 'nakit' : 'online',
    district:d.name, districtDat:d.dat, districtTip:d.tip, blurb:d.blurb, km, fee, fuel: km*CONFIG.fuelPerKm,
    eta: 8 + km*3 + rint(0,6), note: note.text, noteKey: note.key, noteValue: note.value
  };
}
function ticketHTML(o, idx){
  return `<div class="ticket pick" data-i="${idx}">
    <div class="rest">${o.rest}</div>
    <div class="note" style="margin:0 0 6px">${o.restTag}</div>
    <div class="items">${o.lines.map(l=>`<span><span>${l.emoji} ${l.qty}× ${l.name}</span><span>${fmt(l.price*l.qty)}</span></span>`).join('')}</div>
    <div class="addr"><b>${o.customer}</b> · ${o.hood}, ${o.street} No:${o.no} ${o.building}, Kat ${o.floor}, Daire ${o.apt}<br>${o.district} · ${o.km} km · ~${o.eta} dk</div>
    ${o.note ? `<div class="note">“${o.note}”</div>` : ''}
    <div class="meta"><div class="l">Sipariş tutarı ${fmt(o.total)}<br><span class="pay">${o.payment==='nakit'?'KAPIDA NAKİT':'ONLINE ÖDENDİ'}</span><br>Benzin ≈ −${fmt(o.fuel)} · Enerji ≈ −${energyCost(o)}</div><div style="text-align:right"><div class="fee">${fmt(o.fee)}</div>${isNight()?'<div class="small" style="color:#8a1c1c;font-weight:700">🌙 gece ×'+CONFIG.nightFeeMult+'</div>':''}</div></div>
    <button class="take" data-i="${idx}">Bu siparişi al</button>
  </div>`;
}
function renderDots(){
  $('order-dots').innerHTML = Array.from({length:CONFIG.ordersPerDay},(_,i)=>`<i class="${S.orderLog[i]||''} ${i===S.orderIdx?'cur':''}"></i>`).join('');
}
function nextOrder(){
  if(S.orderIdx >= CONFIG.ordersPerDay){ return endDay(); }
  if(S.breakNext){ return takeBreak(); }
  const n = rint(CONFIG.offersPerRound[0], CONFIG.offersPerRound[1]);
  S.offers = Array.from({length:n}, genOrder);
  S.current = null;
  $('order-no').textContent = `Tur ${S.orderIdx+1}/${CONFIG.ordersPerDay} · ${hourStr()}${isNight()?' 🌙':''}`;
  renderDots();
  $('offers').innerHTML = S.offers.map(ticketHTML).join('');
  $('offers').querySelectorAll('.take').forEach(b => b.onclick = (ev) => { ev.stopPropagation(); choose(+b.dataset.i); });
  const ar = acceptRate();
  let hint;
  if(ar < 0.7) hint = 'Çok tur geçtin. Algoritma sana artık ucuz siparişleri gösteriyor.';
  else if(S.rating < 3.5) hint = 'Puanın düşük. Müşteriler bahşişte cimrileşti.';
  else if(S.streak >= CONFIG.streakBonusAt-1) hint = `${S.streak} sipariş üst üste. Bir tane daha: ${fmt(CONFIG.streakBonus)} bonus. Mola dersen sıfırlanır. Uygulama bunu "motivasyon" sayıyor.`;
  else if(isNight() && curHour() === CONFIG.nightFrom) hint = `Gece tarifesi başladı: ücretler ×${CONFIG.nightFeeMult}. Karanlık, yorgunluk ve rakılı müşteriler fiyata dahil.`;
  else if(S.energy < CONFIG.energyLow) hint = `Enerjin ${S.energy}. Bu halde her şey ters gidebilir. Gidiyor da.`;
  else if(S.weather !== 'sunny') hint = `Hava ${wx().name.toLowerCase()}. Uzun yol, uzun risk. Bunu uygulama söylemez, biz söyledik.`;
  else hint = pick(PLATFORM_MSGS);
  $('order-hint').innerHTML = `<b>🔔 KapitalEats</b><span>${hint}</span>`;
  $('btn-skip').disabled = false;
  Sfx.ding();
  renderHUD(); show('s-order');
}
function choose(i){
  const o = S.offers[i]; if(!o) return;
  S.current = { order:o, tip:0, extraMoney:0, feeLost:false, ratingDelta:0 };
  $('btn-skip').disabled = true;
  document.querySelectorAll('#offers .ticket').forEach((t,j) => {
    if(j === i){ const st = document.createElement('div'); st.className='stamp ok'; st.innerHTML='<span>KABUL</span>'; t.appendChild(st); }
    else t.classList.add('dim');
    t.querySelector('.take').disabled = true;
  });
  S.offered++; S.accepted++; S.streak++;
  S.orderLog[S.orderIdx] = 'ok';
  Sfx.stamp();
  setTimeout(ride, CONFIG.stampMs);
}
function skipRound(){
  S.offered++; S.streak = 0; S.week.skips++;
  S.orderLog[S.orderIdx] = 'no';
  document.querySelectorAll('#offers .ticket').forEach(t => { t.classList.add('dim'); });
  $('btn-skip').disabled = true;
  setTimeout(()=>{ S.orderIdx++; if(!checkFired()) nextOrder(); }, 400);
}
function takeBreak(){
  S.breakNext = false; S.streak = 0; S.week.breaks++; S.energy = clamp(S.energy + CONFIG.breakEnergy, 0, CONFIG.energyMax);
  S.orderLog[S.orderIdx] = 'break';
  S.money -= CONFIG.breakCost; S.dayExpense += CONFIG.breakCost;
  $('res-title').textContent = '☕ MOLA';
  $('res-summary').innerHTML = `<span>Çay + simit</span><span style="color:var(--bad)">−${fmt(CONFIG.breakCost)}</span><span>⚡ Enerji</span><span style="color:var(--good)">+${CONFIG.breakEnergy}</span><span class="tot">Kazanç</span><span class="tot">0 ₺</span>`;
  $('res-note').textContent = '11 dakika boyunca kimse aramadı. Rüya gibiydi. Sonra uygulama titreşti.';
  S.orderIdx++;
  $('btn-res-next').textContent = S.orderIdx >= CONFIG.ordersPerDay ? 'Günü Bitir' : 'Sonraki Sipariş';
  renderHUD(); show('s-result');
}

function ride(){
  const o = S.current.order;
  $('ride-text').innerHTML = `<span class="dots-anim">${o.districtDat} gidiliyor</span><br><span class="muted">${o.km} km · ${o.hood} · ${isNight()?'🌙':wx().emoji}</span><span style="font-family:var(--body);font-size:14px;display:block;margin-top:10px;color:var(--fg)">${o.blurb}</span>`;
  const sc = document.querySelector('.scene'); sc.classList.toggle('rain', S.weather==='rain'); sc.classList.toggle('snow', S.weather==='snow');
  const h = curHour(); sc.classList.toggle('night', h >= CONFIG.nightFrom); sc.classList.toggle('dusk', h >= 17 && h < CONFIG.nightFrom); sc.classList.toggle('day', h < 17);
  renderAvatar($('ride-avatar'));
  show('s-ride'); Sfx.engineStart();
  setTimeout(()=>{
    Sfx.engineStop();
    const ev = pickEvent();
    if(ev) showEvent(ev); else finishDelivery();
  }, CONFIG.rideMs);
}

