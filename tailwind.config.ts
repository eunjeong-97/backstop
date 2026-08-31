import type { Config } from "tailwindcss";

/**
 * 방향 B(판정 계기판) — docs/화면-디자인-규칙.md 가 정본이다.
 * 여기 없는 색을 컴포넌트에서 새로 만들지 않는다. 필요하면 규칙 문서를 먼저 고친다.
 *
 * 토큰 '이름'은 밝은 화면 시절 그대로 두고 '값'만 바꿨다.
 * 이름을 바꾸면 Tailwind가 모르는 클래스를 조용히 버려서 깨진 것을 눈치채기 어렵다.
 */
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // 한글이 있는 곳은 Gothic A1, 숫자·라틴은 Plex Mono.
        // mono 스택에도 Gothic A1 을 넣어, 한글이 섞여도 시스템 고정폭으로 튀지 않게 한다.
        sans: ["var(--font-sans)", '"Apple SD Gothic Neo"', "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "var(--font-sans)", "ui-monospace", "Menlo", "monospace"],
      },
      colors: {
        // 바탕 3단계 — 깊이는 그림자가 아니라 이 밝기 차이로 만든다
        bg: "#11141C",
        card: "#191E2A",
        line: "#262D3D",

        // 글자 3단계 — 강조는 색이 아니라 굵기로 한다
        ink: "#E9ECF4",
        sub: "#AEB6C9",
        mute: "#78819A",

        // 액센트(제품의 색) — 한 화면에 2~3곳만
        accent: "#F2A83E",

        // 심각도(신호의 색) — 판정에만 쓰고 장식으로 쓰지 않는다
        high: "#FF6D5C",
        mid: "#F2A83E",
        low: "#78819A",
        ok: "#56C7B0",
      },
      borderRadius: {
        DEFAULT: "3px",
      },
    },
  },
  plugins: [],
} satisfies Config;
