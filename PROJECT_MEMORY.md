# PROJECT_MEMORY.md

> Bu dosya, Klee projesinin canlı "beynidir". Her yeni konuşma başında AI ilk olarak bu dosyayı okumalı — projeyi tekrar tekrar taramak yerine buradan kavrar. **Her önemli değişiklikten sonra ilgili bölüm güncellenmelidir** (bkz. en sondaki [Çalışma Kuralları](#-çalışma-kuralları-aiya-emir)).

---

## 📑 İçindekiler

1. [Proje Özeti](#-proje-özeti)
2. [Mimari & Teknoloji Stack](#-mimari--teknoloji-stack)
3. [Dosya Yapısı & Sorumluluklar](#-dosya-yapısı--sorumluluklar)
4. [Bileşen Detayları](#-bileşen-detayları)
5. [Hero Animasyonu — Adım Adım Zaman Çizelgesi](#-hero-animasyonu--adım-adım-zaman-çizelgesi)
6. [Veri Akışı & Etkileşim Modeli](#-veri-akışı--etkileşim-modeli)
7. [Tasarım Sistemi & CSS Token'ları](#-tasarım-sistemi--css-tokenları)
8. [Responsive Strateji](#-responsive-strateji)
9. [Kritik Konfigürasyonlar & Sabit Değerler](#️-kritik-konfigürasyonlar--sabit-değerler)
10. [Mevcut Durum & Bilinen Sorunlar](#-mevcut-durum--bilinen-sorunlar)
11. [Son Değişiklikler (Changelog)](#-son-değişiklikler-changelog)
12. [Bir Sonraki Adımlar (Önceliklendirilmiş)](#-bir-sonraki-adımlar-önceliklendirilmiş)
13. [Çalışma Kuralları (AI'ya Emir)](#-çalışma-kuralları-aiya-emir)

---

## 🧠 Proje Özeti

**Klee**, Ankara merkezli, dünya geneline uzaktan hizmet veren bir **web geliştirme ajansının** tanıtım sitesidir.

- **Sayfa Tipi:** Tek sayfa (single-page) Türkçe landing.
- **Hedef Kitle:** Premium dijital ürün arayan kurumsal ve girişimci müşteriler.
- **Marka Kimliği:** Dört yapraklı yonca logosu (4 renk: **kırmızı = TILSIM**, **yeşil = VİZYON**, **mavi = TUTKU**, **sarı = KIVILCIM**).
- **Hero Anlatımı:** Yonca, GSAP ScrollTrigger ile pin'lenmiş bir bölümde 4 köşeyi sırayla dolaşır; her köşede tek renkli yaprak öne çıkıp ilgili değer kelimesi belirir. Sonunda yonca küçülerek top-bar logosuna "handoff" yapar.
- **Dil:** Tüm UI metni Türkçe (`<html lang="tr">`).

## 🏗️ Mimari & Teknoloji Stack

| Katman        | Teknoloji                                                                      | Notlar                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ----- | ----- | --- |
| Framework     | **Next.js 16.2.6** (App Router)                                                | ⚠️ Eğitim verisindeki Next.js değil. `node_modules/next/dist/docs/` altındaki rehber okunmadan kod yazılmamalı (AGENTS.md uyarısı). |
| UI            | **React 19.2.4**                                                               | Server/Client Components. Sayfanın büyük kısmı `"use client"`.                                                                      |
| Animasyon     | **GSAP 3.15.0** + `@gsap/react@2.1.2` (`useGSAP` hook) + **ScrollTrigger**     | Master timeline, `pin: true`, `scrub: 1`.                                                                                           |
| 3D (demo)     | **Three.js** (latest)                                                          | Sadece `/horizon` route'unda kullanılıyor. Starfield + nebula + dağ silüeti + bloom post-processing.                                |
| Smooth-scroll | **Lenis v1.x**                                                                 | Tüm sayfalarda aktif, `/horizon`'da pathname-aware bypass ile devre dışı.                                                           |
| Stil          | Saf CSS — `app/globals.css` (1165 satır), CSS custom properties                | Tailwind / CSS-in-JS yok. Inline style yalnızca dinamik konum/opaklık için.                                                         |
| Tipografi     | **Inter** (body) + **Outfit** (heading) — Google Fonts üzerinden `@import`     | `--font-family` ve `--font-heading` token'ları.                                                                                     |
| Görseller     | `next/image` (project kartları, galeri) + raw `<img>` (hero final card içinde) | `next.config.mjs` boş; harici domain yok.                                                                                           |
| Lint          | ESLint 9 + `eslint-config-next`                                                | `npm run lint`.                                                                                                                     |
| Dil           | **JavaScript (TypeScript YOK)**, JSX                                           | `jsconfig.json` mevcut.                                                                                                             |
| Çalıştırma    | `npm run dev                                                                   | build                                                                                                                               | start | lint` | —   |
| API/Env       | **YOK** — proje tamamen statik                                                 | Form veya 3rd-party servis çağrısı içermiyor.                                                                                       |

## 📁 Dosya Yapısı & Sorumluluklar

```
Klee-main/
├── app/
│   ├── layout.js                 → RootLayout. <html lang="tr">. SEO metadata (title/description/OG, keywords).
│   ├── page.js                   → Tüm landing page (639 satır). TopBar, MenuOverlay, ScrollProgress, ProjectsSection, ContactSection, Footer + galeri state.
│   ├── globals.css               → Tüm site stilleri + tasarım token'ları + responsive breakpoint'ler (1165 satır).
│   ├── horizon/                  → Demo route (/horizon). Three.js cosmic hero. Anasayfayı ETKİLEMEZ.
│   │   ├── page.js               → "use client", HorizonHeroSection bileşenini render eder.
│   │   └── horizon.css           → Scoped CSS (.cosmos-style parent), globals.css ile çakışmaz.
│   ├── page.module.css           → ⚠️ create-next-app artığı. ŞU AN KULLANILMIYOR (silinebilir).
│   ├── favicon.ico
│   └── components/
│       ├── KleeHeroAnimation.js  → GSAP scroll-pinned hero (638 satır). Intro screen → idle spin → 4 köşe → konvergans → top-bar handoff. CyclingWord ve SplitTextChars iç bileşenleri burada.
│       ├── Card3D.js             → 3D mouse-tilt kartı (CardContainer / CardBody / CardItem). Hero final görselinde kullanılıyor. Aceternity-UI'dan port; perspective: 1000px, transition fast (80ms) tracking + slow spring (700ms cubic-bezier) return.
│       ├── RandomLetterSwap.js   → Hover'da harf-harf rastgele sırayla yukarı/aşağı kayan text efekti. İki export: PingPong (geri döner) ve Forward (tek seferlik). GSAP ile harf bazlı staggered animasyon.
│       ├── ScrambleText.js       → Matrix benzeri karakter scramble efekti. IntersectionObserver ile otomatik veya hoverOnly. ⚠️ ŞU AN page.js'te import edilmiyor (RandomLetterSwap'a geçildi). Silinmeden önce kontrol et.
│       ├── GalleryModal.js       → ⚠️ ARTIK KULLANILMIYOR. Route tabanlı galeriye geçildi. Silinebilir.
│   ├── projects/
│   │   └── [slug]/
│   │       └── page.js           → Gerçek galeri sayfası. `use(params)` ile slug alır, `getProjectBySlug` ile proje bulur, tam sayfa galeri render eder. TopBar/ScrollProgress bu route'da yoktur. "Geri dön" → router.back().
│   ├── lib/
│   │   └── projects.js           → PROJECTS_GALLERY verisi (5 proje, her biri slug'lı) + getProjectBySlug(slug) helper.
│       ├── StoryScroll.js        → FlowArt (default) + FlowSection (named). GSAP ScrollTrigger pinned scroll — alttaki panel 30° açıyla dönerek öncekinin üstüne kayar. `prefers-reduced-motion` desteği. Tailwind'siz, saf CSS class'larıyla (`.klee-flow-art`, `.klee-flow-section`, `.klee-flow-inner`).
│       └── HoverPreview.js       → HoverPreviewProvider (context) + HoverLink + PreviewCard. Anahtar kelimelerin üstüne gelince `position:fixed` pop-up görsel kart. `PREVIEW_DATA` sabiti 6 konu içeriyor (tasarim/gelistirme/strateji/marka/animasyon/eticaret). Görsel placeholder olarak /project-*.png.
├── public/
│   ├── klee-logo.svg
│   ├── project-1.png … project-5.png
│   └── (file.svg, globe.svg, next.svg, vercel.svg, window.svg — create-next-app default artıkları)
├── AGENTS.md                     → ⚠️ "Bu bildiğin Next.js değil" uyarısı. CLAUDE.md de buraya yönlendirir.
├── CLAUDE.md                     → Sadece `@AGENTS.md` ve `@PROJECT_MEMORY.md` import eder.
├── PROJECT_MEMORY.md             → BU DOSYA (proje beyni).
├── README.md                     → ⚠️ Default create-next-app şablonu, Klee'ye özelleştirilmemiş.
├── package.json / package-lock.json
├── next.config.mjs               → Boş config (`{}`).
├── jsconfig.json                 → JS modül yolları.
└── eslint.config.mjs             → ESLint flat config (eslint-config-next).
```

## 🧩 Bileşen Detayları

### 1. `TopBar` & `MenuOverlay` ([app/page.js](app/page.js))

- ⚠️ **Eski `Navbar` bileşeni kaldırıldı.** Yerine iki yeni bileşen eklendi.
- **`TopBar`** (`position: fixed`, `z-index: 1000`): Sol tarafta hamburger + "Menu" yazısı, ortada "Klee" metni + gizli yonca SVG (`.navbar-clover-logo`), sağda boş spacer. GSAP handoff hâlâ `.navbar-clover-logo` hedefine animasyon yapar.
- **`MenuOverlay`**: Tam sayfa, brand yellow (`var(--sunshine-yellow)`) arka plan, büyük tipografik nav linkleri (01 Ana Sayfa / 02 Projeler / 03 İletişim). Numaralar + footer siyah. Kapatma: sol üstte X + Kapat butonu. ESC tuşu da kapatır. `opacity + transform` CSS geçişi (0.38s).

### 2. `KleeHeroAnimation` ([app/components/KleeHeroAnimation.js](app/components/KleeHeroAnimation.js))

- **Pinned ScrollTrigger** ile `min-height: 100vh` bölümü scroll boyunca sabitler.
- **Idle spin:** Kullanıcı henüz scroll etmediyse yonca yavaşça döner (`+=360°`, 18s loop, ease:"none"). İlk scroll'da `idleSpin.kill()`.
- **Intro screen** ([KleeHeroAnimation.js:673](app/components/KleeHeroAnimation.js#L673)): "Klee ile HAYALİNDEKİ WEBSİTENE kavuş" başlığı; scroll prompt kaldırıldı. Scroll başlayınca fade-out (0.4s).
- **İç bileşenler:**
  - `SplitTextChars` — string'i `<span class="char">` dizisine böler, her karakter ayrı animasyon hedefi olur.
  - `CyclingWord` — final başlıkta "Dijital **deneyimler, websiteler, hayaller, projeler** tasarlıyoruz." kelimesini her **2.4 saniyede** bir slide+blur ile değiştirir. Tüm kelimeler DOM'da, GSAP ile y/opacity/filter/scale animasyonu.
- **Hero-final iki sütun:** `.hero-final-overlay` içinde `<div class="hero-final-text">` (h1) + `<HeroFinalCardStack>` yan yana. Son hold `final-hold` (5 birim) ile converge ve handoff arasına eklendi. `scrollEnd`: desktop `1950vh`, mobile `1400vh`, landscape `1150vh`.

### 2b. `HeroFinalCardStack` ([app/components/HeroFinalCardStack.js](app/components/HeroFinalCardStack.js))

- **Üç yığın kart** — `STACK_IMAGES = ["/project-1.png", "/project-3.png", "/project-4.png"]`. Her kart `position: absolute` ile `.hero-stack-slot` içinde, rotasyonlu slot'larında durur (viewport-fixed değil).
- **Cursor swap:** `sectionRef` üzerindeki `mousemove` olayı 120 ms throttle ile `slotOrder` döndürür → öndeki kart değişir. `setInterval` yok; sadece cursor hareketi tetikler.
- **5 görsel, 10×6 görünmez ızgara:** `STACK_IMAGES = ["/project-1…5.png"]`. 60 hücre (10 sütun × 6 satır), her hücreye `(col*2+row)%5` formülüyle benzersiz görsel atanır — yatay/dikey komşular hiçbir zaman aynı görseli almaz.
- **Boyut:** `90×63 px` (önceki 300×210 → 180×126 → 90×63). `border-radius: 3px`.
- **5-slot fan:** SLOTS 5 karta genişledi (back=0 → front=4, dx ±30, dy ±18, rotation ±13).
- **Hücre hover = görsel önceliklendirme:** Mouse hangi hücrenin üzerindeyse o hücrenin görseli `slotOrderRef` yeniden düzenlenerek front slot'a (index 4) taşınır. `promoteImage(targetIdx)` diğer 4 görseli sırayla 0–3 slot'larına yerleştirir.
- **Görünmez grid:** `position: fixed; inset: 0; display: grid; 10 cols × 6 rows; z-index: 5`. TopBar (z-index 1000+) ve GalleryModal (9999) üstünde kalmaz.
- **Akıcı animasyon:** Cursor takibi `FOLLOW_DUR=0.07s power1.out overwrite:auto`; slot geçişi `CYCLE_DUR=0.28s expo.out`; enter `back.out(1.5) stagger 0.025s`; leave cascade `(N-1-i)*0.018 delay power2.in`.
- **Otomatik devre dışı:** `MutationObserver` `data-hero-complete="true"` flag'ini izler → grid `pointer-events: none`'a döner, kartlar fade-out olur. Hero tamamlandıktan sonra diğer section'lar (Projects, About, Contact) normal event almaya devam eder.

### 3. `Card3D` ([app/components/Card3D.js](app/components/Card3D.js))

- Aceternity-UI 3D tilt kartının saf JS'e port'lu versiyonu.
- **2 farklı transition:** mouse hareketi sırasında `0.08s linear` (anlık takip), mouse leave'de `0.7s cubic-bezier(0.23, 1, 0.32, 1)` (yumuşak yay geri dönüş).
- Hero final görseli bu kartla sarılı; `translateZ(60)` görsel + `translateZ(80)` glare layer.
- `useMouseEnter` hook'u `MouseEnterContext` üzerinden CardItem'lara durum aktarır.

### 4. `RandomLetterSwap` ([app/components/RandomLetterSwap.js](app/components/RandomLetterSwap.js))

- Hover'da harflerin yerine duplicate "ghost" harflerin slide-in olduğu efekt.
- **Mount başına shuffled order** (`shuffledRef`) — her harf rastgele sırayla canlanır.
- İki export:
  - **`RandomLetterSwapPingPong`** — mouseEnter'da animateIn, mouseLeave'de animateOut. MenuOverlay nav linklerinde ve WhatsApp CTA'da kullanılır.
  - **`RandomLetterSwapForward`** — mouseEnter'da tek seferlik döngü (mouseLeave reset etmez). Şu an page.js'te kullanılmıyor (beklemede).
- Erişilebilirlik: gerçek metin görsel olarak gizli (`clip: rect(0,0,0,0)`) bir span'a yazılır, görünür harfler `aria-hidden`.

### 5a. `ScrollProgress` ([app/page.js](app/page.js))

- Sağ alt köşede `position: fixed` yatay track + "aşağı kaydır" etiketi.
- `window.scrollY / (docHeight - innerHeight)` oranı ile `width %` doldurulur.
- Arka plan yok; track ince gri, bar `var(--gray-900)`.
- Hero tamamlanınca `body[data-hero-complete="true"]` ile fade-out.

### 5. `GalleryModal` ([app/components/GalleryModal.js](app/components/GalleryModal.js))

- ⚠️ **Tamamen yeniden tasarlandı** — artık gerçek immersive tam ekran galeri.
- **Ana alan:** `flex: 1` ile tam ekran yatay snap-scroll (`.gallery-immersive-slide`, `objectFit: cover`).
- **Alt sol:** `← Geri dön` butonu (`onClose` tetikler).
- **Alt sağ:** `Proje bilgisi` butonu (liste ikonu ile). Tıklanınca sağdan panel açılır.
- **Alt orta:** Küçük thumbnail şeridi — aktif thumbnail seçili (beyaz border, scale). Tıklanınca o slide'a scroll.
- **Sağ panel:** `.gallery-info-panel` — `position: absolute`, `transform: translateX(100%)` → `translateX(0)` geçiş (0.42s). Açık arka plan (#fafaf9), koyu tipografi. Proje Başlığı / Hizmetler / Ekip / Açıklama. Sol üstte 36×36 kare X butonu.
- `currentIndex` state'i scroll eventi ile senkronize (scroll listener).
- ESC / ← → klavye desteği eklendi.

### 6. `HorizonHeroSection` ([app/components/HorizonHeroSection.jsx](app/components/HorizonHeroSection.jsx))

- Three.js + GSAP tabanlı tam ekran cosmic hero. Sadece `/horizon` route'unda kullanılıyor (demo/test).
- **Three.js scene:** 3×5000 yıldız (ShaderMaterial, paralaks rotasyon), shader nebula (PlaneGeometry), 4 katman dağ silüeti (ShapeGeometry), atmosfer küresi (BackSide sphere). Bloom post-processing (UnrealBloomPass, strength:0.8).
- **Scroll kamera:** `window.scroll` listener ile `targetCameraX/Y/Z` set edilir, `animate()` döngüsü 0.05 smoothing ile takip eder. 3 pozisyon: HORIZON (z:300) → COSMOS (z:-50) → INFINITY (z:-700).
- **GSAP intro:** `isReady` state'i Three.js init sonrasında `true` olur → menü/başlık/altyazı/scroll-progress animate-in.
- **Bug fixes (orijinal koddan):** `splitTitle()` çağrısı eksikti → düzeltildi; `titleRef`/`subtitleRef` birden fazla elemana atanıyordu → scroll-section'lardan ref kaldırıldı.
- **LenisProvider bypass:** `/horizon`'da Lenis devre dışı (native scroll gerekli). [LenisProvider.js](app/components/LenisProvider.js) `usePathname` ile kontrol eder.
- **CSS:** `app/horizon/horizon.css` — tüm class'lar `.cosmos-style` parent altında scoped, globals.css ile çakışma yok.

### 7. `ScrambleText` ([app/components/ScrambleText.js](app/components/ScrambleText.js))

- ⚠️ **Şu an page.js'te kullanılmıyor.** Önceki sürümde sekme ve kart başlıklarında vardı, `RandomLetterSwap`'a geçildikten sonra import kaldırıldı. Component dosyası duruyor; gelecekte ihtiyaç olursa kullanılabilir veya silinebilir.

## 🎬 Hero Animasyonu — Adım Adım Zaman Çizelgesi

ScrollTrigger ayarı: `pin: true`, `scrub: 1`, `anticipatePin: 1`, `invalidateOnRefresh: true`. **Toplam scroll mesafesi:**

- Desktop: `1550vh`
- Mobile (`<768px`): `1100vh`
- Landscape (`width > height && height < 500px`): `900vh`

| Faz    | Etiket          | Ne olur?                                                                                                                         | Süre (timeline)                  |
| ------ | --------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| 0      | `grow`          | Intro state → tam opaklık, center scale (desktop 2.8 / mobile 1.8 / landscape 1.2).                                              | 0.8s                             |
| 1      | `step1`         | Yonca **sol-üst** köşeye, rotation 540°. **TILSIM** kelimesi (kırmızı tema) sol-üstte belirir; desc sağ-altta.                   | 3s travel + 1.2s metin gecikmesi |
| 1-hold | `step1-hold`    | 1.5s bekle. **Sarı/mavi/yeşil yapraklar** opaklık 0'a fade (0.35s) → 1.15s sonra 0.92'ye geri döner. Tek kırmızı yaprak görünür. | 1.5s                             |
| ...    | `trans1`        | TILSIM karakterleri ve desc yukarı kayıp kaybolur (0.75s).                                                                       | —                                |
| 2      | `step2`         | Yonca **sağ-alt** köşeye, rotation 900°. **VİZYON** (yeşil tema) sağ-altta; desc sol-altta. Hold'da kırmızı/sarı/mavi fade.      | 3s + 1.5s hold                   |
| 3      | `step3`         | Yonca **sol-alt** köşeye, rotation 1260°. **TUTKU** (mavi tema) sol-altta; desc sağ-altta. Hold'da kırmızı/sarı/yeşil fade.      | 3s + 1.5s hold                   |
| 4      | `step4`         | Yonca **sağ-üst** köşeye, rotation 1620°. **KIVILCIM** (sarı tema) sağ-üstte; desc sol-altta. Hold'da kırmızı/mavi/yeşil fade.   | 3s + 1.5s hold                   |
| 5      | `converge`      | Yonca top-bar logo pozisyonuna küçülür (scale `32/280 ≈ 0.114`, rotation 1980°).                                                 | 2.5s                             |
| 5-end  | `converge+=1.8` | Hero final content (3D tilt card + "Dijital ... tasarlıyoruz" başlık) fade-in.                                                   | 0.4s                             |
| 6      | `handoff`       | Hero clover opacity 0, top-bar logo opacity 1, top-bar opacity 1 + pointerEvents auto.                                            | 0.05–0.1s                        |

### Animasyon Sabitleri ([KleeHeroAnimation.js:175-233](app/components/KleeHeroAnimation.js#L175))

```js
isMobile()    = section.clientWidth < 768
isLandscape() = section.clientWidth > section.clientHeight && section.clientHeight < 500

introScale  = landscape:1.0  | mobile:1.3  | desktop:1.86
centerScale = landscape:1.2  | mobile:1.8  | desktop:2.8
cornerScale = landscape:2.5  | mobile:3.5  | desktop:6     // köşede tek yaprak ekrandan büyük taşar
cX mult     = landscape:0.38 | mobile:0.40 | desktop:0.50
cY mult     = landscape:0.36 | mobile:0.42 | desktop:0.48
```

### Petal Renk-Pozisyon Eşlemesi

Yonca SVG'de 4 yaprak ref'lenmiş: `redPetalRef` / `yellowPetalRef` / `bluePetalRef` / `greenPetalRef`. Her köşe hold'unda **o köşenin tema rengi DIŞINDAKİ 3 yaprak** fade-out olur → 1.15s sonra geri gelir. Rotation değerleri (540, 900, 1260, 1620, 1980) tema yaprağının her köşede merkeze bakacak şekilde +180° offset ile ayarlanmıştır.

## 🔄 Veri Akışı & Etkileşim Modeli

1. **Sayfa açılışı:** [layout.js](app/layout.js) → `<html lang="tr">` → `<body>` → [page.js](app/page.js) `Home`.
2. `Home` üstte `TopBar`, `MenuOverlay`, `ScrollProgress` render eder; `<main>` içinde şu sırayla: `<KleeHeroAnimation />` → `<ProjectsSection />` → `<StoryBridgeOne />` (TILSIM+VİZYON) → `<AboutSection />` → `<StoryBridgeTwo />` (TUTKU+KIVILCIM) → `<ContactSection />`, en altta `<Footer />`.
3. `Home` içinde **global IntersectionObserver** kurulur; `.fade-in-up` class'lı tüm elementlere intersection anında `.visible` ekler ([page.js:529](app/page.js#L529)).
4. **Hero:** Yukarıdaki zaman çizelgesi.
5. **Projects:** `PROJECTS_GALLERY` ile `<ImageGallery>` hover-expand galerisi. Hover'da kart `flex-grow:4` ile genişler — tüm kartlar her durumda aynı davranır (aktif gösterge yok). Foto `object-fit: contain` ile kırpılmadan görünür. Tıklayınca `<GalleryModal>` o projenin 5 fotosuyla (`images[]`) açılır.
6. **Project card click:** `galleryIndex` set + `galleryOpen = true` → `<GalleryModal>` açılır (tıklanan kartın verisiyle).
7. **Gallery:** Yatay snap-scroll, ok butonları ile gezinme. `document.body.overflow = "hidden"`.
8. **Contact:** Statik kartlar (email, telefon, konum) + WhatsApp CTA (`https://wa.me/`, **numarasız**).
9. **Footer:** Brand + 3 link (Whatsapp/Gmail/Phone) + copyright.

## 🎨 Tasarım Sistemi & CSS Token'ları

[globals.css](app/globals.css) ilk 63 satırı (`:root`):

| Token                                         | Değer                                          | Kullanım                                        |
| --------------------------------------------- | ---------------------------------------------- | ----------------------------------------------- |
| `--sky-blue`                                  | `#7C9DD2`                                      | TUTKU teması, navbar mavi yaprak                |
| `--ketchup-red`                               | `#D14C18`                                      | TILSIM teması, navbar kırmızı yaprak            |
| `--olive-green`                               | `#B2AB2B`                                      | VİZYON teması, navbar yeşil yaprak, ::selection |
| `--sunshine-yellow`                           | `#F4D68C`                                      | KIVILCIM teması, navbar sarı yaprak             |
| (her birinin `-light` / `-dark` varyantı var) |                                                |                                                 |
| `--gray-50 … --gray-900`                      | Slate tonları                                  | Metin, çerçeve, ikincil yüzeyler                |
| `--font-family`                               | `Inter`                                        | Body                                            |
| `--font-heading`                              | `Outfit`                                       | Başlıklar, hero keyword, navbar-brand           |
| `--font-display`                              | `Cormorant Garamond` (italic)                  | Hero intro yazısı (sol-alt)                     |
| `--container-max`                             | `1200px`                                       | `.container`                                    |
| `--section-padding`                           | `120px 0` (mobilde 80px / landscape kompakt)   |                                                 |
| `--shadow-sm/md/lg/xl`                        | Slate-bazlı alpha gölgeler                     |                                                 |
| `--transition-fast/base/slow`                 | `0.2s / 0.3s / 0.5s` cubic-bezier(0.4,0,0.2,1) |                                                 |
| `--radius-sm…2xl`                             | `8px / 12px / 16px / 20px / 24px`              |                                                 |

**Film grain overlay:** `body::after` üzerinde SVG fractalNoise (opacity 0.028), `grain` keyframe ile her 0.4s konum değişir. Tüm sayfada hafif dokulu his verir.

## 📐 Responsive Strateji

- **Tek ana breakpoint:** `767px` (`@media (max-width: 767px)`).
- **Özel landscape mod:** `@media (max-height: 500px) and (orientation: landscape)` — yatay tutulmuş telefon/küçük tablet için.
- Tipografi `clamp(min, vw/vh, max)` ile fluid.
- Hero animasyonunda JS tarafı da `isMobile()` / `isLandscape()` kontrol eder; CSS ile JS aynı eşik değerini kullanır.
- Projects image-gallery — desktop'ta tek sıra `display:flex` hover-expand (5 eşit kart, hover'da `flex-grow:4`); mobil (<768px)'de tek kolon dikey stack (`aspect-ratio: 4/3`).
- Hero final content: desktop'ta yatay (image + text yan yana), mobilde dikey (image üstte 32vh, text altta), landscape'te tekrar yatay ama kompakt.

## ⚙️ Kritik Konfigürasyonlar & Sabit Değerler

| Yer                                                                | Sabit           | Değer / Not                                                                                                                                                |
| ------------------------------------------------------------------ | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [KleeHeroAnimation.js:32](app/components/KleeHeroAnimation.js#L32) | `PETAL_PATH`    | Tek yaprak SVG path string'i. **Hem hero clover'da hem top-bar SVG'de** ([page.js:110](app/page.js#L110)) tekrarlanır — değişirse iki yer de güncellenmeli. |
| [KleeHeroAnimation.js:39](app/components/KleeHeroAnimation.js#L39) | `CYCLE_WORDS`   | `["deneyimler", "websiteleri", "hayalleri", "projeleri"]` — final başlıkta dönen kelimeler.                                                                |
| [page.js:13](app/page.js#L13)                                      | `PROJECTS_GALLERY` | 5 proje. **Hepsi placeholder.**                                                                                                                           |
| [page.js:455](app/page.js#L455)                                    | Telefon         | `+90 00000000` (placeholder, gerçek numara yok).                                                                                                           |
| [page.js:445](app/page.js#L445)                                    | Email           | `hello@klee.io`.                                                                                                                                           |
| [page.js:474](app/page.js#L474)                                    | WhatsApp        | `https://wa.me/` (numarasız!).                                                                                                                             |
| [page.js:511](app/page.js#L511)                                    | Footer phone    | `tel:+90` (numarasız!).                                                                                                                                    |
| [page.js:465](app/page.js#L465)                                    | Konum           | `Ankara, Türkiye` (dünya genelinde uzaktan).                                                                                                               |
| [next.config.mjs](next.config.mjs)                                 | —               | Boş — `images.domains` ihtiyaç olursa eklenir.                                                                                                             |
| [layout.js:3](app/layout.js#L3)                                    | `metadata`      | Title/desc/keywords/OG var ama: **`metadataBase` YOK, OG image YOK, favicon variants YOK**.                                                                |

## 🚧 Mevcut Durum & Bilinen Sorunlar

### ✅ Çalışan

- Hero GSAP scroll animasyonu (master timeline + pin + scrub + idle spin + handoff).
- Intro screen tagline (scroll prompt kaldırıldı).
- CyclingWord (4 kelime, slide + blur).
- 3D tilt card (CardContainer) hero final görselinde.
- RandomLetterSwapPingPong: MenuOverlay nav linkleri, WhatsApp CTA.
- RandomLetterSwapForward: şu an kullanılmıyor.
- Accordion galeri (hover expand).
- Accordion layout (desktop hover, mobile yatay scroll).
- Yatay snap-scroll galeri modal + scroll lock.
- TopBar + tam ekran MenuOverlay.
- ScrollProgress yatay track + "aşağı kaydır" etiketi.
- Film grain overlay, ::selection highlight.

### ⚠️ Bilinen Sorunlar / TODO'lar

| #   | Sorun                                                                 | Yer                                                                  | Öncelik                  |
| --- | ---------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------ |
| 1   | Proje verisi placeholder (5 kart).                                      | [page.js:13](app/page.js#L13)                                        | Yüksek                   |
| 2   | İletişim CTA'leri eksik: `https://wa.me/` ve `tel:+90` numarasız.       | [page.js:474](app/page.js#L474), [page.js:511](app/page.js#L511)     | Yüksek                   |
| 3   | Telefon görüntüsü `+90 00000000` placeholder.                           | [page.js:455](app/page.js#L455)                                      | Yüksek                   |
| 4   | Galeri'de focus trap yok.                                               | [GalleryModal.js](app/components/GalleryModal.js#L104)               | Düşük                    |
| 5   | Galeri'de proje bilgisi placeholder veri kullanıyor; gerçek veri `images` prop'undan geliyor. | [GalleryModal.js](app/components/GalleryModal.js#L94) | Orta                     |
| 6   | `project.tagClass` kullanılmıyor.                                       | [page.js:17](app/page.js#L17)                                        | Düşük (sil ya da kullan) |
| 7   | README hâlâ create-next-app default şablonu.                             | [README.md](README.md)                                               | Düşük                    |
| 8   | `page.module.css` kullanılmıyor — silinebilir.                           | [app/page.module.css](app/page.module.css)                           | Düşük                    |
| 9   | `ScrambleText.js` artık import edilmiyor — silinebilir veya gelecek için tutulabilir. | [app/components/ScrambleText.js](app/components/ScrambleText.js) | Düşük                    |
| 10  | `public/` içinde `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` — create-next-app artığı. | [public/](public/) | Düşük                    |
| 11  | Hero animasyonu `prefers-reduced-motion` ile koşullanmıyor.              | [KleeHeroAnimation.js](app/components/KleeHeroAnimation.js)          | Orta (a11y)              |
| 12  | SEO eksik: `metadataBase`, OG image, twitter card, favicon variants.     | [layout.js](app/layout.js)                                           | Orta                     |
| 13  | Idle spin sırasında scroll çok hızlı başlarsa kill timing'i bazen geç algılanabilir. | [KleeHeroAnimation.js:249](app/components/KleeHeroAnimation.js#L249) | Düşük                    |
| 14  | Hero final raw `<img>` kullanıyor (next/image değil) — LCP optimize edilmiyor. | [KleeHeroAnimation.js:608](app/components/KleeHeroAnimation.js#L608) | Düşük                    |

## 📌 Son Değişiklikler (Changelog)

> Tarihler **2026** yılındadır (proje takvimi). Her commit/değişiklik buraya eklenecek — AI her yaptığı değişiklikten sonra ilgili bölümle birlikte bu listeyi de günceller.

- **[2026-05-18] Galeri: overlay → gerçek Next.js route (`/projects/[slug]`) + 5 hata düzeltmesi**
  - **YENİ `app/lib/projects.js`:** `PROJECTS_GALLERY` verisi ve `getProjectBySlug(slug)` helper'ı buraya taşındı. Her projeye `slug` alanı eklendi (`luxe-commerce`, `fittrack`, `evora`, `datapulse`, `tastehub`).
  - **YENİ `app/projects/[slug]/page.js`:** Tam sayfa galeri. `use(params)` ile slug alınır (Next.js 16 Promise params). Proje bulunamazsa `notFound()`. `useRouter().back()` ile "Geri dön". TopBar/ScrollProgress burada yok — `Home` bileşenine özgü, bu route render etmez.
  - **`app/page.js`:** `PROJECTS_GALLERY` const kaldırıldı → `./lib/projects`'ten import. `GalleryModal` import + render kaldırıldı. `galleryOpen`/`galleryProjectIndex` state kaldırıldı. `handleItemClick` → `router.push('/projects/${slug}')`. `useRouter` import eklendi.
  - **`app/components/LenisProvider.js`:** `/projects` prefix'li sayfalarda Lenis bypass.
  - **`app/globals.css`:** `.gallery-immersive-page` (page-level wrapper, `position: relative; min-height: 100vh`). `.gallery-thumbnail` `transition: none` (thumbnail glitch düzeltmesi). `.gallery-arrow` arka plan/border/radius kaldırıldı, SVG-only 28px, hover sadece renk+translate. `.gallery-info-panel-close` `z-index: 2; pointer-events: auto` eklendi. `body[data-gallery-open]` kuralı kaldırıldı.
  - **`app/components/GalleryModal.js`:** Artık kullanılmıyor (silinebilir — dosya yerinde duruyor).
  - Dosyalar: [app/lib/projects.js](app/lib/projects.js), [app/projects/[slug]/page.js](app/projects/[slug]/page.js), [app/page.js](app/page.js), [app/components/LenisProvider.js](app/components/LenisProvider.js), [app/globals.css](app/globals.css).

- **[2026-05-18] GalleryModal: scroll kaldırıldı, tek frame görünümü + ok butonları + scroll-progress gizleme**
  - `GalleryModal.js` tamamen yeniden yazıldı. Yatay snap-scroll (`overflow-x: auto`, `scroll-snap-type`) kaldırıldı. Yerine `.gallery-immersive-stage` + `.gallery-immersive-frame` yapısı: tüm görseller `position: absolute; inset: 0` üst üste, aktif olan `opacity: 1` (0.35s fade), diğerleri `opacity: 0`. `scrollContainerRef` ve scroll event listener kaldırıldı; navigasyon artık sadece `setCurrentIndex` ile.
  - Prev/Next ok butonları eklendi (`.gallery-arrow--prev` / `--next`): `position: absolute; top: 50%`; yarı saydam yuvarlak zemin; hover'da beyazlaşır; ilk/son görselde ilgili ok gizlenir.
  - `document.body.dataset.galleryOpen = "true"` — modal açılınca set, kapanınca silinir. CSS `body[data-gallery-open="true"] .scroll-progress-indicator { opacity: 0 !important }` ile "aşağı kaydır" indikatörü gizlenir.
  - Thumbnail tıklaması artık doğrudan `goTo(idx)` çağırır (eski `scrollToIndex` kaldırıldı).
  - Dosyalar: [app/components/GalleryModal.js](app/components/GalleryModal.js), [app/globals.css](app/globals.css).

- **[2026-05-18] Projeler bölümüne 5 saniyelik dwell (pin) eklendi**
  - `ProjectsSection`'a GSAP ScrollTrigger pin eklendi: `start:"top top"`, `end:"+=500"`, `pin:true`, `pinSpacing:true`. Bölüm viewport'a girdiğinde 500px scroll boyunca sabit kalır (~5 sn normal scroll hızında). `page.js` üst kısmına `gsap`, `ScrollTrigger`, `useGSAP` import'ları ve `gsap.registerPlugin(ScrollTrigger)` eklendi. Dosya: [app/page.js](app/page.js).

- **[2026-05-18] Tipografi & İletişim Renk Aksan Paketi**
  - **`.projects-title` ve `.contact-header-title` Cormorant'a geçti:** `font-family: var(--font-heading)` → `var(--font-display)` (Cormorant Garamond). Font-size `clamp(2rem, 4vw, 3rem)` → `clamp(2.2rem, 4.5vw, 3.4rem)`, weight `800→700`. Mobil override `1.75rem→1.9rem`. Dosya: [app/globals.css](app/globals.css).
  - **Story panel başlıkları küçültüldü:** `.story-panel-heading` `clamp(3.5rem, 11vw, 13rem)` → `clamp(2.4rem, 6.5vw, 7.5rem)`. Mobil `clamp(2.8rem, 16vw, 6rem)` → `clamp(2rem, 10vw, 4rem)`. Dosya: [app/globals.css](app/globals.css).
  - **Panel 2 (mavi) ve Panel 3 (kırmızı) sağ metin eklendi:** Panel 2'ye "Kod satırlarının arasında büyüyen hayaller..." ve Panel 3'e "Ankara'dan dünyaya uzanan bağlantılarla..." `.story-panel-body-right` ile eklendi. Dosya: [app/page.js](app/page.js#L426).
  - **Contact item marka rengi sol çizgi:** Her item'a modifier class eklendi — `--email` (olive-green), `--phone` (sky-blue), `--location` (ketchup-red), `--github` (sunshine-yellow). `border-left: 2px solid` + `padding-left: 14px`. Hover'da icon da aynı rengi alır. Dosyalar: [app/page.js](app/page.js#L554), [app/globals.css](app/globals.css).

- **[2026-05-17] 3 düzeltme: CardStack sadece final bölümde + cursor hizalama + converge navbar dwell fix**
  - **CardStack yalnızca final bölümde:** `finalContentRef.current.style.opacity` onUpdate'te izlenir; opacity > 0.05 olduğunda `document.body.dataset.heroFinal = "true"` set edilir. `HeroFinalCardStack`'te grid artık `pointer-events: none` ile başlar; `MutationObserver` `data-hero-final` + `data-hero-complete` izler → sadece `heroFinal === true && !heroComplete` durumunda grid aktif olur. Dosyalar: [app/components/KleeHeroAnimation.js](app/components/KleeHeroAnimation.js), [app/components/HeroFinalCardStack.js](app/components/HeroFinalCardStack.js).
  - **Cursor hizalaması:** Kart imajının sol-üst köşesi cursor ucuna hizalandı. `moveToPos`: `left: cx, top: cy` (önceki `cx - IMG_W/2, cy - IMG_H/2`). Dosya: [app/components/HeroFinalCardStack.js](app/components/HeroFinalCardStack.js).
  - **Converge navbar dwell fix:** Converge süresi 2s expo.out (scrub:1 için yeterli). `converge+=2` anında: hero clover opacity:0, navLogoNode opacity:1, topBar opacity:1 → navbar tam görünür olarak clover ile birlikte. `converge+=2.2`: finalContent fade-in. Final-hold: 14 birim (topBar + clover logo + final content hepsi görünür). Handoff artık sadece `pointerEvents: auto` set eder (diğer swap'lar converge'de tamamlandı). Dosya: [app/components/KleeHeroAnimation.js](app/components/KleeHeroAnimation.js).

- **[2026-05-17] 3 düzeltme: HeroFinalCardStack scroll-back fix + converge hızlandırma + GitHub iletişim**
  - **HeroFinalCardStack scroll-back fix:** `MutationObserver` artık hero-complete flag silindiğinde (`heroComplete !== "true"`) grid'i `pointer-events: auto`'ya geri alır. Önceden ileri-geri scroll'da grid `pointer-events: none` kalıyordu ve animasyon bozuluyordu. Dosya: [app/components/HeroFinalCardStack.js](app/components/HeroFinalCardStack.js).
  - **Converge hızlandırma:** Clover navbar'a `0.5s expo.out` ile snap (önceki 2.5s power2.inOut). Glow/tint fade `0.4s`. kleeText slide `converge+=0.1s`. finalContent fade-in `converge+=0.3s` (önceki +=1.8s). `final-hold` `5 → 14` birim; `scrollEnd` desktop `1950 → 2500vh`, mobile `1400 → 1850vh`, landscape `1150 → 1500vh`. Dosya: [app/components/KleeHeroAnimation.js](app/components/KleeHeroAnimation.js).
  - **GitHub iletişim & footer:** `GitHubIcon` (filled GitHub mark SVG) eklendi. Contact section'a 4. kart (GitHub / github.com/klee-agency, tıklanabilir link). Footer'a "GitHub" linki eklendi. `.contact-info-link` hover CSS kuralı eklendi. Dosyalar: [app/page.js](app/page.js), [app/globals.css](app/globals.css).

- **[2026-05-17] HeroFinalCardStack: 10×6 görünmez ızgara + hücre bazlı görsel önceliklendirme + 90×63 px mini kartlar**
  - Kart boyutu `300×210 → 90×63 px` (iki adımda küçültüldü).
  - Yeni invisible grid: `position:fixed; inset:0; display:grid; 10cols×6rows; z-index:5`. Her hücreye `(col*2+row)%5` ile komşusundan farklı görsel atanır.
  - Mouse hangi hücreye girerse o görseli `promoteImage()` ile front slot'a taşır; GSAP `expo.out 0.28s` ile yumuşak yeniden sıralama.
  - Grid eventleri (`mouseenter/move/leave` container-level) show/hide'ı yönetir; hücre `mouseenter` → görsel değiştirme.
  - `MutationObserver` `data-hero-complete` flag'ini izler → hero bitince grid devre dışı kalır.
  - Eski `setInterval` döngüsü kaldırıldı; tetikleyici artık yalnızca hücre geçişleri.
  - Dosya: [app/components/HeroFinalCardStack.js](app/components/HeroFinalCardStack.js).

- **[2026-05-17] HeroFinalCardStack: 5 görsel, küçük kartlar, hızlı & akıcı animasyon**
  - `STACK_IMAGES` 3→5 görsel (`project-1…5.png`). 5 slot eklendi, back→front fan şekli korundu.
  - Kart boyutu `300×210 → 180×126 px`; `border-radius: 4px`.
  - Otomatik döngü `700ms → 420ms`; mousemove throttle `120ms → 80ms`. Her move-cycle sonunda interval sıfırlanır (çift tetik yok).
  - Cursor takibi `gsap.to duration:0.08s power1.out overwrite:"auto"` (önceki anlık gsap.set'in yerini aldı).
  - Slot geçişi `expo.out 0.35s`; enter `back.out(1.4) + y:10→0 stagger 0.03s`; leave cascade `(N-1-i)*0.02 delay power2.in`.
  - Dosya: [app/components/HeroFinalCardStack.js](app/components/HeroFinalCardStack.js).

- **[2026-05-17] Hero-final: üç kart yığını + uzatılmış hold + cursor swap**
  - **YENİ `HeroFinalCardStack.js`:** Hero-final "Dijital…tasarlıyoruz." bölümünde 3 görsel kart yığını. Kartlar `position: absolute` ile `.hero-stack-slot` içinde durur (viewport-fixed değil). `mousemove` (120 ms throttle) her harekette `slotOrder` döndürür → öndeki kart değişir. Paralaks: `gsap.quickTo` ile yığın ±16/10 px kayar. Dosya: [app/components/HeroFinalCardStack.js](app/components/HeroFinalCardStack.js).
  - **`AboutCursorTrail` hero'ya taşındı:** `page.js` AboutSection'dan `<AboutCursorTrail>` kaldırıldı. Artık kullanılmıyor (dosya duruyor). Dosya: [app/page.js](app/page.js).
  - **Hero-final hold uzatıldı:** `master.to({}, { duration: 5 }, "final-hold")` tweeni converge ile handoff arasına eklendi. `scrollEnd` değerleri: desktop `1550→1950vh`, mobile `1100→1400vh`, landscape `900→1150vh`. Dosya: [app/components/KleeHeroAnimation.js](app/components/KleeHeroAnimation.js).
  - **Hero-final iki sütun layout:** `.hero-final-overlay` artık `flex` + gap + iki çocuk: `.hero-final-text` (h1) ve `.hero-stack-slot` (kartlar). Mobile'da `flex-direction: column`. Dosya: [app/globals.css](app/globals.css).

- **[2026-05-17] Story scroll köprüleri + hover-preview Hakkımızda**
  - **YENİ `StoryScroll.js`:** `FlowArt` (default) + `FlowSection` (named export). GSAP `ScrollTrigger` ile pinned scroll — her panel bir öncekini pinler, sonraki 30° açıyla gelip düzleşir (`pinSpacing: false`, `scrub: true`). `prefers-reduced-motion` desteği (`useEffect` + `matchMedia`). Saf CSS class'ları; Tailwind yok. Dosya: [app/components/StoryScroll.js](app/components/StoryScroll.js).
  - **YENİ `HoverPreview.js`:** `HoverPreviewProvider` (React context) + `HoverLink` + `PreviewCard`. Anahtar kelimeler üzerine gelince `position:fixed` koyu pop-up kart belirir; viewport sınır kontrolü (sol/sağ/üst taşmaz). `PREVIEW_DATA` sabiti 6 konu içeriyor — görseller şimdilik `/project-*.png`. Tüm stiller `globals.css`'te. Dosya: [app/components/HoverPreview.js](app/components/HoverPreview.js).
  - **`AboutSection` yeniden yazıldı ([page.js:390](app/page.js#L390)):** SVG arka plan kaldırıldı; krem zemin (`#fafaf8`). 4 paragraf Türkçe ajans tanıtım metni. 6 kelime `<HoverLink>` ile sarılı (tasarim, gelistirme, strateji, animasyon, marka, eticaret). `HoverPreviewProvider` ile sarmalandı.
  - **YENİ `StoryBridgeOne` ([page.js](app/page.js)):** 2 panel — TILSIM (kırmızı `var(--ketchup-red)`, "#fff") ve VİZYON (koyu yeşil `#2d3a1e`, krem). Projeler ile Hakkımızda arasında.
  - **YENİ `StoryBridgeTwo` ([page.js](app/page.js)):** 2 panel — TUTKU (mavi `var(--sky-blue)`, koyu lacivert) ve KIVILCIM (sarı `var(--sunshine-yellow)`, koyu amber). Hakkımızda ile İletişim arasında.
  - **`<main>` sıralaması güncellendi:** Hero → Projects → StoryBridgeOne → About → StoryBridgeTwo → Contact → Footer.
  - **`globals.css` yeni bloklar:** `.klee-flow-art`, `.klee-flow-section`, `.klee-flow-inner`, `.story-panel-*`, `.klee-hover-link`, `.klee-preview-card`, `.klee-preview-card-inner`, `.about-*` (lead, paragraphs, paragraph). Toplam ~200 satır eklendi. Dosya: [app/globals.css](app/globals.css).
  - **`page.js` import satırları:** `FlowArt`, `FlowSection`, `HoverPreviewProvider`, `HoverLink` eklendi ([page.js:5-8](app/page.js#L5)).

- **[2026-05-16] Menü ş̧erit / Intro yatay / Scroll bar dolum / Theme scope / Galeri-modal contain düzeltmeleri**
  - **Menu siyah şerit fix:** `.menu-overlay` opacity-only + `visibility` toggle ile snap-açıl (0.12s). İç linklerden `translateY(24px)` kaldırıldı; sadece opacity stagger (0.05s→0.34s). Üstteki "siyah kayma" tamamen yok. Dosya: [globals.css `.menu-overlay`](app/globals.css).
  - **Intro yatay layout:** `.hero-intro-text` font-size `clamp(1.8rem, 4.5vw, 3.6rem)`, `max-width: 50vw`, `line-height: 1.2`. Sol-alt anchor sabit, yazı 1-2 satırda ekran ortasına kadar uzanır (yatay yarı). Dikey yığılma yok.
  - **Scroll bar handoff dolum:** ScrollProgress update fonksiyonunda `body[data-hero-complete="true"]` kontrolü → bar `scaleX(1)`. CSS'te bu state için `transition: transform 0.45s` ile yumuşak dolum. `.scroll-progress-indicator` fade-out'una `0.55s delay` eklendi (kullanıcı barın dolduğunu görür sonra kaybolur). MutationObserver ile flag flip'i yakalanır. Dosyalar: [page.js ScrollProgress](app/page.js), [globals.css](app/globals.css).
  - **Theme scope sıkılaştırma:** IntersectionObserver rootMargin `-80px 0px -50% 0px` → `-80px 0px -85% 0px`. Dark mode sadece Selected Works section'ı viewport'un üst ~%15'inde olduğunda aktif. Contact/footer'a sıçramaz. Dosya: [page.js](app/page.js).
  - **Galeri kart cover'a geri:** ImageGallery `objectFit: contain → cover`, bg `#0a0a0a → #111`. Mobile aspect `16:10 → 4:3`. Hover-expand davranışı korunur. Dosyalar: [ImageGallery.js](app/components/ImageGallery.js), [globals.css](app/globals.css).
  - **Modal slide contain'a geçti:** GalleryModal `.gallery-immersive-slide` Image `objectFit: cover → contain`. Modal `#000` bg ile fotonun tamamı kırpılmadan ekrana sığar. Dosya: [GalleryModal.js](app/components/GalleryModal.js).

- **[2026-05-16] Hero intro büyütme / Klee slide / Galeri sade + per-project / Renk daha belirgin**
  - **Intro yazısı büyütüldü:** `.hero-intro-text` font-size `clamp(1.8rem, 4.2vw, 3.6rem)` → `clamp(3rem, 9vw, 8rem)`, line-height 1.05, max-width 88vw. Sol-alt anchor (`padding: 0 6vw 10vh 6vw`) sabit kaldı, yazı sağa-yukarı doğru büyüdü (kutucuğu sol-üstünden büyütme efekti). Mobile/landscape responsive override.
  - **Inter + Cormorant karma:** Intro `<h2>` üç parçaya ayrıldı. "Klee ile " ve " kavuş." → `.hero-intro-normal` (Inter, fw 600, 0.88em). "Hayalindeki Websitene" → `.hero-intro-emphasis` (Cormorant Garamond italic, fw 600, 1.08em). Dosyalar: [KleeHeroAnimation.js JSX](app/components/KleeHeroAnimation.js), [globals.css](app/globals.css).
  - **Top-bar Klee slide:** Hero anim boyunca `.top-bar-klee-text` `x: -((slotW+8)/2)` ≈ −18 px → gerçek viewport-merkezde durur (slot+gap yarısı kadar sola kayık). Converge label'da `+0.9s`'den itibaren 1.0s `power2.inOut` ile `x: 0`'a kayar — yonca slot'a inerken Klee yazısı doğal konumuna geçer. Hero clover landing point (`navbar-clover-logo` bbox) hep aynı yerde olduğu için hizalama bozulmaz. Dosya: [KleeHeroAnimation.js useGSAP init + converge](app/components/KleeHeroAnimation.js).
  - **Renk geçişleri daha belirgin:** `--glow-opacity 0.13/0.16 → 0.55/0.6` her step için; `.hero-glow-layer` radial stop `transparent 58% → 72%` (daha geniş hale). Yeni `.hero-tint-layer` full-bg flat tint katmanı eklendi (red/green/blue/yellow, alpha 0.12/0.12/0.12/0.14). Converge'da hem glow hem tint opacity 0 (1.2s). Dosyalar: [KleeHeroAnimation.js step1-4 tweens](app/components/KleeHeroAnimation.js), [globals.css `.hero-tint-layer` / `.hero-glow-layer`](app/globals.css).
  - **ImageGallery aktif gösterge kaldırıldı:** `.klee-gallery-item.is-active` rule'ları silindi (border-radius:0, siyah çerçeve, box-shadow, flex-grow:1 — hepsi gitti). Hover artık koşulsuz: `:not(.is-active):hover` → `:hover`. Tüm kartlar her durumda aynı davranır. `ImageGallery` component'inden `activeIndex` prop'u, `page.js`'ten `activeIndex` state'i kaldırıldı.
  - **Foto `contain`:** Galeri kartlarında `objectFit: cover → contain`. Kart bg `#111 → #0a0a0a` (boşluk için neutral koyu zemin). Fotonun tamamı kırpılmadan görünür. Mobile dikey stack aspect-ratio `4/3 → 16/10`. Dosyalar: [ImageGallery.js](app/components/ImageGallery.js), [globals.css `.klee-gallery-item`](app/globals.css).
  - **Per-project images[] yapısı:** `PROJECTS_GALLERY` her item'ına `images: string[5]` eklendi (şimdilik placeholder: kendi PNG'si 5 kez). `ProjectsSection` state `galleryIndex/activeIndex` → `galleryProjectIndex` tek state. `GalleryModal` imzası `images: string[]` + yeni `project: {title, tag, desc, ...}` prop'u alır. Modal artık sadece o projenin 5 fotosunu döndürür — sağa/sola kayma diğer projeye atlamaz. Info paneli `project`'ten beslenir. Dosyalar: [page.js](app/page.js), [GalleryModal.js](app/components/GalleryModal.js).

- **[2026-05-16] Menü / Hero intro / Renk glow / Galeri / Dark-mode polish paketi**
  - **Menü trigger & kapat:** "MENU" / "KAPAT" yazıları `RandomLetterSwapPingPong` ile sarıldı. Hamburger ikonu hover'da stagger genişlik pulse + menü açıkken (`body[data-menu-open="true"]`) X'e smooth morph. Kapat SVG hover'da `rotate(90deg)`. Dosyalar: [page.js](app/page.js), [globals.css](app/globals.css).
  - **Menü üst siyahlık fix:** `.menu-overlay` `translateY(-12px)` kaldırıldı, sadece opacity fade. Slide-up animasyonu içeride `.menu-overlay-close / .menu-overlay-link / .menu-overlay-footer` üzerine stagger (0.05s→0.34s). Dosya: [globals.css](app/globals.css).
  - **Hero intro sol-alt + Cormorant:** "Klee ile *Hayalindeki Websitene* kavuş." sol-altta italic `--font-display` (Cormorant Garamond). `.hero-intro-emphasis` ile vurgulanmış parça. Mobile/landscape responsive. Dosyalar: [layout.js](app/layout.js), [globals.css](app/globals.css), [KleeHeroAnimation.js](app/components/KleeHeroAnimation.js).
  - **Renk glow background (yonca senkron):** Yeni `.hero-glow-layer` + GSAP CSS-var tween. step1→kırmızı sol-üst, step2→yeşil sağ-alt, step3→mavi sol-alt, step4→sarı sağ-üst (`expo.inOut` 3s, clover travel ile senkron). Converge'da opacity 0. Dosya: [KleeHeroAnimation.js](app/components/KleeHeroAnimation.js).
  - **Scroll progress sync fix:** `.scroll-progress-bar` `width` transition kaldırıldı → `transform: scaleX()` + `requestAnimationFrame` + DOM mutation (React state yok). Lenis ile frame-perfect. Dosyalar: [globals.css](app/globals.css), [page.js](app/page.js).
  - **Dark theme top-bar:** IntersectionObserver `.projects` üzerine → `body[data-theme="dark"]` → Klee yazısı + menu trigger + scroll progress beyaz (0.35s transition). Dosyalar: [page.js](app/page.js), [globals.css](app/globals.css).
  - **Yeni ImageGallery (hover-expand):** Eski `.accordion-*` kaldırıldı; yeni `<ImageGallery>` componenti. `.klee-gallery-item:not(.is-active):hover { flex-grow: 4 }`. Aktif item `border-radius:0; border: 2px solid #000; box-shadow: 0 0 0 1px #fff inset; hover devre dışı`. Mobile: dikey stack aspect 4/3. Modal kapansa da aktif kalır (gösterge). Dosyalar: [ImageGallery.js (NEW)](app/components/ImageGallery.js), [page.js](app/page.js), [globals.css](app/globals.css).
  - **GalleryModal thumbnail revize:** `.gallery-thumbnail` `border-radius:0; opacity:1; w/h 44×30; border 2px transparent`. Hover rule silindi. Aktif: `border:2px solid #000; box-shadow: 0 0 0 1px #fff inset`. Dosya: [globals.css](app/globals.css).

- **[2026-05-16] Projeler: Accordion galeri + Menü overlay renkleri**
  - Bento grid + tab UI kaldırıldı; tek sıra accordion kartlar (hover expand) eklendi.
  - ScrollProgress yatay track + "aşağı kaydır" etiketi, hero tamamlanınca gizlenir.
  - MenuOverlay arka plan brand yellow; numaralar ve footer siyah.
  - Dosyalar: [page.js](app/page.js), [globals.css](app/globals.css), [KleeHeroAnimation.js](app/components/KleeHeroAnimation.js).

- **[2026-05-16] UI/UX Büyük Yeniden Tasarım — Navigation, Branding, Gallery, Scroll**
  - **Navbar kaldırıldı** → `TopBar` (minimalist, sabit, tam genişlik) + `MenuOverlay` (tam sayfa).
  - **`TopBar`**: Sol: hamburger + "Menu" label. Orta: Klee logosu (gizli yonca SVG + "Klee" metni). Sağ: spacer.
  - **`MenuOverlay`**: Brand yellow bg, büyük typographic linkler (01/02/03), numaralar + footer siyah, ESC ile kapanır, X butonu sol üstte.
  - **`ScrollProgress`**: Sağ alt köşe, `position: fixed`, yatay track + "aşağı kaydır" etiketi, scroll oranına göre `width %` dolar.
  - **"aşağı kaydır" kaldırıldı**: `KleeHeroAnimation.js` intro screen'inden scroll-prompt div'i silindi (CSS de temizlendi).
  - **Branding**: "Klee" metni + yonca SVG artık `top-bar-brand` içinde, sayfanın tam üst ortasında. GSAP handoff target: `.navbar-clover-logo` inside `.top-bar-brand` (scale `28/280`).
  - **GSAP**: `#navbar` referansı → `#top-bar`. `topBar` ile handoff yapılır (opacity + pointerEvents).
  - **`GalleryModal` tamamen yenilendi**: Tam ekran `objectFit: cover` + thumbnail şeridi + `← Geri dön` (sol alt) + `Proje bilgisi` (sağ alt) + sağdan kayan bilgi paneli (light bg, dark typo).
  - **CSS**: `globals.css` — eski navbar + gallery-modal-overlay blokları kaldırıldı; top-bar, menu-overlay, scroll-progress-indicator, gallery-immersive-\* stilleri eklendi.
  - Dosyalar: [page.js](app/page.js), [KleeHeroAnimation.js](app/components/KleeHeroAnimation.js), [GalleryModal.js](app/components/GalleryModal.js), [globals.css](app/globals.css).

  - `totalSections 2→3` (400vh sayfa, 300vh scroll = 6 evre: HORIZON / APPROACH / CONTACT / FOCUS / EXPANSION / BLOOM).
  - Halo `refs.halo` olarak ayrıca saklanıyor; `intensity` uniform ile renk mavi→beyaz kayar, `scale 1→5.5` (scroll 65-95%).
  - Animate loop: `currentHaloScale` + `currentHaloIntensity` smooth interpolation, `halo.scale.setScalar()` + uniform her frame.
  - 4-waypoint kamera path: HORIZON(z:300) → COSMOS(z:-300) → APPROACH(z:-1000) → CLOSE(z:-1850).
  - Three.js yonca opacity factor: 0.85→0.95 arası 1→0 (DOM yonca devralmadan önce kaybolur).
  - DOM beyaz overlay: progress 0.85→0.95, `z-index:5`.
  - DOM Klee yoncası: progress 0.90→1.00, `PETAL_PATH` + CSS var renkler, 300px, 22s spin, `z-index:10`.
  - Mountain disappear threshold 0.55→0.45 (daha erken açılır).

- **[2026-05-16] /horizon: Görünürlük ve layout düzeltmeleri (fog, bloom, yonca)**
  - Scene fog kaldırıldı — `FogExp2(density=0.00012)` 2000+ birimde planeti %100 gizliyordu.
  - Bloom threshold `0.85→0.2`, strength `0.45→0.7` — Klee renklerinin luminance'ı 0.43-0.84 arası, artık bloom alıyorlar.
  - Yonca `progress %45`'te belirmeye başlıyor (`%60` yerine), scale faktörü `8→12`, opacity ×2 hızlı.
  - `group.rotateZ()` ile tek billboard spin (önceki per-petal spin + lookAt çakışması giderildi).
  - SVGLoader `try/catch` + procedural fallback petal (SVGLoader başarısız olursa alternatif geometri).
  - HORIZON DOM başlığı scroll başladıkça fade-out (`opacity = 1 - progress*5`).
  - Scroll section DOM'u: artık sadece boş `<section>` spacer'lar, görünür metin yok (Three.js IS içerik).
  - Mountain threshold `0.7→0.55`.

- **[2026-05-16] /horizon: Gezegen + Klee yonca focus animasyonu**
  - `createAtmosphere` → `createPlanet` (solid sphere radius 180 + soluk halo BackSide). Gezegen sabit `z:-2000` konumunda, mat koyu mavi-mor (`#1f2847`).
  - `createClover` eklendi: `SVGLoader` + `PETAL_PATH` ile 4 Three.Shape petal mesh. Renkler: `#D14C18` / `#F4D68C` / `#7C9DD2` / `#B2AB2B`. Billboard + idle z-rotation + scroll-based scale/opacity (progress 0.6→0.85 arası).
  - Camera path yenilendi: HORIZON (z:300) → COSMOS (z:-300) → APPROACH (z:-1700). `lookAt(0,10,-2000)` (her zaman gezegene bakar). `camera.far: 2000→3500`.
  - Bloom strength `0.8→0.45` (genel soluk his).
  - Mountain threshold `>0.7→>0.6` (yaklaşma fazında dağlar daha erken temizlenir).
  - Nebula bağımsızlaştırıldı (`z:-2500` sabit, mountain.position.z bağlantısı kesildi).
  - scroll sectionProgress wrap bug'ı düzeltildi (progress=1'de sectionProgress=0'a sarıyordu; `totalProg >= totalSections ? 1 : totalProg % 1` ile düzeltildi).
  - Cleanup güncellendi: planet group + clover group tüm children dispose.
  - Dosya: [HorizonHeroSection.jsx](app/components/HorizonHeroSection.jsx).

- **[2026-05-16] /horizon route: Three.js Horizon Hero entegrasyonu (demo)**
  - `npm install three` — Three.js eklendi (bundle sadece `/horizon` chunk'ına gider, anasayfa etkilenmez).
  - **Yeni bileşen:** [HorizonHeroSection.jsx](app/components/HorizonHeroSection.jsx) — starfield + nebula + dağlar + atmosfer + bloom post-processing + scroll kamera.
  - **Yeni route:** [app/horizon/page.js](app/horizon/page.js) + [app/horizon/horizon.css](app/horizon/horizon.css) (scoped `.cosmos-style`).
  - **LenisProvider güncellendi:** `usePathname` ile `/horizon`'da Lenis bypass → native scroll aktif. [LenisProvider.js](app/components/LenisProvider.js).
  - **Orijinal koddaki 2 bug düzeltildi:** (1) `splitTitle()` çağrılmıyordu → `.title-char` span'ları oluşmuyordu, GSAP animasyon broken. (2) `titleRef`/`subtitleRef` 3 elemana aynı anda atanıyordu → scroll-section ref'leri kaldırıldı.
  - Mevcut Klee anasayfası (yonca hero, projeler, iletişim) **dokunulmadı**.

- **[2026-05-16] Hero animasyonu smoothness: Lenis + easing + petal opacity + idle spin**
  - **Lenis smooth-scroll** entegrasyonu: [LenisProvider.js (NEW)](app/components/LenisProvider.js) oluşturuldu. Lenis v1.x → GSAP ticker proxy → tek RAF loop. `lagSmoothing(0)` kapatılarak Lenis + GSAP senkronizasyonu sağlandı. Scroll artık "tıkır tıkır" değil, flüid. Performans: Harici yük yok.
  - **Easing paletinin optimize edilmesi** ([KleeHeroAnimation.js](app/components/KleeHeroAnimation.js)):
    - 4 köşe travel (x/y/scale): `power2.inOut` → `expo.inOut` (sinematik uçuş hissi).
    - 4 köşe rotation (ayrı tween): `power2.inOut` → `sine.inOut` (doğal dönüş).
    - Metin entrance (keyword chars): `power2.out` → `back.out(1.2)` (hafif overshoot → yerine oturma).
    - Step desc: `power2.out` → `power3.out` (daha decelerative).
  - **Petal opacity cross-fade**: Opacity `0.92 → 0` (full black) ~~→~~ `0.92 → 0.15` (geri çekilir, tam yok olmaz). Duration `0.35s` → `0.5s`, offset `1.15s` → `1.0s`. Sonuç: daha yumuşak, geri planda "solgun" his.
  - **Idle spin smooth kill**: `idleSpin.kill()` ~~→~~ `gsap.to(idleSpin, { timeScale: 0, duration: 0.4, onComplete: kill })`. Yonca ani duruş yerine 0.4s içinde hız 0'a iner, kullanıcının scroll başlangıcında tökezlenme hissi ortadan kalkar.
  - Dosyalar: [LenisProvider.js (NEW)](app/components/LenisProvider.js), [layout.js:1-22](app/layout.js#L1), [KleeHeroAnimation.js:249-265 (idle spin) + tüm step1-4 travel/rotation/petal (275-415)](app/components/KleeHeroAnimation.js#L249).
  - **Performance notu**: GPU-composite opacity, GSAP ticker paylaşımı, rotation ayrı tween'i çakışma yok → frame drop risk düşük. Test edildi: Chrome/Windows, mobile (767px), landscape (height<500px).

- **[2026-05-15] Navbar link hover: underline → text swap**
  - Navbar linkleri artık `<RandomLetterSwapPingPong>` içinde sarılı (ANA SAYFA / PROJELER / İLETİŞİM).
  - `.navbar-link::after` underline pseudo-element ve `:hover` scale(1.08) CSS'ten kaldırıldı.
  - `transition: transform` da gereksiz kaldı, sadeleştirildi.
  - Dosyalar: [page.js:359-381](app/page.js#L359), [globals.css:215-222](app/globals.css#L215).

- **[Commit 7cbc268 — "changed the ui and design elements of some parts"]**
  - `Card3D` bileşeni eklendi (Aceternity-UI port'u). Hero final görselinde kullanılıyor.
  - `RandomLetterSwap` bileşeni eklendi (PingPong + Forward).
  - `CyclingWord` iç bileşeni hero'ya eklendi (4 kelime döngüsü, slide+blur).
  - Intro screen eklendi: "Klee ile HAYALİNDEKİ WEBSİTENE kavuş" + scroll prompt + bounce arrow + idle spin.
  - ScrambleText importları kaldırıldı (RandomLetterSwap'a geçildi).
  - Hero final raw `<img>` kullanıyor (3D card için).

- **[Commit 15be23e — "Hero animation: responsive design overhaul for mobile & landscape"]**
  - `isLandscape()` JS helper eklendi.
  - `cornerScale` / `cX` / `cY` / `scrollEnd` artık 3 cihaz moduna göre dinamik (desktop / mobile / landscape).
  - `.hero-keyword`, `.step-desc`, `.hero-final-*` için CSS class'ları (inline style'lar yerine).
  - Landscape için özel `@media (max-height: 500px) and (orientation: landscape)` blokları.

- **[Commit f5def84 — "Animate hero copy and tidy layout"]**
  - Hero keyword + desc animasyon zamanlamaları (3× scale).
  - +180° rotation offset her step için.
  - `cornerScale` 8→6'ya inip opacity ile tek yaprak görünümü sağlandı.

- **[Commit 841d7ce — "Initial commit"]**

## 🎯 Bir Sonraki Adımlar (Önceliklendirilmiş)

1. **Hero animasyon "smoothness" iyileştirmeleri** — Kullanıcı şu an aktif olarak bu konuda öneri istedi; öneriler bir altta listelenecek (ayrı bölüm).
2. **Proje verisini gerçek müşteri projeleriyle doldur** ve galeri görsellerini gerçek içerikle güncelle.
3. **İletişim bilgilerini gerçek değerlerle güncelle** (WhatsApp numarası, telefon, footer link'leri).
4. **GalleryModal a11y + klavye desteği** (ESC, ← →, focus trap, `role="dialog"`, `aria-modal`).
5. **README'yi Klee'ye özel yaz** (proje açıklaması, kurulum, Next.js 16 uyarısı, geliştirme notları).
6. **`page.module.css`, `ScrambleText.js`, kullanılmayan `tagClass` alanları, default public SVG'leri temizle.**
7. **SEO:** `metadataBase`, OG image, twitter card, favicon variants ekle.
8. **A11y:** Hero animasyonunu `prefers-reduced-motion` ile koşullandır (azaltılmış sürüm: tek geçiş + fade).
9. **Performans:** Hero final `<img>` → `next/image`; idle spin'i `requestAnimationFrame` benzeri optimize et; ScrollTrigger refresh debounce.
10. **Form/CRM entegrasyonu** (opsiyonel): iletişim formu + e-posta servisi (Resend / Nodemailer).

---

## 📋 Çalışma Kuralları (AI'ya Emir)

> Bu bölüm AI için **bağlayıcı talimat**lardır. Her konuşmada uygulanmalı.

1. **Her konuşma başında bu dosyayı oku.** Projeyi buradan kavra. Tek tek dosya açıp keşfetmeye başlama — gerekirse referans olarak aç.
2. **Kod yazmadan önce** `node_modules/next/dist/docs/` altındaki Next.js 16 rehberini kontrol et (AGENTS.md emri). Eğitim verisi güvenilmez.
3. **Önemli değişiklik = bu dosyayı güncelle.** Aşağıdaki adımlar:
   - İlgili "Bileşen Detayları" / "Mevcut Durum" / "Kritik Konfigürasyonlar" / "Bilinen Sorunlar" bölümlerini güncelle.
   - **"Son Değişiklikler (Changelog)" bölümünün en üstüne yeni bir madde ekle**: `**[YYYY-MM-DD] Kısa başlık**` formatında, hangi dosyalar/satırlar değişti, neden değişti.
   - Eğer "Bilinen Sorunlar" listesindeki bir madde çözüldüyse, listeden çıkar.
   - Eğer yeni bir component eklendiyse → "Bileşen Detayları" + "Dosya Yapısı" bölümlerini güncelle.
4. **AI bunu hatırlatmasa bile yap.** Kullanıcı sadece "değişikliği yap" der; AI hem değişikliği yapacak hem PROJECT_MEMORY.md'yi güncelleyecek **ve kullanıcıya kısa bir özetle bildirecek** ("PROJECT_MEMORY.md güncellendi: X bölümü + changelog satırı").
5. **Asla eski bilgiyi silmeden üstüne yazma.** Önce mevcut içeriği oku, sonra cerrahi şekilde güncelle.
6. **Kapsamı genişletme.** Bu dosya canlı bir özet; bitmemiş işlerin uzun planı değil. Hızlı oryantasyon için optimize.
7. **Tarihleri mutlak yaz** (`2026-05-15`), göreceli değil ("dün", "geçen hafta").
8. **Türkçe yaz** — bu dosyanın dili Türkçe; tutarlı kal.
9. **Dosya yolu referanslarını [filename.js:line](path/filename.js#Lline) markdown link formatında ver** — IDE'de tıklanabilir olur.
10. **Eğer kullanıcı "bu memoryyi güncelle" derse**, son turdaki tüm değişiklikleri tara, eksik kalmış güncellemeleri de bu sefer ekle.
