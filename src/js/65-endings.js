/* ---------------- KAZANMA / KOVULMA ---------------- */
/* Pixel art: her satır bir piksel sırası, harfler PALETTE'ten renk, '.' boş. box-shadow ile çizilir. */
const PIXEL_ART = {
  termos: { pal:{X:'#1d1a2b',A:'#7fe0c3',B:'#f4f4f4',C:'#54b89c'}, rows:[
    '....XXXX....','...XAAAAX...','...XAAAAX...','..XXXXXXXX..','..XAAAAAAX..','..XAAAAACX..','..XABBBACX..','..XABBBACX..','..XAAAAACX..','..XAAAAACX..','..XAAAAACX..','..XAAAAACX..','..XCCCCCCX..','...XXXXXX...'] },
  phone: { pal:{X:'#1d1a2b',S:'#2b6cff',W:'#f4f4f4',K:'#111',G:'#48e08a'}, rows:[
    '..XXXXXXXX..','.XSSSSSSSSX.','.XSKKSSSSSX.','.XSKKSSSSSX.','.XSSSSSSSSX.','.XSSWWWSSSX.','.XSSWSWSSSX.','.XSSWWWSSSX.','.XSSSSSSSSX.','.XSSSGSSSSX.','.XSSSSSSSSX.','.XSSSSSSSSX.','.XSSSSSSSSX.','..XXXXXXXX..'] },
  tshirt: { pal:{X:'#1d1a2b',W:'#f4f4f4',L:'#ff5a1f'}, rows:[
    '.XXX....XXX.','XWWWXXXXWWWX','XWWWWWWWWWWX','XWWWWWWWWWWX','.XXWWWWWWXX.','..XWWWWWWX..','..XWWWWWWX..','..XWWWWWWX..','..XWWWWWWX..','..XWWWWLWX..','..XWWWWWWX..','..XXXXXXXX..'] },
  scooter: { pal:{X:'#1d1a2b',R:'#ff5a1f',K:'#222',W:'#f4f4f4'}, rows:[
    '........XX..','........XRX.','........XRX.','........XRX.','........XRX.','........XRX.','........XRX.','.XXXXXXXXRX.','XRRRRRRRRRRX','XRRRRRRRRRRX','.XKX....XKX.','.XKX....XKX.'] }
};
function pixelHTML(key, size){
  const art = PIXEL_ART[key]; if(!art) return '';
  const sh = [];
  art.rows.forEach((row,y) => [...row].forEach((ch,x) => { if(ch !== '.' && art.pal[ch]) sh.push(`${x*size}px ${y*size}px 0 0 ${art.pal[ch]}`); }));
  const w = art.rows[0].length*size, h = art.rows.length*size;
  return `<div class="pxwrap" style="width:${w}px;height:${h}px"><div class="px" style="width:${size}px;height:${size}px;box-shadow:${sh.join(',')}"></div></div>`;
}
function showWin(){
  const g = goal();
  renderAvatar($('win-avatar'));
  const likes = rint(7,14), views = rint(38,61);
  const next = /\d/.test(g.name) ? g.name.replace(/\d+/, m=>+m+1) : g.name + ' 2.0';
  $('win-big').innerHTML = `${g.emoji}<br>ALDIN!`;
  $('win-card').innerHTML = `
    <div class="story">
      <div class="story-top"><div class="story-av"></div><div><b>${slug(S.name)}_kurye</b> <span class="muted">· az önce</span></div></div>
      <div class="story-img">${pixelHTML(g.art, 10)}</div>
      <div class="story-bar"><span>❤️ ${likes}</span><span>💬 1</span><span>✈️ 0</span><span class="muted" style="margin-left:auto">${views} görüntülenme</span></div>
      <div class="story-cap"><b>${slug(S.name)}_kurye</b> Nihayet. 🙏 #hedef #emek #kapitaleats</div>
      <div class="story-cap muted"><b>musti_kuzen</b> kaç para</div>
    </div>
    <p class="twist">Tebrikler. Story'ni ${likes} kişi beğendi. Kazandın.</p>
    <p><b>${g.name}</b> artık senin. ${S.day} gün, ${S.accepted} teslimat, ${(S.hayri||0)} Hayri Abi, ${(S.nebahat||0)} börek.</p>
    <p class="muted small">3 gün sonra "${next}" tanıtıldı. Seninki "klasik" oldu. Klasik, "eski" demenin kibar hali.</p>
    <p class="muted small">Kalan para: ${fmt(S.money - S.goalPrice)}. Yeni bir hedef seçebilirsin. Seçersin.</p>`;
  S.money -= S.goalPrice; S.goalId = null;
  clearSave();
  show('s-win'); Sfx.tada();
}
function showFired(reason){
  renderAvatar($('fired-avatar'));
  $('fired-card').innerHTML = `
    <p><b>Hesabın askıya alındı.</b></p>
    <p>${reason}</p>
    <p class="muted small">${S.day} gün dayandın, ${S.accepted} paket taşıdın, kasada ${fmt(S.money)} kaldı. Hedefe ${fmt(Math.max(0,S.goalPrice-S.money))} vardı. Hiç olmadığı kadar yakındın. Değildin.</p>
    <p class="twist">Destek botu: "Başvurunuzu 3-5 iş günü içinde inceleyeceğiz." (İncelemeyecek.)</p>`;
  S.goalId = null; clearSave();
  show('s-fired');
}
function restart(){
  selectedGoal = null;
  S = Object.assign(defaultState(), { owned:S.owned, equipped:S.equipped, money:Math.max(CONFIG.startMoney, S.money) });
  renderGoals(); $('btn-start').disabled = true; $('btn-continue').hidden = true; renderAllAvatars(); show('s-start');
}

