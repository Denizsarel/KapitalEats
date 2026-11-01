/* ---------------- HIZLI FERHAT — «FİLO» ----------------
   Rakip kurye, yirmi iki yaşında. Hattı Kadıköy–Üsküdar: Söğütlüçeşme, Kuşdili, Kurbağalıdere, Harem, Paşalimanı, İcadiye.
   6 beat, hepsi mode 'ride' (km ≥ 4): olay yolda geçer — otobüsün arkasında, köprü altında, iskele meydanında.
   Anlatıcı: ikinci tekil, geniş zaman (ağız kağıdı). Tırnak içindeki konuşma serbest.
   Takvim: B1 G3 12A · B2 G5 kırk bin · B3 G8 asfalt · B4 G12 kontak (Boykot Günü'ne düşerse gate ile G13'e kayar)
           · B5 G14–15 filo · B6 G17–18 final.
   Bayraklar (A.flags): raced | yielded | followed (B1); knowsGoal | heardPlan | rushed (B2); saved | grudge (B3);
     shook | sawContract | moved | defended | apologized | primed | wouldStrike | wouldWork (B4);
     contract | bargained | refused (B5); alley | forever | quit | contractEnd (B6).
   Yazılan facts: 'ferhat_saved' | 'ferhat_grudge' (B3), 'ferhat_contract' (B5),
     'ferhat_forever' | 'ferhat_quit' | 'ferhat_contract_end' (B6).
   Okunan facts: 'boykot' | 'grev_kirici' — Boykot Günü sabah kararı (44-special-rules.js SPECIAL_DAYS[boykot].decision;
     motor desteği HENÜZ YOK). İkisi de yoksa B4 nötr sürüm; B6'da yalnızca SERTİFİKA dalı (grev_kirici) bu özelliğe bağlıdır.
   Final: saved && !grev_kirici → ARKA SOKAK, keepsake ferhat_alley ('boykot' fact'i yalnızca metni renklendirir);
          grev_kirici → SERTİFİKA, sokak yok, fact ferhat_forever;
          aksi (grudge) → KASK, Ferhat bırakır, giftItem (motor Ferhat bağlamında helmet_ferhat verir).
   Kontrat (B5 kabul): fact 'ferhat_contract' yazılır; metin mekanik vaat etmez (zil, iniş, hesabı Ferhat tutar), para bu
     kartta peşin. Motor sabit ücret/gri fiş uygularsa pencere: fact('ferhat_contract').day'den 3 gün, ya da
     hasFact('ferhat_contract_end') || hasFact('ferhat_quit') || META.arcs.ferhat.flags.contractEnd ile biter
     (tek `fact` anahtarı olduğundan iki B6 seçeneği bitişi flags.contractEnd ile yazar).
   Olay dosyası isteği: 40-events.js hizli_ferhat için minDay:4 ya da condition: () => (META.arcs.ferhat||{}).step > 1,
     yoksa ilk karşılaşma rastgele olayda B1'den önce gelir.
   Şema: docs/CONTENT_CONTRACT.md */

// Oyuncunun hedefinin adı, parantezsiz. Hedef yoksa null.
function ferhatGoal(S){
  const g = (typeof GOALS !== 'undefined') && GOALS.find(x => x.id === S.goalId);
  return g ? g.name.replace(/\s*\(.*?\)/, '') : null;
}
// Fişteki semt; ride modunda gerçek sipariş gelir, yine de korumalı.
const ferhatDest = o => (o && o.hood) ? o.hood : ((o && o.district) ? o.district : 'Üsküdar');
// Fişteki müşteri; motor kart önizlemesinde müşterisiz bir fiş de yollayabilir.
const ferhatWho = o => (o && o.customer) ? o.customer : 'Müşteri';
// Haftayı söyler, günü saymaz.
const ferhatWeek = S => S.day < 7 ? 'Daha ilk hafta' : S.day < 14 ? 'İkinci hafta' : 'Üçüncü hafta oldu';

