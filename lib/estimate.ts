// 공수 → 견적 환산. 클라이언트에서만 계산한다.
//
// 설계 원칙: 이 도구는 금액을 만들지 않는다. 공수(시간)만 추정하고
// 단가는 사용자가 입력한다. "그 금액을 어떻게 믿냐"는 물음에 대한 답이 이 구조다.

import type { HiddenTask, Severity } from "./types";

export const HOURS_PER_DAY = 8;
export const DEFAULT_DAILY_RATE = 400_000;

export interface HoursSummary {
  min: number;
  max: number;
  /** 공수가 0으로 잡힌 항목 수 — 리스크는 있으나 시간으로 환산되지 않는 것들 */
  unquantified: number;
}

export function sumHours(tasks: HiddenTask[]): HoursSummary {
  let min = 0;
  let max = 0;
  let unquantified = 0;
  for (const t of tasks) {
    const lo = Number(t.hours_min) || 0;
    const hi = Number(t.hours_max) || 0;
    if (lo === 0 && hi === 0) unquantified += 1;
    min += lo;
    max += hi;
  }
  return { min, max, unquantified };
}

export interface Quote {
  lowDays: number;
  highDays: number;
  low: number;
  recommended: number;
  high: number;
}

export function toQuote(hours: HoursSummary, dailyRate: number): Quote {
  const lowDays = hours.min / HOURS_PER_DAY;
  const highDays = hours.max / HOURS_PER_DAY;
  const low = Math.round(lowDays * dailyRate);
  const high = Math.round(highDays * dailyRate);
  return {
    lowDays,
    highDays,
    low,
    recommended: Math.round((low + high) / 2),
    high,
  };
}

export function won(n: number): string {
  return `${Math.round(n).toLocaleString("ko-KR")}원`;
}

export function days(n: number): string {
  return `${n.toFixed(1)}일`;
}

/** 시간 수. 큰 프로젝트는 네 자리가 되므로 천 단위로 끊는다. */
export function hours(n: number): string {
  return n.toLocaleString("ko-KR");
}

const ORDER: Record<Severity, number> = { high: 0, medium: 1, low: 2 };

export function bySeverity(a: HiddenTask, b: HiddenTask): number {
  return ORDER[a.severity] - ORDER[b.severity];
}

/** 결과 전체를 제안서에 붙여넣을 수 있는 텍스트로 변환한다. */
export function toPlainText(opts: {
  title: string;
  tasks: HiddenTask[];
  hours: HoursSummary;
  quote: Quote;
  questions: { q: string; blocking: boolean }[];
  verdict: { decision: string; reason: string; conditions: string[] };
  blockers: { blocker: string }[];
}): string {
  const L: string[] = [];
  L.push(`[${opts.title}] 검토 결과`, "");
  if (opts.blockers.length) {
    L.push("■ 참여 자격 확인 필요");
    opts.blockers.forEach((b) => L.push(`- ${b.blocker}`));
    L.push("");
  }
  L.push(`■ 판정: ${opts.verdict.decision}`, `  ${opts.verdict.reason}`);
  opts.verdict.conditions.forEach((c) => L.push(`  · 조건: ${c}`));
  L.push("");
  L.push("■ 요청문에 없는 작업");
  opts.tasks.forEach((t, i) => {
    const h = t.hours_max ? ` (${t.hours_min}~${t.hours_max}시간)` : "";
    L.push(`${i + 1}. [${t.severity}] ${t.task}${h}`);
    L.push(`   - 왜: ${t.why}`);
    L.push(`   - 계약상: ${t.contract_conflict}${t.conflict_note ? ` — ${t.conflict_note}` : ""}`);
  });
  L.push("");
  L.push(
    "■ 공수 합계",
    `  ${hours(opts.hours.min)}~${hours(opts.hours.max)}시간 (${days(opts.quote.lowDays)}~${days(opts.quote.highDays)})`
  );
  if (opts.hours.unquantified) {
    L.push(`  · 시간으로 환산하지 않은 항목 ${opts.hours.unquantified}건 별도`);
  }
  L.push("");
  L.push("■ 견적 구간", `  ${won(opts.quote.low)} ~ ${won(opts.quote.high)} (권장 ${won(opts.quote.recommended)})`);
  L.push("");
  L.push("■ 계약 전 확인할 것");
  opts.questions.forEach((q, i) => L.push(`${i + 1}. ${q.q}${q.blocking ? " (필수)" : ""}`));
  L.push("", "— 믿을구석(Backstop)으로 작성");
  return L.join("\n");
}
