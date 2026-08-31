"use client";

import { SAMPLES } from "@/samples";
import { MAX_INPUT_CHARS } from "@/lib/guard";
import type { WorkKind } from "@/lib/types";

const KINDS: { value: WorkKind; label: string }[] = [
  { value: "web", label: "웹" },
  { value: "app", label: "앱" },
  { value: "design", label: "디자인" },
];

export function RequestForm({
  text,
  setText,
  kind,
  setKind,
  rate,
  setRate,
  onSubmit,
  busy,
}: {
  text: string;
  setText: (v: string) => void;
  kind: WorkKind;
  setKind: (v: WorkKind) => void;
  rate: number;
  setRate: (v: number) => void;
  onSubmit: () => void;
  busy: boolean;
}) {
  const over = text.length > MAX_INPUT_CHARS;

  return (
    <div className="space-y-5">
      <div>
        <p className="label">처음이라면 예시로 먼저 해보세요</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {SAMPLES.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={busy}
              onClick={() => {
                setText(s.text);
                setKind(s.kind);
              }}
              className="btn-ghost w-full min-h-11 flex-col items-start justify-center gap-0.5 !px-3.5 !py-2.5 text-left disabled:opacity-40 sm:w-auto"
            >
              <span className="text-sm font-medium">{s.label}</span>
              <span className="text-xs text-sub">{s.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="req" className="label">
          클라이언트가 보낸 요청문
        </label>
        <textarea
          id="req"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={busy}
          rows={8}
          placeholder="크몽·위시켓 등에서 받은 요청 내용을 그대로 붙여넣으세요."
          className="w-full resize-y rounded-xl border border-line bg-white p-4 text-base leading-relaxed outline-none placeholder:text-sub/60 focus:border-ink/30 disabled:opacity-60 sm:min-h-[22rem] sm:text-sm"
        />
        <div className={`mt-1 text-right text-xs ${over ? "text-high" : "text-sub"}`}>
          {text.length.toLocaleString()} / {MAX_INPUT_CHARS.toLocaleString()}자
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="label">작업 종류</span>
          <div className="flex gap-2">
            {KINDS.map((k) => (
              <button
                key={k.value}
                type="button"
                disabled={busy}
                onClick={() => setKind(k.value)}
                aria-pressed={kind === k.value}
                className={
                  kind === k.value
                    ? "btn min-h-11 flex-1 bg-ink text-white !px-4 sm:flex-none"
                    : "btn-ghost min-h-11 flex-1 !px-4 disabled:opacity-40 sm:flex-none"
                }
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="rate" className="label">
            내 일당 (원)
          </label>
          <input
            id="rate"
            type="number"
            min={0}
            step={10000}
            value={rate}
            disabled={busy}
            onChange={(e) => setRate(Number(e.target.value) || 0)}
            className="min-h-11 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-base outline-none focus:border-ink/30 disabled:opacity-60 sm:text-sm"
          />
          <p className="mt-1 text-xs text-sub">견적 환산에만 씁니다. 공수 추정에는 영향이 없습니다.</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={busy || over || text.trim().length === 0}
        className="btn-primary w-full !py-3 text-base"
      >
        {busy ? "찾는 중…" : "안 적힌 일 찾기"}
      </button>
    </div>
  );
}
