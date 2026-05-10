/**
 * Prompt templates for all AI features.
 *
 * All prompts are in Turkish and designed to produce clean,
 * professional CV copy with no extra commentary.
 */

import type { CVDocument, Experience } from '@/types/cv'
import { formatMonthYear } from '@/utils/date'

// Shared system prompt
export const CV_WRITER_SYSTEM = `Sen kıdemli bir Türk kariyer danışmanı ve CV yazarısın.
CV içeriğini net, özlü ve etki odaklı yazarsın.
Yanıtlarını sade Türkçe ile yazarsın. Gereksiz açıklama veya başlık eklemezsin.
Sadece istenen içeriği üretirsin.`

// ─────────────────────────────────────────────────────────────
// Summary Generator
// ─────────────────────────────────────────────────────────────

export function buildSummaryPrompt(cv: CVDocument): string {
  const expLines = cv.experience
    .slice(0, 3)
    .map((e) => `  - ${e.position} @ ${e.company} (${formatMonthYear(e.startDate)} – ${formatMonthYear(e.endDate)})`)
    .join('\n')

  const skillNames = cv.skills
    .slice(0, 8)
    .map((s) => s.name)
    .join(', ')

  const eduLines = cv.education
    .slice(0, 2)
    .map((e) => `  - ${e.degree} ${e.field}, ${e.institution}`)
    .join('\n')

  return `Aşağıdaki kişi için güçlü bir CV profil özeti yaz.

Ad: ${cv.personal.fullName || 'Belirtilmemiş'}
Hedef Pozisyon: ${cv.personal.jobTitle || 'Belirtilmemiş'}

Deneyimler:
${expLines || '  (henüz eklenmemiş)'}

Öne Çıkan Yetenekler: ${skillNames || 'belirtilmemiş'}

Eğitim:
${eduLines || '  (henüz eklenmemiş)'}

Kurallar:
- 2-3 cümle, 40-80 kelime arası
- Birinci şahıs KULLANMA ("Ben" ile başlama)
- Güçlü aksiyon ifadeleriyle başla
- Rakamsal başarı veya etki varsa dahil et
- Sadece özet metnini yaz, başka hiçbir şey ekleme`
}

// ─────────────────────────────────────────────────────────────
// Experience Rewriter
// ─────────────────────────────────────────────────────────────

export function buildExperienceRewritePrompt(exp: Experience): string {
  const current = exp.description.trim()
  const achievements = exp.achievements.filter(Boolean).join('\n  - ')

  return `Aşağıdaki CV deneyim açıklamasını profesyonel ve etki odaklı bir dille yeniden yaz.

Pozisyon: ${exp.position}
Şirket: ${exp.company}
Tarih: ${formatMonthYear(exp.startDate)} – ${formatMonthYear(exp.endDate)}

Mevcut açıklama:
${current || '(boş)'}

${achievements ? `Mevcut başarılar:\n  - ${achievements}` : ''}

Kurallar:
- 2-4 cümle, akıcı paragraf formatında
- Güçlü aksiyon fiilleriyle başla (Liderlik ettim, Geliştirdim, Tasarladım vb.)
- Ölçülebilir sonuçlar, etki ve katkıyı öne çıkar
- Teknik jargonu uygun yerlerde kullan
- Sadece yeni açıklama metnini yaz`
}

// ─────────────────────────────────────────────────────────────
// Achievement Suggester
// ─────────────────────────────────────────────────────────────

export function buildAchievementPrompt(exp: Experience, count = 4): string {
  return `Aşağıdaki pozisyon için ${count} adet güçlü başarı/sorumluluk maddesi öner.

Pozisyon: ${exp.position}
Şirket: ${exp.company}
Mevcut açıklama: ${exp.description || '(boş)'}

Kurallar:
- Her madde güçlü bir aksiyon fiiliyle başlasın
- STAR metoduna (Durum, Görev, Aksiyon, Sonuç) yakın ol
- Ölçülebilir bir sonuç veya etki içersin (%, ×, süre, adet...)
- Gerçekçi ve inandırıcı ol
- Her maddeyi "—" karakteriyle başlat, her biri yeni satırda olsun
- Sadece maddeleri yaz, başka açıklama ekleme`
}

