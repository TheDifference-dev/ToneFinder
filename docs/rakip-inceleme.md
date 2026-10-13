# Rakip inceleme: ToneMuse, ToneAdapt, ToneMatcher, TonesMatch

Tarih: 13 Ekim 2026. Kaynaklar: sitelerin kendileri (sayfalar, sitemap, gizlilik/kullanım şartları,
tarayıcıya inen JS kodu, herkese açık arama uç noktaları), App Store / Google Play kayıtları, yorumlar.
"(çıkarım)" yazan yerler doğrudan görülmedi, koddan ya da verilerden çıkarıldı.

> **İsim düzeltmesi:** `tunemuse.app` diye bir site yok. Aranan uygulama **ToneMuse** —
> https://tonemuse.app/ — ve iOS uygulaması değil, **web uygulaması** (telefonda tarayıcıdan açılıyor).
> App Store'daki "Tune Muse" ise yapay zekâ ile şarkı üreten, alakasız bir uygulama.
> App Store'da olan ve aynı işi yapan uygulama **ToneAdapt**.

## Hepsinin ortak mantığı

Dördü de aynı iki adımlı akışla çalışıyor (ToneFinder da öyle):

1. **Orijinal tonu araştır** (şarkı + bölüm + temiz/distorsiyon için bir kez) → orijinal gitar, manyetik,
   amfi ve ayarları, pedallar, kaynaklar, güven puanı. Sonuç **önbelleğe alınıyor** ve aynı şarkıyı soran
   herkese yeniden kullanılıyor ("community tones").
2. **Kullanıcının ekipmanına uyarla** → amfi düğmeleri, kanal/mod, pedal ayarları, manyetik ve
   volume/tone, sinyal zinciri, çalım ipuçları.

Yapay zekâ: **ToneAdapt, ToneMatcher ve TonesMatch OpenAI kullanıyor** (gizlilik metinlerinde yazıyor).
ToneMuse'ta sağlayıcı görünmüyor; sunucuda çalışan bir dil modeli (çıkarım). **Hiçbiri şarkıyı ya da
kullanıcının çalımını dinlemiyor** (ses analizi yok). Asıl farkı **yapılandırılmış ekipman veritabanı**
yaratıyor: yapay zekâ yalnızca cihazda gerçekten olan düğmelerle cevap vermeye zorlanıyor.

## ToneMuse (tonemuse.app)

- **Ne:** web uygulaması (Next.js + Vercel, Convex veritabanı, yalnız Google ile giriş, Dodo Payments).
  Yasal şirket adı yok, iletişim bir Gmail adresi. Fiyatlar USD ve INR (Hindistan merkezli olabilir, çıkarım).
- **Fiyat:** Ücretsiz (sonuç bulanık/kilitli, 1 rig, 3 kayıt) · Expert haftalık 4,99 $ · aylık 9,99 $. İade yok.
- **Akış:**
  1. İsteğe bağlı 3 adımlı tanışma: rig türü (modelleme amfi / multi-efekt / lambalı-transistörlü amfi + pedal /
     ses kartı + eklenti), ton sorunları, hedef tarz.
  2. Form: **şarkı arama (Last.fm otomatik tamamlama)**, "Trend şarkılar", enstrüman (gitar/bas),
     **bölüm (riff/solo)**, **ton türü (otomatik/temiz/distorsiyon)**, gitar arama, amfi arama ya da
     **"Direct (amfisiz)"**, **amfinin dahili efektleri** (reverb, delay, chorus...), **pedallar / multi-efekt /
     ikisi birden**, listede olmayan için "özel ekipman ekle".
  3. "Research Tone" → aşamalı yükleme mesajları → sonuç.
- **Sonuç:** orijinal rig (gitar, manyetik, amfi, distorsiyon tarzı, ayarlar), **"%X ton eşleşmesi"**,
  **akort**, **zorluk (5 üzerinden)**, manyetik seçici, gitar volume/tone, amfi düğmeleri 0–10,
  pedal zinciri ya da blok blok multi-efekt zinciri, özet, **"Copy patch"** (metni panoya kopyalar), kaydet.
- **Ekipman veritabanı:** marka → seri → model, kısa açıklamalarla; multi-efektlerde cihazın amfi modelleri listesi;
  pedallarda kategori, fiyat ve "kim kullanıyor". "10.000+ gitar ve amfi" diyor ama boşluklar var
  (HeadRush amfi aramasında yok, Ibanez/Tube Screamer pedal aramasında yok).
- **Bilgi:** "stüdyo kanalları, teknisyen kayıtları, rig rundown'lar" diyor; kodda görünen sunucuda üretilen metin.
  Aynı şarkı sayfasında birbiriyle çelişen rig bilgisi var (Enter Sandman).
