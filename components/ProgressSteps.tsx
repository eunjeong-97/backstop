"use client";

import { useEffect, useState } from "react";

export type Phase = "idle" | "extract" | "analyze" | "done" | "error";

const STEPS: { key: Phase; label: string }[] = [
  { key: "extract", label: "적힌 것 읽는 중" },
  { key: "analyze", label: "안 적힌 것 찾는 중" },
];

const ORDER: Phase[] = ["idle", "extract", "analyze", "done"];

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
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (phase !== "extract" && phase !== "analyze") return;
    setTick(0);
    const id = setInterval(() => setTick((v) => v + 1), 3500);
    return () => clearInterval(id);
  }, [phase]);

  if (phase === "idle" || phase === "error") return null;
  const now = ORDER.indexOf(phase);
  const active = phase === "extract" || phase === "analyze" ? phase : null;
  const hint = active ? HINTS[active][tick % HINTS[active].length] : null;

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
        <span className="text-xs text-sub sm:ml-auto">보통 30초~1분 걸립니다</span>
      </div>

      {hint && (
        <p aria-live="polite" className="text-sm text-sub">
          {hint}
        </p>
      )}
    </div>
  );
}
