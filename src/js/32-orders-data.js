/* ---------------- SİPARİŞ PARÇALARI ----------------
   Restoran: name, tag (fişte görünen slogan), areas (teslimat yaptığı ilçeler), menu.
   Menü satırı: [emoji, ad, fiyat ₺, solo]  solo:true → tek başına sipariş edilebilir.
   Fiyatlar 2026 İstanbul paket servis seviyesi (restoran yemeği kişi başı 400-650 ₺). */
const RESTAURANTS = [
  { name:'Sushi Çıkmazı', tag:'Taze balık. Dün tazeydi.', areas:['Kadıköy','Ataşehir','Üsküdar'],
    menu:[['🍣','Sushi set (24 parça)',1450,true],['🍣','Somon roll (8 parça)',520,false],['🍜','Ramen',540,true],['🥟','Gyoza (6 adet)',320,false],['🫛','Edamame',180,false],['🍡','Mochi (3 adet)',170,false]] },
  { name:'Burger Baronu', tag:'Et %100 dana. Yüzde kaçı et, yazmıyor.', areas:['Beşiktaş','Şişli','Beyoğlu','Kağıthane'],
    menu:[['🍔','Baron Menü',520,true],['🍔','Cheeseburger',380,false],['🍗','Çıtır tavuk burger',350,false],['🍟','Patates kızartması (42 adet, sayılı)',160,false],['🧅','Soğan halkası',190,false],['🥤','Milkshake',210,false],['🥤','Kola',70,false]] },
  { name:'Lahmacun Dünyası', tag:'Lahmacunun dünyası. Dünyanın lahmacunu.', areas:['Fatih','Bakırköy','Beyoğlu'],
    menu:[['🫓','Lahmacun',170,false],['🫓','Fındık lahmacun (10 adet)',650,true],['🧀','Kaşarlı pide',340,true],['🥩','Kıymalı pide',360,false],['🥛','Ayran',50,false],['🍮','Künefe',300,false]] },
  { name:'Köfteci Yakup', tag:'1962\'den beri aynı köfte. Fiyat hariç.', areas:['Kadıköy','Üsküdar','Maltepe'],
    menu:[['🥩','Köfte porsiyon',460,true],['🥖','Köfte ekmek',280,false],['🥗','Piyaz',160,false],['🥛','Ayran',50,false],['🍮','İrmik helvası',140,false]] },
  { name:'Pizza Lokali', tag:'Napoli\'de değiliz. Mahallede bile değiliz.', areas:['Şişli','Beşiktaş','Kağıthane','Sarıyer'],
    menu:[['🍕','Büyük boy karışık pizza',680,true],['🍕','Orta boy margherita',520,true],['🥖','Sarımsaklı ekmek',180,false],['🍗','Buffalo kanat (8 adet)',340,false],['🥤','Kola 1 L',90,false]] },
  { name:'Çiğköfte Express', tag:'Acısı sende, parası bizde.', areas:['Fatih','Bakırköy','Pendik','Maltepe'],
    menu:[['🌯','Çiğköfte dürüm, "çok acılı olmasın"',130,false],['🥣','Çiğköfte porsiyon (500 g)',260,true],['🥤','Şalgam',55,false],['🥛','Ayran',50,false],['🫓','Ekstra lavaş',25,false]] },
  { name:'Ev Yemekleri Nurten Teyze', tag:'Annenin yaptığı gibi. Annen bu fiyata yapmazdı.', areas:['Üsküdar','Kadıköy','Ataşehir'],
    menu:[['🍛','Kuru fasulye + pilav',290,true],['🍲','Mercimek çorbası (kapağı gevşek)',120,false],['🍲','Sulu köfte',320,false],['🫒','Zeytinyağlı dolma',240,false],['🍮','Sütlaç',130,false]] },
  { name:'Kokoreççi Gece Kuşu', tag:'02.00\'den sonra menü aynı, müşteri farklı.', areas:['Beşiktaş','Beyoğlu','Şişli','Kadıköy'],
    menu:[['🥖','Yarım ekmek kokoreç',350,true],['🥖','Çeyrek ekmek kokoreç',220,false],['🍤','Midye tava',240,false],['🥤','Şalgam',55,false],['🥛','Ayran',50,false]] },
  { name:'Salata Bar (Vegan)', tag:'Her şey organik. Fiyat da organik büyüdü.', areas:['Kadıköy','Beşiktaş','Şişli'],
    menu:[['🥗','Kinoa salata',370,true],['🥣','Buddha bowl',450,true],['🥑','Avokadolu tost',310,false],['🥤','Yeşil smoothie',230,false],['🍮','Chia puding',190,false]] },
  { name:'Kebap-ı Alem', tag:'Bütün yollar Adana\'ya çıkar.', areas:['Fatih','Bakırköy','Kağıthane','Pendik'],
    menu:[['🍢','Adana porsiyon',480,true],['🍖','İskender',560,true],['🌯','Beyti sarma',520,true],['🫓','Lahmacun',160,false],['🥛','Ayran',50,false],['🍮','Künefe',300,false]] },
  { name:'Tatlıcı Şekerpare', tag:'Şeker ilaçtır. Dozu biz ayarlarız.', areas:['Kadıköy','Üsküdar','Beşiktaş','Şişli','Fatih'],
    menu:[['🎂','Doğum günü pastası (hassas)',1500,true],['🍮','Profiterol',280,false],['🍯','Baklava (1 kg)',1100,true],['🍰','Trileçe',200,false],['🍮','Magnolia',190,false]] },
  { name:'Waffle & Dert', tag:'Çikolata derdi çözmez ama erteler.', areas:['Kadıköy','Beşiktaş','Bakırköy','Maltepe'],
    menu:[['🧇','Waffle (çilekli, muzsuz)',400,true],['🥔','Kumpir',330,true],['🍋','Limonata',130,false],['🥤','Milkshake',210,false],['🍦','Frozen yoğurt (eriyor)',180,false]] },
  { name:'Filtre Yok Coffee', tag:'Üçüncü nesil kahve. İkinci nesil fiyat yetmedi.', areas:['Beşiktaş','Şişli','Beyoğlu','Kadıköy','Sarıyer'],
    menu:[['☕','Filtre kahve',140,true],['☕','Flat white',190,true],['🧊','Iced latte',210,true],['🍰','Cheesecake',290,false],['🥐','Kruvasan',170,false],['🍪','Yulaflı kurabiye',110,false]] },
  { name:'Döner "Et Varmış"', tag:'Dönerde et var. Yemin ederiz. Noter değiliz.', areas:['Fatih','Kağıthane','Pendik','Ataşehir','Bakırköy'],
    menu:[['🌯','Döner dürüm',300,false],['🍛','Pilav üstü döner',360,true],['🍖','Et döner porsiyon',520,true],['🥛','Ayran',50,false],['🥤','Kola',70,false]] },
  { name:'Mantıcı Hanımeli', tag:'El açması. Kimin eli, sormayın.', areas:['Üsküdar','Ataşehir','Maltepe','Pendik','Sarıyer'],
    menu:[['🥟','Mantı porsiyon',380,true],['🍲','Tarhana çorbası',120,false],['🥛','Ayran',50,false],['🍮','Tel kadayıf',220,false]] }
];
const FIRST_NAMES = ['Ayşe','Mehmet','Zeynep','Burak','Elif','Can','Selin','Emre','Deniz','Merve','Kaan','Büşra','Serkan','Gamze','Onur','İrem','Tolga','Ceren','Barış','Pelin'];
const SURNAME_INITIALS = ['K.','Y.','A.','D.','S.','Ö.','Ç.','T.','B.','G.'];
const BUILDINGS = ['Apt.','Sitesi B Blok','Apt.','Rezidans','Apt.','Sitesi A Blok','Apt.'];
/* Notlar: key alanı hafıza olaylarının bağlanacağı anahtar (ör. 'knock' → "kaç kere çaldın?") */
const NOTES = [
  {text:'Zili çalmayın, bebek uyuyor.', key:'nobell'},
  {text:'Kapıya bırakın, temas istemiyorum.', key:'leave'},
  {text:'{floor}. kat, asansör yok, kolay gelsin :)'},
  {text:'Bahşiş yarın. Söz.', key:'tiplater'},
  {text:'Çatal unutmayın!!!'},
  {text:'Site güvenliğine "Ahmet Bey\'in misafiri" deyin.', key:'guest', value:'Ahmet Bey'},
  {text:'Site güvenliğine "Nurten Hanım\'ın misafiri" deyin.', key:'guest', value:'Nurten Hanım'},
  {text:'Güvenliğe "Kemal Bey\'in misafiri" demeniz yeterli.', key:'guest', value:'Kemal Bey'},
  {text:'Hızlı gelirseniz yorum yazarım.'},
  {text:'Kapıyı 3 kere çalın, 2 kere değil.', key:'knock', value:3},
  {text:'Kapıyı 2 kere çalın, 3 kere değil.', key:'knock', value:2},
  {text:'Zil bozuk, kapıya 4 kere vurun.', key:'knock', value:4},
  {text:'Köpek ısırmaz. Genelde.'},
  {text:'Kapıda kedi varsa içeri sokmayın, bizim değil.'},
  {text:'Ketçap mayonez bol olsun, poşete ayrı koyun, dökülmesin, soğumasın, acele edin, teşekkürler.'},
  {text:'Lütfen paketi yere koymayın, kapı önündeki sandalyeye bırakın.'},
  {text:'Toplantıdayım, kapıcıya bırakın. Kapıcı yoksa komşuya. Komşu yoksa bekleyin.'},
  {text:'Daire {apt}. Kapıda isim yazmıyor, zilde de yazmıyor. Siz bulursunuz.'},
  {text:'Çocuk uyuyor, köpek uyumuyor. Ona göre.'},
  {text:'Para üstünü tam verin, geçen kurye 20 ₺ eksik verdi.'},
  {text:'Bina girişi arka sokaktan. Ön kapı 2019\'dan beri kilitli.'},
  {text:'Eve geç geleceğim, yine de hemen gönderin.'},
  {text:'Soğan koymasınlar. Koymuşlarsa siz ayıklayın.'},
  {text:''},{text:''},{text:''}
];
function pickNote(o){
  let pool = NOTES.filter(n => !S.usedNotes.includes(n.text) || n.text === '');
  if(pool.length < 4) { S.usedNotes = []; pool = NOTES.slice(); }
  const n = pick(pool); if(n.text) S.usedNotes.push(n.text);
  return { text: n.text.replace('{floor}', o.floor).replace('{apt}', o.apt), key: n.key, value: n.value };
}
/* İlçeler: dat = -e/-a hali ("Kadıköy'e gidiliyor"), hoods = mahalle/semt, streets = o ilçede gerçekten olan caddeler,
   tip = bahşiş eğilimi çarpanı, blurb = sürüş ekranında görünen not. */
