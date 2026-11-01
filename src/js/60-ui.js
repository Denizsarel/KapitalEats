/* ---------------- EKRAN ---------------- */
let returnScreen = 's-start';
function show(id){
  document.querySelectorAll('.screen').forEach(s => s.hidden = (s.id !== id));
  $('hud').hidden = (id === 's-start');
  document.querySelector('main').scrollTop = 0;
  if(!['s-away','s-mahalle'].includes(id)) S.phase = id; // ara ekranlar kaldığın yeri ezmesin
  if(id !== 's-start') save();
  if(S.goalId || S.day > 1 || id !== 's-start') renderHUD();
}

function renderAvatar(el){
  if(!el) return;
  if(!el.children.length){
    el.innerHTML = ['av-wheel b','av-wheel f','av-body','av-seat','av-front','av-bar','av-light','av-legs','av-foot','av-bag','av-jacket','av-zip','av-arm','av-glove','av-head','av-hair','av-helmet','av-visor']
      .map(c=>`<div class="${c}"></div>`).join('');
  }
  let nohelmet = false, shape = '';
  for(const slot in META.equipped){
    const it = SHOP.find(x=>x.id===META.equipped[slot]);
    if(!it || slot === 'side') continue;
    el.style.setProperty('--'+slot, it.color);
    if(it.nohelmet) nohelmet = true;
    if(it.shape) shape = it.shape;
  }
  el.classList.toggle('nohelmet', nohelmet);
  ['ears','pika','horns','half'].forEach(sh => el.classList.toggle('h-'+sh, shape === sh));
}
function renderAllAvatars(){ ['hud-avatar','start-avatar','ride-avatar','shop-avatar','win-avatar','fired-avatar'].forEach(id=>{ const h = $(id); if(h){ h.classList.add('avatar'); renderAvatar(h); } }); }

function inShift(){ return !['s-news','s-dayend','s-start','s-week','s-goal'].includes(S.phase) && S.orderIdx < S.dayRounds; }
function renderHUD(){
  const sh = inShift();
  $('hud-day').textContent = sh ? `G${S.day} ${hourStr()}${isNight() ? '🌙' : wx().emoji}` : `GÜN ${S.day} ${wx().emoji}`;
  if(shownMoney == null){ $('hud-money').textContent = fmt(S.money); shownMoney = S.money; } else if(shownMoney !== S.money) moneyChanged();
  $('hud-rating').textContent = xfmt(S.rating.toFixed(1));
  const ar = acceptRate(); $('hud-accept-wrap').hidden = !(S.offered >= 4 && ar < 0.75); $('hud-accept').textContent = '%' + Math.round(ar*100);
  const w = wear(); $('hud-wear-wrap').hidden = w <= 50; $('hud-wear').textContent = '%' + w; $('hud-wear').style.color = w >= 80 ? 'var(--bad)' : 'var(--accent2)';
  $('hud-complaints').hidden = S.complaints < 2; $('hud-complaints-n').textContent = S.complaints; $('hud-complaints-max').textContent = CONFIG.maxComplaints;
  $('hud-account').hidden = S.account < 2; $('hud-account-n').textContent = 'Hesap ' + S.account;
  $('btn-sound').textContent = Sfx.on ? '🔊' : '🔇';
  $('btn-haptic').textContent = Haptic.on ? '📳' : '📴';
  const en = clamp(S.energy, 0, CONFIG.energyMax);
  $('hud-energy-txt').textContent = en;
  $('hud-energy').style.width = en + '%';
  $('hud-energy').style.background = en < 30 ? 'var(--bad)' : (en < 60 ? 'var(--accent2)' : 'var(--good)');
  $('hud-energy').classList.toggle('pulse', en < 30);
  let tariff = '';
  if(sh && isNight()) tariff = `🌙 Gece tarifesi ×${xfmt(CONFIG.nightFeeMult)}`;
  else if(S.special && S.special.day === S.day) tariff = `${S.special.emoji||'⭐'} ${S.special.name}`;
  else if(S.special && S.special.day > S.day) tariff = `${S.special.emoji||'⭐'} ${S.special.name}: ${S.special.day - S.day} gün`;
  else if(isWeekend()) tariff = '🎉 Hafta sonu';
  else if(S.program && typeof PROGRAMS !== 'undefined'){ const p = PROGRAMS.find(x => x.id === S.program); if(p) tariff = '💎 ' + p.name; }
  $('hud-tariff').textContent = tariff;
  const g = goal();
  $('hud-goalbar').hidden = !g;
  if(g){
    $('hud-goalname').textContent = g.emoji + ' ' + g.name;
    $('hud-goalprice').textContent = fmt(S.goalPrice);
    const paid = S.taksitPaidAmt, toward = Math.min(S.goalPrice, paid + Math.max(0, S.money));
    $('hud-bar').style.width = clamp(toward / Math.max(1,S.goalPrice) * 100, 0, 100) + '%';
    $('hud-taksit').textContent = `${S.taksitPaid}/${CONFIG.taksitCount} taksit · ${TAKSIT_STATUS[S.taksitPaid]}`;
    $('hud-keepsakes').innerHTML = META.keepsakes.map(k => `<span class="keep" title="${esc(KEEPSAKE_INFO[k]||'')}">${esc(KEEPSAKE_NAME[k]||k)}</span>`).join('');
  }
  renderAvatar($('hud-avatar'));
}
function flashPrice(up){ const el = $('hud-goalprice'); el.classList.remove('flash-up','flash-down'); void el.offsetWidth; el.classList.add(up?'flash-up':'flash-down'); }

