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
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