- **Zayıf yanlar:** doğrulanamayan "150.000+ kullanıcı, 4,9 puan" (sayaçlar "0" gösteriyor), ücretsiz sonuç
  sahte bir kilitli önizleme (kod araştırma yapmadan sabit değerler gösteriyor), uydurma yazar adıyla blog.

## ToneAdapt (toneadapt.com + iOS + Android)

- **Ne:** ToneAdapt, LLC (ABD). iOS 2026-04 çıkışlı, 4,77 puan / 3.060 oy; Android 5.000+ indirme.
  6 dil. Yapay zekâ: OpenAI. Altyapı: Supabase, Stripe, RevenueCat, Superwall, Vercel.
- **Fiyat:** web yıllık 39,99 $ (ayda 20 uyarlama) / 49,99 $ (sınırsız), 7 gün deneme; iOS'ta haftalık 5,99 $'dan başlıyor.
- **Akış:**
  1. Şarkı arama (**iTunes Search API**, kapak resmiyle) → **Riff/Solo** → **Clean/Distorted** → gitar/bas.
  2. Ekipman **yalnız veritabanından seçiliyor** (serbest metin yok; "amfin yoksa iste" bağlantısı),
     "Going direct" (amfisiz), "Multi-FX'i amfi olarak kullan", amfinin dahili efektleri, pedallar, "My Gear" ön ayarı.
  3. Araştırma (`/api/research-tone`) → uyarlama (`/api/adapt-tone` ya da `/api/adapt-multi-fx-tone`).
- **Sonuç:** Amfi ayarların, önerilen kanal/mod/preset, EQ rehberi, sinyal zinciri, pedal ayarların,
  manyetik seçimi, gitar kontrolleri, çalım ipuçları, teknik, **sınırlamalar**, **alternatifler**, kaynaklar,
  **zorluk (1–5, nedenleriyle)**, **uyarılar** ("amfi ayarları tahmini" gibi), **güven puanı**, 10 ton özelliği,
  şarkı profili (his, tempo, dinamik). Son sürüm: sonuçlar **cihaz görseli üzerinde düğmeler**, coil-split ve
  treble-bleed, **"Kulağa yanlış mı geliyor?"** geri bildirimi, **Songsterr tab bağlantısı**, **backing track bul**.
- **Ekipman veritabanı (asıl gücü):** "9.000+" iddiası; herkese açık uç noktalar 1.000 amfi, 1.000 gitar,
  219 bas, 152 bas amfisi, 50 multi-efekt döndürdü.
  - **Amfi kaydı 3 tür:** `simple` (düz düğmeler), `mode_based` (ör. Katana: her modun adı, gain aralığı,
    distorsiyon sınıfı), `preset_based` (ör. Mustang: numaralı presetler). Her amfide **mevcut düğmeler** ve
    min/max/varsayılan değerler, presence/reverb/FX loop/kanal bayrakları.
  - **Gitar kaydı:** manyetik dizilimi, her konumun manyetiği (tür, çıkış), seçici konumları, coil-split,
    özel kontroller, gövde, ağaç, sap boyu, ton etiketleri.
  - **Multi-efekt kaydı:** Helix (94 amfi modeli), Quad Cortex, Kemper, Axe-Fx III, HeadRush, Tone Master Pro,
    TONEX, AmpliTube 5, BIAS FX 2, Guitar Rig 7, Neural DSP... Her modelde **"Model adı (gerçek amfi)"** eşleşmesi,
    kategoriye göre efekt modelleri, aynı anda kaç efekt.
- **Topluluk:** her şarkı/bölüm/ton bir kayıt, çok sürümlü (Master of Puppets: 728 sürüm), beğeni, trend,
  1.000 herkese açık SEO sayfası.
- **Doğruluk konusunda sorunlu yanlar:** koddaki "+N kaynak daha analiz edildi" sayısı şarkı adının
  uzunluğundan hesaplanan **uydurma bir sayı**; önbellekten gelen sonuca yapay 4,5 sn bekleme ekleniyor.
- **Şikâyetler:** farklı şarkılara neredeyse aynı ayarlar, ayarsız pedal önerileri, "uyduruyor",
  gain düğmesi olmayan amfiyi yanlış okuma, küçük pratik amfilerinde tutarsızlık, fiyatın açık olmaması.

## ToneMatcher (tonematcher.com, iOS)

