# CTRLCV — Claude Code Giriş Noktası

> Bu dosya her oturumda yüklenir. ≤150 satır.

## Bu proje nedir?

Türkçe konuşan iş arayanlar için AI-destekli CV oluşturma SPA'sı. React 18 + TypeScript + Vite + Tailwind + Zustand. Kullanıcı kendi Gemini anahtarını tarayıcısında saklar, doğrudan sağlayıcıya istek atar — hiçbir backend yok. 9 profesyonel şablon (TR/EN dil duyarlı), ATS-uyumlu PDF + Word export, PDF içe aktarma, CV puanlama, iş ilanı eşleştirme, AI destekli iş arama ve AI ile İngilizceye çeviri (yeni CV olarak).

## Üç katman
- **Niyet:** `.claude/charter/PROJECT_INTENT.md` — neden, ne, ne DEĞİL
- **Yapı:** `.claude/charter/PHASES.md` — fazlar, epicler, kabul kriterleri
- **İş:** `.claude/pipeline/BACKLOG.md` — aktif fazın özet listesi

## Aktif durum (oturum başında oku)
- **Aktif faz:** PHASE-001 🔄 (retrospektif — tüm GD-R'ler tamamlandı)
- **Aktif GD:** yok — bkz. `.claude/context/CURRENT_STATE.md`
- **Sıradaki:** POOL'dan bir madde seç, GD-011 aç veya PHASE-002 başlat

## Komutlar

```
npm run dev          # Geliştirme sunucusu (localhost:5173)
npm run build        # Production build (tsc -b && vite build)
npm run typecheck    # TS tip kontrolü (--noEmit)
npm run lint         # ESLint
npm run format       # Prettier
```

Claude komutları:
- `/kapat` — oturum sonu ritüeli (Artifact Map, SESSION_LOG, karar drift)
- `/doktor` — hızlı sağlık taraması
- `/doktor --tam` — 7 katman tam denetim
- `/review` — kod incelemesi
- `/faz yeni|aktif|kapat` — faz yönetimi

## Oturum ritüeli

**Başlangıç:** Bu dosya + `.claude/context/CURRENT_STATE.md` + aktif GD dosyasını oku → kullanıcıya brifing.

**Bitiş:** `/kapat` — Artifact Map, SESSION_LOG, karar drift otomatik.

## Kaynak yapısı

```
src/
├── features/       # Feature-folder: ai, editor, export, help, import, jobs, preview, score
├── components/     # layout/ (Header/Footer/Layout) + ui/ (atomic: Button, Input…)
├── lib/            # UI-yok çekirdek: ai-client, cv-score, job-match, job-search, prompts, seed
├── store/          # Zustand + persist: cv-store, cv-list-store, ai-store, job-match/search-store
├── templates/      # 9 şablon + TemplateRenderer + shared/tokens + shared/helpers
├── types/cv.ts     # Tüm Zod şemaları + TypeScript tipler (tek kaynak)
├── pages/          # Route hedefleri (lazy loaded)
├── router/         # createBrowserRouter
├── hooks/          # useDarkMode, useKeyboardShortcuts, useSmartPageBreaks, useElementWidth
└── utils/          # date.ts, id.ts
```

## Yapılmayacaklar (Doktor kelime listesi)

- ❌ Backend / sunucu / veritabanı / proxy
- ❌ Mobil native uygulama
- ❌ Çoklu kullanıcı / paylaşım / yorum / SaaS / abonelik
- ❌ Test framework (jest / vitest / playwright) — D-203 bilinçli karar

## Anahtar kararlar (hızlı referans)

| ID | Karar | Dosya |
|---|---|---|
| D-001 | Tüm domain modeli Zod şeması → `types/cv.ts` | PATTERNS |
| D-002 | Zustand store'lar localStorage'a persist | PATTERNS |
| D-003 | AI istekleri tarayıcıdan doğrudan sağlayıcıya | PATTERNS |
| D-004 | Sağlayıcılar OpenAI-uyumlu API ile soyutlanır | PATTERNS |
| D-005 | Bölüm formları `features/editor/sections/` bölüm başına 1 dosya | PATTERNS |
| D-006 | Şablonlar `{ cv: CVDocument }` sözleşmesi | PATTERNS |
| D-007 | Tüm promptlar `lib/prompts.ts`'de | PATTERNS |
| D-201 | `src/` feature-folder düzeni; bağımlılık yönü sabit | SOLUTION_STRUCTURE |
| D-202 | `lib/` UI'dan bağımsız — React import yasak | SOLUTION_STRUCTURE |
| D-203 | Otomatik test framework yok — bilinçli karar | SOLUTION_STRUCTURE |

Tam karar listesi: `.claude/decisions/` · Ters indeks: `.claude/decisions/_index.md`

## Doktor

Doktor üretici değildir. Sapma bulduğunda üç olasılık masaya koyar: (1) iş silinir, (2) niyet güncellenir, (3) yeni proje. Detay: `.claude/doktor/DOKTOR_PROMPT.md`.
