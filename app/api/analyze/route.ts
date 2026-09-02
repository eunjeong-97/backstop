// Stage 2 — 요청문에 "안 적힌 것"을 8개 자리로 훑어 찾아낸다. 제품의 핵심.
import { NextResponse } from "next/server";
import { callClaude, parseJson } from "@/lib/anthropic";
import { STAGE2_PROMPT } from "@/lib/prompts.generated";
import {
  clientKey,
  countRealCall,
  isCreditExhausted,
  rateLimited,
  shouldMock,
  validateInput,
} from "@/lib/guard";
import type { Envelope, Stage1Result, Stage2Result, WorkKind } from "@/lib/types";
import { matchSample } from "@/lib/sample-match";
import MOCK_PET from "@/mock/analyze.pet.json";
import MOCK_FESTIVAL from "@/mock/analyze.festival.json";
import MOCK_MALL from "@/mock/analyze.mall.json";

export const runtime = "nodejs";
export const maxDuration = 300;

const MOCK_BY_SAMPLE: Record<string, unknown> = {
  pet: MOCK_PET,
  festival: MOCK_FESTIVAL,
  mall: MOCK_MALL,
};

/** 입력이 어느 예시인지 찾아 그 예시의 분석 결과를 돌려준다. 못 찾으면 null. */
function mockForInput(text: string): Stage2Result | null {
  const hit = matchSample(text);
  if (!hit) return null;
  return (MOCK_BY_SAMPLE[hit.id] as Stage2Result | undefined) ?? null;
}

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
    const matched = mockForInput(body.text ?? "");
    const res: Envelope<Stage2Result> = {
      data: (matched ?? (MOCK_PET as unknown as Stage2Result)) as Stage2Result,
      mocked: true,
      // 붙여넣은 요청문은 분석하지 못하므로, 화면에 나오는 것이 남의 사례임을 분명히 알린다
      note: matched ? note : `${note ?? ""} 아래는 붙여넣으신 요청문이 아니라 준비된 예시 사례의 결과입니다.`.trim(),
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
    countRealCall();
    const raw = await callClaude(STAGE2_PROMPT, user);
    const data = parseJson<Stage2Result>(raw);
    const res: Envelope<Stage2Result> = { data, mocked: false };
    return NextResponse.json(res);
  } catch (e) {
    // 잔액 소진은 에러 화면 대신 예시 모드로 — 링크가 항상 무언가를 보여준다
    if (isCreditExhausted(e)) {
      const matched = mockForInput(body.text ?? "");
      const note = "일시적으로 예시 결과만 제공하고 있습니다.";
      const res: Envelope<Stage2Result> = {
        data: (matched ?? (MOCK_PET as unknown as Stage2Result)) as Stage2Result,
        mocked: true,
        note: matched ? note : `${note} 아래는 붙여넣으신 요청문이 아니라 준비된 예시 사례의 결과입니다.`,
      };
      return NextResponse.json(res);
    }
    const msg = e instanceof Error ? e.message : "알 수 없는 오류";
    return NextResponse.json({ error: `분석에 실패했습니다. ${msg}` }, { status: 502 });
  }
}
