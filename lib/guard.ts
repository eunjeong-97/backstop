// 비용·안전 가드. API 키가 공개 링크 뒤에 있으므로 여기를 통과하지 않으면 호출하지 않는다.

export const MAX_INPUT_CHARS = 6000;
// 8000이었을 때 Stage 2 출력이 상한에서 잘려 JSON 파싱이 깨졌다 (2026-09-02 실측: output=8000 == 상한)
export const MAX_OUTPUT_TOKENS = 16000;

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

/**
 * 하루 전체 실호출 상한 — IP 제한이 새어도(다중 IP 공격 등) 총량은 여기서 막는다.
 * 인스턴스 단위 best-effort. 최종 방어선은 콘솔의 선불 크레딧 잔액이다.
 * 1건당 실측 비용 ~$0.20(2026-09-02), 분석 1건 = 호출 2회 → 60회 ≈ 분석 30건 ≈ $6/일.
 */
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_CALLS_PER_DAY = 60;
let dayStart = Date.now();
let dayCalls = 0;

export function dailyBudgetExceeded(): boolean {
  if (Date.now() - dayStart > DAY_MS) {
    dayStart = Date.now();
    dayCalls = 0;
  }
  return dayCalls >= MAX_CALLS_PER_DAY;
}

/** 실제 API 호출 직전에 1회씩 센다. mock 응답은 세지 않는다. */
export function countRealCall(): void {
  dayCalls += 1;
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
  if (dailyBudgetExceeded())
    return { mock: true, note: "오늘 준비된 분석 횟수를 모두 사용했습니다. 예시 결과를 보여드립니다." };
  return { mock: false };
}

/**
 * API 오류 중 "잔액 소진"만 골라낸다. 이 경우는 에러 화면 대신 예시 모드로 넘긴다 —
 * 심사 기간 중 크레딧이 바닥나도 링크가 에러가 아니라 예시를 보여주도록.
 * (2026-09-02 실발생: 400 "Your credit balance is too low to access the Anthropic API")
 */
export function isCreditExhausted(e: unknown): boolean {
  return e instanceof Error && e.message.includes("credit balance is too low");
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
