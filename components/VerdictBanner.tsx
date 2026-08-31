import type { Stage2Result } from "@/lib/types";

const TONE: Record<string, string> = {
  위험: "border-high/30 bg-high/5 text-high",
  조건부: "border-mid/30 bg-mid/5 text-mid",
  수용: "border-ok/30 bg-ok/10 text-ok",
};

function toneOf(decision: string): string {
  const key = Object.keys(TONE).find((k) => decision.includes(k));
  return key ? TONE[key] : "border-line bg-card text-ink";
}

export function VerdictBanner({ verdict }: { verdict: Stage2Result["verdict"] }) {
  return (
    <div className={`rounded-[3px] border border-l-[3px] p-5 ${toneOf(verdict.decision)}`}>
      <div className="text-xs font-medium opacity-70">최종 판정</div>
      <div className="mt-1 text-2xl font-bold">{verdict.decision}</div>
      <p className="mt-2 text-sm leading-relaxed opacity-90">{verdict.reason}</p>
      {verdict.conditions?.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm opacity-90">
          {verdict.conditions.map((c, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden>·</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
