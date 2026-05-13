# PHASES.md
> `/analiz` tarafından türetildi — retrospektif faz

## PHASE-001 · Mevcut Durumu Koruma
**Durum**: 🗄 RETROSPEKTİF  
**Kapsam**: 2026-05-06 → 2026-05-13 (ilk commit'ten bugüne)  
**Tanım**: Projenin mevcut haliyle belgelenmesi. Tüm özellikler çalışıyor, test altyapısı henüz yok.

### Tamamlanan İş
- Temel UI bileşen kütüphanesi (13 primitif)
- CV veri modeli (Zod şemalar, 9 bölüm)
- 9 CV şablonu
- PDF ve Word dışa aktarma
- AI entegrasyonu (Gemini + Groq, BYOK)
- CV tamamlanma skoru + ATS skoru
- İş ilanı eşleştirme
- Çoklu CV yönetimi (DashboardPage)
- Klavye kısayolları sistemi
- Karanlık mod

### Eksikler (Sonraki Faz İçin)
- Test altyapısı (Vitest önerilir)
- E2E testler (Playwright)
- Hata sınırları (Error Boundaries)
- Erişilebilirlik (a11y) denetimi
