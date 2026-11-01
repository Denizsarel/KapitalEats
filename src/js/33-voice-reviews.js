/* =====================================================================
   İÇ SES (kadro) ve MÜŞTERİ YORUMLARI (arşetipler)
   ---------------------------------------------------------------------
   Şema ve biçim kuralları: docs/CONTENT_CONTRACT.md (stil rehberi 10).
   İç ses bir kadrodur; her yeteneğin kendi cümle biçimi var:
     MANTIK           adım numaraları: "1. … 2. … 3. …"
     ELEKTROKİMYA     sadece yemekten, geniş zamanda
     İÇ İMPARATORLUK  seni üçüncü tekilde, destan gibi anlatır ("Kurye …")
     REFLEKS          iki kelimelik stakato
     VÜCUT KONTROLÜ   iki kelimelik stakato
     ALGI             gördüğü detayı listeler ("Fişte: … Kapıda: …")
     OTORİTE          emir kipi
     EMPATİ           karşıdakinin iç sesini tahmin eder ("X'in iç sesi: "…"")
     ANSİKLOPEDİ      bir istatistik ya da tarih verir
     KAYNAK YÖNETİMİ  defter tutar: "Giden: … Gelen: … Kalan: …"
   Satır: [YETENEK, metin (≤ 22 kelime), sadece bu olay/ark id'lerinde (isteğe bağlı)].
   Motor ark kartlarında eventId olarak ark adını yollar: hayri, nebahat, ferhat, musti, nuri.
   Erişim kuralı: satır bir OLAYA bağlanır, seçime değil; tür (fail/ok) seçimin etkilerinden
   çıkar (innerVoice). Bu yüzden id'li bir satır o olayın BÜTÜN fail (ya da bütün ok) sonuçlarında
   doğru olmalı; iki sonucun detayını birleştiren liste yazılmaz, ortak detaya inilir.
   ===================================================================== */
