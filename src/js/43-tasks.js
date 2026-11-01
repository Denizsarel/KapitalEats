/* ---------------- GÜNÜN GÖREVİ — şablonlar ----------------
   Şema: docs/CONTENT_CONTRACT.md §TASKS. Motor her sabah (1. gün hariç) bir şablon seçer; dört günde bir
   fake:true havuzundan (ödül 0, ekranda "Ödül: topluluğumuzun sevgisi 💙").
   make(S) → { text, target, reward, test(kind, data) }; test her ilerleme birimi için bir kez true döner ve
   S'ye hiçbir zaman yazmaz: sayaçlar (seri, kademe) make kapanışında tutulur.
   Motorun yaydığı olaylar (61-day-loop, 62-events-engine, 63-results):
     deliver {district, hood, km, night, payment, tip, fee, weather, rest, floor}
     accept  {km, district} · skip {} · break {} · event {eventId, label}
   Ses: platform. Resmi "siz", en az bir emoji, plaza sözlüğü, ironi yok. text ≤ 60 karakter.
   Ödüller motor tarafından CONFIG.taskRewardMin–Max (150–300) arasına sıkıştırılır.
   Yalnızca fonksiyon içinde DISTRICTS / RESTAURANTS okunur (yükleme sırası).
   Seçimler (ilçe, semt, restoran) Math.random yerine S.day'den türetilir: motor (ensureTaskRT) sayfa yeniden
   yüklenince make(S)'i tekrar çalıştırır; böylece kayıtlı metin ile canlı test() aynı hedefi görür.
   Motor notu: kapanış sayaçları yeniden yüklemede sıfırlanır (seri yarıda kalır, kademe artığı kaybolur). */

// Beş ve daha fazla restoranın hizmet verdiği ilçeler: hedef ilçe bunlardan seçilir ki görev gün içinde tutabilsin.
function taskDistricts(min){
  const list = DISTRICTS.filter(d => RESTAURANTS.filter(r => (r.areas || []).includes(d.name)).length >= (min || 5));
  return list.length ? list : DISTRICTS;
}
// Günlük sabit seçim: aynı gün, aynı koşu → aynı eleman. salt şablon başına farklı bir asal.
function taskPick(list, S, salt){
  const runs = (typeof META !== 'undefined' && META.runs) ? META.runs.length : 0;
  return list[(((S.day || 0) * salt) + runs) % list.length];
}
// Toplam (km, bahşiş) görevleri: motor ilerlemeyi birim birim sayar, bu yüzden toplam "kademe"lere bölünür.
// Biriken toplam bir sonraki kademeyi aştığında bir birim ilerleme verilir; artan kısım sonraki teslimata taşınır.
function taskStepCounter(unit, read){
  let acc = 0, credited = 0;
  return (kind, data) => {
    if(kind !== 'deliver') return false;
    acc += Math.max(0, +read(data || {}) || 0);
    if(Math.floor(acc / unit) > credited){ credited++; return true; }
    return false;
  };
}

