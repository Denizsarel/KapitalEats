/* ---------------- KUZEN MUSTİ — «AİLE» ----------------
   Gültepe, Kağıthane. Musti: halan Gülten'in oğlu, Mustafa K.; aynı mahalle, aynı paspasın altındaki yedek anahtar.
   5 beat, hepsi mode 'phone': sabah bülteninde SMS kartı. `text` = yalnızca Musti'nin mesajları (küçük harf,
   noktalama yok, her mesaj ayrı satır; .sms kutusu pre-line). Anlatıcı cümleleri seçeneklerin `result`ında
   (.result-box) yaşar; kart motorun bugünkü renderArcCard'ıyla olduğu gibi çalışır, ek destek gerekmez.
   Tırnak: «…» ekrandaki yazı (SMS, uygulama, yorum); "…" konuşulan söz (Gülten Hala).
   Bayraklar (A.flags): lent, paid, split, vanished, vanishedDay, shared, oneNight, gifted, burned.
   Facts (başka içerik requires/forbids ile okuyabilir; motorun bir şey yapması şart değil):
          'musti_gone' (B2: Antalya'ya kaçar, 5 gün yok), 'musti_shared' (B3), 'musti_rival' (B4: kendi hesabı),
          'musti_family' (final, ödül), 'musti_burned' (final, soğuk; 65-endings.js «kuzen bi sn» için bakar).
   Final: paid || split || shared → 1.500 ₺ geri + keepsake 'musti_id' (Yeni Hesap bedava);
          rel('musti') < 0 → Bİ SN (köprü yanar); aksi → SIKINTI YOK (kimlik duruyor, fiyatı var).
   Ulaşılabilirlik (her sonuç ayrı yol, 168): AİLE 156 · Bİ SN 7 · SIKINTI YOK 5; AİLE dışı 9 seçim dizisinin 3ü nötr
   (anahtar/benzin → Musti ödesin → hesabı verme → bol şans ya da puanını sor), 6sı Bİ SN.
   Şema: docs/CONTENT_CONTRACT.md */
