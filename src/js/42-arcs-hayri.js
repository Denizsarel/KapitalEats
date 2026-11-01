/* ---------------- HAYRİ ABİ — «AKILLI KAPI» ----------------
   Yıldız Apt., Moda Cad. No 14, Kadıköy. Kapıcı Hayri Abi: Sivaslı, otuz bir yıl aynı bina.
   6 beat, hepsi mode 'ticket'. Fişteki müşteri binanın kiracısıdır (Ayla Ş. 3/7, Sedat Y. 5/10,
   Nermin K. 2/4); Hayri Abi zemin kattaki kapıcı dairesindedir.
   Anlatıcı: ikinci tekil, geniş zaman (ağız kağıdı). Tırnak içindeki konuşma serbest.
   Bayraklar (A.flags): noName, knowsGoal, petition, volkan, kapitaldoor, stayed, left, cold.
   Facts: 'volkan_ride'  — olay yazarı hasFact ile okur. Mekanik karşılığı YOK; metin de vaat etmez.
                           (Bahşiş çarpanı istenirse motor + sözleşme işi, burada değil.)
          'kapitaldoor'  — olay yazarı hasFact ile okur. Fişte 4 haneli kapı kodu için motor desteği
                           İSTENİYOR, sözleşmede yok; metin bunu oyuncuya vaat etmez.
          'hayri_stayed' | 'hayri_left' | 'hayri_cold' (final).
   DİKKAT: 61-day-loop makeOffers gün-1 öğretici fişinde müşteri 'Ayşe K.' yazılı; bu dosya ve
   40-events kapici_hayri 'Ayla Ş. / Ayla Hanım' der. Motorun 'Ayla Ş.' demesi istenir (rapor).
   Final: petition && volkan && rating ≥ 4,0 → hayri_key; rating < 3,5 → soğuk kapanış; aksi → hayri_glass.
   Şema: docs/CONTENT_CONTRACT.md */

const HAYRI_ADDR = (customer, floor, apt) => ({
  district: 'Kadıköy', hood: 'Moda', street: 'Moda Cad.', no: 14, building: 'Yıldız Apt.', floor, apt, customer
});
// Hayri Abi hedefi mağazanın adıyla değil, düz adıyla söyler ("Gereksiz Markalı Tasarım Tişört" → "tişört").
const HAYRI_GOAL_WORD = { iphone: 'telefon', tshirt: 'tişört', termos: 'termos', scooter: 'scooter' };
function hayriGoal(S){
  return S.goalId ? (HAYRI_GOAL_WORD[S.goalId] || 'bir şey') : null;
}

/* ---- 1. KİM O? (Gün 1, soğuk açılış) ---- */
ARC_BEATS.push({
  arc: 'hayri', step: 1, startDay: 1, dueGap: 1, mode: 'ticket',
  address: HAYRI_ADDR('Ayla Ş.', 3, 7),
  hook: "Moda Cad. 14, Yıldız Apt. Kapıcısı herkesin adını sorar, bir kere.",
  hookShort: 'Yıldız Apt.',
  build: (o, S, A) => ({
    title: 'KİM O?',
    text: `Yıldız Apartmanı'nın demir kapısı itilince inler. Zemin katta bir kapı aralık; içeriden çay, Maltepe sigarası ve ıslak paspas kokusu. Lacivert hırkalı, bıyıklı; ince belli bardağı tabağa koyup ayağa kalkar. "Kim o?" Seni, çantayı, kaskı tartar. "Hayri. Otuz bir yıldır buradayım, bina benim sayılır, o ayrı. Sen yenisin. Adın ne oğlum?"`,
    choices: [
      { label: 'Adını söyle',
        result: `"${S.name}." Bir kere daha söyler, ağzına oturtur gibi: "${S.name}. Tamam." Asansörün düğmesine kendi basar. "Kuryeye yasak bu. İlk günün, görmedim." Üçüncü kata çıkarken merdiven boşluğundan sesi gelir: "Bir daha gelirsen oğlandan mektup var, okurum."`,
        effects: { rating: 0.1, rel: { hayri: 1 } } },
      { label: 'Adını verme, geç',
        result: `"Kurye." Başını sallar, bardağı alır, oturur. "Kurye çok oğlum, Hayri bir tane. Merdiven solda, asansör kuryeye yasak." Üç kat yürürsün. Ayla Hanım fişi kapıda yüksek sesle okur: "${S.name}, değil mi?" Merdiven boşluğu adını aşağıya, kapıcı dairesine kadar taşır.`,
        effects: { sets: { noName: true }, energy: -5 } }
    ]
  })
});

