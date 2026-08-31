"use client";

import { useMemo, useState } from "react";
import type { Stage2Result } from "@/lib/types";
import { bySeverity, sumHours, toPlainText, toQuote } from "@/lib/estimate";
import { HiddenTaskCard } from "./HiddenTaskCard";
import { QuestionList } from "./QuestionList";
import { VerdictBanner } from "./VerdictBanner";
import { SummaryStrip } from "./SummaryStrip";

export function ResultView({
  result,
  dailyRate,
  title,
  mocked,
  note,
  clientBudget,
}: {
  result: Stage2Result;
  dailyRate: number;
  title: string;
  mocked: boolean;
  note?: string;
  clientBudget?: string;
}) {
  const [copied, setCopied] = useState(false);

  const tasks = useMemo(
    () => [...(result.hidden_tasks ?? [])].sort(bySeverity),
    [result.hidden_tasks]
  );
  const hours = useMemo(() => sumHours(tasks), [tasks]);
  const quote = useMemo(() => toQuote(hours, dailyRate), [hours, dailyRate]);
  const highCount = tasks.filter((t) => t.severity === "high").length;

  async function copyAll() {
    const text = toPlainText({
      title,
      tasks,
      hours,
      quote,
      questions: result.questions ?? [],
      verdict: result.verdict,
      blockers: result.eligibility_blockers ?? [],
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-8">
      {mocked && (
        <div className="rounded-xl border border-mid/30 bg-mid/5 p-4 text-sm text-mid">
          {note ?? "예시 결과입니다."} 아래 내용은 실제 분석이 아니라 미리 준비된 예시입니다.
        </div>
      )}

      {result.eligibility_blockers?.length > 0 && (
        <section className="rounded-xl border border-high/30 bg-high/5 p-5">
          <h2 className="font-bold text-high">먼저 확인하세요 — 참여 자격 제한</h2>
          <ul className="mt-2 space-y-2 text-sm text-high/90">
            {result.eligibility_blockers.map((b, i) => (
              <li key={i}>
                <p className="font-medium">{b.blocker}</p>
                {b.evidence_quote && (
                  <p className="mt-1 italic opacity-80">“{b.evidence_quote}”</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <SummaryStrip
        title={title}
        verdict={result.verdict}
        tasks={tasks}
        hours={hours}
        quote={quote}
        dailyRate={dailyRate}
        clientBudget={clientBudget}
      />

      <VerdictBanner verdict={result.verdict} />

      <section>
        <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-lg font-bold">요청문에 없는 작업 {tasks.length}개</h2>
          {highCount > 0 && (
            <span className="text-sm text-high">그중 심각 {highCount}개</span>
          )}
        </div>
        <ul className="space-y-3">
          {tasks.map((t, i) => (
            <HiddenTaskCard key={t.id ?? i} task={t} index={i} />
          ))}
        </ul>
      </section>

      {/* 공수·견적은 계기판(SummaryStrip) 안으로 올렸다.
          목록을 다 지나야 금액이 보이면 "30초 안에 판단"이 안 된다. */}

      <section>
        <h2 className="mb-3 text-lg font-bold">계약 전에 물어봐야 할 것</h2>
        <QuestionList questions={result.questions ?? []} />
      </section>

      <div className="flex justify-center pb-4">
        <button
          type="button"
          onClick={copyAll}
          className="btn-ghost min-h-11 w-full sm:w-auto"
        >
          {copied ? "복사했습니다" : "결과 전체 복사 (제안서용)"}
        </button>
      </div>
    </div>
  );
}