const TASKS = [
  /* --- Ödüllü görevler --- */
  { id:'district2', weight:3, fake:false,
    make: (S) => { const d = taskPick(taskDistricts(5), S, 7).name; return {
      text: `${d} bölgesinde 2 teslimat tamamlayın 📍`,
      target: 2, reward: 200,
      test: (kind, data) => kind === 'deliver' && data.district === d
    }; } },

  // Günde iki gece turu var (20.00, 22.00): n=2 "hepsi ya da hiçbiri" demek, ona göre fiyatlandı.
  { id:'gece', weight:2, fake:false,
    make: (S) => { const n = 1 + ((S.day || 0) % 2); return {
      text: `Gece tarifesinde ${n} teslimat tamamlayın 🌙`,
      target: n, reward: n === 2 ? 300 : 150,
      test: (kind, data) => kind === 'deliver' && !!data.night
    }; } },

  { id:'nakit', weight:2, fake:false,
    make: (S) => ({
      text: 'Nakit Tahsilat: kapıda ödemeli 2 teslimat 💵',
      target: 2, reward: 200,
      test: (kind, data) => kind === 'deliver' && data.payment === 'nakit'
    }) },

  { id:'km', weight:2, fake:false,
    make: (S) => ({
      text: "Rota Hedefi: 5 km'lik 4 etap, toplam 20 km 🛵",
      target: 4, reward: 250,
      test: taskStepCounter(5, d => d.km)
    }) },

  { id:'bahsis', weight:2, fake:false,
    make: (S) => ({
      text: "Takdir Hedefi: 20 ₺'lik 3 kademe, toplam 60 ₺ bahşiş 💸",
      target: 3, reward: 250,
      test: taskStepCounter(20, d => d.tip)
    }) },

  // Seri kapanışta tutulur; reddedilen tur seriyi başa alır. Görev tek birimdir (HUD 0/1 → 1/1), çünkü motorda
  // "ilerlemeyi geri al" sinyali yok. Motor bir gün test()'ten 'reset' dönüşünü tanırsa target 4'e dönülür.
  { id:'seri', weight:2, fake:false,
    make: (S) => { let run = 0; return {
      text: 'Kararlılık Serisi: art arda 4 sipariş kabul edin 🔥',
      target: 1, reward: 250,
      test: (kind) => {
        if(kind === 'skip'){ run = 0; return false; }
        if(kind !== 'accept') return false;
        run++;
        return run === 4;
      }
    }; } },

  { id:'mola', weight:1, fake:false,
    make: (S) => ({
      text: 'Wellness Hedefi: bugün 1 mola verin ☕',
      target: 1, reward: 150,
      test: (kind) => kind === 'break'
    }) },

  // Semt siparişte seçilemez, piyango gibi tutar; "fırsat" diye düşük ödül, düşük ağırlık.
  { id:'semt', weight:1, fake:false,
    make: (S) => { const d = taskPick(taskDistricts(5), S, 5); const hoods = d.hoods && d.hoods.length ? d.hoods : [d.name]; const h = taskPick(hoods, S, 3); return {
      text: `Mikro Bölge Fırsatı: ${h} semtine 1 teslimat 🎯`,
      target: 1, reward: 150,
      test: (kind, data) => kind === 'deliver' && data.hood === h
    }; } },

  { id:'restoran', weight:2, fake:false,
    make: (S) => { const pool = RESTAURANTS.filter(r => (r.areas || []).length >= 4); const r = taskPick(pool.length ? pool : RESTAURANTS, S, 11).name; return {
      text: `Partner restoran ${r}: 1 teslimat 🍽️`,
      target: 1, reward: 200,
      test: (kind, data) => kind === 'deliver' && data.rest === r
    }; } },

  { id:'hava', weight:2, fake:false,
    make: (S) => {
      const w = S.weather || 'sunny';
      const plan = w === 'snow' ? { text:'Kış Modu: karda 2 teslimat tamamlayın ❄️', target:2, reward:300 }
                 : w === 'rain' ? { text:'Hava Primi Günü: yağmurda 3 teslimat 🌧️', target:3, reward:250 }
                 : { text:'Açık Hava Fırsatı: güneşli havada 4 teslimat ☀️', target:4, reward:200 };
      return { text: plan.text, target: plan.target, reward: plan.reward,
        test: (kind, data) => kind === 'deliver' && data.weather === w };
    } },

  { id:'uzak', weight:2, fake:false,
    make: (S) => ({
      text: 'Uzun Mesafe Bonusu: 6 km ve üzeri 2 teslimat 🚀',
      target: 2, reward: 250,
      test: (kind, data) => kind === 'deliver' && (+data.km || 0) >= 6
    }) },

  /* --- Platform sevgisi görevleri (fake:true, ödül 0) --- */
  { id:'gulumse', weight:2, fake:true,
    make: (S) => ({
      text: 'Topluluk Görevi: 3 teslimatta kapıda gülümseyin 😊',
      target: 3, reward: 0,
      test: (kind) => kind === 'deliver'
    }) },

  { id:'rozet', weight:2, fake:true,
    make: (S) => ({
      text: 'Marka Elçisi: 5 teslimat tamamlayın, rozet kazanın 🏅',
      target: 5, reward: 0,
      test: (kind) => kind === 'deliver'
    }) },

  { id:'etkilesim', weight:1, fake:true,
    make: (S) => ({
      text: 'Topluluk Diyaloğu: 2 müşteri etkileşimi tamamlayın 💬',
      target: 2, reward: 0,
      test: (kind) => kind === 'event'
    }) }
];