const DISTRICTS = [
  {name:'Kadıköy', dat:"Kadıköy'e", tip:1.1, hoods:['Moda','Caferağa','Fenerbahçe','Göztepe','Caddebostan','Suadiye'],
    streets:['Bahariye Cad.','Moda Cad.','Bağdat Cad.','Kuşdili Cad.','Mühürdar Cad.','Dr. Esat Işık Cad.'],
    blurb:'Her sokakta bir kedi, her kedide bir Instagram hesabı.'},
  {name:'Beşiktaş', dat:"Beşiktaş'a", tip:1.15, hoods:['Abbasağa','Sinanpaşa','Ortaköy','Bebek','Etiler','Levent'],
    streets:['Barbaros Bulvarı','Ihlamurdere Cad.','Nispetiye Cad.','Cevdetpaşa Cad.','Süleyman Seba Cad.','Akmaz Çeşme Sok.'],
    blurb:'Yokuş. Yokuşun üstünde yokuş. Maç günü Çarşı\'ya motorla girilmez.'},
  {name:'Şişli', dat:"Şişli'ye", tip:1.2, hoods:['Nişantaşı','Teşvikiye','Mecidiyeköy','Fulya','Bomonti','Harbiye'],
    streets:['Halaskargazi Cad.','Rumeli Cad.','Valikonağı Cad.','Abdi İpekçi Cad.','Büyükdere Cad.','Silahşör Cad.'],
    blurb:'Nişantaşı\'nda park yeri yok, Mecidiyeköy\'de yol yok.'},
  {name:'Üsküdar', dat:"Üsküdar'a", tip:1.0, hoods:['Kuzguncuk','Çengelköy','Altunizade','Kısıklı','Beylerbeyi','Bağlarbaşı'],
    streets:['Paşalimanı Cad.','İcadiye Cad.','Hakimiyet-i Milliye Cad.','Çengelköy Cad.','Nuhkuyusu Cad.','Selmani Pak Cad.'],
    blurb:'Manzara bedava. Yokuş da bedava, sana zimmetli.'},
  {name:'Ataşehir', dat:"Ataşehir'e", tip:1.05, hoods:['Atatürk Mah.','Barbaros Mah.','İçerenköy','Küçükbakkalköy','Yenisahra','Ferhatpaşa'],
    streets:['Ataşehir Bulvarı','Mustafa Kemal Cad.','Kayışdağı Cad.','Şenol Güneş Bulvarı','Turgut Özal Bulvarı'],
    blurb:'Rezidans, site, bariyer, güvenlik. Kapıya ulaşmak dört aşamalı doğrulama.'},
  {name:'Beyoğlu', dat:"Beyoğlu'na", tip:1.1, hoods:['Cihangir','Galata','Karaköy','Taksim','Kasımpaşa','Tarlabaşı'],
    streets:['Sıraselviler Cad.','Serdar-ı Ekrem Sok.','Kemankeş Cad.','Tarlabaşı Bulvarı','Yeni Çarşı Cad.','Boğazkesen Cad.'],
    blurb:'Tek yön, merdiven, turist. Üçü de sana karşı.'},
  {name:'Bakırköy', dat:"Bakırköy'e", tip:1.0, hoods:['Ataköy','Yeşilköy','Florya','Osmaniye','Zeytinlik','Kartaltepe'],
    streets:['İncirli Cad.','İstanbul Cad.','Ebuzziya Cad.','Rauf Orbay Cad.','Zeytinlik Cad.','Kennedy Cad.'],
    blurb:'Sahil yolu düz. Trafik düz değil.'},
  {name:'Maltepe', dat:"Maltepe'ye", tip:0.95, hoods:['Altayçeşme','Küçükyalı','Cevizli','Zümrütevler','İdealtepe','Bağlarbaşı'],
    streets:['Bağdat Cad.','Yalı Cad.','Cemal Gürsel Cad.','Atatürk Cad.','Çınar Cad.','Hüseyin Sok.'],
    blurb:'Bağdat Caddesi\'nin ucuz ucu. Yine de pahalı.'},
  {name:'Sarıyer', dat:"Sarıyer'e", tip:1.25, hoods:['Yeniköy','İstinye','Tarabya','Maslak','Zekeriyaköy','Rumeli Hisarı'],
    streets:['Köybaşı Cad.','Büyükdere Cad.','İstinye Bayırı Cad.','Tarabya Bayırı Cad.','Yahya Kemal Cad.','Zekeriyaköy Cad.'],
    blurb:'Boğaz manzaralı villa. Villanın kapısı 400 metre ileride, zil 200 metre ileride.'},
  {name:'Pendik', dat:"Pendik'e", tip:0.9, hoods:['Kurtköy','Kaynarca','Yenişehir','Çamçeşme','Batı Mah.','Doğu Mah.'],
    streets:['Ankara Cad.','Sahil Yolu','Fatih Cad.','Cumhuriyet Cad.','Çamlık Cad.','Şeyhli Cad.'],
    blurb:'Haritada uzak. Motorda daha uzak.'},
  {name:'Fatih', dat:"Fatih'e", tip:0.95, hoods:['Sultanahmet','Aksaray','Balat','Fener','Çapa','Fındıkzade'],
    streets:['Divan Yolu Cad.','Vatan Cad.','Millet Cad.','Vodina Cad.','Ordu Cad.','Fevzi Paşa Cad.'],
    blurb:'Tarihi yarımada: her sokak tarihi, hiçbir sokak düz.'},
  {name:'Kağıthane', dat:"Kağıthane'ye", tip:1.0, hoods:['Gültepe','Çağlayan','Seyrantepe','Hamidiye','Merkez','Harmantepe'],
    streets:['Cendere Cad.','Sadabat Cad.','Talatpaşa Cad.','Çağlayan Cad.','Hamidiye Cad.','Kağıthane Cad.'],
    blurb:'Plazaların arka bahçesi. 12.30\'da 4.000 kişi aynı anda acıkıyor.'}
];
// Sipariş ekranında dönen "platform bildirimleri"
const PLATFORM_MSGS = [
  'Bugün 3 teslimat daha yaparsan rozet kazanırsın. Rozet para etmiyor.',
  'Algoritma seni seviyor. Bugünlük.',
  'Ortalama kuryeden %2 daha iyisin. Ortalama kurye kim, bilmiyoruz.',
  'Yeni özellik: artık reddettiğin siparişleri de görebiliyorsun. Pişmanlık modu.',
  'Hatırlatma: Sen bir "iş ortağısın". Ortaklar sigortalı olmaz.',
  'Puanın 5 olsaydı bahşişler %4 daha fazla olurdu. Olmadı.',
  'Teslimat süren harika! Bu cümle otomatik olarak herkese gidiyor.',
  'Motorun bakımı yaklaştı. Bu bizim sorunumuz değil, sadece bildiriyoruz.',
  'Yeni: "Kurye Dostu Restoran" rozeti. Rozetli restoranda tuvalet var. Bir tane.',
  'Anket: Bugün kendini nasıl hissediyorsun? (Cevabın hiçbir şeyi değiştirmez.)',
  'Gece tarifesi 20.00\'de başlar. Karanlık senin sorunun, biz sadece ödüyoruz.',
  'Haftanın kuryesi: Sen değilsin. Ama o da sigortalı değil, üzülme.',
  'Hatırlatma: Yağmurluk dükkanda satılıyor. Yağmur satılmıyor, ücretsiz.'
];

