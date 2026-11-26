# ToneFinder — Claude Code devir dosyası

Bu dosya, projeye yeni başlayan Claude Code oturumunun her şeyi bilmesi için yazıldı (son güncelleme: 26 Kasım 2026).
Kullanıcı: **Arda Uğur**. Türkçe yazar ve Türkçe yanıt bekler. Gitar çalar; uygulamayı kendi kullanımı için geliştiriyor.
Kullandıkça güncelleme isteyecek. İş bitince ekran görüntüsü göstermeni ister.

## 1. Uygulama ne yapar

Bir şarkının gitar tonunu bulur ve kullanıcının ekipmanına uyarlar. Masaüstü uygulaması gibi çalışır (yerel Next.js
sunucusu + adres çubuğu olmayan Edge penceresi).

1. **Orijinal ton (1. adım):** Şarkı ve bölüm için stüdyo kaydındaki gitar, manyetik, amfi, kabin, mikrofon ve pedallar
   web'de araştırılır. Her bilgi "kaynaklı / muhtemel / tahmin" diye işaretlenir.
2. **Ekipmana çevirme (2. adım):** Orijinal ton, kullanıcının rig'ine uyarlanır: knob ayarları, zincir sırası,
   uyum yüzdesi ve geri bildirimle yeniden düzenleme.
3. **Araştırma motoru:** Önce API anahtarı varsa Anthropic API, yoksa bilgisayardaki **Claude Code CLI**
   (`claude -p`, yalnız WebSearch/WebFetch araçları; kullanıcının Claude aboneliği) kullanılır. Arda'da API anahtarı
   yok, her şey Claude Code ile çalışıyor.
4. **Hazır veriler:** Claude limiti dolunca da çalışsın diye araştırmalar diske kaydedilir ve tekrar sorulmaz
   (aşağıda "Veri" bölümü).

### Arda'nın ekipmanı
- Marshall DSL20CR (efekt döngüsü var)
- Epiphone Les Paul Custom (HH)
- Focusrite Scarlett Solo 4th Gen
- AmpliTube 5 (5.10.9)
- Boss Dual Cube LX

## 2. Teknoloji ve komutlar

- **Yığın:** Next.js 16 (Turbopack, App Router), React 19, Tailwind v4 (`@theme` tokenları `app/globals.css` içinde),
  zod 4, `@anthropic-ai/sdk`, TypeScript 7.
- **Komutlar:**
  - `npm run dev`
  - `npm run build`
  - `npm start` (127.0.0.1)
  - `npm run lint` (= `tsc --noEmit`; her değişiklikten sonra çalıştır)
- **Masaüstü başlatıcı:** `scripts/launcher.mjs`, `ToneFinder.bat` / `ToneFinder.command` üzerinden çalışır.
  - `git pull` yapar, gerekirse `npm install` ve `next build`.
  - Sunucuyu **127.0.0.1:3210** üzerinde `next start` ile başlatır.
  - Edge app penceresini açar; pencere kapanınca sunucu da kapanır.
- **Veri klasörü:** `~/.tonefinder` (ya da `TONEFINDER_HOME`). Ayarlar, araştırma önbelleği, kütüphane araştırmaları,
  gear profilleri burada durur.
- **Windows:** PowerShell'de `npm.ps1` execution policy'ye takılıyor. `cmd /c "npm …"` ya da `npm.cmd` kullan.

## 3. Repo, dal, bilgisayar

