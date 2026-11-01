/* ---------------- NEBAHAT TEYZE — «KENTSEL DÖNÜŞÜM» ----------------
   Kuzguncuk, İcadiye Cad., Mimoza Apt. Altı beat, hepsi 'ticket'.
   Hafıza testi (5. beat) 1. beat'te ekilir: rahmetli Nusret, yetmiş dokuz.
   Bayraklar (A.flags): heard, told, keep | sell | none, gave, trust.
   Ödül: keep && told → "Nebahat'in Mutfağı" (unlockRestaurant) + ending 'borek';
         sell → "Ev Yemekleri Nurten Teyze · Mimoza" (Kurye Dostu Restoran);
         gave || trust → keepsake 'nebahat_bag'.
   OLGU LİSTESİ (her replikte aynı): Nusret Paşabahçe'de otuz sene çalıştı, servisle gitti geldi;
   evi yetmiş dokuzda ikramiyeyle, peşin aldı; mutfağın sarı fayansını kendi döşedi;
   altmış iki yaşında öldü; Nebahat'le kırk yıl evli kaldı, kırk yıl börek açıldı.
   Zemin kat kiracısı: Kaan Yurdakul (hayalet mutfak «Ev Yemekleri Nurten Teyze»); Nebahat ona
   «çocuk» der, ama ancak kurye söyledikten sonra (told) — yoksa «kiracı».
   Her Nebahat repliği: yemek → Nusret → kiracı → yemek, 25–40 kelime, tek cümle, «evladım».
   40-events.js'teki komsu_nebahat bu arkın yankısıdır; cümleler burada farklı kurulur.
   Şema ve kurallar: docs/CONTENT_CONTRACT.md */
