// Stage 2 — 요청문에 "안 적힌 것"을 8개 자리로 훑어 찾아낸다. 제품의 핵심.
import { NextResponse } from "next/server";
import { callClaude, parseJson } from "@/lib/anthropic";
import { STAGE2_PROMPT } from "@/lib/prompts.generated";
import { clientKey, rateLimited, shouldMock, validateInput } from "@/lib/guard";
import type { Envelope, Stage1Result, Stage2Result, WorkKind } from "@/lib/types";
import MOCK_STAGE2 from "@/mock/analyze.sample.json";

export const runtime = "nodejs";
export const maxDuration = 300;

const KIND_HINT: Record<WorkKind, string> = {
  web: "이 과제는 웹 서비스 개발이다.",
  app: "이 과제는 모바일 앱 개발이다. 스토어 심사 규정을 특히 주의 깊게 본다.",
  design: "이 과제는 디자인 작업이다. 산출물 형식과 수정 횟수를 특히 주의 깊게 본다.",
};

export async function POST(request: Request) {
  let body: { text?: string; kind?: WorkKind; stage1?: Stage1Result };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const invalid = validateInput(body.text);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  const { mock, note } = shouldMock();
  if (mock) {
    const res: Envelope<Stage2Result> = {
      data: MOCK_STAGE2 as unknown as Stage2Result,
      mocked: true,
      note,
    };
    return NextResponse.json(res);
  }

  if (rateLimited(clientKey(request))) {
    return NextResponse.json(
      { error: "잠시 뒤에 다시 시도해 주세요. (시간당 이용 횟수 제한)" },
      { status: 429 }
    );
  }

  const kind = body.kind ?? "web";
  const user = [
    KIND_HINT[kind],
    "",
    "# 요청문",
    "",
    body.text,
    "",
    "# Stage 1 결과",
    "",
    "```json",
    JSON.stringify(body.stage1 ?? {}, null, 1),
    "```",
  ].join("\n");

  try {
    const raw = await callClaude(STAGE2_PROMPT, user);
    const data = parseJson<Stage2Result>(raw);
    const res: Envelope<Stage2Result> = { data, mocked: false };
    return NextResponse.json(res);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "알 수 없는 오류";
    return NextResponse.json({ error: `분석에 실패했습니다. ${msg}` }, { status: 502 });
  }
}
