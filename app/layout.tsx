import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="ko">
      <head>
        {/* 폰트를 불러오지 않으면 보는 사람 컴퓨터의 기본 글꼴로 그려진다.
            맥과 윈도우에서 다르게 보이는 것을 막는다. docs/화면-디자인-규칙.md 1번 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Gothic+A1:wght@400;500;700;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
