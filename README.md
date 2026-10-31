# KapitalEats

"Papers, Please" tarzı karar mekanikleri olan satirik kurye simülasyonu. Dikey ekran, telefon tarayıcısında çalışır, kurulum yok.

## Oynamak

`index.html` dosyasını tarayıcıda aç. Telefonda "Ana ekrana ekle" ile uygulama gibi kullanılabilir.

## Geliştirmek

Kaynak `src/` altında parçalara ayrılmıştır; `index.html` bu parçalardan üretilir, elle düzenleme.

```
node build.js              # src/ → index.html
node build.js --artifact   # src/ → dist/kapitaleats.html (claude.ai artifact için iskeletsiz sürüm)
node tools/playtest.js --days 3 --policy random   # headless oyun testi (Playwright gerekir)
```

`src/js/` dosyaları ada göre sıralanıp birleştirilir:

- `30-config.js` ekonomi ve denge ayarları
- `31-goals-weather-news.js` hedefler, hava, haberler
- `32-orders-data.js` restoranlar ve menüler, ilçeler ve sokaklar, müşteri notları, platform bildirimleri
- `33-voice-reviews.js` iç ses, müşteri yorumları
- `40-events.js` olaylar (şema dosyanın başında açıklanır), `70-templates.js` boş şablonlar
- `41-shop.js` kozmetikler ve yan gelir
- `50-…`–`66-…` durum, ses, yardımcılar, ekran akışı
