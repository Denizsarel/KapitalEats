#!/usr/bin/env node
// Otomatik oyun testi: oyunu headless Chromium'da N gün oynar, hataları ve istatistikleri raporlar.
//   node tools/playtest.js [--days 3] [--policy greedy|random|safe] [--goal termos] [--events 0.6] [--shots dir] [--json]
const { chromium } = require('playwright');
const path = require('path');
const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i+1] && !arr[i+1].startsWith('--') ? arr[i+1] : true] : null).filter(Boolean));
const DAYS = +(args.days || 3), POLICY = args.policy || 'greedy', GOAL = args.goal || 'termos', EVENTS = args.events !== undefined ? +args.events : null;
const file = 'file://' + path.resolve(__dirname, '..', 'index.html');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  const out = { days: [], events: {}, errors: errs, ended: null };
  await p.goto(file);
  await p.fill('#name-input', 'TestKurye').catch(() => {});
  await p.click(`.goal[data-id="${GOAL}"]`); await p.click('#btn-start'); await p.waitForSelector('#s-news:not([hidden])');
  await p.evaluate((ev) => { CONFIG.rideMs = 120; CONFIG.stampMs = 30; if (ev !== null) CONFIG.eventChance = ev; }, EVENTS);
  const visible = async (id) => !(await p.isHidden(id));
  for (let day = 0; day < DAYS; day++) {
    if (await visible('#s-week')) await p.click('#btn-week-go');
    if (await visible('#s-news')) await p.click('#btn-news-go');
    for (let guard = 0; guard < 120; guard++) {
      await p.waitForSelector('#s-order:not([hidden]), #s-result:not([hidden]), #s-fired:not([hidden]), #s-dayend:not([hidden]), #s-win:not([hidden]), #s-event:not([hidden])', { timeout: 15000 });
      if (await visible('#s-dayend')) break;
      if (await visible('#s-fired')) { out.ended = 'fired'; break; }
      if (await visible('#s-win')) { out.ended = 'win'; break; }
      if (await visible('#s-result')) { await p.click('#btn-res-next'); continue; }
      if (await visible('#s-event')) {
        const t = (await p.textContent('#ev-title')).trim(); out.events[t] = (out.events[t] || 0) + 1;
        const btns = await p.$$('#ev-choices button'); if (!btns.length) { await p.click('#btn-ev-next'); continue; }
        const i = POLICY === 'random' ? Math.floor(Math.random() * btns.length) : (POLICY === 'safe' ? btns.length - 1 : 0);
        await btns[i].click(); await p.waitForSelector('#ev-result:not([hidden])'); await p.click('#btn-ev-next'); continue;
      }
      // order screen
      const idx = await p.evaluate((pol) => { if (!S.offers || !S.offers.length) return -1; if (pol === 'random') return Math.floor(Math.random() * S.offers.length); let best = 0, bv = -1e9; S.offers.forEach((o, i) => { const v = pol === 'safe' ? -o.km : o.fee - o.fuel; if (v > bv) { bv = v; best = i; } }); return best; }, POLICY);
      if (idx < 0) { await p.click('#btn-skip'); await p.waitForTimeout(600); continue; }
      await p.click(`#offers .take[data-i="${idx}"]`);
      await p.waitForSelector('#s-order', { state: 'hidden', timeout: 10000 });
    }
    if (out.ended) break;
    const st = await p.evaluate(() => ({ day: S.day, money: S.money, rating: +S.rating.toFixed(2), energy: S.energy, wear: wear(), complaints: S.complaints, accepted: S.accepted }));
    out.days.push(st);
    if (args.shots) await p.screenshot({ path: path.join(args.shots, `day${st.day}-end.png`), fullPage: true });
    await p.click('#btn-sleep');
    await p.waitForSelector('#s-news:not([hidden]), #s-week:not([hidden])');
  }
  await b.close();
  if (args.json) console.log(JSON.stringify(out, null, 1));
  else {
    out.days.forEach(d => console.log(`day ${d.day}: money ${d.money} rating ${d.rating} energy ${d.energy} wear ${d.wear}% complaints ${d.complaints}`));
    console.log('events:', out.events); console.log('ended:', out.ended || 'still playing'); console.log('errors:', errs.length ? errs : 'none');
  }
  process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('FAIL', e.message); process.exit(2); });
