# Static Inventory — ctrlcv / cvmaker
> Katman A çıktısı · Adapter: TypeScript/React · Tarih: 2026-05-13

## Proje Kimliği
| Alan | Değer |
|---|---|
| Ad | ctrlcv (package: `ctrlcv`) |
| Sürüm | 0.1.0 |
| Dil | TypeScript 5.6 + React 18 |
| Build | Vite 5 |
| Test | **YOK** — test framework bulunamadı |
| Stil | Tailwind CSS 3 |
| State | Zustand 4 |
| Routing | React Router v6 |
| Validasyon | Zod 3 |

---

## Klasör Yapısı

```
src/
├── assets/           logo.svg
├── components/
│   ├── layout/       Header, Footer, Layout
│   └── ui/           13 primitif bileşen
├── features/
│   ├── ai/           10 dosya (panel, inline yardımcılar, stream hook)
│   ├── editor/       8 dosya + 10 section bileşeni
│   ├── export/       5 dosya (PDF + Word)
│   ├── help/         HelpOverlay
│   ├── preview/      4 dosya (canvas, pane, picker)
│   └── score/        CVScoreWidget, JobMatchWidget
├── hooks/            4 özel hook
├── lib/              8 yardımcı modül
├── pages/            5 sayfa
├── router/           index.tsx (React Router v6)
├── store/            5 Zustand store
├── templates/        9 şablon + TemplateRenderer + shared/
├── types/            cv.ts (Zod şemalar), index.ts
└── utils/            date.ts, id.ts
```

---

## Modüller & Public API Yüzeyi

### `src/types/cv.ts`
**Zod Şemalar**: PersonalInfoSchema, ContactInfoSchema, SummarySchema, ExperienceSchema, EducationSchema, SkillSchema, LanguageSchema, CertificateSchema, ProjectSchema, ReferenceSchema, TemplateSchema, ColorThemeSchema, FontFamilySchema, CVLanguageSchema, CVSettingsSchema, SectionKeySchema, CVDocumentSchema, SkillLevelSchema, LanguageProficiencySchema  
**Türler**: PersonalInfo, ContactInfo, Summary, Experience, Education, Skill, Language, Certificate, Project, Reference, CVSettings, SectionKey, Template, ColorTheme, FontFamily, CVLanguage, CVDocument, CVSectionItem, SkillLevel, LanguageProficiency  
**Sabitler**: ALL_SECTIONS (readonly), SECTION_LABELS

### `src/store/cv-store.ts`
**Tür**: ImportResult  
**Arayüz**: CVStore (30+ CRUD metodu)  
**Hook**: useCVStore(), selectCV(), selectLastSaved(), selectSettings()  
**Kalıcılık**: localStorage key `cvmaker.cv.v1`

### `src/store/ai-store.ts`
**Tür**: AIProvider (`'gemini' | 'groq'`)  
**Arayüzler**: ProviderConfig, AIStore  
**Sabit**: PROVIDERS  
**Hook**: useAIStore()  
**Kalıcılık**: `cvmaker.ai.v3`

### `src/store/cv-list-store.ts`
**Arayüzler**: CVListItem, CVListStore  
**Hook**: useCVListStore()  
**Sabitler**: THEME_COLORS, TEMPLATE_LABELS  
**Kalıcılık**: `ctrlcv.cvlist.v1`

### `src/store/job-match-store.ts`
**Arayüz**: JobMatchStore  
**Hook**: useJobMatchStore()  
**Kalıcılık**: `ctrlcv.jobmatch.v1`

### `src/lib/ai-client.ts`
**Sağlayıcılar**: Gemini (SSE), Groq (OpenAI-uyumlu)  
**Fonksiyonlar**: streamAI(), isValidKeyFormat()  
**Hata türleri**: 'auth', 'rate_limit', 'network', 'unknown'

### `src/lib/cv-score.ts`
**Arayüzler**: ScoreItem, CVScoreResult, CVScores  
**Fonksiyonlar**: calcCompletionScore(), calcATSScore(), calcCVScores()

### `src/lib/job-match.ts`
**Arayüzler**: MatchedKeyword, JobMatchResult  
**Fonksiyonlar**: extractJobKeywords(), matchCVToJob()

### `src/lib/prompts.ts`
**Sabit**: CV_WRITER_SYSTEM  
**Fonksiyonlar**: buildSummaryPrompt(), buildExperienceRewritePrompt(), buildAchievementPrompt(), buildAnalysisPrompt(), buildJobMatchPrompt()  
**Not**: Tüm promptlar Türkçe

### `src/lib/seed.ts`
**Fonksiyonlar**: createEmptyCV(), createSampleCV(), createEmpty{Experience|Education|Skill|Language|Certificate|Project|Reference}()

### `src/lib/skill-database.ts`
**Sabitler**: SKILL_DB (10 kategori), ALL_SKILLS (500+), SKILL_CATEGORY

### `src/templates/shared/tokens.ts`
**Arayüzler**: TemplateColors, TemplateFonts, TemplateMeta  
**Sabitler**: COLOR_THEMES (5), FONT_FAMILIES (3), TEMPLATE_LIST (9), A4 (210×297mm / 794×1123px)

---

## React Bileşenler

| Kategori | Bileşenler |
|---|---|
| Pages | HomePage, EditorPage, PreviewPage, DashboardPage, NotFoundPage |
| Layout | Layout, Header, Footer |
| UI Primitives | Button, IconButton, Field, Input, Textarea, MonthInput, Select, TagInput, AchievementList, SkillLevelDots, Paginator, PhotoUpload |
| Editor | EditorShell, SectionCard, ItemRow, AddButton, SortableList, WelcomeBanner |
| Editor Sections | PersonalSection, ContactSection, SummarySection, ExperienceSection, EducationSection, SkillsSection, LanguagesSection, ProjectsSection, CertificatesSection, ReferencesSection |
| AI | AIPanel, SummaryAI, ExperienceAI, AchievementAI, AnalysisAI, ApiKeySetup, InlineKeySetup, AIResultBox |
| Preview | PreviewPane, PreviewCanvas, TemplatePicker |
| Export | ExportButton, PrintableCV |
| Score | CVScoreWidget, JobMatchWidget |
| Help | HelpOverlay |
| Templates | TemplateRenderer + 9 şablon (Modern, Classic, Minimal, Executive, Creative, Technical, Timeline, Elegant, Compact) |

---

## Router (src/router/index.tsx)
```
/              → HomePage
/dashboard     → DashboardPage
/editor        → EditorPage
/preview       → PreviewPage
/*             → NotFoundPage
```
React Router v6, lazy-loaded pages, Suspense fallback.

---

## API Endpoints
**YOK** — tam client-side SPA. AI çağrıları doğrudan Gemini/Groq API'lerine yapılır.

---

## Test Durumu
Test dosyası bulunamadı (`*.test.ts`, `*.spec.ts`, `__tests__/`).
