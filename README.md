# CTRLCV

Modern, AI destekli CV oluşturma uygulaması. React + TypeScript + Vite ile geliştirilmiştir.

## ✨ Özellikler

- 📝 **Adım adım form editörü** — Her bölüm için detaylı form girişi
- 👀 **Canlı önizleme** — Değişikliklerinizi anında görün
- 🎨 **9 profesyonel şablon** — Modern, Classic, Minimal, Compact, Creative, Elegant, Executive, Technical, Timeline
- 🤖 **Claude AI desteği** — Özet ve açıklama önerileri, içerik iyileştirme
- 📊 **CV puanlama & analizi** — CV'nizin kalitesini değerlendirin
- 🎯 **İş ilanı eşleştirme** — CV'nizi iş ilanlarıyla karşılaştırın
- 📄 **ATS-uyumlu PDF export** — Profesyonel PDF çıktısı
- 💾 **Otomatik kaydetme** — Tüm değişiklikler localStorage'a kaydedilir
- 🔄 **Sürükle-bırak** — Bölümleri ve öğeleri kolayca yeniden düzenleyin
- 📱 **Responsive tasarım** — Mobil uyumlu arayüz
- 🌙 **Dark mode** — Göz dostu karanlık tema

## 🛠️ Teknoloji Stack'i

- **Framework:** React 18 + TypeScript
- **Build:** Vite 5
- **Styling:** Tailwind CSS 3
- **Routing:** React Router v6
- **State:** Zustand (persist middleware ile)
- **Validation:** Zod
- **Icons:** Lucide React
- **Drag & Drop:** @dnd-kit (core + sortable + utilities)
- **PDF:** react-to-print
- **AI:** Anthropic Claude API
- **Utilities:** clsx + tailwind-merge

## 🚀 Başlangıç

### Gereksinimler

- Node.js 20+
- npm 10+ (veya pnpm / yarn)

### Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Uygulama varsayılan olarak [http://localhost:5173](http://localhost:5173) adresinde açılır.

### Komutlar

| Komut              | Açıklama                              |
| ------------------ | ------------------------------------- |
| `npm run dev`      | Geliştirme sunucusunu başlatır        |
| `npm run build`    | Production build oluşturur            |
| `npm run preview`  | Build çıktısını yerel olarak önizler  |
| `npm run lint`     | ESLint ile kod denetimi yapar         |
| `npm run lint:fix` | Düzeltilebilir lint hatalarını çözer  |
| `npm run format`   | Prettier ile kodu formatlar           |
| `npm run typecheck`| TypeScript tip kontrolü yapar         |

## 📁 Klasör Yapısı

```
src/
├── components/          # Yeniden kullanılabilir UI bileşenleri
│   ├── layout/          # Header, Footer, Layout shell
│   └── ui/              # Buton, Input, Card vb. atomic components
├── features/            # Özellik bazlı modüller
│   ├── ai/              # AI özellikleri (Claude API entegrasyonu)
│   ├── editor/          # CV form editörü bileşenleri
│   ├── export/          # PDF export işlemleri
│   ├── help/            # Yardım ve dokümantasyon
│   ├── preview/         # Canlı önizleme bileşenleri
│   └── score/           # CV puanlama ve analizi
├── pages/               # Sayfa bileşenleri
│   ├── HomePage.tsx     # Ana sayfa / giriş
│   ├── DashboardPage.tsx # CV yönetim panosu
│   ├── EditorPage.tsx   # CV düzenleme sayfası
│   └── PreviewPage.tsx  # Tam ekran önizleme
├── router/              # React Router yapılandırması
├── store/               # Zustand state yönetimi
│   ├── cv-store.ts      # Ana CV verisi (persist ile)
│   ├── cv-list-store.ts # CV listesi yönetimi
│   ├── ai-store.ts      # AI önerileri ve ayarları
│   └── job-match-store.ts # İş ilanı eşleştirme
├── templates/           # 9 profesyonel CV şablonu
│   ├── ModernTemplate.tsx
│   ├── ClassicTemplate.tsx
│   ├── MinimalTemplate.tsx
│   ├── CompactTemplate.tsx
│   ├── CreativeTemplate.tsx
│   ├── ElegantTemplate.tsx
│   ├── ExecutiveTemplate.tsx
│   ├── TechnicalTemplate.tsx
│   ├── TimelineTemplate.tsx
│   ├── TemplateRenderer.tsx # Şablon render yöneticisi
│   └── shared/          # Ortak şablon bileşenleri
├── hooks/               # Custom React hook'ları
├── types/               # TypeScript tipler & Zod şemaları
│   ├── cv.ts            # CV veri modeli ve validasyonlar
│   └── index.ts         # Tip dışa aktarımları
├── lib/                 # Core utility fonksiyonlar
│   ├── seed.ts          # Örnek veri oluşturucular
│   └── cn.ts            # Tailwind class birleştirici
├── utils/               # Genel yardımcı fonksiyonlar
└── assets/              # Statik dosyalar (resimler, ikonlar)
```

