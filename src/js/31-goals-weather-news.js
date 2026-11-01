/* ---------------- HEDEFLER ----------------
   price: başlangıç fiyatı. Haberler cat (kategori) üzerinden fiyatı oynatır. */
const GOALS = [
  { id:'iphone', emoji:'📱', art:'phone', name:'iPhone 18 Pro', cat:'tech', price:95000,
    desc:'Eskisi gayet çalışıyor ama kamerası 0,3 mm daha büyük.' },
  { id:'tshirt', emoji:'👕', art:'tshirt', name:'Gereksiz Markalı Tasarım Tişört', cat:'fashion', price:14000,
    desc:'Beyaz. Sadece beyaz. Logosu dikişin içinde, kimse görmüyor.' },
  { id:'termos', emoji:'🥤', art:'termos', name:'Koleksiyon Termos (Sınırlı Renk)', cat:'lifestyle', price:9500,
    desc:'Su içmiyorsun ama bu renk bir daha üretilmeyecek.' },
  { id:'scooter', emoji:'🛴', art:'scooter', name:'Elektrikli Scooter', cat:'tech', price:32000,
    desc:'Motorun var. Ama bu motor değil, "yaşam tarzı".' }
];

/* ---------------- HAVA DURUMU ----------------
   Her gün bir hava vardır. Haberler havayı belirleyebilir (effect.weather),
   belirlemezse rastgele seçilir (weight). risk: olay ihtimaline eklenir.
   Olaylar weather:['rain','snow'] ile sadece o havada çıkar. */
const WEATHER = {
  sunny: { name:'Güneşli', emoji:'☀️', weight:6, feeMult:1,    risk:0,    blurb:'Hava güzel. Herkes dışarıda, kimse sipariş vermiyor. Yine de veriyorlar.' },
  rain:  { name:'Yağmurlu', emoji:'🌧️', weight:3, feeMult:1.25, risk:0.15, blurb:'Yol kaygan, siparişler bol. Platform "hava primi" ekledi, sen ıslanma primi alamadın.' },
  snow:  { name:'Karlı',    emoji:'❄️', weight:1, feeMult:1.5,  risk:0.3,  blurb:'Motor yokuş çıkmıyor, müşteri "kar yağıyor, acele etsene" yazıyor.' }
};

/* ---------------- HABERLER ----------------
   effect.priceMult : hedef fiyatını kalıcı çarpar (cat eşleşirse ya da cat:'all')
   effect.feeMult   : o gün sipariş ücretlerini çarpar
   effect.tipMult   : o gün bahşişleri çarpar
   effect.expense   : o gün ek gider (₺)
   effect.weather   : 'rain' | 'snow' | 'sunny' → o günün havasını belirler
   effect.tags      : ['etiket'] → olaylar tags:['etiket'] ile bu güne bağlanabilir */
