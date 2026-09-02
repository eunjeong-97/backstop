// Stage 1 — 요청문에 "적힌 것"만 구조화한다. 추론은 하지 않는다.
import { NextResponse } from "next/server";
import { callClaude, parseJson } from "@/lib/anthropic";
import { STAGE1_PROMPT } from "@/lib/prompts.generated";
import {
  clientKey,
  countRealCall,
  isCreditExhausted,
  rateLimited,
  shouldMock,
  validateInput,
} from "@/lib/guard";
import type { Envelope, Stage1Result } from "@/lib/types";
import { matchSample } from "@/lib/sample-match";

export const runtime = "nodejs";
export const maxDuration = 300;

/** 예시 모드에서 쓰는 뼈대. 제목은 어느 예시인지에 따라 채운다. */
function mockStage1(text: string): Stage1Result {
  const sample = matchSample(text);
  return {
  project: {
    title: sample?.label ?? "붙여넣은 요청문",
    budget_text: "예시 데이터입니다",
    period_text: "예시 데이터입니다",
    deadline_fixed: false,
    deadline_note: "",
  },
  explicit_tasks: [],
  excluded_items: [],
  client_profile: {
    has_developer: false,
    decision_maker: "",
    prepared: [],
    preparing: [],
  },
  };
}

export async function POST(request: Request) {
  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const invalid = validateInput(body.text);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  const { mock, note } = shouldMock();
  if (mock) {
    const res: Envelope<Stage1Result> = { data: mockStage1(body.text ?? ""), mocked: true, note };
    return NextResponse.json(res);
  }

  if (rateLimited(clientKey(request))) {
    return NextResponse.json(
      { error: "잠시 뒤에 다시 시도해 주세요. (시간당 이용 횟수 제한)" },
      { status: 429 }
    );
  }

  try {
    countRealCall();
    const raw = await callClaude(STAGE1_PROMPT, `# 요청문\n\n${body.text}`);
    const data = parseJson<Stage1Result>(raw);
    const res: Envelope<Stage1Result> = { data, mocked: false };
    return NextResponse.json(res);
  } catch (e) {
    // 잔액 소진은 에러 화면 대신 예시 모드로 — 링크가 항상 무언가를 보여준다
    if (isCreditExhausted(e)) {
      const res: Envelope<Stage1Result> = {
        data: mockStage1(body.text ?? ""),
        mocked: true,
        note: "일시적으로 예시 결과만 제공하고 있습니다.",
      };
      return NextResponse.json(res);
    }
    const msg = e instanceof Error ? e.message : "알 수 없는 오류";
    return NextResponse.json({ error: `분석에 실패했습니다. ${msg}` }, { status: 502 });
  }
}
