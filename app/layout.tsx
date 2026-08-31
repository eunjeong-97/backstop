import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "믿을구석 — 요청문에 없는 일까지 찾아드립니다",
  description:
    "외주 요청문을 넣으면 거기 안 적힌 작업을 찾아내 공수와 계약 범위 문구를 만들어주는 도구.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
