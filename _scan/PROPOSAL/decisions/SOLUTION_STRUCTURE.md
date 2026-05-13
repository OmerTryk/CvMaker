# SOLUTION_STRUCTURE.md
> Karar: D-201 · `/analiz` Katman C çıktısı

## D-201 · Feature-First Klasör Yapısı
**Durum**: Gözlemlendi (mevcut yapı)

```
src/
├── components/   → paylaşılan UI primitifleri + layout
├── features/     → dikey dilimler (ai, editor, export, help, preview, score)
├── hooks/        → uygulamaya özgü özel hook'lar
├── lib/          → saf iş mantığı (AI client, skor, prompt, seed)
├── pages/        → route bileşenleri (ince sarmalayıcılar)
├── router/       → React Router tanımı
├── store/        → Zustand store'ları
├── templates/    → CV görsel şablonları
├── types/        → Zod şema + TS türleri
└── utils/        → saf yardımcı fonksiyonlar (date, id)
```

**Karar**: `features/` altındaki her modül kendi bileşenlerini, hook'larını ve index.ts barrel export'unu içerir. Sayfalar sadece orchestration yapar; iş mantığı `lib/` veya `features/` içindedir.

**Neden**: Bir özelliği silmek ya da taşımak için tek bir klasörü kaldırmak yeterli olur. `components/ui/` ve `lib/` yatay paylaşım katmanlarıdır.
