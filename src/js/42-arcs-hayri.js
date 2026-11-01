/* ---------------- HAYRİ ABİ — «AKILLI KAPI» ----------------
   Yıldız Apt., Moda Cad. No 14, Kadıköy. Kapıcı Hayri Abi: Sivaslı, otuz bir yıl aynı bina.
   6 beat, hepsi mode 'ticket'. Fişteki müşteri binanın kiracısıdır (Ayla Ş. 3/7, Sedat Y. 5/10,
   Nermin K. 2/4); Hayri Abi zemin kattaki kapıcı dairesindedir.
   Bayraklar (A.flags): noName, knowsGoal, petition, volkan, kapitaldoor, stayed, left, cold.
   Facts: 'volkan_ride' (yazıldığı günün ertesi bahşiş ×1,2 — motor uygular),
          'kapitaldoor' (bundan sonra Yıldız fişlerinde 4 haneli kapı kodu + hafıza olayı — motor/olay yazarı),
          'hayri_stayed' | 'hayri_left' | 'hayri_cold' (final).
   Final: petition && volkan && rating ≥ 4,0 → hayri_key; rating < 3,5 → soğuk kapanış; aksi → hayri_glass.
   Şema: docs/CONTENT_CONTRACT.md */

const HAYRI_ADDR = (customer, floor, apt) => ({
  district: 'Kadıköy', hood: 'Moda', street: 'Moda Cad.', no: 14, building: 'Yıldız Apt.', floor, apt, customer
});
// Oyuncunun hedefinin adı, parantezsiz ("Koleksiyon Termos (Sınırlı Renk)" → "Koleksiyon Termos"). Hedef yoksa null.
function hayriGoal(S){
  const g = (typeof GOALS !== 'undefined') && GOALS.find(x => x.id === S.goalId);
  return g ? g.name.replace(/\s*\(.*?\)/, '') : null;
}

/* ---- 1. KİM O? (Gün 1, soğuk açılış) ---- */
ARC_BEATS.push({
  arc: 'hayri', step: 1, startDay: 1, dueGap: 1, mode: 'ticket',
  address: HAYRI_ADDR('Ayla Ş.', 3, 7),
  hook: "Moda Cad. 14, Yıldız Apt. Kapıcısı herkesin adını sorar, bir kere.",
  hookShort: 'Yıldız Apt.',
  build: (o, S, A) => ({
    title: 'KİM O?',
    text: `Yıldız Apartmanı'nın demir kapısı itilince inliyor. Zemin katta bir kapı aralık; içeriden çay, Maltepe sigarası ve ıslak paspas kokusu. Bıyıklı, lacivert hırkalı bir adam ince belli bardağı tabağa koyup ayağa kalktı. "Kim o?" Seni, çantayı, kaskı tarttı. "Hayri. Otuz bir yıldır buradayım, bina benim sayılır, o ayrı. Sen yenisin. Adın ne oğlum?"`,
    choices: [
      { label: 'Adını söyle',
        result: `"${S.name}." Bir kere daha söyledi, ağzına oturtur gibi: "${S.name}. Tamam." Asansörün düğmesine kendi bastı. "Kuryeye yasak bu. İlk günün, görmedim." Üçüncü kata çıkarken merdiven boşluğundan sesi geldi: "Yarın da gelirsen oğlandan mektup var, okurum."`,
        effects: { rating: 0.1, rel: { hayri: 1 } } },
      { label: 'Adını verme, geç',
        result: `"Kurye." Başını salladı, bardağı aldı, oturdu. "Kurye çok oğlum, Hayri bir tane. Merdiven solda, asansör kuryeye yasak." Üç kat yürüdün. Ayla Hanım fişi kapıda yüksek sesle okudu: "${S.name}, değil mi?" Merdiven boşluğu adını aşağıya, kapıcı dairesine kadar taşıdı.`,
        effects: { sets: { noName: true }, energy: -5 } }
    ]
  })
});

