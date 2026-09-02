"use client";

import { useEffect, useRef, useState } from "react";

export type Phase = "idle" | "extract" | "analyze" | "done" | "error";

const STEPS: { key: Phase; label: string }[] = [
  { key: "extract", label: "적힌 것 읽는 중" },
  { key: "analyze", label: "안 적힌 것 찾는 중" },
];

const ORDER: Phase[] = ["idle", "extract", "analyze", "done"];

/**
 * 예상 소요. 실제 남은 시간은 알 수 없으므로 경과 시간 기준 추정이며,
 * 다 찼다고 오해하지 않도록 95%에서 멈춰 기다린다.
 */
const EXPECTED_MS = 50_000;
/** 이보다 길어지면 안내 문구를 바꾼다 */
const SLOW_MS = 75_000;

/** 30~60초는 긴 시간이다. 지금 무엇을 보고 있는지 알려주면 이탈이 줄어든다. */
const HINTS: Record<"extract" | "analyze", string[]> = {
  extract: [
    "요청문에 적힌 작업을 하나씩 뽑고 있습니다",
    "범위에서 제외한다고 적힌 항목도 모으는 중입니다",
    "각 항목의 근거 문장을 찾고 있습니다",
  ],
  analyze: [
    "한 줄로 적힌 큰 일이 없는지 보는 중입니다",
    "‘준비 중’이라고 적힌 것을 확인하고 있습니다",
    "클라이언트가 직접 하겠다는 일의 순서를 따져보는 중입니다",
    "법적·행정 요건을 훑고 있습니다",
    "일한 시간이 아니라 묶여 있는 시간을 찾는 중입니다",
    "못 미루는 날짜에 걸린 것이 있는지 보는 중입니다",
  ],
};

export function ProgressSteps({ phase }: { phase: Phase }) {
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef<number | null>(null);
  const running = phase === "extract" || phase === "analyze";

  useEffect(() => {
    if (!running) {
      startedAt.current = null;
      setElapsed(0);
      return;
    }
    // 단계가 바뀌어도 타이머는 이어간다 — 사용자가 보는 건 전체 대기 시간이다
    if (startedAt.current === null) startedAt.current = Date.now();
    const id = setInterval(() => {
      if (startedAt.current !== null) setElapsed(Date.now() - startedAt.current);
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  if (phase === "idle" || phase === "error") return null;
  const now = ORDER.indexOf(phase);
  const seconds = Math.floor(elapsed / 1000);
  const slow = elapsed > SLOW_MS;

  let percent = Math.min(95, (elapsed / EXPECTED_MS) * 100);
  if (phase === "analyze") percent = Math.max(percent, 50);
  if (phase === "done") percent = 100;

  const active = running ? (phase as "extract" | "analyze") : null;
  const hint = active
    ? HINTS[active][Math.floor(elapsed / 3500) % HINTS[active].length]
    : null;

  return (
    <div className="card space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        {STEPS.map((s) => {
          const at = ORDER.indexOf(s.key);
          const state = now > at ? "done" : now === at ? "doing" : "todo";
          return (
            <div key={s.key} className="flex items-center gap-2 text-sm">
              <span
                aria-hidden
                className={
                  state === "done"
                    ? "grid h-5 w-5 place-items-center rounded-full bg-accent text-[11px] font-bold text-bg"
                    : state === "doing"
                      ? "h-5 w-5 animate-pulse rounded-full bg-line"
                      : "h-5 w-5 rounded-full border border-line"
                }
              >
                {state === "done" ? "✓" : ""}
              </span>
              <span className={state === "todo" ? "text-sub" : "font-medium"}>{s.label}</span>
            </div>
          );
        })}
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        aria-label="분석 진행률"
        className="h-1 w-full overflow-hidden rounded-[2px] bg-line"
      >
        <div
          className="h-full bg-accent transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p aria-live="polite" className="text-sm text-sub">
          {slow ? "예상보다 오래 걸리고 있습니다. 조금만 더 기다려 주세요" : hint}
        </p>
        <span className="num shrink-0 text-xs text-mute">
          {seconds}초 경과 · 보통 30~60초
        </span>
      </div>
    </div>
  );
}