const KEEPSAKE_NAME = { hayri_key:"Hayri'nin Anahtarı", hayri_glass:"Hayri'nin Bardağı", nebahat_bag:"Nebahat'in Poşeti", ferhat_alley:"Ferhat'ın Arka Sokağı", nuri_word:"Nuri'nin Sözü", musti_id:"Musti'nin Kimliği" };
const KEEPSAKE_INFO = { hayri_key:'4. kat ve üstü yarı enerji', hayri_glass:'Molalar +10 enerji', nebahat_bag:'Güne +10 enerji', ferhat_alley:'Kadıköy ve Üsküdar 1 km kısa', nuri_word:'Günlük gider −40 ₺', musti_id:'Yeni hesap bedava' };
const CHAR_NAME = { hayri:'Hayri Abi', nebahat:'Nebahat Teyze', ferhat:'Hızlı Ferhat', musti:'Kuzen Musti', nuri:'Nuri Bey' };
const CHAR_ROLE = { hayri:'Yıldız Apt. kapıcısı, Moda', nebahat:'komşu, Kuzguncuk', ferhat:'rakip kurye', musti:'kuzen, telefonda', nuri:'ev sahibi, Gültepe' };
const ENDING_NAME = { aldin:'Aldın', borek:'Börek Sonu', yeni_hesap:'Kovuldun ama durmadın' };

