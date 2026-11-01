# KapitalEats — oyun tasarımı (v8)

Tek cümle: Bir kurye, ihtiyacı olmayan pahalı bir şey için teslimat yapar; onu geri getiren şey para değil, mahalledir.

## Döngü

**Oturum (3-6 dk)**: fiş → damga → sürüş → olay ya da hikaye anı → sonuç → gün sonu → YARIN kartı → "Uyu → Yarın: …".
**Gün**: sabah bülteni (takvim şeridi, haber, hava, Günün Görevi, varsa Musti'nin mesajı ya da özel gün kararı) → 6 tur (ilk gün 4) → gün sonu (kutlama, defter, taksit, Nuri Bey kapıda, yorumlar, Usta Cemil ve dükkan, YARIN).
**Hafta**: pazartesi "Kullanım Koşulları Güncellendi" (bir kural), 5./12./19. gün özel gün (derbi, boykot, kar), pazar sertifika ve program daveti.
**Koşu**: hedef 4 taksitle alınır (Sepette → Dağıtımda), kutuyu Ferhat getirir. Kovulma koşuyu bitirmez: Musti'nin kimliğiyle devam edilir. Mahalle (karakterler, olgular, hatıralar, sonlar) hiçbir sonla silinmez.

Üç ufuk: **bugün** (görev, uçan rakamlar), **bu hafta** (taksit, özel gün, kural), **mahalle** (beş hikaye, üç son).

## Sistemler

| sistem | dosya | kısa |
|---|---|---|
| Enerji | 52-helpers, 63-results | teslimat başına mesafe, kat, gece, hava; düşükse kötü sonuçlar olasılaşır, "Enerjin bitiyor" ve "Bayıldın" |
| Motor aşınması | 52, 62, 64 | km birikir; %50 üstü arıza, Usta Cemil pazarlığı |
| Puan ve şikayet | 63 | olaysız teslimat +0,03, günde en fazla 1 puan düşer, ilk 3 gün taban 3,0; 5 şikayette askıya alma, 5 günde bir şikayet erir |
| Hikayeler | 42-arcs-*, 61, 62 | günde bir an; fiş (tanıdık adres), yol (Ferhat), telefon (Musti), kapı (Nuri Bey); atlanırsa ertesi gün herhangi bir siparişte |
| Olgular ve hatıralar | 50, 52 | META.facts, META.keepsakes; sayılar P() ile okunur |
| Görev | 43, 61 | günde bir; dörtte biri platformun sahte görevi |
| Taksit | 64 | zam sadece ödenmemiş kısma, tavan ×1,3 |
| Özel gün / kural / program | 44, 61, 64 | sabah kararı (boykot), pazartesi kuralları, pazar programları |
| Geri dönen müşteri / müdavim | 61, 63 | META.customers, REGULARS |
| YARIN kartı | 64 | hava sızıntısı (%80 doğru), hikaye kancası, taksit mesafesi, ayrılmış sipariş |

## Yazım

Karakter ağızları ve yazım kuralları `docs/CONTENT_CONTRACT.md` içinde. Doğrulama: `node tools/validate-content.js`.
