# Rakip inceleme: ToneMuse, ToneAdapt, ToneMatcher, TonesMatch

Tarih: 13 Ekim 2026. İki aşamada yapıldı:

1. **Web araştırması (öğlen):** sitelerin sayfaları, sitemap, gizlilik/kullanım şartları, tarayıcıya inen JS kodu,
   herkese açık arama uç noktaları, App Store / Google Play kayıtları, yorumlar.
2. **Canlı inceleme (akşam):** dört site Chrome'da (Claude in Chrome) tek tek kullanıldı, formdaki her alan denendi.
   96 ekran görüntüsü [`docs/rakip-inceleme/ekran/`](rakip-inceleme/ekran/) klasöründe (`site-adim-no-konu.png`).
   Satın alma, deneme aboneliği, yeni hesap ya da e-posta girişi yapılmadı.

İşaretler: **(canlı)** = tarayıcıda görüldü; **(k)** = canlı görülmedi, koddan ya da önceki araştırmadan;
**(çıkarım)** = doğrudan görülmedi, gözlemden çıkarıldı.

> **İsim düzeltmesi:** `tunemuse.app` diye bir site yok. Aranan uygulama **ToneMuse** —
> https://tonemuse.app/ — ve iOS uygulaması değil, **web uygulaması** (telefonda tarayıcıdan açılıyor).
> App Store'daki "Tune Muse" ise yapay zekâ ile şarkı üreten, alakasız bir uygulama.
> App Store'da olan ve aynı işi yapan uygulama **ToneAdapt**.

## Canlı incelemenin özeti

1. **ToneMuse ve TonesMatch, ToneAdapt ile aynı kökten görünüyor (çıkarım).** ToneMuse'un ana sayfa, fiyat ve
   topluluk sayfalarındaki metinler ToneAdapt'la kelimesi kelimesine aynı ("The fastest way from 'what are the
   settings?' to actually playing", "Unlock Your Perfect Tone", "Tone Database" sayfası ve filtreleri). Multi-efekt
   kartları aynı fiyat ve model listesini gösteriyor (Helix Floor "$1600-1700", AmpliTube 5 "'57 Champ… +25 more").
   TonesMatch'in gitar açıklamaları ve amfi listesi de ToneAdapt'la aynı (Epiphone Les Paul metni, iki kez geçen
   "Boss Dual Cube LX / BOSS DUAL CUBE LX"), aylık fiyatları da aynı (6,99 $ / 10,99 $).
2. **Hepsinde orijinal ton ücretsiz ya da ön izlemede, uyarlama ödeme duvarının arkasında.** ToneMuse araştırma
   için giriş istiyor (Google ya da "Get started free" ile kayıt); ToneMatcher kendi rig'in için e-posta istiyor; ToneAdapt ve TonesMatch uyarlamayı
   abonelik/deneme olmadan açmıyor. TonesMatch ana sayfası "No sign up · Free to try" diyor ama uyarlamada ödeme
   ekranı çıkıyor.
3. **ToneFinder'ın geride olduğu yerler:** aranabilir büyük ekipman veritabanı, amfi seçilince efekt ve modların
   kendiliğinden gelmesi, birden çok rig, pozisyon başına manyetik seçimi, her ayarın "neden"inin görünür olması,
   fabrika presetinden başlama, aynı sonuçta birden çok bölüm, manyetik seçici ve pedalboard görselleri.
   Ayrıntı: [ToneFinder'da hâlâ eksik olanlar](#tonefinderda-hâlâ-eksik-olanlar).
4. **ToneFinder'ın önde olduğu yerler:** her bilgide ve her ayarda kaynaklı/çıkarım/kontrol et etiketi, BPM ve
   tonalite, amfiyi monitör ya da 4 kablo yöntemiyle kullanma, AmpliTube 5'in 107 amfisi (ToneMuse ve ToneAdapt'ta
   28), Boss Dual Cube LX ve Katana Gen 3 için doğrulanmış kayıtlar, ödeme duvarı yok.
5. **Doğruluk sorunları canlı görüldü:**
   - ToneMuse'un "CALIBRATED / hedef düğmeler" bölümü orijinal stüdyo ayarlarıyla birebir aynı sayılar
     (8 / 7 / 5 / 6 / 6 / 1) ([05 orijinal](rakip-inceleme/ekran/tonemuse-05-sarki-orijinal-dugmeler.png),
     [08 "calibrated"](rakip-inceleme/ekran/tonemuse-08-sarki-manyetik-secici.png)). Master of Puppets ritim riffine
     tape delay ve reverb önerilmiş ([09](rakip-inceleme/ekran/tonemuse-09-sarki-pedalboard.png)); sayfa metnine göre
     delay 360 ms, reverb 2,6 sn. Sinyal zinciri sekmesi reverb'e "Lexicon 224 Concert Hall", pedalboard sekmesi
     "Plate Reverb" diyor.
   - ToneAdapt topluluk sayfasında notlar "riff bölümünde pedal kullanıldığına dair kanıt yok" diyor. Kilitli
     ön izleme ise (bulanık; sayfa metninde okunuyor) "Overdrive Pedal, Delay Pedal, Reverb Pedal" gösteriyor;
     kilitli değerler sayfa metninde "0" olarak duruyor ([23](rakip-inceleme/ekran/toneadapt-23-topluluk-efekt-zinciri-ve-notlar.png)).
   - TonesMatch örneğinde araştırma güveni %56, aynı sayfada "uyarlama doğruluğu %100"
     ([03](rakip-inceleme/ekran/tonesmatch-03-ornek-guven-kaynak.png), [05](rakip-inceleme/ekran/tonesmatch-05-ornek-uyarlama-dogrulugu.png)).
     Örnek Yamaha THR'de Presence düğmesi gösteriyor; THR serisinde Presence düğmesi olmadığını düşünüyoruz
     (kılavuzdan kontrol edilmeli). Bu, sitenin "her düğme gerçek" sloganıyla çelişiyor.
   - Aynı şarkı için orijinal gitar sitelere göre değişiyor: ToneMuse "ESP LTD KH-602", ToneAdapt "ESP MX220",
     ToneMatcher ve TonesMatch "1984 Gibson Explorer".

## Neyi canlı gördüm, neyi göremedim

