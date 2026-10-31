/* =====================================================================
   OLAYLAR (RANDOM EVENTS)
   ---------------------------------------------------------------------
   Her olay:
   {
     id:        'benzersiz_kimlik',
     title:     'EKRAN BAŞLIĞI',
     stage:     'Restoranda' | 'Yolda' | 'Apartmanda' | 'Kapıda',   (sadece görünüm)
     text:      'Oyuncuya okunan durum',
     weight:    1,                       // seçilme ağırlığı (isteğe bağlı, varsayılan 1)
     minDay:    1,                       // bu günden önce çıkmaz (isteğe bağlı)
     weather:   ['rain','snow'],         // sadece bu havalarda çıkar (isteğe bağlı)
     tags:      ['derby'],               // sadece bu etiketli haber olan günlerde çıkar (isteğe bağlı)
     priority:  true,                    // şart sağlanınca şans aranmaz, kesin çıkar (isteğe bağlı)
     condition: (S, order) => true,      // ek şart (isteğe bağlı)
     choices: [                          // 2 (ya da daha fazla) seçenek
       {
         label:   'Buton yazısı',
         // A) Kesin sonuç:
         result:  'Olanları anlatan metin',
         effects: { ... },
         // B) Şanslı sonuç (result/effects yerine):
         outcomes: [
           { chance:0.7, result:'...', effects:{...} },
           { chance:0.3, result:'...', effects:{...} }
         ]
       }
     ]
   }
   effects alanları (hepsi isteğe bağlı):
     tip:        +₺ sabit bahşiş            tipPct: ücretin yüzdesi kadar bahşiş (0.2 = %20)
     money:      +/- ₺ (ceza, ödül)          rating: +/- yıldız (ör. 0.2, -0.5)
     feeLost:    true → sipariş ücreti ödenmez
     complaint:  true → "müşteri şikayeti" (ek -0.3 yıldız, kabul puanı düşer, şikayet sayacı +1)
     goalPrice:  çarpan, hedef fiyatını oynatır (ör. 1.05)  — absürt satirik etkiler için
     breakNext:  true → sonraki sipariş yerine mola verilir
     streakReset:true → yorgunluk sayacı sıfırlanır
     skipDelivery: true → teslimat sonuç ekranı atlanır (ör. paket yok oldu)
   ===================================================================== */
