export interface TourStep {
  selector: string
  title: string
  body: string
  position: 'top' | 'bottom' | 'left' | 'right'
  /** Panel içi veya fixed elemanlar için window scroll'u atla */
  noScroll?: boolean
}

export const HOME_TOUR: TourStep[] = [
  {
    selector: '[data-tour="home-logo"]',
    title: 'CTRLCV\'ye Hoş Geldin',
    body: 'Yapay zekâ destekli, ATS uyumlu CV oluşturma uygulaması. Tüm veriler yalnızca tarayıcında saklanır — hiçbir sunucuya gönderilmez.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="home-nav"]',
    title: 'Gezinme Çubuğu',
    body: 'CV\'lerim: kayıtlı CV\'lerini yönet. Editör: yeni CV oluştur veya düzenle. Önizleme: 9 şablonu incele. Şirketler: hedef şirket listeni tut.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="ai-btn"]',
    title: 'AI Asistan',
    body: 'Ücretsiz Gemini anahtarınla profil özeti yaz, deneyimi güçlendir veya tüm CV\'ni profesyonel İngilizceye çevir.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="dark-mode"]',
    title: 'Karanlık Mod',
    body: 'Gözlerin yorulduysa tek tıkla koyu temaya geç. Tercih tarayıcında kaydedilir, bir sonraki girişte hatırlanır.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="help-btn"]',
    title: 'Klavye Kısayolları',
    body: 'Tüm kısayolları buradan görüntüleyebilirsin. Hızlı erişim için Ctrl+/ (Mac\'te ⌘+/) kullanabilirsin.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="home-cta"]',
    title: 'Hemen Başla',
    body: 'Editöre geç ve ilk CV\'ni oluşturmaya başla. Örnek CV yükleyerek hızlıca şablonları görebilirsin.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="home-features"]',
    title: 'Tüm Özellikler',
    body: '9 profesyonel şablon, ATS uyumlu PDF/Word export, PDF\'ten içe aktarma, CV puanlama ve iş ilanı eşleştirme — hepsi ücretsiz.',
    position: 'top',
  },
]

export const EDITOR_TOUR: TourStep[] = [
  {
    selector: '[data-tour="editor-title"]',
    title: 'CV Başlığı',
    body: 'CV\'ne bir isim ver. Birden fazla CV\'yi takip etmek için açıklayıcı bir başlık kullan. Tüm değişiklikler otomatik kaydedilir.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="editor-toolbar"]',
    title: 'Araç Çubuğu',
    body: 'Örnek CV yükle, JSON olarak dışa/içe aktar, PDF\'ten bilgileri çek ya da CV\'yi sıfırla. PDF ve Word indirme de burada.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="editor-personal"]',
    title: 'Kişisel Bilgiler',
    body: 'Ad, unvan ve profil fotoğrafı buraya girer. Bu bölüm zorunludur — gizlenemez veya silinemez.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="editor-contact"]',
    title: 'İletişim',
    body: 'E-posta, telefon, şehir ve LinkedIn/GitHub gibi sosyal bağlantılar burada tanımlanır.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="editor-sections"]',
    title: 'CV Bölümleri',
    body: 'Deneyim, eğitim, beceriler, projeler… Başlığa tıklayarak daraltıp açabilirsin. Bölümlerin sırası da sürükleyerek değiştirilebilir.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="editor-section-toggle"]',
    title: 'Bölümü Gizle / Göster',
    body: 'Göz ikonuna tıklayarak bölümü CV\'den gizleyebilirsin. Veriler silinmez — istediğinde tekrar açabilirsin.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="editor-score"]',
    title: 'CV Puanı',
    body: 'Tamamlanma oranı ve ATS uyumu anlık hesaplanır. Yeşile yaklaştıkça CV\'in daha güçlü bir konumda.',
    position: 'left',
  },
  {
    selector: '[data-tour="editor-template"]',
    title: 'Şablon & Renk Seçimi',
    body: '9 farklı profesyonel şablon, 5 renk teması ve tipografi seçeneği. İstediğin zaman değiştirebilirsin — içerik bozulmaz.',
    position: 'left',
  },
  {
    selector: '[data-tour="editor-preview"]',
    title: 'Canlı Önizleme',
    body: 'A4 formatında gerçek zamanlı önizleme. Yazdığın her şey anında burada görünür. Birden fazla sayfa varsa kaydırabilirsin.',
    position: 'left',
  },
  {
    selector: '[data-tour="ai-btn"]',
    title: 'AI Asistan',
    body: 'Profil özeti yaz, deneyimi güçlendir, CV\'ni analiz et veya İngilizceye çevir. Ücretsiz Gemini anahtarıyla çalışır.',
    position: 'bottom',
  },
]