/* ---- 1. 12A'NIN ARKASI (Gün 3) — ilk karşılaşma: Söğütlüçeşme durağından kalkan otobüs, Kurbağalıdere köprüsü ---- */
ARC_BEATS.push({
  arc: 'ferhat', step: 1, startDay: 3, dueGap: 2, mode: 'ride', minKm: 4,
  hook: "Söğütlüçeşme'de 12A'nın arkasında siyah kasklı bir kurye; aynı yere gidiyorsunuz galiba.",
  hookShort: 'Siyah kasklı kurye',
  build: (o, S, A) => {
    const dest = ferhatDest(o);
    return {
      title: "12A'NIN ARKASI",
      text: `Söğütlüçeşme durağından 12A kalkar, iki şeridi birden kapatır. Arkasında sen; yanında sol aynası elektrik bandıyla sarılı bir Kuba, bandın ucu çözülmüş, rüzgârda çırpınır. Siyah kask, mavi çanta; vizör kalkar, yirmi iki yaşında bir yüz. "Hızlı Ferhat derler kanka. ${dest} tarafına mı? Ben de. Otobüs Kurbağalıdere köprüsünde sağa yanaşır, soldan geçilir; dokuz dakika, saniyesi var." Sol bileğinde tükenmez kalemle rakamlar: 9,4 · 11,2 · 8,9.`,
      choices: [
        { label: 'Yarış',
          outcomes: [
            { chance: 0.5,
              result: `Köprüde 12A sağa yanaşır; soldan ilk sen çıkarsın, Ferhat otobüsle bordür arasında kalır. Kapıyı sen çalarsın. Bir dakika sonra merdivende, kaskı kolunda, kalem dişlerinin arasında; bileğine yazar: "9,6. Sen 9,4 kanka, yazdım; soldan ilk çıkan sen oldun." Kalemi sana uzatır, almazsın. Motorun ön freni köprüden beri öter; Ferhat duyar, bir şey demez.`,
              effects: { tipPct: 0.15, rating: 0.1, wearAdd: 8, sets: { raced: true }, rel: { ferhat: 1 } } },
            { chance: 0.5,
              result: `Otobüs sağa yanaşır, Ferhat soldan sızar, sen arkasında kalırsın; köprünün çıkışında bordüre sürtersin, sağ ayna çizilir, paket çantada sağlam. Kapıda Ferhat çoktan inmiş, bileğine yazar: "11,2 reis. Köprüde otobüsü bekledin; iki dakika orada gitti." Senin aynanın çiziğine bakar, kendi aynasının bandını gösterir: "Benimki de köprüden. İlk sefer herkes otobüsü bekler."`,
              effects: { money: -60, wearAdd: 10, sets: { raced: true }, rel: { ferhat: 1 } } }
          ] },
        { label: 'Yol ver',
          result: `Köprüde otobüs yanaşır, sen gaz vermezsin; Ferhat aynadan bakar, anlamaz, soldan gider. Kapıya iki dakika sonra varırsın; o merdivenin dibinde, kaskı çıkmış, bileğinde yeni bir rakam: 9,1. "Yol verdin. Köprüde yol veren olmaz kanka, otobüs bile vermez." Aynasının bandını yeniden sarar, bant bitmez. "Soldan geçseydin dokuz." Numaranı istemez, sen de vermezsin, henüz.`,
          effects: { sets: { yielded: true }, rel: { ferhat: 1 }, rating: -0.1 } },
        { label: 'Peşine takıl',
          result: `Soldan onun arkasına yerleşirsin: köprü, Kuşdili Caddesi, Kuşdili Fırını'nın önünden Kurbağalıdere kenarına. Aynasından seni görür; bant çırpınır, hız kesmez. Kapıda bir dakika farkla inersin. "Peşimden geldin kanka. Yolu öğrenmek için mi, beni geçmek için mi?" Cevabını beklemez, bileğine yazar: 9,0. "İkisi de olur."`,
          effects: { sets: { followed: true }, rel: { ferhat: 1 }, energy: -3, tipPct: 0.1 } }
      ]
    };
  }
});