const INNER_VOICE = {
  fail: [
    ['MANTIK', "1. Uzatılan para. 2. Fişteki tutar. 3. Fark. Üçüncü adımda müşterinin cüzdanı açık kaldı, parmağı ıslak, sayıyor.", ['para_ustu']],
    ['ANSİKLOPEDİ', "Beş yıldız 1958'de Mobil Rehberi'nden geldi, önce otellere, sonra restoranlara, en son kuryelere; ölçek aynı, beş yıldız aynı."],
    ['ELEKTROKİMYA', "Yemek iki lokma eksilir, bant bir kere açılır, ikincisinde yapışmaz; poşet kapıda tartılır, eksik tartıda çıkar.", ['enerji_bitiyor']],
    ['ELEKTROKİMYA', "Pide fırından çıkar, yedi dakikada yumuşar, on beşinde kâğıdına yapışır. Çorbanın yağı yirmide donar, tabağa dökülmez, kaşıkla kazınır."],
    ['İÇ İMPARATORLUK', "Kurye kaldırıma uzanır, gök ona Bakkal Necmi'nin yüzü kadar yaklaşır; destanın bu kıtasını ilkokul çocuğu yatay çeker.", ['bayildin']],
    ['İÇ İMPARATORLUK', "Kurye kuzenine 'tamam' yazar; destan bu kıtada küçük harfe düşer, noktalaması gider, plakası Kağıthane Caddesi'nde gece 02.41'de görülür.", ['musti']],
    ['REFLEKS', "Su birikmiş. Fren geç. Lastik kaydı. Taksi yakın. Nefes durdu. Dakika gitti.", ['yagmur_viraj']],
    ['REFLEKS', "Ferhat önde. Sen arkada. Gaz onun. Kapı onun. Dakika onun. Yazdı bile.", ['hizli_ferhat']],
    ['VÜCUT KONTROLÜ', "Gaz sonuna. Lastik yerinde. Ayak sürttü. Motor yattı. Kar yumuşak. Dondurma gitti. Egea durdurdu.", ['kar_yokus']],
    ['VÜCUT KONTROLÜ', "Merdiven aynı. Paspas aynı. Numara silik. Fotoğraf çekildi. Kat seçildi. Ünlem kırmızı. Paspas yabancı.", ['foto_kat']],
    ['ALGI', "Paspasta: HOŞ GELDİNİZ, harfleri aşınmış. Kapı arkasında: Kızılcık Şerbeti jeneriği. Telefon: meşgul. Üst şerit: kırmızı, 'Teslimat süresi aşılıyor.'", ['kapi_acilmiyor']],
    ['ALGI', "Kapıda: pijama, kumanda, tek terlik. Koridorda: dört çift ayakkabı, dördü ayrı numara. Fişteki isim: aklında değil, ayakkabılarda.", ['kapi_kime']],
    ['ALGI', "Zilde: iki tel, elektrik bandı. Notta: bir sayı, bir 'değil'. Kapıda: 'Notu okumadınız mı?' Merdiven boşluğunda: iki köpek, karşılıklı.", ['kapi_kac_kere']],
    ['ALGI', "İkinci katta: Nebahat Teyze, önlük, 'evladım'. Tek cümlede: Nusret, kiracı, börek, virgül, virgül, nokta yok. Merdivende: börek kokusu, inerken.", ['nebahat']],
    ['OTORİTE', "Kafa tutma. Hayri Abi'nin bardağında otuz bir yılın çayı var; senin elinde poşet. Dik dur, ama dinle.", ['hayri', 'kapici_hayri']],
    ['OTORİTE', "Kapıyı sonuna kadar açma. Hesap makinesine değil Nuri Bey'in gözüne bak. 'Enflasyon beyefendi' deyince sen de bir rakam söyle.", ['nuri']],
    ['EMPATİ', "Rex'in iç sesi: \"Çorba sıcak, çakıl soğuk, bu insan koşuyor; koşan insan kötü, çorba iyi, önce çorba.\"", ['dev_kopek']],
    ['EMPATİ', "Güvenliğin iç sesi: \"Çayım soğuyor, çocuk fişi okumamış, deftere yazarım, müdür görür, ben de yorulurum.\"", ['guvenlik_daire', 'guvenlik_misafir']],
    ['KAYNAK YÖNETİMİ', "Giden: öksürük, sessizlik, sonra para; haftalarca ertelenen bakım, bugün ödendi. Gelen: fatura. Kalan: gösterge, hâlâ sarı.", ['motor_ariza']],
    ['KAYNAK YÖNETİMİ', "Giden: elli lira, kuryeden kuryeye. Gelen: koli, üstünde adın, ağırlığı tahmin ettiğin kadar. Kalan: Ferhat'ın kaskında katlı ellilik, 'ayrı listede'.", ['kargo_ferhat']]
  ],
  ok: [
    ['MANTIK', "1. Uzatılan para. 2. Fişteki tutar. 3. Fark, kuruşu kuruşuna. Müşteri üç kere saydı, üçünde de 'tamam.'", ['para_ustu']],
    ['MANTIK', "1. Şikayet düştü. 2. İtiraz yazdın. 3. Çubuk doldu, boşaldı, doldu. Üç adım, bir cümle: 'İtiraz talebiniz alınmıştır.'", ['destek_uyari']],
    ['MANTIK', "1. Fişi okudun. 2. Kapıyı doğru çaldın. 3. Poşeti iki elle uzattın. Üç adım, bir düğme: bahşiş."],
    ['ELEKTROKİMYA', "Dondurma karda erimez, beklemeyi bilir; sıcak çay ince belli bardakta iki dakikada eli, on dakikada dili çözer.", ['kar_yokus']],
    ['ELEKTROKİMYA', "Nebahat Teyze'nin kuru fasulyesi tencerede değil merdivende pişer; her katta bir kaşık daha tereyağı kokar, kapıda tabak hazır olur.", ['nebahat', 'komsu_nebahat']],
    ['İÇ İMPARATORLUK', "Kurye Yıldız Apartmanı'nın kapısında adını söyler, bir kere; kapıcı otuz bir yıldır beklediği hemşerisini bulmuş gibi çayı ikinci bardağa böler.", ['hayri', 'kapici_hayri']],
    ['İÇ İMPARATORLUK', "Kurye kapıya varır, poşeti iki eliyle uzatır, 'afiyet olsun' der; destan bu kıtada bahşiş düğmesinin sesini duyar."],
    ['REFLEKS', "Gaz açık. Sol boş. Lastik tuttu. Ayna yerinde. Kapı erken. Pizza sıcak.", ['yagmur_viraj']],
    ['REFLEKS', "Yeşil yandı. Sen çıktın. Viraj temiz. Kapı senin. Dakika senin. Ferhat saydı.", ['hizli_ferhat']],
    ['VÜCUT KONTROLÜ', "Yokuş dik. Kar yirmi. Lastik döndü. Ayak yerde. Sen çıktın. Tepe senin. Cüzdan açık.", ['kar_yokus']],
    ['VÜCUT KONTROLÜ', "Paspas doğru. Fotoğraf çekildi. Kat seçildi. Tik yeşil. Kapı kapalı. Ses içeriden. Telefon titredi.", ['foto_kat']],
    ['ALGI', "Zilde: iki tel. Notta: bir sayı, bir 'değil'. Parmakta: doğru sayı. Kapıda: bahşiş hazır, köpek hazır, ikisi de elinde.", ['kapi_kac_kere']],
    ['ALGI', "Kapıda: pijama, kumanda, tek terlik. Koridorun dibinden: 'Benim!' Poşet: elden ele, arkaya. Kapı: kapandı. Düğme: basılmış, koridorun dibinden.", ['kapi_kime']],
    ['ALGI', "Kulübede: çay, Sisteme Kayıt Zorunludur kağıdı. Senden: daire numarası, telefona bakmadan. Bariyer: kalkıyor. Asansör: zeminde, kapısı açık.", ['guvenlik_daire']],
    ['ALGI', "Güvenliğin belinde: telsiz, susuyor. Senden: bir isim, fişsiz, aklından. Bariyer: kalkıyor, 'B Blok'. Asansörde: ayna, aynada gülen biri.", ['guvenlik_misafir']],
    ['OTORİTE', "Kapıyı tut. Rakamı sen söyle, Nuri Bey hesap makinesine yazsın. 'Enflasyon beyefendi' gelince başını salla, kirayı sallama.", ['nuri']],
    ['EMPATİ', "Rex'in iç sesi: \"Avuç tuzlu, çanta mercimek, bu insan yavaş; yavaş insan iyi, Nurten Hanım hızlı, önden gidelim.\"", ['dev_kopek']],
    ['EMPATİ', "Musti'nin iç sesi: \"kuzen kızmadı valla iyi çocuk annem sevinir bi sn şarj bitiyo halledicez\"", ['musti']],
    ['ANSİKLOPEDİ', "Bahşiş, Farsça 'bahşiden'den: vermek, bağışlamak. Kelime yüzyıllarca kayıkçıya, hamala, berbere uzandı; bugün bir düğmeye uzanıyor, parmak aynı parmak."]
  ]
};
function innerVoice(effects, eventId){
  const e = effects || {};
  const bad = (e.money<0) || (e.rating<0) || e.feeLost || e.complaint || (e.expenseDaily>0) || (e.expense>0);
  const good = (e.tip>0) || (e.tipPct>0) || (e.money>0) || (e.rating>0) || e.giftItem || (e.expenseDaily<0) || (e.expense<0);
  const choose = (list) => { const specific = list.filter(q => q[2] && q[2].includes(eventId)); const generic = list.filter(q => !q[2]); return pick(specific.length && Math.random() < 0.8 ? specific : generic); };
  if(bad && Math.random() < 0.75) return { kind:'fail', q: choose(INNER_VOICE.fail) };
  if(good && !bad && Math.random() < 0.4) return { kind:'ok', q: choose(INNER_VOICE.ok) };
  return null;
}

