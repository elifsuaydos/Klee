# PROJECT_MEMORY.md

> Bu dosya, Klee projesinin canlı "beyni"dir. Her yeni konuşmada bu dosya ilk olarak okunur, projeyi tekrar tekrar taramaya gerek kalmaz. Her önemli değişiklikten sonra ilgili bölüm güncellenir.

---

## 🧠 Proje Özeti

**Klee**, Ankara merkezli, dünya geneline uzaktan hizmet veren bir **web geliştirme ajansının** tanıtım sitesidir (tek sayfa, Türkçe). Site; ajansın kimliğini (TILSIM, VİZYON, TUTKU, KIVILCIM değerleri), seçilmiş projelerini ve iletişim bilgilerini sergiler. Hedef kitlesi premium dijital ürün arayan kurumsal ve girişimci müşterilerdir. Tüm görsel kimlik **dört yapraklı bir yonca logosu** (4 renk: kırmızı, sarı, mavi, yeşil) etrafında kurgulanmıştır ve hero bölümünde GSAP ile köşeleri dolaşan scroll-driven animasyon olarak sergilenir.

## 🏗️ Mimari & Teknoloji Stack

- **Framework:** Next.js **16.2.6** (App Router) — ⚠️ AGENTS.md'de altı çizildiği gibi *eğitim verisindeki Next.js değil*. API/konvansiyon değişmiş olabilir; kod yazmadan önce `node_modules/next/dist/docs/` altındaki ilgili rehber okunmalı.
- **React:** 19.2.4 (React 19)
- **Animasyon:** GSAP 3.15.0 + `@gsap/react` (useGSAP hook) + `ScrollTrigger` (pinned scroll timeline)
- **Stil:** Saf CSS (global `app/globals.css`), CSS custom properties (design tokens), Inter font (Google Fonts üzerinden)
- **Görseller:** `next/image`
- **Lint:** ESLint 9 + `eslint-config-next`
- **Build/Run:** `npm run dev | build | start | lint`
- **Dil:** JavaScript (TypeScript yok), JSX
- **Yapılandırma:** [next.config.mjs](next.config.mjs) şu an boş; [jsconfig.json](jsconfig.json) mevcut.

## 📁 Dosya Yapısı & Sorumluluklar

```
Klee-main/
├── app/
│   ├── layout.js              → RootLayout, <html lang="tr">, SEO metadata (title, description, OG)
│   ├── page.js                → Tüm landing page (Navbar, Projects, Contact, Footer) + tab/galeri state
│   ├── globals.css            → Tüm site stilleri + tasarım token'ları + responsive breakpoint'ler
│   ├── page.module.css        → Eski create-next-app artığı, ŞU AN KULLANILMIYOR (silinebilir)
│   ├── favicon.ico
│   └── components/
│       ├── KleeHeroAnimation.js  → GSAP scroll-pinned hero: yonca 4 köşeyi gezer, her köşede bir kelime (TILSIM/VİZYON/TUTKU/KIVILCIM) belirir, sonunda navbar logosuna küçülür
│       ├── ScrambleText.js       → Matrix benzeri karakter "scramble" efekti; intersection observer ile veya hoverOnly modunda
│       └── GalleryModal.js       → Tam ekran yatay snap-scroll proje galerisi (sol/sağ ok + kapat)
├── public/                    → klee-logo.svg + project-1..5.png + create-next-app default SVG'leri
├── AGENTS.md                  → ⚠️ "Bu bildiğin Next.js değil" uyarısı (CLAUDE.md de buraya yönlendiriyor)
├── CLAUDE.md                  → Sadece `@AGENTS.md` ve PROJECT_MEMORY.md(import)
├── README.md                  → Default create-next-app README (özelleştirilmemiş)
├── PROJECT_MEMORY.md          → BU DOSYA
├── package.json / package-lock.json
├── next.config.mjs            → Boş config
├── jsconfig.json
└── eslint.config.mjs
```

## 🔄 Veri Akışı