/* ---- 2. KIRK BİN (Gün 5) — Filo Ortağı lisansı; hedefini söylersen knowsGoal ---- */
ARC_BEATS.push({
  arc: 'ferhat', step: 2, dueGap: 3, mode: 'ride', minKm: 4,
  hook: "Ferhat ışıkta yanaşıp 'bir hesabım var reis' diyor; dinlemesi iki dakika.",
  hookShort: "Ferhat'ın hesabı",
  build: (o, S, A) => {
    const f = A.flags;
    const intro = f.raced ? `"Yarışan çocuk. Bugün yarış yok, hesap var."`
      : f.yielded ? `"Yol veren çocuk. Bugün ben sana yol veriyorum, dinle."`
      : f.followed ? `"Peşimden gelen. Bugün yol yok, hesap var."`
      : `"Reis, bir dakika."`;
    const g = ferhatGoal(S);
    return {
      title: 'KIRK BİN',
      text: `Harem iskelesinin önündeki ışık, sahilden lodos. Ferhat yanaşır, vizörü kaldırır. ${intro} Telefonunu uzatır: ekranda hesap makinesi, altında yeşil-beyaz FİLO ORTAĞI PROGRAMI sayfası. "Kanka kırk bin. Filo Ortağı. Üç motor, üç çocuk, ben telefona bakıyorum. Günde on dört saat, yüz kırk gün, hesapladım. Sen ne için sürüyorsun reis, ne zamandır?"`,
      choices: [
        { label: 'Hedefini söyle',
          result: `"${ferhatWeek(S)}. ${g || 'Bir hedef var'}." Ferhat başını sallar, telefona yazar, çıkarır. "Günde kaç saat, on? ${g ? g + ' için' : 'O iş için'} iki ay yeter kanka, yağmur yağmazsa. Ben lisansa yüz kırk gün diyorum, saymıyorum, hesaplıyorum." Yeşil yanar; bu kez gaz vermez, yanında sürer, Üsküdar'a kadar yolu anlatır: Paşalimanı'ndan değil, Nuhkuyusu'ndan.`,
          effects: { sets: { knowsGoal: true }, rel: { ferhat: 1 } } },
        { label: 'Hesabı sor',
          result: `"Üç motor platformdan, kiralık, kaportasında FİLO yazar; kırk binin hepsi lisansa. Çocuklar yüzde yetmiş alıyor, platform benden yüzde on kesiyor, kalan benim. Günde on dört saat sürüyorum, yüz kırk günde lisans çıkıyor." Telefonda bir tablo, hücreleri renkli, kırmızı sütunun adı YAĞMUR GÜNLERİ. Yeşil yanar, kaçırırsınız; arkadaki Doblo kornaya basar, Ferhat elini kaldırır: "Bir dakika, hesap var."`,
          effects: { rel: { ferhat: 2 }, rating: -0.1, sets: { heardPlan: true } } },
        { label: 'Gaz ver, geç',
          result: `Yeşilde sen çıkarsın, Ferhat çıkmaz; aynada telefonuyla küçülür. Varış on iki dakika, Nuhkuyusu'nda iki ışık. Kapıda paket sıcak, bahşiş kapı aralığından uzatılır, katlı, sessiz. Dönüşte Harem'deki ışıkta Ferhat yoktur; asfaltta sol aynasının bandı durur, lacivert, yarısı kopuk.`,
          effects: { rel: { ferhat: -1 }, tipPct: 0.1, sets: { rushed: true } } }
      ]
    };
  }
});

/* ---- 3. ASFALT (Gün 8) — Ferhat önünde düşer. Yağmur sürümü yagmur_viraj'ı yankılar.
        Dur → ücret gider, puan −0,1, fact ferhat_saved. Geç → fact ferhat_grudge. ---- */
ARC_BEATS.push({
  arc: 'ferhat', step: 3, dueGap: 4, mode: 'ride', minKm: 4,
  hook: "Ferhat lisansın son taksitine koşuyor; yarın yolda sana yetişir, dakikası yok.",
  hookShort: "Ferhat'ın acelesi",
  build: (o, S, A) => {
    const rain = S.weather === 'rain';
    const who = ferhatWho(o);
    const text = rain
      ? `Asfalt ayna gibi; Paşalimanı Caddesi'nde yağmur sağanağa döner. Ferhat önünde, mavi çanta sağa sola, sol aynasının bandı sarkar. İcadiye sapağında sarı taksi aniden durur; Ferhat frene basar, arka lastik kararını verir: motor yan yatar, kask bordürde tok bir ses çıkarır, paketi yola saçılır. Taksi sinyal verip gider. Sırtında senin paketin, ekranda kırmızı yazı: "Teslimat süresi aşılıyor."`
      : `Paşalimanı Caddesi, öğle güneşi, Ferhat yirmi metre önünde; aynadan el sallar, "dokuz dakika" diye bağırır galiba. İcadiye sapağında bir Fiat Egea sinyal vermeden sola kırar. Ferhat frene basar, ön lastik tutar, arka tutmaz: motor yan yatar, kask bordürde tok bir ses çıkarır, paketi yola saçılır. Egea durmaz. Ekranda kırmızı yazı: "Teslimat süresi aşılıyor."`;
    return {
      title: 'ASFALT',
      text,
      choices: [
        { label: 'Dur, yanına git',
          result: `Motoru bordüre yatırır, koşarsın. Ferhat sırtüstü, vizör çatlak, gözleri açık: "Kanka kaç dakika oldu?" "Bir." "İyi, bir dakika." Kaskı sen çıkarırsın, kolunu sen tutarsın, 112'yi sen ararsın. Ambulans on sekiz dakikada gelir; o saymaz, sen sayarsın. Ekranda bu arada: "Teslimat süresi aşıldı, ücret yansıtılmayacaktır." Ferhat sedyede: "Lisans kalsın kanka. Lisans kalsın."`,
          effects: { feeLost: true, rating: -0.1, fact: 'ferhat_saved', sets: { saved: true }, rel: { ferhat: 2 }, energy: -5 } },
        { label: 'Motoru kaldır, paketi topla',
          result: `Ferhat'ın Kuba'sını bordüre çekersin, dağılan paketi toplayıp mavi çantaya tıkarsın; o kendi kalkar, dizini tutar, kaskını çıkarmaz. "Kanka dur, bir dakikaya iyiyim." Bir dakika beklersin, iki beklersin, sonra sürersin. Kapıda ${who} telefonu sallar: "On bir dakika geç." Akşam kayıtsız numaradan mesaj: "Diz şiş, lisans sağlam. Sağ ol reis. 23.41"`,
          effects: { rating: -0.2, fact: 'ferhat_saved', sets: { saved: true }, rel: { ferhat: 1 } } },
        { label: 'Geç',
          result: `Sola kırarsın, yan yatan Kuba'nın ve mavi çantanın yanından geçersin; aynada Ferhat dirseğinin üstünde doğrulur, kaskı sana döner. Dokuz dakikada kapıdasın, paket sıcak; ${who} "tam vaktinde" diye bahşişi kapıda hazır etmiş. Üsküdar'dan dönerken İcadiye sapağında asfaltta kırık bir vizör parçası durur, siyah.`,
          effects: { tipPct: 0.15, fact: 'ferhat_grudge', sets: { grudge: true }, rel: { ferhat: -2 } } }
      ]
    };
  }
});

