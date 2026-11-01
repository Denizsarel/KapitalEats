/* ---------------- NEBAHAT TEYZE — «KENTSEL DÖNÜŞÜM» ----------------
   Kuzguncuk, İcadiye Cad., Mimoza Apt. Altı beat, hepsi 'ticket'.
   Hafıza testi (5. beat) 1. beat'te ekilir: rahmetli Nusret, yetmiş dokuz.
   Bayraklar (A.flags): heard, told, keep | sell | none, gave, trust.
   Ödül: keep && told → "Nebahat'in Mutfağı" (unlockRestaurant) + ending 'borek';
         sell → Nurten Teyze Kuzguncuk Şubesi («Kurye Dostu Restoran»);
         gave || trust → keepsake 'nebahat_bag'.
   Şema ve kurallar: docs/CONTENT_CONTRACT.md */
(function () {
  const ADDR = { district: 'Üsküdar', hood: 'Kuzguncuk', street: 'İcadiye Cad.', no: 31, building: 'Mimoza Apt.', floor: 2, apt: 4, customer: 'Nebahat Teyze' };
  const food = (o) => (o.lines && o.lines[0] ? o.lines[0].name : 'yemek').replace(/\s*\(.*?\)/, '').toLowerCase();

  /* ---- 1. BÖREK (Gün 2) ---- */
  ARC_BEATS.push({
    arc: 'nebahat', step: 1, startDay: 2, dueGap: 2, mode: 'ticket', address: ADDR,
    hook: "Kuzguncuk'tan bir sipariş düştü: Mimoza Apt., not: 'Zile basmayın, kapı açık olur.'",
    hookShort: 'Kuzguncuk böreği',
    build: (o, S, A) => ({
      title: 'MİMOZA APARTMANI',
      text: `İcadiye Caddesi, Mimoza Apt., ikinci kat. Kapı sen çalmadan açılır: önlük, terlik, saçta siyah toka. Çantanda ${o.rest} poşeti, içinde ${food(o)}. Nebahat Teyze poşete değil, sana bakar. "Ercan bu telefondan yemek söyletiyor bana evladım, oysa ben Nusret'e kırk yıl börek açtım, Paşabahçe'den cam tozuyla gelirdi akşamları, yetmiş dokuzda bu evi aldık, bırak o poşeti mutfağa, sen şu böreği alırsın."`,
      choices: [
        { label: 'Böreği al',
          result: `Folyo sıcak, köşesi yağlı. "Nusret de ayakta yerdi evladım, servis kapıda korna çalardı, bir dilim ağzında bir dilim elinde, kırk yıl böyle, sen de ayakta yiyorsun, otur demem, oturmazsın." Poşeti mutfağa bırakırsın, ikinci dilimi merdivende yersin.`,
          effects: { energy: 15, rel: { nebahat: 1 }, fact: 'nebahat_nusret', sets: { heard: true } } },
        { label: 'Önce poşeti teslim et',
          result: `Poşeti mutfak tezgâhına koyarsın; fayans sarı, derzleri elle çekilmiş. "O fayansı Nusret döşedi evladım, yetmiş dokuzun yazında, bir cumartesi, ben börek açtım o derz çekti, şimdi Ercan'ın yemeği onun üstünde soğuyor, sen böreği al, ellilik de Ercan'ın parasından." Avucunda folyo, folyonun altında elli lira.`,
          effects: { tip: 50, energy: 10, rel: { nebahat: 1 }, fact: 'nebahat_nusret', sets: { heard: true } } },
        { label: 'Acelem var teyze',
          result: `"Sizin hep aceleniz var evladım, Nusret'in de vardı, Paşabahçe servisi altıda kalkardı, kırk yıl bir kere kaçırmadı, yetmiş dokuzda bu evi de koşarak aldı, böreği yine alırsın, merdivende yersin." Folyo cebine girer; kapı kapanmadan merdivene börek kokusu iner.`,
          effects: { energy: 10, rating: 0.05, fact: 'nebahat_nusret', sets: { heard: true } } }
      ]
    })
  });

  /* ---- 2. NURTEN KİM (Gün 4) ---- */
  ARC_BEATS.push({
    arc: 'nebahat', step: 2, dueGap: 3, mode: 'ticket', address: ADDR,
    hook: "Nebahat Teyze'nin alt katından kuru fasulye kokusu geliyor; tabelası yok, yazıcısı var.",
    hookShort: 'Alt kattaki kiracı',
    build: (o, S, A) => {
      const ghost = o.rest === 'Ev Yemekleri Nurten Teyze';
      const open = ghost
        ? 'Çantandaki poşet bu binanın zemin katından çıktı: Ev Yemekleri Nurten Teyze. Kapı aralık; içeride termal yazıcı, iki tencere, kulaklıklı bir çocuk. Nurten yok.'
        : 'Zemin katın kapısı aralık: termal yazıcı sesi, iki tencere, kulaklıklı bir çocuk. Poşetlerin etiketi: EV YEMEKLERİ NURTEN TEYZE. Nurten yok.';
      return {
        title: 'NURTEN KİM',
        text: `${open} İkinci katta Nebahat Teyze kapıda. "Aşağıdaki kiracı yazılımcıymış evladım, hiç çıkmıyor, bazen merdivene sarımsak kokusu vuruyor, Nusret de sarımsağı severdi, mutfağımın altında kim ne pişiriyor bilmem, kirayı gününde yatırıyor, sen şu böreği alırsın."`,
        choices: [
          { label: 'Söyle',
            result: `Etiketi anlatırsın: Nurten Teyze, zemin kat, termal yazıcı. Nebahat Teyze folyoyu radyatörün üstüne koyar. "Demek Nurten diye biri yok evladım, benim kuru fasulyem üç gün dayanır onunkini bilmem, Nusret olsa şimdi merdiveni iner tencerenin altını kapatırdı, ben bir düşüneceğim, böreği al." Radyatörde folyo, folyodan buhar.`,
            effects: { sets: { told: true }, rel: { nebahat: 1 }, energy: 15 } },
          { label: 'Söyleme',
            result: `Böreği alır, poşeti verirsin; fayansın üstünde Ercan'ın yemeği, altında Nurten'in tenceresi. Merdivenden inerken zemin katın kapısı açılır, çocuk kulaklığın birini çıkarır: "Abi sen bizim kuryemizsin artık, akşam üç paket var, yüz elli ekstra, nakit, yolda görüşürüz." Etikette yine Nurten Teyze, altında senin adın.`,
            effects: { sets: { told: false }, energy: 15, money: 150 } },
          { label: 'Alt kata in, çocukla konuş',
            outcomes: [
              { chance: 0.6,
                result: `Çocuk kulaklığı çıkarır, tencerenin kapağını açar. "Abi Nurten anneannem, Allah rahmet eylesin, tarifler onun, ruhsat benim, teyzeye söyleme, kira zaten yüksek." Bir kap kuru fasulye uzatır, üstüne pilav. Yukarıda Nebahat Teyze folyoyu uzatır. Çantada iki yemek, ikisi de ev yemeği, ikisi de aynı binadan.`,
                effects: { sets: { told: false }, energy: 25, expense: -60 } },
              { chance: 0.4,
                result: `Çocuk kapının aralığından konuşur: "Abi ruhsatım var, Sanal Mutfak Sertifikası, platform verdi, teyzeyle alakası yok, kapatıyorum." Kapanır. Telefonun titrer: "Restoran bildirimi: Kurye, teslim alma alanı dışında görüldü 📍 Puanınız güncellenebilir." Yukarıda folyo seni bekler; sen de bir şey anlatmazsın.`,
                effects: { sets: { told: false }, rating: -0.1, energy: 10 } }
            ] }
        ]
      };
    }
  });

  /* ---- 3. SATILIK (Gün 7) ---- */
  ARC_BEATS.push({
    arc: 'nebahat', step: 3, dueGap: 3, mode: 'ticket', address: ADDR,
    hook: "İcadiye Caddesi'nde Mimoza Apt.'nin kapısına bir A4 yapıştırılmış: SATILIK, altı çizili.",
    hookShort: 'SATILIK',
    build: (o, S, A) => {
      const line = A.flags.told
        ? `"Müteahhit geldi evladım, üç sene huzurevi sonra sıfır daire diyor, aşağıdaki Nurten'siz çocuk da kontratım var diye çıkmıyor, Nusret bu evi yetmiş dokuzda aldı, fayansı kendi döşedi, şimdi sen söyleyeceksin."`
        : `"Müteahhit geldi evladım, üç sene huzurevi sonra sıfır daire diyor, Nusret bu evi yetmiş dokuzda aldı, mutfağın fayansını kendi elleriyle döşedi, börek o fayansın üstünde açılır, şimdi sen söyleyeceksin."`;
      return {
        title: 'SATILIK',
        text: `Kapının yanına A4 yapıştırılmış: SATILIK, altı iki kere çizili, bir cep telefonu numarası. Nebahat Teyze kağıda bakmaz, sana bakar. ${line}`,
        choices: [
          { label: 'Tutmasını söyle',
            result: `"Ben de öyle dedim evladım, Ercan'a da öyle dedim, adam üç sene çabuk geçer diyor, Nusret'in altmış iki senesi de çabuk geçti, bu fayans yerinde kalır, böreği al, sıcak." Folyoyu avucuna bastırır. A4 yerinde kalır; telefon numarasının üstünde bir parmak yağ.`,
            effects: { sets: { keep: true }, rel: { nebahat: 1 }, energy: 15 } },
          { label: 'Satmasını söyle',
            result: `Nebahat Teyze kağıda ilk kez bakar. "Ercan da öyle diyor evladım, müteahhit de, sıfır daire, asansör, kombi, Nusret'in fayansı çöpe, Nusret'ten sonra ilk defa biri bana ne yapacağımı söylüyor, böreği al, soğumasın." Kağıdın kıvrık köşesini düzeltir; telefon numarası şimdi daha düz.`,
            effects: { sets: { sell: true }, energy: 15 } },
          { label: 'Karışma',
            result: `"Ercan da böyle susuyor evladım, telefona bakıyor, sen bilirsin anne diyor, Nusret hiç sen bilirsin demezdi, ya olur derdi ya olmaz, börek bugün yok, hamur kabarmadı." Kapı yavaş kapanır. Merdivende sadece zemin kattan yazıcı sesi.`,
            effects: { sets: { none: true }, rel: { nebahat: -1 } } }
        ]
      };
    }
  });

  /* ---- 4. DÖRDE KATLI İKİ YÜZ (Gün 10) ---- */
  ARC_BEATS.push({
    arc: 'nebahat', step: 4, dueGap: 3, mode: 'ticket', address: ADDR,
    hook: 'Nebahat Teyze merdivende bekliyor, elinde dörde katlanmış bir kağıt; poşete bakmıyor.',
    hookShort: 'Katlı iki yüz lira',
    build: (o, S, A) => {
      const f = A.flags;
      const sign = f.sell ? 'SATILIK kağıdının üstünde şimdi bir de kırmızı kaşe: GÖRÜŞÜLDÜ.'
        : f.keep ? 'SATILIK kağıdı yerinde yok; yerinde dört parça bant izi.'
        : 'SATILIK kağıdı yerinde, köşesi biraz daha kıvrık.';
      const kiraci = f.told ? "aşağıdaki Nurten'siz çocuğun kirasından" : 'aşağıdaki kiracının kirasından';
      const choices = [
        { label: 'Al, elini öp',
          result: `Elini öpersin; eli un kokar. "Motora dikkat edersin evladım, Nusret de dikkat ederdi, Paşabahçe servisine otuz sene hiç geç kalmadı, aynı koltuk, aynı pencere, sen de dikkat edersin, börek yolda soğumasın." Para çantanın ön cebinde, börek üstünde.`,
          effects: { money: 200, rel: { nebahat: 1 }, rating: 0.05, energy: 10 } },
        { label: 'Olmaz teyze, almam',
          result: `"Alırsın." Parayı çantanın ön cebine koyar, fermuarı çeker. "Nusret de almam derdi evladım, maaş zarfını masaya bırakırdı, ben alırdım, kırk yıl böyle, kiracının parası da aynı masadan geçer, masa Nusret'in, sen alırsın, börek de senin." Fermuarın sesi, sonra kapının.`,
          effects: { money: 200, rel: { nebahat: 1 }, energy: 10 } }
      ];
      if (S.money >= 200) choices.push({
        label: 'Teyzeye 200 ₺ ver',
        result: `Kendi iki yüzünü onunkiyle birlikte önlüğün cebine koyarsın. Nebahat Teyze cebe bakar, sonra sana. "Nusret'ten sonra bu mutfağa para getiren ilk kişi sensin evladım, kiracı kira getirir o başka, bu dört yüz lira şimdi un olur, yağ olur, cumartesi sana börek olur, sen gelirsin." Önlük cebinde dört yüz lira, ikisi de dörde katlı.`,
        effects: { money: -200, sets: { gave: true }, rel: { nebahat: 2 }, energy: 10 }
      });
      return {
        title: 'DÖRDE KATLI İKİ YÜZ',
        text: `${sign} Nebahat Teyze seni merdivende bekler, elinde dörde katlanmış iki yüz lira; poşeti almadan avucuna bastırır. "Hayır demeyeceksin evladım, emekli maaşımdan değil, ${kiraci}, bu ay da gününde yatırdı, Nusret'in maaşı Paşabahçe'den zarfla gelirdi, zarfı mutfakta açardık, sen bunu al, benzine koy."`,
        choices
      };
    }
  });

  /* ---- 5. ERCAN'IN DOSYASI — hafıza testi (Gün 13) ---- */
  ARC_BEATS.push({
    arc: 'nebahat', step: 5, dueGap: 2, mode: 'ticket', address: ADDR,
    hook: "Kuzguncuk'ta Nebahat Teyze'nin oğlu Ercan gelmiş; elinde imza bekleyen bir dosya var.",
    hookShort: "Ercan'ın dosyası",
    build: (o, S, A) => {
      const f = A.flags;
      const intro = f.gave ? '"İki yüz lirayı duydum, annem anlattı."'
        : f.keep ? '"Satmasın diyen senmişsin. Madem bu kadar yakınsınız."'
        : f.sell ? '"Sat demişsin, aklı başında birisin."'
        : `"Annem seni ${S.name} diye değil, evladım diye anlatıyor."`;
      const low = S.rating < 3.5 ? ' "Uygulamada puanına da baktım, üç buçuk bile değil."' : '';
      return {
        title: "ERCAN'IN DOSYASI",
        text: `Kapıyı Ercan açar: kırk beş, yelek, elinde şeffaf dosya, dosyada RİSKLİ YAPI TESPİT BAŞVURUSU ve imza için boş bir çizgi. İçeriden merdane sesi. ${intro}${low} Dosyayı kapatmadan sorar: "Babamın adı neydi, bu evi hangi sene aldı?"`,
        choices: memChoices(
          'Nusret, yetmiş dokuz', ['Necdet, seksen bir', 'Nurettin, yetmiş altı'],
          { result: `Ercan dosyayı kapatır. İçeriden merdane durur. "Nusret, yetmiş dokuz, Paşabahçe'den aldığı ikramiyeyle, peşin, evladım bunu Ercan'ın karısı bilmez, sen bildin, Ercan o kağıdı bugün mutfağa getirmeyecek, börek kabarıyor, on dakikaya çıkar." Ercan dosyayı koltuğunun altına alır; merdane yeniden başlar.`,
            effects: { sets: { trust: true }, rel: { nebahat: 2 }, rating: 0.1, energy: 15 } },
          { result: `Ercan kalemi uzatır, sana değil, mutfağa doğru. "Bak anne, adını bile bilmiyor." Merdane sesi kesilmez. "Nusret evladım, yetmiş dokuz, bu evde adı iki kere söylenir en fazla, sen kiracı değilsin ama Ercan öyle sanır, böreği al, kağıt bugün imzalanmaz, Ercan yarın yine gelir." Kalem dosyanın üstünde, çizgi hâlâ boş.`,
            effects: { sets: { trust: false }, rel: { nebahat: -1 }, energy: 10 } }
        )
      };
    }
  });

  /* ---- 6. ÖDÜL (Gün 15) ---- */
  ARC_BEATS.push({
    arc: 'nebahat', step: 6, dueGap: 0, mode: 'ticket', address: ADDR, final: true,
    hook: "Mimoza Apt.'nin kapısındaki kağıt bugün başka; Nebahat Teyze kapıda, elinde bir şey var.",
    hookShort: "Nebahat'in kapısı",
    build: (o, S, A) => {
      const f = A.flags;
      const bag = !!(f.gave || f.trust);
      const ks = bag ? { keepsake: 'nebahat_bag' } : {};

      /* A) Tuttu ve kiracıyı öğrendi: mutfak açılır */
      if (f.keep && f.told) {
        const MUTFAK = { name: "Nebahat'in Mutfağı", tag: 'Yolda soğumasın diye poşet iki kat.', areas: ['Üsküdar', 'Kadıköy'], tipMult: 1.3,
          menu: [['🫓', 'Su böreği (tepsi, sıcak)', 340, true], ['🫓', 'Ispanaklı börek (6 dilim)', 280, true], ['🍛', 'Kuru fasulye + pilav', 290, true], ['🍲', 'Ekşili köfte', 320, false], ['🥛', 'Ayran', 50, false], ['🍮', 'Fırın sütlaç', 130, false]] };
        return {
          title: "NEBAHAT'İN MUTFAĞI",
          text: `SATILIK'in yerinde lazer yazıcıdan yeni bir A4: NEBAHAT'İN MUTFAĞI · SU BÖREĞİ · KURU FASULYE. Zemin kat boş; yazıcıyla iki tencere kaldırımda. Nebahat Teyze kapıda, önlüğünde un. "Çocuğa çık dedim evladım, çıktı, tencereleri bıraktı, Ercan beni telefondan platforma yazdırdı, Nusret'in fayansının üstünde şimdi benim adım var, ilk siparişi sen götürürsün, bahşişini de alırsın, soğutmazsın."`,
          choices: [
            { label: 'İlk siparişi al',
              result: `Poşet iki kat, "yolda soğumasın" diye. Uygulamada yeni restoran: Nebahat'in Mutfağı, Üsküdar ve Kadıköy. Fiş notu: "Kuryeye de bir dilim." "Nusret ilk maaşını da böyle zarfa koymuştu evladım, yetmiş dokuzda, zarfı ben açtım, bugün de ben açarım, ilk sipariş Kadıköy'e, ikinci kat, asansör yok, sen götür, sıcak götür." Dilim çantada, sıcak.`,
              effects: { unlockRestaurant: MUTFAK, ending: 'borek', rel: { nebahat: 2 }, tip: 120, energy: 15, fact: 'nebahat_mutfak', ...ks } },
            { label: 'Kağıdı düzgün yapıştır',
              result: `Bandı dört köşeden çekersin; harfler düz durur. "Nusret de bandı böyle çekerdi evladım, fayansı döşerken ipi gerer, derzi çeker, bir cumartesi bitirirdi, bu kağıt da öyle durur, sen de cumartesi gelirsin, tepsi senin." Kağıdın altında küçük harflerle: Kurye bahşişi tepside, elden.`,
              effects: { unlockRestaurant: MUTFAK, ending: 'borek', rel: { nebahat: 2 }, rating: 0.1, energy: 15, fact: 'nebahat_mutfak', ...ks } },
            { label: 'Yazıcıyı hurdacıya ver',
              result: `Hurdacı Şevket'in üç tekerlisi İcadiye'nin başında; termal yazıcıya yüz elli lira, tencerelere bakmaz. "O tencereler kalır evladım, yıkarım, kuru fasulye onlarda pişer, Nurten'in tenceresi Nebahat'in fasulyesini pişirir, Nusret buna gülerdi, kırk yıl her şakaya güldü, akşam bir tepsi çıkar, sen alırsın." Yüz elli lira cepte, tencereler fayansın üstünde.`,
              effects: { unlockRestaurant: MUTFAK, ending: 'borek', rel: { nebahat: 1 }, money: 150, energy: 10, fact: 'nebahat_mutfak', ...ks } }
          ]
        };
      }

      /* B) Sattı: taşınma günü, hayalet mutfak binayı alır */
      if (f.sell) {
        const SUBE = { name: 'Ev Yemekleri Nurten Teyze · Kuzguncuk Şubesi', tag: 'Kurye Dostu Restoran 💙 Annenin yaptığı gibi, şimdi iki katta.', badge: 'Kurye Dostu Restoran', areas: ['Üsküdar', 'Kadıköy', 'Ataşehir'],
          menu: [['🍛', 'Kuru fasulye + pilav', 290, true], ['🫓', 'Ev böreği (teyze usulü)', 260, true], ['🍲', 'Mercimek çorbası (kapağı gevşek)', 120, false], ['🍲', 'Sulu köfte', 320, false], ['🍮', 'Sütlaç', 130, false]] };
        const poset = bag ? 'Poşeti avucuna bastırır: iki kat, içinde folyo, folyoda son tepsinin yarısı.' : "Doblo İcadiye'den aşağı iner, arka camda FAYANS.";
        return {
          title: 'TAŞINMA GÜNÜ',
          text: `Kaldırımda Ercan'ın Doblo'su, arka kapağı açık; kolilerden birinde keçeli kalemle FAYANS. Zemin kat çocuğu merdiveni ölçüyor, kapısında platform mavisi yeni tabela: NURTEN TEYZE · KUZGUNCUK ŞUBESİ · KURYE DOSTU RESTORAN. Nebahat Teyze son koliyi kucaklamış. "Üç sene huzurevi evladım, Çamlıca'da, sonra sıfır daire diyorlar, Nusret'in fayansını ustaya söktürdüm, ikişer ikişer koliledim, huzurevinde mutfak yokmuş, aşağıdaki çocuk bütün binayı tuttu, börek bugün yok, ${bag ? 'poşet var' : 'hamur da yok'}."`,
          choices: [
            { label: "Koliyi Doblo'ya taşı",
              result: `FAYANS kolisi ağır, ikişer ikişer sarılmış. Ercan arka kapağı kapatır. "Kuzguncuk'tan Çamlıca'ya fayans taşındı evladım, Nusret görse güler, o fayansı bir cumartesi döşemişti, ben börek açmıştım, şimdi tencere aşağıda, tencere yukarıda, hepsi Nurten'in, Nurten yok." ${poset}`,
              effects: { unlockRestaurant: SUBE, energy: -10, rel: { nebahat: 1 }, fact: 'nebahat_tasindi', ...ks } },
            { label: 'Çocukla konuş',
              result: `Çocuk merdiveni ölçmeyi bırakır. "Abi platform verdi tabelayı, Kurye Dostu Restoran, kuryeye çay bedava yazıyor, çay yok ama bardak var, bir de ev böreği ekledim menüye, teyzenin tarifi değil, YouTube." Uygulamada yeni restoran: Nurten Teyze · Kuzguncuk Şubesi. Nebahat Teyze Doblo'nun ön koltuğunda, kucağında son koli${bag ? ', dizinde sana ayırdığı poşet' : ''}.`,
              effects: { unlockRestaurant: SUBE, rel: { nebahat: -1 }, fact: 'nebahat_tasindi', ...ks } },
            { label: 'Elini öp',
              result: `Eli un kokmaz artık, sabun kokar. "Huzurevinde pazartesi makarna, salı köfte diyorlar evladım, ben böreğin gününü sormadım, soramazdım, Nusret'e kırk yıl her gün açtım, şimdi Çamlıca'da bir dolap, bir yatak, bir de sen varsın, cumartesileri gelirsin." ${poset}`,
              effects: { unlockRestaurant: SUBE, rel: { nebahat: 2 }, energy: 10, fact: 'nebahat_tasindi', ...ks } }
          ]
        };
      }

      /* C) Kaldı (tuttu ama söylemedi, ya da karışmadı): kağıt yerinde, börek yerinde */
      const warm = rel('nebahat') > 0;
      const tail = bag ? 'sen alırsın, poşet de iki kat' : warm ? "bir dilim senin, gerisi Ercan'a" : "tepsi Ercan'a gidiyor, sana merdivenden koku";
      const first = (bag || warm)
        ? { label: 'Böreği al',
            result: `Folyo sıcak${bag ? ', poşet iki kat' : ''}. "Cumartesi yine açarım evladım, kağıt da durur, ben de dururum, Nusret bu evi yetmiş dokuzda aldı, yetmiş dokuzda alınan ev on beş günde satılmaz, Ercan bunu bilmez, sen bilirsin." Merdivende aşağıdan yazıcı sesi, üstten börek kokusu.`,
            effects: { rel: { nebahat: 1 }, energy: bag ? 20 : 12, fact: 'nebahat_kaldi', ...ks } }
        : { label: 'Selam ver, in',
            result: `Folyo yok; kapı aralığından koku var. "Cumartesi yine açarım evladım, Ercan'a, kağıt da durur, ben de dururum, Nusret bu evi yetmiş dokuzda aldı, on beş günde satılmaz, sen Kadıköy'e gidersin, yolun uzun." Kapı kapanır; merdivende sadece yazıcı sesi.`,
            effects: { fact: 'nebahat_kaldi' } };
      return {
        title: 'SATILIK, HÂLÂ',
        text: `SATILIK kağıdı yerinde; güneşten sarardı, numarası soldu, köşesi kıvrık. Zemin kattan termal yazıcı, merdivende kuru fasulye kokusu. Nebahat Teyze kapıda, elinde folyo. "Ercan geldi gitti evladım, müteahhit aradı aramadı, kağıt orada duruyor, ben burada duruyorum, Nusret'in fayansı yerinde, aşağıdaki çocuk kirayı yine gününde yatırdı, börek yine açıldı, ${tail}."`,
        choices: [
          first,
          { label: 'SATILIK kağıdını sök',
            outcomes: [
              { chance: 0.7,
                result: `Kağıt tek hamlede gelir, bant izi kalır. Nebahat Teyze ilk kez sesli güler. "Nusret de böyle sökerdi evladım, apartman toplantısı ilanını, yönetici kızardı, o gülerdi, kırk yıl o bant izi kaldı kapıda, şimdi senin izin var, ${bag ? 'poşeti' : 'böreği'} al, cumartesi gelirsin." Kağıt cebinde, numara dörde katlı.`,
                effects: { rel: { nebahat: 2 }, energy: 15, fact: 'nebahat_kaldi', ...ks } },
              { chance: 0.3,
                result: `Kağıt gelir; karşı kaldırımdaki gri Egea'nın camı iner, telefon kalkar: müteahhidin saha elemanı Cengiz, fotoğraf. Yarım saat sonra uygulama: "Üçüncü taraf bildirimi: mülk üzerinde izinsiz işlem 📋 Puanınız güncellendi." Nebahat Teyze folyoyu uzatır. "Çeksin evladım, Nusret bu kapıyı yetmiş dokuzda boyadı, iki kat yağlı boya, altı kahverengi üstü krem, kırk yıldır bu kapıya kim ne yapıştırdıysa söküldü, bu da sökülür, böreği al."`,
                effects: { rel: { nebahat: 2 }, rating: -0.2, energy: 15, fact: 'nebahat_kaldi', ...ks } }
            ] }
        ]
      };
    }
  });
})();
