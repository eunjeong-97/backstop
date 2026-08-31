import type { Metadata } from "next";
import { Gothic_A1, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

/**
 * 폰트를 불러오지 않으면 보는 사람 컴퓨터의 기본 글꼴로 그려진다(맥·윈도우가 서로 다름).
 * docs/화면-디자인-규칙.md 1번.
 *
 * layout 에 <head> 를 직접 쓰면 Next 가 자동으로 넣어주는 기본 meta
 * (charset, viewport)가 사라져 모바일이 980px 로 렌더된다. 그래서 next/font 를 쓴다.
 */
// next/font 는 Gothic A1 의 'korean' 서브셋 이름을 모른다.
// subsets 를 지정하면 라틴만 받아 한글이 폴백 폰트로 그려지므로,
// preload: false 로 두어 서브셋 제한 없이 전체를 받게 한다.
const gothicA1 = Gothic_A1({
  weight: ["400", "500", "700", "900"],
  variable: "--font-sans",
  display: "swap",
  preload: false,
});

// 숫자·라틴 전용이라 라틴 서브셋으로 충분하다.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const SITE = "https://backstop-seven.vercel.app";
const TITLE = "믿을구석 — 요청문에 없는 일까지 찾아드립니다";
const DESC =
  "외주에서 손해를 보는 이유는 가격을 낮게 불러서가 아니라, 요청문에 안 적힌 작업을 견적에 못 넣어서입니다. 그 안 적힌 일을 찾아 공수와 계약 범위를 잡아드립니다.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESC,
  applicationName: "믿을구석",
  keywords: ["프리랜서", "외주", "견적", "범위", "계약", "위시켓", "크몽", "AI"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "믿을구석",
    title: TITLE,
    description: DESC,
    url: SITE,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${gothicA1.variable} ${plexMono.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
