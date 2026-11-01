/* ---------------- ÖZEL GÜNLER · KULLANIM KOŞULLARI · PROGRAMLAR ----------------
   Şema: docs/CONTENT_CONTRACT.md §SPECIAL_DAYS. Motor CONFIG.specialDays günlerinde SPECIAL_DAYS'ten sırayla
   seçer (boykot için rel('ferhat') ≥ 2 gerekir, yoksa sıradaki); announce önceki iki gün haber kartı ("N GÜN SONRA"
   kicker'ı motordan, metin gün saymaz), morning o sabah bülten kartı (kart hedef ve ücret çarpanını ayrıca etiket
   olarak basar, metin tekrar etmez). Kartın başlığı sp.name'dir ve platform sesinin üstünde durur: platform kendi
   kartına "Boykot" yazmaz, bu yüzden boykot gününün görünen adı 'Teşekkür Günü' (id 'boykot' motor ve Ferhat yayı için).
   Hedef tutarsa bir şikayet arşivlenir ve fact 'special_<id>' yazılır; tutmazsa hedef fiyat %5 artar.
   clearText / failText gün sonu ekranında tek satır, anlatıcı sesi.
   Ses: announce, morning, RULES.body, PROGRAMS.body → platform (resmi "siz", en az bir emoji, plaza sözlüğü,
   ironi yok, olumsuz hiçbir şeyi kabul etmez). clearText/failText ve boykot kararı → anlatıcı.
   Süreklilik: 42-arcs-ferhat.js B4 "yüzde altmış fazla aldın" ve "platform primi iki gün önceden açmıştı" der;
   feeMult 1,6 ve announce'taki Teşekkür Primi duyurusu o metne bağlıdır, biri değişirse ikisi birden değişmeli.
   MOTOR DESTEĞİ GEREKEN ALANLAR (sözleşmede yok, lead onayı bekler):
     SPECIAL_DAYS[boykot].decision { text, choices[{label,result,effects,closeShift}] } → sabah kartının altında iki
       buton; seçilen effects normal etki yolundan uygulanır (fact), closeShift:true ise vardiya açılmaz, doğrudan
       gün sonuna gidilir (özel gün hedefi tasarım gereği tutmaz). 42-arcs-ferhat.js bu kararın yazdığı
       'boykot' | 'grev_kirici' fact'lerini okur; destek gelmezse yay nötr dala düşer (ferhat_alley'e ulaşılamaz).
     PROGRAMS[].cond(S) → davet koşulu; davet ekranı (2. haftadan, tek program) ve complaintsDouble etkisi motorda yok.
       activeRuleEffects program anahtarlarını out[k] = p.effect[k] ile KOPYALAR: dinlenme'nin expense:25'i
       guvence'nin 60'ının üstüne yazar, toplamaz — motorun toplaması gerekir.
     Sabah etiketi JS sayısını basar ("×1.6"), metinler Türkçe virgül kullanır ("×1,6"). */