const EVENTS = [
  {
    id: 'dev_kopek',
    title: 'BAHÇEDE DEV BİR KÖPEK',
    stage: 'Kapıda',
    reviews: { good:['Köpeğimi sevdi ya, o an karar verdim. Rex de 5 veriyor. ⭐⭐⭐⭐⭐'], bad:['Paketi bahçeye fırlattı. Köpeğim çorba içti. Bir daha asla. ⭐'] },
    text: 'Kapıya 10 metre var. Aranızda bir Kangal duruyor. Kuyruğunu mu sallıyor, dişini mi gösteriyor, karanlıkta anlaşılmıyor.',
    weight: 1,
    choices: [
      { label: '🐶 Köpeği sev',
        result: 'Köpek anında uysallaştı, hatta sana kapıya kadar eşlik etti. Müşteri "Rex normalde kimseyi sevmez" deyip bahşiş bıraktı.',
        effects: { tip: 60, rating: 0.2 } },
      { label: '🏃 Paketi bahçeye fırlat ve kaç',
        result: 'Paket çimlere düştü, çorbanın kapağı açıldı. Köpek çorbayı yedi. Müşteri uygulamadan şikayet etti: "Kurye paketi fırlattı, köpeğim de şişti."',
        effects: { tip: 0, rating: -0.5, complaint: true } }
    ]
  },
  {
    id: 'kapi_acilmiyor',
    title: 'KAPI AÇILMIYOR',
    stage: 'Kapıda',
    text: 'Zili üç kez çaldın. Telefon "meşgul". İçeriden dizi sesi geliyor. Uygulama "Teslimat süresi aşılıyor" diye kırmızı yanıp sönüyor.',
    weight: 1,
    choices: [
      { label: '⏳ Bekle, bir kez daha ara',
        outcomes: [
          { chance: 0.6, result: 'Dördüncü aramada açtı. "Kulaklık takmıştım, pardon." Pardon kısmı bahşiş olarak gelmedi ama puan verdi.', effects: { rating: 0.1 } },
          { chance: 0.4, result: '10 dakika bekledin, kimse açmadı. Sonraki siparişin iptal oldu. Algoritma seni "yavaş" olarak işaretledi.', effects: { money: -30, rating: -0.1 } }
        ] },
      { label: '🚪 Kapının önüne bırak, fotoğrafla, git',
        outcomes: [
          { chance: 0.7, result: 'Fotoğrafı yükledin, "teslim edildi" damgası düştü. Müşteri 20 dakika sonra "Teşekkürler, görmüşüm" yazdı.', effects: { tipPct: 0.1 } },
          { chance: 0.3, result: 'Komşu paketi aldı. Müşteri "siparişim gelmedi" dedi. Platform ücreti senden kesti. Komşu doydu.', effects: { feeLost: true, complaint: true } }
        ] }
    ]
  },

  /* --- Sistem olayı: enerji bitiyor (mola mekaniği) --- */
  {
    id: 'enerji_bitiyor',
    title: 'ENERJİN BİTİYOR',
    stage: 'Yolda',
    priority: true,
    condition: (S) => S.energy < CONFIG.energyLow && !S.breakNext,
    reviews: { bad:['{item} eksik geldi. Kurye "restoran öyle verdi" dedi. Restoran "kurye öyle götürdü" dedi. Ben açım. ⭐'] },
    build: (o, S) => {
      const food = o.lines.slice().sort((x,y)=>y.price-x.price)[0].name.replace(/\s*\(.*?\)/,'');
      return {
        text: `Enerjin ${S.energy}. Gözün kararıyor, elin titriyor, çantadan ${food.toLowerCase()} kokusu geliyor. Uygulama tam bu anda "Harika gidiyorsun! 🎉" bildirimi attı.`,
        choices: [
          { label: `🍽️ Siparişten biraz ye`, outcomes: [
            { chance: 0.7, result: `Bir iki lokma ${food.toLowerCase()}. "Kimse anlamaz" dedin, kimse anlamadı. Hayat bir anlığına güzel.`, effects: { energy: CONFIG.eatEnergy } },
            { chance: 0.3, result: `Müşteri anladı. Gerçekten anladı. "${food} eksik, paket açılmış." Şikayet, iade, utanç. Ama tok utanç.`, effects: { energy: CONFIG.eatEnergy, complaint: true, rating: -0.6, feeLost: true } } ] },
          { label: '☕ Sonraki turu atla, mola ver', result: 'Bu teslimattan sonra çay molası. Bir tur gidecek, kabul oranı "mola" diye bir şey tanımıyor. Sen tanıyorsun.', effects: { breakNext: true } },
          { label: '😤 Dişini sık, devam', result: 'Devam ettin. Enerji aynı, risk büyüdü. Bundan sonraki her kötü ihtimal biraz daha ihtimal.', effects: {} }
        ]
      };
    }
  },
  {
    id: 'bayildin',
    title: 'BAYILDIN',
    stage: 'Yolda',
    priority: true,
    condition: (S) => S.energy <= 0,
    reviews: { bad:['Kurye kapıda yere oturdu. Su verdim. Yemeği ben taşıdım içeri. Puan yemeğe. ⭐⭐'] },
    text: 'Kaldırıma oturdun. Sonra yattın. Bir amca "iyi misin evladım" dedi, bir teyze su uzattı, bir çocuk fotoğraf çekti. Uygulama "teslimat gecikiyor" dedi.',
    choices: [
      { label: '🥯 Simit ye, 10 dakika otur', result: 'Simit, su, 10 dakika. Dünya yavaş yavaş geri geldi. Müşteri "neredesin" yazdı, "yerdeyim" yazdın, anlamadı.', effects: { money: -40, energy: 35, rating: -0.2 } },
      { label: '🚑 Devam etmeye çalış', outcomes: [
        { chance: 0.5, result: 'Kalktın, bindin, gittin. Nasıl, bilmiyorsun. Teslim ettin, kapıda tekrar oturdun. Müşteri su verdi.', effects: { energy: 20, rating: -0.1 } },
        { chance: 0.5, result: 'Kalkamadın. Ambulans geldi, serum taktı, 600 ₺ fatura kesti. "Sigortan yok mu?" Yok. "İş ortağı" misin? Evet.', effects: { money: -600, feeLost: true, energy: 50 } } ] }
    ]
  },

  /* --- Hava olayları --- */
  {
    id: 'yagmur_viraj',
    title: 'YAĞMURDA KAYGAN VİRAJ',
    stage: 'Yolda',
    weather: ['rain'],
    km: [4, 99],
    weight: 2,
    text: 'Asfalt ayna gibi. Önündeki taksi aniden durdu. Fren mi, gaz mı?',
    choices: [
      { label: '🛑 Fren, yavaşla',
        result: 'Yavaşladın, geç kaldın. Müşteri "neredesin?" diye 4 mesaj attı. Hayattasın ama puanın değil.',
        effects: { rating: -0.2 } },
      { label: '💨 Gaz, aradan sıyrıl',
        outcomes: [
          { chance: 0.6, result: 'Sıyrıldın. Taksici küfretti, sen gülümsedin. Erken teslim, bahşiş.', effects: { tipPct: 0.2 } },
          { chance: 0.4, result: 'Motor kaydı, paket uçtu, sen de uçtun. Kimse ölmedi. Pizza öldü. Ayna 350 ₺.', effects: { money: -350, feeLost: true, rating: -0.3 } }
        ] }
    ]
  },
  {
    id: 'kar_yokus',
    title: 'MOTOR YOKUŞU ÇIKMIYOR',
    stage: 'Yolda',
    weather: ['snow'],
    weight: 2,
    text: 'Kar 20 santim. Motor üçüncü denemede de yokuşun yarısında kaldı. Müşteri en tepedeki apartmanda. Telefonda "kar yağıyor, acele etsene" yazıyor.',
    choices: [
      { label: '🚶 Motoru bırak, paketle yürü',
        result: '15 dakika yürüdün. Kapıda kar adamı gibi belirdin. Müşteri önce güldü, sonra utandı, sonra bahşiş verdi.',
        effects: { tip: 80, rating: 0.1 } },
      { label: '🏍️ Yokuşu zorla',
        outcomes: [
          { chance: 0.5, result: 'Çıktın! Arkadan alkışlayan bir amca vardı. Lastik yarı yarıya gitti ama bu başka günün sorunu.', effects: { tipPct: 0.15 } },
          { chance: 0.5, result: 'Motor yan yattı, sen kara gömüldün, dondurma karda daha hızlı eridi. Nasıl, bilinmiyor.', effects: { feeLost: true, rating: -0.2, money: -120 } }
        ] }
    ]
  },

  /* --- HAFIZA OLAYLARI (Papers, Please) ---
     build(order, S) → { text, choices }. Sipariş fişindeki detayı sorar; fiş artık ekranda değil.
     Yardımcılar: memChoices(doğru, [yanlışlar], doğruSonuç, yanlışSonuç) karıştırılmış seçenek listesi üretir. */
  {
    id: 'guvenlik_daire',
    title: 'SİTE GÜVENLİĞİ',
    stage: 'Apartmanda',
    reviews: { bad:['Site güvenliğine daire numarasını bilmiyorum demiş. Nasıl bilmezsin, uygulamada yazıyor. ⭐⭐'] },
    weight: 2,
    build: (o) => ({
      text: `Kulübedeki güvenlik camı araladı: "Hangi daireye?" Telefonun çantanın dibinde, uygulamayı açmak 2 dakika. Adam bekliyor. Kaşları da bekliyor.`,
      choices: memChoices(
        `Daire ${o.apt}`, decoyNums(o.apt, 1, 24).map(n=>`Daire ${n}`),
        { result:'"Buyrun." Kapı açıldı. Güvenlik bir an sana saygıyla baktı. Ya da öyle sandın.', effects:{ rating:0.1 } },
        { result:'"Öyle bir sipariş yok." Telefonu çıkardın, 3 dakika aradın, doğru daireyi söyledin. Güvenlik "başta söyleseydin" dedi. Müşteri soğuk pizza yedi.', effects:{ rating:-0.3 } }
      )
    })
  },
  {
    id: 'guvenlik_misafir',
    title: 'SİTE GÜVENLİĞİ: "KİMİN MİSAFİRİSİN?"',
    stage: 'Apartmanda',
    weight: 3,
    condition: (S, o) => o.noteKey === 'guest',
    build: (o) => ({
      text: `Güvenlik: "Kurye almıyoruz, site kuralı. Misafirsen başka." Müşteri notta ne demişti? Bir isim vardı.`,
      choices: memChoices(
        `${o.noteValue}'in misafiriyim`, ['Ahmet Bey','Nurten Hanım','Kemal Bey','Sevgi Hanım'].filter(x=>x!==o.noteValue).slice(0,2).map(x=>`${x}'in misafiriyim`),
        { result:'Güvenlik hiç sormadan bariyeri açtı. Sistem çalışıyor. Hangi sistem, belli değil.', effects:{ tipPct:0.1 } },
        { result:'"Öyle biri yok burada." Siteye giremedin. Müşteri aşağı indi, paketi kapıdan aldı, "zahmet oldu bana" dedi.', effects:{ rating:-0.4, complaint:true } }
      )
    })
  },
  {
    id: 'kapi_kac_kere',
    title: 'KAPININ ÖNÜNDESİN',
    stage: 'Kapıda',
    reviews: { good:['Notumu okuyan ilk kurye. Doğru sayıda çaldı. Ağlayacağım. ⭐⭐⭐⭐⭐'], bad:['Kapıyı 3 kere çal dedik, yanlış çaldı. Okumuyorlar hocam, okumuyorlar. ⭐⭐'] },
    weight: 3,
    condition: (S, o) => o.noteKey === 'knock',
    build: (o) => ({
      text: `Zil bozuk. Müşteri notta kapıyı kaç kere çalmanı söylemişti? Bir sayı vardı, bir de "değil" vardı.`,
      choices: memChoices(
        `${o.noteValue} kere çal`, [2,3,4].filter(n=>n!==o.noteValue).map(n=>`${n} kere çal`),
        { result:'Kapı anında açıldı. "Nihayet talimat okuyan bir kurye." Bahşiş.', effects:{ tip:50, rating:0.2 } },
        { result:'Kapı açıldı ama suratla. "Notu okumadınız mı?" Teslim ettin, puan düştü, komşunun köpeği havladı.', effects:{ rating:-0.3 } }
      )
    })
  },
  {
    id: 'kapi_kime',
    title: '"KİME GELDİ?"',
    stage: 'Kapıda',
    reviews: { bad:['Kapıda adımı bilmiyordu. Fişte yazıyor. Okumak bedava. ⭐⭐'] },
    weight: 2,
    build: (o) => ({
      text: `Kapıyı pijamalı bir adam açtı. "Kime geldi bu?" Evde 4 kişi yaşıyor, hepsi sipariş vermiş olabilir. Fişte bir isim vardı.`,
      choices: memChoices(
        o.customer, decoyNames(o.customer),
        { result:'"Benim!" Paketi kaptı, kapıyı kapattı. Teşekkür bile etmedi ama doğruydu.', effects:{ tipPct:0.1 } },
        { result:'"Burada öyle biri yok." Kapı kapandı. Tekrar çaldın, "haa, o kız" dedi. 4 dakika kaybettin, güven de kaybettin.', effects:{ rating:-0.2 } }
      )
    })
  },
  {
    id: 'para_ustu',
    title: 'PARA ÜSTÜ',
    stage: 'Kapıda',
    reviews: { good:['Para üstünü kuruşu kuruşuna verdi. Saydım, doğru. Bir daha saydım, yine doğru. ⭐⭐⭐⭐⭐'], bad:['Para üstünü yanlış verdi, sonra "abi tamam" dedi. Tamam değil. ⭐'] },
    weight: 4,
    condition: (S, o) => o.payment === 'nakit',
    build: (o) => {
      const paid = Math.ceil(o.total/500)*500 + (Math.random()<0.5?500:0);
      const change = paid - o.total;
      return {
        text: `Müşteri ${fmt(paid)} uzattı. "Üstü kalsın demiyorum." Sipariş tutarı neydi? Hesap sende.`,
        choices: memChoices(
          `${fmt(change)} üstü ver`, decoyNums(change, 0, paid, 10).map(n=>`${fmt(n)} üstü ver`),
          { result:'Kuruşu kuruşuna. Müşteri saydı, saydı, bir daha saydı. "Tamam" dedi. Bu iltifat.', effects:{ rating:0.1 } },
          { result:'Yanlış verdin. Fazlaysa cebinden gitti, eksikse müşteri "dolandırıcı" diye yorum yazdı. İkisi de oldu gibi hissettin.', effects:{ money:-Math.min(300, Math.round(change*0.5)+40), rating:-0.3 } }
        )
      };
    }
  },

  /* --- MOTOR ARIZASI (aşınma %50 üstünde çıkabilir, %100'de kesin) --- */
  {
    id: 'motor_ariza',
    title: 'MOTOR ÖKSÜRDÜ',
    stage: 'Yolda',
    condition: (S) => wear() >= 50 && (wear() >= 100 || Math.random() < (wear()/100) * (wear()/100)),
    priority: true,
    reviews: { bad:['Kurye motoru iterek geldi. Terli, geç, ama geldi. Yemek soğuktu, hikaye sıcaktı. ⭐⭐'] },
    build: (o, S) => ({
      text: `Motor önce öksürdü, sonra sustu. ${wear() >= 100 ? 'Bu sürpriz değildi. Aşınma %100 yazıyordu, sen "bir tur daha" dedin.' : `Aşınma %${wear()}. Gösterge aylardır sarıydı, sen renk körü gibi davrandın.`} Müşteri ${o.km} km ötede.`,
      choices: [
        { label: '🦵 Tekmele, tekrar çalıştır', outcomes: [
          { chance: 0.55, result: 'Üçüncü tekmede çalıştı. Nasıl, bilmiyorsun. Motor da bilmiyor. İkiniz de sormuyorsunuz.', effects: { wearAdd: 5 } },
          { chance: 0.45, result: 'Çalışmadı. Çekici çağırdın. Çekici ustası "bunu kim satmış sana" dedi. Mirastı. Paket iade.', effects: { money: -CONFIG.towCost, feeLost: true, rating: -0.2, wearSet: 40 } } ] },
        { label: '🔧 Yolda bir usta bul, acil tamir', result: 'Köşedeki tamirci "Cemil Usta" bujiyi değiştirdi, 250 ₺ aldı, "esas bakım lazım buna" dedi. Haklı. Herkes haklı, kimse ödemiyor.', effects: { money: -250, rating: -0.1, wearSet: 35 } }
      ]
    })
  },
  /* --- RAKİP KURYE: Hızlı Ferhat (S.ferhat karşılaşma, S.ferhatYield yol verme sayısı) --- */
  {
    id: 'hizli_ferhat',
    title: 'HIZLI FERHAT',
    stage: 'Yolda',
    weight: 2,
    reviews: { good:['İki kurye aynı anda geldi, bizimki önce kapıyı çaldı. Yarışı seviyorum. ⭐⭐⭐⭐⭐'] },
    build: (o, S) => {
      const n = S.ferhat || 0, y = S.ferhatYield || 0;
      if(n >= 3 && y >= 2) return {
        text: `Hızlı Ferhat yanına yanaştı, bu kez gaz vermeden. "Hep yol verdin bana. Dinle: ${o.hood} tarafına giderken şu arka sokaktan gir, 6 dakika kazanırsın. Kimseye söyleme." Söyledi, gitti.`,
        choices: [
          { label: '🗺️ Arka sokağı dene', result: 'Sokak gerçekten vardı. 6 dakika erken kapıdaydın. Müşteri "siz hep böyle hızlı mısınız" dedi. Hayır. Ferhat öyle.', effects: { tipPct: 0.25, rating: 0.2, ferhat: 'yield' } },
          { label: '🤨 Güvenme, bildiğin yoldan git', result: 'Bildiğin yoldan gittin. Normal vardın. Ferhat\'ın sokağını hiç öğrenemeyeceksin. Belki de yoktu.', effects: { ferhat: 'race' } }
        ]
      };
      if(n >= 3 && y === 0) return {
        text: `Hızlı Ferhat seni gördü, gülmedi. "Üç kere yarıştın benimle, üçünde de kabalık ettin." Önüne kırdı, aynı restorana sen varmadan girdi. Senin paketi aldı mı?`,
        choices: [
          { label: '🏃 Restorana koş, paketini iste', outcomes: [
            { chance: 0.5, result: 'Yetiştin. Paket tezgahtaydı, Ferhat yoktu. Garson "arkadaşın mı" dedi. Değil.', effects: { ferhat: 'race' } },
            { chance: 0.5, result: 'Paketin gitmişti. Ferhat "yanlışlıkla" almış. Platform ücreti sana ödemedi, müşteri yine de yedi.', effects: { feeLost: true, ferhat: 'race' } } ] },
          { label: '😮‍💨 Boş ver, Ferhat kazandı', result: 'Boş verdin. Sonraki paket için 8 dakika bekledin. Ferhat kapıdan çıkarken selam verdi. Nazikçe. Daha kötü.', effects: { rating: -0.1, ferhat: 'yield' } }
        ]
      };
      return {
        text: `${n === 0 ? 'Yanına bir motor yanaştı. Kask siyah, çanta mavi, yüz tanıdık değil. "Hızlı Ferhat derler, aynı yere gidiyoruz galiba."' : `Hızlı Ferhat yine yanında. ${n}. karşılaşma. "Yine mi sen?" Evet, yine sen.`} Işık kırmızı. Yeşil yanınca ne olacak, ikiniz de biliyorsunuz.`,
        choices: [
          { label: '🏁 Yarış', outcomes: [
            { chance: 0.5, result: 'Yeşilde sen çıktın, virajda sen döndün, kapıyı sen çaldın. Ferhat arkadan "iyiydin" dedi. Motor bu yarışı sevmedi.', effects: { tipPct: 0.15, rating: 0.1, wearAdd: 8, ferhat: 'race' } },
            { chance: 0.5, result: 'Ferhat çıktı, sen çıkamadın. Bir de kaldırıma sürttün. Ayna çizildi, gurur çizildi, paket sağlam.', effects: { money: -60, wearAdd: 10, ferhat: 'race' } } ] },
          { label: '🫡 Yol ver', result: 'Yol verdin. Ferhat şaşırdı, başını salladı, gitti. Bir dakika geç kaldın. Belki bir gün bunun karşılığı olur. Belki de Ferhat seni hatırlamaz bile.', effects: { ferhat: 'yield' } }
        ]
      };
    }
  },

  /* --- TEKRARLAYAN KARAKTERLER ---
     Kapıcı Hayri Abi: tavrı puanına göre değişir, seni hatırlar (S.hayri = karşılaşma sayısı).
     Komşu Nebahat Teyze: sana acır, börek ya da para verir (S.nebahat = yakınlık). */
  {
    id: 'kapici_hayri',
    title: 'KAPICI HAYRİ ABİ',
    stage: 'Apartmanda',
    weight: 2,
    build: (o, S) => {
      const n = S.hayri || 0;
      const greet = n === 0 ? 'Kapıcı dairesinden bir kafa uzandı: "Hayri ben. Burada ben varım, asansör var, kural var."' :
                    n < 3 ? `Hayri Abi seni tanıdı. "Yine sen, ${S.name}. ${n+1}. geliş."` : `Hayri Abi seni gördü, gözlerini kıstı. "${S.name}, ${n+1} kere geldin, bir kere çay içmedin."`;
      // 4. karşılaşmadan sonra, puanın iyiyse Hayri Abi arada hediye verir (eski ama sağlam bir eşya)
      if(n >= 3 && S.rating >= 4.0 && Math.random() < 0.5) return {
        text: `${greet} Sonra kapıcı dairesine girdi, bir poşetle çıktı. "Bizim oğlandan kaldı. Sana olur. Reddetme, ayıp olur."`,
        choices: [
          { label: '🎁 Al, teşekkür et', result: 'Aldın. Hayri Abi "giy bakayım" dedi, giydin, "oldu" dedi. Oldu. Bu apartmanda artık bir yerin var.', effects: { giftItem: true, hayri: 1, rating: 0.1 } },
          { label: '🙏 "Olmaz Hayri Abi, oğlunun"', result: '"Oğlan Almanya\'da, lazım değil." Poşeti yine de uzatmadı, geri koydu. Kırıldı mı, belli değil. Hayri Abi\'de hiçbir şey belli değil.', effects: { hayri: 1 } }
        ]
      };
      if(S.rating >= 4.2) return {
        text: `${greet} Puanını duymuş. "Diyorlar ki sen iyi kuryeymişsin. Gel, asansörü tuttum, kapıya kadar çıkarır seni."`,
        choices: [
          { label: '🛗 Asansöre bin, teşekkür et', result: 'Hayri Abi düğmeye bastı, yolda hava durumunu anlattı. 3. katta "bizim oğlan da kuryeydi" dedi, sustu. Kapıda müşteri bekliyordu, bahşiş hazırdı.', effects: { tipPct: 0.15, rating: 0.1, hayri: 1 } },
          { label: '☕ "Bir çay içelim Hayri Abi"', outcomes: [
            { chance: 0.6, result: 'Çay ince belli bardakta, şeker iki. Hayri Abi anlattı, sen dinledin. Müşteri 10 dakika bekledi ama "kapıcıyla çay içen kuryeye kızılmaz" dedi.', effects: { rating: 0.1, hayri: 2, streakReset: true } },
            { chance: 0.4, result: 'Çay bir oldu, iki oldu. Müşteri aşağı indi, kapıcı dairesinde kuryesini buldu. "Siz burada mısınız?" Evet, buradaydınız.', effects: { rating: -0.3, hayri: 2 } } ] }
        ]
      };
      if(S.rating < 3.5) return {
        text: `${greet} Kaşları çatık. "Kurye asansöre binmez. Kural. Hem senin puanını da gördüm, yürü."`,
        choices: [
          { label: '🚶 Yürü (Kat ' + o.floor + ')', result: `${o.floor} kat yürüdün. ${o.floor > 4 ? 'Nefes nefese kapıyı çaldın, müşteri "koşarak mı geldiniz" dedi. Evet.' : 'Çok değildi ama prensip meselesiydi. Prensip kaybetti.'}`, effects: { rating: -0.1, hayri: 1 } },
          { label: '🗣️ "Abi ben de insanım"', outcomes: [
            { chance: 0.4, result: 'Hayri Abi durdu, baktı, "haklısın" dedi. Asansörü çağırdı. Bir daha olmayacak ama bu seferlik oldu.', effects: { rating: 0.1, hayri: 1 } },
            { chance: 0.6, result: 'Hayri Abi yönetimi aradı. Yönetim platformu aradı. Platform seni aradı. "Kapıcıyla tartışma" diye bir madde varmış.', effects: { complaint: true, hayri: 1 } } ] }
        ]
      };
      return {
        text: `${greet} Sana baktı, çantaya baktı. "Bu saatte ${o.lines[0].name.toLowerCase()} mi? Kat ${o.floor}. Asansör bozuk değil ama yavaş. Senin gibi."`,
        choices: [
          { label: '🙂 "Sağ ol Hayri Abi"', result: 'Hayri Abi başını salladı. Bu, Hayri Abi dilinde "tamam" demek. İlişki ilerliyor. Yavaş. Asansör gibi.', effects: { hayri: 1 } },
          { label: '😐 Hiçbir şey deme, geç', result: 'Geçtin. Hayri Abi arkandan "selam da vermiyorlar" dedi. Duydun. Duymazdan geldin. O da bunu duydu.', effects: { hayri: 1, rating: -0.05 } }
        ]
      };
    }
  },
  {
    id: 'komsu_nebahat',
    title: 'KOMŞU NEBAHAT TEYZE',
    stage: 'Apartmanda',
    weight: 1,
    build: (o, S) => {
      const n = S.nebahat || 0;
      if(n === 0) return {
        text: 'Yan kapı aralandı. Terlikli, önlüklü bir teyze başını uzattı. "Evladım, kurye misin sen? Yüzün sapsarı olmuş. Dur, bir dakika bekle."',
        choices: [
          { label: '🫓 Bekle', result: 'Folyoya sarılı sıcak börek uzattı. "Bütün gün bir şey yemediğini yüzünden anladım." Haklıydı. Bugünkü yemek parası cepte kaldı, enerjin de yerine geldi.', effects: { expense: -60, energy: 20, nebahat: 1, rating: 0.05 } },
          { label: '🏃 "Acelem var teyze, sağ olun"', result: '"Sizin hep aceleniz var." Kapı kapandı. Börek kokusu merdivende kaldı. Sen de bir saniye orada kaldın.', effects: { nebahat: 0 } }
        ]
      };
      if(n < 3) return {
        text: `Nebahat Teyze kapıyı açtı, seni görünce güldü. "Sarı yüzlü ${S.name}! Gel, gel." Bu ${n+1}. karşılaşmanız. Elinde bir poşet var.`,
        choices: [
          { label: '🍲 Poşeti al', result: 'Poşette kuru fasulye, pilav, bir de "torunuma almıştım, kalmış" dediği bir çikolata. Torunu yok. Sen de biliyorsun, o da biliyor. İkiniz de bir şey demiyorsunuz.', effects: { expense: -120, energy: 25, nebahat: 1 } },
          { label: '💬 İki laf et, poşeti alma', result: '"Almıyorsun demek." Biraz kırıldı ama gülümsedi. Rahmetli eşini anlattı: o da kuryeymiş, 1974\'te, at arabasıyla. Sen dinledin. Müşteri bekledi.', effects: { nebahat: 1, rating: 0.1 } }
        ]
      };
      return {
        text: 'Nebahat Teyze seni bekliyormuş. "Gel oğlum, gel." Avucuna katlanmış bir kağıt sıkıştırdı: 200 lira. "Hayır deme. Emekli maaşımdan değil, kiracıdan geldi."',
        choices: [
          { label: '🙏 Al, elini öp', result: 'Aldın, elini öptün. "Motora dikkat et" dedi. Herkes der. Nebahat Teyze dediğinde farklı oluyor.', effects: { money: 200, nebahat: 1, rating: 0.05 } },
          { label: '🚫 "Olmaz teyze, almam"', result: '"Alırsın." Parayı çantanın ön cebine koydu, fermuarı çekti. Konu kapandı. Nebahat Teyze\'yle tartışılmaz, bunu bütün apartman bilir.', effects: { money: 200, nebahat: 1 } }
        ]
      };
    }
  },

  /* --- Gece / hafta sonu olayları (tags:['night'] gece tarifesinde, ['weekend'] hafta sonu) --- */
  {
    id: 'rakili_musteri',
    title: '"KARDEŞİM SEN DE OTUR"',
    stage: 'Kapıda',
    reviews: { good:['Oturdu, dinledi, gitti. Adam gibi adam. Kardeşim benim. ⭐⭐⭐⭐⭐'], bad:['Kurye evimde uyuyakaldı. Ben de uyudum. Sabah ikimiz de şaşırdık. ⭐⭐'] },
    tags: ['night'],
    weight: 2,
    text: 'Kapıyı açan adamın üstünde havlu, elinde rakı kadehi, arkasında Müslüm Gürses. "Kardeşim yoruldun, otur iki dakika." Teslimat süresi akıyor.',
    choices: [
      { label: '🥃 İki dakika otur',
        outcomes: [
          { chance: 0.6, result: 'İki dakika 25 dakika oldu. Boşanmasını, kayınpederini ve 1998 Galatasaray kadrosunu dinledin. Cebine 200 ₺ sıkıştırdı. "Sana değil, hayata."', effects: { tip: 200, rating: 0.2 } },
          { chance: 0.4, result: 'Oturdun. Adam uyuyakaldı. Sonraki siparişin iptal oldu, uygulama seni "yanıt vermiyor" diye işaretledi.', effects: { money: -60, rating: -0.2 } }
        ] },
      { label: '🙏 "Sağ olun abi, sipariş var"',
        result: '"Haklısın, çalış çalış." Kapıyı kapattı, Müslüm devam etti. Bahşiş yok ama saygı var. Saygı, dükkanda geçmiyor.',
        effects: { tipPct: 0.05 } }
    ]
  },
  {
    id: 'kedi_konseyi',
    title: 'MERDİVENDE KEDİ KONSEYİ',
    stage: 'Apartmanda',
    tags: ['night'],
    weight: 1,
    text: 'Üçüncü kat sahanlığında yedi kedi oturuyor. Yedisi de sana bakıyor. Elinde kokoreç kokusu yayan bir çanta.',
    choices: [
      { label: '🐈 Bir parça ekmek ucu at, geç',
        result: 'Kediler ikna oldu, sen geçtin. Gramaj %2 eksildi, kimse fark etmedi. Kediler artık seni tanıyor. Bu iyi mi, belli değil.',
        effects: { rating: 0.1 } },
      { label: '🚶 Aradan sıyrıl',
        outcomes: [
          { chance: 0.7, result: 'Sıyrıldın. Biri bacağına sürtündü, biri tısladı. Demokrasi.', effects: {} },
          { chance: 0.3, result: 'Turuncu olan çantaya atladı. Çanta düştü, şalgam açıldı, merdiven mor oldu. Kapıcı seni suçladı.', effects: { money: -80, rating: -0.2 } }
        ] }
    ]
  },
  {
    id: 'dugun_konvoyu',
    title: 'DÜĞÜN KONVOYU',
    stage: 'Yolda',
    tags: ['weekend'],
    weight: 2,
    text: 'Yolu bir düğün konvoyu kesmiş. On iki araba, bir davul, bir Doblo. Korna ritmik. Kimse kıpırdamıyor.',
    choices: [
      { label: '🥁 Konvoyun arasına gir, korna çal',
        outcomes: [
          { chance: 0.65, result: 'Damadın amcası camdan uzandı, yakana 200 ₺ taktı. "Kurye de bizim çocuk." Bir dakika da dans ettin.', effects: { money: 200, rating: 0.1 } },
          { chance: 0.35, result: 'Davulcu tokmağı çantaya denk getirdi. Pasta yamuldu. Müşteri fotoğrafı yükledi: "Bu ne?"', effects: { feeLost: true, rating: -0.3 } }
        ] },
      { label: '↩️ Arka sokaktan dolan',
        result: 'Üç sokak dolandın, biri çıkmazdı. 12 dakika geç kaldın. Müşteri "neredesin" yazdı, "düğün" dedin, "ne düğünü" dedi.',
        effects: { rating: -0.1 } }
    ]
  },

  // ↓↓↓ Yeni olayları buraya ekle. Boş şablonlar dosyanın sonunda (EVENT_TEMPLATES). ↓↓↓
];