- Aynı akış; ekipman eklenmeden "örnek rig" ile çalışıyor. OpenAI.
- **Farkı:** tarifler **cihaz kılavuzu verisine dayanıyor**; her cihazın kılavuz bağlantısı ve doğrulama tarihi
  tutuluyor. **Her ayarın yanında etiket:** "Cited" (kılavuz/fabrika preseti), "Inferred" (çıkarım),
  "Double-check" (kontrol et). Listede olmayan cihaz için "web'de ara".
- iOS 3,2 puan / 9 oy (yeni). Günlük meydan okuma ve liderlik tablosu var.

## TonesMatch (tonesmatch.com, web)

- 24.806 araştırılmış ton, 2.019 gitar, 1.526 amfi, 879 pedal, 155 bas, "12 kabin sesi" iddiası.
- Sloganı "her düğme gerçek": genel yapay zekânın Katana 50'de olmayan Presence düğmesini önerdiğini gösteren
  karşılaştırma. Her ton için kaynak ve güven puanı. Hesapsız göz atma ücretsiz. OpenAI + Supabase.

## ToneFinder ile karşılaştırma

| Özellik | ToneMuse | ToneAdapt | ToneFinder (şimdi) |
|---|---|---|---|
| İki adım: orijinal araştırma + uyarlama | var | var | **var** |
| Gerçek web araştırması + kaynak linkleri | iddia | var | **var** (Claude web araması, kaynaklar listeleniyor) |
| Her bilgiye kaynaklı/muhtemel/tahmin etiketi | yok | genel güven puanı | **var** (orijinal rig için) |
| Gitar farkı telafisi (Les Paul → Strat) | kısmen | kısmen | **var**, ayrı bölüm |
| BPM ve tonalite | yok | yok | **var** |
| Amfiyi monitör / 4 kablo kullanımı | yok | yok | **var** |
| AmpliTube gear'ının gerçek karşılıkları | yok | model listesi | **var** (416 gear) |
| Şarkı otomatik tamamlama (kapak resmiyle) | Last.fm | iTunes | **var** (iTunes, yedek Deezer) |
| Riff/Solo + Temiz/Distorsiyon/Otomatik seçimi | var | var | **var** (+ gitar/bas) |
| Aranabilir ekipman veritabanı (seçmeli) | var | **en güçlüsü** | kısmen (serbest metin + 45 amfi, 29 gitar modeli kataloğu) |
| Amfi türleri: düz / modlu / presetli, gerçek düğme aralıkları | yok | var | kısmen (kanal/mod/düğme adları var, aralık yok) |
| Amfinin dahili efektleri seçimi | var | var | **var** |
| Pedal veritabanı | var | yok (görülmedi) | **var** (60 pedal, düğme adlarıyla; listede yoksa serbest yazılır) |
| Her ayara "kılavuzdan / çıkarım / kontrol et" etiketi | yok | yok | **var** (ToneMatcher'da da var) |
| Zorluk puanı, akort, ton eşleşme yüzdesi | var | zorluk var | **var** (yüzde "tahmin" diye gösteriliyor) |
| Sınırlamalar ve alternatifler bölümü | yok | var | **var** |
| Songsterr tab / backing track bağlantısı | yok | var | **var** |
| Sonucu önbelleğe alma (aynı şarkıyı tekrar araştırmama) | var | var | **var** (yerel) |
| "Kulağa yanlış geliyor" geri bildirimi / yeniden araştır | yeniden araştır | var | **var** (ikisi de) |
| Kaydedilmiş tonlar | bulut | bulut | **var** (yerel) |
| Hesap, topluluk tonları, beğeni, trend | var | var | yok (web sürümünde gelir) |
| Preset dosyası dışa aktarma (.hlx, .rig...) | yok (yalnız metin kopyala) | yok | "Ayarları kopyala" var; dosya dışa aktarma yok — **kimsede yok, fark yaratır** |
| Ses analizi (şarkıyı dinleme) | yok | yok | yok |
| Dil | İngilizce | 6 dil | Türkçe |

> **13 Ekim 2026 güncellemesi:** aşağıdaki sıradan 1–5 ToneFinder'a eklendi; 6 kısmen (pedal kataloğu ve
> amfi efektleri; amfi düğme aralıkları ve modlu/presetli amfi türleri henüz yok). 7–8 açık.

## ToneFinder için önerilen sıra

Kopyalamıyoruz: onların veritabanlarını ya da metinlerini almıyoruz (kullanım şartları ve telif). **Aynı
özellikleri** kendi kaynaklarımızla (üretici kılavuzları, resmî model listeleri) kuruyoruz.

