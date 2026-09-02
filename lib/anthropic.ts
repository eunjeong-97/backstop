// Anthropic Messages API 호출 래퍼. SDK 없이 fetch 만 쓴다(의존성 최소화).
// API 키는 이 파일이 도는 서버 라우트에서만 읽힌다 — 클라이언트로 나가지 않는다.

import { MAX_OUTPUT_TOKENS } from "./guard";

const ENDPOINT = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.BACKSTOP_MODEL ?? "claude-sonnet-5";

export async function callClaude(system: string, user: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY 가 설정되지 않았습니다.");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      // 지시문은 모든 요청에서 동일하므로 캐싱한다. 5분 안에 다음 호출이 오면
      // 그 부분 입력 요금이 ~90% 할인된다 (1,024토큰 미만이면 조용히 무시됨).
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Claude API 오류 ${res.status}: ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as {
    content?: { text?: string }[];
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
    };
  };
  // [임시 계측] 1건당 비용·캐시 적중 실측용 — 측정 끝나면 제거한다
  const u = json.usage;
  console.log(
    `[usage] input=${u?.input_tokens} output=${u?.output_tokens} cache_write=${u?.cache_creation_input_tokens ?? 0} cache_read=${u?.cache_read_input_tokens ?? 0}`
  );
  return (json.content ?? []).map((b) => b.text ?? "").join("");
}

/** 모델이 코드펜스나 서두를 붙여도 JSON 본문만 뽑아낸다. */
export function parseJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error("응답에서 JSON을 찾지 못했습니다.");
  }
  return JSON.parse(raw.slice(start, end + 1)) as T;
}
