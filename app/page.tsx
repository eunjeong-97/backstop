"use client";

import { useState } from "react";
import { RequestForm } from "@/components/RequestForm";
import { ProgressSteps, type Phase } from "@/components/ProgressSteps";
import { ResultView } from "@/components/ResultView";
import { Stage1Preview } from "@/components/Stage1Preview";
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

/** 예시 모드에서 stage1을 못 쓸 때, 입력문에서 예산 한 줄을 찾아 그대로 보여준다. */
function findBudgetLine(text: string): string | undefined {
  const line = text
    .split("\n")
    .map((l) => l.trim().replace(/^[-·•]\s*/, ""))
    .find((l) => /(예산|금액)/.test(l) && /원/.test(l));
  if (!line) return undefined;
  // "예산:" 접두어를 떼고, 뒤에 붙은 부연 문장은 잘라 금액만 남긴다
  return line
    .replace(/^예산\s*[:：]?\s*/, "")
    .split(/\.\s|\.$/)[0]
    .trim();
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
  const [budget, setBudget] = useState<string | undefined>();
  const [stage1, setStage1] = useState<Stage1Result | null>(null);

  const busy = phase === "extract" || phase === "analyze";

  async function run() {
    setError(null);
    setResult(null);
    setStage1(null);
    try {
      // 1단계: 적힌 것만 구조화
      setPhase("extract");
      const s1 = await post<Stage1Result>("/api/extract", { text });
      if (s1.data?.project?.title) setTitle(s1.data.project.title);
      // 2단계를 기다리는 동안 읽을 수 있게 stage1 결과를 먼저 보여준다.
      // 예시 모드는 stage1이 껍데기라 보여줄 것이 없다.
      if (!s1.mocked && (s1.data?.explicit_tasks?.length ?? 0) > 0) setStage1(s1.data);
      // 실제 호출이면 stage1이 뽑은 예산 표기를, 예시 모드면 입력문에서 직접 찾는다
      const fromStage1 = s1.mocked ? "" : (s1.data?.project?.budget_text ?? "");
      setBudget(fromStage1 || findBudgetLine(text));

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

        <p className="mt-5 text-[15px] leading-relaxed sm:text-base">
          외주에서 손해를 보는 이유는 가격을 낮게 불러서가 아니라,{" "}
          <strong className="font-semibold">요청문에 안 적힌 작업을 견적에 못 넣어서</strong>
          입니다.
        </p>

        <div className="mt-5 rounded-[3px] border border-line bg-card p-4 text-sm leading-relaxed">
          <p className="text-sub">예를 들어 이런 한 줄 뒤에</p>
          <p className="mt-1.5 border-l-2 border-line pl-3 italic text-ink">
            “회원 데이터 이관”
          </p>
          <p className="mt-2.5 text-sub">
            기존 비밀번호를 새 시스템이 못 읽으면{" "}
            <strong className="font-semibold text-high">전 회원이 비밀번호를 다시 만들어야</strong>{" "}
            합니다. 운영 중인 서비스라면 사고입니다. 이런 걸 찾아 드립니다.
          </p>
        </div>
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

        {stage1 && phase === "analyze" && <Stage1Preview stage1={stage1} />}

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
            clientBudget={budget}
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
