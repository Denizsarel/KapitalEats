# KapitalEats — content contract (for writers and engine, v8)

Read this whole file before editing anything. The engine (files 50–66) is being written in parallel by the lead;
content files are yours. Never edit a file you do not own. Never run git. Verify with:

    node --check src/js/<your-file>.js      # must pass
    node build.js                           # must print index.html size (if it fails because of ANOTHER file, say so in your report and move on)

Build order = filename sort in src/js/. Data files (30–44) load before engine files (50–66), so data files may
only reference other data by name inside functions (build/make/test), never at top level.

## Files and owners

| file | owner | content |
|---|---|---|
| src/js/40-events.js | writer:events | existing EVENTS rewritten to the style guide (ids, effects, conditions unchanged) |
| src/js/32-orders-data.js | writer:world | RESTAURANTS tags, DISTRICTS blurbs (day+night), NOTES, PLATFORM_MSGS, new REGULARS, DETAILS bank |
| src/js/33-voice-reviews.js | writer:voice | INNER_VOICE as a cast, REVIEWS with archetypes |
| src/js/42-arcs-hayri.js … 42-arcs-nuri.js | writer:arc-<name> | ARC_BEATS for one character |
| src/js/43-tasks.js | writer:systems | TASKS (Günün Görevi) templates |
| src/js/44-special-rules.js | writer:systems | SPECIAL_DAYS, RULES (Kullanım Koşulları), PROGRAMS |
| everything else | lead | engine, HUD, config, shop |

The lead guarantees these globals exist before your file runs: `CONFIG`, `GOALS`, `WEATHER`, `NEWS`,
`RESTAURANTS`, `DISTRICTS`, `NOTES`, `FIRST_NAMES`, `SURNAME_INITIALS`, `BUILDINGS`, `PLATFORM_MSGS`, `INNER_VOICE`,
`REVIEWS`, `EVENTS`, `SHOP`, and (declared in 42-arcs-00-base.js, before your arc file) `const ARC_BEATS = []`.
Helpers available inside functions at runtime: `pick, rint, rnd, fmt, clamp, shuffle, memChoices, decoyNums,
decoyNames, wear, isNight, isWeekend, curHour, wx, fact(key), hasFact(key), rel(name)` and the state `S` and `META`.

## State you can read (never write directly; use effects)

