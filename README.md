# KapitalEats

"Papers, Please" tarzı karar mekanikleri olan satirik kurye simülasyonu. Tek dosya (`index.html`), dikey ekran, telefon tarayıcısında çalışır. Kurulum yok.

## Oynamak

`index.html` dosyasını tarayıcıda aç. Telefonda "Ana ekrana ekle" ile uygulama gibi kullanılabilir.

## Düzenlemek

Bütün oyun `index.html` içinde. Üst kısımdaki veri blokları içerik için yeterli:

- `CONFIG` ekonomi ve denge ayarları
- `GOALS` hedefler, `NEWS` haberler, `WEATHER` hava
- `RESTAURANTS` menüler ve sloganlar, `DISTRICTS` ilçeler ve sokaklar, `NOTES` müşteri notları
- `INNER_VOICE` iç ses, `REVIEWS` müşteri yorumları
- `EVENTS` olaylar (şablon dosyanın sonunda `EVENT_TEMPLATES` içinde)
- `SHOP` kozmetikler ve yan gelir
