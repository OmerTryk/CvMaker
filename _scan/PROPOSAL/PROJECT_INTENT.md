# PROJECT_INTENT.md
> Taslak — `/analiz` tarafından üretildi · Onay bekliyor

## Vizyon
**ctrlcv**, kullanıcıların tarayıcıda tamamen çevrimdışı çalışarak profesyonel CV'lerini oluşturmasını, AI destekli yazı geliştirme araçlarıyla güçlendirmesini ve PDF/Word formatında dışa aktarmasını sağlayan modern bir SPA'dır.

## Temel Hedefler
1. **Sıfır backend** — tüm veri localStorage'da kalır, gizlilik ön planda
2. **Çoklu şablon** — 9 farklı görsel tasarım, anında önizleme
3. **AI entegrasyonu** — kullanıcı kendi API anahtarını getirir (BYOK), Gemini & Groq destekli
4. **ATS & skor** — iş ilanıyla eşleştirme, CV tamamlanma puanı
5. **Çoklu dil desteği** — TR / EN CV çıktısı

## Kullanıcı Kitlesi
İş arayanlar; özellikle Türkçe konuşan, backend hesap gerektirmeden hızlı CV hazırlamak isteyen kullanıcılar.

## Kapsam Dışı (Yapılmayacaklar)
> **INSAN DOLDURSUN** — aşağıdaki liste taslaktır, doğrula ve ekle/çıkar.

- [ ] Sunucu tarafı kullanıcı hesapları / auth
- [ ] CV verisi bulut senkronizasyonu
- [ ] Gerçek zamanlı çoklu kullanıcı işbirliği
- [ ] Ücretli abonelik / ödeme entegrasyonu
- [ ] Mobil native uygulama (PWA dışında)

## Teknik Kısıtlar
- Vite + React 18 SPA; Node.js veya sunucu gerektirmez
- AI anahtarları localStorage'da tutulur, hiçbir zaman sunucuya gönderilmez
- PDF export `react-to-print` (tarayıcı yazdırma API) ile yapılır; puppeteer/headless kullanılmaz
