/* ---------------- GÜN SONU & DÜKKAN ---------------- */
function endDay(){
  S.money -= S.dayExpense;
  S.dayClosed = true;
  S.dayReviews = makeReviews(); S.serviceState = null;
  renderDaySummary(); renderService(); renderShop(); renderHUD(); show('s-dayend');
}
function renderDaySummary(){
  $('de-title').textContent = `GÜN ${S.day} BİTTİ`;
  const acc = S.orderLog.filter(x=>x==='ok').length;
  $('de-summary').innerHTML = `
    <span>Teslimat</span><span>${acc}/${CONFIG.ordersPerDay}</span>
    <span>Kazanılan ücret</span><span>+${fmt(S.dayEarned)}</span>
    <span>Bahşiş</span><span>+${fmt(S.dayTips)}</span>
    <span>Benzin</span><span style="color:var(--bad)">−${fmt(S.dayFuel)}</span>
    <span>Günlük gider (simit, çay, motor)</span><span style="color:var(--bad)">−${fmt(S.dayExpense)}</span>
    <span class="tot">Kasa</span><span class="tot">${fmt(S.money)}</span>
    <span class="muted small">Hedefe kalan</span><span class="muted small">${fmt(Math.max(0,S.goalPrice - S.money))}</span>`;
  const rv = S.dayReviews || [];
  $('de-reviews').innerHTML = rv.length ? `<h2>Bugünkü Yorumlar</h2>` + rv.map(r => `<div class="review"><div class="who">${r.name} <span class="muted">· ${pick(['az önce','1 saat önce','2 saat önce','bugün'])}</span></div><div>${r.text}</div></div>`).join('')
    : `<h2>Bugünkü Yorumlar</h2><div class="review muted">Kimse yorum yazmadı. Bu da bir yorum.</div>`;
}
/* Usta Cemil: bakım + pazarlık. serviceState: null | 'quoted' | 'haggled' | 'done' */
function renderService(){
  const w = wear(), q = serviceQuote(), st = S.serviceState || {};
  let html = `<div class="svc-head"><div class="ico">🔧</div><div><b>Motor aşınması %${w}</b><div class="small muted">${w < 30 ? 'Motor iyi. Cemil Usta "boşuna gelme" dedi, ama baktı yine de.' : w < 60 ? 'Sarı bölge. Cemil Usta kulağını motora dayadı, "hmm" dedi. "Hmm" pahalıdır.' : w < 90 ? 'Kırmızı bölge. Cemil Usta sigarasını söndürdü. Bu ciddi demek.' : 'Cemil Usta motora baktı, sana baktı, "bununla mı geldin?" dedi.'}</div></div></div>
    <div class="bar"><i style="width:${w}%;background:${w>=80?'var(--bad)':w>=50?'var(--accent2)':'var(--good)'}"></i></div>`;
  if(st.done){
    html += `<p class="small">${st.text}</p>`;
  } else if(w < 15){
    html += `<p class="small muted">Bakım gerekmiyor. Cemil Usta çay ikram etti, parasını almadı. Çayın.</p>`;
  } else if(!st.quoted){
    html += `<p class="small">Cemil Usta: "Bu ${fmt(q)} tutar kardeşim. Parça ayrı." Parça hep ayrıdır.</p>
      <div class="actions"><button class="btn ghost" id="btn-haggle">🗣️ Pazarlık yap</button><button class="btn primary" id="btn-service" ${S.money<q?'disabled':''}>🔧 Öde (${fmt(q)})</button></div>`;
  } else {
    html += `<p class="small">${st.text}</p>
      <div class="actions one"><button class="btn primary" id="btn-service" ${S.money<st.price?'disabled':''}>🔧 Öde (${fmt(st.price)})</button></div>`;
  }
  $('service').innerHTML = html;
  const bh = $('btn-haggle'), bs = $('btn-service');
  if(bh) bh.onclick = () => {
    Sfx.click();
    const r = Math.random();
    if(r < 0.45) S.serviceState = { quoted:true, price: Math.round(q*0.8/10)*10, text: `"Tamam, hemşehrim olduğun için ${fmt(Math.round(q*0.8/10)*10)}." Hemşehrisi değilsin. O da biliyor.` };
    else if(r < 0.8) S.serviceState = { quoted:true, price: q, text: `Cemil Usta güldü. "Pazarlık mı? Fiyat fiyattır." ${fmt(q)}. Gülmesi bedava, bir o.` };
    else S.serviceState = { quoted:true, price: Math.round(q*1.1/10)*10, text: `Cemil Usta sinirlendi. "Pazarlıkla gelene parça da ayrı, işçilik de ayrı." ${fmt(Math.round(q*1.1/10)*10)}. Ağzını açmasaydın.` };
    renderService();
  };
  if(bs) bs.onclick = () => {
    const price = (S.serviceState && S.serviceState.price) || q;
    if(S.money < price) return;
    S.money -= price; S.kmSince = 0; Sfx.coin();
    S.serviceState = { done:true, text: `Bakım yapıldı, ${fmt(price)} gitti. Motor yeni gibi. Yeni değil, "gibi". Cemil Usta "bir dahakine erken gel" dedi. Gelmeyeceksin.` };
    S.log.unshift(`G${S.day} · Motor bakımı: ${fmt(price)}`);
    renderService(); renderShop(); renderHUD(); renderDaySummary();
  };
}
function renderShop(){
  renderAvatar($('shop-avatar'));
  $('shop').innerHTML = SHOP.map(i => {
    const owned = S.owned.includes(i.id), eq = S.equipped[i.slot]===i.id;
    const can = owned || S.money >= i.price;
    return `<button class="item ${owned?'owned':''} ${eq?'eq':''}" data-id="${i.id}" ${can?'':'disabled'}>
      <div class="sw" style="background:${i.color}"></div>
      <div class="nm">${i.name}</div>
      <div class="pr">${eq?(i.slot==='side'?'AKTİF':'GİYİLİYOR'):owned?(i.slot==='side'?'Sahipsin · aktif et':'Sahipsin · giy'):fmt(i.price)}</div>
      <div class="ds">${i.desc}</div></button>`;
  }).join('');
  $('shop').querySelectorAll('.item').forEach(b => b.onclick = () => buy(b.dataset.id));
}
function buy(id){
  const it = SHOP.find(x=>x.id===id); if(!it) return;
  if(!S.owned.includes(id)){ if(S.money < it.price) return; S.money -= it.price; S.owned.push(id); S.log.unshift(`G${S.day} · Satın alındı: ${it.name}`); }
  S.equipped[it.slot] = id;
  renderAllAvatars(); renderHUD(); renderShop(); renderDaySummary();
}
function sleep(){
  if(S.day % 7 === 0){ showWeek(); return; }
  S.day++; S.dayClosed = false; startDay();
}
/* Haftalık özet: her 7 günde bir "sertifika". Ödüller platform diliyle, hiçbiri para etmiyor. */
function showWeek(){
  const W = S.week, wk = S.day / 7;
  const net = W.earned + W.tips - W.fuel;
  const awards = [];
  if(W.complaints === 0) awards.push(['🏅','Sıfır Şikayet','Kimse şikayet etmedi. Kimse teşekkür de etmedi, ama o ayrı rozet, o yok.']);
  else awards.push(['📋','Gelişime Açık',`${W.complaints} şikayet. Platform bunu "geri bildirim" diye adlandırıyor. Sen başka türlü adlandırıyorsun.`]);
  if(W.breaks === 0) awards.push(['🔥','Demir Kıç',`Bir hafta boyunca sıfır mola. Verimlilik: %100. Bel: %40.`]);
  else awards.push(['☕','Çay Dostu',`${W.breaks} mola. Her biri 40 ₺. Her biri değdi. Platform aynı fikirde değil.`]);
  if(W.tips > W.earned * 0.15) awards.push(['💸','Bahşiş Mıknatısı',`Bahşişler ücretin %${Math.round(W.tips/Math.max(1,W.earned)*100)}'i. İnsanlar seni seviyor ya da acıyor. İkisi de para.`]);
  else awards.push(['🪙','Tutumlu Müşteri Kurbanı',`Bahşiş ${fmt(W.tips)}. "Bahşiş yarın" diyenlerin yarını gelmedi.`]);
  if(W.skips >= 3) awards.push(['🚫','Seçici',`${W.skips} tur geçtin. Algoritma not aldı. Algoritma her şeyi not alır.`]);
  if(W.best) awards.push(['⭐','Haftanın Teslimatı',`${W.best.customer}: ${fmt(W.best.total)}. Olay: "${W.best.title}". Bir daha olmayacak, kaydet.`]);
  $('cert').innerHTML = `
    <div class="cert-head">HAFTANIN KURYESİ</div>
    <div class="cert-sub">${wk}. hafta · katılım sertifikası</div>
    <div class="cert-name">Sen değilsin.</div>
    <p class="small" style="margin-top:4px">Haftanın kuryesi Pendik'ten biri. Onu da kimse görmedi. Ama bu sertifika senin. Çerçevelet.</p>
    <div class="summary" style="margin-top:10px">
      <span>Teslimat</span><span>${W.deliveries}</span>
      <span>Ücret</span><span>+${fmt(W.earned)}</span>
      <span>Bahşiş</span><span>+${fmt(W.tips)}</span>
      <span>Benzin</span><span style="color:var(--bad)">−${fmt(W.fuel)}</span>
      <span class="tot">Haftalık net</span><span class="tot" style="color:${net>=0?'var(--good)':'var(--bad)'}">${fmt(net)}</span>
    </div>
    <div class="awards">${awards.map(a=>`<div class="award"><div class="ico">${a[0]}</div><div><b>${a[1]}</b><div class="small muted">${a[2]}</div></div></div>`).join('')}</div>
    <div class="cert-stamp">ONAYLANDI<br><span>otomatik</span></div>`;
  Sfx.tada();
  show('s-week');
}
$('btn-week-go').onclick = () => { S.week = defaultState().week; S.day++; S.dayClosed = false; startDay(); };
$('btn-sound').onclick = (e) => { e.stopPropagation(); Sfx.toggle(); renderHUD(); };