/* ---- 4. KONTAK (Gün 12–13) — Boykot Günü'nün sabah kararını okur: boykot | grev_kirici | hiçbiri.
        Boykot Günü'nün kendisinde ateşlenmez (gate), ertesi sabaha kalır. ---- */
ARC_BEATS.push({
  arc: 'ferhat', step: 4, dueGap: 2, mode: 'ride', minKm: 4,
  gate: (S) => !(S.special && S.special.id === 'boykot' && S.special.day === S.day),
  hook: "Kuryeler grubunda bir ses kaydı dolaşıyor, Ferhat'ın sesi. Yarın yolda seni bulur.",
  hookShort: 'Ferhat ve boykot',
  build: (o, S, A) => {
    const f = A.flags;
    const g = ferhatGoal(S);
    const asfalt = f.saved ? 'durdun' : f.grudge ? 'geçtin' : 'vardın';

    if (hasFact('boykot')) return {
      title: 'KONTAK',
      text: `Söğütlüçeşme, köprünün altı. Ferhat'ın motoru kapalı, kaskı dizinde; telefonunda boykot gününün bildirimi hâlâ açık, ikinize de aynı gelen: "Sizi özledik 💙". "Asfaltta ${asfalt}, boykotta kapattın. İkisini de yazdım kanka. Kırk kurye kapattı; platform primi iki gün önceden açmıştı, yine kapattılar. Lisans dosyam da bugün onaylandı." Elini uzatır, ilk kez: "Filo Ortağı Ferhat. Hâlâ hızlı."`,
      choices: [
        { label: 'Elini sık',
          result: `Sıkarsın; eli soğuk, avucunda nasır, parmağında hâlâ fren izi. "Üç motor, üç çocuk, pazartesi başlıyoruz. Sana bir şey diyeceğim ama iki gün sonra, hesabı bitireyim." Köprünün altından birlikte çıkarsınız; Kurbağalıdere'de o sağa, sen düz. Uygulama o akşam yeni bildirim atar: "İş Ortağı Memnuniyet Anketi 💙"`,
          effects: { rel: { ferhat: 2 }, sets: { shook: true } } },
        { label: 'Kırk bini sor',
          result: `"Kırk bini nereden buldun?" "Yirmi beşi babamın Doblo'su, on biri Kuzguncuk'taki teyzemden borç, dördü benim. Yüz kırk günde değil, yüz on sekizde." Telefonu gösterir: yeşil tik, "Filo Ortağı sözleşmeniz onaylandı". Sözleşmeyi açar, kaydırır, kaydırır, kaydırır. "Kırk üç sayfa kanka. Okumadım. Sen okur musun bir ara?"`,
          effects: { rel: { ferhat: 1 }, sets: { sawContract: true }, energy: -3 } },
        { label: 'Yoluna devam et',
          result: `"Kontak kapattım, bugün açık, işim var." Başını sallar, kaskı takar, vizörü indirmez. "Olur kanka. Boykot bitti, dakikalar başladı." Kuşdili'nde seni geçer, sinyal verir, bu kez yol da verir; kapıya dokuz dakikada varırsın, onun yoluyla.`,
          effects: { tipPct: 0.1, sets: { moved: true } } }
      ]
    };

    if (hasFact('grev_kirici')) return {
      title: 'KONTAK',
      text: `Söğütlüçeşme'nin altı boş; Ferhat tek, motoru kapalı, kaskı dizinde, telefonu ters çevrilmiş. "Kanka boykot sabahı on birde açıktın, uygulamada yeşil yanıyordun. Kırk kişi kontak kapattı, sen yüzde altmış fazla aldın." ${f.saved ? '"Asfaltta durdun, o yüzden bağırmıyorum."' : '"Asfaltta da geçtin, boykotta da. İkisini de yazdım reis, dakikasıyla."'} Dizinde açılmamış bir zarf. "Lisans bugün onaylandı. Filo Ortağı. Ortağa kurye lazım; sen hızlısın, onu da yazdım."`,
      choices: [
        { label: 'Savun',
          result: `"Taksit vardı kanka${g ? ', ' + g + ' için' : ''}." "Herkesin taksiti var reis. Benim kırk binim var, ben de kapattım." Zarfı iç cebine koyar. "Pazartesi filo başlıyor. Sana iş vereceğim, çünkü hızlısın. Dostluk başka hesap, onu kapattım." Kaskı takar, vizörü indirir; yeşilde dönüp bakmadan çıkar, Kuşdili'ne sapmaz, düz gider, Harem'e.`,
          effects: { rel: { ferhat: -1 }, sets: { defended: true } } },
        { label: 'Özür dile',
          result: `"Haklısın." Cevap vermez; telefonu çevirir, ekranda boykot sabahı on bir, senin adın yeşil. "Özür para etmez kanka ama vakit eder, bir dakika kazandın." Zarfı dizinden alır. "Pazartesi filo başlıyor. İş veririm, hızlısın. Yol vermem, o bitti." Yeşil yanar; o çıkmaz, sen çıkarsın.`,
          effects: { rel: { ferhat: 1 }, sets: { apologized: true }, energy: -3 } },
        { label: 'Primi anlat, gaz ver',
          result: `"Yüzde altmış kanka, yağmur primi gibi; sen de alırdın." Vizörü indirir. "Ben almadım, sen aldın. Dakikayı sayarım, primi saymam." Yeşilde ikiniz de çıkarsınız; o Kuşdili'ne kırar, sen Paşalimanı'ndan gidersin. On bir dakika; fişte Teşekkür Primi yok artık.`,
          effects: { rel: { ferhat: -2 }, tipPct: 0.1, sets: { primed: true } } }
      ]
    };

    /* Boykot Günü gelmemiş ya da başka özel gün düşmüş: grup kaynıyor, karar henüz yok */
    return {
      title: 'KONTAK',
      text: `Söğütlüçeşme'nin altında Ferhat, motoru kapalı, kaskı dizinde, telefonunda kuryeler grubu: iki yüz on bir mesaj, hepsi kontak kapatma üstüne. "Grup kaynıyor kanka, platform bu hafta ücreti düşürdü. Bazıları kapatıyor, ben kapatamam: lisans dosyam bugün onaylandı." ${f.saved ? '"Asfaltta durdun; zarf o yüzden burada."' : '"Asfaltta geçtin; dizim hâlâ şiş, zarf yine de çıktı."'} Zarfı kaldırır: "Filo Ortağı Ferhat. Sen olsan kapatır mıydın?"`,
      choices: [
        { label: 'Kapatırdım de',
          result: `"Kapatırdım." "Ben de kapatırdım, lisans olmasa. Üç çocuk pazartesi başlıyor; ilk gün kontak kapatan ortağa platform motor verir mi kanka?" Zarfı iç cebine koyar. "Sana iki gün sonra bir şey diyeceğim. Hesabı bitireyim." Yeşilde birlikte çıkarsınız; Kurbağalıdere köprüsünde o sağa, sen düz, aynada bandın çırpınışı bir süre daha.`,
          effects: { rel: { ferhat: 1 }, sets: { wouldStrike: true } } },
        { label: 'Kapatmazdım de',
          result: `"Kapatmazdım, taksit var." "Benim de var kanka, kırk bin. Anlıyorum; grup anlamaz." Telefonu kapatır, zarfı dizinden alır. "Pazartesi filo başlıyor. Hızlı adam lazım, sana geleceğim." Kaskı takar; Kuşdili'nden değil, Tıbbiye Caddesi'nden gider, telefonu hâlâ elinde.`,
          effects: { rel: { ferhat: 1 }, sets: { wouldWork: true } } },
        { label: 'Sözleşmeyi sor',
          result: `"Kırk üç sayfa kanka. Platform yüzde on alıyor, bir de 'operasyonel katkı payı' maddesi var, okumadım. Sen okur musun?" Telefonu uzatır: madde 14/b, küçük punto, "tek taraflı güncelleme hakkı". Okursun; o dakikayı sayar: "Üç dakika. Pahalı okuma." Yeşil yanar, kaçırırsınız; arkadaki İETT şoförü camdan bakar.`,
          effects: { rel: { ferhat: 1 }, sets: { sawContract: true }, rating: -0.1 } }
      ]
    };
  }
});