/* =====================================================================
   MÜŞTERİ YORUMLARI — gün sonunda gösterilir.
   {t: metin, w: sadece bu havada, n: sadece gece, k: sadece bu not anahtarında, f: en az bu kat, voice: arşetip}
   Yer tutucular: {item} ürün, {rest} restoran, {name} müşteri, {kurye} kurye adı, {floor} kat.
   {kurye} adı henüz söylenmemişse düz "Kurye" olur; bu yüzden yer tutucunun yanına ayrıca "kurye" yazılmaz.
   Arşetipler (REGULARS.voice ile aynı anahtarlar; biçim her yorumda sabittir):
     anne     büyük harf yok, Türkçe karakter yok, noktalama yok, "evladim"
     emekli   TAMAMI BÜYÜK HARF, hayır dua, imza
     plaza    İngilizce isimler, "10/10"
     troll    kusursuz dil bilgisi, ilkesel tek yıldız; ilke açıklanmaz
     ogrenci  "ya kanka"
     eksi     küçük harf, "hocam", "(bkz: …)" — yana sıçrar, şakayı açıklamaz
   k: anahtarı her notu yakalar (müdavim olmayanların notu NOTES'tan gelir); yorum, o anahtarın
   bütün notlarında ortak olan şeyi söyler (tiplater: "bahşiş sonra" — pencere yok, zil yok).
   Yer tutucuya giren değerler arşetipin biçimine çevrilir (anne: küçük+ASCII, emekli: BÜYÜK, eksi: küçük).
   ===================================================================== */