export const AI_TOUR: TourStep[] = [
  {
    selector: '[data-tour="ai-key"]',
    title: 'API Anahtarı',
    body: 'Google AI Studio\'dan ücretsiz Gemini anahtarı alırsın. Kredi kartı gerekmez. Anahtar yalnızca tarayıcında saklanır, hiçbir sunucuya gönderilmez.',
    position: 'left',
    noScroll: true,
  },
  {
    selector: '[data-tour="ai-model"]',
    title: 'Model Seçimi',
    body: 'Flash-Lite en hızlı ve ücretsiz seçenek. Flash daha güçlü ve kapsamlı. Pro ise en yeteneklisi ama günlük kotası düşük.',
    position: 'left',
    noScroll: true,
  },
  {
    selector: '[data-tour="ai-feat-summary"]',
    title: 'Profil Özeti Yaz',
    body: 'Deneyim ve becerilerine bakarak güçlü bir profil özeti üretir. Üretilen metni düzenleyerek CV\'ne ekleyebilirsin.',
    position: 'left',
    noScroll: true,
  },
  {
    selector: '[data-tour="ai-feat-experience"]',
    title: 'Deneyimi Yeniden Yaz',
    body: 'Mevcut iş deneyimi açıklamalarını etki odaklı, ölçülebilir bir dille güçlendirir.',
    position: 'left',
    noScroll: true,
  },
  {
    selector: '[data-tour="ai-feat-achievement"]',
    title: 'Achievement Öner',
    body: 'Pozisyonuna ve sektörüne göre CV\'ne ekleyebileceğin etki odaklı bullet maddeler önerir. Her öneri somut ve ölçülebilir.',
    position: 'left',
    noScroll: true,
  },
  {
    selector: '[data-tour="ai-feat-coverletter"]',
    title: 'Ön Yazı Oluştur',
    body: 'CV\'ne ve yapıştırdığın iş ilanına göre hedef şirkete özel bir ön yazı (cover letter) yazar. Tonu seçebilir, metni düzenleyip .txt olarak indirebilirsin.',
    position: 'left',
    noScroll: true,
  },
  {
    selector: '[data-tour="ai-feat-analysis"]',
    title: 'CV\'mi Analiz Et',
    body: 'CV\'nin güçlü ve zayıf yönlerini listeler, etki skoru verir ve somut geliştirme önerileri sunar.',
    position: 'left',
    noScroll: true,
  },
  {
    selector: '[data-tour="ai-feat-translate"]',
    title: 'İngilizceye Çevir',
    body: 'Tüm CV\'yi profesyonel İngilizceye çevirir ve yeni bir CV olarak kaydeder. Orijinal Türkçe CV\'in bozulmaz.',
    position: 'left',
    noScroll: true,
  },
]

export const JOBS_TOUR: TourStep[] = [
  {
    selector: '[data-tour="jobs-header"]',
    title: 'Şirket Bul',
    body: 'CV\'indeki pozisyon ve becerilerine göre AI, sana uygun şirketleri bulur ve her biri için uyum skoru hesaplar.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="jobs-filters"]',
    title: 'Arama Kriterleri',
    body: 'Hangi CV\'ini kullanacağını seç, konum gir ve "Şirketleri Bul"a tıkla. AI, sektör ve unvana göre eşleşen şirketleri listeler.',
    position: 'right',
  },
  {
    selector: '[data-tour="jobs-results"]',
    title: 'Şirket Kartları',
    body: 'Her kart CV\'inle eşleşme yüzdesi, açık pozisyonlar, ürün/hizmet özeti ve neden başvurman gerektiğini gösterir.',
    position: 'left',
  },
]

export const PREVIEW_TOUR: TourStep[] = [
  {
    selector: '[data-tour="preview-actions"]',
    title: 'PDF & Word İndir',
    body: 'CV\'ni tek tıkla ATS uyumlu PDF veya düzenlenebilir Word dosyası olarak indir. Editöre geri dönmek için "Düzenle" butonunu kullan.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="preview-templates"]',
    title: 'Şablon Seçimi',
    body: '9 profesyonel şablon arasında geçiş yap — CV içeriğin bozulmaz. Renk ve tipografi seçenekleri editördeki ayar panelinden değiştirilebilir.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="preview-canvas"]',
    title: 'A4 Önizleme',
    body: 'Gerçek boyutlu CV görünümü. Birden fazla sayfa varsa alt/üst oklarla gezinebilirsin.',
    position: 'top',
  },
]

export const DASHBOARD_TOUR: TourStep[] = [
  {
    selector: '[data-tour="cv-card"]',
    title: 'CV Kartın',
    body: 'Her CV\'nin adı, ünvanı, şablonu ve son güncelleme tarihi burada görünür. Aktif CV turuncu kenarlıkla belirtilir.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="cv-edit"]',
    title: 'Düzenle',
    body: 'Kişisel bilgiler, iş deneyimi, eğitim ve dil gibi tüm bölümleri editörde düzenliyorsun.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="cv-preview"]',
    title: 'Önizle',
    body: 'CV\'ni tam sayfa olarak gör. PDF veya Word dosyası olarak indirmeye buradan ulaşabilirsin.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="cv-actions"]',
    title: 'Çoğalt & Sil',
    body: 'Farklı şirketler için aynı CV\'nin kopyalarını oluşturabilir ya da kullanmadığını silebilirsin.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="new-cv-btn"]',
    title: 'Yeni CV Oluştur',
    body: 'Sıfırdan yeni bir CV başlatmak için tıkla. Editörde şablon ve renk teması seçebilirsin.',
    position: 'bottom',
  },
]
