import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/providers";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Micro Estate | ค้นหาอสังหาริมทรัพย์ในฝัน",
    template: "%s | Micro Estate",
  },
  description:
    "แพลตฟอร์มค้นหาและลงประกาศอสังหาริมทรัพย์ที่ใช้ AI ในการจับคู่ความต้องการกับทรัพย์สินที่เหมาะสม",
  keywords: [
    "อสังหาริมทรัพย์",
    "บ้าน",
    "คอนโด",
    "ที่ดิน",
    "ซื้อบ้าน",
    "เช่าบ้าน",
    "real estate",
    "property",
  ],
  authors: [{ name: "Micro Estate" }],
  creator: "Micro Estate",
  openGraph: {
    type: "website",
    locale: "th_TH",
    siteName: "Micro Estate",
    title: "Micro Estate | ค้นหาอสังหาริมทรัพย์ในฝัน",
    description: "แพลตฟอร์มค้นหาและลงประกาศอสังหาริมทรัพย์อัจฉริยะ",
  },
  twitter: {
    card: "summary_large_image",
    title: "Micro Estate",
    description: "แพลตฟอร์มค้นหาและลงประกาศอสังหาริมทรัพย์อัจฉริยะ",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
