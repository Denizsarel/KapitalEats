/* ---------------- TESLİMAT SONUCU ---------------- */
function finishDelivery(){
  const c = S.current, o = c.order;
  // Olay dışı doğal bahşiş: puan yüksekse daha çok
  if(!c.skip && o.noteKey !== 'tiplater' && Math.random() < 0.6 * (S.rating/5) * (o.districtTip||1)){ c.tip += Math.round(o.fee * rnd(0.08,0.3) * S.todayMods.tipMult * (o.districtTip||1)); }
  // Platform "performans bonusu": üst üste N teslimat. Mola vermeyene ödül; yorgunluk olayıyla tam ters düşsün diye.
  if(S.streak === CONFIG.streakBonusAt){ c.extraMoney += CONFIG.streakBonus; c.bonus = true; }
  const fee = c.feeLost ? 0 : o.fee;
  const total = fee + c.tip + c.extraMoney - o.fuel;
  S.money += total; S.dayEarned += fee + c.extraMoney; S.dayTips += c.tip; S.dayFuel += o.fuel;
  S.dayDeliveries.push({ customer:o.customer, rest:o.rest, item:o.lines.slice().sort((x,y)=>y.price-x.price)[0].name, delta:c.ratingDelta, tip:c.tip, bad:!!c.bad, eventId:c.eventId||null, night:isNight(), floor:o.floor, noteKey:o.noteKey||null });
  S.kmSince += o.km;
  c.energyCost = energyCost(o); S.energy = clamp(S.energy - c.energyCost, 0, CONFIG.energyMax);
  const W = S.week; W.deliveries++; W.earned += fee + c.extraMoney; W.tips += c.tip; W.fuel += o.fuel; if(c.eventId){ W.events++; if(!W.best || total > W.best.total) W.best = { total, title: (EVENTS.find(e=>e.id===c.eventId)||{}).title || '', customer:o.customer }; }
  S.rating = clamp(S.rating + c.ratingDelta, 1, 5);
  $('res-title').textContent = 'Teslim Edildi';
  $('res-summary').innerHTML = `
    <span>Sipariş ücreti</span><span>${c.feeLost?'<s>'+fmt(o.fee)+'</s> 0 ₺':fmt(fee)}</span>
    <span>Bahşiş</span><span>${fmt(c.tip)}</span>
    ${c.extraMoney?`<span>Diğer</span><span>${c.extraMoney>0?'+':''}${fmt(c.extraMoney)}</span>`:''}
    <span>Benzin (${o.km} km)</span><span style="color:var(--bad)">−${fmt(o.fuel)}</span>
    <span>⚡ Enerji</span><span style="color:var(--bad)">−${c.energyCost}${c.energyGain?` <span style="color:var(--good)">+${c.energyGain}</span>`:''}</span>
    <span class="tot">Toplam</span><span class="tot" style="color:${total>=0?'var(--good)':'var(--bad)'}">${total>=0?'+':''}${fmt(total)}</span>`;
  $('res-note').textContent = c.bonus ? `🏅 Platform bonusu +${fmt(CONFIG.streakBonus)}: ${CONFIG.streakBonusAt} teslimat üst üste, sıfır mola. "Verimlilik şampiyonu." Sırtın ağrıyor.` : c.ratingDelta ? `Müşteri puanı ${c.ratingDelta>0?'yükseldi':'düştü'}: ${S.rating.toFixed(1)} ⭐` : (c.tip ? 'Müşteri bahşiş bıraktı. Nadir bir an, kaydet.' : 'Bahşiş yok. "Teşekkürler" bile yok.');
  S.orderIdx++;
  $('btn-res-next').textContent = S.orderIdx >= CONFIG.ordersPerDay && !S.breakNext ? 'Günü Bitir' : 'Sonraki Sipariş';
  renderHUD();
  if(checkWin() || checkFired()) return;
  if(total > 0) Sfx.coin(); else Sfx.buzz();
  show('s-result');
}

function checkWin(){
  if(S.money >= S.goalPrice){ showWin(); return true; }
  return false;
}
function checkFired(){
  let reason = null;
  if(S.rating <= CONFIG.fireRating) reason = `Puanın artık ${S.rating.toFixed(1).replace('.',',')}. Platform "müşteri deneyimi standartlarımız" dedi. Standartları kimse görmedi.`;
  else if(S.complaints >= CONFIG.maxComplaints) reason = `${S.complaints} şikayet. Dördüncüsünde sistem otomatik kapattı. İnsan değil, "destek botu" bildirdi.`;
  else if(S.offered >= 12 && acceptRate() < 0.4) reason = `Turların %${100-Math.round(acceptRate()*100)}'ini geçtin. Algoritma seni önce unuttu, sonra sildi.`;
  if(!reason) return false;
  showFired(reason); return true;
}

