/* ---------------- NURİ BEY — «ZAM SOHBETİ» ----------------
   Zümrüt Apt., Talatpaşa Cad. No 27, Gültepe, Kağıthane: kuryenin kendi binası. Kurye ikinci katta (D.4, arka cephe);
   Nuri Bey (64, Sümerbank Bakırköy'den emekli) ile Sevim Hanım en üst katta (D.10). Asansör yok, beş kat merdiven,
   sahanlık ışığının otomatı bozuk. Oğlu Kıvanç (36, Maslak, "growth lead") daireyi günlük kiralığa vermek ister.
   6 beat: 1 'ticket' (platform seni kendi ev sahibine eşler), 2–6 'knock' (gün sonu kapı kartı).
   Takvim: step 1 startDay 2 (Nebahat ile aynı gün; scheduleArcs dosya sırasıyla çözer, Nuri kayar), sonraki adımlar dueGap 3.
           Sabit gün numarası yok; lead ayrı bir slot isterse startDay'i değiştirmesi yeter.
   Bayraklar (A.flags): known, hidden, dropped, zam (10|15|25), tabak, airbnb, stay, taught, untaught, ferhat, raced, helped, fixed, vest.
   Fact (motor okur): 'nuri_word' (final: kira donduruldu; keepsake, 52-helpers günlük gider −40).
   Facts (yalnız yazılır; metin motor davranışı VAAT ETMEZ):
     'nuri_lesson'  — İSTEK (motor, sözleşmede yok): B4 gece yarısına kadar uygulama dersi; isterse ertesi sabah ilk turu düşürür.
     'nuri_rival'   — İSTEK (motor, sözleşmede yok): B5; isterse ertesi günden itibaren turda bir fiş gri «Nuri Bey aldı».
     'nuri_moved'   — İSTEK (motor, sözleşmede yok): final taşınma; isterse Kağıthane fişleri ücret +%10, başlangıç ilçesi Kağıthane.
     'nuri_courier' — İSTEK (motor, sözleşmede yok): final yelek; isterse epilog satırı «Ev sahibi kurye oldu. Kira aynı kaldı.»
                      («Sigorta ikisinde de yok.» önerilmez: tez cümlesi.)
   Final: rel('nuri') ≥ 3 → keepsake 'nuri_word' (günlük gider −40), Kıvanç'ın planı biter;
          rel ≤ 1 && airbnb → taşınma (expenseDaily +60);
          aksi → kurye yolu (yelek) ya da bodrum (bisiklet), hediye yok.
   Zam etkisi: expenseDaily +30 (%25) / +18 (%15) / +12 (%10); defterde «Kira payı» satırı olarak görünür.
   Knock kartları endDay sonrası açılır, startDay enerjiyi sıfırlar → knock beat'lerinde energy etkisi YOK (yalnız B1 ticket).
   Anlatıcı: ikinci tekil, geniş zaman (ağız kağıdı). Tırnak içindeki konuşma serbest.
   Şema: docs/CONTENT_CONTRACT.md */