const REVIEWS = {
  good: [
    {voice:'anne', k:'nobell', t:'zile basmadi evladim tirnakla tiklatti torun uyanmadi {item} de sicacik geldi allah ne muradin varsa versin {kurye} evladim ⭐⭐⭐⭐⭐'},
    {voice:'anne', t:'{item} sicacik geldi evladim posetin dibi kupkuru {rest} bu sefer pecete de koymus kurye cocuk kapida ayakkabisini cikardi ben de bir cay ikram ettim ⭐⭐⭐⭐⭐'},
    {voice:'anne', f:2, t:'cocuk {floor} kati kosarak cikmis evladim nefes nefese kapida {item} sicacik bir bardak su verdim icti allah yolunu acik etsin ⭐⭐⭐⭐⭐'},
    {voice:'emekli', k:'knock', t:'KAPIYI YAZDIĞIM SAYIDA ÇALDI, KOMŞU KAPISI AÇILMADI. PARA ÜSTÜNÜ MASADA SAYDIM, TAM. {item} SICAKTI. ALLAH RAZI OLSUN EVLADIM. SAYGILARIMLA, {name} ⭐⭐⭐⭐⭐'},
    {voice:'emekli', t:'{kurye} EVLADIM KAPIDA ADIMI SESLENDİ, SOL KULAĞIM DUYDU. {item} SICAK, FİŞ ELİMDE, DOSYALADIM. HAYIRLI İŞLER, ALLAH UTANDIRMASIN. {name} ⭐⭐⭐⭐⭐'},
    {voice:'emekli', t:'POŞETİ İKİ ELİYLE UZATTI, FİŞİ ÜSTÜNE KOYMUŞ. {item} SICAK, {rest} BU SEFER TUZU DA KOYMUŞ. BÖYLE EVLAT YETİŞTİRENE RAHMET. {name} ⭐⭐⭐⭐⭐'},
    {voice:'plaza', k:'guest', t:'Rider güvenliğe doğru ismi verdi, resepsiyona smooth bir drop, {item} hâlâ warm. Timing 10/10, communication 10/10. {rest} için de bir shoutout. ⭐⭐⭐⭐⭐'},
    {voice:'plaza', t:"{kurye} end-to-end bir delivery experience yaşattı: lobby'de call, kapıda eye contact, {item} intact. 10/10, would order again. ⭐⭐⭐⭐⭐"},
    {voice:'plaza', t:"Rider proactive'di: lobby'den call, 'geliyorum' notification'ı, kapıda {item} warm. Experience 10/10, {rest} packaging 9/10 ama rounding up. ⭐⭐⭐⭐⭐"},
    {voice:'troll', t:'{kurye} kusursuzdu; {item} sıcak, paket sağlam, selamı ölçülüydü. Bir yıldız veriyorum. İlkemdir; ilkeler açıklanmaz, uygulanır. ⭐'},
    {voice:'troll', w:'rain', t:'{rest} zamanında, {item} eksiksiz, kurye yağmurun altında bile nazikti. Tek yıldız; yağmur ilkemi ıslatmaz. ⭐'},
    {voice:'troll', t:'{item} sıcak, {rest} fişi eksiksiz, {kurye} sessiz ve hızlıydı. Bir yıldız, bugün de. ⭐'},
    {voice:'ogrenci', k:'tiplater', f:2, t:"ya kanka 'bahşiş sonra' dedim, yine de {floor}. kata koşarak çıktı, {item} sıcak geldi, 'sonra da olur' dedi güldü. adam gibi adam ⭐⭐⭐⭐⭐"},
    {voice:'ogrenci', t:"ya kanka {kurye} abi kapıda 'vize nasıl geçti' diye sordu, ilk kez biri sordu ya. {item} de sıcaktı, bahşişi bu sefer gerçekten verdim ⭐⭐⭐⭐⭐"},
    {voice:'ogrenci', t:"ya kanka {kurye} abi {rest} poşetinin yanında bir de ketçap getirmiş, istemedim bile. {item} sıcak, ev arkadaşım bile teşekkür etti ⭐⭐⭐⭐⭐"},
    {voice:'eksi', t:'hocam {kurye} paketi dik tutmuş, {item} kapağında değil tabağında. bu ülkede nadir rastlanan olay (bkz: geçen kurye) (bkz: kedi) ⭐⭐⭐⭐⭐'},
    {voice:'eksi', w:'snow', t:'{rest} paketini kar altında kedinin yanından geçirip kediyi seven ama paketi kediye vermeyen kurye. hocam bar bu kadar düşmüş işte, adam efsane oldu (bkz: {item}) ⭐⭐⭐⭐⭐'},
    {voice:'eksi', t:'hocam {kurye} kediyi sevmiş, paketi bana vermiş, sırayı doğru kurmuş. {item} sıcak. nadir (bkz: sıralama) (bkz: kedi yine mutlu) ⭐⭐⭐⭐⭐'}
  ],
  bad: [
    {voice:'anne', k:'nobell', t:'zile basti evladim hem de iki kere torun uyandi bir saat salladim {item} sogudu kapida bir de bana abla diyor ben anneanneyim ⭐⭐'},
    {voice:'anne', t:'poset yirtilmis evladim {item} kagidi dagilmis cocuga kizamadim yuzu kipkirmizi ama yemek gitti {rest} bir sey yapsin ⭐⭐'},
    {voice:'anne', t:'cocuk kapida telefonla konusuyordu evladim {item} elinde sogudu bir de bana hanim teyze dedi anne diyecek anne ⭐⭐'},
    {voice:'emekli', k:'knock', t:"KAPIYI ÜÇ KERE ÇALDI, KOMŞU HİKMET AÇTI, {item} HİKMET'İN ELİNDE GELDİ. FİŞ YOK, DOSYAYA KOYACAK BİR ŞEY YOK. ALLAH ISLAH ETSİN. {name} ⭐⭐"},
    {voice:'emekli', t:'PARA ÜSTÜNÜ EKSİK VERDİ, MASADA SAYDIM, SONRA BİR DAHA SAYDIM. {rest} FİŞİ DE YOK. ALLAH SELAMET VERSİN AMA HESAP HESAPTIR. {name} ⭐⭐'},
    {voice:'emekli', t:'{rest} FİŞİNİ VERMEDİ, DOSYAMDA BOŞLUK KALDI. {item} ILIK, POŞET BUĞULU. ALLAH AKIL FİKİR VERSİN, GENÇ DAHA. {name} ⭐⭐'},
    {voice:'plaza', k:'guest', t:"Rider güvenliğe 'misafir' demeyi unutmuş, bariyer kalkmamış, ben lobby'ye indim. {item} lukewarm. Process 3/10, attitude 10/10 ama sonuç önemli. ⭐⭐"},
    {voice:'plaza', t:"Call'um ignore edildi, paket kapıya bırakılmış, fotoğraf blurry. {item} cold. Punctuality 10/10 olsa da burada bitmiyor, follow-up yok. ⭐⭐"},
    {voice:'plaza', t:"Rider resepsiyonu bypass edip direkt kapıya gelmiş, {item} warm ama process yok. Delivery 6/10, güvenlik ekibimiz 10/10, onlar için de bir learning. ⭐⭐"},
    {voice:'troll', t:"Kurye kapıda telefonla konuşuyordu, {item} ılıktı, 'bir saniye' kırk saniye sürdü. Bir yıldız veriyorum, fakat her zaman verdiğim için değil; bu kez hak edildi. ⭐"},
    {voice:'troll', f:3, t:"{floor}. kata çıkmayı 'kapıya bırakıyorum' mesajıyla ikame etmiş; {item} zemin kattaki paspasta buldum. İlkesel bir yıldızım bugün bir de gerekçe kazandı. ⭐"},
    {voice:'troll', t:"{item} soğuk geldi, {rest} fişi poşette ıslanmıştı. Bir yıldız; bugün ilkem ve gerçek aynı yöne baktı. ⭐"},
    {voice:'ogrenci', k:'tiplater', t:"ya kanka 'bahşiş sonra' dedim diye mi {item} 40 dk kapıda beklemiş, soğumuş. kyk yatınca da vermem artık ⭐⭐"},
    {voice:'ogrenci', t:"ya kanka {item} eksik geldi, kurye 'restoran öyle verdi' diyor, {rest} 'kurye öyle götürdü'. ev arkadaşım aç aç bana bakıyor ⭐⭐"},
    {voice:'ogrenci', t:"ya kanka kurye kapıyı yanlış daireye çalmış, karşı komşu '{item} geldi' diye seslendi, ev arkadaşım terlikle gitti aldı ⭐⭐"},
    {voice:'eksi', t:'hocam kurye paketi kediye vermiş. kediye. not yazdım, okumamış. {item} şu an kapı önünde, kedinin yanında (bkz: okumayan kurye) (bkz: kedi mutlu) ⭐'},
    {voice:'eksi', n:true, t:"hocam gece 12'de zile 4 kere basmış, apartman grubu karıştı, komşu beni etiketledi. {item} güzeldi ama grubu okumadan uyuyamadım (bkz: apartman whatsapp grubu) ⭐⭐"},
    {voice:'eksi', t:"hocam {item} geldi de yarısı poşetin dibinde geldi. kurye 'yolda sarsıldı' dedi. yol sarsmış, kurye değil (bkz: yolun savunması) ⭐⭐"}
  ],
  meh: [
    {voice:'anne', t:'geldi verdi gitti evladim {item} ilikti ne sicak ne soguk cocuk da oyleydi ne guler ne konusur neyse saglik olsun ⭐⭐⭐⭐'},
    {voice:'anne', t:'{rest} catal koymamis evladim ben kendi catalimla yedim kurye cocugun sucu yok ama puani nereye verecegimi bilemedim ortadan verdim ⭐⭐⭐'},
    {voice:'emekli', t:"ZAMANINDA GELDİ, {item} SICAKTI, FİŞİ VERDİ. SONRA 'İYİ GÜNLER' DEMEDİ, GENÇLİK BÖYLE. ALLAH SABIR VERSİN, İYİ ÇOCUK. {name} ⭐⭐⭐⭐"},
    {voice:'emekli', n:true, t:'GECE ON BİRDE GELDİ, PARA ÜSTÜ TAM, {item} ILIK. BİRİ İYİ BİRİ KÖTÜ, ORTASI DÖRT. ALLAH HAYIRLI KISMET VERSİN. SAYGILARIMLA, {name} ⭐⭐⭐⭐'},
    {voice:'plaza', t:"Delivery on time, {item} okay, rider'ın energy'si low. Overall 7/10, resepsiyon 10/10 çünkü resepsiyon her zaman 10/10. ⭐⭐⭐⭐"},
    {voice:'troll', t:'Teslimat sıradan geçti: {item} ılık, kurye sessiz, paket düzgün. Bir yıldız veriyorum; sıradanlık cezalandırılmaz, fakat ödüllendirilmez de. İlkem budur. ⭐'},
    {voice:'troll', t:"{kurye} kapıda 'iyi akşamlar' diyerek öğlen iki buçukta ayrıldı. Yorgunluğunu anlıyorum, puanımı değiştirmiyorum; bir yıldız, her koşulda. ⭐"},
    {voice:'ogrenci', t:"ya kanka normaldi, {item} geldi yedik. kurye 'kolay gelsin' diye bağırdı pencereye, ben de ona. 4 verdim çünkü 5 çok resmi ⭐⭐⭐⭐"},
    {voice:'eksi', t:'hocam {item} iyiydi kuryeyi görmedim bile, kedi gördü. puanı kediye mi yemeğe mi vereceğimi çözemedim, ortaladım (bkz: kedinin puanı) ⭐⭐⭐⭐'},
    {voice:'eksi', t:'hocam kurye kaskını çıkarmadı, yüzünü görmedim, {rest} poşeti de düğümlüydü, dişimle açtım. kask içinden bir merhaba geldi galiba (bkz: düğüm) ⭐⭐⭐'}
  ]
};
/* Yer tutucu değerlerini arşetipin biçimine çevirir. */
const VOICE_CASE = {
  anne: s => String(s).toLocaleLowerCase('tr-TR').replace(/[çğıöşüâî]/g, c => ({'ç':'c','ğ':'g','ı':'i','ö':'o','ş':'s','ü':'u','â':'a','î':'i'})[c]).replace(/[^\p{L}\p{N}\s]/gu, ''),
  emekli: s => String(s).toLocaleUpperCase('tr-TR'),
  eksi: s => String(s).toLocaleLowerCase('tr-TR')
};
function fillReview(raw, d, voice){
  const cv = VOICE_CASE[voice] || (s => String(s));
  const vals = {
    item: cv((d.item || '').replace(/\s*\(.*?\)/, '')),
    rest: cv(d.rest || ''),
    name: cv(d.customer || ''),
    kurye: cv(S.name || 'Kurye'),
    floor: String(d.floor || '')
  };
  return raw.replace(/\{(item|rest|name|kurye|floor)\}/g, (m, k) => vals[k]);
}
function makeReviews(){
  const list = (S.dayDeliveries || []).slice();
  shuffle(list);
  S.usedReviews = S.usedReviews || [];
  const fresh = (arr) => arr.filter(r => !S.usedReviews.includes(r.t));
  return list.slice(0, 3).map(d => {
    const ev = d.eventId ? EVENTS.find(e => e.id === d.eventId) : null;
    const isGood = d.delta > 0 || d.tip > 40, isBad = d.delta < 0 || d.bad;
    const base = isGood ? REVIEWS.good : (isBad ? REVIEWS.bad : REVIEWS.meh);
    const fits = base.filter(r => (!r.w || r.w === S.weather) && (!r.n || d.night) && (!r.k || r.k === d.noteKey) && (!r.f || d.floor >= r.f));
    const same = d.voice ? fits.filter(r => r.voice === d.voice) : [];
    const evPool = ev && ev.reviews ? (isBad && ev.reviews.bad ? ev.reviews.bad : (isGood && ev.reviews.good ? ev.reviews.good : null)) : null;
    const evList = evPool ? evPool.map(t => ({ t, voice: null })) : [];
    // Öncelik: müdavimin kendi sesi (taze) → olaya özel yorum (taze) → müdavimin kendi sesi (tekrar) → herhangi taze → ne varsa.
    // Müdavim kendi sesini tekrar etsin, başka bir arşetipin ağzıyla konuşmasın (Fatma Anne plaza yorumu yazmaz).
    let chosen = null;
    for(const cand of [fresh(same), fresh(evList), same, fresh(fits), evList, fits]){ if(cand.length){ chosen = pick(cand); break; } }
    if(!chosen) return { name: d.customer, text: '' };
    S.usedReviews.unshift(chosen.t); S.usedReviews = S.usedReviews.slice(0, 24);
    return { name: d.customer, text: fillReview(chosen.t, d, chosen.voice) };
  });
}
