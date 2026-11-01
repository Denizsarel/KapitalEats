/* ---------------- SONLAR ----------------
   Pixel art: her satır bir piksel sırası, harfler palette'ten renk, '.' boş. box-shadow ile çizilir. */
const PIXEL_ART = {
  termos: { pal:{X:'#1d1a2b',A:'#7fe0c3',B:'#f4f4f4',C:'#54b89c'}, rows:[
    '....XXXX....','...XAAAAX...','...XAAAAX...','..XXXXXXXX..','..XAAAAAAX..','..XAAAAACX..','..XABBBACX..','..XABBBACX..','..XAAAAACX..','..XAAAAACX..','..XAAAAACX..','..XAAAAACX..','..XCCCCCCX..','...XXXXXX...'] },
  phone: { pal:{X:'#1d1a2b',S:'#2b6cff',W:'#f4f4f4',K:'#111',G:'#48e08a'}, rows:[
    '..XXXXXXXX..','.XSSSSSSSSX.','.XSKKSSSSSX.','.XSKKSSSSSX.','.XSSSSSSSSX.','.XSSWWWSSSX.','.XSSWSWSSSX.','.XSSWWWSSSX.','.XSSSSSSSSX.','.XSSSGSSSSX.','.XSSSSSSSSX.','.XSSSSSSSSX.','.XSSSSSSSSX.','..XXXXXXXX..'] },
  tshirt: { pal:{X:'#1d1a2b',W:'#f4f4f4',L:'#ff5a1f'}, rows:[
    '.XXX....XXX.','XWWWXXXXWWWX','XWWWWWWWWWWX','XWWWWWWWWWWX','.XXWWWWWWXX.','..XWWWWWWX..','..XWWWWWWX..','..XWWWWWWX..','..XWWWWWWX..','..XWWWWLWX..','..XWWWWWWX..','..XXXXXXXX..'] },
  scooter: { pal:{X:'#1d1a2b',R:'#ff5a1f',K:'#222',W:'#f4f4f4'}, rows:[
    '........XX..','........XRX.','........XRX.','........XRX.','........XRX.','........XRX.','........XRX.','.XXXXXXXXRX.','XRRRRRRRRRRX','XRRRRRRRRRRX','.XKX....XKX.','.XKX....XKX.'] },
  borek: { pal:{X:'#1d1a2b',B:'#e2a640',C:'#c47e22',W:'#f4f4f4'}, rows:[
    '............','..XXXXXXXX..','.XBBBBBBBBX.','.XBCCBBCCBX.','.XBBBBBBBBX.','.XCCBBCCBBX.','.XBBBBBBBBX.','.XBBCCBBCCX.','.XBBBBBBBBX.','..XXXXXXXX..','....WWWW....','...WWWWWW...'] }
};
function pixelHTML(key, size){
  const art = PIXEL_ART[key]; if(!art) return '';
  const sh = [];
  art.rows.forEach((row,y) => [...row].forEach((ch,x) => { if(ch !== '.' && art.pal[ch]) sh.push(`${x*size}px ${y*size}px 0 0 ${art.pal[ch]}`); }));
  const w = art.rows[0].length*size, h = art.rows.length*size;
  return `<div class="pxwrap" style="width:${w}px;height:${h}px"><div class="px" style="width:${size}px;height:${size}px;box-shadow:${sh.join(',')}"></div></div>`;
}
function bankRun(result){
  const g = goal();
  META.runs.push({ goal: g ? g.name : '—', days:S.day, result, net:S.money, account:S.account, day: Date.now() });
  if(result === 'win') META.metrics.wins++; if(result === 'fired') META.metrics.fired++;
  if(result === 'win' && !META.endings.includes('aldin')) META.endings.push('aldin');
  if(result === 'borek' && !META.endings.includes('borek')) META.endings.push('borek');
  saveMeta();
}
function showWin(){
  const g = goal(); if(!g) return;
  renderAvatar($('win-avatar'));
  const likes = rint(7,14), views = rint(38,61);
  const next = /\d/.test(g.name) ? g.name.replace(/\d+/, m=>+m+1) : g.name + ' 2.0';
  const u = slug(S.name) + '_kurye';
  $('win-big').innerHTML = `${g.emoji}<br>ALDIN!`;
  $('win-card').innerHTML = `
    <div class="story">
      <div class="story-top"><div class="story-av"></div><div><b>${esc(u)}</b> <span class="muted">· az önce</span></div></div>
      <div class="story-img">${pixelHTML(g.art, 10)}</div>
      <div class="story-bar"><span>❤️ ${likes}</span><span>💬 1</span><span>✈️ 0</span><span class="muted" style="margin-left:auto">${views} görüntülenme</span></div>
      <div class="story-cap"><b>${esc(u)}</b> Nihayet. 🙏 #hedef #emek #kapitaleats</div>
      <div class="story-cap muted"><b>musti_kuzen</b> kaç para</div>
    </div>
    <p class="twist">Tebrikler. Story'ni ${likes} kişi beğendi. Kazandın.</p>
    <p><b>${esc(g.name)}</b> artık senin. ${S.day} gün, ${S.accepted} teslimat, ${S.account > 1 ? S.account + ' hesap, ' : ''}${rel('hayri')} kez Hayri Abi, ${rel('nebahat')} kez Nebahat Teyze.</p>
    <p class="muted small">Üç gün sonra "${esc(next)}" tanıtıldı. Seninki vitrinden "klasik" rafına indi.</p>
    <p class="muted small">Kasada ${fmt(S.money)} kaldı. Mahalle de yerinde: Hayri Abi, Nebahat Teyze, Ferhat. Yeni hedefte seni hatırlayacaklar.</p>`;
  bankRun('win');
  S.goalId = null; S.won = true;
  clearSave(); saveMeta();
  show('s-win'); Sfx.tada(); Haptic.big();
}
function showEnding(kind){
  if(kind !== 'borek') return;
  renderAvatar($('win-avatar'));
  $('win-big').innerHTML = `🫓<br>BÖREK SONU`;
  $('win-card').innerHTML = `
    <div class="story" style="border-color:var(--line)">
      <div class="story-top"><div class="story-av" style="background:#c47e22"></div><div><b>nebahatin_mutfagi</b> <span class="muted">· 1 saat önce</span></div></div>
      <div class="story-img" style="background:radial-gradient(circle at 50% 40%,#5a3a16,#120f1c 70%)">${pixelHTML('borek', 10)}</div>
      <div class="story-bar"><span>❤️ 0</span><span>💬 0</span><span class="muted" style="margin-left:auto">3 görüntülenme</span></div>
      <div class="story-cap"><b>nebahatin_mutfagi</b> Açıldık. Kuzguncuk, İcadiye Cad. Kuryemiz var.</div>
    </div>
    <p class="twist">Story'ni kimse beğenmedi. Nebahat Teyze telefonu ters tutuyordu.</p>
    <p>Hedefi bırakıp ${fmt(Math.round(S.goalPrice*0.6))} lirayı mutfağın tüpüne, fırınına ve ilk ay kirasına koydun. ${esc(S.name)}, artık tek bir restorana çalışıyorsun; ücret düşük, börek sıcak, Nusret'in fotoğrafı tezgahın üstünde.</p>
    <p class="muted small">${S.day} gün sürdü. ${goal() ? esc(goal().name) : 'Hedef'} vitrinde kaldı; üç gün sonra zamlandı, sen görmedin.</p>`;
  bankRun('borek');
  S.goalId = null; S.won = true;
  clearSave(); saveMeta();
  show('s-win'); Sfx.tada(); Haptic.big();
}
/* Kovulma: hesap askıya alınır, Musti'nin kimliğiyle devam edilebilir. Mahalle silinmez. */
function showFired(reason){
  S.firedReason = reason; META.metrics.fired++; META.metrics.firedDay = S.day;
  renderAvatar($('fired-avatar'));
  const cost = P('newAccountCost', rel('musti') >= 3 ? 0 : Math.min(500, Math.round(0.15 * Math.max(0, S.money))));
  const sms = rel('musti') <= 0 && META.arcs.musti && META.arcs.musti.flags && META.arcs.musti.flags.burned ? 'kuzen bi sn' : `kuzen sıkıntı yok benim kimlik duruyo ${cost ? cost + ' ver' : 'bedava'} halledicez`;
  $('fired-card').innerHTML = `
    <div class="card platform news" style="margin:0 0 8px"><div class="kicker">KAPİTALEATS DESTEK</div><p class="small">${esc(reason.text)} Geri bildiriminiz bizim için değerli 💙 Talep no: #${META.ticketNo++}</p><p class="small muted">Talebiniz 3-5 iş günü içinde değerlendirilecektir.</p></div>
    <div class="phone"><div class="from">💬 Kuzen Musti · az önce</div><div class="sms">${esc(sms)}</div></div>
    <p class="small muted" style="margin-top:8px">${S.day} gün, ${S.accepted} teslimat, kasada ${fmt(S.money)}. Hedefe ${fmt(Math.max(0, S.goalPrice - S.taksitPaidAmt - Math.max(0,S.money)))} vardı. Puan sıfırlandı. Hayri Abi sıfırlanmadı.</p>`;
  S.newAccountCost = cost;
  $('btn-fired-musti').textContent = `Musti'nin kimliğiyle devam et${cost ? ` (−${fmt(cost)})` : ''}`;
  $('btn-fired-musti').disabled = false;
  S.goalIdBackup = S.goalId;
  show('s-fired'); Sfx.buzz(); Haptic.bad();
}
function newAccount(){
  const cost = S.newAccountCost || 0;
  if(S.money >= cost) S.money -= cost; else { S.debt = cost - Math.max(0, S.money); S.money = Math.max(0, S.money) - Math.min(cost, Math.max(0, S.money)); }
  S.account++; META.metrics.newAccounts++; META.metrics.continues++;
  if(!META.endings.includes('yeni_hesap')) META.endings.push('yeni_hesap');
  S.rating = CONFIG.startRating; S.complaints = 0; S.offered = 0; S.accepted = 0; S.cleanStreak = 0; S.newAccountDays = 3; S.lastComplaintDay = S.day;
  writeFact('yeni_hesap');
  // kalan turlar iptal; gün biter
  S.shiftEnded = true; S.current = null;
  saveMeta(); endDay();
}
function restart(){
  selectedGoal = null; S = defaultState(); S.dayRounds = CONFIG.day1Rounds;
  renderAllAvatars(); shownMoney = null; renderStart(); show('s-start');
}
