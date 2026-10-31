function show(id){
  document.querySelectorAll('.screen').forEach(s => s.hidden = (s.id !== id));
  $('hud').hidden = (id === 's-start');
  document.querySelector('main').scrollTop = 0;
  if(id !== 's-away') S.phase = id; // ara ekran, kaldığın yeri ezmesin
  save();
  if(S.goalId) renderHUD(); // saat ve hava simgesi ekrana göre değişir
}

function renderAvatar(el){
  if(!el) return;
  if(!el.children.length){
    el.innerHTML = ['av-wheel b','av-wheel f','av-body','av-seat','av-front','av-bar','av-light','av-legs','av-foot','av-bag','av-jacket','av-zip','av-arm','av-glove','av-head','av-hair','av-helmet','av-visor']
      .map(c=>`<div class="${c}"></div>`).join('');
  }
  let nohelmet = false, shape = '';
  for(const slot in S.equipped){
    const it = SHOP.find(x=>x.id===S.equipped[slot]);
    if(!it || slot === 'side') continue;
    el.style.setProperty('--'+slot, it.color);
    if(it.nohelmet) nohelmet = true;
    if(it.shape) shape = it.shape;
  }
  el.classList.toggle('nohelmet', nohelmet);
  ['ears','pika','horns','half'].forEach(sh => el.classList.toggle('h-'+sh, shape === sh));
}
function renderAllAvatars(){ ['hud-avatar','start-avatar','ride-avatar','shop-avatar','win-avatar','fired-avatar'].forEach(id=>{ const h = $(id); if(h){ h.classList.add('avatar'); renderAvatar(h); } }); }

function renderHUD(){
  const inShift = S.goalId && !['s-news','s-dayend','s-start'].includes(S.phase) && S.orderIdx < CONFIG.ordersPerDay;
  $('hud-day').textContent = 'GÜN ' + S.day + (inShift ? ' · ' + hourStr() : '') + ' ' + (inShift && isNight() ? '🌙' : wx().emoji);
  $('hud-money').textContent = fmt(S.money);
  $('hud-rating').textContent = S.rating.toFixed(1);
  $('hud-accept').textContent = Math.round(acceptRate()*100) + '%';
  const w = wear(); $('hud-wear').textContent = w + '%'; $('hud-wear').style.color = w >= 80 ? 'var(--bad)' : (w >= 50 ? 'var(--accent2)' : 'var(--fg)');
  $('btn-sound').textContent = Sfx.on ? '🔊' : '🔇';
  const en = clamp(S.energy, 0, CONFIG.energyMax);
  $('hud-energy-txt').textContent = en;
  $('hud-energy').style.width = en + '%';
  $('hud-energy').style.background = en < 30 ? 'var(--bad)' : (en < 60 ? 'var(--accent2)' : 'var(--good)');
  $('hud-tariff').textContent = (S.goalId && !['s-news','s-dayend','s-start'].includes(S.phase) && S.orderIdx < CONFIG.ordersPerDay && isNight()) ? `🌙 Gece tarifesi ×${CONFIG.nightFeeMult}` : (isWeekend() ? '🎉 Hafta sonu' : '');
  const g = goal();
  if(g){
    $('hud-goalname').textContent = g.emoji + ' ' + g.name;
    $('hud-goalprice').textContent = fmt(S.goalPrice);
    $('hud-bar').style.width = clamp(S.money / S.goalPrice * 100, 0, 100) + '%';
  }
  renderAvatar($('hud-avatar'));
}
function flashPrice(up){ const el = $('hud-goalprice'); el.classList.remove('flash-up','flash-down'); void el.offsetWidth; el.classList.add(up?'flash-up':'flash-down'); }