1. Kullanıcı siteye girer → [app/layout.js](app/layout.js) → [app/page.js](app/page.js) `Home` render edilir.
2. `Home` 4 bölüm render eder: `<Navbar />`, `<KleeHeroAnimation />`, `<ProjectsSection />`, `<ContactSection />`, `<Footer />`.
3. **Hero akışı** ([KleeHeroAnimation.js](app/components/KleeHeroAnimation.js)):
   - Sayfa açılışında navbar `opacity:0` ile gizlenir.
   - `useGSAP` master timeline `ScrollTrigger` ile `pin: true, scrub: 1, end: "600vh"` olarak bağlanır.
   - Yonca `scale(0.12)` ortadan büyür → sol-üst (TILSIM/kırmızı) → sağ-alt (VİZYON/yeşil) → sol-alt (TUTKU/mavi) → sağ-üst (KIVILCIM/sarı) → navbar logosuna küçülür ve oradaki gerçek SVG'ye "handoff" yapılır, navbar görünür hale gelir, final içerik (görsel + "Dijital deneyimler tasarlıyoruz." başlığı) fade-in olur.
   - Her adımda `SplitTextChars` karakterleri ayrı `<span>`'lere böler, GSAP stagger ile fade/translate yapar.
4. **Projects akışı** ([app/page.js](app/page.js#L376)):
   - `PROJECT_TABS` ("PROJE 1..5") sekmelerinden biri seçilince → 280ms fade-out → `PROJECTS_DATA[tab]` swap → fade-in.
   - Bir karta tıklanınca `galleryIndex` set edilir ve `<GalleryModal>` açılır.
   - `ScrambleText` sekme metinlerinde `hoverOnly={true}`, kart başlıklarında otomatik (intersection observer ile) çalışır.
5. **Gallery akışı** ([GalleryModal.js](app/components/GalleryModal.js)): yatay scroll-snap container, sol/sağ butonları `scrollTo` ile `clientWidth` bazlı index'i değiştirir; `initialIndex`'e 50ms gecikmeli `behavior:"instant"` kaydırma; modal açıkken `document.body.overflow = "hidden"`.
6. **Genel fade-in animasyonu:** `Home` içindeki `IntersectionObserver` tüm `.fade-in-up` elementlerine kesişme anında `.visible` ekler ([globals.css](app/globals.css) `--transition-base` ile).

## ⚙️ Kritik Konfigürasyonlar

- **API key/env yok** — proje tamamen statik, dış servis çağrısı içermiyor.
- **Tasarım token'ları** ([globals.css](app/globals.css#L6)): `--sky-blue #7C9DD2`, `--ketchup-red #D14C18`, `--olive-green #B2AB2B`, `--sunshine-yellow #F4D68C`. Renk varyasyonları, gri skala, gölge, radius, transition değişkenleri burada.
- **Container max:** 1200px. **Section padding:** 120px (mobilde 80px / 64px).
- **Yonca SVG `PETAL_PATH`** sabiti hem [KleeHeroAnimation.js](app/components/KleeHeroAnimation.js#L31) içinde hem de [page.js](app/page.js#L302) navbar SVG'sinde tekrarlanıyor — değiştirilirse her iki yerde güncellenmeli.
- **İletişim bilgileri (hard-coded):** email `hello@klee.io`, konum `Ankara, Türkiye`, WhatsApp linki `https://wa.me/` (numara yok!), telefon `tel:+90` (numara yok!).
- **next.config.mjs** boş — `images` domain config yok, ihtiyaç olursa eklenecek.

## 🚧 Mevcut Durum & Bilinen Sorunlar

**Çalışan:**
- Hero GSAP scroll animasyonu (master timeline + pin + scrub).
- Sekme bazlı proje grid'i ve fade-out/in geçişleri.
- Bento grid layout (1-2 üst sıra, 3-4-5 alt sıra; responsive olarak 1024px ve 768px'te yeniden düzenleniyor).
- Yatay snap-scroll galeri modal.
- Mobile menu (hamburger), sticky navbar, scroll'da gölge.
- ScrambleText (otomatik + hoverOnly modu).

**Bilinen sorunlar / TODO'lar:**
- ⚠️ **Proje kartlarında sadece "Luxe Commerce" başlık+desc gösteriyor** ([page.js:442](app/page.js#L442)) — diğer 4 kart başlıksız. Muhtemelen kalıntı; tüm kartlar için açılmalı veya tasarımsal olarak kasıtlıysa not düşülmeli.
- ⚠️ **Tüm 5 sekmedeki proje verisi placeholder** — gerçek müşteri projeleri yerleştirilmeli.
- ⚠️ **İletişim CTA'leri eksik:** `https://wa.me/` ve `tel:+90` numarasız.
- ⚠️ **Galeri'de klavye desteği yok** (ESC ile kapatma, ok tuşları ile gezinme).
- ⚠️ **Galeri'de proje başlığı/açıklaması gösterilmiyor**, sadece görsel.
- ⚠️ **README** hâlâ create-next-app default şablonu, Klee'ye özel değil.
- ⚠️ **page.module.css** kullanılmıyor — silinebilir.
- ⚠️ **`project.tagClass` ve `project.tag`** her data item'da var ama [page.js](app/page.js#L442) içinde sadece "Luxe Commerce" bloğunun içinde olmadığından **hiç render edilmiyor**. Ya silinmeli ya kullanılmalı.
- ⚠️ **a11y:** Modal'da focus trap yok, `aria-modal` / `role="dialog"` yok.

## 📌 Son Değişiklikler

- **[2026-05-15]** Hero animasyonu büyük revizyon ([KleeHeroAnimation.js](app/components/KleeHeroAnimation.js)):
  - Başlangıç scale `0.12` → `0.18`
  - `cornerScale` `2.8/1.8` → `7/4` (desktop/mobile) — köşede 3 yaprak ekran dışına çıkacak kadar büyük
  - Pozisyon offset çarpanları artırıldı: cX `0.28→0.42`, cY `0.22→0.40`
  - Tüm step rotation'larına `+180°` eklendi (540, 900, 1260, 1620, 1980) — her köşede tema rengi yaprağı merkeze bakar
  - Scroll mesafesi `600vh` → `1400vh`; corner travel süresi `1s` → `3s` (3× yavaş)
  - Metin animasyonları 3× ölçeklendi (duration 0.3→0.9, hold 0.5→1.5, trans 0.25→0.75)
  - Phase 0 grow (0.8s) ve handoff (1s) süreleri **değişmedi**
- **[2026-05-15]** `PROJECT_MEMORY.md` oluşturuldu.
- **Son commit `f5def84`** — "Animate hero copy and tidy layout"
- **İlk commit `841d7ce`** — "Initial commit"

## 🎯 Bir Sonraki Adımlar

Önerilen sıralama (önceliklendirilmiş):
1. **Proje verisini gerçek müşteri projeleriyle doldur** ve tüm kartlarda başlık/açıklama göster (veya kasıtlı olarak "image-only bento" tasarımı netleştir).
2. **İletişim bilgilerini gerçek değerlerle güncelle** (WhatsApp numarası, telefon).
3. **GalleryModal'a a11y + klavye desteği** ekle (ESC, ← →, focus trap, `role="dialog"`).
4. **README'yi Klee'ye özel yaz** (proje açıklaması, kurulum, geliştirme notları, Next.js 16 uyarısı).
5. **`page.module.css`** ve kullanılmayan `tagClass`/`tag` alanlarını temizle.
6. **SEO:** [layout.js](app/layout.js) metadata'sına OG image, favicon variants, `metadataBase` ekle.
7. **Performans:** Hero animasyonunu `prefers-reduced-motion` ile koşullandır.
8. **Form/CRM entegrasyonu** (opsiyonel): iletişim formu + e-posta servisi.

---

### Çalışma Kuralları (Kendime Notlar)

- Her konuşma başında bu dosyayı **oku**, projeyi buradan anla.
- Kod yazmadan önce `node_modules/next/dist/docs/` altındaki Next.js 16 rehberini kontrol et — eğitim verisi güvenilmez.
- Önemli değişiklikten sonra ilgili bölümü güncelle, "Son Değişiklikler"e `[YYYY-MM-DD]` formatında satır ekle.
- Dosyada olmayan bir şeyle karşılaşırsan: önce araştır, sonra burayı güncelle.
- Kapsamı genişletmeden gerekli olanı yap; dosya **canlı bir özet**, yapılacaklar listesi değil.