const SPECIAL_DAYS = [
  { id:'derbi', name:'Derbi Gecesi', emoji:'⚽',
    announce: 'Derbi akşamı yaklaşıyor! ⚽ Maç saatinde bölgenizde talep rekor seviyeye çıkacak ve ücretler ×1,5 olarak güncellenecek. Derbi Gecesi hedefini tamamlayan iş ortaklarımızın geri bildirim arşivinden bir kayıt silinecek. Çevrim içi kalın, fırsatı birlikte yakalayalım! 🏆',
    morning: 'Bugün Derbi Gecesi! ⚽ Maç saatinde tribün yoğunluğu nedeniyle Kadıköy\'de stadyum çevresinde rota önerilerimizi takip edin, taraftar konvoylarında güvenli mesafenizi koruyun. Yağış bekleniyor; yağmurluğunuzu unutmayın. Kaskınız takılı, ekranınız açık, gol sizin! 🏟️',
    effect: { weather:'rain', feeMult:1.5, eventChance:0.75, tags:['derby','night'] },
    target: { deliveries:5, maxComplaints:1 },
    clearText: "Beşinci paketi maçın uzatmalarında teslim edersin; kornalar Bağdat Caddesi'nden Moda'ya kadar iner. Arşivden bir kayıt silinir, ekranda tek satır: 'Derbi Gecesi tamamlandı 🏆'.",
    failText: "Son düdükten sonra Bahariye'de bir korna bile susmaz, senin sayın tutmaz. Uygulama hedefi 'bir sonraki fırsata' taşır; kargo ekranında taksit tutarı yüzde beş yukarı oynar, altında küçük harf: 'Fiyat güncellendi.'" },

  { id:'boykot', name:'Teşekkür Günü', emoji:'🤝',
    announce: 'Bir grup iş ortağımızın önümüzdeki günlerde çevrim dışı kalmayı planladığı bilgisi bize ulaştı. 🤝 KapitalEats olarak her zaman iş ortaklarımızın yanındayız: o gün çevrim içi kalan iş ortaklarımız için Teşekkür Primi devreye giriyor, ücretler ×1,6. Esneklik sizin, destek bizden! 💙',
    morning: 'Bugün bazı bölgelerde iş ortağı yoğunluğu düşük. 💙 Çevrim içi kalan iş ortaklarımız için Teşekkür Primi aktif; her teslimat topluluk sıralamasında iki kat puan kazandırıyor. Bugün yoldasınız, biz de yanınızdayız! 🛵',
    effect: { feeMult:1.6, eventChance:0.6, tags:['boykot'] },
    target: { deliveries:4, maxComplaints:1 },
    // Sabah kararı (anlatıcı). Motor desteği gerekir: bkz. dosya başı.
    decision: {
      text: "Kurye grubunda sabah kırk mesaj, hepsinde aynı yer ve saat: Söğütlüçeşme, köprünün altı, dokuz. Ferhat'tan ayrı bir satır: \"Kanka bugün dakika saymıyoruz, kontak kapalı.\" Uygulama açık, ücret çarpanı 1,6; motorun anahtarı mutfak masasında, çayın yanında. Çayı içersin, anahtar durur.",
      choices: [
        { label:'Kontak kapat',
          result: "Anahtar masada kalır. Köprünün altında kırk motor yan yana, kırk kapalı kontak; Ferhat elden ele çay dağıtır: \"Çay bedava kanka, bugün sayaç yok.\" Öğlen uygulama hepinize aynı bildirimi atar: \"Sizi özledik 💙\". Akşam kasa boş, günlük gider yerinde; ekranda tek satır: \"Bugün çevrim dışıydınız 💙\".",
          effects: { fact:'boykot' }, closeShift: true },
        { label:'Kontağı aç, çalış',
          result: "Kontağı çevirirsin; ilk fiş ×1,6 ile düşer, üstünde \"Teşekkür Primi aktif 💙\". Söğütlüçeşme'den geçerken köprünün altına bakmazsın, Ferhat bakar. Kadıköy'de sokaklar boş, kapılar dolu; Caferağa'da Berkay Ö. kapıyı yarım açar: \"Bugün kurye yok diyorlardı, iyi ki geldin.\"",
          effects: { fact:'grev_kirici' } }
      ]
    },
    clearText: "Dört paket, ücretler ×1,6, kasa dolu. Akşam Söğütlüçeşme'nin altından geçersin; motorlar dağılmış, yerde ince belli bardaklar ve bir karton: 'DAKİKA DEĞİL İNSAN'. Uygulama bir kaydı arşivler: 'Teşekkür Primi hesabınıza yansıdı 💙'.",
    failText: "Uygulamanın cevabı tek cümle: 'Hedef karşılanmadı.' Köprünün altından mı, Bahariye trafiğinden mi, cümle sormaz. Kargo ekranında taksit yüzde beş yukarı, altında küçük harf: 'Fiyat güncellendi.'" },

  { id:'kar', name:'Kar Günü', emoji:'❄️',
    announce: 'Meteoroloji bölge için yoğun kar uyarısı yayınladı. ❄️ Kar Günü\'nde Kış Modu devreye giriyor: ücretler ×1,3 ve uzun mesafe rotalarına öncelik. Eldivenlerinizi hazırlayın, kış sizinle daha güçlü! 🧤',
    morning: 'Kış Modu aktif! ❄️ Yollar beyaz, talep yüksek. Güvenli sürüş için hızınızı düşürün, zincir ve kış lastiği listemizi inceleyin, yokuşlarda önerilen rotayı tercih edin. Hedefi tamamlayan iş ortaklarımız Kar Kahramanı rozeti kazanıyor. 🏅',
    effect: { weather:'snow', feeMult:1.3, eventChance:0.6, tags:['kar'] },
    target: { deliveries:3, maxComplaints:1 },
    clearText: "Üçüncü paketi Kısıklı yokuşunun tepesinde teslim edersin; eldiven ıslak, kapı sıcak. Aşağıda Üsküdar beyaz, motor çamurlu. Uygulama arşivden bir kayıt siler ve rozeti yollar: 'Kar Kahramanı 🏅'.",
    failText: "Zincir olmadan Kısıklı yokuşunu üçüncü denemede çıkarsın; kar dinmek yerine sıkılaşır, motor iki kez durur. Uygulama vardiyayı kapatır, hedef satırı kırmızı kalır; ekranda küçük harf: 'Kış koşulları nedeniyle fiyat güncellendi.'" }
];

