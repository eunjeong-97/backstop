// 예시 모드(API 키 없음·킬스위치)에서 입력이 어느 예시인지 찾는다.
//
// 예전에는 입력을 보지 않고 고정 결과 하나만 돌려줘서, 예시를 무엇을 눌러도
// 같은 화면이 나왔다. stage1(제목)과 stage2(분석)가 같은 기준으로 골라야
// 제목과 내용이 어긋나지 않으므로 여기 한 곳에 둔다.

import { SAMPLES, type Sample } from "@/samples";

const norm = (s: string) => s.replace(/\s+/g, " ").trim();

/** 사용자가 직접 붙여넣은 요청문이면 null. */
export function matchSample(text: string): Sample | null {
  const target = norm(text);
  if (!target) return null;
  return SAMPLES.find((s) => norm(s.text) === target) ?? null;
}