/* ---- 2. MEKTUP (Gün 2) — Volkan Berlin'de kurye; hedefini söylersen knowsGoal ---- */
ARC_BEATS.push({
  arc: 'hayri', step: 2, dueGap: 2, mode: 'ticket',
  address: HAYRI_ADDR('Sedat Y.', 5, 10),
  hook: "Hayri Abi'ye Berlin'den mektup gelmiş. Gelirsen okuyacak.",
  hookShort: "Hayri'nin mektubu",
  build: (o, S, A) => {
    const intro = A.flags.noName
      ? `"${S.name}." Kapıcı dairesinin kapısı bu kez tam açık. "Adını vermedin, Ayla Hanım kapıda okudu, merdiven getirdi. Ben bir şey demem."`
      : `"${S.name}, gel." Kapıcı dairesinin kapısı bu kez tam açık; adın ilk seferden aklında.`;
    const g = hayriGoal(S);
    return {
      title: 'MEKTUP',
      text: `${intro} Masada Deutsche Post pullu bir zarf, üstünde okuma gözlüğü. "Oğlan, Volkan. Berlin'de kurye, bisikletle." Parmağı bir satırda durur: "Baba, burada saat ücreti var, yağmur parası ayrı." Zarfı ikiye katlar. "Sen ne için koşuyorsun oğlum? Alacağın bir şey mi var, yoksa telefon mu koşturuyor seni?"`,
      choices: [
        { label: 'Hedefini söyle',
          result: `"Demek ${g || 'bir şey var'}." Gözlüğü alnına kaldırır, bir süre öyle bakar. "Volkan da ilk yıl bisiklet istedi, bisikleti aldı, bisikleti çaldılar. Hedef hedeftir, o ayrı." Çayı doldurur, şekeri iki atar, sormaz. Beşinci kata asansörle çıkarsın; düğmeye bu kez sen basarsın.`,
          effects: { sets: { knowsGoal: true }, rel: { hayri: 1 }, energy: 5 } },
        { label: 'Mektubun devamını sor',
          result: `Okur: "Ev arkadaşım Lahorlu baba, kira bin iki yüz avro. Spree kenarında yağmurda bile oturuyoruz." Zarfı indirir: "Burayı soruyor. Asansörü soruyor, Ayla Hanım'ın kedisini soruyor." Zarf göğüs cebine; çay sen istemeden önüne gelir. Beşinci katta Sedat Bey kutunun altına dokunur: "Ilık."`,
          effects: { rel: { hayri: 2 }, energy: 5, rating: -0.1 } },
        { label: 'Acele et, geç',
          result: `"Herkesin acelesi var oğlum, Volkan'ın da vardı." Zarfı masaya bırakır, kapıyı yarıya kadar kapar. Asansör anahtarı cebinde kalır; beş katı merdivenden çıkarsın, Sedat Bey'in kapısında nefesin kesik, paket ılık.`,
          effects: { rel: { hayri: -1 }, energy: -8 } }
      ]
    };
  }
});