// ─────────────────────────────────────────────────────────────
// CV Analyzer
// ─────────────────────────────────────────────────────────────

export function buildAnalysisPrompt(cv: CVDocument): string {
  const summary = {
    name: cv.personal.fullName,
    title: cv.personal.jobTitle,
    expCount: cv.experience.length,
    hasDescription: cv.summary.content.length > 0,
    skillCount: cv.skills.length,
    langCount: cv.languages.length,
    projectCount: cv.projects.length,
    certCount: cv.certificates.length,
    hasAchievements: cv.experience.some((e) => e.achievements.length > 0),
    avgAchievements:
      cv.experience.length > 0
        ? (
            cv.experience.reduce((a, e) => a + e.achievements.length, 0) /
            cv.experience.length
          ).toFixed(1)
        : 0,
  }

  return `Aşağıdaki CV verisini analiz et ve kapsamlı geri bildirim ver.

CV Özeti:
- İsim: ${summary.name || 'Belirtilmemiş'}
- Hedef Pozisyon: ${summary.title || 'Belirtilmemiş'}
- Profil özeti: ${summary.hasDescription ? 'Var' : 'YOK ⚠️'}
- Deneyim sayısı: ${summary.expCount}
- Başarı maddesi (ortalama/deneyim): ${summary.avgAchievements}
- Toplam yetenek: ${summary.skillCount}
- Dil: ${summary.langCount}
- Proje: ${summary.projectCount}
- Sertifika: ${summary.certCount}

Bu formatı kullanarak analiz yap:

**💪 Güçlü Yönler**
(2-3 madde, neden iyi olduğunu açıkla)

**⚡ İyileştirme Önerileri**
(3-4 somut öneri, nasıl daha güçlü olur)

**📊 Etki Skoru: X/10**
(kısa gerekçe)

**💡 Öncelikli İpucu**
(en önemli tek iyileştirme)`
}

// ─────────────────────────────────────────────────────────────
// Job Match Analyzer
// ─────────────────────────────────────────────────────────────

export function buildJobMatchPrompt(
  cv: CVDocument,
  jobDescription: string,
  matched: string[],
  missing: string[],
): string {
  const cvSummary = [
    `Ad: ${cv.personal.fullName || 'Belirtilmemiş'}`,
    `Hedef Pozisyon: ${cv.personal.jobTitle || 'Belirtilmemiş'}`,
    `Özet: ${cv.summary.content || '(yok)'}`,
    `Yetenekler: ${cv.skills.map((s) => s.name).join(', ') || '(yok)'}`,
    `Deneyimler:\n${cv.experience.map((e) => `  - ${e.position} @ ${e.company}: ${e.description.slice(0, 120)}`).join('\n') || '  (yok)'}`,
    `Projeler: ${cv.projects.map((p) => p.name).join(', ') || '(yok)'}`,
  ].join('\n')

  return `Aşağıdaki CV ve iş ilanını analiz et. SADECE JSON döndür, başka hiçbir şey yazma.

İŞ İLANI:
${jobDescription.slice(0, 2000)}

ADAY CV:
${cvSummary}

ÖNCEDEN TESPİT EDİLEN:
- Eşleşen anahtar kelimeler: ${matched.slice(0, 20).join(', ') || '(yok)'}
- Eksik anahtar kelimeler: ${missing.slice(0, 20).join(', ') || '(yok)'}

Aşağıdaki JSON yapısını AYNEN döndür (markdown, kod bloğu YOK):
{
  "score": <0-100 arası sayı>,
  "strengths": ["güçlü yön 1", "güçlü yön 2", "güçlü yön 3"],
  "gaps": ["eksik 1", "eksik 2", "eksik 3"],
  "suggestions": [
    {"action": "yapılacak şey", "why": "neden önemli"},
    {"action": "yapılacak şey", "why": "neden önemli"},
    {"action": "yapılacak şey", "why": "neden önemli"}
  ],
  "tailoredSummary": "Bu pozisyon için 2-3 cümlelik CV özeti"
}`
}