/* Kullanım Koşulları: her pazartesi bir madde, haftaya göre. Kart: "KULLANIM KOŞULLARI GÜNCELLENDİ · Madde N/b · Kabul edilmiş sayılır". */
const RULES = [
  { id:'foto', week:2, title:'Fotoğraflı Teslimat',
    body: "Teslimat deneyimini daha güvenli ve şeffaf hale getiriyoruz! 📸 \"Kapıya bırak\" notlu siparişlerde artık paketin fotoğrafını çekmeniz ve bırakılan katı doğrulamanız yeterli. Doğrulanmış teslimatlar puanınıza olumlu yansır; eşleşmeyen fotoğraflarda ödeme, Müşteri Mutluluğu ekibimizin incelemesi tamamlanana kadar güvenli bekleme hesabında tutulur. 🔒",
    effect: { enableEvent:'foto_kat' } },
  { id:'surge', week:3, title:'Dinamik Ücretlendirme',
    body: 'Kazancınızı optimize ediyoruz! ⚡ Talebin yoğun olduğu turlarda ücretler ×1,5 seviyesine kadar yükseliyor; yoğunluk ikonunu takip ederek saatlik kazancınızı maksimize edebilirsiniz. Standart turlarda taban ücret yüzde 5 oranında yeniden dengelendi. Yoğunluğu görün, kazancı siz yönetin! 📊',
    effect: { feeMult:0.95, surge:true } },
  { id:'kesinti', week:4, title:'Kurye Katkı Payı',
    body: 'Birlikte büyüyoruz! 🌱 Her teslimat ücretinin yüzde 3\'ü Kurye Katkı Payı olarak platform altyapısına, destek hattımıza ve eğitim modüllerimize aktarılıyor. Katkınız her teslimat özetinde şeffaf biçimde gösterilir; sizin için daha hızlı eşleşme, daha güçlü topluluk. 🤝',
    effect: { cutPct:3 } },
  { id:'gece', week:5, title:'Gece Kotası',
    body: 'Gece tarifesi fırsatlarını herkese adil dağıtıyoruz! 🌙 Her gün en az 2 gece teslimatı tamamlayan iş ortaklarımız ertesi gün standart ücret düzeyini korur; kotayı tamamlamayan iş ortaklarımızın ücretleri ertesi gün yüzde 10 motivasyon bandında gösterilir. Gece sizin saatiniz! ⭐',
    effect: { nightQuota:2 } },
  { id:'guvence', week:6, title:'Güvence Paketi',
    body: 'Sizi düşünüyoruz! 🛡️ Güvence Paketi ile kaza, hastalık ve motor arızası durumlarında 7/24 danışma hattımız yanınızda. Günlük yalnızca 60 ₺ katkı payıyla tüm iş ortaklarımız pakete otomatik olarak dahil edildi; ayrıca bir işlem yapmanız gerekmiyor. Güvende olmanın rahatlığını yaşayın! 💙',
    effect: { expense:60 } }
];

/* Programlar: platformun davet ettiği kulüpler. S.program = id. Etki anahtarları sözleşmedeki feeMult/complaintsDouble
   artı motorun activeRuleEffects → 63-results üzerinden okuduğu tipMult ve 61-day-loop'un okuduğu expense; başka anahtar yok.
   cond(S) ve davet ekranı motor işi (bkz. dosya başı). */
const PROGRAMS = [
  { id:'elit', name:'Elit Kurye',
    body: "Elit Kurye Programı'na davetlisiniz! 💎 Tüm teslimat ücretlerinizde yüzde 15 ek kazanım, öncelikli destek hattı ve profilinizde Elit rozeti. Elit standartları gereği müşteri geri bildirimleri performans değerlendirmenize iki kat ağırlıkla yansır; mükemmellik yolculuğunuzda yanınızdayız. ⭐",
    cond: (S) => S.rating >= 4.5,
    effect: { feeMult:1.15, complaintsDouble:true } },
  { id:'mahalle', name:'Mahalle Kuryesi',
    body: 'Mahallenizin yüzü olun! 🏘️ Mahalle Kuryesi Programı ile tanıdık kapılar ve düzenli müşterilerle bahşiş potansiyeliniz yüzde 30 artar; taban ücret mahalle tarifesine göre yüzde 10 aşağı yönlü güncellenir. Komşuluk kazanca dönüşüyor! 🤝',
    cond: (S) => S.day >= 7,
    effect: { feeMult:0.9, tipMult:1.3 } },
  { id:'dinlenme', name:'Dinlenme Programı',
    body: 'Enerjiniz bizim için değerli! 🧘 Dinlenme Programı\'nda molalarınız performans değerlendirmenize olumlu bir sinyal olarak işlenir ve wellness içeriklerimize erişiminiz açılır; günlük yalnızca 25 ₺ wellness katkısı hesabınızdan otomatik ayrılır. Dinlenmiş iş ortağı, mutlu müşteri! 💚',
    cond: (S) => S.day >= 7,
    effect: { expense:25 } }
];