/* ---- 3. İMZA (Gün 4) — yönetim KapitalDoor getiriyor; imza → petition (%25 yönetim şikayeti: puan −0,2, sayaç yok) ---- */
ARC_BEATS.push({
  arc: 'hayri', step: 3, dueGap: 3, mode: 'ticket',
  address: HAYRI_ADDR('Ayla Ş.', 3, 7),
  hook: "Yıldız Apt. yönetimi toplanmış. Hayri Abi elinde şeffaf bir dosyayla bekliyor.",
  hookShort: "Hayri'nin dosyası",
  build: (o, S, A) => {
    const g = hayriGoal(S);
    const open = A.flags.knowsGoal && g ? `"Senin şu ${g} meselesi vardı ya oğlum, benim de şu var."` : `"Oğlum, dur bir dakika."`;
    return {
      title: 'İMZA',
      text: `Hayri Abi kapıcı dairesinin önünde ayakta, elinde şeffaf dosya, dosyada iki sayfa ve bir tükenmez. ${open} "Yönetim toplandı. Kapıya karekod gelecek, KapitalDoor diyorlar, ben gidecekmişim. Otuz bir yıl, bir karekod." Dosyayı uzatır; ilk sayfada beş imza, biri Nermin Hanım'ın. "Şu kağıda imza var mı, yok mu? Yoksa da bir şey demem, o ayrı."`,
      choices: [
        { label: 'İmzala',
          outcomes: [
            { chance: 0.75,
              result: `İmzalarsın. Adını okur, heceler, dosyayı göğsüne bastırır. "Hemşerim olmasan da sayılırsın artık." Asansörün kapısını eliyle tutar; üç katı on saniyede çıkarsın, Ayla Hanım kapıda dosyayı sorar: "İmzaladın mı?" "İmzaladım."`,
              effects: { sets: { petition: true }, rel: { hayri: 2 } } },
            { chance: 0.25,
              result: `İmzalarsın. Merdivende telefon titrer: "Bir bina yönetimi, teslimat dışı faaliyet bildiriminde bulundu. İş Ortağı Puanınız güncellendi 💙" Dosya aşağıda Hayri Abi'nin göğsünde, senin adın ikinci sayfada, altıncı sıra.`,
              effects: { sets: { petition: true }, rel: { hayri: 2 }, rating: -0.2 } }
          ] },
        { label: 'İmzalama',
          result: `"Kurye imza atamaz Hayri Abi, sözleşmede var." Dosyayı kapar, tükenmezi hırkasının cebine sokar. "Sözleşme sözleşmedir, bilirim. Volkan'ın da vardı." Asansör bu kez çağrılmaz; üç katı merdivenden çıkarsın, Ayla Hanım kapıda dosyayı sorar: "İmzaladın mı?"`,
          effects: { rel: { hayri: -1 }, energy: -5 } },
        { label: 'İmzala, yukarı çıkar',
          outcomes: [
            { chance: 0.6,
              result: `İmzalarsın, dosyayı Ayla Hanım'a uzatırsın. "Ben kuruldayım, bana gelmez; Sedat Bey'e çıkar." Beşinci katta Sedat Bey imzalar, merdiven boşluğuna seslenir: "Nermin Hanım, çıkın, imza var." Dört imza daha. Aşağıda Hayri Abi sayfaları saymaz, okşar. "Oğlum sen bizden oldun." Ayla Hanım kapısından bir yirmilik uzatır: "Yürüdüğün için."`,
              effects: { sets: { petition: true }, rel: { hayri: 3 }, tip: 20 } },
            { chance: 0.4,
              result: `İmzalarsın, dosyayı Ayla Hanım'a uzatırsın. "Ben yönetim kurulundayım, bu dosya bana gelmez." Sedat Bey'in kapısı açılmaz. Dosya aşağıya senin elinde iner, imzan birinci sayfada. Merdivende telefon titrer: "Teslimat deneyiminiz hakkında bir geri bildirim aldık. Birlikte daha iyiye! 💙" Hayri Abi: "Olur öyle. Ayla Hanım iyi insandır."`,
              effects: { sets: { petition: true }, rel: { hayri: 1 }, rating: -0.2 } }
          ] }
      ]
    };
  }
});

