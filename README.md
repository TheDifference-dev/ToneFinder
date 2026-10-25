# ToneFinder

Guitar Tone Finder — yapay zekâ destekli gitar ton bulucu (ToneAdapt benzeri), masaüstü uygulaması.

Ünlü bir şarkının solosunu ya da bir bölümünü seçersin. ToneFinder:

1. **Stüdyo kaydını araştırır** — o kayıtta kullanılan gitar ve manyetik, amfi ve kanalı, kabin ve
   hoparlörler, mikrofonlar (konum ve mesafe), pedallar ve ayarları; röportajlar, rig dökümleri ve
   forumlardan, kaynaklarıyla. Her bilgi "kaynaklı / muhtemel / tahmin" diye işaretlenir.
2. **Senin ekipmanına çevirir** — senin amfin (her marka/model), varsa gitar prosesörün
   (HeadRush, Helix…), gitarın ve pedalların ile aynı tona nasıl ulaşacağını söyler:
   - amfide hangi kanal ve düğme ayarları,
   - prosesörde hangi amfi/kabin/mikrofon/efekt modelleri ve ayarları,
   - her pedalında hangi düğme nerede, zincirde nereye takılacağı,
   - gitarda hangi manyetik konumu, volume ve tone ayarı,
   - gitar farkı telafisi (ör. orijinalde Les Paul humbucker, sende Strat single-coil).

Ayrıca:
- **Şarkı arama:** yazdıkça öneri ve kapak resmi (iTunes, olmazsa Deezer; anahtarsız). Gitar/bas,
  bölüm ve ton türü (Otomatik / Temiz / Distorsiyonlu) seçimi, popüler şarkı kısayolları.
- **Ekipman:** amfinin kendi efektleri, pedal listesi (60 pedallık katalogdan öneri ve düğme adları).
- **Sonuç:** her ayarın yanında dayanağı (kaynaklı / çıkarım / kontrol et), zorluk (1–5), ekipmanla ne kadar
  yaklaşılabileceğinin tahmini (%), ton özellikleri, sınırlamalar, alternatifler, Songsterr tab ve backing
  track bağlantıları, "Ayarları kopyala".
- **Kayıtlı araştırma:** şarkının orijinal tonu bir kez araştırılır ve `~/.tonefinder/cache/` altında saklanır;
  aynı şarkı tekrar sorulunca yalnız senin ekipmanına uyarlama yapılır (daha hızlı, daha ucuz, tutarlı).
  "Orijinali yeniden araştır" ile yenilenir.
- **Orijinal ton önce gelir:** şarkının orijinal ekipmanı hazır olur olmaz ekranda görünür, uyarlama arkada sürer.
- **Birden çok rig:** "Ev", "Prova" gibi ekipman setleri arasında tek tıkla geçiş.
- **Amfi seçilince** katalogdaki kanal/modlar gösterilir, amfide olan efektler kendiliğinden işaretlenir.
- **Stok olmayan manyetikler** (ör. Strat köprüsünde Seymour Duncan JB) pozisyon başına girilebilir.
- **"Web'de tanıt":** katalogda olmayan amfi, prosesör, gitar ya da pedal web'de araştırılır; kanalları, düğmeleri
  ve efektleri `~/.tonefinder/gear/` altına kaydedilir ve sonraki aramalarda kullanılır. Böyle bir ürün yoksa söyler.
- **Sonuçta:** her bloğun orijinale göre "birebir / yakın / yerine" olduğu, "önce şu preseti/kanalı yükle",
  her ayarın nedeni, "bu tonda dokunma" listesi, manyetik seçici grafiği, araştırma uyarıları ve şarkının diğer
  bölümleri (ör. temiz ara bölüm, solo) için yalnız değişen ayarlar.
- **Bas:** bas gitarlar (P, J, StingRay, SR, Rickenbacker, Thunderbird...), bas dizilimleri ve bas amfileri
  (Ampeg, Fender Rumble, Markbass, Orange, Katana Bass, GK, Darkglass).