`S` (run): day, money, rating, energy, streak, complaints, weather ('sunny'|'rain'|'snow'), todayTags, orderIdx,
goalId, goalPrice, taksitPaid (0–4), account (1 = own, 2+ = Musti's), name (courier name), program, rules[].
`META` (forever): chars {hayri,nebahat,ferhat,musti,nuri} relationship integers; arcs {hayri:{step,due,defer,flags}};
facts {key:{day}}; customers[]; keepsakes[]; endings[]; runs[].
Order `o` passed to build(): rest, restTag, lines[{emoji,name,price,qty}], total, customer, hood, street, no, building,
floor, apt, payment ('online'|'nakit'), district, districtDat, km, fee, fuel, note, noteKey, noteValue, story (arc id if story ticket).

## Effects (allowed keys in `effects:{}`; all optional)

money, tip, tipPct (0.2 = 20% of fee), rating (+/- float), feeLost, complaint, energy (+/-), expense (+/- today's
daily expense), breakNext, streakReset, wearSet (0–100), wearAdd, goalPrice (multiplier), giftItem (true: random
cheap unowned cosmetic), skipDelivery,
**new**: `rel:{hayri:+1}` (relationship), `sets:{flag:true}` (arc flags; only inside ARC_BEATS), `fact:'key'`
(write a fact), `keepsake:'id'` (only in final arc beats), `unlockRestaurant:{…}` (same shape as RESTAURANTS entries),
`ending:'borek'` (only final beats), `expenseDaily:+30` (permanent change to CONFIG-level daily expense for this run).

Choices: `{ label, result, effects }` or `{ label, outcomes:[{chance, result, effects}] }`. 2–3 choices. Labels are
plain verbs, no emoji, ≤ 32 chars. `result` ≤ 70 words.

## EVENTS schema (unchanged) — 40-events.js

`{ id, title, stage, text | build(o,S)→{text,choices}, weight, minDay, weather:[], tags:[], km:[min,max], priority,
condition(S,o), reviews:{good:[],bad:[]}, requires:['fact'], forbids:['fact'], choices:[…] }`. New optional
`requires/forbids` gate on META.facts keys. Keep every existing id. You may add events.

## ARC_BEATS schema — 42-arcs-*.js

```js
ARC_BEATS.push({
  arc: 'hayri',               // hayri | nebahat | ferhat | musti | nuri
  step: 1,                    // 1..N sequential; step 1 of every arc is due on its startDay
  startDay: 1,                // only on step 1: first day it can fire
  dueGap: 2,                  // days after this beat resolves until the next step is due
  mode: 'ticket',             // 'ticket': a story order to `address`, event fires after the ride
                              // 'ride':   fires on any ride with km >= minKm (Ferhat)
                              // 'phone':  a phone card in the morning bulletin (Musti)
                              // 'knock':  a card at day end (Nuri Bey)
  address: { district:'Kadıköy', hood:'Moda', street:'Moda Cad.', no:14, building:'Yıldız Apt.', floor:3, apt:7,
             customer:'Hayri Abi' },            // ticket mode only; the engine picks a restaurant serving that district
  minKm: 4,                                     // ride mode only
  districts: ['Kadıköy','Üsküdar'],             // ride mode only, optional: beat fires only on rides to these districts (engine default for ferhat)
  gate: (S, A) => true,                         // optional; A = META.arcs[arc]; if false the beat waits (due = tomorrow)
  hook: 'Hayri Abi oğlundan mektup geldi dedi, yarın okuyacak.',   // YARIN card sentence (≤ 90 chars)
  hookShort: "Hayri'nin mektubu",                // ≤ 24 chars, printed on the sleep button
  build: (o, S, A) => ({
    title: 'MEKTUP',                            // CAPS, ≤ 28 chars
    text: '…',                                  // ≤ 70 words; real dialogue in quotes
    choices: [ { label:'…', result:'…', effects:{ rel:{hayri:1}, sets:{knowsGoal:true} } }, … ]
  }),
  final: false                                  // true on the last beat of a branch; its effects may include keepsake/ending
});
```
Scheduling: the engine runs up to three beats per day, one per slot: main (ticket or ride), phone (morning bulletin) and knock (day end). A beat the player misses is deferred to the next day; a ticket beat deferred once fires on any order, a ride beat deferred twice fires on any ride. A new run resets every pending beat's due day so queued beats continue on day 1.
Branching: read `A.flags` and `S.rating`, `hasFact()` inside build() to vary text and choices; use `gate` to delay.
Each arc: 5–6 beats, ≤ 2 cards per beat (a beat may return `{title,text,choices}` where a choice's `result` is the
second card). Payoffs must change the game (keepsake, unlockRestaurant, ending, rel-dependent later text).
Keepsake ids (engine implements the numbers): `hayri_key` (floors ≥4 cost half energy), `hayri_glass` (breaks +10
energy), `nebahat_bag` (+10 energy at day start), `ferhat_alley` (Kadıköy/Üsküdar km −1), `nuri_word` (daily expense
−40), `musti_id` (new account free).

## TASKS schema — 43-tasks.js

```js
const TASKS = [
  { id:'district2', weight:3, fake:false,
    make: (S) => { const d = pick(DISTRICTS).name; return {
      text: `${d} tarafına 2 teslimat`,          // platform voice, ≤ 60 chars, no irony
      target: 2, reward: 200,
      test: (kind, data) => kind === 'deliver' && data.district === d   // returns true for each unit of progress
    }; } },
];
```
Event kinds the engine emits: `deliver` {district, km, night, payment, tip, fee, weather}, `accept` {km}, `skip`,
`break`, `event` {eventId, label}, `nakit` {change ok?}. 10–14 templates; 1 in 4 days the engine picks a `fake:true`
task (reward 0, platform-love text).

## SPECIAL_DAYS / RULES / PROGRAMS — 44-special-rules.js

```js
const SPECIAL_DAYS = [
  { id:'derbi', name:'Derbi Gecesi', emoji:'⚽',
    announce: 'Cumartesi derbi var. …',           // news card 2 days before (platform/news voice)
    morning: '…',                                  // bulletin card on the day
    effect: { weather:'rain', feeMult:1.5, eventChance:0.75, tags:['derby','night'] },
    target: { deliveries:5, maxComplaints:1 },
    clearText: '…', failText: '…' },
];
const RULES = [   // one per Monday, in order
  { id:'foto', week:2, title:'Fotoğraflı Teslimat', body:'…platform voice…',
    effect: { enableEvent:'foto_kat' } },   // enableEvent is informational: the event gates itself on S.rules.includes('foto')
  { id:'surge', week:3, title:'Dinamik Ücretlendirme', body:'…', effect:{ feeMult:0.95, surge:true } },
  { id:'kesinti', week:4, title:'Kurye Katkı Payı', body:'…', effect:{ cutPct:3 } },
  { id:'gece', week:5, title:'Gece Kotası', body:'…', effect:{ nightQuota:2 } },
  { id:'guvence', week:6, title:'Güvence Paketi', body:'…', effect:{ expense:60 } },
];
const PROGRAMS = [ { id:'elit', name:'Elit Kurye', body:'…', effect:{ feeMult:1.15, complaintsDouble:true } }, … ];
```

## Dialect sheets (one tic each; the narrator gets none)

- **Hayri Abi** (kapıcı, Sivaslı, 31 yıl aynı bina): kısa cümleler, "oğlum", "hemşerim", binadan "biz" diye söz eder,
  kural + istisna ("…o ayrı"), olayları hatırlar, sayı saymaz.
- **Nebahat Teyze** (Üsküdar, emekli, dul): her replik 25–40 kelimelik tek bir cümle; yemekten rahmetli Nusret'e, oradan
  kiracıya, oradan yine yemeğe döner; "evladım"; asla sormaz, ilan eder ("Alırsın.").
- **Hızlı Ferhat** (22): "kanka", "reis"; her şey dakikayla ölçülür; hız konusunda samimi, hiç ironik değil.
- **Kuzen Musti**: sadece mesaj; küçük harf, noktalama yok, "kuzen", "halledicez", "valla", "bi sn".
- **Nuri Bey** (64, emekli ev sahibi): "beyefendi"; her cümle kendi masraflarıyla başlar, bir ricayla biter;
  "Enflasyon beyefendi, enflasyon."
- **Usta Cemil**: motora konuşur, sana değil; fiyatı en sona bırakır.
- **Platform**: resmi "siz", en az bir emoji, plaza sözlüğü, asla ironik değil, olumsuz hiçbir şeyi kabul etmez.
- **Anlatıcı (iç ses dışı metin)**: ikinci tekil, geniş zaman; isimler somut; yargı cümlesiyle bitmez.

## Style guide (binding)

1. Ritmi çeşitlendir, "kısa. kısa. vuruş." kalıbını %30'un altına indir. 15+ kelimelik cümleler de olsun.
2. Platform kendi metninde asla ironik değildir; ironiyi oyuncu üretir.
3. Aktarılmış konuşma değil, gerçek diyalog: "…" içinde.
4. Karakterler olay hatırlar, sayı saymaz ("3. geliş" yok).
5. Somut isimler: "bir amca", "bir teyze", "dizi sesi", "bir araba" yasak. Kızılcık Şerbeti jeneriği, Doblo, ince belli bardak.
6. Tezi söyleme: "kapitalizm" kelimesi oyunda hiç geçmez. Kurye "iş ortağı"dır, bunu platform söyler.
7. Bir isimle ya da bir replikle bitir, yargıyla değil ("Hayattasın ama puanın değil" → "Puan 4,0'dan 3,8'e.").
8. Seçenek butonları düz fiil, emoji yok.
9. Yasak kapanışlar: "kimse …", "Sen değilsin.", "Kaydet.", "belli değil", "bilinmiyor", "ikiniz de biliyorsunuz",
   şakayı açıklayan parantezler.
10. İç ses bir kadrodur: olay başına bir yetenek, ≤ 22 kelime, her yeteneğin kendi cümle biçimi var (MANTIK adım
    numaralar, ELEKTROKİMYA sadece yemekten geniş zamanda, İÇ İMPARATORLUK seni üçüncü tekilde destansı anlatır,
    REFLEKS ve VÜCUT KONTROLÜ iki kelimelik stakatoyu korur, ALGI gördüğü detayı listeler, OTORİTE emir kipinde,
    EMPATİ karşıdakinin iç sesini tahmin eder, ANSİKLOPEDİ bir istatistik ya da tarih verir).

Hedef: oyuncu metnin insan elinden çıktığını hissetsin. Türkçe, İstanbul ağzı, tanıdık sokaklar.