- **GitHub:** `TheDifference-dev/ToneFinder`.
- **Çalışma dalı:** `claude/epic-hawking-cqlx1h`. Uygulama bu daldan güncellenir; başlatıcı bu dalı pull eder.
- **`popular-data` dalı:** Toplu araştırmanın ara yayınları için. 121 ton bu dala yayınlanmıştı, ana dala birleştirildi.
- **Ev bilgisayarı "ARDAPC":** Windows 11, kullanıcı klasörü `C:\Users\Ardau`.
  - Repo: `C:\Users\Ardau\GitHub\ToneFinder`. Masaüstü ve Başlat menüsünde "ToneFinder" kısayolu var.
  - Claude Code: `C:\Users\Ardau\.local\bin\claude.exe`. Arda giriş yaptı.
  - `%TEMP%\tonefinder-batch`: toplu araştırma için ayrı klon. Sunucu 3213 portunda,
    `TONEFINDER_HOME=%TEMP%\tonefinder-batch-home`, log `data\popular\research.log`.
  - `%TEMP%\tf-shots`: playwright-core, `shoot.mjs`/`verify.mjs` (headless Edge ile ekran görüntüsü),
    `publish-when-done.ps1` (toplu sonuçları 20 dakikada bir `popular-data`'ya push eder), `adapt-test.mjs`.
- **Commit:** Mesajlar İngilizce ve açıklayıcı olsun. Push etmeden önce `npm run lint` ve gerekirse `npm run build` çalıştır.

## 4. Kod haritası

```
app/page.tsx              Ana ekran: Keşfet (arama, popüler, grup kütüphanesi, grup sayfası), Ekipmanım, Tonlarım
app/globals.css           Tema tokenları ve ortak sınıflar (.pill, .hud-panel, .hud-label, .hud-input, .lift, .rail…)
app/api/research          1. adım (NDJSON akış). Motor yoksa hazır kayıtları (popüler/kütüphane) doğrudan döndürür
app/api/tone              2. adım: uyarlama (API ya da Claude Code)
app/api/gear              "Web'de tanıt": katalogda olmayan ekipmanın profilini web'den çıkarır
app/api/songs             Arama kutusu: ?q= (önce kütüphane, sonra Deezer/iTunes) ve ?artist=&id= (grubun şarkıları)
app/api/artist            Grup sayfası verisi: sanatçı, şarkılar, kütüphanede hazır bölümler (ready)
app/api/identify          Hiçbir yerde bulunamayan metni Claude Code ile web'de grup/şarkı olarak çözer
app/api/library           Grup kütüphanesi listesi (+ kapalı kalmış kütüphane araştırmasını sürdürür)
app/api/library/job       Kütüphane araştırması: GET durum, POST {action:"start"|"stop"}
app/api/library/song      Bir şarkının hazır gitar bölümleri
app/api/popular           Popüler 500 kataloğu
app/api/settings, health  API anahtarı / Claude Code durumu

lib/research.ts           Bütün yapay zekâ talimatları ve akışlar: getOriginal, findTone, identifyGear,
                          identifyQuery, researchSongSheet, resolveEngine
lib/claude-cli.ts         Claude Code CLI bulma/çalıştırma (findClaudeCli, runClaudeCli, CliError; limit mesajını tanır)
lib/schema.ts             zod şemaları: OriginalTone, AdaptedTone, SongSheet, GearProfile, ToneRequest, ToneEvent
lib/signal-chain.ts       Sinyal zinciri kuralları (sıralama + talimat metni SIGNAL_CHAIN_RULES)
lib/song-library.ts       Şarkı kütüphanesi depolama (bütün bölümler), sheetOriginal()
lib/library-job.ts        Arka plan kütüphane araştırması (uygulama içinde çalışır)
lib/library.ts            Grup kütüphanesi (100 grup × 20 şarkı), normName(), searchLibrary()
lib/music-search.ts       Deezer / iTunes yardımcıları (anahtarsız)
lib/popular.ts            Popüler 500 kataloğu ve bundledOriginal()
lib/cache.ts              Orijinal ton önbelleği (~/.tonefinder/cache)
lib/amps.ts, guitars.ts, pedals.ts, pickups.ts, devices/*   Ekipman katalogları ve cihaz model listeleri
                          (AmpliTube, Helix, HeadRush, Katana)
lib/gear.ts               PARTS (lead/rhythm/intro/clean/full), AMP_MODES, PICKUP_CONFIGS…
lib/storage.ts            Tarayıcı tarafı kayıtlar (Tonlarım, rig'ler)

components/SongSearch.tsx Tek kutu arama (gruba tıklayınca onArtist → grup sayfası)
components/Band.tsx       BandPage, LibraryShelf, ResolvePanel ("Bunu mu aradın?"), SongParts, LibraryJobCard
components/Popular.tsx    Popüler 500: promo, kart şeridi, sayfalı liste
components/OriginalCard.tsx, ToneCard.tsx, chain.tsx   Sonuç kartları ve sinyal zinciri görünümü
components/RigPanel.tsx, SettingsPanel.tsx, Knob.tsx, PickupSelector.tsx, ui.tsx

scripts/                  build-library.mjs (Deezer'dan grup kütüphanesi), build-popular-from-raw.py,
                          research-popular.mjs (toplu araştırma, limit dolunca bekler), fetch-popular-artwork.mjs,
                          fetch-songsterr-top.mjs (Node'dan 403 alıyor, kullanma), launcher.mjs, create-shortcut.mjs
docs/claude-chat/         Claude sohbetinde kullanılan talimat/katalog seti. docs/tasarim.md: tasarım notları
```

## 5. Veri

- **`data/popular/songs.json`:** Songsterr'in ilk 500 şarkısı (`rank, title, artist, part, slug`).
  - Tekrar eden versiyonlar, klasik/fingerstyle düzenlemeler ve sadece bas kayıtları alınmadı.
  - Ham liste: `songsterr-raw-101-550.txt`. Songsterr API'si Node'dan bot korumasıyla 403 veriyor; liste tarayıcıda okundu.
    Bot korumasını aşmaya çalışma.
- **`data/popular/tones/<slug>.json`:** 121 şarkının tek bölüm orijinal tonu.
- **`data/popular/artwork.json`:** 498 kapak (Deezer).
- **`data/library/artists.json`:** 100 grup (80 dünya, 20 Türkçe rock: Duman, maNga, Mor ve Ötesi, Pentagram, Athena,
  Şebnem Ferah, Teoman…), her birinin en popüler 20 şarkısı, resim ve dinleyici sayısı.
- **Şarkı kütüphanesi:** Bir şarkının bütün gitar bölümleri (riff, ritim, temiz/akustik/caz, solo), tek araştırmada çıkar.
  - Hazır gelenler `data/library/tones/` içinde (henüz boş).
  - Bilgisayarda araştırılanlar `~/.tonefinder/library/` içinde.
  - Anahtar: `songKey(artist, title)`.
- **Hazır kayıt sırası (motor olmasa da açılır):** `bundledOriginal` (popüler, partDetail boşsa) →
  `sheetOriginal` (kütüphane; partDetail bir bölüm adıysa o bölüm). Motor varsa önce kullanıcı önbelleği.

## 6. Bu dönemde yapılanlar (özet)

1. **Tasarım:** Tripadvisor esinli açık tema, yalnız beyaz, siyah, petrol mavisi ve uzay grisi.
   - Renkler: paper #ffffff, panel #f4f5f6, ink #0f1012, petrol #0b5f6b, petrol-dark #074751,
     petrol-bright #2a9aab, space #4a4d53.
   - Fontlar: Archivo (başlık, `.headline`) ve Inter.
   - Uygulama simgesi: siyah kare, petrol yay, beyaz düğme.
2. **Tek kutuda arama:** Şarkı ya da grup yazılır.
   - Gruba tıklayınca **grup sayfası** açılır: resim, en popüler şarkılar, hazır tonlar, bölüm seçici.
   - Yalnız grup adı yazılıp "Tonu bul"a basılırsa metin şarkı gibi araştırılmaz. Tam grup adıysa grup sayfası açılır;
     değilse "Bunu mu aradın?" paneli gelir. Hiçbir yerde yoksa "Claude Code ile web'de ara" seçeneği çıkar.
     ("Duman" aramasının saçma sayfa açması böyle düzeldi.)
3. **Popüler 500 ve grup kütüphanesi:** Ana sayfada şerit, sayfalı liste, "Grup kütüphanesi" rafı (Dünya / Türkçe rock).
4. **Sinyal zinciri kuralı** (Arda özellikle istedi, yanlış yapma):
   - **Amfiden önce:** vintage fuzz (Fuzz Face, en başa) → tuner → wah → kompresör → pitch/octave → boost/overdrive/
     distortion → EQ → noise gate → volume → modülasyon.
   - **Amfi:** distorsiyon amfiden geliyorsa modülasyon, delay ve reverb efekt döngüsüne gider.
   - **Amfiden sonra:** kabin → mikrofon → rack (H3000 vb.) → **delay → reverb** → looper.
   - **Delay ve reverb her zaman amfiden sonra.**
   - Sıralama hem talimatlarda (`SIGNAL_CHAIN_RULES`) hem ekranda uygulanıyor. Ekranda `sortChain` + `stageOf`
     kullanılır: yapay zekâ yanlış sırada yazsa bile doğru gösterilir.
   - Arda'nın düzeni: DSL20CR'de drive/wah ön girişe, delay/reverb FX Loop'a. AmpliTube'da Stomp → Amp → Cab → Rack.
5. **Claude Code ile uyarlama:** API anahtarı yoksa 2. adım ve "Web'de tanıt" de Claude Code ile çalışır.
   **Uçtan uca henüz denenmedi** (limit doluydu).
6. **Kütüphane araştırması:** Arda'nın son isteği: "Claude limiti bitince arayamıyorum, elimde bir kütüphane kalsın."
   - Ana sayfadaki "Kütüphane araştırması" kartından başlatılır.
   - Kapsam: 100 grup × 20 şarkı + popüler 500, toplam ~2.163 şarkı. Sıra: önce Türkçe rock, sonra dünya, sonra popüler.
   - Her şarkının bütün bölümleri bir kez araştırılır; 2 şarkı paralel gider.
   - Limit dolunca 20 dakika bekleyip devam eder. Uygulama kapatılıp açılınca kaldığı yerden sürer
     (`~/.tonefinder/library-job.json`).
   - Bitmesi günler-haftalar sürebilir (abonelik limitleri).
   - Sonuç ekranında "Bu şarkıdaki gitar bölümleri" çipleriyle bölümler arasında geçilir.

## 7. Açık işler / sıradakiler

- [ ] ARDAPC'de uygulamayı aç; "Kütüphane araştırması"nı başlat ve ilk birkaç şarkının sonucunu kontrol et.
  - Kontrol edilecekler: `SongSheetSchema` çıktısı geçerli mi, bölüm etiketleri Türkçe mi, sinyal sırası doğru mu.
- [ ] Claude Code ile 2. adımı (uyarlama) uçtan uca dene (`%TEMP%\tf-shots\adapt-test.mjs`, ya da uygulamada bir rig
  kurup "Çevir"). `AdaptedToneSchema` çıktısı ayrıştırılamazsa talimatı ya da şemayı sadeleştir.
- [ ] Kütüphane araştırmalarının bir kısmı birikince `~/.tonefinder/library/*.json` dosyalarını `data/library/tones/`
  altına kopyalayıp repoya ekle. Böylece başka bilgisayarda da hazır gelir.
- [ ] Popüler 500'den kalan ~379 şarkı da kütüphane araştırmasının kuyruğunda; ayrıca `research-popular.mjs`
  çalıştırmaya gerek yok.
- [ ] İstenirse: grup kütüphanesini genişletmek (`scripts/build-library.mjs` içindeki listeler; yanlış eşleşen sanatçı
  için `HINTS`).

## 8. Bilinen tuzaklar

- **Claude abonelik limiti:** CLI "You've hit your 5-hour limit · resets …" der. `claude-cli.ts` bunu `CliError`
  yapar ("kullanım limitine ulaşıldı (yenilenme: …)"). Toplu işler `/limit/i` ile yakalayıp bekler.
- **Songsterr API'si** Node'dan 403 verir. Bot korumasını aşma. Liste lazımsa tarayıcıda oku.
- **Deezer arama tuhaflıkları:** Bazı adlar yanlış sanatçıya gider (Ghost, Korn → "KoЯn", Pentagram Türk grubu).
  `build-library.mjs` içindeki `HINTS` bilinen bir şarkıyla doğru sanatçıyı bulur. Normalizasyon için `normName()`
  kullan (ı→i, я→r, "The" yok sayılır).
- **Türkçe locale:** `uppercase` CSS'i Türkçe'de "MİDDLE" gibi bozuk yazar; knob adlarında büyük harf kullanma.
- **Popüler ton eşleşmesi:** "(Remastered 2021)" gibi ekler `cleanTitle` ile atılır.
- **Ekran görüntüsü:** Arda'ya göndermek için headless Edge (playwright-core, `%TEMP%\tf-shots`) ya da Linux'ta
  Playwright Chromium kullan.
