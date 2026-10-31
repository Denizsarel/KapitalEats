/* ---------------- İÇ SES ----------------
   Disco Elysium usulü: olay sonucu kötüyse "başarısız zar", iyiyse "başarılı zar" yorumu.
   [YETENEK · Durum] metin. İstediğin kadar ekle. */
const INNER_VOICE = {
  // [YETENEK, metin, sadece bu olaylarda (isteğe bağlı)]
  fail: [
    ['MANTIK','Bu kadar basit bir hesabı yapabilirdin. Yapmadın. Yemek kokusu dikkatini dağıttı.', ['para_ustu']],
    ['MANTIK','Para üstü. Çıkarma işlemi. İlkokul üç. İlkokul üçü de yapamadın.', ['para_ustu']],
    ['EMPATİ','Adamın yüzündeki ifadeyi okuyamadın. Yazı değil ki, yüz.'],
    ['REFLEKS','Vücudun "dur" dedi, sen "gaz" dedin. Vücudun haklıydı. Genelde haklıdır.', ['yagmur_viraj','hizli_ferhat']],
    ['OTORİTE','Güvenliğe karşı dik durdun. Güvenlik de dik durdu. Onun kulübesi var, senin yok.', ['guvenlik_daire','guvenlik_misafir']],
    ['OTORİTE','Hayri Abi\'ye kafa tuttun. Hayri Abi 31 yıldır burada. Sen 3 dakikadır.', ['kapici_hayri']],
    ['İÇ İMPARATORLUK','Bir an kendini sigortalı bir çalışan sandın. Değilsin. Hiç olmadın.'],
    ['ELEKTROKİMYA','İki lokma. İki. Beynin seni iki lokmaya sattı.', ['enerji_bitiyor']],
    ['KAYNAK YÖNETİMİ','Benzin gitti, ücret gitti, bahşiş zaten yoktu. Hesap ortada. Sen değilsin.'],
    ['VÜCUT KONTROLÜ','Motor kaydı. Sen kaydın. Paket kaydı. Ortak nokta: sen.', ['yagmur_viraj','kar_yokus']],
    ['VÜCUT KONTROLÜ','Bedenin uyarı verdi, verdi, verdi. Sonra vermeyi bıraktı. Sonra seni bıraktı.', ['bayildin']],
    ['ANSİKLOPEDİ','İstatistiksel olarak bu olacaktı. Sen de biliyordun. Bilmek yetmiyormuş.'],
    ['DRAMA','Havlulu adama güvendin. Havlulu adamlara güvenilmez, bu bir kuraldır.', ['rakili_musteri']],
    ['ALGI','Notu okumuştun. Hatırlamadın. Okumakla hatırlamak arasında uçurum var, sen uçurumdasın.', ['kapi_kac_kere','guvenlik_misafir','kapi_kime','guvenlik_daire']],
    ['ALGI','Köpek kuyruğunu sallıyordu. Sen bunu tehdit sandın. Köpek de seni.', ['dev_kopek']],
    ['IRADE','Hayır diyebilirdin. Diyemedin. Ağzın "tamam abi" dedi, sen izledin.'],
    ['MAKİNE BİLGİSİ','Gösterge sarıydı. Sonra kırmızı. Sonra motor konuştu. Üç uyarı, sıfır tepki.', ['motor_ariza']],
    ['KAVRAM','Yarıştın. Kimle? Ferhat\'la. Neden? Bilinmiyor. Ödül? Yoktu. Bedel? Ayna.', ['hizli_ferhat']]
  ],
  ok: [
    ['REFLEKS','Vücudun seni kurtardı. Beynine haber vermeden.', ['yagmur_viraj','kar_yokus','hizli_ferhat']],
    ['EMPATİ','Adamın gözündeki yalnızlığı gördün ve bahşişe çevirdin. Bu bir yetenek. Karanlık bir yetenek.', ['rakili_musteri']],
    ['EMPATİ','Teyzenin böreğini aldın. Teyze mutlu oldu, sen doydun. Kapitalizm bir an için ara verdi.', ['komsu_nebahat']],
    ['OTORİTE','Sesini çıkardın, kapı açıldı. Not: Bu nadiren işe yarar. Alışma.', ['kapici_hayri','guvenlik_daire']],
    ['MANTIK','Para üstünü doğru hesapladın. Dört yıl üniversite bunun içindi.', ['para_ustu']],
    ['İÇ İMPARATORLUK','Bir an mutlu oldun. Kaydet. Bir dahakine kadar idare edecek.'],
    ['KOMPOZİSYON','Köpeği sevdin, köpek seni sevdi. Hayatın en dürüst alışverişi.', ['dev_kopek']],
    ['ALGI','Notu hatırladın. Küçük bir zafer. Küçük zaferler sayılır, büyükleri gelmiyor zaten.', ['kapi_kac_kere','guvenlik_misafir','kapi_kime','guvenlik_daire']],
    ['DAYANIKLILIK','Yürüdün, taşıdın, ulaştın. Motor yapamadı, sen yaptın. Motor senin olsun.', ['kar_yokus','motor_ariza']],
    ['SAVOIR FAIRE','Yol verdin. Zayıflık değil, stil. Ferhat bunu anlamadı ama bir gün anlayacak.', ['hizli_ferhat']],
    ['ELEKTROKİMYA','Yedin. Enerji geldi. Vicdan sonra gelir, o yavaştır.', ['enerji_bitiyor']]
  ]
};
function innerVoice(effects, eventId){
  const e = effects || {};
  const bad = (e.money<0) || (e.rating<0) || e.feeLost || e.complaint;
  const good = (e.tip>0) || (e.tipPct>0) || (e.money>0) || (e.rating>0) || (e.giftItem);
  const choose = (list) => { const specific = list.filter(q => q[2] && q[2].includes(eventId)); const generic = list.filter(q => !q[2]); return pick(specific.length && Math.random() < 0.8 ? specific : generic); };
  if(bad && Math.random() < 0.75) return { kind:'fail', q: choose(INNER_VOICE.fail) };
  if(good && !bad && Math.random() < 0.4) return { kind:'ok', q: choose(INNER_VOICE.ok) };
  return null;
}