| Site | Canlı görülen | Görülemeyen (neden) |
|---|---|---|
| ToneMuse | Ana sayfa, /plans, /community, Master of Puppets şarkı sayfası (orijinal rig, hedef düğmeler, manyetik seçici, sinyal zinciri, pedalboard), /app formunun her alanı (şarkı, riff/solo, ton türü, gitar, amfi, amfisiz, amfi efektleri, pedal, multi-efekt), 3 adımlı tanışma | Araştırma sonucu ve ücretsiz kilitli sonuç ekranı: "Research" düğmesi giriş ekranına (Google ya da "Get started free") yönlendiriyor ([30](rakip-inceleme/ekran/tonemuse-30-giris-gerekli.png)). Pedal/efektlerin araştırmada kullanılması da hesap istiyor. |
| ToneAdapt | Ana sayfa, /plans (aylık/yıllık), /app formu, My Gear (preset, pedal, multi-efekt), kütüphane, topluluk + Master of Puppets topluluk tonu, ücretsiz hesapla orijinal ton araştırması (tüm bölümler) | Uyarlanmış ton, cihaz görseli üzerinde düğmeler, "Kulağa yanlış mı geliyor?", kütüphane: hepsi deneme aboneliği istiyor ([29](rakip-inceleme/ekran/toneadapt-29-sonuc-orijinal-ve-kilitli-uyarlama.png)). Not: tarayıcıda kullanıcının daha önce açtığı ücretsiz ToneAdapt hesabı zaten açıktı; yeni hesap açılmadı. |
| ToneMatcher | Ana sayfa, ton kütüphanesi, herkese açık Master of Puppets tarifi (örnek rig: Squier CV Strat + Mustang LT25), "Artist's Gear" sekmesi, "Your Rig" ekipman penceresi (amfi/gitar/pedal arama, web doğrulaması) | Kendi rig'ine göre tarif: e-posta istiyor, bu da hesap açmak demek ([02](rakip-inceleme/ekran/tonematcher-02-tarif-eposta-kapisi.png)). **"Cited / Inferred / Double-check" etiketleri herkese açık sayfalarda görülmedi**; yalnız sanatçı ekipmanında "CONFIRMED" var. |
| TonesMatch | Ana sayfa, örnek sonuç (Enter Sandman → Telecaster + Yamaha THR), misafir olarak Master of Puppets orijinal tonu, ekipman formu | Kendi gear'ına uyarlama: ödeme ekranı ([11](rakip-inceleme/ekran/tonesmatch-11-uyarlama-odeme-duvari.png)). Cihaz sayfaları bulunamadı. |
| ToneFinder | `npm run dev` ile açıldı; şarkı arama, gitar/bas, bölüm, ton türü, rig paneli (katalog eşleşmesi, bilinmeyen ekipman) | Sonuç ekranı: bu oturumda Anthropic API anahtarı yoktu, "Tonu bul" kapalı ([04](rakip-inceleme/ekran/tonefinder-04-form-dolu-tonu-bul-kapali.png)). ARDAPC'de anahtarla denenmeli. |

## Hepsinin ortak mantığı

Dördü de aynı iki adımlı akışla çalışıyor (ToneFinder da öyle):

1. **Orijinal tonu araştır** (şarkı + bölüm + temiz/distorsiyon için bir kez) → orijinal gitar, manyetik,
   amfi ve ayarları, pedallar, kaynaklar, güven puanı. Sonuç **önbelleğe alınıyor** ve aynı şarkıyı soran
   herkese yeniden kullanılıyor ("community tones"). Canlıda ToneAdapt "Community tone loaded" diyerek sonucu
   anında getirdi.
2. **Kullanıcının ekipmanına uyarla** → amfi düğmeleri, kanal/mod, pedal ayarları, manyetik ve
   volume/tone, sinyal zinciri, çalım ipuçları.

Yapay zekâ: **ToneAdapt, ToneMatcher ve TonesMatch OpenAI kullanıyor** (gizlilik metinlerinde yazıyor) (k).
ToneMuse'ta sağlayıcı görünmüyor. **Hiçbiri şarkıyı ya da kullanıcının çalımını dinlemiyor** (ses analizi yok).
Asıl farkı **yapılandırılmış ekipman veritabanı** yaratıyor: yapay zekâ yalnızca cihazda gerçekten olan
düğmelerle cevap vermeye zorlanıyor.

## ToneMuse (tonemuse.app)

- **Ne:** web uygulaması (Next.js + Vercel, Convex veritabanı, Google ile giriş, Dodo Payments) (k).
  Yasal şirket adı yok, iletişim bir Gmail adresi (k).
- **Fiyat (canlı):** Ücretsiz (düğmeler bulanık/kilitli, pedal adları genel, 1 rig profili, 3 kayıt) · Expert
  haftalık 4,99 $ · aylık 9,99 $ (üstü çizili 19,96 $). Kartlar, UPI, Apple/Google Pay. "Abonelik dönemi başladıktan
  sonra iade yok" ([02](rakip-inceleme/ekran/tonemuse-02-plans.png)).
- **Akış (canlı):**
  1. İsteğe bağlı 3 adımlı tanışma: rig türü (modelleme amfi / multi-efekt / amfi + pedal / ses kartı + eklenti),
     ton sorunu, hedef tarz. Sonunda her seçime aynı kalıpta "Rig bottleneck" teşhisi, "%96 eşleşme potansiyeli"
     ve hazır EQ değerleri çıkıyor; "ses kartı + eklenti" seçilse bile "hoparlör boyutuna göre" diyor. Bu bir
     satış hunisi, gerçek analiz değil ([31](rakip-inceleme/ekran/tonemuse-31-tanisma-adim1.png)–[33](rakip-inceleme/ekran/tonemuse-33-tanisma-sonuc.png)).
  2. /app: "Bu hafta trend" (Enter Sandman "1.284 arama/hafta"), gitar/bas seçimi, 3 adımlı form:
     **Your Gear → Song & Artist → Results** ([10](rakip-inceleme/ekran/tonemuse-10-app-trend.png), [11](rakip-inceleme/ekran/tonemuse-11-app-ekipman-formu.png)).
  3. **Gitar:** listeden seçme; marka → seri → model, her satırda kısa açıklama ve "SERIES/MODEL" rozeti.
     Bulunamayınca: "Add it as a custom guitar below" ([12](rakip-inceleme/ekran/tonemuse-12-gitar-arama-stratocaster.png), [13](rakip-inceleme/ekran/tonemuse-13-gitar-bulunamadi.png)).
  4. **Amfi:** listeden seçme + popüler amfi düğmeleri. "Dual Cube" ve "Katana Gen 3" **bulunamadı**; Katana
     için yalnız ilk nesil ve MkII modelleri var. Seçilince "Verified Amp Profile: Calibrated for Boss Katana 50 EQ
     curves" rozeti. "Can't find your amp?" bir iletişim formuna gidiyor (`/contact?type=amp`)
     ([15](rakip-inceleme/ekran/tonemuse-15-amfi-dual-cube-yok.png)–[19](rakip-inceleme/ekran/tonemuse-19-amfi-katana50-dogrulanmis-profil.png)).
  5. **Amfisiz:** "Direct" düğmesi değil, "I don't currently own an amp" anahtarı; açılınca amfi ve amfi
     efektleri gizleniyor ([20](rakip-inceleme/ekran/tonemuse-20-amfisiz-direct.png)).
  6. **Amfi efektleri:** 11 kutucuk (Reverb … Overdrive), kullanıcı kendisi işaretliyor; seçilenler amfi kartında
     rozet olarak görünüyor.
  7. **Pedallar / Multi-FX** iki sekme. Pedal araması: kategori, fiyat, "kim kullanıyor". "Tube Screamer"
     **bulunamadı**, "Boss" 25 sonuç. Multi-FX araması: HeadRush Core (amfi model listesiyle), Helix (3 kayıt),
     AmpliTube 5 (yalnız 28 amfi). "Create an account to use effects and pedals in tone matching"
     ([21](rakip-inceleme/ekran/tonemuse-21-pedal-tube-screamer-yok.png)–[26](rakip-inceleme/ekran/tonemuse-26-multifx-eklendi.png)).
  8. **Şarkı:** kapaklı otomatik tamamlama + 6 "trend şarkı" kısayolu; sanatçı kendiliğinden doluyor.
     Riff/Solo, Auto-detect/Clean/Distorted ([27](rakip-inceleme/ekran/tonemuse-27-sarki-arama.png), [28](rakip-inceleme/ekran/tonemuse-28-bolum-ve-ton-turu.png)).
  9. "Research Master of Puppets by Metallica" → giriş ekranı (Google ya da "Get started free").
