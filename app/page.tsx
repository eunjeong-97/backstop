"use client";

import { useState } from "react";
import { RequestForm } from "@/components/RequestForm";
import { ProgressSteps, type Phase } from "@/components/ProgressSteps";
import { ResultView } from "@/components/ResultView";
import { DEFAULT_DAILY_RATE } from "@/lib/estimate";
import type { Envelope, Stage1Result, Stage2Result, WorkKind } from "@/lib/types";

async function post<T>(url: string, body: unknown): Promise<Envelope<T>> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error ?? "요청에 실패했습니다.");
  return json as Envelope<T>;
}

export default function Home() {
  const [text, setText] = useState("");
  const [kind, setKind] = useState<WorkKind>("web");
  const [rate, setRate] = useState(DEFAULT_DAILY_RATE);

  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Stage2Result | null>(null);
  const [mocked, setMocked] = useState(false);
  const [note, setNote] = useState<string | undefined>();
  const [title, setTitle] = useState("검토한 요청문");

  const busy = phase === "extract" || phase === "analyze";

  async function run() {
    setError(null);
    setResult(null);
    try {
      // 1단계: 적힌 것만 구조화
      setPhase("extract");
      const s1 = await post<Stage1Result>("/api/extract", { text });
      if (s1.data?.project?.title) setTitle(s1.data.project.title);

      // 2단계: 안 적힌 것 추론
      setPhase("analyze");
      const s2 = await post<Stage2Result>("/api/analyze", {
        text,
        kind,
        stage1: s1.data,
      });

      setMocked(s2.mocked);
      setNote(s2.note);
      setResult(s2.data);
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.");
      setPhase("error");
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-14">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">믿을구석</h1>
        <p className="mt-2 text-sub">
          혼자 일하는 사람의 사수. 지금은 견적부터 봐드립니다.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-sub">
          외주에서 손해를 보는 이유는 가격을 낮게 불러서가 아니라,{" "}
          <strong className="font-semibold text-ink">
            요청문에 안 적힌 작업을 견적에 못 넣어서
          </strong>
          입니다. 그 안 적힌 일을 찾아 드립니다.
        </p>
      </header>

      <section className="card">
        <RequestForm
          text={text}
          setText={setText}
          kind={kind}
          setKind={setKind}
          rate={rate}
          setRate={setRate}
          onSubmit={run}
          busy={busy}
        />
      </section>

      <div className="mt-6 space-y-6">
        <ProgressSteps phase={phase} />

        {error && (
          <div className="rounded-xl border border-high/30 bg-high/5 p-4 text-sm text-high">
            {error}
          </div>
        )}

        {result && phase === "done" && (
          <ResultView
            result={result}
            dailyRate={rate}
            title={title}
            mocked={mocked}
            note={note}
          />
        )}
      </div>

      <footer className="mt-14 border-t border-line pt-6 text-xs leading-relaxed text-sub">
        <p>
          결과는 참고용 초안입니다. 공수와 견적은 실제 계약 조건에 따라 달라질 수 있으니
          최종 판단은 직접 하세요.
        </p>
        <p className="mt-2">믿을구석(Backstop) · 원티드 AI Championship 2026 출품작</p>
      </footer>
    </main>
  );
}