/* ---- 2. MEKTUP (Gün 2) — Volkan Berlin'de kurye; hedefini söylersen knowsGoal ---- */
ARC_BEATS.push({
  arc: 'hayri', step: 2, dueGap: 2, mode: 'ticket',
  address: HAYRI_ADDR('Sedat Y.', 5, 10),
  hook: "Hayri Abi'ye Berlin'den mektup gelmiş. Yarın gelirsen okuyacak.",
  hookShort: "Hayri'nin mektubu",
  build: (o, S, A) => {
    const intro = A.flags.noName
      ? `"${S.name}." Kapıcı dairesinin kapısı bu kez tam açık. "Adını vermedin, Ayla Hanım merdivende okudu. Ben bir şey demem, o ayrı."`
      : `"${S.name}, gel." Kapıcı dairesinin kapısı bu kez tam açık; adını ilk seferde tutmuş.`;
    const g = hayriGoal(S);
    return {
      title: 'MEKTUP',
      text: `${intro} Masada Deutsche Post pullu bir zarf, üstünde okuma gözlüğü. "Oğlan, Volkan. Berlin'de kurye, bisikletle." Parmağı bir satırda durdu: "Baba, burada saat ücreti var, yağmur parası ayrı." Zarfı ikiye katladı. "Sen ne için koşuyorsun oğlum? Alacağın bir şey mi var, yoksa telefon mu koşturuyor seni?"`,
      choices: [
        { label: 'Hedefini söyle',
          result: `"Demek ${g || 'bir hedef'}." Gözlüğü alnına kaldırdı, bir süre öyle baktı. "Volkan da ilk yıl bisiklet istedi, bisikleti aldı, bisikleti çaldılar. Hedef hedeftir, o ayrı." Çayı doldurdu, şekeri iki attı, sormadı. Beşinci kata asansörle çıktın; düğmeye bu kez sen bastın.`,
          effects: { sets: { knowsGoal: true }, rel: { hayri: 1 }, energy: 5 } },
        { label: 'Mektubun devamını sor',
          result: `Okudu. Volkan'ın ev arkadaşı Lahorlu, kira bin iki yüz avro, Spree kenarında yağmurda bile oturuyorlarmış. "Burayı soruyor. Asansörü soruyor, Ayla Hanım'ın kedisini soruyor." Zarfı göğüs cebine koydu; çay sen istemeden geldi. Beşinci katta Sedat Bey kutunun altına dokundu: "Ilık."`,
          effects: { rel: { hayri: 2 }, energy: 5, rating: -0.1 } },
        { label: 'Acele et, geç',
          result: `"Herkesin acelesi var oğlum, Volkan'ın da vardı." Zarfı masaya bıraktı, kapıyı yarıya kadar kapadı. Asansör anahtarı cebinde kaldı; beş katı merdivenden çıktın, Sedat Bey'in kapısında nefesin kesik, paket ılık.`,
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
      text: `Hayri Abi kapıcı dairesinin önünde ayakta, elinde şeffaf dosya, dosyada iki sayfa ve bir tükenmez. ${open} "Yönetim toplandı. Kapıya karekod gelecek, KapitalDoor diyorlar, ben gidecekmişim. Otuz bir yıl, bir karekod." Dosyayı uzattı; ilk sayfada beş imza, biri Nermin Hanım'ın. "Şu kağıda imza var mı, yok mu? Yoksa da bir şey demem, o ayrı."`,
      choices: [
        { label: 'İmzala',
          outcomes: [
            { chance: 0.75,
              result: `İmzaladın. Adını okudu, soyadını heceledi, dosyayı göğsüne bastırdı. "Hemşerim olmasan da sayılırsın artık." Asansörün kapısını eliyle tuttu; üç katı on saniyede çıktın, Ayla Hanım kapıda dosyayı sordu: "İmzaladın mı?" "İmzaladım."`,
              effects: { sets: { petition: true }, rel: { hayri: 2 } } },
            { chance: 0.25,
              result: `İmzaladın. Ertesi sabah uygulamada bir bildirim: "Bir bina yönetimi, teslimat dışı faaliyet bildiriminde bulundu. İş Ortağı Puanınız güncellendi 💙" Hayri Abi'nin dosyası şimdi yönetim odasında, senin adın ikinci sayfada, altıncı sıra.`,
              effects: { sets: { petition: true }, rel: { hayri: 2 }, rating: -0.2 } }
          ] },
        { label: 'İmzalama',
          result: `"Kurye imza atamaz Hayri Abi, sözleşmede var." Dosyayı kapadı, tükenmezi hırkasının cebine soktu. "Sözleşme sözleşmedir, bilirim. Volkan'ın da vardı." Asansör bu kez çağrılmadı; üç katı merdivenden çıktın, Ayla Hanım kapıda dosyayı sordu: "İmzaladın mı?"`,
          effects: { rel: { hayri: -1 }, energy: -5 } },
        { label: 'Dosyayı yukarı çıkar',
          outcomes: [
            { chance: 0.6,
              result: `Dosyayı Ayla Hanım'a uzattın; imzaladı, sonra merdiven boşluğuna seslendi: "Sedat Bey, inin, imza var." Dört imza daha. Aşağıda Hayri Abi sayfaları saymadı, okşadı. "Oğlum sen bizden oldun." Ayla Hanım kapıda avucuna bir yirmilik sıkıştırdı: "Yürüdüğün için."`,
              effects: { sets: { petition: true }, rel: { hayri: 3 }, tip: 20 } },
            { chance: 0.4,
              result: `Dosyayı Ayla Hanım'a uzattın. "Ben yönetim kurulundayım evladım, bu dosya bana gelmez." Dosya aşağıya senin elinde indi, imzan birinci sayfada kaldı. Akşam uygulamada "yönetim bildirimi" düştü. Hayri Abi: "Olur öyle. Ayla Hanım iyi insandır, o ayrı."`,
              effects: { sets: { petition: true }, rel: { hayri: 1 }, rating: -0.2 } }
          ] }
      ]
    };
  }
});

/* ---- 4. VOLKAN (Gün 7) — oğlu Berlin'den gelir; arkana alırsan volkan (enerji −10 bugün, bahşiş ×1,2 yarın) ---- */
ARC_BEATS.push({
  arc: 'hayri', step: 4, dueGap: 3, mode: 'ticket',
  address: HAYRI_ADDR('Nermin K.', 2, 4),
  hook: "Volkan Berlin'den geliyor; Hayri Abi seni oğlanla tanıştıracak.",
  hookShort: 'Volkan geliyor',
  build: (o, S, A) => {
    const g = hayriGoal(S);
    const vol = A.flags.knowsGoal && g ? `"Babam ${g} diyor, doğru mu?"` : `"Babam seni yazmış mektupta. Üç satır, benden fazla."`;
    const dosya = A.flags.petition ? `"Dosya yönetimde oğlum, Ayla Hanım götürdü. Ses yok."` : `"Yönetimden ses yok. Ben de sormadım, o ayrı."`;
    return {
      title: 'VOLKAN',
      text: `Kapıcı dairesinin önünde iki tabure. Birinde Hayri Abi, ötekinde otuzlarında, kulağında kulaklık, sırtında sarı yağmurluk biri. "Volkan. Berlin." Eli soğuk, kaskı yok. ${vol} Hayri Abi çayı üçe böldü. ${dosya} Volkan bardağı bıraktı: "Bu akşam bir tur arkana alır mısın abi? Burayı görmek istiyorum."`,
      choices: [
        { label: "Volkan'ı arkana al",
          result: `Volkan arkada, dizleri çantaya dayalı. Kuşdili Caddesi'nde durdurdu: "Abi, çantayı sırta değil bele yakın tak, kapıda on saniye kazanırsın." Yoruldun; kazandın da. Yarın kapılarda bu on saniye bahşişe dönecek, Volkan öyle diyor. Dönüşte Hayri Abi kapıdaydı: "İkiniz birden geldiniz, o ayrı."`,
          effects: { energy: -10, sets: { volkan: true }, fact: 'volkan_ride', rel: { hayri: 2 } } },
        { label: "Otur, Berlin'i sor",
          result: `Oturdun. Berlin'de yağmur parası, Kreuzberg'de bisiklet hırsızı, ayda bir kuryeler toplantısı. "Gidiyor musun?" "Gidiyorum abi, çay bedava." Hayri Abi güldü, ilk kez. Nermin Hanım'ın mercimek çorbası ikinci katta ılıdı; "ılık da olur" diye paketi aldı.`,
          effects: { rel: { hayri: 1 }, energy: 5, rating: -0.1 } },
        { label: 'Siparişe koş, geç',
          result: `"Sipariş bekliyor." Volkan başını salladı, kulaklığı taktı. Hayri Abi bardağı tabağa koydu: "Oğlan üç gün burada. Sen her gün buradasın, o ayrı." Nermin Hanım'ın kapısına çıkarken merdiven boşluğundan Volkan'ın telefonu geldi: Rammstein, kısık.`,
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
    const hayri = A.flags.petition ? `elini kaldırdı, ses etmedi.` : `seni gördü, çayına döndü.`;
    const ok = {
      result: `Kilit tık etti, yeşil ışık. Üçüncü kata asansörle çıktın; panel asansöre karışmıyor. Dönüşte karşıya geçtin. Hayri Abi tabureyi ayağıyla itti: "Otur. Kodu bildin, iyi. Kapı beni de bilirdi, o ayrı." Çayı o ödedi, ocakçıya "yazma" diye işaret etti.`,
      effects: { rating: 0.1, rel: { hayri: 1 }, energy: 5, sets: { kapitaldoor: true }, fact: 'kapitaldoor' }
    };
    const bad = {
      result: `Kırmızı ışık, iki bip. "Hatalı giriş. Yönetime bildirildi." Karşıdan terlik sesi: Hayri Abi, anahtarlığında hâlâ bina anahtarı. Kapıyı eski usul açtı. "Kod kodtur oğlum, anahtar ayrı." Ayla Hanım yukarıda bekledi, uygulama aşağıda yazdı: "Teslimat süresi aşılıyor."`,
      effects: { rating: -0.2, rel: { hayri: 1 }, sets: { kapitaldoor: true }, fact: 'kapitaldoor' }
    };
    return {
      title: 'AKILLI KAPI',
      text: `Yıldız Apartmanı'nın kapısında siyah bir panel: KapitalDoor, mavi ışık, bir kamera gözü. Kapıcı dairesinin penceresinde perde yok, masa yok. Hayri Abi karşı kaldırımda, Yakamoz Çay Ocağı'nın taburesinde, hırkasız; ${hayri} Panel konuştu: "Hoş geldiniz. Teslimat yapılacak daire numarasını girin." Fişi en son restoranda görmüştün.`,
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
  hook: "Hayri Abi haber yolladı: yarın Yıldız'a uğra, konuşacağız.",
  hookShort: "Hayri'nin son sözü",
  build: (o, S, A) => {
    const f = A.flags;

    /* Soğuk kapanış: puan < 3,5 — hediye yok, bağ kopar */
    if (S.rating < 3.5) return {
      title: 'ONLARDAN',
      text: `Karşı kaldırım, Yakamoz Çay Ocağı. Hayri Abi'nin yanında bir Migros poşeti, içinde hırka ve okuma gözlüğü. "Oğlum, sen de onlardan oldun. Panel puanını gösteriyor, Ayla Hanım soğuk çorbayı gösterdi. Ben Kastamonu'ya, kızın yanına." Bardağı ocakçıya uzattı, geri aldı, tabağa koydu. "Hemşerim olsan da o ayrı."`,
      choices: [
        { label: 'Özür dile',
          result: `"Özür bana değil oğlum, üçüncü kata." Ocakçıya iki çay parası bıraktı; birini sen içmedin. Poşeti aldı, karşıya geçmedi; durakta 37 plakalı bir Doblo bekliyordu, damadı direksiyonda. Arkanda panel: "Teslimat yapılacak daire numarasını girin."`,
          effects: { rel: { hayri: 1 }, sets: { cold: true }, fact: 'hayri_cold' } },
        { label: 'Ses etme, kapıya yürü',
          result: `Karşıya geçtin, panele daireyi girdin, yeşil yandı. Dönüşte tabure boştu, bardak tabağın üstünde ters duruyordu. Ocakçı: "Hayri Abi'yi mi arıyorsun? Gitti. Çayın parasını sana yazdırdı."`,
          effects: { rel: { hayri: -1 }, sets: { cold: true }, fact: 'hayri_cold', money: -15 } }
      ]
    };

    /* Kalır: dosya + Volkan + puan ≥ 4,0 — «Bina Güvenlik Danışmanı», anahtar */
    if (f.petition && f.volkan && S.rating >= 4.0) return {
      title: 'DANIŞMAN',
      text: `Hayri Abi kapıda, panelin yanında; yakasında lamine bir kart: BİNA GÜVENLİK DANIŞMANI. Hırka aynı, bardak aynı. "Yönetim toplandı. Dosya, Volkan'ın yönetime yazdığı iki sayfa, Ayla Hanım'ın sesi. Kapıcı gitti, danışman geldi; maaş, o ayrı." Cebinden pirinç bir anahtar çıkardı. "Asansör anahtarı. Bende iki tane var, biri sende dursun. Dörtten yukarısı için; üçe kadar yürürsün."`,
      choices: [
        { label: 'Anahtarı al',
          result: `Aldın; soğuk, ağır, dişleri aşınmış. "Kaybedersen söyle, kızmam." Üçüncü kata yürüdün; dördüncüden yukarısı artık senin değil, anahtarın işi. Ayla Hanım kapıda: "Hayri kaldı mı?" "Kaldı." "İyi." Kapı kapanmadan içeriden Kızılcık Şerbeti'nin jeneriği geldi.`,
          effects: { keepsake: 'hayri_key', rel: { hayri: 2 }, rating: 0.1, sets: { stayed: true }, fact: 'hayri_stayed' } },
        { label: 'Çayı iç, sonra al',
          result: `Oturdun. Çay ince belli bardakta, şeker iki, panel mavi mavi yandı. Hayri Abi Volkan'ı anlattı, Sivas'ı anlatmadı. Anahtar tabağın kenarında bekledi, sonra avucuna geçti. Ayla Hanım'ın çorbası üçüncü katta ılıdı: "Hayri'yle oturduysan ılık da olur."`,
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
      text: `Yıldız Apartmanı'nın önünde 37 plakalı bir Doblo, bagajında koli bantlı kutular: MUTFAK, YORGAN, VOLKAN. Hayri Abi kaldırımda, hırkası kolunda. "Kastamonu, kızın yanı. Damat sabah yola çıkmış." ${why} Gazete kağıdına sarılı bir şey uzattı: ince belli bardak, çatlaksız. "Otuz bir yıl bundan içtim, kırılmadı. Sende kırılırsa kırılsın."`,
      choices: [
        { label: 'Bardağı al',
          result: `Aldın, çantanın ön cebine, kaskın yanına. "Çay koyarken ağzına kadar doldur, kapıcı usulü." Doblo'nun kapısı kapandı, Moda Caddesi'nde sağa döndü, sinyal vermedi. Arkanda panel mavi mavi yandı: "Hoş geldiniz."`,
          effects: { keepsake: 'hayri_glass', rel: { hayri: 1 }, sets: { left: true }, fact: 'hayri_left' } },
        { label: 'Kutuları taşı, uğurla',
          result: `YORGAN kutusunu bagaja sen yerleştirdin; VOLKAN yazılı olanı Hayri Abi dizine aldı: "Bu benimle gelir." Damat teşekkür etti, Hayri Abi etmedi; başını sıvazladı, bir kere. Bardak çantada. Ayla Hanım'ın çorbası üçüncü katta ılıdı, Ayla Hanım kapıda: "Gitti mi?"`,
          effects: { keepsake: 'hayri_glass', rel: { hayri: 2 }, energy: -5, rating: -0.1, sets: { left: true }, fact: 'hayri_left' } }
      ]
    };
  }
});
