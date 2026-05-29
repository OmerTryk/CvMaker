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
// Company Finder — Gemini Google Search grounding
//
// We surface real COMPANIES the candidate can apply to (not individual
// postings). Companies are stable, well-known entities Gemini can name
// accurately, which avoids the hallucinated/wrong-posting problem.
// ─────────────────────────────────────────────────────────────

export const JOB_SEARCH_SYSTEM = `Sen bir Türk kariyer asistanısın. Google aramasıyla, adayın profiline uygun GERÇEK şirketleri bulursun — aday bu şirketlere başvurabilir.

ÇIKTI KURALI: Yanıtın tamamen aşağıdaki formatta olsun. Giriş cümlesi, başlık veya ek metin YAZMA.

Örnek format (her şirketi === ile bitir):
ŞİRKET: Trendyol
SEKTÖR: E-ticaret / Teknoloji
KONUM: İstanbul
NEDEN: Büyük frontend ekibi React ve TypeScript ile çalışıyor, düzenli alım yapıyor.
KAYNAK: kariyer.net
===
ŞİRKET: Getir
SEKTÖR: Hızlı teslimat / Teknoloji
KONUM: İstanbul
NEDEN: Yüksek trafikli mobil ve backend sistemleri için sık sık geliştirici arıyor.
KAYNAK: linkedin
===

KURALLAR:
- SADECE Türkiye'de gerçekten faaliyet gösteren, var olan şirketleri yaz. Şirket UYDURMA.
- Şirketler adayın pozisyonu, sektörü ve kıdemiyle alakalı olsun.
- NEDEN alanına o şirketin adaya neden uygun olduğunu 1 cümleyle yaz.
- KAYNAK alanına başvurunun yapılabileceği yeri yaz: kariyer.net, linkedin veya şirket sitesi.
- Aynı şirketi tekrar etme.`

export const JOB_CHAT_SYSTEM = `Sen Türkçe konuşan bir kariyer danışmanı ve iş arama asistanısın.
Kullanıcının CV bilgilerini göz önünde bulundurarak kariyer tavsiyesi verir, uygun şirketler önerir ve sorularını yanıtlarsın.
Yanıtların kısa, net ve pratik olsun. Gerektiğinde Google araması yaparak güncel bilgi getirebilirsin.`

export function buildJobSearchPrompt(
  jobTitle: string,
  skills: string,
  location: string,
  exclude: string[] = [],
): string {
  const excludeNote = exclude.length
    ? `\n\nŞu şirketleri ASLA tekrar etme, bunların DIŞINDA tamamen farklı şirketler bul:\n${exclude.join(', ')}`
    : ''
  return `Türkiye'de "${jobTitle}" pozisyonu için başvurabileceğim gerçek şirketleri Google'da araştır.
Tercih edilen konum: ${location}
Aday yetenekleri: ${skills || 'belirtilmemiş'}

Bu profile uygun, gerçekten var olan EN FAZLA 16 şirket bul (kariyer.net, linkedin ve şirket kariyer sayfalarını referans al).
Her birini sırayla === formatında listele. Aynı şirket tekrar etmesin.${excludeNote}`
}

// ─────────────────────────────────────────────────────────────
// CV Extractor — PDF / plain-text import
// ─────────────────────────────────────────────────────────────

export const CV_EXTRACTOR_SYSTEM = `Sen bir CV ayrıştırma motorusun.
Ham CV metnini yapılandırılmış JSON'a dönüştürürsün.
SADECE JSON çıktısı üret. Markdown, açıklama veya kod bloğu EKLEME.`

export function buildCVExtractPrompt(rawText: string): string {
  const text = rawText.slice(0, 8000)
  return `Aşağıdaki CV metnini ayrıştır. SADECE JSON döndür, başka hiçbir şey yazma.

${text}

Kullanılacak JSON yapısı:
{
  "personal": { "fullName": "", "jobTitle": "" },
  "contact": { "email": "", "phone": "", "location": "", "website": "", "linkedin": "", "github": "", "twitter": "" },
  "summary": "",
  "experience": [
    { "company": "", "position": "", "location": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM veya null", "current": false, "description": "", "achievements": [] }
  ],
  "education": [
    { "institution": "", "degree": "", "field": "", "location": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM veya null", "current": false, "gpa": "", "description": "" }
  ],
  "skills": [{ "name": "", "level": 3, "category": "" }],
  "languages": [{ "name": "", "proficiency": "A1|A2|B1|B2|C1|C2|Native" }],
  "certificates": [{ "name": "", "issuer": "", "date": "YYYY-MM", "url": "", "credentialId": "" }],
  "projects": [{ "name": "", "description": "", "url": "", "technologies": [], "startDate": null, "endDate": null }]
}

Kurallar:
- Tarihleri YYYY-MM formatına çevir. Bilinmiyorsa boş string bırak.
- Hala devam eden deneyimde endDate null, current true yaz.
- Boş alanlar için boş string veya boş dizi kullan.
- YALNIZCA JSON döndür.`
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