/* ---- 4. VOLKAN (Gün 7) — oğlu Berlin'den gelir; arkana alırsan volkan bayrağı + volkan_ride fact (enerji −10 bugün) ---- */
ARC_BEATS.push({
  arc: 'hayri', step: 4, dueGap: 3, mode: 'ticket',
  address: HAYRI_ADDR('Nermin K.', 2, 4),
  hook: "Volkan Berlin'den geliyor; Hayri Abi seni oğlanla tanıştıracak.",
  hookShort: 'Volkan geliyor',
  build: (o, S, A) => {
    const g = hayriGoal(S);
    const vol = A.flags.knowsGoal && g ? `"Babam yazmış: ${g} için koşuyormuşsun. Doğru mu?"` : `"Babam seni yazmış mektupta. Üç satır, benden fazla."`;
    const dosya = A.flags.petition ? `"Dosya yönetimde oğlum. Ses yok."` : `"Yönetimden ses yok. Ben de sormadım."`;
    return {
      title: 'VOLKAN',
      text: `Kapıcı dairesinin önünde iki tabure. Birinde Hayri Abi; ötekinde otuzlarında, kulaklıklı, sarı yağmurluklu: "Volkan. Berlin." Eli soğuk, kaskı yok. ${vol} Hayri Abi çayı üçe böler. ${dosya} Volkan bardağı bırakır: "Bu akşam bir tur arkana alır mısın abi? Burayı görmek istiyorum."`,
      choices: [
        { label: "Volkan'ı arkana al",
          result: `Volkan arkada, dizleri çantaya dayalı. Kuşdili Caddesi'nde durdurur: "Abi, çantayı sırta değil bele yakın tak, kapıda on saniye kazanırsın." Yorulursun; kazanırsın da. Dönüşte Hayri Abi kapıda, çay ikiye bölünmüş: "İkiniz birden geldiniz. Çay iki."`,
          effects: { energy: -10, sets: { volkan: true }, fact: 'volkan_ride', rel: { hayri: 2 } } },
        { label: "Otur, Berlin'i sor",
          result: `Oturursun. Volkan anlatır: "Yağmur parası var abi, Kreuzberg'de bisiklet hırsızı var, ayda bir kurye toplantısı var." "Gidiyor musun?" "Gidiyorum, çay bedava." Hayri Abi güler, ilk kez. Nermin Hanım'ın mercimek çorbası ikinci katta ılır; "ılık da olur" diye paketi alır.`,
          effects: { rel: { hayri: 1 }, energy: 5, rating: -0.1 } },
        { label: 'Siparişe koş, geç',
          result: `"Sipariş bekliyor." Volkan başını sallar, kulaklığı takar. Hayri Abi bardağı tabağa koyar: "Oğlan cumaya kadar burada. Sen her gün buradasın, o ayrı." Nermin Hanım'ın kapısına çıkarken merdiven boşluğu Volkan'ın telefonunu yukarı taşır: Rammstein, kısık.`,
          effects: { rel: { hayri: -1 } } }
      ]
    };
  }
});

