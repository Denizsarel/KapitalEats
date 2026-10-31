/* ---------------- DÜKKAN (KOZMETİK) ----------------
   slot: helmet | jacket | gloves | scooter | bag   — avatar CSS değişkenine yazılır
   nohelmet:true kaskı kaldırır (evet, satılıyor) */
const SHOP = [
  { id:'helmet_std', slot:'helmet', name:'Standart Kask', price:0, color:'#ff5a1f', desc:'Platformun verdiği. Turuncu. Herkesinki aynı.' },
  { id:'helmet_matte', slot:'helmet', name:'Mat Siyah Kask', price:900, color:'#1f1f29', desc:'"Kurye değilim, motorcuyum" görünümü.' },
  { id:'helmet_gold', slot:'helmet', name:'Altın Varak Kask', price:4500, color:'#e6b422', desc:'Güvenlik aynı. Özgüven farklı.' },
  { id:'helmet_none', slot:'helmet', name:'Kasksız "Özgürlük"', price:1500, color:'#3a2516', nohelmet:true, desc:'Rüzgarı saçında hisset. Doktorun önermiyor.' },
  { id:'helmet_cat', slot:'helmet', name:'Kedi Kulaklı Kask', price:2800, color:'#f28ab2', shape:'ears', desc:'Müşteriler "aaa" diyor. "Al bahşiş" demiyor.' },
  { id:'helmet_pika', slot:'helmet', name:'Pikaçu Kask', price:5200, color:'#ffd21f', shape:'pika', desc:'Sarı, kulaklı, lisanssız. Avukatlar aramadı. Henüz.' },
  { id:'helmet_viking', slot:'helmet', name:'Viking Kaskı', price:3900, color:'#8a7f72', shape:'horns', desc:'Boynuzlu. Tarihsel olarak yanlış, trafikte etkili.' },
  { id:'helmet_retro', slot:'helmet', name:'Retro Yarım Kask', price:2100, color:'#f4f4f4', shape:'half', desc:'Çeneni korumuyor. Çenen zaten lafını esirgemiyor.' },
  { id:'jacket_std', slot:'jacket', name:'Mavi Mont', price:0, color:'#2b6cff', desc:'Yağmur geçiriyor ama logosu büyük.' },
  { id:'jacket_puffer', slot:'jacket', name:'Şişme Mont', price:2200, color:'#c9c9d6', desc:'Yastık gibi. Yastıktan pahalı, yastıktan az ısıtıyor.' },
  { id:'jacket_leather', slot:'jacket', name:'Deri Ceket', price:6500, color:'#4a1f1f', desc:'Lahmacun teslim ederken "gizemli" görünmek için.' },
  { id:'gloves_std', slot:'gloves', name:'Siyah Eldiven', price:0, color:'#222222', desc:'Delik. Ama siyah.' },
  { id:'gloves_neon', slot:'gloves', name:'Neon Eldiven', price:700, color:'#48e08a', desc:'Gece görünür olursun. Siparişler görünmez kalır.' },
  { id:'gloves_white', slot:'gloves', name:'Beyaz Garson Eldiveni', price:1800, color:'#f4f4f4', desc:'Lüks hissi. İlk teslimatta kirlenir.' },
  { id:'scooter_std', slot:'scooter', name:'Kırmızı Motor', price:0, color:'#d33a2c', desc:'Mirasın. Taksitleri bitmiş.' },
  { id:'scooter_mint', slot:'scooter', name:'Mint Yeşili Boya', price:3200, color:'#7fe0c3', desc:'Instagram için boyattın. Motor aynı.' },
  { id:'scooter_chrome', slot:'scooter', name:'Krom Kaplama', price:9900, color:'#b8c4d6', desc:'Güneşte göz alır. Senin gözünü.' },
  { id:'scooter_navy', slot:'scooter', name:'Lacivert Boya', price:2600, color:'#1f3a93', desc:'Sivil polis motoru gibi. Trafikte yol veriyorlar. Bir kere.' },
  { id:'scooter_pink', slot:'scooter', name:'Pembe Boya', price:2600, color:'#ff6fb5', desc:'Çantayla takım oldu. Takım olmak bahşiş getirmiyor.' },
  { id:'scooter_black', slot:'scooter', name:'Mat Siyah', price:4200, color:'#1a1a1f', desc:'Gece görünmüyor. Bu bir özellik, bir de risk.' },
  { id:'scooter_white', slot:'scooter', name:'Beyaz "Vespa Değil"', price:3800, color:'#f1f1f1', desc:'Vespa değil. Herkes Vespa sanıyor. Düzeltmiyorsun.' },
  { id:'scooter_olive', slot:'scooter', name:'Zeytin Yeşili', price:2600, color:'#6b8e23', desc:'Askeri görünüm. Askerlik yapmadın, motor yaptı.' },
  { id:'scooter_gold', slot:'scooter', name:'Altın Kaplama', price:15000, color:'#e6b422', desc:'Hedefinin yarısı kadar. "Hedef" ne demekti?' },
  { id:'bag_std', slot:'bag', name:'Termal Çanta', price:0, color:'#2a2a2a', desc:'İçini sıcak tutmuyor, adını tutuyor.' },
  { id:'bag_pink', slot:'bag', name:'Pembe Çanta', price:1200, color:'#ff6fb5', desc:'Müşteriler fotoğraf çekiyor. Bahşiş vermiyor.' },
  /* Yan gelir: oyun kapalıyken (çevrimdışı) saat başına kazandırır. slot:'side', idle:{perHour, cut}  cut: kesinti oranı (benzin, komisyon) */
  { id:'side_cousin', slot:'side', name:'Kuzen Musti\'ye motor kirası', price:2500, color:'#8a6cff', idle:{perHour:70, cut:0.35}, desc:'Sen yokken motoru Musti sürer. Benzinini sen ödersin. Aile bu.' },
  { id:'side_ads', slot:'side', name:'Motora reklam giydirmesi', price:6000, color:'#ffb347', idle:{perHour:140, cut:0.1}, desc:'Arkanda bir banka reklamı. Bankanın kuryesi değilsin ama öyle görünüyorsun.' }
];

