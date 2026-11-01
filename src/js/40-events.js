/* =====================================================================
   OLAYLAR (RANDOM EVENTS)
   ---------------------------------------------------------------------
   Şema, etkiler, ağız kartları ve biçim kuralları: docs/CONTENT_CONTRACT.md
   { id, title, stage, text | build(o,S)→{text,choices}, weight, minDay, weather:[], tags:[], km:[min,max],
     priority, condition(S,o), reviews:{good:[],bad:[]}, requires:[], forbids:[], choices:[…] }
   Seçenek: { label, result, effects } ya da { label, outcomes:[{chance, result, effects}] }.
   Hafıza olayları build() içinde memChoices(doğru, [yanlışlar], iyiSonuç, kötüSonuç) kullanır.
   Tekrarlayan karakterler (Hayri Abi, Nebahat Teyze, Ferhat) olay hatırlar, sayı saymaz: hasFact()/rel().
   ===================================================================== */
const EVENTS = [
  {
    id: 'dev_kopek',
    title: 'BAHÇEDE KANGAL',
    stage: 'Kapıda',
    reviews: { good:["Rex'i sevdi, Rex onu sevdi, ikisi birden kapıya geldi. Rex de beş veriyor. ⭐⭐⭐⭐⭐"], bad:['Paketi bahçeye fırlattı, köpeğim mercimek çorbası içti, şu an uyuyor. Bir daha asla. ⭐'] },
    text: 'Bahçe kapısıyla daire kapısı arasında on metre çakıl, çakılın ortasında bir Kangal. Tasması yok, kuyruğu yavaş sallanıyor, dişleri kapalı; sokak lambası bahçeye değil karşı kaldırıma vuruyor. Çanta kokuyor, Kangal bunu senden önce fark etti.',
    weight: 1,
    choices: [
      { label: 'Köpeği sev',
        result: 'Elini uzatırsın; Kangal burnunu avucuna dayar, sonra önden yürüyüp kapıya kadar eşlik eder. Müşteri aralıktan bakar: "Rex sizi sevdi mi? Rex Nurten Hanım\'ı bile sevmez." Bahşiş kapı aralığından gelir, kuyruk arkandan sallanır.',
        effects: { tip: 60, rating: 0.2 } },
      { label: 'Paketi bahçeye at, kaç',
        result: 'Paket çakıla düşer, çorbanın kapağı açılır; Rex önce çorbaya, sonra sana bakar. Müşteri uygulamadan yazar: "Kurye paketi fırlattı, köpeğim mercimek içti, şu an uyuyor." Şikayet düşer, Rex uyur.',
        effects: { tip: 0, rating: -0.5, complaint: true } }
    ]
  },
  {
    id: 'kapi_acilmiyor',
    title: 'KAPI AÇILMIYOR',
    stage: 'Kapıda',
    reviews: { good:['Kapıyı duymadım, kurye bekledi, bir daha aradı. Sabırlı insan. ⭐⭐⭐⭐⭐'], bad:['Paketi paspasa bırakmış, fotoğraftaki paspas benim değil. Komşu yedi herhalde. ⭐'] },
    text: 'Zili üç kez çalarsın; telefon meşgul veriyor, kapının arkasından Kızılcık Şerbeti\'nin jeneriği geliyor. Uygulamanın üst şeridi kırmızı yanıp sönüyor: "Teslimat süresi aşılıyor." Paspasta HOŞ GELDİNİZ yazıyor, harfleri aşınmış.',
    weight: 1,
    choices: [
      { label: 'Bekle, tekrar ara',
        outcomes: [
          { chance: 0.6, result: 'Dördüncü aramada kapı açılır, kulağında kulaklık: "Pardon ya, Kızılcık\'ta tam o sahneydi." Pardon bahşişe dönüşmez, puana dönüşür; kapı kapanır, içeride dizi kaldığı yerden devam eder.', effects: { rating: 0.1 } },
          { chance: 0.4, result: 'On dakika paspasın üstünde beklersin; kapı açılmaz, telefon meşgul. Sıradaki siparişin iptale düşer, uygulama bunun adını koyar: "Kurye yanıt hızı: düşük." İçeride dizi reklama girer.', effects: { money: -30, rating: -0.1 } }
        ] },
      { label: 'Kapıya bırak, fotoğrafla',
        outcomes: [
          { chance: 0.7, result: 'Paketi paspasa koyar, fotoğrafı yüklersin; "Teslim edildi" damgası düşer. Yirmi dakika sonra müşteriden mesaj: "Teşekkürler, görmüşüm, kulaklık takmıştım." Bahşiş düğmesine de basmış.', effects: { tipPct: 0.1 } },
          { chance: 0.3, result: 'Karşı dairenin kapısı aralanır, paket içeri çekilir. Müşteri yarım saat sonra yazar: "Siparişim gelmedi, fotoğraftaki paspas benim değil." Platform ücreti keser; karşı daire o akşam lahmacun yer.', effects: { feeLost: true, complaint: true } }
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
    reviews: { bad:['{item} eksik geldi. Kurye "restoran öyle verdi" diyor, restoran "kurye öyle götürdü" diyor. Ben açım. ⭐'] },
    build: (o, S) => {
      const food = o.lines.slice().sort((x,y)=>y.price-x.price)[0].name.replace(/\s*\(.*?\)/,'');
      return {
        text: `Enerji ${S.energy}. Gidon elinde titriyor, gözünün önünde siyah benekler dolaşıyor, çantadan ${food.toLocaleLowerCase('tr-TR')} kokusu yükseliyor. Telefon tam bu saniye titrer: "Harika gidiyorsunuz! Bugün bölgenizin en hızlı iş ortaklarından birisiniz 🎉"`,
        choices: [
          { label: 'Siparişten biraz ye', outcomes: [
            { chance: 0.7, result: `Bir köşeye çeker, poşetin bandını açarsın: iki lokma ${food.toLocaleLowerCase('tr-TR')}, sonra üçüncü. Bandı yeniden yapıştırırsın; kapıda müşteri poşete değil telefonuna bakar: "Sağ olun, iyi akşamlar."`, effects: { energy: CONFIG.eatEnergy } },
            { chance: 0.3, result: `İki lokma ${food.toLocaleLowerCase('tr-TR')}; bant eski yerine oturmaz. Kapıda müşteri poşeti tartar gibi kaldırır: "Bu açılmış. ${food} eksik." Şikayet, iade, kapanan kapı. Midende iki lokma; kapının ardında kilit sesi.`, effects: { energy: CONFIG.eatEnergy, complaint: true, rating: -0.6, feeLost: true } } ] },
          { label: 'Sonraki turu mola yap', result: 'Bu teslimattan sonra çay ocağı: ince belli bardak, iki şeker, bir simit. Bir tur gider; çay ocağının taburesi boş, bardak tabağında bekliyor.', effects: { breakNext: true } },
          { label: 'Dişini sık, sür', result: 'Sürersin. Enerji aynı, benekler aynı; bundan sonra her kötü ihtimal zarına bir yüz daha ekler. Telefon yine titrer: "Siz bir efsanesiniz 💙"', effects: {} }
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
    reviews: { bad:['Kurye kapımda yere oturdu, su verdim, yemeği içeri ben taşıdım. Puan yemeğe. ⭐⭐'] },
    text: 'Kaldırıma oturursun, sonra yatarsın. Üstüne eğilen ilk yüz Bakkal Necmi\'nin: "İyi misin evladım?" Çırağı bir şişe su uzatır, üst kattan bir ilkokul çocuğu telefonunu yatay tutup çeker. Uygulama kendi işine bakar: "Teslimat gecikiyor ⏱️"',
    choices: [
      { label: 'Simit ye, on dakika otur', result: 'Simit, su, Necmi\'nin taburesi. On dakikada kaldırım yerine oturur, dünya yavaş yavaş hizaya gelir. Müşteri yazar: "Neredesiniz?" "Yerdeyim." "Hangi yer?" Necmi simidi deftere yazmaz, sen ödersin.', effects: { money: -40, energy: 35, rating: -0.2 } },
      { label: 'Kalk, sürmeyi dene', outcomes: [
        { chance: 0.5, result: 'Kalkarsın, binersin, sürersin; nasıl olduğunu sonra da çıkaramazsın. Kapıda paketi uzatır, aynı kapının eşiğine oturursun. Müşteri su getirir, bir de kesme şeker: "Annem böyle yapardı."', effects: { energy: 20, rating: -0.1 } },
        { chance: 0.5, result: 'Kalkamazsın. Ambulans on iki dakikada gelir, serum takılır, fatura kesilir: 600 ₺. Sağlıkçı sorar: "Sigortan yok mu?" "İş ortağıyım." Serum damlar.', effects: { money: -600, feeLost: true, energy: 50 } } ] }
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
    reviews: { good:['Bu yağmurda bu kadar çabuk geldi, pizza sıcaktı. Kurye sırılsıklamdı, pizza değil. ⭐⭐⭐⭐⭐'], bad:['Pizza taksinin altından çıkmış gibi geldi. Çıkmış da zaten. ⭐'] },
    text: 'Asfalt ayna gibi; virajın dibinde su birikmiş. Önündeki sarı taksi fren lambası yanmadan durur; aranızda altı metre, lastiklerin altında yağmur. Fren mi, gaz mı?',
    choices: [
      { label: 'Fren, yavaşla',
        result: 'Frene dokunursun, arka lastik bir an kayıp toparlar; taksinin iki metre gerisinde durursun. Dört dakika geç kalırsın; müşteri dört mesaj atar, dördü aynı: "Neredesiniz?"',
        effects: { rating: -0.2 } },
      { label: 'Gaz, aradan sıyrıl',
        outcomes: [
          { chance: 0.6, result: 'Taksinin solundan sıyrılırsın; aynada taksici camı indirip bir şeyler söyler, yağmur götürür. Kapıya erken varırsın, paket sıcak, müşteri kapıda: "Bu havada bu kadar çabuk, buyurun."', effects: { tipPct: 0.2 } },
          { chance: 0.4, result: 'Arka lastik kararını verir: motor yan yatar, sen asfaltta beş metre kayarsın, pizza kutusu taksinin altından çıkar. Taksici iner: "Oğlum iyi misin?" Sen iyisin, pizza değil. Ayna 350 ₺.', effects: { money: -350, feeLost: true, rating: -0.3 } }
        ] }
    ]
  },
  {
    id: 'kar_yokus',
    title: 'MOTOR YOKUŞU ÇIKMIYOR',
    stage: 'Yolda',
    weather: ['snow'],
    weight: 2,
    reviews: { good:['Karda yürüyerek geldi, kaşları beyaz. Çay içirdim, bahşiş verdim, hâlâ utanıyorum. ⭐⭐⭐⭐⭐'], bad:['Dondurma yokuştan aşağı kaymış, balkondan izledim. Komedi gibiydi, acıkmıştım ama. ⭐⭐'] },
    text: 'Kar yirmi santim, yokuş Nuhkuyusu kadar dik. Motor üçüncü denemede de yarı yolda kalır, arka lastik yerinde döner. Müşteri tepedeki apartmanda, mesaj yazıyor: "Kar yağıyor, biraz acele etseniz?"',
    choices: [
      { label: 'Motoru bırak, yürü',
        result: 'Motoru bir Doblo\'nun arkasına kilitler, paketle on beş dakika yürürsün. Kapıda kaşların, omuzların, çantan beyaz. Müşteri önce güler, sonra kızarır, sonra cüzdanına uzanır: "Vallahi yürüyeceğinizi düşünmedim."',
        effects: { tip: 80, rating: 0.1 } },
      { label: 'Yokuşu zorla',
        outcomes: [
          { chance: 0.5, result: 'Gazı sonuna kadar açar, ayaklarını yere sürterek çıkarsın. Tepede tüpçünün çırağı alkışlar, bir elinde tüp. Arka lastiğin yarısı yokuşta kaldı; o başka günün hesabı.', effects: { tipPct: 0.15 } },
          { chance: 0.5, result: 'Motor yan yatar, sen kara gömülürsün, dondurma kutusu yokuştan aşağı kayıp bir Egea\'nın altında durur. Debriyaj kolu eğilir: 120 ₺. Müşteri balkondan yazar: "Dondurma geldi mi diye sormuyorum bile."', effects: { feeLost: true, rating: -0.2, money: -120 } }
        ] }
    ]
  },

  /* --- HAFIZA OLAYLARI (Papers, Please) ---
     build(order, S) → { text, choices }. Sipariş fişindeki detayı sorar; fiş artık ekranda değil.
     memChoices(doğru, [yanlışlar], doğruSonuç, yanlışSonuç) karıştırılmış seçenek listesi üretir. */
  {
    id: 'guvenlik_daire',
    title: 'SİTE GÜVENLİĞİ',
    stage: 'Apartmanda',
    reviews: { good:['Güvenliğe daire numarasını sormadan söyledi, bariyer anında açıldı. {item} sıcak. ⭐⭐⭐⭐⭐'], bad:['Site güvenliğine daire numarasını bilmiyorum demiş. Uygulamada yazıyor, okumak bedava. ⭐⭐'] },
    weight: 2,
    build: (o) => { const dish = o.lines[0].name.replace(/\s*\(.*?\)/,'').toLocaleLowerCase('tr-TR'); return {
      text: `Kulübedeki güvenlik camı iki parmak aralar; önünde çay, üstünde Sisteme Kayıt Zorunludur kağıdı. "Hangi daireye?" Telefon çantanın dibinde, uygulamayı açmak iki dakika. Adam bekliyor, kaşları da bekliyor, çay soğuyor.`,
      choices: memChoices(
        `Daire ${o.apt}`, decoyNums(o.apt, 1, 24).map(n=>`Daire ${n}`),
        { result:'"Buyrun." Bariyer kalkar; güvenlik çayını alır, bir an sana doğru kaldırır gibi yapar, sonra içer. Asansör zemin katta seni bekliyor, kapısı açık.', effects:{ rating:0.1 } },
        { result:`"Öyle bir sipariş yok." Telefonu çıkarır, çantanın dibinden üç dakikada bulur, doğru daireyi söylersin. Güvenlik defterine yazarken mırıldanır: "Başta söyleseydin." Yukarıda ${dish} ılık, müşteri kapıda.`, effects:{ rating:-0.3 } }
      )
    }; }
  },
  {
    id: 'guvenlik_misafir',
    title: 'SİTE GÜVENLİĞİ: "KİMİN MİSAFİRİSİN?"',
    stage: 'Apartmanda',
    reviews: { good:['Güvenliğe misafirim demiş, güvenlik sormamış bile. Bizim siteye kurye sokmak sanat. ⭐⭐⭐⭐⭐'], bad:['Kurye siteye giremedi, ben aşağı indim, paketi bariyerden aldım. Dışarıda yedim resmen. ⭐⭐'] },
    weight: 3,
    condition: (S, o) => o.noteKey === 'guest',
    build: (o) => {
      // İyelik eki ünlü uyumuna göre: Ahmet Bey'in, Nurten Hanım'ın, Hüsnü Bey'in
      const gen = n => { const w = String(n).toLocaleLowerCase('tr-TR'); const v = (w.match(/[aeıioöuü](?=[^aeıioöuü]*$)/)||['i'])[0]; const s = 'aı'.includes(v)?'ı':'ou'.includes(v)?'u':'öü'.includes(v)?'ü':'i'; return "'" + (/[aeıioöuü]$/.test(w) ? 'n' : '') + s + 'n'; };
      return {
      text: `Güvenlik kulübeden çıkar, telsizi belinde: "Kurye almıyoruz, site kuralı. Misafirsen başka." Müşterinin notunda bir isim vardı; fiş restoranda kaldı, isim senin aklında kaldıysa kaldı.`,
      choices: memChoices(
        `${o.noteValue}${gen(o.noteValue)} misafiriyim`, ['Ahmet Bey','Nurten Hanım','Kemal Bey','Sevgi Hanım'].filter(x=>x!==o.noteValue).slice(0,2).map(x=>`${x}${gen(x)} misafiriyim`),
        { result:'Güvenlik telsize bile uzanmaz, bariyeri açar: "Buyrun, B Blok." Kuralın adı site kuralı; ismin adı anahtar. Asansörde ayna var, yüzünü görürsün, gülüyorsun.', effects:{ tipPct:0.1 } },
        { result:'"Öyle biri yok burada." Bariyer inmez bile, çünkü hiç kalkmadı. Müşteri terlikle aşağı iner, paketi bariyerin üstünden alır: "Zahmet oldu bana." Güvenlik telsize konuşur: "Kurye çıkıyor."', effects:{ rating:-0.2, complaint:true } }
      )
      };
    }
  },
  {
    id: 'kapi_kac_kere',
    title: 'KAPININ ÖNÜNDESİN',
    stage: 'Kapıda',
    reviews: { good:['Notumu okuyan ilk kurye. Doğru sayıda çaldı. Ağlayacağım. ⭐⭐⭐⭐⭐'], bad:['Kapıyı üç kere çal dedik, yanlış çaldı. Okumuyorlar hocam, okumuyorlar. ⭐⭐'] },
    weight: 3,
    condition: (S, o) => o.noteKey === 'knock',
    build: (o) => ({
      text: `Zilin düğmesi yok, yerinde iki tel ve bir parça elektrik bandı. Müşteri notunda kapıyı kaç kere çalacağını yazmıştı; bir sayı vardı, bir de "değil" vardı. Kapının arkasında bir köpek nefes alıyor.`,
      choices: memChoices(
        `${o.noteValue} kere çal`, [2,3,4].filter(n=>n!==o.noteValue).map(n=>`${n} kere çal`),
        { result:'Kapı sen elini çekmeden açılır: "Nihayet talimat okuyan bir kurye. Geçen hafta üçü de yanlış çaldı." Bahşiş hazırmış, köpek de hazırmış, ikisi de elinde.', effects:{ tip:50, rating:0.2 } },
        { result:'Kapı açılır ama yüzle birlikte: "Notu okumadınız mı?" Paketi uzatırsın, köpek havlar, komşunun köpeği cevap verir. Puan iner, merdiven boşluğunda iki köpek birbirine seslenmeye devam eder.', effects:{ rating:-0.3 } }
      )
    })
  },
  {
    id: 'kapi_kime',
    title: '"KİME GELDİ?"',
    stage: 'Kapıda',
    reviews: { good:['Kapıda adımı söyledi, ben söylemedim. İlk defa. ⭐⭐⭐⭐⭐'], bad:['Kapıda adımı bilmiyordu. Fişte yazıyor. Okumak bedava. ⭐⭐'] },
    weight: 2,
    build: (o) => ({
      text: `Kapıyı pijamalı, elinde kumanda, ayağında tek terlik bir adam açar: "Kime geldi bu?" Arkasında koridorda dört çift ayakkabı, dördü farklı numara. Fişte bir isim vardı.`,
      choices: memChoices(
        o.customer, decoyNames(o.customer),
        { result:'"Benim!" Koridorun dibinden bir ses; pijamalı adam paketi alır, arkaya uzatır, kapı kapanır. Teşekkür yok, bahşiş düğmesi var; birisi basmış.', effects:{ tipPct:0.1 } },
        { result:'"Burada öyle biri yok." Kapı kapanır. Tekrar çalarsın; aynı adam, aynı kumanda: "Haa, o kız. Zeynep! Yemeğin!" Dört dakika gider; adam ayakkabılara bakıyor.', effects:{ rating:-0.2 } }
      )
    })
  },
  {
    id: 'para_ustu',
    title: 'PARA ÜSTÜ',
    stage: 'Kapıda',
    reviews: { good:['Para üstünü kuruşu kuruşuna verdi. Saydım, doğru. Bir daha saydım, yine doğru. ⭐⭐⭐⭐⭐'], bad:['Para üstünü yanlış verdi, sonra "abi tamam" diye geçiştirdi. Tamam değil. ⭐'] },
    weight: 4,
    condition: (S, o) => o.payment === 'nakit',
    build: (o) => {
      const paid = Math.ceil(o.total/500)*500 + (Math.random()<0.5?500:0);
      const change = paid - o.total;
      return {
        text: `Müşteri ${fmt(paid)} uzatır, katlanmış, hepsi aynı yüz: "Üstü kalsın demiyorum, karıştırmayın." Sipariş tutarı restorandaki fişte kaldı; hesap sende, cüzdan müşterinin elinde açık bekliyor.`,
        choices: memChoices(
          `${fmt(change)} üstü ver`, decoyNums(change, 0, paid, 10).map(n=>`${fmt(n)} üstü ver`),
          { result:'Kuruşu kuruşuna. Müşteri sayar, bir daha sayar, parmağını ıslatıp üçüncü kez sayar: "Tamam." Bu kapıda "tamam" iltifattır; cüzdan kapanır, kapı kapanır.', effects:{ rating:0.1 } },
          { result:'Yanlış verirsin. Fazlaysa aradaki fark cebinden gider; eksikse müşteri uygulamaya yazar: "Kurye para üstünü eksik verdi, geçen kurye gibi." İkisi aynı anda olmuş gibi hissedersin, cüzdan hâlâ açık.', effects:{ money:-Math.min(300, Math.round(change*0.5)+40), rating:-0.3 } }
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
    reviews: { bad:['Kurye motoru iterek geldi. Terli, geç, ama geldi. Yemek soğuktu, hikâye sıcaktı. ⭐⭐'] },
    build: (o, S) => ({
      text: `Motor önce öksürür, sonra susar; gösterge ışığı yanmaya devam eder. ${wear() >= 100 ? 'Aşınma %100 yazıyordu, sen sabah "bir tur daha" demiştin, motor da bu turu seçti.' : `Aşınma %${wear()}. Gösterge haftalardır sarıydı, sen de sarıyı yeşilin bir tonu saydın.`} Müşteri ${o.km} km ötede, telefon cebinde titriyor.`,
      choices: [
        { label: 'Tekmele, tekrar çalıştır', outcomes: [
          { chance: 0.55, result: 'Üçüncü tekmede çalışır; neden çalıştığını sen de sormazsın, motor da söylemez. Yola devam edersin, gösterge sarı, egzozdan gri bir duman. Müşteri kapıda: "Motor sesi mi o?"', effects: { wearAdd: 5 } },
          { chance: 0.45, result: 'Çalışmaz. Çekici kırk dakikada gelir; şoför motora bakar, sana bakar: "Bunu kim satmış sana?" "Mirastı." "Mirası da bir muayeneden geçirirler." Paket restorana döner, çekici faturayı uzatır.', effects: { money: -CONFIG.towCost, feeLost: true, rating: -0.2, wearSet: 40 } } ] },
        { label: 'Usta bul, acil tamir', result: 'Köşedeki dükkânda Usta Cemil, eli yağlı, gözü motorda: "Ne yaptılar sana kızım? Buji bu, buji. Yağına da bakmamışlar." Bujiyi değiştirir, sana dönmez: "Esas bakım lazım buna. İki yüz elli."', effects: { money: -250, rating: -0.1, wearSet: 35 } }
      ]
    })
  },

  /* --- RAKİP KURYE: Hızlı Ferhat ---
     Sayı saymaz; olay hatırlar: ferhat_saved / ferhat_grudge (42-arcs-ferhat.js) ve rel('ferhat').
     Bandırma'ya gittiyse (ferhat_quit) yolda görünmez. Etkiler eski sürümle bire bir aynı. */
  {
    id: 'hizli_ferhat',
    title: 'HIZLI FERHAT',
    stage: 'Yolda',
    weight: 2,
    forbids: ['ferhat_quit'],
    condition: (S) => ((META.arcs.ferhat || {}).step || 1) > 1,
    reviews: { good:['İki kurye aynı anda geldi, bizimki önce kapıyı çaldı. Yarışı seviyorum. ⭐⭐⭐⭐⭐'], bad:['Kurye başka bir kuryeyle ışıkta yarışmış, bana anlattı. Yemeğim nerede diye sormadım bile. ⭐⭐'] },
    build: (o, S) => {
      const r = rel('ferhat');
      const filo = hasFact('ferhat_contract') ? 'Kuba yerine gri bir PCX, kaportasında FİLO 01. ' : '';
      if((hasFact('ferhat_saved') && r >= 2) || r >= 4) return {
        text: `Ferhat yanaşır, bu kez gaz vermeden; vizör kalkar. ${filo}${hasFact('ferhat_saved') ? '"Asfaltta durdun kanka, o bir dakikayı yazdım."' : '"Yol verdin, yarışmadın, hepsini yazdım kanka."'} "${o.hood} tarafına giderken fırının arkasındaki sokaktan gir, sonra sola. Altı dakika kazanırsın. Ferhat'tan duydun deme." Yeşil yanar, o sağa kırar.`,
        choices: [
          { label: 'Arka sokağı dene', result: `Sokak gerçekten vardır: fırının arkası, bir tekir, bir çöp konteyneri, sola. Kapıya altı dakika erken varırsın; müşteri saate bakar: "Siz hep böyle hızlı mısınız?" Hayır. Ferhat öyle; bugün onun sokağındasın.`, effects: { tipPct: 0.25, rating: 0.2, ferhat: 'yield' } },
          { label: 'Bildiğin yoldan git', result: `Bildiğin yoldan gidersin, bildiğin dakikada varırsın. Fırının arkasındaki sokağı görmezsin; belki yoktur, belki altı dakikayı kafadan atmıştır. Ferhat dakikayla şaka yapmaz, bunu Söğütlüçeşme'deki her kurye bilir.`, effects: { ferhat: 'race' } }
        ]
      };
      if(hasFact('ferhat_grudge') || r <= -2) return {
        text: `Ferhat seni görür, gülmez; vizörü de indirmez. ${filo}${hasFact('ferhat_grudge') ? '"Asfaltta yanımdan geçtin kanka. Yedi dakika yattım, saydım."' : '"Her ışıkta önüme kırdın reis, hepsini yazdım."'} Gaza basar, önüne geçer, restoranın kapısından sen varmadan içeri girer. Tezgâhta iki paket vardı; biri senindi.`,
        choices: [
          { label: 'Restorana koş, paketini iste', outcomes: [
            { chance: 0.5, result: `Yetişirsin. Paket tezgâhta, Ferhat kapıda, kaskı kolunda: "Senin bu, dokunmadım kanka. Bir dakika beklettim, o kadar." Garson ikinize bakar: "Arkadaşınız mı?" Sen cevap vermezsin; Ferhat verir: "Rakip."`, effects: { ferhat: 'race' } },
            { chance: 0.5, result: `Paket gitmiş. Garson omuz silker: "Siyah kasklı aldı, senin diye." Ferhat kuryeler grubuna "yanlışlıkla" yazar, saat ve dakikayla. Platform ücreti sana ödemez; müşteri yemeğini sıcak yer, kuryenin adını sormaz.`, effects: { feeLost: true, ferhat: 'race' } } ] },
          { label: 'Boş ver', result: `Boş verirsin; sıradaki paket için tezgâhın önünde beklersin. Ferhat kapıdan çıkarken elini kaldırır, kibar, acelesiz: "Kolay gelsin reis." Sekizinci dakikada paketin gelir, garson adını yanlış okur.`, effects: { rating: -0.1, ferhat: 'yield' } }
        ]
      };
      return {
        text: `Işık kırmızı. Yanına siyah kask, mavi çanta yanaşır; ${filo || 'sol aynası elektrik bandıyla sarılı bir Kuba. '}Vizör kalkar. ${r > 0 ? `"Yine aynı semt mi kanka? Geçen sefer on bir dakikaydı, bugün dokuz diyorum."` : `"Kanka, ${o.hood} tarafı mı? Buradan on bir dakika, arka sokaktan dokuz."`} Sayaç dörtten geri sayıyor; Ferhat gaz koluna değil sayaca bakıyor.`,
        choices: [
          { label: 'Yarış', outcomes: [
            { chance: 0.5, result: `Yeşilde sen çıkarsın, virajı sen alırsın, kapıyı sen çalarsın. Ferhat merdivenin dibinden seslenir: "Dokuz on. İyiydin kanka, yazdım." Motorun ön freni yolun yarısından beri ötüyor; onu da yazarsın, kafana.`, effects: { tipPct: 0.15, rating: 0.1, wearAdd: 8, ferhat: 'race' } },
            { chance: 0.5, result: `Ferhat çıkar, sen çıkamazsın; köşede bordüre sürtersin. Ayna çizilir, gurur çizilir, paket çantada sağlam kalır. Kapıda Ferhat kaskını çıkarmış: "On bir dakika reis. O viraj herkesi aldatır, beni de aldatmıştı."`, effects: { money: -60, wearAdd: 10, ferhat: 'race' } } ] },
          { label: 'Yol ver', result: `Yeşilde gaz vermezsin. Ferhat bir saniye bekler, anlamaz, sonra gider; aynada mavi çanta küçülür. Kapıya bir dakika geç varırsın; o merdivenin dibinde telefonuyla: "Yol verdin kanka. Onu da yazdım."`, effects: { ferhat: 'yield' } }
        ]
      };
    }
  },

  /* --- TEKRARLAYAN KARAKTERLER ---
     Kapıcı Hayri Abi: tavrı puanına göre değişir; Volkan'ı, paneli, dosyayı hatırlar (facts 42-arcs-hayri.js). Kastamonu'ya gittiyse çıkmaz.
     Komşu Nebahat Teyze: Nusret'i, böreği, benzine koyduğun parayı hatırlar. Huzurevine taşındıysa çıkmaz. */
  {
    id: 'kapici_hayri',
    title: 'KAPICI HAYRİ ABİ',
    stage: 'Apartmanda',
    weight: 2,
    forbids: ['hayri_left', 'hayri_cold'],
    reviews: { good:["Kurye kapıcımızla çay içmiş, Hayri Abi 'iyi çocuk' dedi. Hayri Abi kolay kolay demez. ⭐⭐⭐⭐⭐"], bad:['Kurye kapıcımızla tartışmış, yönetim toplandı. Çorbam soğudu, gündem uzadı. ⭐⭐'] },
    build: (o, S) => {
      const stayed = hasFact('hayri_stayed'), panel = hasFact('kapitaldoor'), volkan = hasFact('volkan_ride');
      const food = o.lines[0].name.replace(/\s*\(.*?\)/,'').toLocaleLowerCase('tr-TR');
      // Soru eki ünlü uyumuna göre: köfte mi, ayran mı, kokoreç mi, dürüm mü, çorba mı
      const mi = w => { const v = (w.toLocaleLowerCase('tr-TR').match(/[aeıioöuü](?=[^aeıioöuü]*$)/)||['i'])[0]; return 'aı'.includes(v)?'mı':'ou'.includes(v)?'mu':'öü'.includes(v)?'mü':'mi'; };
      const where = stayed ? 'Hayri Abi panelin yanında, yakasında BİNA GÜVENLİK DANIŞMANI kartı, elinde ince belli bardak.'
        : panel ? 'Hayri Abi karşı kaldırımdaki çay ocağından kalkıp gelir, anahtarlığı elinde, bardağı tabureye bırakmış.'
        : 'Kapıcı dairesinin kapısı aralık; Hayri Abi bardağı tabağa koyup çıkar, hırkasının düğmesini ilikler.';
      // Puanın iyiyse ve bağ kurulduysa arada hediye: Volkan'dan kalan bir eşya
      if(rel('hayri') >= 3 && S.rating >= 4.0 && Math.random() < 0.5) return {
        text: `${where} ${volkan ? '"Volkan Berlin\'e dönerken bıraktı. Sana olur oğlum."' : '"Bizim oğlandan kaldı. Sana olur oğlum."'} İçeriden bir Migros poşeti çıkarır, uzatır. "Reddetme. Hediye geri dönmez, bu binada kural. Çay döner, o ayrı."`,
        choices: [
          { label: 'Al, teşekkür et', result: `Alırsın. "Giy bakayım." Giyersin. "Oldu." Hayri Abi başını sallar, boş poşeti katlar, hırkasının cebine koyar. ${volkan ? '"Volkan görse sevinir; yazarım ona."' : '"Oğlan Almanya\'da, görmez. Ben gördüm."'} Asansörün düğmesine kendi basar.`, effects: { giftItem: true, hayri: 1, rating: 0.1 } },
          { label: 'Almayı reddet', result: `"Olmaz Hayri Abi, oğlunun." "Oğlan Almanya'da oğlum, orada bunlardan çok." Poşeti geri uzatmaz; dairenin içine, askının altına koyar. "Burada durur. Fikrin değişirse söylersin; ben söylemem, o ayrı."`, effects: { hayri: 1 } }
        ]
      };
      if(S.rating >= 4.2) return {
        text: `${where} Puanını Ayla Hanım'dan duymuş. ${panel ? '"Panel seni yeşil yaktı oğlum, Ayla Hanım çorbayı sıcak içmiş. Gel."' : '"Ayla Hanım çorbayı sıcak içmiş, seni sordu. İyi kuryeymişsin."'} Asansörün kapısını eliyle tutar: "Kuryeye yasak. Sana değil, o ayrı. Bin."`,
        choices: [
          { label: 'Asansöre bin', result: `Hayri Abi düğmeye basar, yolda havayı anlatır: "Yağmur gelecek oğlum, dizim söyledi." Bir ara susar: "Volkan da kuryeydi, Berlin'de hâlâ." ${o.floor}. katta kapı açılır; müşteri eşikte, bahşiş katlanmış, elinde.`, effects: { tipPct: 0.15, rating: 0.1, hayri: 1 } },
          { label: 'Çaya otur', outcomes: [
            { chance: 0.6, result: `Çay ince belli bardakta, şeker iki, sormadan. Hayri Abi anlatır: Sivas, Yıldız'ın ilk yöneticisi, otuz bir yılın ilk kışı. Müşteri on dakika bekler, kapıda gülümser: "Hayri'yle oturduysan mesele yok, o herkesi oturtur."`, effects: { rating: 0.1, hayri: 2, streakReset: true } },
            { chance: 0.4, result: `Çay bir olur, iki olur. Müşteri terlikle aşağı iner, kapıcı dairesinde kuryesini bulur: "Siz burada mısınız?" Hayri Abi bardağı kaldırır: "Benim misafirim, o ayrı." Müşteri paketi oradan alır, teşekkür etmez.`, effects: { rating: -0.3, hayri: 2 } } ] }
        ]
      };
      if(S.rating < 3.5) return {
        text: `${where} Kaşları çatık. ${panel ? '"Panel kırmızı yaktı seni oğlum. Nermin Hanım da yaktı, çorba soğuk gelmiş."' : '"Nermin Hanım çorbayı soğuk içmiş oğlum, puanını da gösterdi bana."'} "Kurye asansöre binmez, kural. İstisna vardı, bugün yok. Yürü."`,
        choices: [
          { label: 'Merdivenden çık', result: `${o.floor} kat merdiven. ${o.floor > 4 ? 'Nefes nefese zili çalarsın; müşteri kapıda: "Koşarak mı geldiniz?" "Merdivenden." "Asansör var ya?" Var.' : 'Çok değildir; prensip meselesidir. Prensip Hayri Abi\'nin, merdiven senin.'} Aşağıda bardak tabağa konur.`, effects: { rating: -0.1, hayri: 1 } },
          { label: 'Karşı çık', outcomes: [
            { chance: 0.4, result: `"Abi ben de insanım." Hayri Abi durur, bakar, bardağı bırakır: "Haklısın oğlum. Bir kerelik, o ayrı." Asansörü çağırır, kapıyı tutar; sen binerken ekler: "Nermin Hanım'a sıcak götür."`, effects: { rating: 0.1, hayri: 1 } },
            { chance: 0.6, result: `"Abi ben de insanım." "Ben de insanım oğlum, otuz bir yıldır." Yönetimi arar; yönetim platformu arar; platform seni arar: "Bina personeliyle iletişim standartlarımız hakkında bilgilendirme 📋" Merdiven solda.`, effects: { complaint: true, hayri: 1 } } ] }
        ]
      };
      return {
        text: `${where} Sana bakar, çantaya bakar. "Bu saatte ${food} ${mi(food)} oğlum?" ${rel('hayri') >= 2 ? `"Asansör kuryeye yasak. Sen bugün kurye değilsin${S.name ? ' ' + S.name : ''}, misafirsin, o ayrı." Düğmeye basar.` : '"Asansör bozuk değil, yavaş. Senin gibi." Düğmeye basmaz, bardağını alır.'}`,
        choices: [
          { label: 'Teşekkür et', result: `"Sağ ol Hayri Abi." Başını sallar; Hayri Abi dilinde bu "tamam" demektir, kelimeyle söylenmez. Merdivene yönelirken arkandan: "Yukarıdakinin yemeğini soğutma oğlum, bizim bina sıcak yer." Soğutmazsın.`, effects: { hayri: 1 } },
          { label: 'Selam vermeden geç', result: `Geçersin. Arkandan, bardağın tabağa konuş sesiyle: "Selam da vermiyorlar oğlum, selam." Duyarsın, duymazdan gelirsin; merdiven boşluğu ikisini de yukarı taşır, ${o.floor}. kata kadar.`, effects: { hayri: 1, rating: -0.05 } }
        ]
      };
    }
  },
  {
    id: 'komsu_nebahat',
    title: 'KOMŞU NEBAHAT TEYZE',
    stage: 'Apartmanda',
    weight: 1,
    forbids: ['nebahat_tasindi'],
    reviews: { good:['Kurye komşumla merdivende börek yemiş, bana da bir dilim getirdi. Siparişim ılıktı, umrumda değil. ⭐⭐⭐⭐⭐'], bad:['Kurye komşumun kapısında on dakika sohbet etmiş. Komşum sever, ben beklemem. ⭐⭐'] },
    build: (o, S) => {
      const r = rel('nebahat');
      // Arktan sonra (kaldı ya da mutfağı açıldı) ve bağ güçlüyse: motora para
      if(r >= 3 && (hasFact('nebahat_kaldi') || hasFact('nebahat_mutfak'))) return {
        text: `Nebahat Teyze merdivende bekler, avucunda dörde katlanmış iki yüz lira. ${hasFact('nebahat_mutfak') ? '"Böreğin parası evladım, Nusret\'in fayansının üstünde açıldı, Kadıköy\'e üç tepsi gitti, platform yüzdesini aldı, kalanı benim, benimki de senin, geçen sefer benzine koydun, bunu da koyarsın, hayır demeyeceksin."' : '"Kiracıdan geldi evladım, emekli maaşımdan değil, bu ay da gününde yatırdı, Nusret\'in zarfı da bu masadan geçerdi, geçen sefer benzine koydun, bunu da koyarsın, hayır demeyeceksin."'}`,
        choices: [
          { label: 'Al, elini öp', result: `Elini öpersin; un ve sabun kokar. "Motora dikkat edersin evladım, Nusret de ederdi, Paşabahçe servisinde otuz sene hep ön koltukta oturdu, şoförün yanında, sen de ön koltuk gibi sürersin, börek yolda soğumasın." Para çantanın ön cebinde, börek üstünde.`, effects: { money: 200, nebahat: 1, rating: 0.05 } },
          { label: 'Almayı reddet', result: `"Olmaz teyze." "Alırsın." Parayı çantanın ön cebine koyar, fermuarı çeker. "Nusret de almam derdi evladım, ikramiyeyi bile almam derdi, ben alırdım, yetmiş dokuzda bu ev öyle alındı, bu para da öyle alınır, sen alırsın, börek de senin." Fermuarın sesi, sonra kapının.`, effects: { money: 200, nebahat: 1 } }
        ]
      };
      // Nusret'i anlattıysa seni hatırlar: merdivende yediğin böreği, sarı yüzünü
      if(hasFact('nebahat_nusret')) return {
        text: `Nebahat Teyze kapıyı sen çalmadan açar, elinde iki kat poşet. "Yine sarı yüzlü ${S.name || 'kurye'} evladım, geçen sefer böreği merdivende yedin, Nusret de öyle yerdi, bu kuru fasulye, altı pilav, kiracının kirasından değil benim tenceremden, alırsın."`,
        choices: [
          { label: 'Poşeti al', result: `Poşette kuru fasulye, pilav, bir de çikolata. "Torunuma almıştım evladım, kalmış, Nusret çikolatayı sevmezdi, lokum severdi, Ercan da sevmez, sen seversin, akşam yemeğin bu, yolda yeme, motorun üstünde değil, bir banka oturup yersin." Torunun adı hiç geçmez; sen de sormazsın.`, effects: { expense: -120, energy: 25, nebahat: 1 } },
          { label: 'İki laf et, poşeti alma', result: `Biraz kırılır, gülümser, poşeti kapının iç tarafına koyar. "Almıyorsun demek evladım, Nusret de almazdı, yetmiş dörtte at arabasıyla Paşabahçe'ye cam taşırdı, yemeği bile almazdı, kiracı almaz, Ercan almaz, sen de almadın, poşet akşama kadar burada durur." Müşteri yukarıda bekler.`, effects: { nebahat: 1, rating: 0.1 } }
        ]
      };
      return {
        text: `Yan kapı aralanır: önlük, terlik, saçta siyah toka, Nebahat Teyze. "Yüzün yine sapsarı evladım, Nusret de akşamları böyle sapsarı gelirdi Paşabahçe'den, tezgâhta un var, sen şurada bir dakika durursun, börek fırından çıkıyor, folyoyu da ben sararım."`,
        choices: [
          { label: 'Bekle', result: `Folyo sıcak, köşesi yağlı. "Bütün gün bir şey yemediğini yüzünden anladım evladım, Nusret de yemezdi, kiracının yemeği aşağıda yazıcıdan çıkıyor ama börek elden çıkar, bunu merdivende yersin, iki dilim de yarına kalır." Bugünün yemek parası cepte kalır.`, effects: { expense: -60, energy: 20, nebahat: 1, rating: 0.05 } },
          { label: 'Acelem var de', result: `"Acelem var teyze, sağ olun." "Sizin hep aceleniz var evladım, Nusret'in de vardı, servis altıda kalkardı, kırk yıl bir kere kaçırmadı, börek burada durur, soğusa da durur, bir dahakine merdivende yersin." Kapı kapanır; koku merdivende kalır, sen de bir saniye kalırsın.`, effects: { nebahat: 0 } }
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
    text: `Kapıyı açan adamın belinde havlu, elinde buzlu rakı kadehi, arkasında Müslüm Gürses, "Nilüfer". "Kardeşim yoruldun, otur iki dakika; bana da iki dakika." Teslimat sayacı akıyor, Müslüm nakarata giriyor.`,
    choices: [
      { label: 'İki dakika otur',
        outcomes: [
          { chance: 0.6, result: `İki dakika yirmi beş dakika olur. Boşanmasını, kayınpederinin Doblo'sunu ve 1998 Galatasaray kadrosunu dinlersin; Hagi'de gözleri dolar. Cebine iki yüz lira sıkıştırır: "Sana değil kardeşim, hayata." Müslüm bitmez.`, effects: { tip: 200, rating: 0.2 } },
          { chance: 0.4, result: `Oturursun. Üçüncü şarkıda adam koltukta uyuyakalır, kadeh elinde dik durur. Sıradaki siparişin iptale düşer, uygulama seni işaretler: "Yanıt vermiyor." Müslüm devam eder; kapıyı yavaş kapatırsın.`, effects: { money: -60, rating: -0.2 } }
        ] },
      { label: 'Teşekkür et, çık',
        result: `"Sağ olun abi, sipariş var." "Haklısın kardeşim, çalış çalış; ben de çalıştım." Kapı kapanırken aralıktan bir yirmilik uzanır: "Çay parası." Müslüm duvarın öbür tarafından devam eder; merdiven boşluğunda nakarat.`,
        effects: { tipPct: 0.05 } }
    ]
  },
  {
    id: 'kedi_konseyi',
    title: 'MERDİVENDE KEDİ KONSEYİ',
    stage: 'Apartmanda',
    tags: ['night'],
    weight: 1,
    reviews: { good:['Merdivendeki kedilere ekmek vermiş, kediler onu bize kadar getirdi. {item} eksik gelmedi. ⭐⭐⭐⭐⭐'], bad:['Merdiven şalgam oldu, kapıcı bana kızdı, kurye kediye kızdı. {item} yine de güzeldi. ⭐⭐'] },
    text: `Üçüncü kat sahanlığında yedi kedi oturuyor: üç tekir, iki siyah, bir sarman, bir de tek gözlü beyaz. Yedisi de sana değil çantaya bakıyor; otomat ışığı on saniyede bir sönüyor.`,
    choices: [
      { label: 'Ekmek ucu at, geç',
        result: `Yarım ekmeğin ucunu koparır, sahanlığa bırakırsın; sarman önce alır, tek gözlü beyaz bekler. Gramaj yüzde iki eksilir, müşteri tartmaz. Kediler artık yüzünü tanıyor; inerken sarman seni ikinci kata kadar geçirir.`,
        effects: { rating: 0.1 } },
      { label: 'Aradan sıyrıl',
        outcomes: [
          { chance: 0.7, result: `Duvar dibinden geçersin. Siyahlardan biri bacağına sürtünür, tekir tıslar, beyaz kıpırdamaz. Yedi oy, yedi ayrı karar; sahanlığı geçersin, otomat tam o an söner.`, effects: {} },
          { chance: 0.3, result: `Sarman çantaya atlar; çanta devrilir, şalgam şişesi açılır, sahanlık mora boyanır. Kapıcı Zeki ikinci kattan paspasla çıkar, sana bakar: "Seksen lira bu merdiven." Kediler çoktan dördüncü katta.`, effects: { money: -80, rating: -0.2 } }
        ] }
    ]
  },
  {
    id: 'dugun_konvoyu',
    title: 'DÜĞÜN KONVOYU',
    stage: 'Yolda',
    tags: ['weekend'],
    weight: 2,
    reviews: { good:['Kurye düğün konvoyuna karışmış, yakasında iki yüz lirayla geldi. Pastam sağlam, hikâye bedava. ⭐⭐⭐⭐⭐'], bad:['Pasta davul tokmağı yemiş gibi geldi. Yemiş de zaten. Fotoğraf ektedir. ⭐'] },
    text: `Yolu bir düğün konvoyu kesmiş: on iki araba, bir davul, bir zurna, en önde kurdeleli bir Doblo. Korna ritmik, Doblo'nun bagaj kapağında iki oğlan alkış tutuyor; trafik iki şeritte de bekliyor.`,
    choices: [
      { label: 'Konvoya gir, korna çal',
        outcomes: [
          { chance: 0.65, result: `Doblo'nun yanına yanaşır, kornayı ritme uydurursun. Damadın amcası camdan uzanır, yakana iki yüz lira iğneler: "Kurye de bizim çocuk." Bir dakika motorun üstünde oynarsın; zurna seni bekler, trafik beklemez.`, effects: { money: 200, rating: 0.1 } },
          { chance: 0.35, result: `Davulcu tokmağı tam çantaya denk getirir. Pasta yamulur, krema kutunun kapağına çıkar. Müşteri fotoğrafı uygulamaya yükler, altına yazar: "Bu ne?" Davul devam eder.`, effects: { feeLost: true, rating: -0.3 } }
        ] },
      { label: 'Arka sokaktan dolan',
        result: `Üç sokak dolanırsın; biri çıkmaz, birinde hurdacı arabası yolu kapatmış. On iki dakika geç varırsın. Müşteri: "Neredesiniz?" "Düğün var." "Ne düğünü?" Zurna buradan bile duyuluyor.`,
        effects: { rating: -0.1 } }
    ]
  },

  /* --- SİSTEM KARTLARI: destek uyarısı (şikayet 3), fotoğraflı teslimat kuralı, kargo (Ferhat kutuyu getirir) --- */
  {
    id: 'destek_uyari',
    title: 'İŞ ORTAĞI DESTEK',
    stage: 'Yolda',
    priority: true,
    condition: (S) => S.complaints === 3 && !S.warnedToday,
    text: `Telefon titrer, ekranda mavi bir kart: "Sayın İş Ortağımız, hesabınızda 3 adet doğrulanmış müşteri geri bildirimi bulunmaktadır. Topluluk Standartlarımız gereği 4. geri bildirimde hesabınız otomatik değerlendirmeye alınacaktır. Gelişim yolculuğunuzda yanınızdayız 💙 İtiraz hakkınız 24 saat geçerlidir."`,
    choices: [
      { label: 'İtiraz et',
        result: `"İtiraz talebiniz alınmıştır. İlgili geri bildirim Güven ve Güvenlik ekibimizce yeniden değerlendirilmiştir; sonucunuz aşağıda görüntülenmektedir. Sabrınız için teşekkür ederiz 💙" Ekranın altında bir çubuk dolar, boşalır, yeniden dolar.`,
        effects: { rating: 0.1 } },
      { label: 'Geç',
        result: `Kartı yukarı kaydırırsın; kart gider, sayı kalır: 3. Ekranın köşesinde küçük bir rozet belirir: "Gelişime Açık İş Ortağı 🌱". Yol devam eder, telefon cebinde sessiz.`,
        effects: {} }
    ]
  },
  {
    id: 'foto_kat',
    title: 'FOTOĞRAFLI TESLİMAT',
    stage: 'Kapıda',
    weight: 3,
    condition: (S, o) => S.rules && S.rules.includes('foto') && o.noteKey === 'leave',
    reviews: { good:['Kapıya bıraktı, fotoğrafı doğru kata yüklemiş, sistem bana da gönderdi. Temas yok, sorun yok. ⭐⭐⭐⭐⭐'], bad:['Kapıya bırakmış ama fotoğraf başka kat. Benim paspasım o değil. Hangi kat yedi acaba? ⭐'] },
    build: (o) => ({
      text: `Paketi paspasa bırakır, "temas istemiyorum" notuna uyup geri çekilirsin. Uygulama fotoğrafı ister, sonra bir soru daha: "Teslimat doğrulaması için paketi bıraktığınız katı seçin 📸" Merdivenler aynı, paspaslar aynı, kapı numaraları ışıkta okunmuyor. Paketi hangi kata bıraktın?`,
      choices: memChoices(
        `${o.floor}. kat`, decoyNums(o.floor, 1, 12).map(n => `${n}. kat`),
        { result: `Yeşil tik: "Teslimat doğrulandı ✅ Fotoğrafınız müşteriyle paylaşıldı." Kapının arkasından, temas etmeyen bir ses: "Teşekkürler, görüyorum." Paspas, paket, kapı; merdivenden inerken telefon bir kez daha titrer: beş yıldız.`, effects: { rating: 0.1 } },
        { result: `Kırmızı ünlem: "Fotoğraf konumla eşleşmedi. Teslimat doğrulanamadı, ödeme askıya alındı." Müşteri içeriden yazar: "Paketim nerede?" Paket iki kat aşağıda, yabancı bir paspasın üstünde; yukarı çıkarırsın, doğrulama yeniden açılmaz.`, effects: { feeLost: true, rating: -0.1 } }
      )
    })
  },
  {
    id: 'kargo_ferhat',
    title: 'KARGO',
    stage: 'Kapıda',
    priority: true,
    condition: (S) => S.taksitPaid >= 4 && !S.boxDelivered,
    build: (o, S) => {
      const g = (typeof GOALS !== 'undefined') && GOALS.find(x => x.id === S.goalId);
      const name = g ? g.name.replace(/\s*\(.*?\)/, '') : 'kutu';
      const who = hasFact('ferhat_quit') ? `Ferhat, sırtında turuncu kargo yeleği, göğsünde barkodlu yaka kartı: "Bandırma iki hafta sürdü kanka, iskelede dakika saymıyorlar; döndüm."`
        : (hasFact('ferhat_contract') || hasFact('ferhat_forever')) ? `Ferhat, FİLO 01'in üstünde, çantasında kargo etiketi: "Filo kargo da taşıyor artık kanka; bu paket bana düştü, baktım, senin adın."`
        : `Ferhat, mavi çantanın yerinde kahverengi bir koli: "Sabahları kargo da taşıyorum kanka; bu paket bana düştü, baktım, senin adın."`;
      return {
        text: `Müşterinin zilini çalmadan önce arkandan motor sesi, tanıdık. ${who} Koliyi uzatır: üstünde senin adın, içinde ${name}. "Dört taksit, ${S.day} gün. Hesapladım kanka, günde kaç dakika koştun; istersen söylerim." Zil hâlâ çalınmadı.`,
        choices: [
          { label: 'Elli lira bahşiş ver', result: `Elliliği uzatırsın; Ferhat bakar, katlar, kaskın içine koyar: "Kuryeye bahşiş veren kurye. Yazdım kanka, bu ayrı listede." Koli ellerinde, ağırlığı tam tahmin ettiğin kadar. Arkanda Ferhat gaz verir; önünde müşterinin kapısı, kucağında ${name}.`, effects: { money: -50, rel: { ferhat: 1 } } },
          { label: 'Yarına söz ver', result: `"Yarın kanka, söz." Ferhat vizörü indirir, bir saniye öyle durur: "Yarın yok reis, dakika var. Neyse." Koliyi yine de bırakır, imza istemez. Motor sesi köşede kaybolur; merdivende tek başına, kucağında ${name}, zil bir karış ötede.`, effects: { rel: { ferhat: -1 } } }
        ]
      };
    }
  },

  /* --- YENİ ORTAM OLAYLARI: Restoranda / Yolda / Apartmanda / Kapıda --- */
  {
    id: 'restoran_gec',
    title: 'MUTFAK GECİKTİ',
    stage: 'Restoranda',
    weight: 2,
    reviews: { good:['Restoran geç vermiş, kurye beklemiş, yine de sıcak getirdi. Restorana sıfır, kuryeye beş. ⭐⭐⭐⭐⭐'], bad:['Kurye restoranda yarım saat beklemiş, sonra benim kapımda bana kızgın gibiydi. Ben ne yaptım? ⭐⭐'] },
    build: (o) => ({
      text: `${o.rest}: tezgâhta senin fişin en altta. Kasadaki çocuk mutfağa seslenir: "Abi kurye geldi!" İçeriden tencere kapağı: "On dakika!" Bu on dakika üçüncü on dakika; ekranda "Restoranda bekleme" sayacı yeşilden sarıya dönüyor.`,
      choices: [
        { label: 'Bekle', outcomes: [
          { chance: 0.6, result: `Kasanın yanındaki tabureye oturursun; çocuk sormadan çay getirir. On iki dakika sonra paket gelir, poşet sıcak, mutfaktan ses: "Kolay gelsin kurye." Kapıda müşteri saate bakar, bir şey demez.`, effects: { energy: 5, rating: -0.1 } },
          { chance: 0.4, result: `Bekleme sayacı kırmızıya döner; uygulama bunu sana yazar: "Teslimat süresi aşılıyor." Yirmi dakika sonra paket gelir. Kapıda müşteri telefonu gösterir: "Restoranda bekledi diyor, bana ne?" Kapı kapanır, sayaç durur.`, effects: { rating: -0.2 } } ] },
        { label: 'Mutfağa seslen', outcomes: [
          { chance: 0.5, result: `"Usta, kurye bekliyor, süre akıyor!" Mutfaktan un içinde bir kafa uzanır: "Sen mi bekliyorsun, ben mi?" Yine de senin fiş üste çıkar; altı dakikada paket elinde. Kasadaki çocuk göz kırpar.`, effects: { tipPct: 0.1 } },
          { chance: 0.5, result: `"Usta, süre akıyor!" "Benim de yağım akıyor!" Fişin yeri değişmez, ustanın sesi değişir. On beş dakika sonra paket gelir, poşet sertçe tezgâha konur. Kapıda müşteri: "Soğuk mu bu?" Ilık.`, effects: { rating: -0.1 } } ] },
        { label: 'Siparişi bırak, çık', result: `Fişi tezgâhta bırakırsın; çocuk arkandan seslenmez. Uygulama iptali kaydeder, ücreti kaydetmez. Sıradaki sipariş iki sokak ötede, poşet hazır bekliyor.`, effects: { feeLost: true, skipDelivery: true } }
      ]
    })
  },
  {
    id: 'polis_cevirme',
    title: 'ÇEVİRME',
    stage: 'Yolda',
    weight: 2,
    km: [3, 99],
    reviews: { good:['Polis çevirmesine takılmış, yine de vaktinde geldi. Belgesini bile göstermiş. ⭐⭐⭐⭐⭐'], bad:['Kurye çevirmeden kaçmış, bana anlattı. Ben polisin yanındayım, puan birdir. ⭐'] },
    text: `Köprü altında iki ekip aracı, tepe lambaları dönüyor, önde kırmızı koniler. Bir polis dur işareti yapar, öbürünün elinde tablet: "Ruhsat, ehliyet, kask. Çantayı da açıyoruz." Telefon cebinde titriyor: "Teslimat süresi aşılıyor."`,
    choices: [
      { label: 'Dur, evrakları göster', outcomes: [
        { chance: 0.7, result: `Ruhsat, ehliyet, kask bandı. Polis tablete bakar, motora bakar: "Egzoz orijinal mi?" "Orijinal." Çantayı açar, poşete bakar, kapatır: "Kolay gelsin." Altı dakika; müşteri kapıda kollarını kavuşturmuş.`, effects: { rating: -0.1 } },
        { chance: 0.3, result: `Ruhsat tamam, ehliyet tamam, sol ayna değil: "Ayna kırık, 235 lira." Tabletten çıkan fişi vizöre sıkıştırır: "Yolu açın." On dakika; müşteri kapıda: "Çevirme mi? Hep oradalar."`, effects: { money: -235, rating: -0.1 } } ] },
      { label: 'Yan sokağa kır', outcomes: [
        { chance: 0.6, result: `Koniden önce sağa kırarsın: fırının önünden, otoparkın içinden. Aynada tepe lambası dönmeye devam eder, peşinden gelmez. Kapıya dört dakika erken varırsın; kalbin iki dakika sonra gelir.`, effects: { tipPct: 0.1 } },
        { chance: 0.4, result: `Sağa kırarsın; yan sokağın ucunda üçüncü ekip aracı. "Nereye kaçıyoruz?" Ehliyet, ruhsat, çanta, bir de ihtar: 400 lira. Paket poşetten çıkıp konilerin yanında fotoğraflanır; müşteri paketi soğuk alır, polis selam verir.`, effects: { money: -400, feeLost: true, rating: -0.2 } } ] }
    ]
  },
  {
    id: 'guvenlik_defter',
    title: 'ZİYARETÇİ DEFTERİ',
    stage: 'Apartmanda',
    weight: 2,
    reviews: { good:['Güvenlik deftere yazdırmış, kurye itiraz etmemiş. Sitemizde kural kuraldır. ⭐⭐⭐⭐'], bad:['Kurye güvenlikle tartışmış, güvenlik yönetime yazmış, yönetim bana yazdı. {item} soğuk. ⭐⭐'] },
    build: (o) => { const dish = o.lines[0].name.replace(/\s*\(.*?\)/,'').toLocaleLowerCase('tr-TR'); return {
      text: `Kulübede ciltli bir defter, üstünde ZİYARETÇİ KAYIT, yanında ucu çiğnenmiş tükenmez. Güvenlik kalemi uzatır: "Ad, soyad, plaka, gittiğin daire, saat. Çıkışta da imza." Açık sayfada bugünden on dört kurye, hepsinin soyadı "Kurye".`,
      choices: [
        { label: 'Deftere yaz', result: `Adını, plakanı, ${o.apt} numarayı, saati yazarsın; soyadını da yazarsın, sayfadaki tek gerçek soyadı. Güvenlik sayfayı çevirir, bariyeri açar: "Çıkışta uğra." Çıkışta uğrarsın, imzalarsın; çay teklif eder, teklif defterde yok.`, effects: { rating: 0.05, energy: -2 } },
        { label: 'Kuryeyim, yazmam de', outcomes: [
          { chance: 0.5, result: `"Kuryeyim abi, ziyaretçi değilim." Güvenlik kalemi geri alır, bir saniye düşünür, defteri kapatır: "Doğru, kuryelere ayrı sayfa açacaktık." Bariyer kalkar. Kapıda müşteri: "Güvenlik yazdırmadı mı? İlk defa."`, effects: { tipPct: 0.1 } },
          { chance: 0.5, result: `"Kuryeyim abi." "Herkes bir şey abi." Bariyer kalkmaz; müşteri aranır, güvenlik telefonu alır, müşteri aşağı iner. Bariyerin üstünden ${dish} geçer, sen geçmezsin. Yönetime bir satır gider: "kurye, kayıt reddi".`, effects: { rating: -0.2 } } ] },
        { label: 'Uydurma isim yaz', outcomes: [
          { chance: 0.7, result: `"Hızlı Ferhat" yazarsın, plakaya da 34 FRH. Güvenlik okumaz, sayfayı çevirir, bariyeri açar. Defterde bugün on beş kurye; birinin adı var, o da başkasının.`, effects: {} },
          { chance: 0.3, result: `"Hızlı Ferhat" yazarsın. Güvenlik plakaya bakar, deftere bakar: "FRH yazmış, plakan 34 değil." Kayıt silinir, bariyer inmez; müşteri paketi dışarıda alır, uygulamaya yazar: "Kurye güvenliğe sahte isim vermiş."`, effects: { complaint: true } } ] }
      ]
    }; }
  },
  {
    id: 'komsu_paket',
    title: 'KARŞI KAPI',
    stage: 'Kapıda',
    weight: 2,
    reviews: { good:["Evde değildim, kurye paketi Şükran Hanım'a bırakmış, Şükran Hanım ısıtıp vermiş. Mahalle budur. ⭐⭐⭐⭐⭐"], bad:['Kurye paketimi komşuya vermiş. Komşu "almadım" diyor, kurye "verdim" diyor. Ben açım, kedi tok. ⭐'] },
    build: (o) => ({
      text: `Zil cevap vermez, telefon çalar çalar kapanır. Karşı kapı aralanır: Şükran Hanım, kolunda Tekel poşeti, ayağında çiçekli terlik. "${(o.customer || 'Komşun').split(' ')[0]} markette evladım, ben alırım, hep ben alırım, geçen hafta da aldım." Elini uzatır, bekler.`,
      choices: [
        { label: 'Komşuya ver', outcomes: [
          { chance: 0.7, result: `Paketi Şükran Hanım'a verirsin; uygulamaya "komşuya teslim" yazar, fotoğrafını çekersin, terlik de çıkar. Müşteri yirmi dakika sonra yazar: "Şükran Teyze ısıtıp vermiş, sağ olun." Bahşiş düğmesi.`, effects: { tipPct: 0.1 } },
          { chance: 0.3, result: `Paketi verirsin. Akşam müşteri uygulamaya yazar: "Siparişim gelmedi." Şükran Hanım'a sorulur: "Ben almadım evladım, ben hiç almam." Fotoğrafta yalnız bir terlik ve poşetin ucu. Platform ücreti keser.`, effects: { feeLost: true, complaint: true } } ] },
        { label: 'Müşteriyi bekle', outcomes: [
          { chance: 0.6, result: `"Sağ olun, bekleyeyim ben." Şükran Hanım kapıyı tam kapatmaz. Dört dakika sonra merdivende poşet hışırtısı: müşteri, elinde ekmek. "Aa, bekledin mi? Şükran Hanım alırdı ya." Ekmeğin ucunu koparıp uzatır.`, effects: { rating: 0.1 } },
          { chance: 0.4, result: `Beklersin; Şükran Hanım kapıyı kapatmaz, sen kapıya yaslanırsın, sayaç kırmızıya döner. Müşteri on iki dakika sonra gelir: "Şükran Hanım'a bıraksaydınız ya." Sıradaki sipariş düşmüş, uygulama not almış.`, effects: { rating: -0.1, money: -30 } } ] },
        { label: 'Kapıya bırak, fotoğrafla', result: `Paketi paspasa koyar, fotoğrafı yüklersin. Şükran Hanım izler: "Kedi gelir evladım, bizim değil ama gelir." Merdivenden inerken kapı aralığından bir patinin ucu görünür; fotoğrafta paket ve paspas, henüz patisiz.`, effects: { rating: -0.05 } }
      ]
    })
  },
  {
    id: 'binlik',
    title: 'BİNLİK',
    stage: 'Kapıda',
    weight: 3,
    condition: (S, o) => o.payment === 'nakit' && o.total < 700,
    reviews: { good:['Binlik verdim, bozuğu yoktu, bakkala gidip bozdurdu geldi. Kim yapar bunu? Bu çocuk yaptı. ⭐⭐⭐⭐⭐'], bad:['Binlik verdim, kurye "bozuğum yok" diye diretti, sanki parayı ben basıyorum. Kart çektim sonunda. ⭐⭐'] },
    build: (o) => ({
      text: `Müşteri kapıda, elinde dümdüz, kırışıksız bir binlik; sipariş ${fmt(o.total)}. "Üstü var değil mi? Bankamatik hep binlik veriyor, ne yapayım." Cüzdanında yalnız binliğin yeri var; sende ellilikler, birkaç yirmilik, çantanın dibinde bozukluk.`,
      choices: [
        { label: 'Bakkaldan bozdur', outcomes: [
          { chance: 0.6, result: `"Bir dakika." Köşedeki bakkala koşarsın; Necmi binliğe bakar, kasaya bakar, bozar: "Bir sakız al bari." Alırsın. Kapıda üstünü tam verirsin; müşteri sayar: "Zahmet oldu." Oldu; sakız cepte.`, effects: { rating: 0.05, energy: -3 } },
          { chance: 0.4, result: `Bakkala koşarsın; Necmi kasayı gösterir: "Sabahtan beri üç binlik bozdum, kalmadı." Eczane kapalı, büfede yüzlük yok. Dokuz dakika sonra kapıya dönersin: "Kart çekelim mi?" Müşteri çeker; sayaç çoktan kırmızı.`, effects: { rating: -0.2 } } ] },
        { label: 'Kart iste', outcomes: [
          { chance: 0.7, result: `"Bozuğum yok, kart çeksek?" Müşteri iç çeker, kartı getirir, cihaz üçüncü denemede okur. "Nakit seçtim ki kolay olsun." Fiş çıkar, kapı kapanır, binlik cüzdana geri döner.`, effects: { rating: -0.1 } },
          { chance: 0.3, result: `"Bozuğum yok abi." "Benim de kartım yok, eşimde." Montunun cebinden buruşuk bir yüzlük, iki ellilik çıkar; sayar, uzatır: "Üstü senin olsun, zahmet." Binlik cüzdanda kalır, kırışıksız.`, effects: { tip: 40 } } ] },
        { label: 'Üstünü kendi paranla ver', result: `Cebini, çantanın dibini, kaskın içini boşaltırsın: ellilikler, yirmilikler, iki tane onluk. Üstü tam çıkar. Müşteri bakar: "Siz bankamatik gibisiniz." Binlik şimdi sende; akşam Necmi bile bozmaz.`, effects: { rating: 0.1 } }
      ]
    })
  },
  {
    id: 'ikiz_bina',
    title: 'İKİZ BİNA',
    stage: 'Apartmanda',
    weight: 2,
    reviews: { good:['Bizim sokakta iki tane aynı numara var, kurye doğrusunu ilk seferde buldu. Kargocular hâlâ bulamıyor. ⭐⭐⭐⭐⭐'], bad:["Kurye yan binaya çıkmış, oradaki Ayşe'ye vermeye kalkmış. O Ayşe ben değilim. ⭐⭐"] },
    build: (o) => ({
      text: `${o.street} üstünde iki bina yan yana, ikisinin de kapısında ${o.no}; birinin numarası pirinç, öbürünün kâğıt, banda yapıştırılmış. Zil panelleri aynı firmadan, isimler yarı okunur. Karşı kaldırımdaki tüpçü izliyor: "Hangisine?"`,
      choices: [
        { label: 'Soldakine çık', outcomes: [
          { chance: 0.5, result: `Soldaki binada ${o.floor}. kat, ${o.apt} numara; kapı açılır, yüz tanıdık değil, isim doğru: "${o.customer}? Benim." Tüpçü aşağıdan seslenir: "Bildin!" Uygulama bunu bilmez; puanı sen alırsın.`, effects: { rating: 0.1 } },
          { chance: 0.5, result: `Soldaki binada ${o.floor}. kat; kapıyı açan kadın başını sallar: "Yan bina. Herkes buraya geliyor, geçen hafta bir kargo bile." İnersin, çıkarsın, ikinci ${o.floor}. kat. Müşteri kapıda: "Yan binaya mı çıktınız? Hep oluyor."`, effects: { rating: -0.2, energy: -6 } } ] },
        { label: 'Tüpçüye sor', result: `"${o.customer}?" Tüpçü tüpü yere koyar, düşünür: "Sağdaki. Soldakinde Nurtenler oturur." Sağdakine çıkarsın, ${o.floor}. kat, kapı açılır, isim doğru. Aşağıda tüpçü elini kaldırır; bir dakika gitti, merdiven gitmedi.`, effects: { rating: 0.05, energy: -1 } },
        { label: 'Müşteriyi ara', result: `Telefon üç çalar: "Hangi binadasınız?" "İkisinin de önünde." "Sağdaki, kapıda bant var." Bant vardır, siyah, harfin yerinde. Çıkarsın, teslim edersin; müşteri kapıyı kapatırken: "Harfi kargocu söktü, bir daha gelmedi."`, effects: { rating: -0.05 } }
      ]
    })
  },
  {
    id: 'yagmur_koprualti',
    title: 'KÖPRÜ ALTI',
    stage: 'Yolda',
    weather: ['rain'],
    weight: 2,
    reviews: { good:['Sağanakta geldi, paketi poşetin içine bir poşet daha sarmış. Paket kuruydu, kuru. ⭐⭐⭐⭐⭐'], bad:['Kurye köprü altında yağmurun durmasını beklemiş. Yağmur bir saat sürdü, ben de bekledim. ⭐'] },
    text: `Sağanak bastırır; köprünün altına çekersin. Beş kurye daha var: iki mavi çanta, bir turuncu, biri kasksız sigara içiyor, biri yağmurluk satıyor, 150 lira, "iki kat, kapüşonu bantlı". Ekranda yağmur damlası ve "Yoğunluk primi aktif ☔".`,
    choices: [
      { label: 'Yağmurluk al, sür', result: `Yüz elli lira, iki kat naylon, kapüşon bantlı. Giyersin, sürersin; dizlerin ıslanır, sırtın kuru kalır, çanta kuru kalır. Kapıda müşteri yağmurluğa bakar: "Yeni mi?" "Köprü altından." Paket sıcak, poşet kuru.`, effects: { money: -150, energy: 5 } },
      { label: 'Dinmesini bekle', result: `Sigara içen anlatır: "Kuzguncuk'ta bir Nurten Hanım var, her yağmurda kapıda havlu uzatır, bir de kesme şeker." On iki dakika sonra sağanak çiseye döner; sürersin. Kapıda müşteri telefonu gösterir: "Yirmi dakika geç." Havlu yok.`, effects: { rating: -0.1, energy: 5 } },
      { label: 'Sağanakta sür', outcomes: [
        { chance: 0.6, result: `Köprüden çıkarsın; yağmur kaskın içine kadar girer, göremediğin yolu ezbere sürersin. Kapıya sayaçtan önce varırsın; paket poşetin içinde ikinci poşette, kuru. Müşteri bir havlu uzatır: "Al, kurulan, sonra ver."`, effects: { tipPct: 0.1, energy: -6 } },
        { chance: 0.4, result: `Köprüden çıkarsın; üçüncü ışıkta bir Egea su birikintisini sana doğru boşaltır. Kask, yaka, çorap, poşetin dışı, poşetin içi. Kapıda müşteri poşete bakar: "Bu ıslak." Islak; çorap da.`, effects: { rating: -0.2, energy: -10 } } ] }
    ]
  },
  {
    id: 'gece_otomat',
    title: 'OTOMAT SÖNDÜ',
    stage: 'Apartmanda',
    tags: ['night'],
    weight: 2,
    reviews: { good:['Gece ışık yoktu, kurye telefon feneriyle çıkmış, poşeti dökmemiş. Kahraman. ⭐⭐⭐⭐⭐'], bad:['Kurye gece yarısı yanlış zile basmış, alt komşu bana bağırdı. Paket ılıktı, komşu sıcaktı. ⭐⭐'] },
    build: (o) => { const dish = o.lines[0].name.replace(/\s*\(.*?\)/,'').toLocaleLowerCase('tr-TR'); const Dish = dish.charAt(0).toLocaleUpperCase('tr-TR') + dish.slice(1); return {
      text: `Otomat ikinci katta söner; düğme ya üç kat yukarıda ya hiç yok. Merdivenin ortasında bir çocuk arabası, ikinci sahanlıkta ayakkabı dolabı, sende telefon feneri ve ${o.floor}. kata kadar karanlık. Bir kapının altından Kızılcık Şerbeti'nin ışığı sızıyor.`,
      choices: [
        { label: 'Fenerle çık', outcomes: [
          { chance: 0.7, result: `Fener elinde, çanta omuzda, merdiven sayarak: çocuk arabası, dolap, bir paspas, bir kedi kumu. ${o.floor}. katta kapı açılır, içeriden ışık vurur, müşteri gözlerini kısar: "Otomat yine mi? Yönetime söyledik." Söylediler.`, effects: {} },
          { chance: 0.3, result: `Üçüncü sahanlıkta ayakkabı dolabının köşesi dizine girer; çanta yan yatar, poşetin bandı açılır, ${dish} iki basamağa yayılır. Alt kattan kapı açılır, Yaşar Bey pijamayla: "Bu ne?" ${Dish}. Seksen lira, paspas senden.`, effects: { money: -80, rating: -0.1 } } ] },
        { label: 'Zile bas, ışık yaksınlar', outcomes: [
          { chance: 0.5, result: `En yakın zile basarsın; kapı aralanır, otomat düğmesine içeriden bir el uzanır, ışık yanar. "Kuryesiniz? Üst kata herhalde, buyurun." Çıkarsın. Müşteri kapıda: "Yaşar Bey mi yaktı? Tamam o zaman." Kapı kapanır, ışık yanık kalır.`, effects: { rating: 0.1 } },
          { chance: 0.5, result: `Yanlış zil: içeriden bebek ağlaması, sonra kapı, sonra bebeğin annesi, omzunda emzikli bez: "Saat kaç biliyor musunuz?" Işık yanar, bebek susmaz. Müşteri yukarıda kapıyı açarken fısıldar: "Alt katın bebeği uyandı mı? Biz de uyandırıyoruz, hep." Bebek devam eder.`, effects: { rating: -0.2 } } ] }
      ]
    }; }
  },
  {
    id: 'cocuk_kapi',
    title: 'KAPIYI ÇOCUK AÇTI',
    stage: 'Kapıda',
    weight: 2,
    condition: (S, o) => o.payment === 'nakit' && o.total < 500,
    reviews: { good:['Evde oğlum vardı, kurye parayı almış, üstünü de oğluma saydırmış. Matematik dersi bedava. ⭐⭐⭐⭐⭐'], bad:['Kurye paketi dokuz yaşındaki oğluma vermemiş, kapıda beni beklemiş. Çocuk aç kaldı, ben utandım. ⭐⭐'] },
    build: (o) => ({
      text: `Kapıyı dokuz yaşında bir çocuk açar, ayağında Galatasaray çorabı, elinde tablet: "Annem markette, para masada dedi." Masada bir beşyüzlük, paket ${fmt(o.total)}. Tablette bir YouTuber bağırıyor; çocuk parayı değil paketi tutuyor.`,
      choices: [
        { label: 'Parayı al, üstünü ver', outcomes: [
          { chance: 0.75, result: `Beşyüzlüğü alır, üstünü sayarsın; çocuğa da saydırırsın, iki kere. "Doğru." Paketi verir, kapıyı kapatmasını söylersin, kapatır. Annesi on dakika sonra yazar: "Çocuğa üstünü saydırmış, sağ olun, matematik dersi."`, effects: { rating: 0.1 } },
          { chance: 0.25, result: `Üstünü verirsin, çocuk alır, kapı kapanır. Akşam annesi yazar: "Üstü eksik vermişsiniz." Yirmi lira hesabından düşer; dondurmacının önünde çocuk, elinde külah.`, effects: { rating: -0.2, money: -20 } } ] },
        { label: 'Anneyi ara, bekle', outcomes: [
          { chance: 0.6, result: `Çocuk numarayı ezbere söyler. Anne telefonda: "Kapıda mısınız? İki dakika, bakkaldayım." Dört dakika; poşetle gelir, parayı kendi verir, çocuğa bakar: "Tableti kapat." Kapanmaz. Bahşiş küçük, kapı sıcak.`, effects: { tipPct: 0.1, rating: 0.05 } },
          { chance: 0.4, result: `Anne telefonu açmaz. Çocuk kapı aralığından sorar: "Vermiyor musun?" Sekiz dakika merdivende; anne gelir, elinde poşetler: "Çocuğa verseydiniz, para masadaydı." Teslim edersin, sayaç kırmızı.`, effects: { rating: -0.15 } } ] }
      ]
    })
  },
  {
    id: 'asansor_kaldi',
    title: 'ASANSÖR ARADA KALDI',
    stage: 'Apartmanda',
    weight: 1,
    condition: (S, o) => o.floor >= 4,
    reviews: { good:['Asansörde kalmış, yine de yemeği sıcak getirdi. Kapıcı Zeki kurtarmış. ⭐⭐⭐⭐'], bad:['Asansörde kalmış, bana oradan mesaj attı. Yemek asansörde, ben buradayım. On beş dakika. ⭐⭐'] },
    build: (o) => ({
      text: `Asansör ${o.floor - 1} ile ${o.floor} arasında durur; ışık titrer, sonra söner. Yanında Melahat Hanım, kolunda pazar filesi, elinde telefon: "Bu ay üçüncü. Zeki!" Zeki kapıcı, sesi aşağıdan: "Düğmeye basma, geliyorum."`,
      choices: [
        { label: 'Bekle', result: `Melahat Hanım torununu anlatır, sen dinlersin; file ağır, poşet sıcak. Dokuz dakika sonra Zeki kapıyı demir çubukla açar: "Yukarı atlayın." Atlarsın. Müşteri kapıda: "Asansörde miydiniz? Biz de kaldık geçen hafta."`, effects: { rating: -0.1, energy: 3 } },
        { label: 'Kapıyı zorla', outcomes: [
          { chance: 0.5, result: `İç kapıyı itersin, dış kapı aralanır, aradan ${o.floor}. kat görünür. Önce poşeti, sonra Melahat Hanım'ın filesini, sonra kendini çıkarırsın. Melahat Hanım aşağıda kalır: "Zeki geliyor, sen git evladım." Müşteri sıcak alır.`, effects: { tipPct: 0.1, energy: -5 } },
          { chance: 0.5, result: `İç kapıyı itersin; dış kapı iki parmak açılır, bir santim daha açılmaz. Zeki aşağıdan bağırır: "Zorlama, kilitlenir!" Kilitlenir. Yirmi dakika: teknisyen, Zeki, Melahat Hanım'ın damadı. Müşteri yemeğini soğuk alır, ücret platformda kalır.`, effects: { feeLost: true, rating: -0.2, energy: -8 } } ] }
      ]
    })
  },

  // ↓↓↓ Yeni olayları buraya ekle. Boş şablonlar 70-templates.js içinde (EVENT_TEMPLATES). ↓↓↓
];