/* ---- 5. AKILLI KAPI (Gün 10) — KapitalDoor takıldı; panel daire numarasını sorar (hafıza). Hayri Abi karşıdaki çay ocağında ---- */
ARC_BEATS.push({
  arc: 'hayri', step: 5, dueGap: 3, mode: 'ticket',
  address: HAYRI_ADDR('Ayla Ş.', 3, 7),
  hook: "Yıldız Apt.'nin kapısına siyah bir panel takılmış. Hayri Abi kapıda görünmüyor.",
  hookShort: 'Akıllı kapı',
  build: (o, S, A) => {
    const hayri = A.flags.petition ? `elini kaldırır, ses etmez.` : `seni görür, çayına döner.`;
    const ok = {
      result: `Kilit tık eder, yeşil ışık. Üçüncü kata asansörle çıkarsın; panel asansöre karışmaz. Dönüşte karşıya geçersin. Hayri Abi tabureyi ayağıyla iter: "Otur. Kodu bildin, iyi. Kapı beni de bilirdi, o ayrı." Çayı o öder, ocakçıya "yazma" diye işaret eder.`,
      effects: { rating: 0.1, rel: { hayri: 1 }, energy: 5, sets: { kapitaldoor: true }, fact: 'kapitaldoor' }
    };
    const bad = {
      result: `Kırmızı ışık, iki bip. "Hatalı giriş. Yönetime bildirildi." Karşıdan terlik sesi: Hayri Abi, anahtarlığında hâlâ bina anahtarı. Kapıyı eski usul açar. "Kod koddur oğlum, anahtar ayrı." Ayla Hanım yukarıda bekler, uygulama aşağıda yazar: "Müşteriniz sizi heyecanla bekliyor 🙂 Birlikte hızlanalım!"`,
      effects: { rating: -0.2, rel: { hayri: 1 }, sets: { kapitaldoor: true }, fact: 'kapitaldoor' }
    };
    return {
      title: 'AKILLI KAPI',
      text: `Yıldız Apartmanı'nın kapısında siyah bir panel: KapitalDoor, mavi ışık, bir kamera gözü. Kapıcı dairesinin penceresinde perde yok, masa yok. Hayri Abi karşı kaldırımda, Yakamoz Çay Ocağı'nın taburesinde, hırkasız; ${hayri} Panel konuşur: "Hoş geldiniz. Teslimat yapılacak daire numarasını girin." Fişe bakmak yok; numara aklında.`,
      choices: memChoices(
        `Daire ${o.apt} gir`, decoyNums(o.apt, 1, 24).map(n => `Daire ${n} gir`),
        ok, bad
      )
    };
  }
});