(function () {
  const ADDR = { district: 'Kağıthane', hood: 'Gültepe', street: 'Talatpaşa Cad.', no: 27, building: 'Zümrüt Apt.', floor: 5, apt: 10, customer: 'Nuri Ö.' };
  const food = (o) => ((o && o.lines && o.lines[0] && o.lines[0].name) ? o.lines[0].name : 'yemek').replace(/\s*\(.*?\)/, '').toLocaleLowerCase('tr-TR');
  const restName = (o) => (o && o.rest) ? o.rest : 'restoran';

  /* ---- 1. KİRACI (ticket) — platform seni kendi ev sahibine eşler; pijama, bahşiş sıfır → known ---- */
  ARC_BEATS.push({
    arc: 'nuri', step: 1, startDay: 2, dueGap: 3, mode: 'ticket', address: ADDR,
    hook: "Fişte kendi adresin: Talatpaşa Cad. 27, en üst kat. Siparişi veren ev sahibin Nuri Bey.",
    hookShort: "Nuri Bey'in siparişi",
    build: (o, S, A) => ({
      title: 'KİRACI',
      text: `Fişteki adres senin adresin: Talatpaşa Caddesi 27, Zümrüt Apartmanı, en üst kat. Beş kat merdiven, kendi posta kutunun önünden geçersin, kutu dolu. Onuncu dairenin kapısını lacivert çizgili pijamayla Nuri Bey açar; elinde lastikle bağlı aidat makbuzları. Çantadaki ${restName(o)} poşetine bakar, sonra kaskın altına. "Beyefendi, doğalgaz bu ay iki bin iki yüz geldi; siz bizim ikinci kattaki kiracı değil misiniz, kaskı bir çıkarır mısınız?"`,
      choices: [
        { label: 'Kiracı olduğunu söyle',
          result: `Kaskı çıkarırsın. "İkinci kat, dört numara." Poşeti alır, ${food(o)} paketini çıkarır, boş poşeti sana geri uzatır: "Beyefendi, çöp bu hafta iki poşet oldu, bunu inerken atar mısınız." Uygulamanın bahşiş ekranında bir an durur, parmağı sıfırda kalır. "Bahşiş kirada sayılır, kusura bakmayın." Kapı kapanırken içeriden Sevim Hanım: "Kimdi?" "Bizim kiracı. Kurye olmuş."`,
          effects: { sets: { known: true }, rel: { nuri: 1 } } },
        { label: 'Paketi uzat, konuşma',
          result: `Poşeti alır, kaskın altına bir daha bakar, makbuzları öbür eline geçirir. "Beyefendi, bahşiş kısmına sıfır yazdım, uygulama sordu, elim öyle gitti; kusura bakmayın." Merdivende ikinci kata inerken yukarıda kapı yeniden açılır: "Dört numara! Posta kutunuz taşmış, kapıcı yok, bir boşaltır mısınız?" Boşaltırsın: üç fatura, bir KapitalEats broşürü.`,
          effects: { sets: { known: true, hidden: true }, energy: -5 } },
        { label: 'Paspasa bırak, in',
          result: `Poşeti paspasa koyarsın, fotoğrafını çekersin, "teslim edildi". Üçüncü basamakta yukarıdan ses: "Beyefendi, poşet yerde, kutu devrilir, bir kaldırır mısınız?" Kaldırmazsın. Akşam kapının altında kareli bir kağıt, dolma kalem, düzgün el yazısı: "Kiracımız kurye olmuş. Yemek paspasa döküldü. Paspas bizim. N. Öztürk." Uygulamada yeni bir yorum: bir yıldız.`,
          effects: { sets: { known: true, dropped: true }, rel: { nuri: -1 }, rating: -0.3 } }
      ]
    })
  });

  /* ---- 2. ZAM (knock) — yüzde yirmi beş; kabul (rel +1, dolma tabağı) / pazarlık (%50: 15) / «ben de zam alamadım» (%30: 10) ---- */
  ARC_BEATS.push({
    arc: 'nuri', step: 2, dueGap: 3, mode: 'knock',
    hook: "Nuri Bey akşam kapıyı çalacak: elinde hesap makinesi, dilinde aidat.",
    hookShort: 'Zam sohbeti',
    build: (o, S, A) => {
      const f = A.flags;
      const intro = f.dropped
        ? `Saat dokuz, kapı. Nuri Bey hırkayı pijamanın üstüne geçirmiş, elinde hesap makinesi ve iki çay; bardakları paspasın yanına, yere koyar. Paspasına bakar, senin paspasına.`
        : f.hidden
          ? `Saat dokuz, kapı. Nuri Bey hırkayı pijamanın üstüne geçirmiş, elinde hesap makinesi ve iki çay. "Beyefendi, asansör olsa aidat beş bin olurdu, merdivende de herkes görülür; çayı alır mısınız."`
          : `Saat dokuz, kapı. Nuri Bey hırkayı pijamanın üstüne geçirmiş, elinde hesap makinesi ve iki çay, ince belli bardakta.`;
      return {
        title: 'ZAM',
        text: `${intro} Sahanlık ışığı kendiliğinden söner; ayağıyla düğmeye basar. Hesap makinesini sana döndürür, ekranda 1,25. "Beyefendi, aidat üç bin oldu, doğalgaz ayrı, emekli maaşı malum, enflasyon beyefendi, enflasyon. Yüzde yirmi beş diyorum ama siz söyleyin."`,
        choices: [
          { label: 'Kabul et',
            result: `"Yüzde yirmi beş." Hesap makinesinin kapağını kapatır, hırkanın cebine koyar. "Beyefendi, dolma yaprağı bu yıl kilo dört yüz, Sevim Hanım yine de sarar; tabağı kapıya bırakırız, boş tabağı yukarı getirir misiniz." Çayını içer, senin bardağı da alır, sahanlıkta ışık yine söner. Gün sonu defterine yeni bir satır: Kira payı.`,
            effects: { expenseDaily: 30, sets: { zam: 25, tabak: true }, rel: { nuri: 1 } } },
          { label: 'Pazarlık et',
            outcomes: [
              { chance: 0.5,
                result: `"Yüzde on beş desek Nuri Bey; asansör yok, beş kat." Hesap makinesini dizine koyar. "Beyefendi, asansörsüzlük bana da masraf, merdiven halısı iki senede bitiyor, on beş olsun; ama Sevim Hanım'a yirmi dedim deyin, bu ricam." Çayını bitirmeden kalkar, kapıda döner: "Halıya ortasından basmayın, kenarından yürüyün."`,
                effects: { expenseDaily: 18, sets: { zam: 15 } } },
              { chance: 0.5,
                result: `"Yüzde on beş desek Nuri Bey?" Tuşlar, tuşlar, kapağı kapatır. "Beyefendi, doğalgaz bana on beşle gelmiyor, yirmi beş; Kıvanç'ın bir arkadaşı bu daireye daha fazlasını verirmiş, bunu söylemek istemezdim, söylemedim sayın, siz de bir daha düşünür müsünüz." Çayın sende kalır, bardak soğuk; kapı ağır kapanır.`,
                effects: { expenseDaily: 30, sets: { zam: 25 }, rel: { nuri: -1 } } }
            ] },
          { label: 'Ben de zam alamadım de',
            outcomes: [
              { chance: 0.3,
                result: `"Ben de zam alamadım Nuri Bey. Uygulama bu yıl yüzde sıfır verdi." Hesap makinesine bakar, sonra güler; pijamanın yakası titrer. "Beyefendi, Sümerbank seksen dokuzda bana da yüzde sıfır vermişti, aynı cümleyi müdüre ben söylemiştim; on olsun, Sevim Hanım'a söylemeyin." Çayı bitirir, bardağı bırakır: "Bardağı yarın kapıya koyun."`,
                effects: { expenseDaily: 12, sets: { zam: 10 }, rel: { nuri: 1 } } },
              { chance: 0.7,
                result: `"Ben de zam alamadım Nuri Bey." Hesap makinesini kapatır, dizine koyar, bir süre öyle durur. "Beyefendi, benim maaş da yüzde sıfır gibi geldi, uygulamanız size sormamış, ben size sordum; yirmi beş kalsın, ama bunu hesapla değil utanarak söyledim, bunu da bilin lütfen." Çaylar soğur, ikisini de o götürür. Merdivenden: "Posta kutunuz yine dolu, bir boşaltır mısınız."`,
                effects: { expenseDaily: 30, sets: { zam: 25 } } }
            ] }
        ]
      };
    }
  });

  /* ---- 3. GÜNLÜK KİRALIK (knock) — Kıvanç daireyi KapitalStay'e vermek ister; fikrin → airbnb | stay ---- */
  ARC_BEATS.push({
    arc: 'nuri', step: 3, dueGap: 3, mode: 'knock',
    hook: "Kıvanç geliyor: Nuri Bey'in oğlu, elinde telefon, ekranda senin salonun.",
    hookShort: "Kıvanç'ın hesabı",
    build: (o, S, A) => {
      const z = A.flags.zam === 10 ? `"Beyefendi, yüzde on yetmedi, Kıvanç haklı çıktı; `
        : A.flags.zam === 15 ? `"Beyefendi, yüzde on beş aidatı bile tutmadı; `
        : `"Beyefendi, yüzde yirmi beş kombi servisine gitti, dört bin; `;
      return {
        title: 'GÜNLÜK KİRALIK',
        text: `Kapıda iki kişi. Nuri Bey hırkayla; yanında Kıvanç, otuz altı, Maslak'ta dijital pazarlama, telefonun ekranında senin salonun; fotoğraflar üç yıl önceki ilandan, perdeler eski. "Baba, günlük kiralık; gecelik üç bin beş yüz, Çağlayan Adliyesi'ne altı dakika, ayda on beş gece dolar, hesabı yaptım." Nuri Bey telefona değil sana bakar. ${z}Kıvanç bu daireyi KapitalStay'e vermek istiyor, siz ne dersiniz?"`,
        choices: [
          { label: "Kıvanç'a hak ver",
            result: `"Hesap doğru Nuri Bey." Kıvanç telefonu babasına çevirir: "Bak, kiracı da diyor." Nuri Bey telefona bakmaz, hırkanın düğmesine bakar. "Beyefendi, boya badana da bana kalır o zaman; siz üç ay içinde bir yer bakar mısınız, acelesi yok, Kıvanç'ın var." Kıvanç kartvizit uzatır: KIVANÇ ÖZTÜRK, GROWTH LEAD. Kart çantanın ön cebine girer.`,
            effects: { sets: { airbnb: true }, rel: { nuri: -1 } } },
          { label: 'Kalmayı savun',
            result: `"Günlük kiracı halıya ortasından basar Nuri Bey, çöpü ayırmaz, dolmanın tabağı geri gelmez." Kıvanç güler: "Kiracı konuşuyor baba." Nuri Bey gülmez. "Beyefendi, halı iki senede bitiyor, doğru; Kıvanç, sen de şu telefonu bir indirir misin." Kıvanç indirir. Merdivende aşağıya doğru sesi: "Baba, pasif gelir bu, duygusal bakmayalım."`,
            effects: { sets: { stay: true }, rel: { nuri: 1 } } },
          { label: "Kıvanç'a komisyonu sor",
            outcomes: [
              { chance: 0.5,
                result: `"Uygulama kaç alıyor Kıvanç?" "Yüzde on sekiz; temizlik ayrı, çarşaf ayrı, fotoğrafçı bir kere." Nuri Bey'in hesap makinesi hırkanın cebinden çıkar, tuşlanır, durur. "Beyefendi, yüzde on sekiz benim iki aylık maaşım; Kıvanç, bu hesabı evde bir daha yaparız, sen şimdi babanı aşağıya kahveye götürür müsün." Götürür; telefon cebinde kalır.`,
                effects: { sets: { stay: true }, rel: { nuri: 1 } } },
              { chance: 0.5,
                result: `"Uygulama kaç alıyor Kıvanç?" "Yüzde on sekiz ama doluluk yetmiş; adliyeye gelen avukatlar var, plaza stajyerleri var." Hesap makinesi çıkar, tuşlanır, kapağı kapanmaz. "Beyefendi, yetmiş doluluk benim üç maaşım; fotoğrafçı salı geliyor, perdeyi bir açar mısınız." Kıvanç inerken cebinden bir yüzlük çıkarır: "Danışmanlık." Alırsın.`,
                effects: { sets: { airbnb: true }, money: 100 } }
            ] }
        ]
      };
    }
  });

  /* ---- 4. TURKUAZ YELEK (knock) — Nuri Bey kurye kaydoldu; öğret (nuri +2, tost parası −90) / «yapamazsınız» / Ferhat'ın numarası ---- */
  ARC_BEATS.push({
    arc: 'nuri', step: 4, dueGap: 3, mode: 'knock',
    hook: "Nuri Bey turkuaz bir yelek almış, etiketi yakasında. Akşam bir şey soracak.",
    hookShort: "Nuri Bey'in yeleği",
    build: (o, S, A) => {
      const f = A.flags;
      const plan = f.stay ? `Kıvanç'ın ilanı yok; bisiklet var.` : f.airbnb ? `Kıvanç'ın ilanı beklemede; önce bu.` : ``;
      return {
        title: 'TURKUAZ YELEK',
        text: `Nuri Bey kapıda; pijama yerine kot pantolon, üstünde yepyeni turkuaz bir KapitalEats yeleği, etiketi hâlâ yakasında. Giriş sahanlığına, posta kutularının yanına zincirlenmiş ikinci el bir elektrikli bisiklet, Sahibinden'den, dört bin iki yüz; pilini koltuk altında beş kat yukarı taşımış. ${plan} "Beyefendi, aidat bu ay üç bin beş yüz oldu, maaş yerinde saydı, ben de kaydoldum; uygulama kimlik fotoğrafı istiyor, çekemiyorum, bir bakar mısınız?"`,
        choices: [
          { label: 'Uygulamayı öğret',
            result: `Mutfak masası, iki çay, telefon ortada. Kimlik fotoğrafı, teslimat fotoğrafı, "Siparişi al", "Teslim et", "Müşteri açmıyor" düğmesi. Nuri Bey her ekranı sesli okur, İş Ortağı Sözleşmesi'nde durur: "Beyefendi, sözleşme on dört sayfa, sigorta nerede yazıyor, bir gösterir misiniz?" Gösterecek yer yok. Gece yarısı ilk siparişi kabul etmeyi öğrenir; köşedeki tostçudan iki tost, senin hesaptan. Sabah seninle aynı saatte çıkar.`,
            effects: { rel: { nuri: 2 }, money: -90, sets: { taught: true }, fact: 'nuri_lesson' } },
          { label: 'Siz yapamazsınız de',
            result: `"Siz yapamazsınız Nuri Bey. Beş kat merdiven, yağmur, gece tarifesi, dört yıldızın altı." Yeleğin etiketini koparır, cebine koyar. "Beyefendi, aidatı siz mi ödeyeceksiniz; ödemeyecekseniz ben yaparım, bir de rica ediyorum, bana yapamazsınız demeyin, Kıvanç söyledi, yetti." Pili koltuğunun altına alır, kendi indirir, beş kat; her sahanlıkta ışık söner.`,
            effects: { rel: { nuri: -1 }, sets: { untaught: true } } },
          { label: "Ferhat'ın numarasını ver",
            result: `"Ferhat diye biri var Nuri Bey; hızlı, sabrı az ama öğretir." Numarayı kareli kağıda yazarsın, Nuri Bey dolma kalemle altına kendi adını ekler. Yarım saat sonra aşağıdan, giriş sahanlığından ses: "Reis, önce fren, gaz sonra; iki dakikada öğrenirsin." Ferhat pili eliyle yoklar, kaşını kaldırır, bir şey söylemez. Yukarıdan: "Beyefendi, çay parası benden, iki bardak indirir misiniz?"`,
            effects: { rel: { nuri: 1, ferhat: 1 }, sets: { ferhat: true } } }
        ]
      };
    }
  });

  /* ---- 5. İLK GÜN (knock) — öğrendiyse rakip (fact nuri_rival yazılır; metin motor vaadi vermez); öğrenmediyse düştü, bıraktı ---- */
  ARC_BEATS.push({
    arc: 'nuri', step: 5, dueGap: 3, mode: 'knock',
    hook: "Nuri Bey'in ilk kurye günü. Akşam kapıda anlatacak.",
    hookShort: "Nuri Bey'in ilk günü",
    build: (o, S, A) => {
      const f = A.flags;

      /* Öğrenmedi: Sadabat Caddesi, minibüs, alçı. Sevim Hanım çağırır, yukarı çıkarsın */
      if (!f.taught && !f.ferhat) return {
        title: 'ALÇI',
        text: `Kapıyı çalan Sevim Hanım: "Yukarı bir çıkar mısınız." Beşinci kat, salon: Nuri Bey koltukta, sol bilek alçıda, yelek askıda; girişte yanından geçtiğin bisikletin ön tekeri sekiz olmuş. "Beyefendi, Sadabat Caddesi'nde minibüs sağa döndü, ben de döndüm; alçı bin iki yüz, tamir dört yüz, uygulama 'teslimat tamamlanmadı' yazdı; siz haklıydınız, bir daha söylemeyin lütfen." Telefonunda bildirim: "Kabul oranınızı yükseltme fırsatı sizi bekliyor! 💪 Yeni siparişler yolda."`,
        choices: [
          { label: 'Tamir parasını ver',
            result: `Dört yüz lirayı sehpaya, aidat makbuzlarının yanına koyarsın. Nuri Bey elini uzatmaz; Sevim Hanım alır, mutfağa götürür. "Beyefendi, bu parayı defterime yazarım, makbuzunu veririm; siz şimdi şu bisikleti bodruma bir indirir misiniz, girişte görmek istemiyorum." İndirirsin. Ön teker her basamakta korkuluğa vurur, her vuruşta bir sekiz.`,
            effects: { money: -400, rel: { nuri: 2 }, sets: { helped: true } } },
          { label: 'Geçmiş olsun de, in',
            result: `"Geçmiş olsun Nuri Bey." Sevim Hanım çay getirir; Nuri Bey alçılı eliyle kumandayı arar, bulamaz, sağlam eliyle de aramaz. "Beyefendi, yelek kırk lira bile etmez şimdi, isteyene verin; inerken ışığı söndürür müsünüz, otomat bozuk, bu ay da bize yazıyor." Yelek sende kalır, etiketi onun cebinde; ışığı söndürürsün.`,
            effects: { sets: { vest: true } } },
          { label: "Tekeri söküp Cemil'e götür",
            result: `Ön tekeri sökersin, kaskın yanına asarsın, sabah ilk iş Usta Cemil. Cemil tekere konuşur, sana değil: "Sekiz olmuşsun. Kim bindi sana, emekli mi? Olur." İki yüz elli. Akşam tekeri girişte bisikletin yanına dayarsın; yukarıdan Nuri Bey: "Beyefendi, tamiri defterime yazarım, makbuzu saklayın; bisiklete bir daha binmem, binmek isterseniz anahtar Sevim Hanım'da."`,
            effects: { money: -250, rel: { nuri: 2 }, sets: { fixed: true } } }
        ]
      };

      /* Öğrendi: ilk günü bitirdi, gün özetiyle kapıda; yarından itibaren aynı sokaklarda */
      const how = f.taught ? `Çantayı senin gösterdiğin gibi bağlamış, kayış dizine kadar.` : `Çantayı Ferhat'ın söylediği gibi bele yakın takmış.`;
      return {
        title: 'RAKİP',
        text: `Saat dokuz, kapı. Nuri Bey yelekle, kot pantolonun dizi tozlu, elinde telefon, ekranda gün özeti. ${how} "Beyefendi, pil bugün iki kere bitti, Çağlayan'da altı kat merdiven, bahşiş iki yüz on lira, puan beş; yarın Gültepe tarafını bana bırakır mısınız, Seyrantepe yokuşunu çıkamıyorum." Telefonda bir bildirim belirir: "Yeni İş Ortağımız Nuri Ö. ilk gününü tamamladı 🎉 Hoş geldiniz!"`,
        choices: [
          { label: "Gültepe'yi bırak",
            result: `"Gültepe sizin Nuri Bey. Ben Çağlayan'a, Cendere'ye." Elini uzatır, Sümerbank usulü, iki kere sıkar. "Beyefendi, bizim uzatma kablosu üç metre, giriş sahanlığına yetmiyor; şarjı sizin prizden alabilir miyim." Sabah kapında Sevim Hanım'ın dolması, tabağın üstünde folyo, folyonun üstünde kareli not: GÜLTEPE BİZDE. BOŞ TABAK YUKARI.`,
            effects: { fact: 'nuri_rival', rel: { nuri: 2 }, sets: { tabak: true } } },
          { label: 'Yarışırız de',
            result: `"Yarışırız Nuri Bey, uygulama öyle istiyor." Yelekli omuzlarını kaldırır, indirir. "Beyefendi, pil sizinkinden kısa, bacak da kısa; ama ben sabah altıda çıkarım, o zaman kusura bakmayın, merdivende selamı da kesmeyin lütfen." Sabah altıda merdivende ayak sesi, pil koltuk altında; ışığı yanık bırakmış, Çağlayan'a gitmiş, Gültepe'ye değil.`,
            effects: { fact: 'nuri_rival', rel: { nuri: -1 }, sets: { raced: true } } },
          { label: 'Sahanlığa priz çek',
            result: `Uzatma kablosunu kendi dairenden giriş sahanlığına çekersin; bisiklet gece boyu senin sayacından içer. "Beyefendi, elektriği defterime yazarım, hesabını ben tutarım; siz de şu kabloya takılmayın lütfen, Sevim Hanım takıldı." Sabah pil yüzde yüz, bisiklet yok, kablo sahanlıkta sarılı; senin sayaç kırk lira ileride.`,
            effects: { fact: 'nuri_rival', rel: { nuri: 2 }, money: -40 } }
        ]
      };
    }
  });

  /* ---- 6. FİNAL (knock) — rel ≥ 3: söz (kira donar, keepsake); rel ≤ 1 && airbnb: taşınma (+60/gün); aksi: yelek ya da bodrum ---- */
  ARC_BEATS.push({
    arc: 'nuri', step: 6, dueGap: 0, mode: 'knock', final: true,
    hook: "Nuri Bey son sözünü söyleyecek: kira, Kıvanç, kareli kağıt. Akşam kapıda.",
    hookShort: "Nuri Bey'in sözü",
    build: (o, S, A) => {
      const f = A.flags;
      const r = rel('nuri');
      const courier = !!(f.taught || f.ferhat);
      const duz = !!(f.fixed || f.helped);

      /* SÖZ: kira donar, Kıvanç'ın planı biter, keepsake nuri_word */
      if (r >= 3) {
        const extra = courier ? `Yelek askıda, etiketi kopmuş; yarın sabah yine giyer.` : duz ? `Bisiklet bodrumda, tekeri düz.` : ``;
        const tabak = f.tabak ? ` Sevim Hanım'ın tabağı size gidip geri geldi;` : ``;
        const oglan = f.airbnb ? ` siz de hak vermiştiniz oğlana, ben vermiyorum artık;` : ``;
        return {
          title: 'SÖZ',
          text: `Nuri Bey kapıda; hırka, pijama, hesap makinesi yok. ${extra} Elinde kareli kağıt, dolma kalemle yazılmış, altında imza. "Beyefendi, Kıvanç'ın hesabını ben de yaptım, bana pahalı geldi;${tabak}${oglan} bu kağıtta kira bu yıl bu kadar, zam yok, günlük kiralık yok, söz; bir okuyup bana geri verir misiniz, fotokopisi yok."`,
          choices: [
            { label: 'Oku, geri ver',
              result: `Okursun: "Zümrüt Apt. D.4 kiracısına kira bir yıl sabittir. Zam yok. N. Öztürk." Geri verirsin; dörde katlar, hırkanın iç cebine koyar, üstünden eliyle bastırır. "Beyefendi, kağıt bende, söz sizde; Kıvanç sorarsa kiracı istemedi dersiniz, bana da bir çay koyar mısınız, bugün ben getirmedim." Çayı sen koyarsın, ince belli bardakta, ağzına kadar. Hatıra defterine bir satır: Nuri'nin Sözü.`,
              effects: { keepsake: 'nuri_word', fact: 'nuri_word', rel: { nuri: 1 } } },
            { label: 'Fotoğrafını çek, geri ver',
              result: `Telefonu çıkarırsın, kağıdı çekersin, flaş sahanlıkta patlar. Nuri Bey bekler, kağıdı alır, katlamadan cebine koyar. "Beyefendi, fotoğrafa alındım, ama alınmak bedava, enflasyon buna işlemiyor; kağıt bende, fotoğraf sizde, ikisini de kaybetmeyin lütfen." Merdiveni çıkarken ışık söner, düğmeye basmaz, karanlıkta çıkar. Hatıra defterine bir satır: Nuri'nin Sözü.`,
              effects: { keepsake: 'nuri_word', fact: 'nuri_word', rel: { nuri: -1 } } }
          ]
        };
      }

      /* TAŞINMA: Kıvanç ilanı yayına aldı; Seyrantepe'de stüdyo, günlük gider +60 */
      if (r <= 1 && f.airbnb) return {
        title: 'TAŞINMA',
        text: `Kapıda Kıvanç; Nuri Bey bir basamak arkada, hırkanın düğmeleri kaymış. Kıvanç'ın elinde tablet, ekranda senin salonun, altında "Çağlayan Adliyesi'ne 6 dk": fotoğraflar salı çekilmiş, perdeler yeni. "Beyefendi, boya badana on iki bin tuttu, Kıvanç ilanı yayına aldı, depozitonuz hazır; ay sonuna kadar bir yer bulur musunuz, Seyrantepe'de bir stüdyo biliyorum, plazaların arkası, biraz pahalı."`,
        choices: [
          { label: "Seyrantepe'ye taşın",
            result: `Seyrantepe, Cendere Caddesi'nin arkası, plaza otoparkına bakan bir stüdyo: kira Gültepe'nin bir buçuk katı, asansör var, kapıcı yok, kapıda KapitalDoor. Üç koli, bir kask, bir yorgan; Kıvanç'ın çağırdığı Doblo iki seferde taşır. Şoför, aynadan: "Kurye misin? Bizim oğlan da." Zümrüt'ün kapısını son kapatan Nuri Bey: "Beyefendi, anahtarı bırakır mısınız."`,
            effects: { expenseDaily: 60, fact: 'nuri_moved' } },
          { label: 'Depozitoyu iste, sonra taşın',
            outcomes: [
              { chance: 0.6,
                result: `"Depozito Nuri Bey." Hırkanın iç cebinden zarf çıkar, sayılı, lastikli: bin iki yüz. "Beyefendi, depozito üç yıl önceki kira, o zaman bin iki yüzdü, enflasyon beyefendi, enflasyon; boya badanayı Kıvanç ödedi, sizden kesmedim, kesmem; Seyrantepe'de aidatı bir sorar mısınız, kapıcısı yok." Doblo, üç koli, bir kask. Yeni kapıda siyah panel: "Hoş geldiniz. Daire numaranızı girin."`,
                effects: { money: 1200, expenseDaily: 60, fact: 'nuri_moved' } },
              { chance: 0.4,
                result: `"Depozito Nuri Bey." Kıvanç tableti indirir: "Boya badana, duvardaki delikler, kombi servisi; üç yüz kaldı." Nuri Bey zarfı uzatır, bakmaz. "Beyefendi, hesabı Kıvanç yaptı, ben yapmadım; Seyrantepe'de aidatı sorun, burada sormadınız; bir de anahtarı bırakır mısınız." Üç yüzlük, anahtar, Doblo, üç koli. Yeni kapıda siyah panel, mavi ışık.`,
                effects: { money: 300, expenseDaily: 60, fact: 'nuri_moved', rel: { nuri: -1 } } }
            ] }
        ]
      };

      /* YELEK: ev sahibi kurye kaldı; kira yerinde, hediye yok */
      if (courier) {
        const who = f.raced ? `Çağlayan'ı bu sabah da o dolaşmış.` : `Gültepe'yi bu sabah da o dolaşmış.`;
        const sabah = f.raced
          ? `Beş kırk beşte sahanlık ışığını yakarsın; aşağıda zincir sesi, pil yerine oturur.`
          : `Beş kırk beşte sahanlık ışığını yakarsın; bisikletin şarj kablosu hâlâ senin prizde.`;
        const tabak = f.tabak ? `tabağı yine yukarı` : `tabağı yukarı getirirsiniz`;
        return {
          title: 'YELEK',
          text: `Saat dokuz buçuk. Nuri Bey kapıda yelekle, hırka yeleğin altında; telefonda gün özeti: on bir teslimat, puan 4,9. ${who} "Beyefendi, aidat bu ay da üç bin beş yüz, kira olduğu yerde, zam yok, günlük kiralık yok, Kıvanç küs; yarın altıda çıkıyorum, sahanlık ışığını yakar mısınız, otomat yine bozuk." Uygulamada bildirim: "Haftanın En Hızlı Yeni İş Ortağı: Nuri Ö. 🏆"`,
          choices: [
            { label: 'Işığı yak',
              result: `${sabah} Nuri Bey yelekle iner, pil yüzde yüz, kask bağı çenesinin altında çift düğüm. "Beyefendi, kira aynı kaldı, sigorta ikimizde de yok; akşam çay bende, bardakları siz getirir misiniz." Bisiklet Talatpaşa'dan aşağı iner, sinyal verir.`,
              effects: { rel: { nuri: 1 }, fact: 'nuri_courier' } },
            { label: "Gültepe'yi ona bırak",
              result: `"Gültepe sizin Nuri Bey, bu haftadan sonra da." Yeleğin fermuarını çeker, hırka kaybolur. "Beyefendi, Sevim Hanım'ın dolması bu hafta iki kere gelir o zaman, ${tabak}; bir de şu yeleğe bir isim yazar mısınız, uygulama arkaya 'İş Ortağı' yazmış, ben Nuri'yim." Keçeli kalemle yazarsın: NURİ.`,
              effects: { rel: { nuri: 2 }, fact: 'nuri_courier' } }
          ]
        };
      }

      /* BODRUM: bisiklet bodrumda, Kıvanç'ın ilanı askıda, kira yerinde; hediye yok.
         f.vest: yelek zaten kuryede (ALÇI c2) → Nuri Bey'in elinde bisikletin anahtarı ve ters çıkmış Sahibinden ilanı */
      const teker = duz ? `tekeri düz, ` : `tekeri sekiz, `;
      const ilan = f.airbnb ? `Kıvanç ilanı askıya aldı` : `Kıvanç ilanı kaldırdı`;
      const kol = `alçı hâlâ kolda, üstünde Sevim Hanım'ın dolma kalemiyle bir tarih`;
      if (f.vest) return {
        title: 'BODRUM',
        text: `Nuri Bey kapıda; ${kol}; hırka, pijama. Elinde bisikletin anahtarı. "Beyefendi, bisiklet bodrumda, ${teker}${ilan}, günlük kiralık yok, kira olduğu yerde, zam gelecek ay konuşulur; Sahibinden'e koydum, üç bin yazdım, iki telefon geldi, ikisi de kurye; ilana bir bakar mısınız, fotoğraf ters çıktı." Telefonda ilan: bisiklet baş aşağı, başlık "AZ KULLANILDI, SAHİBİNDEN".`,
        choices: [
          { label: 'İlanı sen yaz',
            result: `Fotoğrafı çevirirsin, başlığı silersin, yeniden yazarsın: "Elektrikli bisiklet, dört gün kullanıldı, ön teker ${duz ? 'yeni' : 'ayarsız'}, Gültepe'den." Nuri Bey okur, dolma kalemle kareli kağıda da geçirir. "Beyefendi, 'dört gün' doğru, 'Gültepe'den' de doğru; fiyatı siz yazın, ben yazamıyorum, elim gitmiyor." Üç bin yazarsın. Gece ilk telefon, Çağlayan'dan bir kurye.`,
            effects: { rel: { nuri: 1 } } },
          { label: 'Bisikleti sor',
            result: `"Satacak mısınız gerçekten Nuri Bey?" Anahtarı avucunda çevirir. "Beyefendi, iki telefon da üç binden pazarlık etti, ikisi de kurye, ikisinin de sesi genç; satmaya kıyamadım, ilanı siz kaldırın, Kıvanç'ın oğlu büyüyünce biner; bir de ara sıra pilini şarj eder misiniz, boş durursa ölüyor." Pil sahanlıkta, kablo sende. Kira olduğu yerde.`,
            effects: { rel: { nuri: 1 } } }
        ]
      };
      return {
        title: 'BODRUM',
        text: `Nuri Bey kapıda; ${kol}; hırka, pijama. Elinde yeleğin kopuk etiketi. "Beyefendi, bisiklet bodrumda, ${teker}${ilan}, günlük kiralık yok, kira olduğu yerde, zam gelecek ay konuşulur; şu yeleği uygulamaya nasıl iade ederim, bir bakar mısınız, kırk lira yazıyor." Telefonda iade ekranı: "Üzgünüz 😔 İş Ortağı ekipmanı iade kapsamı dışındadır."`,
        choices: [
          { label: 'Yeleği sen al',
            result: `"İade yok Nuri Bey, ekran öyle yazıyor. Yeleği ben alırım, kırk lira." Kırk lirayı verirsin; alır, sayar, pijamanın cebine koyar. "Beyefendi, kırk lira bu ay doğalgazın yarım günü; yeleği giyerseniz Sevim Hanım'a bir el sallar mısınız, pencereden bakıyor." Yelek turkuaz, etiket yok, arkasında İŞ ORTAĞI, altında isim için boş bir şerit.`,
            effects: { money: -40, rel: { nuri: 1 } } },
          { label: 'Bisikleti sor',
            result: `"Bisiklet ne olacak Nuri Bey?" "Beyefendi, Sahibinden'e koydum, dört bin iki yüz aldım, üç bin yazdım, iki telefon geldi, ikisi de kurye; satmaya kıyamadım, Kıvanç'ın oğlu büyüyünce biner, siz de ara sıra pilini şarj eder misiniz, boş durursa ölüyor." Pil sahanlıkta, kablo sende. Kira olduğu yerde.`,
            effects: { rel: { nuri: 1 } } }
        ]
      };
    }
  });
})();
