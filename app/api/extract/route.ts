// Stage 1 — 요청문에 "적힌 것"만 구조화한다. 추론은 하지 않는다.
import { NextResponse } from "next/server";
import { callClaude, parseJson } from "@/lib/anthropic";
import { STAGE1_PROMPT } from "@/lib/prompts.generated";
import { clientKey, rateLimited, shouldMock, validateInput } from "@/lib/guard";
import type { Envelope, Stage1Result } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const MOCK_STAGE1: Stage1Result = {
  project: {
    title: "예시 요청문",
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
    const res: Envelope<Stage1Result> = { data: MOCK_STAGE1, mocked: true, note };
    return NextResponse.json(res);
  }

  if (rateLimited(clientKey(request))) {
    return NextResponse.json(
      { error: "잠시 뒤에 다시 시도해 주세요. (시간당 이용 횟수 제한)" },
      { status: 429 }
    );
  }

  try {
    const raw = await callClaude(STAGE1_PROMPT, `# 요청문\n\n${body.text}`);
    const data = parseJson<Stage1Result>(raw);
    const res: Envelope<Stage1Result> = { data, mocked: false };
    return NextResponse.json(res);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "알 수 없는 오류";
    return NextResponse.json({ error: `분석에 실패했습니다. ${msg}` }, { status: 502 });
  }
}
