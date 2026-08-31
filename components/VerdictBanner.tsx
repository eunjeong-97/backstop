import type { Stage2Result } from "@/lib/types";

/**
 * 판정 색. 액센트(제품의 색)와 구분되는 신호의 색이다.
 * docs/화면-디자인-규칙.md 3번 — 판정에만 쓰고 장식으로 쓰지 않는다.
 */
type Tone = { chip: string; rule: string; text: string };

const TONE: Record<string, Tone> = {
  위험: { chip: "bg-high text-bg", rule: "border-l-high", text: "text-high" },
  조건부: { chip: "bg-mid text-bg", rule: "border-l-mid", text: "text-mid" },
  수용: { chip: "bg-ok text-bg", rule: "border-l-ok", text: "text-ok" },
};

const NEUTRAL: Tone = { chip: "bg-line text-ink", rule: "border-l-line", text: "text-sub" };

export function verdictTone(decision: string): Tone {
  const key = Object.keys(TONE).find((k) => decision.includes(k));
  return key ? TONE[key] : NEUTRAL;
}

/**
 * 판정의 '이유와 조건'만 담는다.
 * 판정 단어 자체는 화면 맨 위 칩이 이미 말하고 있으므로 여기서 반복하지 않는다.
 */
export function VerdictBanner({ verdict }: { verdict: Stage2Result["verdict"] }) {
  const tone = verdictTone(verdict.decision);

  return (
    <section className={`rounded-[3px] border border-line border-l-[3px] bg-card p-5 ${tone.rule}`}>
      <h2 className="text-sm font-bold text-ink">이 판정의 이유</h2>
      <p className="mt-2 text-sm leading-relaxed text-sub">{verdict.reason}</p>
      {verdict.conditions?.length > 0 && (
        <>
          <h3 className="mt-4 text-xs font-bold text-mute">받으려면 먼저 정해야 하는 것</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-sub">
            {verdict.conditions.map((c, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className={tone.text}>
                  ·
                </span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