/* Mahalle defteri: karakterler, olgular, hatıralar, geçmiş koşular. Salt okunur. */
function renderMahalle(){
  const arcsDefined = (typeof ARC_BEATS !== 'undefined') ? ARC_BEATS : [];
  const chars = Object.keys(CHAR_NAME).map(k => {
    const r = clamp(rel(k), 0, 5), A = META.arcs[k];
    const beat = A && !A.done ? arcsDefined.find(b => b.arc === k && b.step === A.step) : null;
    const thread = A ? (A.done ? 'Hikaye tamamlandı.' : (beat ? (A.due && A.due > S.day ? `${beat.hookShort} · ${A.due - S.day} gün sonra` : beat.hook) : 'Bekliyor.')) : 'Henüz tanışmadınız.';
    return `<div class="card mcard"><div><div class="dots">${[0,1,2,3,4].map(i=>`<i class="${i<r?'on':''}"></i>`).join('')}</div></div><div><div class="nm">${CHAR_NAME[k]}</div><div class="small muted">${CHAR_ROLE[k]}</div><div class="small" style="margin-top:4px">${esc(thread)}</div></div></div>`;
  }).join('');
  const facts = Object.keys(META.facts).filter(f => FACT_TEXT[f]);
  const keeps = META.keepsakes.map(k => `<span class="keep">${KEEPSAKE_NAME[k]||k}</span>`).join('') || '<span class="muted small">Henüz yok.</span>';
  const runs = META.runs.slice(-10).reverse().map(r => `<div class="small">${r.result === 'win' ? '🏁' : r.result === 'borek' ? '🫓' : '⛔'} ${esc(r.goal)} · ${r.days} gün · ${r.result === 'win' ? 'alındı' : r.result === 'borek' ? 'börek sonu' : 'hesap kapandı'}</div>`).join('') || '<span class="muted small">İlk koşu.</span>';
  $('mahalle-body').innerHTML = chars +
    `<div class="card"><b>Mahallenin hatırladıkları</b><div class="small muted" style="margin-top:4px">${facts.length ? facts.map(f => esc(FACT_TEXT[f] || f)).join(' · ') : 'Henüz bir şey olmadı. Olacak.'}</div></div>
     <div class="card"><b>Hatıralar</b><div style="margin-top:6px">${keeps}</div></div>
     <div class="card"><b>Geçmiş koşular</b><div style="display:grid;gap:4px;margin-top:6px">${runs}</div><div class="small muted" style="margin-top:6px">Sonlar: ${META.endings.length}/3${META.endings.length ? ' · ' + META.endings.map(e=>ENDING_NAME[e]||e).join(', ') : ''}</div></div>`;
}
const FACT_TEXT = {
  volkan_ride:'Volkan\'la bir gün motora bindiniz.', kapitaldoor:'Yıldız Apt.\'ye karekodlu kapı geldi.', hayri_stayed:'Hayri Abi binada kaldı, danışman oldu.', hayri_left:'Hayri Abi Kastamonu\'ya gitti.', hayri_cold:'Hayri Abi seninle konuşmuyor.', hayri_key:'Hayri Abi\'nin anahtarı sende.',
  nebahat_nusret:'Nebahat Teyze rahmetli Nusret\'i anlattı.', nebahat_mutfak:'Nebahat\'in Mutfağı açıldı.', nebahat_tasindi:'Nebahat Teyze taşındı.', nebahat_kaldi:'Nebahat Teyze evinde kaldı.',
  ferhat_saved:'Ferhat düşünce durdun.', ferhat_grudge:'Ferhat düşünce durmadın.', ferhat_contract:'Ferhat\'ın filosuna sözleşmeyle girdin.', ferhat_contract_end:'Ferhat\'ın sözleşmesi bitti.', ferhat_forever:'Ferhat seni affetmedi.', ferhat_quit:'Ferhat kuryeliği bıraktı.',
  musti_gone:'Musti bir süre kayboldu.', musti_shared:'Hesabını Musti\'yle paylaştın.', musti_rival:'Musti kendi hesabını açtı.', musti_family:'Musti borcunu ödedi.', musti_burned:'Musti\'yle köprüler atıldı.',
  nuri_lesson:'Nuri Bey\'e uygulamayı öğrettin.', nuri_rival:'Nuri Bey bir gün kuryelik yaptı.', nuri_word:'Nuri Bey kirayı dondurdu.', nuri_moved:'Kağıthane\'ye taşındın.', nuri_courier:'Ev sahibin kurye oldu.',
  special_derbi:'Derbi gecesini temiz kapattın.', special_boykot:'Boykot günü hedefi tuttun.', special_kar:'Kar gününü atlattın.', boykot:'Boykot gününde kontak kapattın.', grev_kirici:'Boykot gününde çalıştın.', yeni_hesap:'Musti\'nin kimliğiyle devam ettin.'
};
function openMahalle(){ const vis = document.querySelector('.screen:not([hidden])'); returnScreen = vis ? vis.id : S.phase; renderMahalle(); show('s-mahalle'); }

/* Hedef seçimi: platform reklamı gibi */
function renderGoals(){
  const estimate = p => Math.max(1, Math.ceil(p / Math.max(600, avgNet())));
  $('goals').innerHTML = GOALS.map(g => `
    <button class="goal ${selectedGoal===g.id?'sel':''}" data-id="${g.id}">
      <div class="emoji">${g.emoji}</div>
      <div><div>${esc(g.name)}${g.id==='termos'?'<span class="rec">Platform tavsiyesi</span>':''}</div><div class="desc">${esc(g.desc)}</div><div class="eta">~${estimate(g.price)} gün · 4 taksit × ${fmt(g.price/4)}</div></div>
      <div class="price">${fmt(g.price)}</div>
    </button>`).join('');
  $('goals').querySelectorAll('.goal').forEach(b => b.onclick = () => { selectedGoal = b.dataset.id; renderGoals(); $('btn-goal-go').disabled = false; Sfx.click(); });
}