/* ---------------- MÜŞTERİ YORUMLARI ----------------
   Gün sonunda gösterilir. {item} ürün, {rest} restoran, {name} müşteri adı ile değişir. */
const REVIEWS = {
  // {t: metin, w: sadece bu havada (isteğe bağlı), n: sadece gece (isteğe bağlı)}
  good: [
    {t:'Kurye kardeşimiz güler yüzlüydü, {item} bile sıcak geldi. Helal olsun. ⭐⭐⭐⭐⭐'},
    {t:'Abi 15 dakikada geldi, kapıyı da yavaş çaldı, bebek uyanmadı. Bu adamı terfi ettirin. ⭐⭐⭐⭐⭐'},
    {t:'Notumu okuyan ilk kurye. Ağlayacağım. ⭐⭐⭐⭐⭐'},
    {t:'Kapıda "afiyet olsun" dedi. Kimse demiyor artık. Bir yıldız fazla ona. ⭐⭐⭐⭐⭐'},
    {t:'Yağmurda geldi, paket kuruydu, kendisi değildi. Allah razı olsun. ⭐⭐⭐⭐⭐', w:'rain'},
    {t:'Karda geldi. Karda! Kapıyı açtım kardan adam gibi duruyordu. Çay verdim. ⭐⭐⭐⭐⭐', w:'snow'},
    {t:'Gece 11\'de geldi, hiç şikayet etmedi. Ben kendime bile bu saatte kızıyorum. ⭐⭐⭐⭐⭐', n:true},
    {t:'{rest} berbat ama kurye iyiydi. Puan kuryeye. ⭐⭐⭐⭐'},
    {t:'{kurye} isimli kurye ayakkabısını kapıda çıkardı, halı temiz kaldı. Nadir insan. ⭐⭐⭐⭐⭐'},
    {t:'Paketi iki eliyle verdi. İki eliyle! Annem bile tek elle verir. ⭐⭐⭐⭐⭐'},
    {t:'Bahşişi yarın vereceğim demiştim, unuttum. Kurye hatırlatmadı. Centilmen. ⭐⭐⭐⭐⭐', k:'tiplater'},
    {t:'Asansör bozuktu, {floor}. kata çıktı, nefes nefese "buyrun" dedi. Buyurdum. ⭐⭐⭐⭐⭐', f:4}
  ],
  bad: [
    {t:'40 dakika geç. Mesaj attım, "yoldayım" dedi. Herkes bir yolda. ⭐⭐'},
    {t:'{item} ılık geldi. Ilık. Ne sıcak ne soğuk. Kurye de öyleydi. ⭐⭐'},
    {t:'Paketi ters tutmuş. {item} paketin kapağında. Yedim yine de. Puan yedim diye değil. ⭐⭐'},
    {t:'Kurye kapıda telefonla konuşuyordu, bana "bir saniye" dedi. Ben müşteriyim hocam. ⭐⭐'},
    {t:'Yağmurdan paket sırılsıklam. Kurye de. İkisine de üzüldüm ama puan paket için. ⭐⭐', w:'rain'},
    {t:'Gece yarısı zile 5 kere bastı. Bütün apartman uyandı. Komşu beni suçluyor. ⭐', n:true},
    {t:'{kurye} adlı kurye kapıda bana "abi" dedi. Ben kadınım. ⭐⭐'},
    {t:'Daireyi bulamamış, 3 kapı çalmış. Komşular artık ne yediğimi biliyor. ⭐⭐'},
    {t:'Motoru bizim kapının önüne park etmiş. Çıkamadım. Yemeği aldım ama kızgınım. ⭐⭐'}
  ],
  meh: [
    {t:'Geldi, verdi, gitti. Daha ne olsun. ⭐⭐⭐⭐'},
    {t:'{item} güzeldi, kuryeyi görmedim bile. Puan kuryeye mi yemeğe mi, bilmiyorum. ⭐⭐⭐⭐'},
    {t:'Normal. Her şey normal. Normal olması tuhaf. ⭐⭐⭐'},
    {t:'Kurye iyi de {rest} çatal koymamış. Elimle yedim. Puan yarı yarıya. ⭐⭐⭐'},
    {t:'Bahşiş vermedim çünkü nakit yoktu. Kurye anladı gibi yaptı. İkimiz de yalan söyledik. ⭐⭐⭐⭐'},
    {t:'Kurye "iyi akşamlar" dedi, saat öğlen 2\'ydi. Yorgun herhalde. ⭐⭐⭐⭐'},
    {t:'Zamanında geldi. Zamanında gelmek artık 4 yıldız. Enflasyon puanı da vurdu. ⭐⭐⭐⭐'},
    {t:'Kaskını çıkarmadı. Yüzünü görmedim. Belki de iyi oldu. ⭐⭐⭐'}
  ]
};
function makeReviews(){
  const list = (S.dayDeliveries || []).slice();
  shuffle(list);
  return list.slice(0, 3).map(d => {
    const ev = d.eventId ? EVENTS.find(e => e.id === d.eventId) : null;
    const isGood = d.delta > 0 || d.tip > 40, isBad = d.delta < 0 || d.bad;
    let pool = (isGood ? REVIEWS.good : (isBad ? REVIEWS.bad : REVIEWS.meh)).filter(r => (!r.w || r.w === S.weather) && (!r.n || d.night) && (!r.k || r.k === d.noteKey) && (!r.f || d.floor >= r.f)).map(r => r.t);
    if(ev && ev.reviews){ if(isBad && ev.reviews.bad) pool = ev.reviews.bad; else if(isGood && ev.reviews.good) pool = ev.reviews.good; }
    let fresh = pool.filter(t => !S.usedReviews.includes(t)); if(!fresh.length) fresh = pool;
    const raw = pick(fresh); S.usedReviews.unshift(raw); S.usedReviews = S.usedReviews.slice(0, 24);
    const t = raw.replace('{item}', d.item.replace(/\s*\(.*?\)/,'')).replace('{rest}', d.rest).replace('{name}', d.customer).replace('{kurye}', S.name).replace('{floor}', d.floor);
    return { name: d.customer, text: t };
  });
}

