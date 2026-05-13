# NAMING_CONVENTIONS.md
> Kararlar: D-101 … D-106 · `/analiz` Katman C çıktısı

---

## D-101 · Dosya Adlandırma
| Tür | Kural | Örnek |
|---|---|---|
| React bileşeni | PascalCase `.tsx` | `EditorShell.tsx` |
| Hook | camelCase, `use` prefix `.ts` | `useAIStream.ts` |
| Store | camelCase, `-store` suffix `.ts` | `cv-list-store.ts` |
| Lib / Util | kebab-case `.ts` | `ai-client.ts`, `cv-score.ts` |
| Tip dosyası | kebab-case `.ts` | `cv.ts` |
| Barrel | `index.ts` | `features/editor/index.ts` |

---

## D-102 · Bileşen Adlandırma
- Sayfa bileşenleri: `*Page` suffix (`EditorPage`, `DashboardPage`)
- Feature bileşenleri: özellik adıyla başlar (`AIPanel`, `PreviewCanvas`)
- UI primitifleri: kısa, genel isim (`Button`, `Field`, `Input`)
- Şablon bileşenleri: `*Template` suffix (`ModernTemplate`)

---

## D-103 · Store Hook Adlandırma
`use*Store()` pattern: `useCVStore()`, `useAIStore()`, `useCVListStore()`, `useJobMatchStore()`

---

## D-104 · Prompt Fonksiyon Adlandırma
`build*Prompt()` pattern: `buildSummaryPrompt()`, `buildAnalysisPrompt()`

---

## D-105 · Seed/Factory Fonksiyon Adlandırma
`create*()` veya `createEmpty*()` pattern: `createEmptyCV()`, `createEmptyExperience()`

---

## D-106 · Sabit Adlandırma
UPPER_SNAKE_CASE: `ALL_SECTIONS`, `COLOR_THEMES`, `TEMPLATE_LIST`, `CV_WRITER_SYSTEM`, `PROVIDERS`