(function () {
  const ADDR = { district: 'Üsküdar', hood: 'Kuzguncuk', street: 'İcadiye Cad.', no: 31, building: 'Mimoza Apt.', floor: 2, apt: 4, customer: 'Nebahat Teyze' };
  const GHOST = 'Ev Yemekleri Nurten Teyze';
  const food = (o) => (o.lines && o.lines[0] ? o.lines[0].name : 'yemek').replace(/\s*\(.*?\)/, '').toLowerCase();

  /* ---- 1. BÖREK (Gün 2) ---- */
  ARC_BEATS.push({
    arc: 'nebahat', step: 1, startDay: 2, dueGap: 2, mode: 'ticket', address: ADDR,
    hook: "Kuzguncuk'tan bir sipariş düştü: İcadiye Cad., Mimoza Apt., ikinci kat, Nebahat Teyze.",
    hookShort: 'Kuzguncuk böreği',
    build: (o, S, A) => {
      const f = A.flags;
      return {
        title: 'MİMOZA APARTMANI',
        text: `Mimoza Apt., ikinci kat. Kapı sen çalmadan açılır; önlük unlu, kollar dirseğe kadar sıvalı. Çantanda ${o.rest} poşeti, içinde ${food(o)}. Nebahat Teyze poşete değil, sana bakar. "Ercan bu telefondan yemek söyletiyor bana evladım, oysa ben Nusret'e kırk yıl börek açtım, Paşabahçe'den cam tozuyla gelirdi akşamları, yetmiş dokuzda bu evi aldık, altımızdaki kiracı o zaman yoktu, bırak o poşeti mutfağa, sen şu böreği alırsın."`,
        choices: [
          { label: 'Böreği al',
            result: `Folyo avucunu yakar; içinde iki dilim, biri senin için kesilmiş. "Nusret de ayakta yerdi evladım, servis kapıda korna çalardı, bir dilim ağzında bir dilim elinde, otuz sene böyle, aşağıdaki kiracı yemeğini kapıdan alır, yüzünü görmem, sen de ayakta yiyorsun, otur demem, oturmazsın." Poşeti mutfağa bırakırsın, ikinci dilimi merdivende yersin.`,
            effects: { energy: 15, rel: { nebahat: 1 }, fact: 'nebahat_nusret', sets: { heard: true } } },
          { label: 'Önce poşeti teslim et',
            result: `Poşeti mutfak tezgâhına koyarsın; fayans sarı, derzleri elle çekilmiş. "Ercan'ın yemeği o fayansın üstünde soğur evladım, fayansı Nusret döşedi, yetmiş dokuzun yazında, bir cumartesi, ben börek açtım o derz çekti, aşağıdaki kiracının mutfağına hiç inmedi, sen böreği al, ellilik de Ercan'ın parasından." Avucunda folyo, folyonun altında elli lira.`,
            effects: { tip: 50, energy: 10, rel: { nebahat: 1 }, fact: 'nebahat_nusret', sets: { heard: true } } },
          { label: 'Acelem var de',
            result: `"Börek bekler evladım, sizin hep aceleniz var, Nusret de merdiveni ikişer inerdi, Paşabahçe servisine yetişecek diye, aşağıdaki kiracı hiç inmez, kapısından yemek çıkar adam çıkmaz, sen inersin, böreği merdivende yersin." Folyo cebine girer; kapı kapanmadan merdivene börek kokusu iner.`,
            effects: { energy: 10, rating: 0.05, fact: 'nebahat_nusret', sets: { heard: true } } }
        ]
      };
    }
  });

  /* ---- 2. NURTEN KİM (Gün 4) ---- */
  ARC_BEATS.push({
    arc: 'nebahat', step: 2, dueGap: 3, mode: 'ticket', address: ADDR,
    hook: "Nebahat Teyze'nin alt katından kuru fasulye kokusu geliyor; tabelası yok, yazıcısı var.",
    hookShort: 'Alt kattaki kiracı',
    build: (o, S, A) => {
      const f = A.flags;
      const ghost = o.rest === GHOST;
      const open = ghost
        ? 'Çantandaki poşet bu binanın zemin katından çıkmış: Ev Yemekleri Nurten Teyze. Kapı aralık; içeride termal yazıcı, iki tencere, kulaklıklı bir çocuk, duvarda çerçeveli SANAL MUTFAK SERTİFİKASI: KAAN YURDAKUL. Nurten diye biri görünmez.'
        : 'Zemin katın kapısı aralık: termal yazıcı sesi, iki tencere, kulaklıklı bir çocuk, duvarda çerçeveli SANAL MUTFAK SERTİFİKASI: KAAN YURDAKUL. Poşetlerin etiketi EV YEMEKLERİ NURTEN TEYZE; Nurten diye biri görünmez.';
      return {
        title: 'NURTEN KİM',
        text: `${open} İkinci katta Nebahat Teyze kapıda. "Merdivene sarımsak kokusu vuruyor evladım, aşağıdaki kiracı yazılımcıymış, hiç çıkmıyor, Nusret de sarımsağı severdi, mutfağımın altında kim ne pişiriyor bilmem, kirayı gününde yatırıyor, sen şu böreği alırsın."`,
        choices: [
          { label: 'Söyle',
            result: `Etiketi anlatırsın: Nurten Teyze, zemin kat, termal yazıcı, kulaklıklı bir çocuk. Nebahat Teyze folyoyu radyatörün üstüne koyar. "Demek Nurten diye biri yok evladım, benim kuru fasulyem üç gün dayanır onunkini bilmem, Nusret olsa şimdi merdiveni iner tencerenin altını kapatırdı, kiracı kontratı Nusret'in masasında imzalandı, ben bir düşüneceğim, böreği al." Radyatörde folyo, folyodan buhar.`,
            effects: { sets: { told: true }, rel: { nebahat: 1 }, energy: 15 } },
          { label: 'Söyleme',
            result: `Böreği alır, poşeti verirsin; fayansın üstünde Ercan'ın yemeği, altında Nurten'in tenceresi. Merdivenden inerken zemin katın kapısı açılır, Kaan kulaklığın birini çıkarır: "Abi sen bizim kuryemizsin artık, akşam üç paket var, al şunu, yüz elli, kaparo, nakit, yolda görüşürüz." Etikette yine Nurten Teyze, altında senin adın.`,
            effects: { sets: { told: false }, energy: 15, money: 150 } },
          { label: "Zemin kata in, Kaan'la konuş",
            outcomes: [
              { chance: 0.6,
                result: `Kaan kulaklığı çıkarır, tencerenin kapağını açar. "Abi Nurten anneannem, Allah rahmet eylesin, tarifler onun, ruhsat benim, teyzeye söyleme, kira zaten yüksek." Bir kap kuru fasulye uzatır, üstüne pilav. Yukarıda Nebahat Teyze folyoyu uzatır. Çantada bu binadan iki yemek, biri aşağıdan biri yukarıdan.`,
                effects: { sets: { told: false }, energy: 25, expense: -60 } },
              { chance: 0.4,
                result: `Kaan kapının aralığından konuşur: "Abi ruhsatım var, duvarda, Sanal Mutfak Sertifikası, platform verdi, teyzeyle alakası yok, kapatıyorum." Kapanır. Telefonun titrer: "Restoran bildirimi: Teslim alma alanı dışında görüldünüz 📍 Puanınız güncellenebilir." Yukarıda folyo seni bekler; sen de etiketi anlatmazsın.`,
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
      const f = A.flags;
      const line = f.told
        ? `"Hamur dinleniyor evladım, müteahhit geldi, üç sene huzurevi sonra sıfır daire diyor, aşağıdaki Nurten'siz çocuk kontratım var diye çıkmıyor, Nusret bu evi yetmiş dokuzda aldı, fayansı kendi döşedi, börek o fayansta açılır, şimdi sen söyleyeceksin."`
        : `"Hamur dinleniyor evladım, müteahhit geldi, üç sene huzurevi sonra sıfır daire diyor, aşağıdaki kiracıya da kağıt bırakmış, Nusret bu evi yetmiş dokuzda aldı, fayansı kendi elleriyle döşedi, börek o fayansın üstünde açılır, şimdi sen söyleyeceksin."`;
      return {
        title: 'SATILIK',
        text: `Kapının yanına A4 yapıştırılmış: SATILIK, altı iki kere çizili, bir cep telefonu numarası. Nebahat Teyze kağıda bakmaz, sana bakar. ${line}`,
        choices: [
          { label: 'Tutmasını söyle',
            result: `"Börek sıcak evladım, ben de öyle dedim, Ercan'a da öyle dedim, adam üç sene çabuk geçer diyor, Nusret'in altmış iki senesi de çabuk geçti, kiracı kirasını yatırır, fayans yerinde kalır, böreği al." Folyoyu avucuna bastırır. A4 yerinde kalır; telefon numarasının üstünde bir parmak yağ.`,
            effects: { sets: { keep: true }, rel: { nebahat: 1 }, energy: 15 } },
          { label: 'Satmasını söyle',
            result: `Nebahat Teyze kağıda ilk kez bakar. "Börek soğuyor evladım, Ercan da öyle diyor, müteahhit de, sıfır daire, asansör, kombi, Nusret'in fayansı çöpe, Nusret'ten sonra ilk defa biri bana ne yapacağımı söylüyor, kiracıya da söylerler artık, böreği al." Kağıdın kıvrık köşesini düzeltir; telefon numarası şimdi daha düz.`,
            effects: { sets: { sell: true }, energy: 15 } },
          { label: 'Karışma',
            result: `"Hamur bugün kabarmadı evladım, Ercan da böyle susuyor, telefona bakıyor, sen bilirsin anne diyor, Nusret hiç sen bilirsin demezdi, ya olur derdi ya olmaz, kiracı da susuyor, kirayı yatırıyor, börek bugün yok." Kapı yavaş kapanır. Merdivende sadece zemin kattan yazıcı sesi.`,
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
          result: `Elini öpersin; avucu sıcak, un tırnaklarının arasında. "Börek üstte evladım, motora dikkat edersin, Nusret vapura binmezdi, servis beklerdi, otuz sene aynı durak, aynı koltuk, kiracının parası ayın birinde gelir, sen gelince börek çıkar, yolda soğumasın." Para çantanın ön cebine, börek onun üstüne; fermuar zor kapanır.`,
          effects: { money: 200, rel: { nebahat: 1 }, rating: 0.05, energy: 10 } },
        { label: 'Parayı geri uzat',
          result: `"Alırsın." Parayı önce önlüğünün cebine, sonra senin çantanın ön cebine koyar; fermuarı kendi çeker. "Börek masada evladım, Nusret de almam derdi, zarfı masaya bırakır bakmazdı, ben alırdım, otuz sene böyle, kiracının kirası da bu masadan geçer, masa Nusret'in, sen alırsın, börek de senin." Fermuar kapanır; kapı onun arkasından, daha yavaş.`,
          effects: { money: 200, rel: { nebahat: 1 }, energy: 10 } }
      ];
      if (S.money >= 200) choices.push({
        label: 'Teyzeye 200 ₺ ver',
        result: `Kendi iki yüzünü onunkiyle birlikte önlüğün cebine koyarsın. Nebahat Teyze cebe bakar, sonra sana. "Un bitti evladım, Nusret'ten sonra bu mutfağa para getiren ilk kişi sensin, kiracı kira getirir, kira para değil, bu dört yüz lira şimdi un olur, yağ olur, cumartesi sana börek olur, sen gelirsin." Önlük cebinde dört yüz lira, ikisi de dörde katlı.`,
        effects: { money: -200, sets: { gave: true }, rel: { nebahat: 2 }, energy: 10 }
      });
      return {
        title: 'DÖRDE KATLI İKİ YÜZ',
        text: `${sign} Nebahat Teyze seni merdivende bekler, elinde dörde katlanmış iki yüz lira; poşeti almadan avucuna bastırır. "Börek fırında evladım, hayır demeyeceksin, emekli maaşımdan değil, ${kiraci}, bu ay da gününde yatırdı, Nusret'in maaşı Paşabahçe'den zarfla gelirdi, zarfı mutfakta açardık, börek o masada açılırdı, sen bunu al, benzine koy."`,
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
        text: `Kapıyı Ercan açar: kırk beş, yelek, elinde şeffaf dosya, dosyada RİSKLİ YAPI TESPİT BAŞVURUSU ve imza için boş bir çizgi. İçeriden oklava sesi. ${intro}${low} Dosyayı kapatmadan sorar: "Babamın adı neydi, bu evi hangi sene aldı?"`,
        choices: memChoices(
          'Nusret, yetmiş dokuz', ['Necdet, seksen bir', 'Nurettin, yetmiş altı'],
          { result: `Ercan dosyayı kapatır. İçeriden oklava durur. "Börek kabarıyor evladım, Nusret, yetmiş dokuz, Paşabahçe'den aldığı ikramiyeyle, peşin, bunu Ercan'ın karısı bilmez, kiracı bilmez, sen bildin, Ercan o kağıdı bugün mutfağa getirmeyecek, tepsi on dakikaya çıkar." Ercan dosyayı koltuğunun altına alır; oklava yeniden başlar.`,
            effects: { sets: { trust: true }, rel: { nebahat: 2 }, rating: 0.1, energy: 15 } },
          { result: `Ercan kalemi uzatır, sana değil, mutfağa doğru. "Bak anne, adını bile bilmiyor." Oklava sesi kesilmez. "Böreği al evladım, Nusret, yetmiş dokuz, bu evde adını Ercan iki kere söyler en fazla, ben her gün söylerim, sen kiracı değilsin ama Ercan öyle sanır, kağıt bugün imzalanmaz, Ercan yarın gelir, börek yarın da çıkar." Kalem dosyanın üstünde, çizgi hâlâ boş.`,
            effects: { sets: { trust: false }, rel: { nebahat: -1 }, energy: 10 } }
        )
      };
    }
  });

  /* ---- 6. ÖDÜL (Gün 15) ---- */
  ARC_BEATS.push({
    arc: 'nebahat', step: 6, dueGap: 0, mode: 'ticket', address: ADDR, final: true,
    hook: "Nebahat Teyze kapıda, önlüğü üstünde; Mimoza Apt.'nin kapısındaki kağıda bir daha bak.",
    hookShort: "Nebahat'in kapısı",
    build: (o, S, A) => {
      const f = A.flags;
      const ghost = o.rest === GHOST;
      const bag = !!(f.gave || f.trust);
      const ks = bag ? { keepsake: 'nebahat_bag' } : {};

      /* A) Tuttu ve kiracıyı öğrendi: mutfak açılır */
      if (f.keep && f.told) {
        const MUTFAK = { name: "Nebahat'in Mutfağı", tag: 'Yolda soğumasın diye poşet iki kat.', areas: ['Üsküdar', 'Kadıköy'],
          menu: [['🫓', 'Su böreği (tepsi, sıcak)', 340, true], ['🫓', 'Ispanaklı börek (6 dilim)', 280, true], ['🍛', 'Kuru fasulye + pilav', 290, true], ['🍲', 'Ekşili köfte', 320, false], ['🥛', 'Ayran', 50, false], ['🍮', 'Fırın sütlaç', 130, false]] };
        const zemin = ghost ? 'Çantandaki poşet son paket; kaldırımdaki yazıcıdan çıkmış.' : 'Zemin kat boş; yazıcıyla iki tencere kaldırımda.';
        return {
          title: "NEBAHAT'İN MUTFAĞI",
          text: `SATILIK'in yerinde lazer yazıcıdan yeni bir A4: NEBAHAT'İN MUTFAĞI · SU BÖREĞİ · KURU FASULYE. ${zemin} Nebahat Teyze kapıda, önlüğünde un. "Tepsi fırında evladım, çocuğa çık dedim, kontratını gösterdi, Ercan avukatını gösterdi, çıktı, tencereleri bıraktı, Ercan beni telefondan platforma yazdırdı, Nusret'in fayansının üstünde şimdi benim adım var, ilk siparişi sen götürürsün, bahşişini de alırsın, soğutmazsın."`,
          choices: [
            { label: 'İlk siparişi al',
              result: `Uygulamada yeni restoran: Nebahat'in Mutfağı, Üsküdar ve Kadıköy. Fiş notu: "Kuryeye de bir dilim." "Poşet iki kat evladım, Nusret ikramiyeyi de böyle zarfla getirmişti, yetmiş dokuzda, zarfı ben açtım, bugün de ben açarım, aşağıda kiracı yok artık, zemin katta un çuvalı var, ilk sipariş Kadıköy'e, ikinci kat, asansör yok, sen götür, sıcak götür." Dilim çantada, sıcak.`,
              effects: { unlockRestaurant: MUTFAK, ending: 'borek', rel: { nebahat: 2 }, tip: 120, energy: 15, fact: 'nebahat_mutfak', ...ks } },
            { label: 'Kağıdı düzgün yapıştır',
              result: `Bandı dört köşeden çekersin; harfler düz durur. "Tepsi senin evladım, Nusret de bandı böyle çekerdi, fayansı döşerken ipi gerer, derzi çeker, bir cumartesi bitirirdi, aşağıdaki çocuğun etiketi yazıcıdan çıkardı, bu kağıt elden yapıştı, sen cumartesi gelirsin, tepsi fırından çıkar." Kağıdın altında küçük harflerle: Kurye bahşişi tepside, elden.`,
              effects: { unlockRestaurant: MUTFAK, ending: 'borek', rel: { nebahat: 2 }, rating: 0.1, energy: 15, fact: 'nebahat_mutfak', ...ks } },
            { label: 'Yazıcıyı hurdacıya ver',
              result: `Hurdacı Şevket'in üç tekerlisi İcadiye'nin başında; termal yazıcıya yüz elli lira, tencerelere bakmaz. "O tencereler kalır evladım, yıkarım, kuru fasulye onlarda pişer, Nurten'in tenceresi Nebahat'in fasulyesini pişirir, kiracı gitti tencere kaldı, Nusret kırk yıl her şakaya güldü, akşam bir tepsi çıkar, sen alırsın." Yüz elli lira cepte, tencereler fayansın üstünde.`,
              effects: { unlockRestaurant: MUTFAK, ending: 'borek', rel: { nebahat: 1 }, money: 150, energy: 10, fact: 'nebahat_mutfak', ...ks } }
          ]
        };
      }

      /* B) Sattı: taşınma günü, hayalet mutfak binayı alır */
      if (f.sell) {
        const SUBE = { name: 'Ev Yemekleri Nurten Teyze · Mimoza', tag: 'Kurye Dostu Restoran 💙 Annenizin yaptığı gibi, şimdi iki katta.', areas: ['Üsküdar', 'Kadıköy', 'Ataşehir'],
          menu: [['🍛', 'Kuru fasulye + pilav', 290, true], ['🫓', 'Ev böreği (teyze usulü)', 260, true], ['🍲', 'Mercimek çorbası (kapağı gevşek)', 120, false], ['🍲', 'Sulu köfte', 320, false], ['🍮', 'Sütlaç', 130, false]] };
        const poset = bag ? 'Poşeti avucuna bastırır: iki kat, içinde folyo, folyoda son tepsinin yarısı.' : "Doblo İcadiye'den aşağı iner, arka camda FAYANS.";
        const nurten = f.told ? 'Nurten yok' : "Nurten'i gören yok";
        return {
          title: 'TAŞINMA GÜNÜ',
          text: `Kaldırımda Ercan'ın Doblo'su, arka kapağı açık; kolilerden birinde keçeli kalemle FAYANS. Kaan merdiveni ölçer, kapısında platform mavisi yeni tabela: NURTEN TEYZE · MİMOZA · KURYE DOSTU RESTORAN. Nebahat Teyze son koliyi kucaklamış. "Börek bugün yok evladım, üç sene huzurevi, Çamlıca'da, sonra sıfır daire diyorlar, Nusret'in fayansını ustaya söktürdüm, ikişer ikişer koliledim, aşağıdaki çocuk bütün binayı tuttu, huzurevinde mutfak yokmuş, ${bag ? 'son tepsi poşette' : 'hamur da yok'}."`,
          choices: [
            { label: "Koliyi Doblo'ya taşı",
              result: `FAYANS kolisi ağır, ikişer ikişer sarılmış. Ercan arka kapağı kapatır. "Fayansta börek açılırdı evladım, Kuzguncuk'tan Çamlıca'ya taşınıyor, Nusret görse güler, bir cumartesi döşemişti, şimdi tencere aşağıda, tencere yukarıda, hepsi Nurten'in, ${nurten}, Çamlıca'da fayans yok, börek de yok." ${poset}`,
              effects: { unlockRestaurant: SUBE, energy: -10, rel: { nebahat: 1 }, fact: 'nebahat_tasindi', ...ks } },
            { label: "Kaan'la konuş",
              result: `Kaan merdiveni ölçmeyi bırakır. "Abi platform verdi tabelayı, Kurye Dostu Restoran, kuryeye çay bedava yazıyor, çay yok ama bardak var, bir de ev böreği ekledim menüye, teyzenin tarifi değil, YouTube." Uygulamada yeni restoran: Nurten Teyze · Mimoza. Nebahat Teyze Doblo'nun ön koltuğunda, kucağında son koli${bag ? '; camı indirir, sana ayırdığı poşeti uzatır' : ''}.`,
              effects: { unlockRestaurant: SUBE, rel: { nebahat: -1 }, fact: 'nebahat_tasindi', ...ks } },
            { label: 'Elini öp',
              result: `Eli un kokmaz artık, sabun kokar. "Huzurevinde pazartesi makarna, salı köfte diyorlar evladım, ben böreğin gününü sormadım, Nusret'e kırk yıl her gün açtım, aşağıdaki çocuğun fasulyesi yazıcıdan çıkar, şimdi Çamlıca'da bir dolap, bir yatak, bir de sen varsın, cumartesileri gelirsin, börek yok, çay var." ${poset}`,
              effects: { unlockRestaurant: SUBE, rel: { nebahat: 2 }, energy: 10, fact: 'nebahat_tasindi', ...ks } }
          ]
        };
      }

      /* C) Kaldı (tuttu ama söylemedi, ya da karışmadı): kağıt yerinde, börek yerinde */
      const warm = rel('nebahat') > 0;
      const sign = f.keep ? 'Bant izinin üstünde yeni bir SATILIK; bu kez bant dört köşeden, müteahhidin eli.' : 'SATILIK kağıdı yerinde; güneşten sararmış, numarası solmuş, köşesi kıvrık.';
      const zemin = ghost ? 'Çantandaki poşet zemin kattan çıkmış; yazıcı hâlâ çalışır.' : 'Zemin kattan termal yazıcı, merdivende kuru fasulye kokusu.';
      const kiraci = f.told ? 'aşağıdaki çocuk' : 'aşağıdaki kiracı';
      const tail = bag ? 'sen alırsın, poşet de iki kat' : warm ? "bir dilim senin, gerisi Ercan'a" : "tepsi Ercan'a gidiyor, sana merdivenden koku";
      const first = (bag || warm)
        ? { label: 'Böreği al',
            result: `Folyo sıcak${bag ? ', poşet iki kat' : ''}. "Cumartesi yine açarım evladım, kağıt da durur, ben de dururum, Nusret bu evi yetmiş dokuzda aldı, yetmiş dokuzda alınan ev bir A4'le satılmaz, kiracı bunu bilir, kirasını yatırır, Ercan bilmez, sen bilirsin, böreği merdivende yersin." Merdivende aşağıdan yazıcı sesi, üstten börek kokusu.`,
            effects: { rel: { nebahat: 1 }, energy: bag ? 20 : 12, fact: 'nebahat_kaldi', ...ks } }
        : { label: 'Selam ver, in',
            result: `Folyo yok; kapı aralığından koku var. "Cumartesi yine açarım evladım, Ercan'a, kağıt da durur, ben de dururum, Nusret bu evi yetmiş dokuzda aldı, bir A4'le satılmaz, kiracı kirasını yatırır, Ercan tepsisini alır, sen Kadıköy'e gidersin, yolun uzun." Kapı kapanır; merdivende sadece yazıcı sesi.`,
            effects: { fact: 'nebahat_kaldi' } };
      return {
        title: 'SATILIK, HÂLÂ',
        text: `${sign} ${zemin} Nebahat Teyze kapıda, ${(bag || warm) ? 'elinde folyo' : 'elleri önlüğünün cebinde'}. "Börek yine açıldı evladım, Ercan geldi gitti, müteahhit aradı aramadı, kağıt yine orada, ben burada duruyorum, Nusret'in fayansı yerinde, ${kiraci} kirayı yine gününde yatırdı, ${tail}."`,
        choices: [
          first,
          { label: 'SATILIK kağıdını sök',
            outcomes: [
              { chance: 0.7,
                result: `Kağıt tek hamlede gelir, bant izi kalır. Nebahat Teyze ilk kez sesli güler. "Böreği al evladım, Nusret de böyle sökerdi, apartman toplantısı ilanını, yönetici kızardı, o gülerdi, kırk yıl o bant izi kaldı kapıda, şimdi senin izin var, kiracı kapıya hiç kağıt yapıştırmadı, cumartesi gelirsin, ${bag ? 'poşet iki kat' : 'tepsi senin'}." Kağıt cebinde, numara dörde katlı.`,
                effects: { rel: { nebahat: 2 }, energy: 15, fact: 'nebahat_kaldi', ...ks } },
              { chance: 0.3,
                result: `Kağıt gelir; karşı kaldırımdaki gri Egea'nın camı iner, telefon kalkar: müteahhidin saha elemanı Cengiz, fotoğraf. Yarım saat sonra uygulama: "Üçüncü taraf bildirimi: mülk üzerinde izinsiz işlem 📋 Puanınız güncellendi." Nebahat Teyze içeri girer, folyoyla döner. "Böreği al evladım, çeksin, Nusret bu kapıyı yetmiş dokuzda boyadı, iki kat yağlı boya, altı kahverengi üstü krem, kırk yıldır bu kapıya kim ne yapıştırdıysa söküldü, kiracının etiketi de sökülür, bu da sökülür, börek kalır."`,
                effects: { rel: { nebahat: 2 }, rating: -0.2, energy: 15, fact: 'nebahat_kaldi', ...ks } }
            ] }
        ]
      };
    }
  });
})();