const NEWS = [
  { id:'war', kicker:'SON DAKİKA', headline:'Rusya\'da savaş çıktı!', body:'Piyasalar sarsıldı, dolar uçtu. Teknoloji ithalatçıları fiyat listelerini "güncelledi".',
    cat:'tech', effect:{ priceMult:1.13 } },
  { id:'rain', kicker:'HAVA', headline:'İstanbul\'a sağanak uyarısı', body:'Kimse dışarı çıkmak istemiyor. Platform "yoğunluk primi" açtı. Sen ıslanıyorsun, algoritma seviniyor.',
    cat:'all', effect:{ weather:'rain', feeMult:1.1 } },
  { id:'snow', kicker:'HAVA', headline:'Kar İstanbul\'u esir aldı', body:'Valilik "zorunlu olmadıkça dışarı çıkmayın" dedi. Platform "zorunlu" kelimesini senin için yeniden tanımladı.',
    cat:'all', effect:{ weather:'snow', feeMult:1.15 } },
  { id:'heat', kicker:'HAVA', headline:'Sıcak hava dalgası: 41 derece', body:'Kask içinde 48 derece. Dondurma siparişleri patladı, hiçbiri dondurma olarak ulaşmıyor.',
    cat:'all', effect:{ weather:'sunny', expense:40, tags:['heat'] } },
  { id:'influencer', kicker:'MAGAZİN', headline:'Ünlü influencer aynı tişörtle 3 gün poz verdi', body:'Marka "beklenmeyen talep" nedeniyle fiyatları yükseltti. Beklemiyorlarmış.',
    cat:'fashion', effect:{ priceMult:1.2 } },
  { id:'discount', kicker:'EKONOMİ', headline:'Efsane Cuma indirimleri başladı', body:'Fiyatlar önce %40 artırıldı, sonra %30 indirildi. Sen yine de sevindin.',
    cat:'all', effect:{ priceMult:0.93 } },
  { id:'fuel', kicker:'EKONOMİ', headline:'Akaryakıta gece yarısı zammı', body:'Motorun aynı yolu daha pahalıya gidiyor. Platform ücretleri güncellemedi, "inceliyor".',
    cat:'all', effect:{ expense:80 } },
  { id:'tipweek', kicker:'TREND', headline:'Sosyal medyada "Kuryeye Bahşiş Haftası"', body:'Herkes kuryesine 50 ₺ verip videosunu çekiyor. Bir hafta sürer, sonra unutulur.',
    cat:'all', effect:{ tipMult:1.6 } },
  { id:'color', kicker:'ÜRÜN', headline:'Hedefindeki ürünün yeni rengi çıktı', body:'Aynı ürün, yeni renk, yeni fiyat. Eski renk "klasik" ilan edildi ve o da zamlandı.',
    cat:'lifestyle', effect:{ priceMult:1.15 } },
  { id:'derby', kicker:'SPOR', headline:'Bu akşam derbi var', body:'Maç saatinde 40 bin kişi aynı anda pizza istiyor. Restoranlar "hazır" dedi. Değiller.',
    cat:'all', effect:{ feeMult:1.2, tags:['derby'] } },
  /* --- Siyasi hiciv --- */
  { id:'asgari', kicker:'EKONOMİ', headline:'Asgari ücrete %30 zam, enflasyon %60', body:'Bakan: "Hesap ortada." Hesap gerçekten ortada duruyor, kimse almıyor.',
    cat:'all', effect:{ priceMult:1.08 } },
  { id:'girisimci', kicker:'SİYASET', headline:'Bakan: "Kuryeler aslında girişimci"', body:'Girişimci olduğunu bugün öğrendin. Girişimin motor, sermayen benzin, çıkış stratejin yok.',
    cat:'all', effect:{ tags:['girisimci'] } },
  { id:'vergi', kicker:'MECLİS', headline:'Yeni vergi: "Motokurye Katkı Payı"', body:'Gece yarısı torba yasaya eklendi. Katkı senden, pay onlara. Mecliste "kurye" kelimesi 4 kez geçti, dördünde de "o çocuklar" diye.',
    cat:'all', effect:{ expense:100 } },
  { id:'kaldirim', kicker:'BELEDİYE', headline:'Bağdat Caddesi\'nde 3 aylık kaldırım çalışması', body:'Geçen yıl da yapılmıştı. Kaldırım aynı kaldırım, taş farklı, müteahhit akraba. Trafik uzadı, ücretler de.',
    cat:'all', effect:{ feeMult:1.2 } },
  { id:'faiz', kicker:'MERKEZ BANKASI', headline:'Faiz kararı açıklandı, kimse anlamadı', body:'Dolar önce düştü, sonra çıktı, sonra "piyasa dengelendi" dendi. Telefon fiyatı dengelenmedi.',
    cat:'tech', effect:{ priceMult:1.1 } },
  { id:'boykot', kicker:'EMEK', headline:'Kuryeler kontak kapattı, 3 günlük boykot', body:'Platform "kuryelerimizin yanındayız" açıklaması yaptı, ücretleri de yanında tuttu. Sen bugün çalışıyorsun: ücretler yüksek, vicdan ayrı hesap.',
    cat:'all', effect:{ feeMult:1.5, tipMult:0.8 } },
  { id:'af', kicker:'SİYASET', headline:'Vergi affı: 5 milyonun üstü borçlara', body:'Senin 1.200 liralık park cezan kapsam dışı. Kapsam, kapsayanlar için.',
    cat:'all', effect:{} },
  { id:'corba', kicker:'SEÇİM', headline:'Seçim öncesi her ilçeye "ücretsiz çorba"', body:'Dağıtımı kuryeler yapıyor. Ücretsiz olan çorba, kurye değil. Afişte aday var, kurye yok.',
    cat:'all', effect:{ feeMult:1.25, tipMult:0.7 } },
  { id:'yerli', kicker:'TEKNOLOJİ', headline:'"Yerli ve milli telefon" tanıtıldı', body:'Fiyatı ithal olandan pahalı. Bakan: "Gurur fiyata dahil." Hedefindeki ithal telefon da "dayanışma" adına zamlandı.',
    cat:'tech', effect:{ priceMult:1.06 } },
  { id:'quiet', kicker:'GÜNDEM', headline:'Bugün hiçbir şey olmadı', body:'Gazeteler boş sayfa bastı. Fiyatlar yerinde, köpekler uyuyor, güvenlik kulübesi boş. Şüpheli bir sakinlik.',
    cat:'all', effect:{ eventChance:0 } }
];

