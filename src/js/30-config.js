/* =====================================================================
   KapitalEats
   Bölümler: CONFIG · VERİ (hedefler, hava, haberler, siparişler, olaylar, arklar, görevler, dükkan)
             · DURUM (S: bu koşu, META: kalıcı mahalle) · MOTOR · EKRAN AKIŞI
   İçerik dosyaları ve kuralları: docs/CONTENT_CONTRACT.md
   ===================================================================== */

const CONFIG = {
  startMoney: 500,          // başlangıç parası (₺)
  ordersPerDay: 6,          // gün başına tur
  day1Rounds: 4,            // ilk gün (öğretici) tur sayısı
  baseFee: 80,              // sipariş taban ücreti
  feePerKm: 9,              // km başına ücret
  bulkFee: 15,              // paketteki her ürün adedi için ek ücret
  startHour: 12,            // ilk tur saati
  hoursPerRound: 2,         // her tur saati bu kadar ilerletir
  nightFrom: 20,            // bu saatten sonra gece tarifesi ve gece olayları
  nightFeeMult: 1.4,        // gece tarifesi
  weekendFeeMult: 1.15,     // hafta sonu tarifesi
  lowRatingFeeMult: 0.9,    // puan 3,5 altındaysa ücret çarpanı (algoritma ucuz sipariş gösterir)
  streakBonusAt: 5,         // üst üste bu kadar teslimatta platform bonusu
  streakBonus: 150,
  taksitCount: 4,           // hedef kaç taksitte alınır
  goalInflationCap: 1.3,    // hedef fiyatı başlangıcın en fazla bu katına çıkabilir
  serviceKm: 200,           // bu kadar km'de aşınma %100 olur
  serviceBase: 300,         // Usta Cemil taban fiyatı
  serviceWearPrice: 7,      // aşınma yüzdesi başına ₺
  towCost: 450,             // çekici
  maxDistanceKm: 9,
  eventChance: 0.45,        // kabul edilen siparişte olay çıkma ihtimali (hava × mesafe riski eklenir)
  offersPerRound: [2,3],    // her turda kaç sipariş teklif edilir (min,max)
  returningChance: 0.25,    // 2. günden itibaren bir fişin eski müşteriye ait olma ihtimali (turda en fazla 1)
  regularChance: 0.2,       // bir fişin müdavim müşteriye ait olma ihtimali
  reservedFeeMult: 1.15,    // sabah için ayrılan siparişin ücret çarpanı
  fuelPerKm: 6,             // benzin: km başına ₺
  idleCapHours: 8,          // çevrimdışı gelir en fazla bu kadar saat için işler
  dailyExpense: 120,        // simit + çay + motor (gün sonu kesilir)
  breakCost: 40,            // mola: çay + simit
  energyMax: 100,
  energyBase: 5,            // her teslimatın sabit enerji bedeli
  energyPerKm: 1.0,
  energyPerFloor: 0.8,      // 3. kattan sonraki her kat (asansörsüz hesap)
  energyNight: 4,
  energyLow: 30,            // bunun altında "enerji bitiyor" olayı çıkabilir
  breakEnergy: 45,
  eatEnergy: 25,
  startRating: 4.6,
  ratingRecover: 0.03,      // olaysız her teslimatta puan artışı (4,8'e kadar)
  ratingSoftCap: 4.8,
  ratingFloorDays: 3,       // ilk N gün puan 3,0'ın altına inmez, kimse kovulmaz
  fireRating: 2.0,
  maxComplaints: 4,
  complaintDecayDays: 7,    // bu kadar şikayetsiz günden sonra bir şikayet arşivlenir
  minOffersForFire: 18,     // kabul oranı kuralı bu kadar turdan önce işlemez
  rideMs: 2600,             // sürüş animasyonu süresi
  rideSkipAfterMs: 1000,    // bu süreden sonra dokunarak geçilebilir
  stampMs: 650,
  recentEventMemory: 8,     // son N olay tekrar çıkmaz
  unseenWeight: 3,          // hiç görülmemiş olayların ağırlık çarpanı
  specialDays: [5, 12, 19, 26, 33],   // özel günler
  taskRewardMin: 150, taskRewardMax: 300,
  soundKey: 'kapitaleats-sound',
  hapticKey: 'kapitaleats-haptic',
  saveKey: 'kapitaleats-save',        // artık sürümle değişmez; migrate() eski kayıtları taşır
  legacySaveKeys: ['kapitaleats-save-v7'],
  metaKey: 'kapitaleats-meta-v1',
  saveVersion: 8
};
