export const PROJECTS_GALLERY = [
  {
    slug: "luxe-commerce",
    image: "/project-1.png",
    images: [
      "/project-1.png",
      "/project-1.png",
      "/project-1.png",
      "/project-1.png",
      "/project-1.png",
    ],
    tag: "E-Ticaret",
    tagClass: "tag-blue",
    title: "Luxe Commerce",
    desc: "Premium e-ticaret platformu — modern alışveriş deneyimi.",
    featured: true,
  },
  {
    slug: "fittrack",
    image: "/project-2.png",
    images: [
      "/project-2.png",
      "/project-2.png",
      "/project-2.png",
      "/project-2.png",
      "/project-2.png",
    ],
    tag: "Mobil Uygulama",
    tagClass: "tag-green",
    title: "FitTrack",
    desc: "Sağlık & fitness takip uygulaması.",
  },
  {
    slug: "evora",
    image: "/project-3.png",
    images: [
      "/project-3.png",
      "/project-3.png",
      "/project-3.png",
      "/project-3.png",
      "/project-3.png",
    ],
    tag: "Emlak",
    tagClass: "tag-red",
    title: "Evora",
    desc: "Akıllı emlak arama platformu.",
  },
  {
    slug: "datapulse",
    image: "/project-4.png",
    images: [
      "/project-4.png",
      "/project-4.png",
      "/project-4.png",
      "/project-4.png",
      "/project-4.png",
    ],
    tag: "SaaS",
    tagClass: "tag-yellow",
    title: "DataPulse",
    desc: "Analitik dashboard çözümü.",
  },
  {
    slug: "tastehub",
    image: "/project-5.png",
    images: [
      "/project-5.png",
      "/project-5.png",
      "/project-5.png",
      "/project-5.png",
      "/project-5.png",
    ],
    tag: "Yemek Sipariş",
    tagClass: "tag-red",
    title: "TasteHub",
    desc: "Yemek sipariş & teslimat platformu.",
  },
];

export function getProjectBySlug(slug) {
  return PROJECTS_GALLERY.find((p) => p.slug === slug);
}