(function () {
  const sms = (...lines) => lines.join('\n');
  const lcName = (S) => String(S.name || 'kuzen').toLocaleLowerCase('tr-TR');
  // META.owned sözleşmenin okunur listesinde yok; korumalı okunur, yalnızca B1'in ilk satırını değiştirir.
  const ownsCousinRent = () => typeof META !== 'undefined' && Array.isArray(META.owned) && META.owned.includes('side_cousin');
  const rating1 = (S) => (Math.round(S.rating * 10) / 10).toFixed(1).replace('.', ',');

  /* ---- 1. MOTOR (Gün 3) — bir gecelik motor; %50 +300 ₺, %50 aşınma +15 ---- */
  ARC_BEATS.push({
    arc: 'musti', step: 1, startDay: 3, dueGap: 3, mode: 'phone',
    hook: "Kuzen Musti yazmış: motoru bir gece istiyor, Çağlayan'da düğün varmış.",
    hookShort: "Musti'nin mesajı",
    build: (o, S, A) => ({
      title: 'MOTOR',
      text: sms(ownsCousinRent() ? 'kuzen motor bu gece bende kalsın' : 'kuzen motor bi gece lazım',
                'çağlayanda düğün var sabaha karşı bırakırım valla',
                'benzini de doldururum',
                'annem selam söyledi baklava yaptı sana ayırdı foto attım',
                'tepsinin kenarına yazmış bu da senin görüyosun dimi'),
      choices: [
        { label: 'Anahtarı bırak',
          outcomes: [
            { chance: 0.5,
              result: `«motor kapıda kuzen anahtar paspasın altında depo full damat askerlik arkadaşım motor gelin arabasının önünde gitti parayı düğün sahibi verdi» Sabah 06.10. Paspasın altında anahtar ve bir zarf: üç yüz lira, hepsi ellilik, biri bantlı. Depo gerçekten dolu.`,
              effects: { money: 300, rel: { musti: 1 }, sets: { lent: true } } },
            { chance: 0.5,
              result: `«motor kapıda kuzen sağ ayna biraz oynuyo düğünde biri çarpmış halledicez» Sabah 06.40. Sağ ayna sallanır, ön çamurluk çizik, depo çeyrek. Selede düğünden kalan tek şey: beyaz bir mendil, köşesinde pembe iplikle ESRA & SERKAN.`,
              effects: { wearAdd: 15, rel: { musti: 1 }, sets: { lent: true } } }
          ] },
        { label: 'Benzin parasını peşin iste',
          result: `«tamam kuzen hak veriyorum atıyorum» İki dakikada 200 ₺ IBAN'a düşer, açıklama: BENZIN KUZEN. Motor sabah 06.30'da kapıda, depo yarım, aynalar yerinde. Baklava fotoğrafı mesajın altında durur; tepsi gelmez.`,
          effects: { money: 200, sets: { lent: true } } },
        { label: 'Reddet',
          result: `«tamam kuzen anladım sıkıntı yok» İki mavi tik. Bir saat sonra bir mesaj daha: «annem kırıldı ama ben bi şey demedim valla» Baklava fotoğrafı sohbetten gitmiş; yerinde gri bir satır: Bu mesaj silindi.`,
          effects: { rel: { musti: -1 }, sets: { lent: false } } }
      ]
    })
  });

  /* ---- 2. CEZA (Gün 6) — 1.200 ₺ kırmızı ışık, senin plaka; öde / Musti ödesin (5 gün kayıp) / yarı yarıya ---- */
  ARC_BEATS.push({
    arc: 'musti', step: 2, dueGap: 3, mode: 'phone',
    hook: "Senin plakaya bir ceza kesilmiş: Kağıthane Cad., 02.41. Musti sabah yazar.",
    hookShort: 'Plakadaki ceza',
    build: (o, S, A) => {
      const third = A.flags.lent
        ? 'kağıt anneme gelmiş o yüzden biliyorum'
        : 'yedek anahtar paspasın altındaydı ya onu bi ben biliyorum sanıyodum';
      const night = A.flags.lent ? 'düğün gecesi' : "o saatte Gültepe'de uyuyordun";
      const edev = `e-Devlet'te tebligat: Kağıthane Cad., 02.41, kırmızı ışık, 1.200 ₺; ${night}. Fotoğrafta motorun, selede sırtı dönük biri, kaskı yok, kolunda damat kurdelesi.`;
      return {
        title: 'CEZA',
        text: sms('kuzen bi ceza gelmiş senin plakaya 1200',
                  'ya ben de yoktum o gece valla',
                  third,
                  'e devlette foto var ya o ben değilim benzer çok',
                  'halledicez bi sn'),
        choices: [
          { label: 'Cezayı öde',
            result: `${edev} 1.200 ₺ e-Devlet'ten gider; dekont PDF, saat 08.31. «kuzen sen bi tanesin valla ilk işte geri veririm» Akşam Nuri Bey'in binasının kapısında bir tencere, kapağında koli bandı ve keçeli kalem: ETLİ KURU FASULYE. ÖDÜNÇ DEĞİL. Gülten Hala'nın yazısı.`,
            effects: { money: -1200, rel: { musti: 2 }, sets: { paid: true }, expense: -60 } },
          { label: 'Musti ödesin',
            result: `${edev} «tamam kuzen hallederim» Akşam tebligat hâlâ ÖDENMEDİ; Musti'nin profil fotoğrafı gitmiş, son görülme kapalı. Gülten Hala telefonda: "Antalya'ya gitti, sezonluk, otelde yatacak. Numarası da değişti." Ceza e-Devlet'te bekler, faizi işler.`,
            effects: { sets: { vanished: true, vanishedDay: S.day }, fact: 'musti_gone' } },
          { label: 'Yarısını öde',
            result: `${edev} «tamam kuzen 600 600 adil valla» 1.200 ₺ e-Devlet'ten gider; akşam 600 ₺ IBAN'a düşer, açıklama: CEZA YARI. Hemen altında ikinci bir işlem, 50 ₺: KAHVE KUZEN. Gülten Hala'dan dört saniyelik bir sesli mesaj: "Mustafa'yı kırma."`,
            effects: { money: -550, rel: { musti: 1 }, sets: { split: true } } }
        ]
      };
    }
  });

  /* ---- 3. HESAP (Gün 9; kaybolduysa dönüşünden sonra) — gece vardiyaları için hesabını ister, gecesi 600 ---- */
  ARC_BEATS.push({
    arc: 'musti', step: 3, dueGap: 3, mode: 'phone',
    gate: (S, A) => !A.flags.vanishedDay || S.day >= A.flags.vanishedDay + 5,
    hook: 'Sabah bir mesaj: gece vardiyası için hesabını isteyen var, gecesi 600.',
    hookShort: 'Hesap paylaşımı',
    build: (o, S, A) => {
      const f = A.flags;
      const ask = 'hesabını geceleri bana versene 3 gece 600 veririm gecesine ilk geceyi peşin';
      const msgs = f.vanished
        ? sms('kuzen ben geldim', 'antalya kötüydü otel sezonu kapattı', 'ceza ödendi valla bak e devlete', 'bi şey diyecem kızma', ask, 'gündüz sen gece ben halledicez')
        : f.paid
          ? sms('kuzen bi şey diyecem kızma', ask, 'gündüz sen gece ben halledicez', 'cezayı da unutmadım bu paradan öderim valla', 'puanına bi şey olmaz dikkatliyim ben')
          : sms('kuzen bi şey diyecem kızma', ask, 'gündüz sen gece ben halledicez', 'puanına bi şey olmaz dikkatliyim ben', 'annem de tamam diyo');
      const edev = f.vanished ? "e-Devlet'te ceza: ÖDENDİ. Ödeyen: GÜLTEN K. " : '';
      return {
        title: 'HESAP',
        text: msgs,
        choices: [
          { label: 'Hesabı ver',
            result: `${edev}Uygulamada Kullanım Koşulları, madde 4/a: «Hesabınız size özeldir, paylaşılamaz 🔒» Kapatırsın, şifreyi yazarsın; iki mavi tik. 600 ₺ IBAN'a düşer, açıklama: GECE 1. «sen yat kuzen sabah hesap sende» Gece 23.05'te bildirim: «Hesabınıza yeni bir cihazdan giriş yapıldı 📱 Güvenliğiniz bizim için önemli.» Cihaz: Redmi Note 9, ekranı çatlak, Musti'nin.`,
            effects: { money: 600, rel: { musti: 1 }, sets: { shared: true }, fact: 'musti_shared' } },
          { label: 'Sadece bir gece',
            outcomes: [
              { chance: 0.7,
                result: `${edev}«bi gece de olur kuzen sağ ol valla» 600 ₺ düşer: GECE. Sabah 05.50'de hesap sende: on bir teslimat, hepsi Kağıthane, puan yerinde. Çantanın ön cebinde buruşuk 180 ₺ ve Musti'nin yazısıyla bir not: bahşiş senin hesap senin.`,
                effects: { money: 780, rel: { musti: 1 }, sets: { shared: true, oneNight: true }, fact: 'musti_shared' } },
              { chance: 0.3,
                result: `${edev}«bi gece de olur kuzen sağ ol valla» 600 ₺ düşer: GECE. Sabah 05.50'de hesap sende: dokuz teslimat ve bir yorum: «Kurye kendini Mustafa diye tanıttı, fişte başka isim yazıyor, çorba ılıktı.» Destek: «Geri bildiriminiz için teşekkürler 💙»`,
                effects: { money: 600, complaint: true, sets: { shared: true, oneNight: true }, fact: 'musti_shared' } }
            ] },
          { label: 'Hesabı verme',
            result: `${edev}«tamam kuzen haklısın sıkıntı yok» Üç dakika «yazıyor…», silinir, yazılır: «çağlayanda bi çocuk var hesap kiralıyo gecesi 400 ona gidiyorum» Akşam Cendere Caddesi'nde ışıkta yanında bir motor durur; sürücünün sırtında KapitalEats çantası, kaskı yok, çantanın etiketinde başka birinin adı.`,
            effects: { rel: { musti: -1 }, sets: { shared: false } } }
        ]
      };
    }
  });

  /* ---- 4. RAKİP (Gün 12) — Musti'nin kendi hesabı; Gültepe'yi ister (fact musti_rival) ---- */
  ARC_BEATS.push({
    arc: 'musti', step: 4, dueGap: 3, mode: 'phone',
    hook: "Musti kendi hesabını açmış; sabah yazacak. Gültepe'yi istiyor.",
    hookShort: 'Musti rakip',
    build: (o, S, A) => {
      const f = A.flags;
      if (f.shared && !f.oneNight) return {
        title: 'RAKİP',
        text: sms('kuzen 3 gece bitti hesap sende şifreye dokunma bi gece daha lazım olabilir',
                  '23 teslimat 2si ataşehir çok uzaktı ya',
                  'kendi hesabımı açtım iş ortağı mustafa k oldum',
                  'artık rakibiz haha bugün gültepe benim sen çağlayana bak',
                  'kalan 1200ü bugün atıyorum valla'),
        choices: [
          { label: 'Kalan parayı iste',
            outcomes: [
              { chance: 0.45,
                result: `«atıyorum kuzen bi sn» 1.200 ₺ IBAN'a düşer, açıklama: GECE 2 3 SAGOL. Uygulamada üç gecenin özeti: 23 teslimat, şikayet yok, puan yerinde. Ataşehir'deki iki paket Musti'nin kendi motoruyla gitmiş, benzini kendinden.`,
                effects: { money: 1200, rel: { musti: 1 }, fact: 'musti_rival' } },
              { chance: 0.35,
                result: `«atıyorum kuzen bi sn» 1.200 ₺ düşer. Uygulamada bir yorum: «Kurye fişteki isim değil, Mustafa diye tanıştı, paket ılıktı.» Destek: «Hesap güvenliğiniz bizim için önemli 💙»`,
                effects: { money: 1200, complaint: true, fact: 'musti_rival' } },
              { chance: 0.2,
                result: `«kuzen bi geceyi platform iptal etti tek gece atıyorum 600 kalanı yok» 600 ₺ düşer. Uygulamada bir şikayet ve bir uyarı: «Hesabınızda olağan dışı giriş tespit edildi. İş Ortağı Sözleşmesi madde 9 hatırlatılır 🔒» Musti: «madde 9 ne kuzen»`,
                effects: { money: 600, complaint: true, rating: -0.2, fact: 'musti_rival' } }
            ] },
          { label: 'Parayı ona bırak',
            result: `«kuzen ciddi misin» «valla mı» «tamam ben de sana bi şey yapıcam bekle» Uygulamada üç gecenin özeti: 23 teslimat, şikayet yok, puan yerinde. Öğlen Talatpaşa yokuşunda sarı kasklı bir motor seni geçer, selesinde sıfır bir çanta, etiketi hâlâ üstünde.`,
            effects: { rel: { musti: 3 }, sets: { gifted: true }, fact: 'musti_rival' } },
          { label: 'Şifreyi değiştir',
            result: `Şifreyi değiştirirsin; iki dakika sonra: «kuzen çıkış yaptı beni anladım tamam» Kalan 1.200 gelmez, öğlen gelmez, akşam 400'ü gelir: «bu kadar vardı valla kalanı ilk haftadan» Uygulamada üç gece: 23 teslimat, şikayet yok, puan yerinde.`,
            effects: { money: 400, rel: { musti: -1 }, fact: 'musti_rival' } }
        ]
      };
      const msgs = f.oneNight
        ? sms('kuzen o gece iyi geçti ya alıştım', 'kendi hesabımı açtım bugün ilk gün puan verdiler bile', 'iş ortağı mustafa k oldum haha', 'gültepe benim sen çağlayana bak')
        : sms('kuzen kendi hesabımı açtım', 'annem 500 verdi başlangıç için kask aldım sarı', 'iş ortağı mustafa k oldum haha', 'gültepe benim sen çağlayana bak', 'kızmadın dimi');
      return {
        title: 'RAKİP',
        text: msgs,
        choices: [
          { label: 'Bol şans yaz',
            result: `«sağ ol kuzen valla» Öğlen Cendere Caddesi'nde ışıkta yan yana durursunuz: sarı kask, sıfır çanta, selede bezle bağlı bir sefertası, Gülten Hala'nın. Telefonun titrer, yan şeritten: «sen önden geç kuzen ben yavaşım daha» Yeşil yanar; gerçekten yavaş, aynaya bakarak çıkar.`,
            effects: { rel: { musti: 1 }, fact: 'musti_rival' } },
          { label: 'Gültepe benim, yaz',
            result: `«tamam kuzen çağlayana bakarım kızma» Öğlen uygulama: «Bölgenizde yeni İş Ortakları var! Hızınızı artırın ⚡» Musti sözünü tutar; akşam Talatpaşa'da sarı kask yok.`,
            effects: { rel: { musti: -1 }, fact: 'musti_rival' } },
          { label: 'Puanını sor',
            result: `«4,6 kuzen ilk gün herkese veriyolar sonra düşüyo dediler» Altında ekran görüntüsü: KapitalEats · İş Ortağı: Mustafa K. · 4,6; profil fotoğrafında sarı kask. Seninki ${rating1(S)}. Akşam Musti: «sedef teyze seni sordu kuzen sen daha iyiymişsin ben poşeti sallıyomuşum»`,
            effects: { rating: 0.1, fact: 'musti_rival' } }
        ]
      };
    }
  });

  /* ---- 5. FİNAL (Gün 15) — ödül: 1.500 ₺ + kimlik; soğuk: «kuzen bi sn»; nötr: kimlik duruyor, fiyatı var ---- */
  ARC_BEATS.push({
    arc: 'musti', step: 5, dueGap: 0, mode: 'phone', final: true,
    hook: "Musti sabah yazacak. Gülten Hala'nın çekmecesinde bir kimlik var, Musti'nin.",
    hookShort: 'Musti ile hesap',
    build: (o, S, A) => {
      const f = A.flags;
      const name = lcName(S);

      /* A) Ödül: ceza ödendi ya da hesap paylaşıldı — 1.500 ₺ geri, kimlik senin */
      if (f.paid || f.split || f.shared) {
        const why = f.gifted ? '1200 senin 300 de faiz haha'
          : f.paid ? 'ceza için ve tencere için annem öyle diyo'
          : f.split ? 'yarısını sen ödedin yarısını annem ben de hepsini geri veriyorum'
          : 'geceler için ve güvendin diye';
        const foto = `1.500 ₺ hesapta, açıklama: AILE. Altında fotoğraf: T.C. kimlik kartı, MUSTAFA K., doğum tarihi seninkinden üç ay sonra; sarı kask yok, saç var, sırıtıyor.`;
        const pot = f.paid
          ? 'tencere: bu kez içinde yaprak sarma, kapağında yeni yazı: BU DA SENİN.'
          : 'bir tencere, kapağında koli bandı ve keçeli kalem: YAPRAK SARMA. BU DA SENİN.';
        const warm = f.paid ? 3 : 2; // cezayı cebinden ödeyen bir adım daha yakın biter
        const ks = { keepsake: 'musti_id', money: 1500, fact: 'musti_family' };
        return {
          title: 'AİLE',
          text: sms('kuzen 1500 attım bak hesabına',
                    why,
                    'bi de kimliğimin fotosunu atıyorum aslı annemin çekmecesinde',
                    'kuryeler diyo hesap kapanırsa başka kimlik lazım oluyomuş',
                    'lazım olursa senin kuzen sormadan al',
                    'halledicez her zaman'),
          choices: [
            { label: 'Kimliği sakla',
              result: `${foto} Fotoğraf galeride, AİLE adlı yeni bir klasörde, tek başına. «sağ ol ${name} valla bi gün lazım olur inşallah olmaz» Akşam Nuri Bey'in kapısında ${pot}`,
              effects: { ...ks, rel: { musti: warm }, expense: -60 } },
            { label: 'Parayı geri yolla',
              result: `${foto} 1.500 ₺ geri gider, açıklama: GEREK YOK. Üç saniyede geri gelir: ISRAR. Bir daha gider; bu kez 1.200 gelir: ANNEM KIZAR FAIZ BENDE. Banka günlük limiti hatırlatır, Musti hatırlatmaz; son işlem onun. Kimlik fotoğrafı galeride durur.`,
              effects: { ...ks, money: 1200, rel: { musti: 3 } } },
            { label: 'Çaya çağır',
              result: `${foto} «geliyorum kuzen bi sn» Bi sn kırk dakika sürer. Çınar Kıraathanesi; iki çay, bir tavla, Musti'nin sarı kaskı masada. Kimliğin aslını tavlanın yanına koyar, telefonuna eğilir; masada senin ekranın yanar: «sende dursun annem öyle istiyo fotokopisi bende» Çayı o öder; tavlayı sen alırsın, ilk kez.`,
              effects: { ...ks, rel: { musti: warm }, energy: -5 } }
          ]
        };
      }

      /* B) Soğuk: ilişki sıfırın altında — tek mesaj, köprü yanar */
      if (rel('musti') < 0) {
        const prof = 'Profil fotoğrafı değişmiş: Konyaaltı, sırtı dönük biri, sarı kask, arkada kepenkleri inik bir otel.';
        return {
          title: 'Bİ SN',
          text: sms('kuzen bi sn'),
          choices: [
            { label: 'Bekle',
              result: `Altında «yazıyor…» on dakika yanar, söner; yarım saat, öğlen, bir daha yanmaz. ${prof} Akşam Gülten Hala Nuri Bey'in kapısında, elinde boş poşet: "Mustafa seni sordu. Ben bir şey demedim." Kimliğin aslı çekmecede kalır; çekmecenin anahtarı Musti'de.`,
              effects: { sets: { burned: true }, fact: 'musti_burned' } },
            { label: 'Aynısını yaz',
              result: `«bi sn» İki gri tik; mavi olmaz. ${prof} Öğlen Çağlayan'da ışıkta sarı bir kask yanından geçer, dönüp bakmaz. Akşam Gülten Hala'nın perdesi çekili, ışığı yanık.`,
              effects: { sets: { burned: true }, rel: { musti: -1 }, fact: 'musti_burned' } }
          ]
        };
      }

      /* C) Nötr: ne ceza ne gece, ama küs de değil — kimlik duruyor, fiyatı var */
      const prof = "Profil fotoğrafı yeni: sarı kask, Talatpaşa yokuşu, arkada Gültepe'nin çatıları.";
      return {
        title: 'SIKINTI YOK',
        text: sms('kuzen sıkıntı yok aramızda dimi',
                  'kimlik duruyo lazım olursa yazarsın 500 falan hallederiz',
                  'annem selam söyledi'),
        choices: [
          { label: 'Selam söyle',
            result: `«söylerim kuzen» ${prof} Akşam kapıda Gülten Hala, elinde tencere, kapağında yazı yok: "Bu da senin. Yazmadım, okursun." Musti'nin kimliği çekmecede, çekmece açık; fiyatı Musti'nin mesajında, 500 falan.`,
            effects: { rel: { musti: 1 }, expense: -60 } },
          { label: 'Cevap yazma',
            result: `Mesaj okundu, iki mavi tik, cevap yok. ${prof} Akşam Talatpaşa'da sarı kask yanından geçer; korna bir kere, kısa. Gülten Hala'nın penceresi açık.`,
            effects: { rel: { musti: -1 } } }
        ]
      };
    }
  });
})();
