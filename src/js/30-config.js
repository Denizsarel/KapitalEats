/* =====================================================================
   KapitalEats — prototip
   Bölümler: CONFIG · VERİ (hedefler, hava, haberler, siparişler, OLAYLAR, dükkan)
             · DURUM · EKRAN AKIŞI · YARDIMCILAR
   Olay ve haber havuzunu genişletmek için sadece VERİ bölümüne ekleme yap.
   ===================================================================== */

const CONFIG = {
  startMoney: 500,          // başlangıç parası (₺)
  ordersPerDay: 6,          // gün başına düşen sipariş sayısı
  baseFee: 80,              // sipariş taban ücreti (gerçek: 65-92 ₺; oyun için biraz cömert)
  feePerKm: 9,              // km başına ücret (gerçek 3,7-4,8 ₺; mesafe kararı anlamlı olsun diye yüksek)
  bulkFee: 15,              // paketteki her ürün adedi için ek ücret
  startHour: 12,            // ilk tur saati
  hoursPerRound: 2,         // her tur saati bu kadar ilerletir
  nightFrom: 20,            // bu saatten sonra gece tarifesi ve gece olayları
  nightFeeMult: 1.4,        // gece tarifesi (Trendyol Go: gündüz 64,5 / gece 92 ₺)
  weekendFeeMult: 1.15,     // hafta sonu tarifesi
  streakBonusAt: 5,         // üst üste bu kadar teslimatta platform bonusu
  streakBonus: 150,
  serviceKm: 140,           // bu kadar km'de aşınma %100 olur (arıza neredeyse kesin)
  serviceBase: 300,         // Usta Cemil taban fiyatı
  serviceWearPrice: 7,      // aşınma yüzdesi başına ₺
  towCost: 450,             // çekici
  soundKey: 'kapitaleats-sound',
  maxDistanceKm: 9,
  eventChance: 0.45,        // kabul edilen siparişte olay çıkma ihtimali (hava × mesafe riski eklenir)
  offersPerRound: [2,3],    // her turda kaç sipariş teklif edilir (min,max)
  fuelPerKm: 6,             // benzin: km başına ₺ (teslimatta kesilir)
  idleCapHours: 8,          // çevrimdışı gelir en fazla bu kadar saat için işler
  dailyExpense: 120,        // "simit + çay + motor benzini" (gün sonu kesilir)
  breakCost: 40,            // mola: çay + simit
  energyMax: 100,           // kurye enerjisi (gün başında dolu)
  energyBase: 7,            // her teslimatın sabit enerji bedeli
  energyPerKm: 1.3,         // km başına enerji
  energyNight: 6,           // gece teslimatı ek bedel
  energyLow: 30,            // bunun altında "enerji bitiyor" olayı çıkar
  breakEnergy: 45,          // mola ne kadar enerji verir
  eatEnergy: 25,            // siparişten yemek ne kadar verir
  startRating: 4.6,
  fireRating: 2.0,          // puan bunun altına inerse hesap kapanır
  maxComplaints: 4,         // bu kadar şikayette hesap kapanır
  rideMs: 4200,             // sürüş animasyonu süresi
  stampMs: 650,             // KABUL / RED damgası süresi
  recentEventMemory: 4,     // son N olay tekrar çıkmaz
  saveKey: 'kapitaleats-save-v7'
};