## 🎯 Geliştirme Durumu

### ✅ Tamamlanan Özellikler

- ✅ **Temel Altyapı** — React + TypeScript + Vite kurulumu
- ✅ **Veri Modeli** — Zustand store & Zod validasyon
- ✅ **Form Editörü** — Tüm CV bölümleri için detaylı formlar
- ✅ **9 Profesyonel Şablon** — Modern, Classic, Minimal, Compact, Creative, Elegant, Executive, Technical, Timeline
- ✅ **Canlı Önizleme** — Gerçek zamanlı CV önizlemesi
- ✅ **PDF Export** — ATS-uyumlu PDF çıktısı
- ✅ **AI Desteği** — Claude API entegrasyonu
- ✅ **CV Puanlama** — Otomatik kalite değerlendirmesi
- ✅ **İş Eşleştirme** — CV'yi iş ilanlarıyla karşılaştırma
- ✅ **Drag & Drop** — Sürükle-bırak ile yeniden düzenleme
- ✅ **Dark Mode** — Karanlık tema desteği
- ✅ **Otomatik Kaydetme** — localStorage ile persist
- ✅ **Vercel Deploy** — Production ortamı

### 🚧 Devam Eden / Planlanan

- 🚧 **Multi-CV Yönetimi** — Birden fazla CV profili
- 🚧 **PDF İçe Aktarma** — Mevcut CV'leri parse etme
- 🚧 **Şablon Özelleştirme** — Renk, font, layout ayarları
- 🚧 **Çoklu Dil Desteği** — i18n ile İngilizce/Türkçe
- 🚧 **A/B Test** — Farklı versiyonları karşılaştırma

## 🚀 Deploy (Vercel)

### Tek komutla deploy

```bash
# Vercel CLI yoksa kur
npm i -g vercel

# Deploy et
vercel
```

Vercel otomatik olarak:
- `vite build` komutunu çalıştırır
- `dist/` klasörünü CDN'e yükleer
- `/editor`, `/preview` gibi SPA route'larını doğru yönlendirir

### GitHub üzerinden deploy (tavsiye edilen)

1. Repoyu GitHub'a push et
2. [vercel.com](https://vercel.com) → "Add New Project"
3. GitHub reposunu seç
4. Framework: **Vite** (otomatik algılanır)
5. **Deploy** → hazır!

> 🔑 **Önemli:** API anahtarı kullanıcının tarayıcısında saklanır, Vercel'e
> hiçbir secret eklemen gerekmez.

## 🌐 Üretim Build Testi

```bash
# Üretim buildını yerel test et
npm run build
npm run preview
```

`http://localhost:4173` adresinde canlı ortam simüle edilir.

## 📄 Lisans

MIT
