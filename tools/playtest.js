#!/usr/bin/env node
// Otomatik oyun testi: oyunu headless Chromium'da N gün oynar, hataları ve istatistikleri raporlar.
//   node tools/playtest.js [--days 3] [--policy greedy|random|safe] [--goal termos] [--events 0.6] [--musti] [--shots dir] [--json] [--verbose]
const { chromium } = require('playwright');
const path = require('path');
const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i+1] && !arr[i+1].startsWith('--') ? arr[i+1] : true] : null).filter(Boolean));
const DAYS = +(args.days || 3), POLICY = args.policy || 'greedy', GOAL = args.goal || 'termos', EVENTS = args.events !== undefined ? +args.events : null;
const file = 'file://' + path.resolve(__dirname, '..', 'index.html');
const log = (...a) => { if (args.verbose) console.log(...a); };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  const out = { days: [], events: {}, arcs: {}, tasksDone: 0, taksitPaid: 0, errors: errs, ended: null };
  await p.goto(file);
  await p.click('#btn-start'); await p.waitForSelector('#s-news:not([hidden])');
  await p.evaluate((ev) => { CONFIG.rideMs = 120; CONFIG.rideSkipAfterMs = 50; CONFIG.stampMs = 30; if (ev !== null) CONFIG.eventChance = ev; }, EVENTS);
  const visible = async (id) => !(await p.isHidden(id));
  const chooseBtn = async (sel) => { const btns = await p.$$(sel); if (!btns.length) return false; const i = POLICY === 'random' ? Math.floor(Math.random() * btns.length) : (POLICY === 'safe' ? btns.length - 1 : 0); await btns[i].click(); return true; };
  let daysPlayed = 0, guard = 0;
  while (daysPlayed < DAYS && guard++ < 2000) {
    await p.waitForSelector('#s-news:not([hidden]), #s-goal:not([hidden]), #s-order:not([hidden]), #s-result:not([hidden]), #s-fired:not([hidden]), #s-dayend:not([hidden]), #s-win:not([hidden]), #s-event:not([hidden]), #s-week:not([hidden]), #s-ride:not([hidden])', { timeout: 15000 });
    if (await visible('#s-ride')) { await p.waitForTimeout(150); continue; }
    if (await visible('#s-win')) { out.ended = 'win'; break; }
    if (await visible('#s-fired')) { if (args.musti) { await p.click('#btn-fired-musti'); out.newAccounts = (out.newAccounts || 0) + 1; continue; } out.ended = 'fired'; break; }
    if (await visible('#s-week')) { await p.click('#btn-week-go'); continue; }
    if (await visible('#s-goal')) { await p.click(`.goal[data-id="${GOAL}"]`); await p.click('#btn-goal-go'); continue; }
    if (await visible('#s-news')) {
      if (await p.$('#phone-card button')) { await chooseBtn('#phone-card button'); await p.waitForTimeout(100); out.arcs.musti = (out.arcs.musti || 0) + 1; }
      await p.click('#btn-news-go'); continue;
    }
    if (await visible('#s-result')) { await p.click('#btn-res-next'); continue; }
    if (await visible('#s-event')) {
      const t = (await p.textContent('#ev-title')).trim(); const stage = await p.textContent('#ev-stage');
      if (stage.startsWith('Mahalle')) { const arc = await p.evaluate(() => currentEvent && currentEvent.arc); out.arcs[arc] = (out.arcs[arc] || 0) + 1; } else out.events[t] = (out.events[t] || 0) + 1;
      if (!(await p.isHidden('#ev-name'))) await p.fill('#ev-name', 'Deniz');
      const ok = await chooseBtn('#ev-choices button'); if (!ok) { await p.click('#btn-ev-next'); continue; }
      await p.waitForSelector('#ev-result:not([hidden])'); await p.click('#btn-ev-next'); continue;
    }
    if (await visible('#s-dayend')) {
      if (await p.$('#de-knock button')) { await chooseBtn('#de-knock button'); out.arcs.nuri = (out.arcs.nuri || 0) + 1; await p.waitForTimeout(100); }
      if (await p.$('#btn-taksit:not([disabled])')) { await p.click('#btn-taksit'); out.taksitPaid++; await p.waitForTimeout(100); if (await visible('#s-win')) continue; }
      const st = await p.evaluate(() => ({ day: S.day, money: S.money, rating: +S.rating.toFixed(2), energy: S.energy, wear: wear(), complaints: S.complaints, accepted: S.accepted, taskDone: !!(S.task && S.task.done), net: S.lastNet, hook: $('btn-sleep').textContent }));
      out.days.push(st); if (st.taskDone) out.tasksDone++;
      log(`day ${st.day}: money ${st.money} net ${st.net} rating ${st.rating} energy ${st.energy} wear ${st.wear}% complaints ${st.complaints} | ${st.hook}`);
      if (args.shots) await p.screenshot({ path: path.join(args.shots, `day${st.day}-end.png`), fullPage: true });
      daysPlayed++;
      if (daysPlayed >= DAYS) break;
      await p.click('#btn-sleep'); continue;
    }
    if (await visible('#s-order')) {
      const idx = await p.evaluate((pol) => { if (!S.offers || !S.offers.length) return -1; const story = S.offers.findIndex(o => o.story); if (story >= 0 && pol !== 'random') return story; if (pol === 'random') return Math.floor(Math.random() * S.offers.length); let best = 0, bv = -1e9; S.offers.forEach((o, i) => { const v = pol === 'safe' ? -o.km : o.fee - o.fuel; if (v > bv) { bv = v; best = i; } }); return best; }, POLICY);
      const skipBtn = await p.$('#btn-skip:not([disabled]):not([hidden])');
      if (idx < 0 || (POLICY === 'random' && Math.random() < 0.08 && skipBtn)) { if (skipBtn) { await p.click('#btn-skip'); await p.waitForTimeout(650); } continue; }
      const take = await p.$(`#offers .take[data-i="${idx}"]:not([disabled])`); if (!take) { await p.waitForTimeout(200); continue; }
      await take.click(); await p.waitForSelector('#s-order', { state: 'hidden', timeout: 10000 }); continue;
    }
  }
  await b.close();
  if (args.json) console.log(JSON.stringify(out, null, 1));
  else {
    out.days.forEach(d => console.log(`day ${d.day}: money ${d.money} net ${d.net} rating ${d.rating} energy ${d.energy} wear ${d.wear}% complaints ${d.complaints} | ${d.hook}`));
    console.log('events:', out.events); console.log('arcs:', out.arcs, 'tasksDone:', out.tasksDone, 'taksit:', out.taksitPaid, 'newAccounts:', out.newAccounts || 0);
    console.log('ended:', out.ended || 'still playing'); console.log('errors:', errs.length ? errs : 'none');
  }
  process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('FAIL', e.message); process.exit(2); });