/* ---- 5. FİLO (Gün 14–15) — Ferhat Filo Ortağı; üç günlük sabit anlaşma, günde bin iki yüz, ilk gün bu kartta peşin.
        Kabul → fact ferhat_contract. Metin mekanik vaat etmez; motor sabit ücret/gri fiş uygularsa dosya başındaki pencere. ---- */
ARC_BEATS.push({
  arc: 'ferhat', step: 5, dueGap: 3, mode: 'ride', minKm: 4,
  hook: "Ferhat'ın üç motoru var artık; biri sana ayrılmış gibi duruyor. Yarın teklif gelir.",
  hookShort: "Ferhat'ın teklifi",
  build: (o, S, A) => {
    const f = A.flags;
    const grev = hasFact('grev_kirici');
    const open = grev && f.defended ? `"Reis. Dostluğu kapattım dedim; bu iş."`
      : grev ? `"Reis. Boykotu konuşmayacağız, işi konuşacağız."`
      : f.saved ? `"Kanka gel, teklifim var, iki dakika."`
      : f.grudge ? `"Reis. Asfaltı konuşmayacağız, işi konuşacağız."`
      : `"Kanka, iki dakika."`;
    return {
      title: 'FİLO',
      text: `Kadıköy iskele meydanı, Haldun Taner Sahnesi'nin önü. Üç gri Honda PCX yan yana, kaportalarda FİLO 01, 02, 03. 02'nin üstünde kasksız, on dokuz yaşında biri: Burak. Ferhat 03'ün yanında, sırtında ilk kez çanta yok. ${open} "Üç gün, günde bin iki yüz, sabit. Zili çalarsın, inersin, hesabı ben tutarım. Dakikalarını artık ben sayarım, sen sürersin."`,
      choices: [
        { label: 'Üç günü kabul et',
          result: `El sıkışırsınız; telefonuna "FİLO 03 – ${S.name || 'kurye'}" yazar, yeşil tik. "Yarın sabah yedi, burası. Üç gün sen sürersin, ben sayarım; bahşişe bakmazsın, bana bakarsın." Cebinden bir zarf çıkarır, içinde yüzlükler ve ellilikler, bin iki yüz: "İlk gün peşin. Ben böyle başladım, sen de böyle başla." Beşiktaş vapuru düdük çalar.`,
          effects: { money: 1200, sets: { contract: true }, fact: 'ferhat_contract', rel: { ferhat: 1 } } },
        { label: 'Pazarlık et',
          outcomes: [
            { chance: 0.5,
              result: `"Bin beş yüz kanka." Ferhat telefonu çıkarır, hesaplar, dudağı kıpırdar. "Bin üç yüz. Yüz de yakıt, ayrı. Fazlası yok, platform yüzde on alıyor." Elini uzatır, sıkarsın. Zarf çıkar, içinde bin üç yüz: "İlk gün peşin." Burak 02'yi çalıştırır, egzoz Haldun Taner'in camına vurur.`,
              effects: { money: 1300, sets: { contract: true, bargained: true }, fact: 'ferhat_contract' } },
            { chance: 0.5,
              result: `"Bin beş yüz." Ferhat hesaplamaz bile. "Kanka ben kurye tutuyorum, ortak değil. Bin iki yüz, ya da yok." Birbirinize bakarsınız, o saniyeleri sayar. "Tamam, yok." FİLO 03'ün anahtarını cebine koyar, kuryeler grubuna yazar: "Bir motor boş, sabah yedi, Kadıköy iskele. Dakik olan gelsin."`,
              effects: { rel: { ferhat: -1 }, sets: { refused: true } } }
          ] },
        { label: 'Reddet',
          result: `"Sabit istemem kanka, bahşiş isterim." Güler, ilk kez geniş. "Bahşiş diye diye bugün kaç dakika kaybettin?" FİLO 03'e Burak'ın arkadaşı biner, kasksız, adı Emre. "Üç gün sonra gel, hesabı anlatırım. Yollar sende, dakikalar bende." Vapur düdüğü, martı, 03'ün egzozu.`,
          effects: { sets: { refused: true }, tipPct: 0.1 } }
      ]
    };
  }
});