- **Şarkı sayfası (canlı, herkese açık):** "Community tone blueprint", Share Tone Card, beğeni (121),
  "%98 ton eşleşmesi", "402 kez araştırıldı", zorluk 5/5 + açıklama, orijinal rig (gitar, amfi, distorsiyon
  karakteri, manyetik), stüdyo amfi ayarları (düğme grafikleri), ton karakteri etiketleri, "Rig Research Insights"
  metni (kaynak linki yok), **manyetik seçici grafiği** (NECK/MID/BRIDGE), hedef amfi düğmeleri, gitar volume/tone,
  **8 bloklu sinyal zinciri** (IN → DYN → DRIVE → AMP → CAB → TIME → REV → OUT; bloğa tıkla, önceki/sonraki),
  **pedalboard görünümü** (pedal kutuları, "Exact match / Close match"), "Copy Patch Preset"
  ([04](rakip-inceleme/ekran/tonemuse-04-sarki-sayfasi.png)–[09](rakip-inceleme/ekran/tonemuse-09-sarki-pedalboard.png)).
- **Topluluk (canlı):** arama; Gitar/Bas, Riff/Solo, Clean/Distorted, Top/Popular/Recent filtreleri; kartlarda
  orijinal gitar + amfi, sürüm sayısı, tür, on yıl, beğeni ([03](rakip-inceleme/ekran/tonemuse-03-community.png)).
- **Sayılar:** ana sayfa "15.000+ ekipman, 1.200+ şarkı, 150.000+ gitarist, 4,9 puan" gösteriyor (öğlen "0"
  görünen sayaçlar büyük olasılıkla animasyon öncesiydi); topluluk sayfasının sekme başlığı "120+ Song Rigs".
  Sayılar birbiriyle tutmuyor ve doğrulanamıyor.

## ToneAdapt (toneadapt.com + iOS + Android)

- **Ne:** ToneAdapt, LLC (ABD). iOS 2026-04 çıkışlı, 4,77 puan / 3.060 oy; Android 5.000+ indirme. 6 dil.
  Yapay zekâ: OpenAI. Altyapı: Supabase, Stripe, RevenueCat, Superwall, Vercel (k).
  Ana sayfa artık App Store / Google Play'e yönlendiriyor ([01](rakip-inceleme/ekran/toneadapt-01-anasayfa.png)).
- **Fiyat (canlı):** Beginner aylık 6,99 $ / yıllık 39,99 $ (ayda 20 uyarlama, 15 kayıt); Expert aylık 10,99 $ /
  yıllık 49,99 $ (sınırsız). 7 gün deneme (5 ya da 8 uyarlama). "All sales final. No refunds."
  ([02](rakip-inceleme/ekran/toneadapt-02-plans-yillik.png), [03](rakip-inceleme/ekran/toneadapt-03-plans-aylik.png)). iOS'ta haftalık 5,99 $'dan başlıyor (k).
