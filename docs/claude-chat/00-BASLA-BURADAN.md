# ToneFinder — Claude chat devir dosyası

Bu klasör, Claude Code'da yürüttüğümüz ToneFinder çalışmasını Claude chat'te (claude.ai)
kaldığın yerden sürdürmen için hazırlandı. Tarih: 7 Ekim 2026.

## Bu dosyalar nasıl kullanılır

En iyi yol: claude.ai'de **ToneFinder** adında bir **Proje** aç ve bu klasördeki dosyaları
projenin bilgi alanına yükle:

| Dosya | İçerik |
|---|---|
| `00-BASLA-BURADAN.md` | Bu dosya: proje özeti, kararlar, konuştuklarımız, durum, sıradaki işler |
| `01-TON-ARASTIRMA-TALIMATI.md` | Uygulamanın yapay zekâya verdiği araştırma talimatının aynısı + chat'te kullanılacak istek şablonu |
| `02-AMFI-KATALOGU.md` | Amfi kataloğu (markalar, modeller, kanallar, modlar, kontroller, monitör kullanımı) |
| `03-GITAR-KATALOGU.md` | Gitar kataloğu (markalar, modeller, manyetikler, ton karakteri, seçici konumları) |
| `04-CIHAZ-MODEL-LISTELERI.md` | HeadRush Core, Line 6 Helix ailesi, Boss Katana resmî model listeleri |
| `ekran-goruntuleri/` | Uygulamanın ekran görüntüleri (2 ve 4 numaralılar sahte örnek veriyle doldurulmuş) |

Aşağıdaki **"Proje talimatı"** bölümünü projenin *Instructions* (talimat) alanına yapıştır.
Proje kullanmayacaksan, yeni bir sohbete bu dosyaları ekleyip ilk mesaj olarak
"00-BASLA-BURADAN.md'yi oku ve ToneFinder'da kaldığımız yerden devam edelim" yaz.

### Proje talimatı (Instructions alanına yapıştır)

```
Bu proje ToneFinder: ünlü şarkıların stüdyo kayıtlarındaki gitar tonunu araştırıp
kullanıcının kendi amfisi, prosesörü, gitarı ve pedallarıyla nasıl elde edileceğini
düğme düğme veren bir uygulama. Bilgi dosyalarındaki 00-BASLA-BURADAN.md proje durumunu,
01 araştırma talimatını, 02-04 katalogları içerir.
- Her zaman Türkçe yanıt ver; ekipman, model ve düğme adlarını cihazda yazdığı gibi bırak.
- Ton isteklerinde 01'deki talimatı uygula, web araması yap, kaynak göster ve her bilgiyi
  kaynaklı / muhtemel / tahmin diye işaretle. Kataloglardaki model, kanal ve düğme adlarını kullan.
- Kullanıcının ekipmanı: Boss Dual Cube LX (yalnız STEREO IN, monitör olarak) + HeadRush Core.
- Kod değişikliği, derleme, test ve GitHub'a gönderme gerektiğinde bunu söyle;
  bu işler Claude Code'da yapılır.
```

## Proje özeti

- **Ne:** ToneAdapt / ToneMatcher / TonesMatch benzeri, yapay zekâ destekli gitar ton bulucu.
- **Nasıl çalışır:**
  1. Kullanıcı şarkıyı ve bölümü yazar (ör. "Master of Puppets — Kirk Hammett solosu").
  2. Yapay zekâ internette araştırır: stüdyo kaydında kullanılan gitar ve manyetik, amfi ve
     kanalı, kabin ve hoparlör, mikrofon (konum ve mesafe), pedallar ve ayarları. Her bilgi
     "kaynaklı / muhtemel / tahmin" diye işaretlenir.
  3. Sonra bunu kullanıcının ekipmanına çevirir: amfide hangi kanal ve düğmeler, prosesörde
     hangi modeller ve ayarlar, her pedalda hangi ayar, gitarda hangi manyetik ve volume/tone.
     Gitar farkını telafi eder (ör. orijinalde Les Paul humbucker, kullanıcıda Strat single-coil).