1. **Şarkı arama** — iTunes Search API (ücretsiz, anahtarsız): yazarken şarkı/sanatçı/kapak önerisi.
2. **Riff/Solo + Temiz/Distorsiyon/Otomatik** seçimi ve **amfinin dahili efektleri** kutucukları.
3. **Sonuç ekranına:** zorluk (1–5, nedenleriyle), sınırlamalar, alternatifler, Songsterr ve backing track
   bağlantıları, "Kulağa yanlış mı geliyor? → nedenini yaz → yeniden uyarla".
4. **Her ayara etiket** (ToneMatcher gibi): "kılavuzdan" / "çıkarım" / "kontrol et" — mevcut
   kaynaklı/muhtemel/tahmin sistemimizin uyarlama tarafına genişletilmesi.
5. **Önbellek:** aynı şarkı + bölüm + ton türü için orijinal araştırmayı sakla, yalnız uyarlamayı yeniden yap
   (maliyet ve süre düşer, sonuçlar tutarlı olur).
6. **Ekipman veritabanını yapılandırmak:** amfi kaydını `simple / mode_based / preset_based` türlerine,
   her düğmeye min/max/varsayılan değer; pedal kataloğu (kategori, düğmeler); arama kutusundan seçme +
   "listede yok, serbest yaz" seçeneği. Önce kullanıcının cihazları ve en popüler 100 amfi/pedal.
7. **Fark yaratacak:** preset dışa aktarma (önce Helix `.hlx` gibi belgelenmiş biçimler; HeadRush ve
   AmpliTube için biçim araştırılmalı), dürüst kaynak gösterimi (rakiplerde uydurma sayaçlar var).
8. **Web sürümüyle birlikte:** hesap, bulutta kayıt, topluluk tonları, beğeni, çok dil.

## Siteyi canlı incelemek için Claude Code promptu

Tarayıcı aracı olan bir Claude Code oturumunda (ARDAPC'de yerel oturum, Claude in Chrome ya da
masaüstü uygulamasının tarayıcısı) kullan. ToneFinder klasöründe aç:

```
Rakip inceleme görevi. Önce docs/rakip-inceleme.md dosyasını oku; ToneMuse, ToneAdapt, ToneMatcher ve
TonesMatch hakkında web araştırmasıyla bulunanlar orada. Senden istenen, bunları tarayıcıda canlı
doğrulamak ve eksikleri tamamlamak.

Kurallar:
- Satın alma yapma, ödeme bilgisi girme, deneme aboneliği başlatma.
- Hesap açmak ya da Google ile giriş yapmak gerekirse önce bana sor.
- Sitelerin verisini toplu indirme/kopyalama yapma; amaç akışı ve mantığı anlamak.
- Her adımda ekran görüntüsü al ve docs/rakip-inceleme/ekran/ klasörüne site-adim-no.png olarak kaydet.

Sırayla:
1) https://tonemuse.app/ ve https://tonemuse.app/app — ana sayfa, /plans, /community, bir şarkı sayfası.
   Formda her alanı tek tek dene: şarkı arama ("Master of Puppets"), gitar/bas, riff/solo,
   ton türü, gitar arama ("Stratocaster"), amfi arama ("Dual Cube", "Katana"), Direct, amfi efektleri,
   pedal / multi-efekt arama ("HeadRush Core", "Helix", "AmpliTube"). Hangi alan serbest metin, hangisi
   listeden seçme? Bulunamayınca ne oluyor? Ücretsiz sonuç ekranında ne görünüyor?
2) https://www.toneadapt.com/ — aynı adımlar; ayrıca /plans ve herkese açık bir topluluk tonu sayfası
   (ör. Master of Puppets). Sonuç sayfasındaki tüm bölüm başlıklarını ve alanları sırayla yaz.
3) https://tonematcher.com/ ve https://tonesmatch.com/ — giriş yapmadan görülebilenler: örnek tarif,
   "Cited / Inferred / Double-check" etiketleri, cihaz sayfaları.
4) Her site için: ekran ekran kullanıcı akışı, girdiler, sonuçtaki her bölüm, ekipman seçme mantığı,
   eksik ekipman olunca ne yapılıyor, fiyat ve kısıtlar, hoşuna giden arayüz detayları.
5) docs/rakip-inceleme.md içindeki "ToneFinder ile karşılaştırma" tablosunu canlı gördüklerine göre
   düzelt, yeni bulguları ekle, "ToneFinder için önerilen sıra" bölümünü güncelle. Neyi canlı gördüğünü,
   neyi göremediğini (giriş/ödeme gerektiği için) ayrı yaz.
6) Değişiklikleri commit edip claude/epic-hawking-cqlx1h dalına gönder ve bana Türkçe kısa özet ver.
```