- **Tonlarım:** kayıtlı tonlar ve son 20 sonuç (geçmiş), listeden silme, ".tonefinder.json" olarak dışa/içe aktarma.
- **"Kulağa yanlış mı geliyor?":** ayarları deneyip neyin farklı olduğunu yazarsın; orijinal araştırma korunur,
  ayarlar geri bildirimine göre yeniden uyarlanır.

## Masaüstüne kurulum (bir kez)

1. [Node.js](https://nodejs.org) **LTS** sürümünü kur.
2. **GitHub Desktop** → *File → Clone repository* → `TheDifference-dev/ToneFinder` reposunu klonla.
3. Klonladığın klasörde **`Masaustu-Kisayolu-Olustur.bat`** dosyasına çift tıkla
   (Mac'te `npm run shortcut`). Masaüstüne ve Başlat menüsüne ToneFinder simgesi eklenir.
4. İlk açılışı klasördeki **`ToneFinder.bat`** (Mac'te `ToneFinder.command`) ile yap: paketler
   kurulur ve uygulama hazırlanır, birkaç dakika sürebilir. Sonraki açılışlar birkaç saniyedir.
5. Uygulama açılınca **Ayarlar** ekranına Anthropic API anahtarını gir (aşağıya bak).

## Her açılışta ne olur

Masaüstündeki **ToneFinder** simgesine tıkladığında:

1. GitHub'dan son güncellemeler çekilir (`git pull`; GitHub Desktop'un kendi git'i de bulunur),
2. gerekirse yeni paketler kurulur ve uygulama yeniden derlenir,
3. uygulama bu bilgisayarda başlar ve **kendi penceresinde** açılır (Edge/Chrome uygulama modu,
   adres çubuğu yok),
4. pencereyi kapatınca arka plandaki sunucu da kapanır.

Uygulama yalnızca bu bilgisayarda çalışır (`127.0.0.1:3210`); internete açılan bir site değildir.
İnternet yalnızca yapay zekâ araştırması ve güncelleme için kullanılır.

## Araştırma motoru: API anahtarı olmadan

ToneFinder iki adımda çalışır:

1. **Araştır** — şarkının stüdyo kaydındaki gitar, manyetik, amfi, kabin, mikrofon ve pedallar (kaynaklı).
2. **Ekipmanına çevir** — bu tonu senin rig'ine göre düğme düğme ayarlar.

1. adım **API anahtarı olmadan** çalışır: bilgisayarda kurulu **Claude Code** komut satırı (`claude`)
kullanılır, araştırma senin Claude aboneliğinle yapılır. Bir kez:

1. PowerShell'de: `irm https://claude.ai/install.ps1 | iex`
2. `claude` yazıp hesabınla giriş yap, sonra ToneFinder'ı yeniden aç.

Uygulama Claude Code'u yalnız web araması ve sayfa okuma araçlarıyla çalıştırır (dosya ya da komut
izni yok, kendi eklenti/hook ayarların devreye girmez). Bir araştırma ~1 dakika sürer.
Ayarlar penceresi hangi motorun kullanıldığını gösterir.

2. adım şimdilik API anahtarı ister (aşağıda).

## API anahtarı

Araştırma Anthropic'in yapay zekâsıyla (web araması dahil) yapılır ve bir API anahtarı gerekir:

1. https://console.anthropic.com adresinde hesap aç.
2. *Billing* bölümünden kredi yükle (Claude aboneliğinden ayrı ücretlendirilir; bir şarkı
   araştırması tahminen 0,3–1 $).
3. *API Keys* bölümünden anahtar oluştur ve uygulamadaki **Ayarlar** ekranına yapıştır.

Anahtar yalnızca bu bilgisayarda `~/.tonefinder/settings.json` dosyasında saklanır; uygulama
güncellense de silinmez. (`ANTHROPIC_API_KEY` ortam değişkeni varsa o kullanılır.)

### API anahtarı olmadan

`artifact/tonefinder.html` aynı aracın claude.ai'de çalışan sürümüdür; kendi Claude
aboneliğini kullanır, ayrı ödeme gerekmez. İnternette arama yapmaz, Claude'un kendi bilgisini ve
uygulamadaki doğrulanmış model listelerini kullanır. Güncellemek için `npm run build:artifact`.

## Amfi ve gitar kataloğu

Uygulama, yazdığın amfiyi ve gitarı kataloglarla eşleştirir ve yapay zekâya ayrıntılı profilini verir:

- **Amfiler** (`lib/amps.ts`): Boss (Dual Cube LX, Katana Gen 3 / MkII, Cube Street II, Nextone),
  Roland (JC-120, Blues Cube), Marshall (1959 Plexi, JTM45, JCM800, Silver Jubilee, JVM, DSL, Origin,
  MG Gold, CODE), Fender (Deluxe/Twin/Princeton Reverb, '59 Bassman, Blues Junior, Hot Rod, Mustang,
  Champion, Frontman), Vox (AC30, AC15/AC10/AC4, Valvetronix VT-X, Pathfinder), Orange (Rockerverb,
  Terror, TH30, OR15/Dual Terror, Crush), Mesa/Boogie (Mark V, Mark IV/IIC+, Rectifier), Peavey
  (6505/5150, Classic 30), EVH (5150III), Blackstar (HT, ID:Core, St. James), Yamaha (THR).
  Her biri için kanallar, modlar, kontroller, ses karakteri ve monitör olarak kullanım notu.
  Güncel seriler ve tonda önemli klasik modeller kapsanır; listede olmayan amfiler araştırma sırasında bulunur.
- **Amfi kullanım şekli**: amfi olarak / monitör (Stereo In, ton prosesörden) / prosesör amfinin önünde /
  4 kablo. Ton bu seçime göre amfide ya da prosesörde kurulur.
- **Gitarlar** (`lib/guitars.ts`): Fender, Squier, Gibson, Epiphone, Ibanez, PRS, ESP/LTD, Jackson,
  Schecter, Gretsch, Yamaha; modellerin manyetik dizilimi ve ton karakteri, manyetik türlerinin
  (single-coil, humbucker, P-90, aktif, Filter'Tron) profili ve seçici konumları.

## Doğrulanmış model listeleri

Prosesör ve modelleme amfilerinde model adlarının doğru olması için bazı cihazların resmî
listeleri uygulamaya gömülüdür (`lib/devices/`):

| Cihaz | Kaynak |
|---|---|
| HeadRush Core (Prime, Flex Prime, Pedalboard, MX5…) | headrushfx.com Core "Full List" (amfi, kabin, mikrofon, IR, efekt → esinlendiği gerçek ekipman) |
| Line 6 Helix / HX Stomp / POD Go | line6.com Helix 3.80 model listesi |
| Boss Katana Gen 3 / MkII | BOSS Tone Studio for Katana Gen3 parametre kılavuzu |
| IK Multimedia AmpliTube 5 (CS / SE / AmpliTube 5 / MAX) | IK'nın sürüm karşılaştırma tablosu (tüm 416 gear ve hangi sürümde olduğu) ve AmpliTube 5 User Manual |

Diğer amfi ve prosesörler için kanal, model ve düğme bilgileri araştırma sırasında web'den bulunur.

## Evdeki bilgisayarı uzaktan yönetmek

Klasördeki **`Uzaktan-Kontrol.bat`** bu bilgisayarda bir Claude Code oturumu başlatır
(`claude remote-control`). Pencere açık kaldıkça oturum telefondaki ve claude.ai'deki Claude Code
listesinde görünür; oradan yazılan işler bu bilgisayarda, bu klasörde çalışır. Bilgisayar kapalıyken
bulut oturumları kullanılır.

- Önce Claude Code'u kur (PowerShell): `irm https://claude.ai/install.ps1 | iex`
- Windows açılınca kendiliğinden başlasın istersen: `Win + R` → `shell:startup` → açılan klasöre
  `Uzaktan-Kontrol.bat` için kısayol koy.
- Bilgisayar uykuya geçerse oturum durur: Güç ayarlarında uykuyu kapat.

## Claude chat'te devam etmek

`docs/claude-chat/` klasörü, projeyi claude.ai'de (Claude chat) sürdürmek için hazırlanmış devir
kitidir: proje özeti ve kararlar (`00-BASLA-BURADAN.md`), uygulamanın araştırma talimatı, amfi/gitar
katalogları, cihaz model listeleri ve ekran görüntüleri. Kataloglar değişince `npm run build:chatkit`.

## Geliştirme

```bash
npm install
npm run dev          # http://localhost:3000 (geliştirme modu)
npm run desktop      # masaüstü başlatıcısını terminalden çalıştır
npm run shortcut     # masaüstü kısayolu oluştur
npm run build:artifact
```

| Dosya | Görev |
|---|---|
| `app/page.tsx` | Arayüz: ekipman, şarkı arama, sonuç, kayıtlı tonlar |
| `components/RigPanel.tsx` | Ekipman girişi: amfi, prosesör, gitar, manyetik, pedallar (önerili serbest metin) |
| `components/SettingsPanel.tsx` | API anahtarı kurulum ekranı |
| `components/ToneCard.tsx`, `components/Knob.tsx` | Sonuç kartı ve düğme görselleri |
| `app/api/tone/route.ts` | Araştırma API'si; ilerlemeyi NDJSON olarak akıtır |
| `app/api/settings/route.ts` | API anahtarını doğrulayıp yerel ayar dosyasına kaydeder |
| `lib/research.ts` | Yapay zekâ akışı: orijinal ton araştırması (önbellekli) → ekipmana uyarlama → yapılandırılmış çıktı |
| `lib/cache.ts` | Orijinal ton araştırmalarının yerel kaydı |
| `lib/pedals.ts` | Pedal kataloğu (tür, düğmeler, anahtarlar, karakter) |
| `lib/pickups.ts` | Manyetik modelleri kataloğu (tür, çıkış seviyesi) |
| `lib/gear-profiles.ts`, `app/api/gear/route.ts` | "Web'de tanıt": katalogda olmayan ekipmanın profili |
| `components/PickupSelector.tsx` | Manyetik seçici grafiği |
| `app/api/songs/route.ts` | Şarkı arama önerileri (iTunes / Deezer) |
| `components/SongSearch.tsx` | Şarkı arama kutusu |
| `lib/gear.ts` | Prosesör kataloğu, ekipman yapısı, amfi kullanım şekilleri |
| `lib/amps.ts` | Amfi kataloğu (kanallar, modlar, kontroller, karakter, monitör notu) |
| `lib/guitars.ts` | Gitar kataloğu, manyetik profilleri, seçici konumları, manyetik tahmini |
| `lib/devices/` | Doğrulanmış model listeleri |
| `lib/sources.ts` | Araştırmada öncelik verilecek siteler |
| `scripts/launcher.mjs` | Masaüstü başlatıcısı: güncelle → kur/derle → başlat → uygulama penceresi |
| `scripts/create-shortcut.mjs` | Masaüstü / Başlat menüsü kısayolu |
| `artifact/` | API anahtarsız claude.ai sürümü |

## Yol haritası

- **Masaüstü** (şimdi): yerel Next.js sunucusu + uygulama penceresi, GitHub'dan otomatik güncelleme.
- **Web sitesi**: aynı Next.js uygulaması bir sunucuya (ör. Vercel) yüklenir; API anahtarı
  kullanıcıdan değil sunucunun ortam değişkeninden okunur (`lib/settings.ts` zaten
  `ANTHROPIC_API_KEY`'i öncelikli kullanır), Ayarlar ekranı kapatılır, giriş ve kullanım limiti eklenir.
- **iOS**: arayüz bileşenleri ve `lib/` mantığı korunur; web sitesindeki API'ye bağlanan bir iOS
  uygulaması (Capacitor ile aynı arayüz ya da React Native) yapılır. Anahtar asla uygulamaya gömülmez.
