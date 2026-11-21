# ToneFinder tasarım dili (Kasım 2026, "Rock'n'roll")

Ana sayfa düzeni Tripadvisor gibi keşif sitelerinden esinlenildi: ortada büyük soru başlığı ve iri arama
çubuğu, altında büyük renkli tanıtım bloğu, görselli kart şeritleri ve kategori kutuları. Birebir kopya
değil; hiçbir markanın logosu, adı ya da görseli kullanılmaz.

## Renkler (yalnız dört aile)
- **Beyaz** zemin (`--color-paper`), açık uzay grisi paneller (`--color-panel #f4f5f6`, `--color-raised #e9eaec`).
- **Siyah** başlıklar, metin ve koyu düğmeler (`--color-ink #0f1012`).
- **Petrol mavisi** ana renk: birincil düğmeler, tanıtım bloğu, orijinal ton bandı (`--color-petrol #0b5f6b`,
  koyusu `#074751`, açığı `#e3eff1`, parlak `#2a9aab`).
- **Uzay grisi** ikincil metin ve nötr alanlar (`--color-space #4a4d53`, `--color-ink-soft`, `--color-ink-mute`).
- Durum renkleri (kaynaklı / muhtemel / tahmin) yalnız küçük noktalarda: yeşil, kehribar, kırmızı.

## Yazı
- Başlıklar: **Archivo** 800, sıkı harf aralığı (`.headline`). Gövde: **Inter**. Fontlar `public/fonts`
  içinde gömülü; lisanslar `OFL-*.txt`.

## Parçalar
- Düğmeler: `.pill` + `pill-primary` (petrol), `pill-dark` (siyah), `pill-ghost` (siyah çerçeve), `pill-soft` (gri).
- Arama: tek iri yuvarlak kutu (`SongSearch`), sağında "Tonu bul". Grup adı yazılınca grup satırı çıkar,
  "Şarkılarını gör" ile grubun popüler şarkıları listelenir.
- Bölüm seçimi ana sayfada arama kutusunun üstünde sekme olarak (Solo / Ritim / Riff / Temiz / Genel).
- Popüler 100 (`components/Popular.tsx`): tanıtım bloğu, "En çok çalınanlar" yatay şeridi, "Gruba göre keşfet"
  kutuları ve süzülebilir tam liste. Kartlarda sıra rozeti, bölüm etiketi ve zorluk noktaları (`Dots`).
- Sayfa başı: `PageBand` — koyu renkli blok (petrol ya da siyah) + kalın başlık.
- Simge: siyah kare üstünde petrol mavisi ton düğmesi (`AppMark`, `public/tonefinder.ico`).

Ortak parçalar `components/ui.tsx`, renkler ve temel sınıflar `app/globals.css` içinde.
