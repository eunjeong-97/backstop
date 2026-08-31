"use client";

import { useState } from "react";
import { SEVERITY_LABEL, SLOT_LABEL, type HiddenTask } from "@/lib/types";

const SEV_STYLE: Record<HiddenTask["severity"], string> = {
  high: "bg-high/10 text-high",
  medium: "bg-mid/10 text-mid",
  low: "bg-low/10 text-low",
};

const CONFLICT_STYLE: Record<string, string> = {
  제외: "bg-high/10 text-high",
  애매: "bg-mid/10 text-mid",
  포함: "bg-low/10 text-low",
  미언급: "bg-low/10 text-low",
};

export function HiddenTaskCard({ task, index }: { task: HiddenTask; index: number }) {
  const [open, setOpen] = useState(false);
  const hasHours = task.hours_max > 0;

  return (
    <li className="card">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`badge ${SEV_STYLE[task.severity]}`}>{SEVERITY_LABEL[task.severity]}</span>
        <span className="badge bg-bg text-sub" title={SLOT_LABEL[task.slot]}>
          {task.slot} {SLOT_LABEL[task.slot]}
        </span>
        {task.confidence === "low" && (
          <span className="badge bg-bg text-sub">확인 필요</span>
        )}
        <span className="ml-auto text-xs text-sub">
          {hasHours ? `${task.hours_min}~${task.hours_max}시간` : "시간 환산 안 됨"}
        </span>
      </div>

      <h3 className="mt-2.5 font-semibold leading-snug">
        <span className="mr-1.5 text-sub">{index + 1}.</span>
        {task.task}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-sub">{task.why}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-sub">계약상</span>
        <span className={`badge ${CONFLICT_STYLE[task.contract_conflict] ?? "bg-bg text-sub"}`}>
          {task.contract_conflict}
        </span>
        {task.conflict_note && <span className="text-sub">{task.conflict_note}</span>}
      </div>

      {task.evidence_quote && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-xs font-medium text-sub underline underline-offset-4"
            aria-expanded={open}
          >
            {open ? "근거 숨기기" : "요청문 근거 보기"}
          </button>
          {open && (
            <blockquote className="mt-2 border-l-2 border-line pl-3 text-sm italic leading-relaxed text-sub">
              “{task.evidence_quote}”
            </blockquote>
          )}
        </div>
      )}
    </li>
  );
}
