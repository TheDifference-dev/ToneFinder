# ToneFinder

Guitar Tone Finder — yapay zekâ destekli gitar ton bulucu (ToneAdapt benzeri).

Bir şarkı ve bölüm (ritim, solo, giriş…) seçersin; uygulama orijinal kayıttaki tonu
analiz eder ve **senin ekipmanına** (amfi/modelleyici, gitar, manyetikler, pedallar)
göre somut ayarlara çevirir:

- Cihazındaki amfi modeli/kanalı ve düğme ayarları (görsel knob'larla)
- Sinyal sırasına göre efekt zinciri ve parametreleri
- Gitar ayarları (manyetik seçimi, volume/tone, akort)
- Orijinal ekipman, uyarlama notları ve çalım ipuçları
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
| `app/api/tone/route.ts` | Claude API çağrısı (yapılandırılmış çıktı ile ton tarifi) |
| `lib/schema.ts` | İstek doğrulama ve yapay zekâ çıktısının Zod şeması |
| `lib/gear.ts` | Desteklenen amfi/modelleyici kataloğu ve kontrol adları |
| `components/ToneCard.tsx`, `components/Knob.tsx` | Sonuç kartı ve düğme görselleri |

Yapay zekâ çağrısı sunucu tarafında yapılır; API anahtarı tarayıcıya hiç gitmez.
Yeni bir cihaz eklemek için `lib/gear.ts` içindeki `DEVICES` listesine bir kayıt eklemen yeterli.
