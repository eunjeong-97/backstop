import type { HiddenTask, Stage2Result } from "@/lib/types";
import { days, won, type HoursSummary, type Quote } from "@/lib/estimate";
import { verdictTone } from "./VerdictBanner";

/**
 * 결과 화면의 계기판. 읽는 화면이 아니라 판단하는 화면으로 만든다.
 * docs/화면-디자인-규칙.md 7번 — 위에서 아래로 정보가 넓어지는 3층 구조다.
 *
 *   1층 판정 줄   프로젝트명 + 판정 칩 (한 화면에 채운 색은 이 칩 하나뿐)
 *   2층 금액 대비 제시 금액 → 보정 금액 (보정만 액센트)
 *   3층 숫자 4칸  숨은 작업 / 심각 / 계약 범위 밖 / 시간 환산 불가
 *
 * "클라이언트가 부른 금액"과 "안 적힌 일까지 넣었을 때"를 나란히 놓는 것이
 * 이 제품이 하는 말의 전부다. 목록보다 먼저 보여야 한다.
 */
export function SummaryStrip({
  title,
  verdict,
  tasks,
  hours,
  quote,
  dailyRate,
  clientBudget,
}: {
  title: string;
  verdict: Stage2Result["verdict"];
  tasks: HiddenTask[];
  hours: HoursSummary;
  quote: Quote;
  dailyRate: number;
  clientBudget?: string;
}) {
  const tone = verdictTone(verdict.decision);
  const high = tasks.filter((t) => t.severity === "high").length;
  const excluded = tasks.filter((t) => t.contract_conflict === "제외").length;

  const stats = [
    { n: tasks.length, label: "숨은 작업", hot: false },
    { n: high, label: "그중 심각", hot: true },
    { n: excluded, label: "계약 범위 밖", hot: false },
    { n: hours.unquantified, label: "시간 환산 불가", hot: false },
  ];

  return (
    <section className="space-y-3">
      {/* 1층 — 판정 줄 */}
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <h2 className="text-xl font-bold leading-snug tracking-tight">{title}</h2>
        <span
          className={`badge shrink-0 px-3 py-1 text-sm ${tone.chip}`}
          title={verdict.reason}
        >
          {verdict.decision}
        </span>
      </div>

      {/* 2층 — 금액 대비 */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card">
          <p className="text-sm text-mute">클라이언트가 제시한 금액</p>
          <p
            className={`mt-1 break-keep font-bold text-sub ${
              (clientBudget?.length ?? 0) > 24 ? "text-lg leading-snug" : "text-2xl"
            }`}
          >
            {clientBudget?.trim() || "요청문에 금액 표기 없음"}
          </p>
          <p className="mt-2 text-xs text-mute">요청문에 적힌 것만 반영된 금액입니다</p>
        </div>

        <div className="rounded-[3px] border border-accent/30 bg-accent/5 p-5">
          <p className="text-sm text-accent/80">안 적힌 일까지 넣으면</p>
          {/* 등폭 숫자는 일반 폰트보다 폭이 넓다. 카드 폭을 넘기지 않도록 한 단계 줄인다 */}
          <p className="num mt-1 text-xl font-bold leading-tight text-accent">
            {won(quote.low)} ~ {won(quote.high)}
          </p>
          <p className="num mt-2 text-xs text-accent/80">
            권장 {won(quote.recommended)} · 추가 공수 {hours.min}~{hours.max}시간 (
            {days(quote.lowDays)}~{days(quote.highDays)})
          </p>
        </div>
      </div>

      {/* 3층 — 숫자 4칸 */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[3px] border border-line bg-card px-4 py-3">
            <p className={`stat ${s.hot && s.n > 0 ? "text-high" : "text-ink"}`}>{s.n}</p>
            <p className="mt-1.5 text-xs leading-snug text-mute">{s.label}</p>
          </div>
        ))}
      </div>

      <p className="text-xs leading-relaxed text-mute">
        견적은 입력하신 일당 {won(dailyRate)}에 공수를 곱한 값입니다. 이 도구는 금액을 만들지
        않고 공수만 추정합니다.
        {hours.unquantified > 0 &&
          ` 시간으로 환산하지 않은 항목 ${hours.unquantified}건(대기 시간·계약 조항 등)은 위 금액에 들어 있지 않습니다.`}
      </p>
    </section>
  );
}
