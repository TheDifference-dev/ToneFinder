# ToneFinder

Guitar Tone Finder — yapay zekâ destekli gitar ton bulucu (ToneAdapt benzeri).

Bir şarkı ve bölüm (ritim, solo, giriş…) seçersin; uygulama iki adımda çalışır:

1. **Araştırma** — yapay zekâ web'de arama yapar, tercih edilen siteleri ve forumları okur;
   orijinal kayıttaki gitar, amfi, kabin/hoparlör, mikrofon ve mesafesi, pedallar ve
   ayarlarını kaynaklarıyla bulur. Ardından senin cihazının (ör. HeadRush Core) model
   listesini araştırıp her orijinal ekipmanın cihazındaki karşılığını eşleştirir.
   Gitar farkını da telafi eder (ör. orijinalde Les Paul humbucker, sende Strat single-coil:
   hangi manyetik konumu, ne kadar fazla gain/mid, boost ve noise gate gerekir) ve sahip
   olduğun her pedalın ayarını verir.
2. **Düzenleme** — araştırma raporunu ekrandaki yapılandırılmış sonuca çevirir.

Her amfi, modelleyici, multi-efekt ve gitar türüyle çalışır. Listede olmayan cihazlar için
"Diğer" seçilip adı yazılır; yapay zekâ cihazın model listesini araştırır. HeadRush için
doğrulanmış bir model referansı (`lib/devices/headrush.ts`) hazır gelir.

Sonuçta:

- Orijinal ekipman (kaynaklı / muhtemel / tahmin etiketleriyle)
- Senin cihazında sinyal zinciri: her blokta cihazdaki model adı, neyi taklit ettiği ve ayarları
  (kabin bloğunda mikrofon, pozisyon ve mesafe dahil)
- Gitar ayarları (manyetik seçimi, volume/tone, akort)
- Orijinal ekipman, uyarlama notları ve çalım ipuçları
- Kullanılan kaynakların linkleri
- Araştırma sırasında yapılan aramalar ve okunan sayfalar canlı gösterilir
- Ekipman profili ve kaydedilen tonlar tarayıcıda saklanır

## İki kullanım yolu

### 1) Ücretsiz sürüm — API anahtarı gerekmez
`artifact/tonefinder.html`, claude.ai üzerinde bir Artifact olarak çalışır ve yapay zekâ
isteklerini **kendi Claude aboneliğinden** karşılar (ayrı ödeme yok). İnternette arama yapmaz;
Claude'un kendi bilgisini ve uygulamadaki doğrulanmış model listelerini kullanır.
Sayfayı güncellemek için: `npm run build:artifact` (veriyi `lib/` dosyalarından alır).

### 2) Tam sürüm — web araştırmalı, bilgisayarında çalışır
İnternette arama yapıp kaynak gösterir. Bunun için bir **Anthropic API anahtarı** gerekir:

1. https://console.anthropic.com adresinde hesap aç.
2. *Billing* bölümünden kredi yükle (API, Claude aboneliğinden ayrı ücretlendirilir).
3. *API Keys* bölümünden yeni anahtar oluştur ve kopyala.
4. [Node.js](https://nodejs.org) (LTS) kur.
5. Windows'ta `baslat.bat`, Mac'te `baslat.command` dosyasına çift tıkla. İlk açılışta anahtarı
   sorar ve `.env.local` dosyasına kaydeder; tarayıcıda http://localhost:3000 açılır.

Elle kurulum:

```bash
npm install
cp .env.example .env.local   # ANTHROPIC_API_KEY değerini gir
npm run dev                  # http://localhost:3000
```

Bir şarkı araştırması tahminen 0,3–1 $ arası tutar (web aramaları + model kullanımı).

## Mimari

| Dosya | Görev |
|---|---|
| `app/page.tsx` | Arayüz: ekipman profili, şarkı arama, kayıtlı tonlar |
| `app/api/tone/route.ts` | API rotası; araştırma ilerlemesini NDJSON olarak akıtır |
| `lib/research.ts` | İki adımlı yapay zekâ akışı: web araştırması + yapılandırılmış çıktı |
| `lib/sources.ts` | Araştırmada öncelik verilecek siteler |
| `lib/devices/` | Doğrulanmış model listeleri: HeadRush (resmî Core listesi), Line 6 Helix/HX/POD Go (resmî), Boss Katana Gen 3 (resmî parametre kılavuzu) |
| `artifact/` | Ücretsiz Artifact sürümü (`template.html` → `npm run build:artifact` → `tonefinder.html`) |
| `baslat.bat`, `baslat.command` | Masaüstünde çift tıklamayla başlatma |
| `lib/schema.ts` | İstek doğrulama ve yapay zekâ çıktısının Zod şeması |
| `lib/gear.ts` | Desteklenen amfi/modelleyici kataloğu ve kontrol adları |
| `components/ToneCard.tsx`, `components/Knob.tsx` | Sonuç kartı ve düğme görselleri |

Yapay zekâ çağrısı sunucu tarafında yapılır; API anahtarı tarayıcıya hiç gitmez.
Bir araştırma genelde 1–3 dakika sürer. Öncelikli siteleri değiştirmek için `lib/sources.ts`,
yeni bir cihaz eklemek için `lib/gear.ts` içindeki `DEVICES` listesine bir kayıt eklemen yeterli.