- **Yol haritası:** önce masaüstü uygulaması (şimdi), sonra web sitesi, sonra iOS uygulaması.

## Kullanıcı hakkında (tercihler ve ekipman)

- Türkçe konuşuyor; GitHub Desktop ve Claude kullanarak "guitarflex" adlı bir masaüstü
  uygulaması yapmıştı. ToneFinder'ı da aynı şekilde istiyor: masaüstü simgesine tıklayınca
  güncellemeleri GitHub'dan çekip uygulama gibi açılsın.
- Arayüz: **beyaz zemin, lacivert yazı, HUD (gösterge paneli) görünümü.**
- Ekipman:
  - **Amfi:** Boss Dual Cube LX. Yalnız **STEREO IN** modunda, amfiyi **monitör** gibi kullanıyor.
  - **Prosesör:** HeadRush Core.
  - **Gitar:** bir örnekte "bende Strat var" dedi (Kirk Hammett örneği). Kesin modeli sorulmadı, teyit et.
- API anahtarı konusunda ücretsiz bir yol istiyor; ücretli API'ye karşı temkinli.

## Konuşmanın özeti (sırasıyla)

1. **İstek:** "ToneAdapt gibi, yapay zekâ ile çalışan bir uygulama yapacağım." → Next.js +
   Claude API ile ilk sürüm: şarkı + ekipman → amfi/efekt ayarları, düğme görselleri, kayıtlı tonlar.
2. **İstek:** "Önce internette araştırsın: o şarkıda hangi orijinal ekipman kullanılmış, sonra benim
   ekipmanımda karşılığı ne; HeadRush Core'da hangi model hangi amfiye denk geliyor; pedallar,
   kabinler, mikrofonlar, mikrofon uzaklıkları." → İki adımlı akış: web araması + sayfa okuma ile
   araştırma, sonra yapılandırılmış sonuç. Araştırma adımları ekranda canlı görünür.
3. **İstek:** "Sadece HeadRush değil, her amfi, prosesör ve gitar için; Les Paul ile çalınan solo
   bende Strat'la nasıl olur?" → Gitar farkı telafisi, kullanıcının her pedalı için ayar,
   bölüm detayı (ör. "2. solo"), şarkının BPM ve tonalitesi (delay senkronu için).
4. **İstek:** HeadRush modelleri için headrushfx.com Core sayfasına bak; beyaz/lacivert HUD arayüz;
   API anahtarsız nasıl olur? → Resmî HeadRush Core listesi uygulamaya eklendi, Line 6 Helix
   (resmî) ve Boss Katana (resmî kılavuz) listeleri eklendi; HUD arayüz yapıldı; API anahtarı
   gerektirmeyen ücretsiz sürüm claude.ai Artifact olarak yayınlandı.
5. **Netleştirme:** "Sadece gitar prosesörü değil; stüdyo kaydını araştır, kullanıcı kendi amfi, gitar
   ve pedallarını girsin. guitarflex gibi masaüstü uygulaması olsun; online olmasına gerek yok."
   → Ekipman alanları ayrıldı (amfi, prosesör, gitar, manyetik, pedal listesi). Masaüstü
   başlatıcısı yapıldı: GitHub'dan güncelle → gerekirse kur/derle → kendi penceresinde aç →
   pencere kapanınca kapan. Masaüstü kısayolu oluşturucu, uygulama simgesi ve uygulama içi
   API anahtarı ekranı eklendi.
6. **İstek:** Boss Dual Cube LX'i ekle (stereo, monitör olarak); 6–7 amfi markasını ve modlarını,
   6–7 gitar markasını araştır, kaydet. → Amfi kataloğu (Boss/Roland, Marshall, Fender, Vox,
   Orange, Mesa/Boogie, Peavey/EVH, Blackstar, Yamaha), gitar kataloğu (Fender, Squier, Gibson,
   Epiphone, Ibanez, PRS, ESP/LTD, Jackson, Schecter, Gretsch, Yamaha) ve "amfiyi nasıl
   kullanıyorsun" ayarı (amfi olarak / monitör–Stereo In / prosesör önde / 4 kablo) eklendi.
7. **Bu dosya:** Claude chat'e geçiş için devir dosyası.