- **Akış (canlı):**
  1. "Trending this week" (gerçekçi sayılar: Master of Puppets 15 arama/hafta) ([04](rakip-inceleme/ekran/toneadapt-04-app-trend.png)).
  2. **Saved preset** seçici (kayıtlı rig'ler) ya da elle seçim ([05](rakip-inceleme/ekran/toneadapt-05-ekipman-formu.png)).
  3. **Gitar:** yalnız listeden ("Stratocaster" 30 sonuç). Bulunamayınca "Request it and we'll add it" — serbest
     metin yok. Seçilince dizilim ve çıkış rozetleri (Strat: SSS, low output; Epiphone Les Paul: HH, high output, Coil-split). **Custom pickups:** neck /
     middle / bridge için ayrı manyetik seçimi (Stock, EMG 81 …)
     ([06](rakip-inceleme/ekran/toneadapt-06-gitar-arama-stratocaster.png)–[09](rakip-inceleme/ekran/toneadapt-09-ozel-manyetikler.png)).
  4. **Amfi:** yalnız listeden. Dual Cube LX **var** (iki kez kayıtlı). Katana 50 Gen 3 **var**. Seçilince amfinin
     dahili efektleri ve modları **kendiliğinden** geliyor: Dual Cube LX → Reverb, Delay, Chorus, Flanger, Presets;
     Katana 50 Gen 3 → Modes: Acoustic, Clean, Pushed, Crunch, Lead, Brown
     ([10](rakip-inceleme/ekran/toneadapt-10-amfi-dual-cube.png)–[13](rakip-inceleme/ekran/toneadapt-13-katana-gen3-modlar.png)).
  5. **Going direct:** anahtar; multi-efekt seçiliyse "Using HeadRush Core as amp"
     ([25](rakip-inceleme/ekran/toneadapt-25-preset-secildi-going-direct.png)).
  6. **Efektler:** Pedals / Multi FX sekmeleri. Pedallar "My Gear" koleksiyonundan; **pedal veritabanı var**
     (kategori filtresi, fiyat, "Used by"; "Tube Screamer" araması TS9, TS808, TS Mini…). Multi-FX: "Effects only /
     Amp Modeler / Amp + Effects" türleri; effects-only cihazda amfi ayarı + dahili efektler, modelleyicide tam
     preset ([14](rakip-inceleme/ekran/toneadapt-14-pedal-sekmesi.png)–[18](rakip-inceleme/ekran/toneadapt-18-multifx-headrush.png)).
  7. **Şarkı:** iTunes araması (kapak, albüm, süre). Riff/Solo, Auto-detect/Clean/Distorted. Araştırma düğmesinin
     altında **Songsterr** ve **backing track** düğmeleri ([26](rakip-inceleme/ekran/toneadapt-26-sarki-arama.png)–[28](rakip-inceleme/ekran/toneadapt-28-arastir-songsterr-backing.png)).
- **Sonuç ekranı, sırayla (canlı, ücretsiz hesapla):**
  - Solda **Original Tone**, sağda kilitli **Your Adapted Tone**.
  - Original Gear (Guitar, Pickups, Amp, Notes).
  - Difficulty (bölüm, 4,5/5, açıklama).
  - Amp Settings – Original (Gain 9, Bass 6, Mid 3, Treble 7,5, Presence 6,5, Reverb 1; çubuk göstergeler).
  - Guitar Controls (Volume, Tone).
  - Effects & Pedals – Original (Signal chain, Amp effects: "Reverb (spring) Level 2").
  - Sources (4 link + "+8 additional sources analyzed").
  - Warnings (orijinal manyetik tartışmalı; riffte pedal kanıtı yok; ayarlar forum kaynaklarının ortalaması).
  - Ekranlar: [29](rakip-inceleme/ekran/toneadapt-29-sonuc-orijinal-ve-kilitli-uyarlama.png)–[32](rakip-inceleme/ekran/toneadapt-32-sonuc-uyarilar.png).
  - Uyarlanmış tarafın bölümleri canlı görülemedi. Koddan bilinenler (k): kanal/mod/preset, EQ rehberi, pedal
    ayarları, manyetik seçimi, çalım ipuçları, sınırlamalar, alternatifler, güven puanı, "Kulağa yanlış mı geliyor?".
- **Ekipman veritabanı (asıl gücü):** "9.000+" iddiası; herkese açık uç noktalar 1.000 amfi, 1.000 gitar, 219 bas,
  152 bas amfisi, 50 multi-efekt döndürdü (k). Amfi kaydı 3 tür: `simple`, `mode_based`, `preset_based`; her
  düğmeye min/max/varsayılan (k).
- **Topluluk (canlı):** Master of Puppets 728 sürüm, 287 beğeni. Herkese açık sayfa orijinal gitar ve amfiyi,
  yalnız Gain ve Bass'i gösteriyor; diğerleri bulanık ([21](rakip-inceleme/ekran/toneadapt-21-topluluk.png)–[24](rakip-inceleme/ekran/toneadapt-24-topluluk-uyarla.png)).
- **Doğruluk konusunda sorunlu yanlar:** koddaki "+N kaynak daha analiz edildi" sayısı şarkı adının uzunluğundan
  hesaplanıyor; önbellekten gelen sonuca yapay 4,5 sn bekleme ekleniyor (k).
- **Şikâyetler (k):** farklı şarkılara neredeyse aynı ayarlar, ayarsız pedal önerileri, "uyduruyor", gain düğmesi
  olmayan amfiyi yanlış okuma, küçük pratik amfilerinde tutarsızlık, fiyatın açık olmaması.

## ToneMatcher (tonematcher.com, iOS)

- **Ne:** "Beta 3.0", koyu tema. Aynı akış; OpenAI (k). iOS 3,2 puan / 9 oy (k).
- **Ton kütüphanesi (canlı, herkese açık):** her şarkı için bir **örnek rig** üzerinde tarif (Squier Classic
  Vibe '60s Strat + Fender Mustang LT25) ve "Get this dialed for your gear" düğmesi
  ([03](rakip-inceleme/ekran/tonematcher-03-ton-kutuphanesi.png), [04](rakip-inceleme/ekran/tonematcher-04-ornek-tarif-ust.png)).
- **Tarif ekranı (canlı):**
  - Üstte tek paragraf strateji ("Mustang'in Thrash Overkill presetinden başla…").
  - **Tone Recipe / Artist's Gear** sekmeleri. Tone Recipe içinde **Main Tone / Clean Intro** sekmeleri.
    Temiz bölüm yalnız **ana tondan farklar** olarak veriliyor: preset [01] FENDER CLEAN, Gain 3, Treble 6, Bass 5;
    "listelenmeyen her şey ana tondaki gibi" ([09](rakip-inceleme/ekran/tonematcher-09-temiz-giris-farklar.png)).
  - Blok blok: Gitar (Master Volume, Tone 2, manyetik seçici) → Amfi.
  - **Her düğmenin altında kısa "neden" açıklaması** ("Gain 8: doymuş lamba crunch'ı için yüksek").
  - **"LOAD THIS PRESET [14] THRASH OVERKILL"**: önce fabrika presetini yükle, sonra düğmeleri ayarla.
  - **"N control(s) you can leave alone"**: bu tonda kullanılmayan düğmeler ("Tone 1: köprü manyetiğinde
    kullanılmıyor", "Cabinet / Amp Models / Effects: kapalı bırak").
  - Ekranlar: [05](rakip-inceleme/ekran/tonematcher-05-ornek-tarif-gitar.png), [06](rakip-inceleme/ekran/tonematcher-06-ornek-tarif-amfi-preset.png).
- **Artist's Gear (canlı):** kaydın hikâyesi, akort, "Recording signal chain" (5 öğe; her birinde tür, **CONFIRMED**
  rozeti, rol, not) ve kaynaklar (Guitar World, Mix, Library of Congress PDF). Listede başka şarkıya ait bir gitar
  da var (Jackson KV1 "The Thing That Should Not Be") ([07](rakip-inceleme/ekran/tonematcher-07-sanatci-ekipmani.png), [08](rakip-inceleme/ekran/tonematcher-08-kayit-sinyal-zinciri-confirmed.png)).
- **Your Rig (canlı):** Amps / Guitars / Pedals sekmeleri, **cihaz fotoğrafları**, "Add any amp — search every
  amp ever made". Dual Cube LX bulundu. Uydurma bir ad aranınca web'de kontrol edip "'Qwxyz Amp 99' gerçek,
  üretilmiş ya da üretilmekte olan bir amfiyle eşleşmiyor" diyerek reddediyor. Ekipman "bench"e alınabiliyor
  (dolapta kalır, kullanılmaz) ([10](rakip-inceleme/ekran/tonematcher-10-rig-amfiler-gorselli.png)–[13](rakip-inceleme/ekran/tonematcher-13-pedallar.png)).
- **Kendi rig'in için tarif:** e-posta istiyor ("şifre yok, tarifi hesabına kaydederiz") → yapılmadı.
- **Önceki araştırmadan (k):** tarifler cihaz kılavuzu verisine dayanıyor; her cihazın kılavuz bağlantısı ve
  doğrulama tarihi tutuluyor; her ayarın yanında "Cited / Inferred / Double-check" etiketi. **Bu etiketler canlıda
  görülmedi.** Günlük meydan okuma ve liderlik tablosu (k).

## TonesMatch (tonesmatch.com, web)

- **Ne:** "24.806 ton, 2.019 gitar, 1.526 amfi, 879 pedal, 155 bas" sayaçları; gitarcılar ve basçılar için
  ([01](rakip-inceleme/ekran/tonesmatch-01-anasayfa.png)). OpenAI + Supabase (k).
- **Örnek sonuç (canlı, hesapsız):** Enter Sandman → Fender '72 Thinline Telecaster + Yamaha THR. Orijinal rig,
  manyetik, amfi ayarları (halka göstergeler), gitar kontrolleri, **araştırma güveni %56**, 3 kaynak, uyarlamada
  preset ("Modern Hi-Gain"), "Additional controls: use default position", **uyarlama doğruluğu %100**
  ([02](rakip-inceleme/ekran/tonesmatch-02-ornek-sonuc.png)–[05](rakip-inceleme/ekran/tonesmatch-05-ornek-uyarlama-dogrulugu.png)).
- **Akış (canlı):** Şarkı araması daha önce araştırılmış tonları listeliyor (Master of Puppets: distorted · Guitar
  · Riff / Bass / Guitar · Solo) → misafir olarak "Your Gear" (gitar, amfi, Going Direct, pedallar) + sağda
  **orijinal ton**. Orijinal ton bölümleri: Original Gear, Section Profile (etiketler), **Research Confidence %95**,
  Evidence Phrases, Pickup Choice, Amp Settings, Guitar Controls, Effects & Signal Chain, Tone Characteristics,
  Song Context (feel, tempo, dynamics), Difficulty & Technique (4,5/5 + teknik maddeleri), Sources
  ([06](rakip-inceleme/ekran/tonesmatch-06-sarki-arama-kayitli-tonlar.png)–[10](rakip-inceleme/ekran/tonesmatch-10-orijinal-ton-guven.png)).
- **"Adapt to MY Gear" → ödeme ekranı:** Tone Seeker aylık 6,99 $ / yıllık 34,99 $ (ayda 20 uyarlama),
  Tone Master aylık 10,99 $ / yıllık 49,99 $ (sınırsız). "Charged today"
  ([11](rakip-inceleme/ekran/tonesmatch-11-uyarlama-odeme-duvari.png), [12](rakip-inceleme/ekran/tonesmatch-12-odeme-duvari-aylik.png)).

## ToneFinder'ı aynı şarkıyla denedim

`npm run dev` (http://127.0.0.1:3210), rig: Epiphone Les Paul + Boss Dual Cube LX + HeadRush Core, şarkı:
Master of Puppets, Giriş / Riff, Distorsiyonlu.

- Şarkı araması iTunes'tan kapak, albüm ve yılla geldi ([03](rakip-inceleme/ekran/tonefinder-03-sarki-arama.png)).
- Rig paneli Dual Cube LX'i ("kanalları ve modları biliniyor"), HeadRush Core'u ("doğrulanmış model listesi")
  ve Epiphone Les Paul'u (ProBucker, 3'lü toggle) tanıdı. **Ama Dual Cube LX'in dahili efektleri kutucuklara
  gelmedi**; hepsi boş kaldı ([02](rakip-inceleme/ekran/tonefinder-02-rig-katalog-eslesmesi.png)).
- Uydurma ekipman ("Qwxyz Amp 99") itirazsız kabul edildi; "Model listesi araştırma sırasında bulunur" yazıyor
  ([06](rakip-inceleme/ekran/tonefinder-06-bilinmeyen-ekipman.png)).
- API anahtarı olmadığı için "Tonu bul" kapalıydı; sonuç ekranı bu oturumda üretilemedi
  ([01](rakip-inceleme/ekran/tonefinder-01-ilk-ekran-anahtar-yok.png), [05](rakip-inceleme/ekran/tonefinder-05-tam-sayfa.png)).

## ToneFinder ile karşılaştırma (canlı gözleme göre düzeltildi)

✅ var · ◐ kısmen · ✗ yok · ? görülemedi. (k) = canlı görülmedi.

| Özellik | ToneMuse | ToneAdapt | ToneMatcher | TonesMatch | ToneFinder |
|---|---|---|---|---|---|
| İki adım: orijinal araştırma + uyarlama | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ücretsiz görünen | topluluk sayfası; araştırma için giriş | ücretsiz hesapla orijinal ton | örnek rig'de tarif; kendi rig'in için e-posta | misafirken orijinal ton | hepsi (kendi API anahtarıyla, şarkı başına ~0,3–1 $) |
| Fiyat | 4,99 $/hafta, 9,99 $/ay | 6,99–10,99 $/ay, 39,99–49,99 $/yıl | ? | 6,99–10,99 $/ay, 34,99–49,99 $/yıl | ücretsiz + API |
| Şarkı otomatik tamamlama | ✅ kapaklı | ✅ kapak, albüm, süre | ✅ kapak, yıl | ✅ araştırılmış tonlar | ✅ kapak, albüm, yıl |
| Bölüm seçimi | Riff/Solo | Riff/Solo | sonuçta sekme (Ana ton / Temiz giriş) | Riff/Solo | ✅ 5 bölüm + serbest "hangi bölüm" |
| Temiz / Distorsiyon / Otomatik | ✅ | ✅ | ✗ | ✅ | ✅ |
| Ekipman girişi | listeden; yoksa "özel ekle" | yalnız listeden; yoksa "iste" | listeden + her amfiyi web'de bulup ekleme | listeden (ToneAdapt verisi) | serbest metin + öneri listesi |
| Ekipman kataloğu büyüklüğü | "10.000+" (Dual Cube, Katana Gen 3, Tube Screamer yok) | binlerce (k) | "her amfi" + fotoğraf | 2.019 gitar, 1.526 amfi, 879 pedal | 45 amfi, 29 gitar, 60 pedal, 25 prosesör |
| Listede olmayan ekipman | özel kayıt / iletişim formu | istek formu | web'de doğrular, gerçek değilse reddeder | ? | kabul eder, uyarlamada web'de araştırır; doğrulama ve kayıt yok |
| Amfi seçilince efekt ve modlar kendiliğinden | ✗ (kullanıcı işaretler) | ✅ | ? | ? (ToneAdapt verisi, çıkarım) | ◐ katalog biliyor, kutucuklar boş kalıyor |
| Amfi kullanımı: amfisiz / multi-efekt amfi yerine | ✅ anahtar | ✅ "Going direct" | ? | ✅ "Going direct" | ✅ 4 mod (amfi, monitör/Stereo In, önünde prosesör, 4 kablo) |
| Kullanıcının cihazları (Dual Cube LX / Katana Gen 3 / HeadRush Core / AmpliTube 5) | ✗ / ✗ / ✅ / ✅ 28 amfi | ✅ / ✅ / ✅ / ✅ 28 amfi | ✅ / ? / ? / ? | ✅ / ? / ? / ? | ✅ / ✅ / ✅ / ✅ 107 amfi |
| Pozisyon başına manyetik modeli | ✗ | ✅ "Custom pickups" | ✗ | ✗ | ◐ yalnız dizilim (HH, SSS…) |
| Pedal veritabanı | ✅ kategori, fiyat, kim kullanıyor | ✅ aynı biçim (eski tablo "yok" diyordu, yanlıştı) | ✅ fotoğraflı | ✅ 879 (k) | ✅ 60 pedal, düğme adlarıyla |
| Birden çok rig / preset | ücretli | ✅ My Gear → Presets | ✅ dolap + bench | ✅ ücretli | ✗ tek rig |
| Kaynak linkleri | ✗ (yalnız "Rig Research Insights" metni) | ✅ 4 link + "+8" | ✅ sanatçı ekipmanında | ✅ | ✅ |
| Bilgi/ayar başına etiket | ◐ yalnız pedalda Exact/Close | ✗ (Uyarılar bölümü var) | ◐ CONFIRMED; Cited/Inferred görülmedi | ✗ | ✅ orijinal rig'de ve her ayarda |
| Güven / eşleşme puanı | "%98 ton eşleşmesi" | ✅ (k) | ✗ | güven % + "uyarlama doğruluğu %" | ✅ güven + yakınlık % ("tahmin") |
| Zorluk | 5/5 + açıklama | 4,5/5 + açıklama | ✗ | 4,5/5 + teknik maddeleri | ✅ 1–5 + etkenler |
| Uyarılar / sınırlamalar / alternatifler | ✗ | Warnings ✅, diğerleri (k) | ✗ | ✗ | ✅ |
| Her düğmenin "neden"i görünür | ✗ | ? | ✅ düğmenin altında | ✗ | ◐ yalnız fareyle üstüne gelince |
| "Bu tonda dokunma" listesi | ✗ | ? | ✅ | ◐ "default position" | ✗ |
| Fabrika presetinden başla | ✗ | preset_based amfi (k) | ✅ "[14] Thrash Overkill yükle" | ✅ "Preset: Modern Hi-Gain" | ✗ |
| Aynı sonuçta birden çok bölüm (farklarla) | ✗ | ✗ | ✅ | ✗ | ✗ (her bölüm ayrı araştırma) |
| Düğme grafikleri | ✅ | çubuk | ✅ | halka | ✅ SVG düğme |
| Manyetik seçici grafiği | ✅ NECK / MID / BRIDGE | ? | ✗ | ✗ | ✗ (metin) |
| Pedalboard / blok blok zincir görünümü | ✅ pedal kutuları, tıkla-incele | ? | ✗ | ✗ | ◐ zincir şeridi + numaralı bloklar |
| BPM ve tonalite | ✗ | ✗ | ✗ | ◐ "fast" gibi metin | ✅ |
| Gitar farkı telafisi (Les Paul → Strat) | ? | ? | ✅ paragraf | ? | ✅ ayrı bölüm |
| Songsterr / backing track | ✗ | ✅ | ✗ | ✗ | ✅ |
| Önbellek / topluluk | ✅ sürüm, beğeni, tür, on yıl | ✅ 728 sürüm | ✅ ton kütüphanesi | ✅ 24.806 ton | ◐ yerel önbellek |
| Paylaşım | ✅ Share Tone Card | beğeni | ✗ | ✗ | ✗ (yalnız kopyala) |
| Preset dosyası dışa aktarma (.hlx, .rig…) | ✗ ("Copy Patch Preset" metin; "custom preset exports" iddiası ücretli, görülmedi) | ✗ | ✗ | ✗ | ✗ ("Ayarları kopyala") — **kimsede yok, fark yaratır** |
| Ses analizi | ✗ | ✗ | ✗ | ✗ | ✗ |
| Dil | İngilizce | 6 dil (k) | İngilizce | İngilizce | Türkçe |

## ToneFinder'da hâlâ eksik olanlar

Kopyalamıyoruz: rakiplerin veritabanlarını, metinlerini ya da görsellerini almıyoruz (kullanım şartları ve telif).
Aynı işi kendi kaynaklarımızla (üretici kılavuzları, resmî model listeleri, web araştırması) yapıyoruz.

### Öncelik 1

**1. Amfi seçilince dahili efektler ve modlar kendiliğinden gelsin**
- **Ne:** Amfi katalogdan seçilince cihazda gerçekten olan efektler işaretli, olmayanlar gizli gelsin.
  Modlar ve kanallar da görünsün.
- **Nerede görüldü:** ToneAdapt. Dual Cube LX için Reverb, Delay, Chorus, Flanger, Presets çıkıyor; Katana 50
  Gen 3 için 6 mod listeleniyor.
- **Ekran:** [toneadapt-11](rakip-inceleme/ekran/toneadapt-11-amfi-dual-cube-efektler.png),
  [toneadapt-13](rakip-inceleme/ekran/toneadapt-13-katana-gen3-modlar.png). ToneFinder'daki durum:
  [tonefinder-02](rakip-inceleme/ekran/tonefinder-02-rig-katalog-eslesmesi.png).
- **ToneFinder'da nasıl:**
  - `lib/amps.ts` kayıtlarına yapısal bir `effects: AmpEffect[]` alanı ekle. Bu bilgi şu an `global` metninde
    duruyor; Dual Cube LX için Chorus, Flanger, Phaser, Tremolo, Octave, Delay, Reverb.
  - `RigPanel.tsx`'te amfi katalogla eşleşince `AMP_EFFECTS` kutucuklarını bu listeyle doldur ve cihazda
    olmayanları soluk göster. Kullanıcı yine de değiştirebilsin.
  - Kanal ve mod adlarını ipucu satırında rozet olarak göster.

**2. Aranabilir ekipman veritabanı + listede olmayan için web'de tanıtma**
- **Ne:** Serbest metin + `<datalist>` yerine marka → seri → model arama kutusu. Her satırda kısa açıklama ve
  "katalogda / doğrulanmış" rozeti olsun. Listede olmayan cihaz web'de bulunup kayda dönüşsün; gerçek değilse
  reddedilsin.
- **Nerede görüldü:** ToneMuse (arama ve "özel ekle"), ToneAdapt (yalnız liste ve "iste"), ToneMatcher ("her amfiyi
  ara", uydurma adı reddediyor).
- **Ekran:** [tonemuse-12](rakip-inceleme/ekran/tonemuse-12-gitar-arama-stratocaster.png),
  [toneadapt-07](rakip-inceleme/ekran/toneadapt-07-gitar-bulunamadi.png),
  [tonematcher-12](rakip-inceleme/ekran/tonematcher-12-amfi-yok-web-dogrulama.png). ToneFinder'daki durum:
  [tonefinder-06](rakip-inceleme/ekran/tonefinder-06-bilinmeyen-ekipman.png).
- **ToneFinder'da nasıl:**
  - Katalogda yoksa "Web'de tanıt" düğmesi göster. Yeni `/api/gear/identify` uç noktası Claude web aramasıyla
    cihazın gerçek olup olmadığını, kanallarını, düğmelerini ve efektlerini bulsun.
  - Bulduğu kaydı `~/.tonefinder/gear/<id>.json`'a yazsın; sonraki seferlerde yerel katalog gibi kullanılsın.
  - Cihaz gerçek değilse "böyle bir model bulunamadı" desin.
  - Amfi kaydına `kind: simple | mode_based | preset_based` ve düğme başına min/max/varsayılan ekle (eski listedeki
    6. madde).
  - Rakiplerin kaçırdığı kullanıcı cihazları (Dual Cube LX, Katana Gen 3) bizde zaten doğrulanmış; bu avantaj
    korunmalı.

**3. Birden çok rig**
- **Ne:** "Ev: Les Paul + HeadRush + Dual Cube", "Prova: Les Paul + Marshall" gibi kayıtlı rig'ler arasında
  tek tıkla geçiş.
- **Nerede görüldü:** ToneAdapt (Saved preset, My Gear → Presets), ToneMatcher (ekipman dolabı ve "bench").
- **Ekran:** [toneadapt-19](rakip-inceleme/ekran/toneadapt-19-ekipman-presetleri.png),
  [toneadapt-25](rakip-inceleme/ekran/toneadapt-25-preset-secildi-going-direct.png),
  [tonematcher-10](rakip-inceleme/ekran/tonematcher-10-rig-amfiler-gorselli.png).
- **ToneFinder'da nasıl:**
  - `lib/storage.ts`'de tek rig yerine `rigs[]` + `activeRigId` tut. Eski tek rig ilk kayıt olarak taşınsın.
  - `RigPanel.tsx` başına rig seçici, "Bu rig'i kaydet" ve "Yeniden adlandır" ekle.
  - Kayıtlı tonlarda amfi + prosesör etiketi (`deviceLabel`) zaten tutuluyor; rig adı da eklenip listede gösterilsin.

**4. Pozisyon başına manyetik modeli**
- **Ne:** Neck / middle / bridge için ayrı manyetik seçimi (stok ya da değiştirilmiş: EMG 81, Seymour Duncan JB…).
- **Nerede görüldü:** ToneAdapt "Custom pickups".
- **Ekran:** [toneadapt-09](rakip-inceleme/ekran/toneadapt-09-ozel-manyetikler.png).
- **ToneFinder'da nasıl:**
  - Rig'e isteğe bağlı `pickups: { neck?, middle?, bridge? }` ekle; varsayılan "stok (katalogdaki)".
  - Küçük bir `lib/pickups.ts` kataloğu kur: tür (single, P90, humbucker, aktif) ve çıkış seviyesi.
    Örnekler: EMG 81/85, Seymour Duncan JB/'59, DiMarzio Super Distortion, Gibson 490/498, ProBucker, Alnico Classic.
  - Çıkış seviyesi araştırma istemine ve gitar farkı telafisine girsin.

### Öncelik 2

**5. Her ayarın "neden"i görünür olsun + "bu tonda dokunma" listesi**
- **Ne:** Her düğmenin altında bir satırlık gerekçe. Ayrıca kullanılmayan düğmeler için katlanır bir liste
  ("Tone 1: köprü manyetiğinde kullanılmıyor", "Effects: kapalı").
- **Nerede görüldü:** ToneMatcher.
- **Ekran:** [tonematcher-05](rakip-inceleme/ekran/tonematcher-05-ornek-tarif-gitar.png),
  [tonematcher-06](rakip-inceleme/ekran/tonematcher-06-ornek-tarif-amfi-preset.png).
- **ToneFinder'da nasıl:**
  - `Knob.tsx`'te not yalnız `title` (fareyle üstüne gelme) olarak duruyor; telefonda ve dokunmatikte görünmüyor.
    Notu düğmenin altında kısa satır olarak göster, uzunsa "devamı" ile aç.
  - `lib/schema.ts`'de bloklara `unused_controls: { name, reason }[]` ekle ve ToneCard'da katlanır liste olarak göster.

**6. Fabrika preseti / hafızadan başla**
- **Ne:** "Önce şu preseti yükle, sonra şu düğmeleri değiştir."
- **Nerede görüldü:** ToneMatcher ("[14] THRASH OVERKILL"), TonesMatch ("Preset: Modern Hi-Gain").
- **Ekran:** [tonematcher-06](rakip-inceleme/ekran/tonematcher-06-ornek-tarif-amfi-preset.png),
  [tonesmatch-04](rakip-inceleme/ekran/tonesmatch-04-ornek-uyarlama.png).
- **ToneFinder'da nasıl:**
  - Amfi ve prosesör kayıtlarına `presets` listesi ekle: Mustang presetleri, Katana kanalları/bankaları, Dual Cube
    LX'te her amp type için 3 MEMORY.
  - Şemaya blok başına `start_from: { preset, why }` ekle; ToneCard'da bloğun başında "Önce şunu yükle" kutusu.
  - Presetler kılavuzdan girilsin. Kılavuzda olmayan için `basis: "çıkarım"` kullanılsın.

**7. Aynı şarkıda birden çok bölüm, fark olarak**
- **Ne:** Tek araştırmada ana ton tam, diğer bölümler (temiz ara bölüm, solo) yalnız değişen ayarlarla.
- **Nerede görüldü:** ToneMatcher (Main Tone / Clean Intro: "ana tondan farklar").
- **Ekran:** [tonematcher-09](rakip-inceleme/ekran/tonematcher-09-temiz-giris-farklar.png).
- **ToneFinder'da nasıl:**
  - Orijinal araştırma şarkının gitar bölümlerini de çıkarsın: `sections: [{ name, tone_type, notes }]`.
  - Uyarlama, seçilen bölümü tam, diğerlerini `changes: [{ block, setting, value, why }]` olarak döndürsün.
  - ToneCard'da bölüm sekmeleri olsun. Önbellek anahtarı şarkı + enstrüman olur, bölüm sekme olur.
  - Böylece tek araştırma ücretiyle bütün şarkı çıkar.

**8. Manyetik seçici grafiği ve pedalboard görünümü**
- **Ne:**
  - Gitar panelinde aktif konumu gösteren seçici grafiği.
  - Pedallar için kutu görünümü ve "birebir / yakın / yerine" rozeti.
  - Zincirde bloğa tıklayınca ayrıntı açılması.
- **Nerede görüldü:** ToneMuse.
- **Ekran:** [tonemuse-08](rakip-inceleme/ekran/tonemuse-08-sarki-manyetik-secici.png),
  [tonemuse-09](rakip-inceleme/ekran/tonemuse-09-sarki-pedalboard.png),
  [tonemuse-07](rakip-inceleme/ekran/tonemuse-07-sarki-sinyal-zinciri.png).
- **ToneFinder'da nasıl:**
  - ToneCard Panel 02'ye dizilime göre 3'lü toggle ya da 5'li bıçak SVG'si ekle; `pickup_position`
    metninden konumu eşle.
  - Şemaya blok başına `match: "exact" | "close" | "substitute"` ekle. Bugün yalnız "≈ benzettiği" metni var.
  - Zincir şeridindeki bloklar tıklanınca ilgili karta kaysın.
  - ToneMuse'taki gibi anlamsız "DSP buffer / headroom" süsleri eklenmesin.

**9. Orijinal tonu uyarlama bitmeden göster**
- **Ne:** Orijinal rig (ya da önbellekteki sonuç) hazır olur olmaz ekrana gelsin; uyarlama arkada sürsün.
- **Nerede görüldü:** ToneAdapt (Original Tone solda hemen, uyarlama sağda), TonesMatch (orijinal ton
  ekipman formunun yanında).
- **Ekran:** [toneadapt-29](rakip-inceleme/ekran/toneadapt-29-sonuc-orijinal-ve-kilitli-uyarlama.png),
  [tonesmatch-10](rakip-inceleme/ekran/tonesmatch-10-orijinal-ton-guven.png).
- **ToneFinder'da nasıl:**
  - `/api/tone` NDJSON akışına bir `original` olayı ekle (`lib/research.ts` iki aşamayı zaten ayırıyor).
  - `page.tsx` bu olayla Panel 03'ü ve şarkı başlığını doldursun, uyarlama panellerinde "uyarlanıyor…" göstersin.
  - Önbellekten gelince orijinal bekleme sıfıra iner.

**10. Gerçek bas desteği**
- **Ne:** Bas gitar, bas manyetik dizilimi ve bas amfisi kataloğu.
- **Nerede görüldü:** ToneMuse, ToneAdapt ve TonesMatch'te "Bass" seçeneği var; TonesMatch 155 bas, ToneAdapt
  219 bas ve 152 bas amfisi diyor (k). TonesMatch'te Master of Puppets'in bas tonu ayrı kayıt.
- **Ekran:** [tonesmatch-06](rakip-inceleme/ekran/tonesmatch-06-sarki-arama-kayitli-tonlar.png).
- **ToneFinder'da nasıl:**
  - Bugün "Bas" yalnız istemdeki bir kelime.
  - `lib/basses.ts` ekle: P/J Bass, Ibanez SR, Music Man StingRay…
  - Bas amfileri ekle: Ampeg, Fender Rumble, Katana-110 Bass…
  - Dizilim seçenekleri ekle: P, PJ, JJ, MM, aktif/pasif.
  - Bas seçilince RigPanel bu listelere geçsin.

### Öncelik 3

**11. Paylaşım ve dışa aktarma**
- **Ne:** Sonucu bir arkadaşa ya da başka bir bilgisayara gönderebilmek.
- **Nerede görüldü:** ToneMuse "Share Tone Card", "Copy Patch Preset".
- **Ekran:** [tonemuse-04](rakip-inceleme/ekran/tonemuse-04-sarki-sayfasi.png).
- **ToneFinder'da nasıl:**
  - Sonucu `.tonefinder.json` olarak indir, "İçe aktar" ile aç.
  - ToneCard'ı PNG kart olarak kaydet.
  - Web sürümünde paylaşım linki.
  - Asıl fark yaratacak olan preset dosyası dışa aktarma (Helix `.hlx`) hâlâ kimsede yok.

**12. Topluluk, beğeni, trend, hesap, çok dil**
- **Nerede görüldü:** hepsinde.
- **Ekran:** [tonemuse-03](rakip-inceleme/ekran/tonemuse-03-community.png),
  [toneadapt-21](rakip-inceleme/ekran/toneadapt-21-topluluk.png).
- **ToneFinder'da nasıl:** web sürümüyle (eski listedeki 8. madde). Yerel sürümde önce önbelleği
  "araştırılmış şarkılar" listesi olarak göster.

**13. Kayıtlı tonlarda silme ve geçmiş**
- **Ne:** Kayıtlı ton listesinde silme düğmesi yok (açıp yıldızı kaldırmak gerekiyor). Kaydedilmemiş sonuç sayfa
  yenilenince kayboluyor.
- **Nerede görüldü:** rakiplerde kütüphane ücretli ([toneadapt-20](rakip-inceleme/ekran/toneadapt-20-kutuphane-kilitli.png));
  bu bizim iç eksiğimiz.
- **ToneFinder'da nasıl:** `lib/storage.ts`'e son 20 sonucu tutan `history` ekle; listede sil ve yeniden adlandır.

**14. Cihaz görselleri**
- **Nerede görüldü:** ToneMatcher (amfi ve pedal fotoğrafları).
- **Ekran:** [tonematcher-10](rakip-inceleme/ekran/tonematcher-10-rig-amfiler-gorselli.png).
- **ToneFinder'da nasıl:** üretici fotoğraflarını kopyalamadan (telif), tür ikonları ya da basit çizimler.
  Düşük öncelik.

### Almayalım

- **Uydurma sayaçlar ve puanlar:** "150.000+ gitarist", haftada "1.284 arama", "%98 ton eşleşmesi",
  "uyarlama doğruluğu %100". ToneFinder'daki "tahmin" etiketli yakınlık yüzdesi doğru yaklaşım.
- **Orijinali "kalibre edilmiş" diye aynen göstermek:** ToneMuse'un hedef düğmeleri orijinalle aynı sayılar.
- **Her şeye efekt eklemek:** Master of Puppets riffine delay ve hall reverb.
- **Genel "teşhis" üreten tanışma hunisi:** ToneMuse [33](rakip-inceleme/ekran/tonemuse-33-tanisma-sonuc.png).
- **Bulanık sahte ön izleme:** kilitli alanlarda "0" ve genel pedal adları.

## ToneFinder için önerilen sıra (güncel)

Öğlen listesindeki 1–5 yapıldı: şarkı arama, Riff/Solo ve ton türü, amfi efektleri, zorluk, sınırlamalar,
alternatifler, Songsterr ve backing track, ayar başına etiket, önbellek. Sıradaki iş:

1. Eksikler 1–4: efektlerin amfiden gelmesi, aranabilir katalog + web'de tanıtma, birden çok rig, manyetik modeli.
2. Eksikler 5–9: sonuç ekranı (neden satırları, dokunma listesi, preset başlangıcı, bölümler, seçici ve
   pedalboard, orijinali önce gösterme).
3. Eksik 10: bas.
4. Preset dosyası dışa aktarma (Helix `.hlx` gibi belgelenmiş biçimler; HeadRush ve AmpliTube için biçim
   araştırılmalı). Kimsede yok.
5. Web sürümüyle: hesap, bulut kayıt, topluluk, paylaşım, çok dil.

<details>
<summary>Canlı incelemeyi yeniden yapmak için prompt</summary>

Tarayıcı aracı olan bir Claude oturumunda (ARDAPC'de yerel oturum, Claude in Chrome ya da masaüstü uygulamasının
tarayıcısı) kullan. ToneFinder klasöründe aç:

```
Rakip inceleme görevi. Önce docs/rakip-inceleme.md dosyasını oku. Siteleri tarayıcıda canlı incele ve
ToneFinder'da hâlâ eksik olan özellikleri bul.

Kurallar:
- Satın alma yapma, ödeme bilgisi girme, deneme aboneliği başlatma.
- Hesap açmak ya da Google ile giriş yapmak gerekirse önce bana sor.
- Sitelerin verisini toplu indirme/kopyalama yapma; amaç akışı ve mantığı anlamak.
- Her adımda ekran görüntüsü al ve docs/rakip-inceleme/ekran/ klasörüne site-adim-no.png olarak kaydet.

Sırayla:
1) https://tonemuse.app/ ve https://tonemuse.app/app — ana sayfa, /plans, /community, bir şarkı sayfası.
   Formda her alanı tek tek dene: şarkı arama ("Master of Puppets"), gitar/bas, riff/solo, ton türü,
   gitar arama ("Stratocaster"), amfi arama ("Dual Cube", "Katana"), Direct, amfi efektleri,
   pedal / multi-efekt arama ("HeadRush Core", "Helix", "AmpliTube"). Hangi alan serbest metin, hangisi
   listeden seçme? Bulunamayınca ne oluyor? Ücretsiz sonuç ekranında ne görünüyor?
2) https://www.toneadapt.com/ — aynı adımlar; ayrıca /plans ve herkese açık bir topluluk tonu sayfası.
   Sonuç sayfasındaki tüm bölüm başlıklarını ve alanları sırayla yaz.
3) https://tonematcher.com/ ve https://tonesmatch.com/ — giriş yapmadan görülebilenler.
4) ToneFinder'ı çalıştır (npm run dev) ve aynı şarkıyla kendi akışımızı dene.
5) Karşılaştırma tablosunu ve "ToneFinder'da hâlâ eksik olanlar" bölümünü güncelle; neyi canlı gördüğünü,
   neyi göremediğini ayrı yaz.
6) Değişiklikleri commit edip dala gönder ve Türkçe kısa özet ver.
```

</details>
