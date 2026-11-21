# ToneFinder tasarım dili (Kasım 2026)

Müzik kataloğu siteleri (özellikle Epidemic Sound) örnek alınarak yenilendi. Amaç **benzer tasarım dili**,
birebir kopya değil: hiçbir markanın logosu, adı, illüstrasyonu ya da görseli kullanılmaz.

## Temel kurallar
- **Zemin:** koyu kömür (`--color-paper #121314`), paneller `#1b1c1f`, yükseltilmiş alanlar `#24262a`.
- **Karşılama bandı:** yalnız boş araştırma ekranında, krem zemin (`--color-cream #efede6`) üstünde büyük serif başlık.
- **Yazı tipleri:** başlıklar *Fraunces* (serif, `.serif` sınıfı), gövde ve küçük etiketler *Inter*.
  Fontlar `public/fonts` içinde gömülü (uygulama çevrimdışı da aynı görünür). Lisanslar `OFL-*.txt`.
- **Düğmeler:** hap biçimli `.pill` + `pill-light` (koyu zeminde birincil), `pill-dark` (krem zeminde), `pill-ghost`.
- **Renkli kartlar:** düz, doygun renkler (`--color-c-*`: lime, pembe, turuncu, mor, sarı, mavi, kırmızı, nane),
  üstündeki yazı her zaman koyu (`--color-cream-ink`). Şarkıya göre renk `colorFor(başlık)` ile sabit seçilir.
- **Sayfa başı:** `PageBand` — renkli üst alan + küçük büyük-harf etiket + serif başlık, altında koyu açıklama şeridi.
- **Listeler:** Tonlarım ve "Son araştırmaların" parça listesi gibi kapaklı satırlar (`ToneRows`).
- **Sinyal zinciri:** kategori renkli bloklar; seçili blok o rengin düz dolgusu, diğerleri üstte renkli şerit.
- **Vurgu:** lime (`--color-accent #d4f28a`) yalnız düğme halkası, etkin durum ve önemli sayılar için.
- **Simge:** koyu kare üstünde lime ton düğmesi ve pembe merkez (`AppMark`, `public/tonefinder.ico`).

Ortak parçalar `components/ui.tsx`, renkler ve temel sınıflar `app/globals.css` içinde.