## Mevcut durum

- **Kod:** GitHub `TheDifference-dev/ToneFinder`, dal **`claude/epic-hawking-cqlx1h`**
  (henüz `main`'e birleştirilmedi; masaüstü güncellemesi GitHub Desktop'ta seçili daldan çeker).
- **Ücretsiz sürüm (API anahtarsız, Claude aboneliğiyle):** https://claude.ai/artifact/TFiJJUqA6gJKCdzc71EHd1
  İnternette arama yapmaz; Claude'un bilgisi + kataloglarla çalışır. Yalnız sana açık.
- **Masaüstü sürümü (tam, web araştırmalı):** Anthropic API anahtarı gerekir
  (console.anthropic.com → Billing → API Keys; uygulamadaki Ayarlar ekranına girilir,
  `~/.tonefinder/settings.json`'da saklanır). Bir şarkı araştırması tahminen 0,3–1 $.

### Test durumu

| Ne | Durum |
|---|---|
| Derleme ve tip kontrolü | Geçti |
| Arayüz (sahte veriyle), telefon genişliği | Geçti |
| Masaüstü başlatıcısı (güncelleme, kurulum/derleme, açma, kapanınca sunucuyu kapatma) | Linux'ta geçti |
| Başka sitelerden gelen isteklerin engellenmesi, geçersiz API anahtarı | Geçti |
| Katalog eşleştirmeleri (47 amfi/gitar adı) | Geçti |
| **Gerçek yapay zekâ araştırması** | **Yapılmadı** (API anahtarı yok) |
| **Windows'a özel kısımlar** (kısayol, Edge uygulama penceresi) | **Denenmedi** |
| Ücretsiz sürümün gerçek Claude çağrısı | Denenmedi (yalnız claude.ai içinde çalışır) |

## Doğrulanmış bilgiler ve kaynaklar

- **Boss Dual Cube LX** (resmî kılavuz, https://static.roland.com/assets/media/pdf/DUAL_CUBE_LX_eng01_W.pdf):
  - **Amp type'lar:** ACOUSTIC SIM, JC CLEAN (JC-120), US COMBO (Fender Deluxe Reverb),
    BRIT COMBO (Vox AC-30TB), HI-GAIN STACK (Marshall 1959), METAL STACK (Peavey EVH 5150 lead),
    EXTREME (Mesa Dual Rectifier Ch2 Modern), MIC, STEREO IN.
  - **Stereo bağlantı:** stereo giriş için AMP TYPE = STEREO IN; yalnız L bağlanırsa yalnız sol duyulur.
  - **Monitör ayarı:** blok şemasına göre EQ ve efektler sinyal yolunda. Önerilen: BASS/MIDDLE/TREBLE
    saat 12, EFFECTS ve DELAY/REVERB kapalı.
  - **Teyit edilecek:** STEREO IN'de EQ'nun gerçekten etkili olup olmadığı kullanıcının amfisinde
    denenmedi; kulakla kontrol edilmeli.
- **HeadRush Core:**
  - **Model listesi:** https://www.headrushfx.com/products/core/index.html ("Full List": 53 HeadRush +
    44 ReValver amfi, kabinler, mikrofonlar, IR'ler, efektler, "Inspired by" eşleşmeleri).
  - **Cab bloğu:** Mic Type, Break Up, On-Axis, Out Gain, Amp Gain. **Mikrofon mesafesi ayarı yok**
    (Core User Guide v5.1.0).
- **Line 6 Helix ailesi:** https://line6.com/helix-models/ (Helix 3.80, "Based on").
- **Boss Katana Gen 3:** BOSS TONE STUDIO for KATANA Gen3 kılavuzu
  (https://static.roland.com/assets/media/pdf/BTS_KTN3_SP_eng02_W.pdf). Tone Studio'da aralıklar
  0–10 değil (ör. Booster DRIVE 0–120, TONE −50…+50).
- **Diğer amfiler:** Marshall, Mesa, Fender, Vox, Orange, Peavey/EVH ve Blackstar bilgileri üretici ve
  bayi sayfalarından, incelemelerden.
- **Üretici kaynağıyla tek tek kontrol edilmeyenler:** bazı modeller (Nextone, Champion, Classic 30)
  ve gitar ton tarifleri genel bilgiye dayanıyor.

## Sıradaki işler (açık konular)

1. **Karar bekliyor:** çalışmayı `main` dalına birleştirmek için pull request açılsın mı? (Claude Code işi)
2. Gerçek bir şarkıyla uçtan uca test (API anahtarı ile masaüstünde, ya da ücretsiz sürümde).
3. Windows'ta kurulum ve kısayolun denenmesi.
4. Dual Cube LX'te STEREO IN modunda EQ düğmelerinin etkisinin kulakla kontrolü.
5. Diğer cihazlar için resmî model listeleri: Positive Grid Spark, Fender Mustang, Boss GX/GT,
   Zoom, Mooer, NUX, Quad Cortex, Fractal, Valeton (şu an araştırma sırasında web'den bulunuyor).
6. Katalogda kaynakla kontrol edilmemiş maddelerin doğrulanması.
7. Web sitesi sürümü: sunucuda API anahtarı, giriş ve kullanım limiti. Sonra iOS.

## Hangi iş nerede yapılır

- **Claude chat'te yapılabilir:**
  - Ton araştırması (01 dosyasındaki şablonla, web araması açıkken).
  - Katalog için araştırma ve yeni amfi, gitar, cihaz bilgisi toplama.
  - Tasarım ve özellik planlama.
  - Ücretsiz sürümü (claude.ai Artifact) güncelleme.
- **Claude Code'a geçilmesi gerekenler:**
  - Masaüstü uygulamasının kodunu değiştirmek, derlemek ve test etmek.
  - Katalog dosyalarını (`lib/amps.ts`, `lib/guitars.ts`, `lib/devices/`) güncellemek.
  - GitHub'a göndermek, pull request açmak.

### Claude Code'a dönerken ilk mesaj (kopyala)

```
TheDifference-dev/ToneFinder reposunda, claude/epic-hawking-cqlx1h dalında çalışıyoruz.
docs/claude-chat/00-BASLA-BURADAN.md'yi oku. Claude chat'te şunları kararlaştırdık / topladık:
<buraya chat'te çıkan kararları, yeni katalog bilgilerini, düzeltmeleri yaz>
Bunları uygulamaya ekle, test et ve gönder.
```

Katalog dosyaları değişince chat kitini yenilemek için Claude Code'da: `npm run build:chatkit`.

## Mimari (kısa)

- **Masaüstü uygulaması:** Next.js 16 + React 19 + Tailwind 4, TypeScript.
  - **Yapay zekâ:** Anthropic API, model `claude-opus-5-5`, web araması ve sayfa okuma; ikinci
    adımda yapılandırılmış çıktı.
  - **Ana dosyalar:** `app/page.tsx` (arayüz), `components/` (RigPanel, SettingsPanel, ToneCard, Knob),
    `app/api/tone` (araştırma, ilerlemeyi akıtır), `app/api/settings` (API anahtarı),
    `lib/research.ts` (talimat ve akış), `lib/amps.ts`, `lib/guitars.ts`, `lib/devices/`
    (model listeleri), `lib/sources.ts` (öncelikli siteler).
  - **Masaüstü dosyaları:** `ToneFinder.bat` / `ToneFinder.command` → `scripts/launcher.mjs`;
    `Masaustu-Kisayolu-Olustur.bat` → `scripts/create-shortcut.mjs`.
  - **Çalışma şekli:** uygulama `127.0.0.1:3210`'da çalışır, Edge/Chrome uygulama penceresinde açılır.
- **Ücretsiz sürüm:** `artifact/template.html` + `npm run build:artifact` → `artifact/tonefinder.html`
  (claude.ai'de yayında; Claude'a soru sorma özelliğiyle izleyicinin aboneliğini kullanır).
- **Öncelikli araştırma siteleri:** Equipboard, GuitarGeek, The Gear Page, Ultimate Guitar, Reddit,
  Premier Guitar Rig Rundown, Guitar World, Tunebat (BPM/tonalite).
