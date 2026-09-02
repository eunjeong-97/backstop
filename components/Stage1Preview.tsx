import type { Stage1Result } from "@/lib/types";

/**
 * Stage 2를 기다리는 동안 Stage 1 결과(요청문에 적힌 것)를 먼저 보여준다.
 * 2분 가까운 대기를 "1부를 읽는 시간"으로 바꾸는 것이 목적 —
 * 사용자는 자기 요청문이 어떻게 읽혔는지 확인하며 기다린다.
 * 예시 모드는 stage1이 비어 있으므로 page.tsx에서 아예 렌더하지 않는다.
 */
export function Stage1Preview({ stage1 }: { stage1: Stage1Result }) {
  const tasks = stage1.explicit_tasks ?? [];
  const excluded = stage1.excluded_items ?? [];
  const { budget_text, period_text } = stage1.project ?? {};

  return (
    <section className="card space-y-4">
      <div>
        <h3 className="font-semibold">1부 — 요청문에서 읽어낸 것</h3>
        <p className="mt-1 text-sm text-sub">
          글자로 적힌 내용만 정리했습니다. 안 적힌 작업은 지금 찾는 중이니, 그동안 이
          정리가 요청문과 맞는지 확인해 보세요.
        </p>
      </div>

      {(budget_text || period_text) && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {budget_text && (
            <p>
              <span className="text-mute">금액 표기</span>{" "}
              <span className="font-medium">{budget_text}</span>
            </p>
          )}
          {period_text && (
            <p>
              <span className="text-mute">기간 표기</span>{" "}
              <span className="font-medium">{period_text}</span>
            </p>
          )}
        </div>
      )}

      {tasks.length > 0 && (
        <div>
          <p className="text-sm font-medium">명시된 작업 {tasks.length}건</p>
          <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
            {tasks.map((t) => (
              <li key={t.id} className="flex gap-2">
                <span aria-hidden className="text-mute">
                  ·
                </span>
                <span>
                  {t.task}
                  {t.certainty === "unclear" && (
                    <span className="ml-1.5 text-xs text-mid">표현이 모호함</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {excluded.length > 0 && (
        <div>
          <p className="text-sm font-medium">범위에서 뺀다고 적힌 것 {excluded.length}건</p>
          <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-sub">
            {excluded.map((x, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="text-mute">
                  ·
                </span>
                <span>{x.item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