/* ---- 6. KESİNTİ (Gün 17–18, final) — platform %20 kesti; bin iki yüz dokuz yüz altmışa düştü, Ferhat bine yuvarladı.
        saved && !grev_kirici → ARKA SOKAK (keepsake ferhat_alley). grev_kirici → SERTİFİKA, sokak yok (fact ferhat_forever).
        Aksi → KASK, Ferhat bırakır, kaskı dükkana düşer (giftItem → helmet_ferhat). ---- */
ARC_BEATS.push({
  arc: 'ferhat', step: 6, dueGap: 0, mode: 'ride', minKm: 4, final: true,
  hook: "Ferhat yazdı: 'Platform kesinti yaptı kanka, 14.07.' Yarın Söğütlüçeşme'de son hesap.",
  hookShort: "Ferhat'ın son hesabı",
  build: (o, S, A) => {
    const f = A.flags;
    const saved = f.saved || hasFact('ferhat_saved');
    const boykot = hasFact('boykot'), grev = hasFact('grev_kirici');
    const contract = !!f.contract;
    const kesinti = contract
      ? `"Üç günün de bitti; uzatsam bine."`
      : `"Burak gitti, 03 rehinde."`;
    const head = `Söğütlüçeşme, köprünün altı. FİLO 01 ve 02 yan yana, 03 yok. Ferhat'ın ekranında: "Filo Ortağı Katkı Payı güncellendi: %20 💙". "Bin iki yüzden dokuz yüz altmışa kanka; ben bine yuvarladım, kırkı benden. Çocuklardan da yüzde yirmi." ${kesinti}`;

    /* A — asfaltta durdun, boykotta açık kalmadın: sokak senin */
    if (saved && !grev) {
      const choices = [
        { label: 'Sokağı al',
          result: `Telefonuna haritayı atar: mavi çizgi, Kuşdili Caddesi'nden Kurbağalıdere kenarına, Kuşdili Fırını'nın arkasından Hasanpaşa'ya, oradan Koşuyolu'na. "Kadıköy'den Üsküdar'a bir kilometre kısa; ışık yok, kamera yok." Kaskı takar, 01'e biner. "İki motor, iki çocuk, ben telefona bakıyorum. Dakikalarım bende kanka, sokağım sende."`,
          effects: { keepsake: 'ferhat_alley', rel: { ferhat: 2 }, sets: { alley: true } } },
        { label: 'Çay al, sokağı al',
          result: `Çayı köprü altındaki büfeden alırsın, iki tane, karton bardakta; Ferhat ilk yudumu sayar: "Kırk saniye, sıcakmış." Haritayı atar: Kuşdili, Kurbağalıdere, fırının arkası, Koşuyolu. "Bir kilometre kısa, kamerasız." Boş bardağı sana uzatır: "Çöpe at reis. Ben telefona bakıyorum artık, çöpe de bakmam."`,
          effects: { keepsake: 'ferhat_alley', rel: { ferhat: 3 }, energy: 5, money: -30, sets: { alley: true } } }
      ];
      if (contract) choices.push({ label: 'Kontratı bitir, sokağı al',
        result: `"Bine sürmem kanka." "Sürme. Ben de sürdürmem; bu zarf son." Son zarf: bin, yüzlükler. Harita yine gelir: Kuşdili, Kurbağalıdere, fırının arkası, Koşuyolu. "Sokak kontrattan değil, asfalttan." 01'e biner; Kuşdili'nde sinyal verir, yol verir, bir el sallar.`,
        effects: { keepsake: 'ferhat_alley', money: 1000, rel: { ferhat: 1 }, fact: 'ferhat_contract_end', sets: { alley: true, contractEnd: true } } });
      return {
        title: 'ARKA SOKAK',
        text: `${head} ${boykot ? '"Asfaltta durdun, boykotta kapattın.' : '"Asfaltta durdun, o bir dakikayı yazdım.'} Bende bir şey kaldı: Kuşdili'nden Kurbağalıdere'ye, Hasanpaşa'nın arkasından Koşuyolu'na çıkan sokak. Al kanka, sana lazım."`,
        choices
      };
    }

    /* B — boykot günü açıktın: sokak yok, sertifika hep onun */
    if (grev) {
      const choices = [
        { label: 'Kabul et, git',
          result: `Başını sallarsın, kaskı takarsın. Ferhat 01'e biner, 02'ye Burak'ın yerine on dokuz yaşında başka biri, Burak'ın kuzeni, kaskı Burak'ınki. Kuşdili'nde ikisi birden geçer; FİLO 02'nin plakası daha okunmadan yoktur. Pazar sertifika gelir: HAFTANIN KURYESİ, Hızlı Ferhat; sayıyı o söyler, sen okursun.`,
          effects: { fact: 'ferhat_forever', rel: { ferhat: -1 }, sets: { forever: true } } },
        { label: 'Sokağı iste',
          result: `"Sokağı ver kanka, bir dahakine kapatırım." Güler, geniş değil. "Bir dahaki yok reis; grup dağıldı, köprünün altı boş, herkes dakikasına döndü." Haritayı açar, sana döndürmez, kapatır. "Yol yok. Dakika var: Paşalimanı'ndan on üç." Yeşilde çıkar.`,
          effects: { fact: 'ferhat_forever', rel: { ferhat: -2 }, sets: { forever: true } } }
      ];
      if (contract) choices.push({ label: 'Son bini al',
        result: `Zarf çıkar: bin, yüzlükler, biri yırtık. "Üç gün sürdün, hiçbir fiş geç değil; yazdım." Pazar sertifika gelir: HAFTANIN KURYESİ, Hızlı Ferhat; senin adın altta, küçük puntoyla: FİLO 03. Zarfı avucuna koyar: "Bu zarf son; pazartesi 03'e Emre biner."`,
        effects: { money: 1000, fact: 'ferhat_forever', sets: { forever: true, contractEnd: true } } });
      return {
        title: 'SERTİFİKA',
        text: `${head} "Boykot günü açıktın; ben kırk binle kapattım, sen taksitle açtın. Yüzde yirmiyi ben yedim, primi sen. Sokak var kanka; sana vermiyorum. Haftanın kuryesi hep ben; sen sertifikada okursun."`,
        choices
      };
    }

    /* C — asfaltta geçtin: Ferhat bırakır; kask sana kalır (giftItem → helmet_ferhat) */
    const why = f.grudge && boykot ? `"Asfaltta geçtin, boykotta kapattın; ikisini de anlamadım kanka."`
      : f.grudge ? `"Asfaltta geçtin kanka; yedi dakika yattım, sonra kalktım."`
      : `"Asfaltta yattım kanka, sen vardın; onu da yazdım."`;
    const choices = [
      { label: 'Kaskı al',
        result: `Alırsın: siyah, vizörü çatlak, sağ şakağında bordür izi, içinde keçeli kalemle F. "Küçük gelirse Burak'a ver; o da gitti zaten." 01'e biner, kasksız, rüzgâr yüzünde. Harem'e doğru sinyal verir, yol verir. Uygulama o akşam yazar: "Filo Ortağı Programı'na yeni ortaklar aranıyor 💙"`,
        effects: { giftItem: true, rel: { ferhat: 1 }, fact: 'ferhat_quit', sets: { quit: true } } },
      { label: 'Kaskı al, vazgeçir',
        result: `"Gitme kanka; kurye olarak devam et, saat ücreti olmasa da." Kaskı dizinden alır, sana uzatır, geri çekmez. "Yüz kırk gün hesapladım reis, yüz on sekiz sürdü, beş gün dayandı. Hesap tutmadı, dakikalar tuttu. Al." Alırsın. 01'i çalıştırır, köprünün altından Harem'e doğru çıkar; gri PCX'in aynasında bant yok, kendi aynası.`,
        effects: { giftItem: true, rel: { ferhat: 2 }, energy: -5, fact: 'ferhat_quit', sets: { quit: true } } }
    ];
    if (contract) choices.push({ label: 'Bini al, kaskı al',
      result: `Son zarf: bin, yüzlükler, biri bantlı. "Kontrat bitti kanka, bin de bitti." Kaskı zarfın üstüne koyar: "Bu da bitti." 01'e kasksız biner. Harem'e kadar aynada kalır, sonra bir Doblo girer araya.`,
      effects: { giftItem: true, money: 1000, fact: 'ferhat_quit', sets: { quit: true, contractEnd: true } } });
    return {
      title: 'KASK',
      text: `${head} ${why} "Lisans çıktı, kalanı rehinde. Bandırma'ya gidiyorum, babamın yanına, iskelede bilet kesmeye. Kaskı al; orada dakika saymam."`,
      choices
    };
  }
});
