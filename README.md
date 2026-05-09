# CTRLCV

Modern, AI destekli CV oluşturma uygulaması. React + TypeScript + Vite ile geliştirilmiştir.

## ✨ Özellikler (Hedef)

- 📝 Adım adım form editörü
- 👀 Canlı önizleme (split-view)
- 🎨 Birden fazla şablon (Modern, Classic, Minimal)
- 🤖 Claude AI ile özet/açıklama önerileri
- 📄 ATS-uyumlu PDF export
- 💾 Otomatik kaydetme (localStorage)
- 🌙 Dark mode

## 🛠️ Teknoloji Stack'i

- **Framework:** React 18 + TypeScript
- **Build:** Vite 5
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State:** Zustand (Sprint 1+)
- **Forms:** React Hook Form + Zod (Sprint 2+)
- **PDF:** react-to-print + @react-pdf/renderer (Sprint 4+)
- **AI:** Anthropic Claude API (Sprint 7+)

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
├── components/      # Yeniden kullanılabilir UI bileşenleri
│   ├── layout/      # Header, Footer, Layout shell
│   └── ui/          # Buton, Input, Card vb. atomic components
├── features/        # Özellik bazlı modüller (editor, preview, export)
├── pages/           # Sayfa bileşenleri (route-level)
├── router/          # React Router yapılandırması
├── store/           # Zustand store'lar
├── hooks/           # Custom React hook'ları
├── types/           # TypeScript tipler & Zod şemaları
├── templates/       # CV şablonları
├── lib/             # Utility fonksiyonlar (cn, format vb.)
└── utils/           # Genel yardımcı fonksiyonlar
```

## 🗺️ Yol Haritası

- [x] **Sprint 0** — Proje kurulumu & temel iskelet
- [x] **Sprint 1** — Veri modeli & state yönetimi
- [x] **Sprint 2** — Form editörü
- [x] **Sprint 3** — Canlı önizleme & şablonlar
- [x] **Sprint 4** — PDF export
- [x] **Sprint 5** — UX iyileştirmeleri
- [x] **Sprint 6** — Test & deploy
- [x] **Sprint 7** — AI destek (Claude API)

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
