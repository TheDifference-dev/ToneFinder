# ToneFinder

Guitar Tone Finder — yapay zekâ destekli gitar ton bulucu (ToneAdapt benzeri).

Bir şarkı ve bölüm (ritim, solo, giriş…) seçersin; uygulama iki adımda çalışır:

1. **Araştırma** — yapay zekâ web'de arama yapar, tercih edilen siteleri ve forumları okur;
   orijinal kayıttaki gitar, amfi, kabin/hoparlör, mikrofon ve mesafesi, pedallar ve
   ayarlarını kaynaklarıyla bulur. Ardından senin cihazının (ör. HeadRush Core) model
   listesini araştırıp her orijinal ekipmanın cihazındaki karşılığını eşleştirir.
2. **Düzenleme** — araştırma raporunu ekrandaki yapılandırılmış sonuca çevirir.

Sonuçta:

- Orijinal ekipman (kaynaklı / muhtemel / tahmin etiketleriyle)
- Senin cihazında sinyal zinciri: her blokta cihazdaki model adı, neyi taklit ettiği ve ayarları
  (kabin bloğunda mikrofon, pozisyon ve mesafe dahil)
- Gitar ayarları (manyetik seçimi, volume/tone, akort)
- Orijinal ekipman, uyarlama notları ve çalım ipuçları
- Kullanılan kaynakların linkleri
- Araştırma sırasında yapılan aramalar ve okunan sayfalar canlı gösterilir
- Ekipman profili ve kaydedilen tonlar tarayıcıda saklanır

## Kurulum

```bash
npm install
cp .env.example .env.local   # ANTHROPIC_API_KEY değerini gir
npm run dev                  # http://localhost:3000
```

## Mimari

| Dosya | Görev |
|---|---|
| `app/page.tsx` | Arayüz: ekipman profili, şarkı arama, kayıtlı tonlar |
| `app/api/tone/route.ts` | API rotası; araştırma ilerlemesini NDJSON olarak akıtır |
| `lib/research.ts` | İki adımlı yapay zekâ akışı: web araştırması + yapılandırılmış çıktı |
| `lib/sources.ts` | Araştırmada öncelik verilecek siteler |
| `lib/schema.ts` | İstek doğrulama ve yapay zekâ çıktısının Zod şeması |
| `lib/gear.ts` | Desteklenen amfi/modelleyici kataloğu ve kontrol adları |
| `components/ToneCard.tsx`, `components/Knob.tsx` | Sonuç kartı ve düğme görselleri |

Yapay zekâ çağrısı sunucu tarafında yapılır; API anahtarı tarayıcıya hiç gitmez.
Bir araştırma genelde 1–3 dakika sürer. Öncelikli siteleri değiştirmek için `lib/sources.ts`,
yeni bir cihaz eklemek için `lib/gear.ts` içindeki `DEVICES` listesine bir kayıt eklemen yeterli.
