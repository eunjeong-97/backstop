import type { HiddenTask } from "@/lib/types";
import { days, won, type HoursSummary, type Quote } from "@/lib/estimate";

/**
 * 결과 최상단 펀치라인.
 * "클라이언트가 부른 금액"과 "안 적힌 일까지 넣었을 때"를 나란히 놓는 것이
 * 이 제품이 하는 말의 전부다. 목록보다 먼저 보여야 한다.
 */
export function SummaryStrip({
  tasks,
  hours,
  quote,
  clientBudget,
}: {
  tasks: HiddenTask[];
  hours: HoursSummary;
  quote: Quote;
  clientBudget?: string;
}) {
  const high = tasks.filter((t) => t.severity === "high").length;
  const excluded = tasks.filter((t) => t.contract_conflict === "제외").length;

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card">
          <p className="text-sm text-sub">클라이언트가 제시한 금액</p>
          <p className="mt-1 break-keep text-2xl font-bold text-sub">
            {clientBudget?.trim() || "요청문에 금액 표기 없음"}
          </p>
          <p className="mt-2 text-xs text-sub">요청문에 적힌 것만 반영된 금액입니다</p>
        </div>

        <div className="rounded-xl border border-high/30 bg-high/5 p-5">
          <p className="text-sm text-high/80">안 적힌 일까지 넣으면</p>
          <p className="mt-1 text-2xl font-bold text-high">
            {won(quote.low)} ~ {won(quote.high)}
          </p>
          <p className="mt-2 text-xs text-high/80">
            추가 공수 {hours.min}~{hours.max}시간 ({days(quote.lowDays)}~{days(quote.highDays)})
          </p>
        </div>
      </div>

      <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-sub">
        <li>
          숨은 작업 <strong className="font-semibold text-ink">{tasks.length}개</strong>
        </li>
        {high > 0 && (
          <li>
            그중 심각 <strong className="font-semibold text-high">{high}개</strong>
          </li>
        )}
        {excluded > 0 && (
          <li>
            계약상 범위 밖 <strong className="font-semibold text-ink">{excluded}개</strong>
          </li>
        )}
        {hours.unquantified > 0 && (
          <li>
            시간 환산 불가 <strong className="font-semibold text-ink">{hours.unquantified}개</strong>
          </li>
        )}
      </ul>
    </section>
  );
}
