export type Phase = "idle" | "extract" | "analyze" | "done" | "error";

const STEPS: { key: Phase; label: string }[] = [
  { key: "extract", label: "적힌 것 읽는 중" },
  { key: "analyze", label: "안 적힌 것 찾는 중" },
];

const ORDER: Phase[] = ["idle", "extract", "analyze", "done"];

export function ProgressSteps({ phase }: { phase: Phase }) {
  if (phase === "idle" || phase === "error") return null;
  const now = ORDER.indexOf(phase);

  return (
    <div className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
      {STEPS.map((s) => {
        const at = ORDER.indexOf(s.key);
        const state = now > at ? "done" : now === at ? "doing" : "todo";
        return (
          <div key={s.key} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden
              className={
                state === "done"
                  ? "grid h-5 w-5 place-items-center rounded-full bg-ink text-[11px] text-white"
                  : state === "doing"
                    ? "h-5 w-5 animate-pulse rounded-full bg-ink/20"
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
  );
}
