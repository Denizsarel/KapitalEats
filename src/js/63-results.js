/* ---------------- TESLİMAT SONUCU ---------------- */
function finishDelivery(){
  const c = S.current, o = c.order;
  const ruleFx = activeRuleEffects();
  // Olay dışı doğal bahşiş: puan yüksekse daha çok; "bahşiş yarın" notu bahşiş vermez
  if(!c.skip && o.noteKey !== 'tiplater' && Math.random() < 0.6 * (S.rating/5) * (o.districtTip||1)){ c.tip += Math.round(o.fee * rnd(0.08,0.3) * S.todayMods.tipMult * (o.districtTip||1) * (ruleFx.tipMult||1)); }
  if(S.streak === CONFIG.streakBonusAt){ c.extraMoney += CONFIG.streakBonus; c.bonus = true; }
  const fee = c.feeLost ? 0 : o.fee;
  const cut = ruleFx.cutPct ? Math.round(fee * ruleFx.cutPct / 100) : 0;
  const total = fee - cut + c.tip + c.extraMoney - o.fuel;
  const before = S.money;
  S.money += total; S.dayEarned += fee + c.extraMoney; S.dayTips += c.tip; S.dayFuel += o.fuel; S.dayCut += cut;
  if(isNight()) S.nightDeliveries++;
  // puan: olaysız teslimat küçük artı; ilk günler taban 3,0
  if(!c.eventId && S.rating < CONFIG.ratingSoftCap) c.ratingDelta = (c.ratingDelta||0) + CONFIG.ratingRecover;
  S.rating = clamp(S.rating + (c.ratingDelta||0), S.day <= CONFIG.ratingFloorDays ? 3.0 : 1, 5);
  if(c.eventId) S.cleanStreak = 0; else S.cleanStreak++;
  S.dayDeliveries.push({ customer:o.customer, rest:o.rest, item:o.lines.slice().sort((x,y)=>y.price-x.price)[0].name, delta:c.ratingDelta||0, tip:c.tip, bad:!!c.bad, eventId:c.eventId||null, night:isNight(), floor:o.floor, noteKey:o.noteKey||null, voice:o.voice||null });
  rememberCustomer(o, c);
  S.kmSince += o.km;
  c.energyCost = energyCost(o); S.energy = clamp(S.energy - c.energyCost, 0, CONFIG.energyMax);
  const W = S.week; W.deliveries++; W.earned += fee + c.extraMoney; W.tips += c.tip; W.fuel += o.fuel; if(c.eventId){ W.events++; const title = $('ev-title').textContent; if(!W.best || total > W.best.total) W.best = { total, title, customer:o.customer }; }
  if(S.special && S.special.day === S.day) S.specialStats.deliveries++;
  track('deliver', { district:o.district, hood:o.hood, km:o.km, night:isNight(), payment:o.payment, tip:c.tip, fee, weather:S.weather, rest:o.rest, floor:o.floor });
  $('res-title').textContent = 'Teslim Edildi';
  const arrow = c.ratingDelta ? (c.ratingDelta > 0 ? ' <span style="color:var(--good)">▲</span>' : ' <span style="color:var(--bad)">▼</span>') : '';
  $('res-summary').innerHTML = `
    <span>Sipariş ücreti</span><span>${c.feeLost?'<s>'+fmt(o.fee)+'</s> 0 ₺':fmt(fee)}</span>
    ${cut?`<span>Kurye Katkı Payı (%${ruleFx.cutPct})</span><span style="color:var(--bad)">−${fmt(cut)}</span>`:''}
    <span>Bahşiş</span><span>${fmt(c.tip)}</span>
    ${c.extraMoney?`<span>${c.bonus?'Performans Bonusu':'Diğer'}</span><span>${c.extraMoney>0?'+':''}${fmt(c.extraMoney)}</span>`:''}
    <span>Benzin (${o.km} km)</span><span style="color:var(--bad)">−${fmt(o.fuel)}</span>
    <span>⚡ Enerji</span><span style="color:var(--bad)">−${c.energyCost}${c.energyGain?` <span style="color:var(--good)">+${c.energyGain}</span>`:''}</span>
    <span>⭐ Puan</span><span>${S.rating.toFixed(2)}${arrow}</span>
    <span class="tot">Toplam</span><span class="tot" style="color:${total>=0?'var(--good)':'var(--bad)'}">${total>=0?'+':''}${fmt(total)}</span>`;
  $('res-note').textContent = c.bonus ? `Performans Bonusu +${fmt(CONFIG.streakBonus)}: ${CONFIG.streakBonusAt} teslimat üst üste 🔥 Harika gidiyorsunuz!` : c.eventId ? '' : (c.tip ? pick(['Kapıda bahşiş. Fişin arkasına "teşekkürler" yazılmış, kalemle.','Bahşiş, poşetin içinde katlanmış. Saymadan cebe.','Müşteri "üstü kalsın" dedi; üstü 42 lira.']) : pick(['Bahşiş yok. Kapı kapandı, asansör aşağı.','Teslim edildi. Müşteri "tamam" dedi, bu kadar.','Paket el değiştirdi, kimse bir şey demedi.']));
  const t = S.task; $('res-task').hidden = !t; if(t) $('res-task').innerHTML = `<b>🎯 Görev</b><span>${esc(t.text)} · ${t.done ? 'tamamlandı ✓' : t.progress + '/' + t.target}</span>`;
  S.orderIdx++;
  $('btn-res-next').textContent = (S.orderIdx >= S.dayRounds && !S.breakNext) ? 'Günü Bitir' : (S.day === 1 && S.orderIdx === 1 && !S.goalId ? 'Devam' : 'Sonraki Sipariş');
  renderHUD();
  if(S.boxDelivered){ show('s-result'); $('btn-res-next').textContent = 'Kutuyu aç'; return; }
  if(checkFired()) return;
  // hissiyat
  setTimeout(() => { pop((total>=0?'+':'') + fmt(total), { neg: total < 0 }); if(total > 0){ Sfx.coin(Math.pow(2, Math.min(S.streak, 12)/12)); Haptic.coin(); } else { Sfx.buzz(); } }, 150);
  if(S.day === 1 && S.orderIdx === 1 && !S.goalId) setTimeout(() => pop('İlk teslimat ✓', { big:true, dy:40 }), 700);
  show('s-result');
}
function rememberCustomer(o, c){
  if(o.story) return;
  const title = c.eventId ? $('ev-title').textContent : null;
  const existing = META.customers.find(x => x.customer === o.customer && x.street === o.street && x.no === o.no);
  const rec = existing || { customer:o.customer, district:o.district, hood:o.hood, street:o.street, no:o.no, building:o.building, floor:o.floor, apt:o.apt, visits:0, voice:o.voice||null };
  rec.visits++; rec.lastEvent = title; rec.lastGood = !c.bad; rec.day = S.day;
  if(!existing){ META.customers.push(rec); if(META.customers.length > 40) META.customers.shift(); }
}
function checkFired(){
  if(S.day <= CONFIG.ratingFloorDays) return false;
  let reason = null;
  if(S.rating <= CONFIG.fireRating) reason = { code:'rating', text:`Hesabınız Topluluk Standartlarımız gereği askıya alınmıştır. Son 30 günlük müşteri memnuniyet puanınız (${S.rating.toFixed(1).replace('.',',')}) asgari eşiğin altında kalmıştır.` };
  else if(S.complaints >= CONFIG.maxComplaints) reason = { code:'complaints', text:`Hesabınız Topluluk Standartlarımız gereği askıya alınmıştır. Hakkınızda ${S.complaints} adet doğrulanmış geri bildirim bulunmaktadır.` };
  else if(S.offered >= CONFIG.minOffersForFire && acceptRate() < 0.4) reason = { code:'accept', text:`Hesabınız pasif iş ortağı statüsüne alınmıştır. Son dönem kabul oranınız (%${Math.round(acceptRate()*100)}) platform ortalamasının altındadır.` };
  if(!reason) return false;
  showFired(reason); return true;
}