/* ---- 6. FİNAL (Gün 13) — bayraklara ve puana göre üç kapanış ---- */
ARC_BEATS.push({
  arc: 'hayri', step: 6, dueGap: 0, mode: 'ticket', final: true,
  address: HAYRI_ADDR('Ayla Ş.', 3, 7),
  hook: "Hayri Abi haber yolladı: Yıldız'a uğra, konuşacağız.",
  hookShort: "Hayri'nin son sözü",
  build: (o, S, A) => {
    const f = A.flags;

    /* Soğuk kapanış: puan < 3,5 — hediye yok, bağ kopar */
    if (S.rating < 3.5) return {
      title: 'ONLARDAN',
      text: `Karşı kaldırım, Yakamoz Çay Ocağı. Hayri Abi'nin yanında bir Migros poşeti, içinde hırka ve okuma gözlüğü. "Oğlum, sen de onlardan oldun. Panel puanını gösteriyor, Ayla Hanım soğuk çorbayı gösterdi. Ben Kastamonu'ya, kızın yanına." Bardağı ocakçıya uzatır, geri alır, tabağa koyar. "Hemşerim olsan ne olur."`,
      choices: [
        { label: 'Özür dile',
          result: `"Özür bana değil oğlum, üçüncü kata." Ocakçıya iki çay parası bırakır; ikincisi senin önünde soğur. Poşeti alır, karşıya geçmez; durakta 37 plakalı bir Doblo bekler, damadı direksiyonda. Arkanda panel: "Teslimat yapılacak daire numarasını girin."`,
          effects: { rel: { hayri: 1 }, sets: { cold: true }, fact: 'hayri_cold' } },
        { label: 'Ses etme, kapıya yürü',
          result: `Karşıya geçersin, panele daireyi girersin, yeşil yanar. Dönüşte tabure boş, bardak tabağın üstünde ters. Ocakçı: "Hayri Abi'yi mi arıyorsun? Gitti. Çayın parasını sana yazdırdı."`,
          effects: { rel: { hayri: -1 }, sets: { cold: true }, fact: 'hayri_cold', money: -15 } }
      ]
    };

    /* Kalır: dosya + Volkan + puan ≥ 4,0 — «Bina Güvenlik Danışmanı», anahtar */
    if (f.petition && f.volkan && S.rating >= 4.0) return {
      title: 'DANIŞMAN',
      text: `Hayri Abi kapıda, panelin yanında; yakasında lamine bir kart: BİNA GÜVENLİK DANIŞMANI. Hırka aynı, bardak aynı. "Yönetim toplandı. Dosya, Volkan'ın yönetime yazdığı kağıt, Ayla Hanım'ın sesi. Kapıcı gitti, danışman geldi; maaş, o ayrı." Cebinden pirinç bir anahtar çıkarır. "Asansör anahtarı. Yedeği bende dursun, bu sende. Yukarı katlar için; aşağısını yürürsün."`,
      choices: [
        { label: 'Anahtarı al',
          result: `Alırsın; soğuk, ağır, dişleri aşınmış. "Kaybedersen söyle, kızmam." Üçüncü kata yürürsün; yukarı katlar artık anahtarın işi. Ayla Hanım kapıda: "Hayri kaldı mı?" "Kaldı." "İyi." Kapı kapanmadan içeriden Kızılcık Şerbeti'nin jeneriği gelir.`,
          effects: { keepsake: 'hayri_key', rel: { hayri: 2 }, rating: 0.1, sets: { stayed: true }, fact: 'hayri_stayed' } },
        { label: 'Çayı iç, sonra al',
          result: `Oturursun. Çay ince belli bardakta, şeker iki, panel mavi mavi yanar. Hayri Abi Volkan'ı anlatır, Sivas'ı anlatmaz. Anahtar tabağın kenarında bekler, sonra avucuna geçer. Üçüncü katta Ayla Hanım kapıyı anahtarın sesine açar: "Kaldı demek."`,
          effects: { keepsake: 'hayri_key', rel: { hayri: 3 }, energy: 10, rating: -0.1, sets: { stayed: true }, fact: 'hayri_stayed' } }
      ]
    };

    /* Gider: Kastamonu, kızın yanı — bardak. Neden gittiğini olaylarla anlatır, saymaz */
    const why = f.petition && !f.volkan ? `"Dosya yönetimde kaldı. İmza çoktu, cevap yoktu."`
      : !f.petition && f.volkan ? `"Volkan yazdı yönetime, Almanca kağıt bile koydu. Kağıdı imzalamayan çoktu, o ayrı."`
      : f.petition && f.volkan ? `"Dosya tamam, Volkan tamam. Yönetim panelin ekranına baktı, orada her şey varmış, o ayrı."`
      : `"Sen kağıdı imzalamadın, ben bir şey demedim. Panel geldi."`;
    return {
      title: 'BARDAK',
      text: `Yıldız Apartmanı'nın önünde 37 plakalı bir Doblo, bagajında koli bantlı kutular: MUTFAK, YORGAN, VOLKAN. Hayri Abi kaldırımda, hırkası kolunda. "Kastamonu, kızın yanı. Damat sabah yola çıkmış." ${why} Gazete kağıdına sarılı bir şey uzatır: ince belli bardak, çatlaksız. "Otuz bir yıl bundan içtim, kırılmadı. Sende kırılırsa kırılsın."`,
      choices: [
        { label: 'Bardağı al',
          result: `Alırsın, çantanın ön cebine, kaskın yanına. "Çay koyarken ağzına kadar doldur, kapıcı usulü." Doblo'nun kapısı kapanır, Moda Caddesi'nde sağa döner, sinyal vermez. Arkanda panel mavi mavi yanar: "Hoş geldiniz."`,
          effects: { keepsake: 'hayri_glass', rel: { hayri: 1 }, sets: { left: true }, fact: 'hayri_left' } },
        { label: 'Kutuları taşı, uğurla',
          result: `YORGAN kutusunu bagaja sen yerleştirirsin; VOLKAN yazılı olanı Hayri Abi dizine alır: "Bu benimle gelir." Damat teşekkür eder, Hayri Abi etmez; kaskının üstünden başına vurur, hafif. Bardak çantada. Ayla Hanım üçüncü kat penceresinden Doblo'ya el sallar, Doblo görmez.`,
          effects: { keepsake: 'hayri_glass', rel: { hayri: 2 }, energy: -5, rating: -0.1, sets: { left: true }, fact: 'hayri_left' } }
      ]
    };
  }
});
