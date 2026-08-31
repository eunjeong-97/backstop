// 2단 파이프라인의 입출력 타입. prompts/*.md 의 출력 스키마와 1:1로 대응한다.

export type Slot = "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8";
export type Severity = "high" | "medium" | "low";
export type Confidence = "high" | "medium" | "low";
export type Conflict = "포함" | "제외" | "애매" | "미언급";
export type WorkKind = "web" | "app" | "design";

/** 8개 자리 — 숨은 작업이 숨는 위치. UI 배지와 프롬프트가 공유한다. */
export const SLOT_LABEL: Record<Slot, string> = {
  S1: "한 줄로 적힌 큰 일",
  S2: "준비 중이라고 적힌 것",
  S3: "우리가 직접 하겠다는 것",
  S4: "아직 안 정했다는 것",
  S5: "범위 밖 인접 시스템",
  S6: "법적·행정 요건",
  S7: "기다리는 시간",
  S8: "못 미루는 날짜",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  high: "심각",
  medium: "주의",
  low: "참고",
};

export interface ExplicitTask {
  id: string;
  task: string;
  quote: string;
  in_scope: boolean;
  certainty: "clear" | "unclear";
}

export interface Stage1Result {
  project: {
    title: string;
    budget_text: string;
    period_text: string;
    deadline_fixed: boolean;
    deadline_note: string;
  };
  explicit_tasks: ExplicitTask[];
  excluded_items: { item: string; quote: string }[];
  client_profile: {
    has_developer: boolean;
    decision_maker: string;
    prepared: string[];
    preparing: string[];
  };
}

export interface HiddenTask {
  id: string;
  task: string;
  slot: Slot;
  why: string;
  evidence_quote: string;
  contract_conflict: Conflict;
  conflict_note: string;
  /** 공수는 항상 범위로만 다룬다. 단일 값을 쓰지 않는다. */
  hours_min: number;
  hours_max: number;
  severity: Severity;
  confidence: Confidence;
}

export interface Stage2Result {
  eligibility_blockers: { blocker: string; evidence_quote: string }[];
  hidden_tasks: HiddenTask[];
  questions: { q: string; why: string; blocking: boolean }[];
  verdict: {
    decision: string;
    reason: string;
    conditions: string[];
  };
}

/** mock 응답인지 실제 호출인지 화면에 알리기 위한 봉투 */
export interface Envelope<T> {
  data: T;
  mocked: boolean;
  note?: string;
}
