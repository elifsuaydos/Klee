import "./globals.css";
import LenisProvider from "./components/LenisProvider";

export const metadata = {
  title: "Klee — Web Development Agency",
  description:
    "Klee is a modern web development agency based in Ankara, Türkiye. We build premium digital products, websites, and applications that drive growth.",
  keywords: [
    "web development",
    "agency",
    "Klee",
    "Ankara",
    "Türkiye",
    "design",
  ],
  openGraph: {
    title: "Klee — Web Development Agency",
    description: "We build premium digital products that drive growth.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
