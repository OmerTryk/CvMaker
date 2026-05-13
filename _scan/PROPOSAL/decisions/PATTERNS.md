# PATTERNS.md
> Kararlar: D-001 … D-008 · `/analiz` Katman C çıktısı

---

## D-001 · Zustand + localStorage Kalıcılığı
**Durum**: Gözlemlendi

Tüm uygulama durumu Zustand store'larında; `persist` middleware ile localStorage'a yazılır. Sunucu yoktur.

| Store | Key | İçerik |
|---|---|---|
| cv-store | `cvmaker.cv.v1` | Aktif CV dökümanı |
| ai-store | `cvmaker.ai.v3` | API anahtarı, sağlayıcı |
| cv-list-store | `ctrlcv.cvlist.v1` | Çoklu CV meta verisi |
| job-match-store | `ctrlcv.jobmatch.v1` | İş ilanı + eşleşme |

**Kural**: Yeni kalıcı veri eklenmesi gerekiyorsa → yeni Zustand store veya mevcut store genişletilir. `localStorage` doğrudan kullanılmaz.

---

## D-002 · Zod ile Runtime Validasyon
**Durum**: Gözlemlendi

CV veri modeli `src/types/cv.ts`'de Zod şemalarıyla tanımlanır. TS türleri `z.infer<>` ile otomatik türetilir. JSON import/export sırasında `CVDocumentSchema.safeParse()` kullanılır.

**Kural**: CV ile ilgili yeni bir alan → önce Zod şemasına eklenir, tür otomatik güncellenir.

---

## D-003 · BYOK (Bring Your Own Key) AI Modeli
**Durum**: Gözlemlendi

AI API anahtarları kullanıcıya aittir; `ai-store`'da localStorage'da saklanır, sunucuya iletilmez. İstek tarayıcıdan doğrudan Gemini/Groq'a gider.

**Desteklenen sağlayıcılar**: Gemini (`gemini-1.5-flash`, `gemini-1.5-pro`), Groq (`llama-3.3-70b-versatile`, `mixtral-8x7b-32768`)

**Kural**: Yeni AI sağlayıcısı eklenecekse → `PROVIDERS` sabiti + `ai-client.ts`'deki stream mantığı güncellenir.

---

## D-004 · Şablon Renderer Deseni
**Durum**: Gözlemlendi

`TemplateRenderer` tek giriş noktasıdır; `settings.template` değerine göre doğru şablonu mount eder. Her şablon aynı `CVDocument` prop'unu alır. `tokens.ts` renk/font sabitlerini tutar.

**Kural**: Yeni şablon = `src/templates/YeniTemplate.tsx` + `TEMPLATE_LIST` kaydı + `TemplateRenderer` case'i.

---

## D-005 · Barrel Export (index.ts)
**Durum**: Gözlemlendi

Her `features/*` ve `components/ui/` altında `index.ts` barrel export dosyası vardır. Import yolları `features/editor` şeklinde kısaltılır.

---

## D-006 · PDF Export: Tarayıcı Yazdırma
**Durum**: Gözlemlendi

`react-to-print` ile CSS `@media print` kuralları kullanılır. Puppeteer/sunucu yok. Sayfa kırılmaları `useSmartPageBreaks` ile hesaplanır.

---

## D-007 · Prompt'lar Merkezi Modülde
**Durum**: Gözlemlendi

Tüm AI prompt fonksiyonları `src/lib/prompts.ts` içinde toplanır. Bileşenler prompt içeriğini bilmez; sadece `build*Prompt()` fonksiyonlarını çağırır.

---

## D-008 · Klavye Kısayolları Hook Sistemi
**Durum**: Gözlemlendi

`useKeyboardShortcuts` global dinleyici yönetir. Kısayollar `{ key, meta, shift, action, global }` nesneleriyle tanımlanır. Input odaklanmışken `global: true` olmayan kısayollar tetiklenmez.
