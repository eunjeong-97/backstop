import type { Stage2Result } from "@/lib/types";

export function QuestionList({ questions }: { questions: Stage2Result["questions"] }) {
  if (!questions?.length) return null;
  const sorted = [...questions].sort(
    (a, b) => Number(b.blocking) - Number(a.blocking)
  );

  return (
    <ol className="space-y-3">
      {sorted.map((q, i) => (
        <li key={i} className="card">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-sm font-semibold text-sub">{i + 1}</span>
            <div className="min-w-0">
              <p className="font-medium leading-snug">
                {q.q}
                {q.blocking && (
                  <span className="badge ml-2 bg-high/10 text-high align-middle">필수</span>
                )}
              </p>
              {q.why && <p className="mt-1 text-sm text-sub">{q.why}</p>}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
