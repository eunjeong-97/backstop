// 비용·안전 가드. API 키가 공개 링크 뒤에 있으므로 여기를 통과하지 않으면 호출하지 않는다.

export const MAX_INPUT_CHARS = 6000;
export const MAX_OUTPUT_TOKENS = 8000;

/** 서버리스 인스턴스 단위의 best-effort 제한. 완벽하지 않음을 README에 명시했다. */
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip")) ?? "unknown";
}

export function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

export function killSwitchOn(): boolean {
  return process.env.BACKSTOP_DISABLED === "1";
}

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * 실제 API를 부를 수 있는 상태인지 판정한다.
 * 키가 없거나 킬스위치가 켜져 있으면 mock 으로 떨어진다 — 배포 링크가 항상 무언가를 보여주도록.
 */
export function shouldMock(): { mock: boolean; note?: string } {
  if (killSwitchOn()) return { mock: true, note: "일시적으로 예시 결과만 제공하고 있습니다." };
  if (!hasApiKey()) return { mock: true, note: "예시 결과입니다. 실제 분석은 준비 중입니다." };
  return { mock: false };
}

export function validateInput(text: unknown): string | null {
  if (typeof text !== "string" || text.trim().length === 0) {
    return "요청문을 입력해 주세요.";
  }
  if (text.length > MAX_INPUT_CHARS) {
    return `요청문이 너무 깁니다. ${MAX_INPUT_CHARS.toLocaleString()}자 이내로 줄여 주세요. (현재 ${text.length.toLocaleString()}자)`;
  }
  return null;
}
