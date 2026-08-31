#!/usr/bin/env python3
"""홀드아웃 오염 검사.

홀드아웃으로 지정한 요청문(golden/holdout.txt)의 문장이
프롬프트(prompts/*.md)에 인용됐는지 검사한다.

인용됐다면 그 요청문은 시험 문제로서 무효다 — 답을 교과서에 적어놓고
그 시험을 보는 상태가 되기 때문이다. 프롬프트를 고칠 때마다 돌린다.

사용: python3 check_holdout.py
종료 코드: 오염 없으면 0, 있으면 1
"""

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent

# 이보다 짧은 조각은 일반 용어("요구사항 정의서" 등)일 가능성이 커서 무시한다.
# 실제 인용은 이보다 길게 일어난다("격주 스테이징 시연 방식으로 협업을 희망합니다").
MIN_LEN = 14

# 요청문 원문이 아니라 업계 공통 용어라서 겹쳐도 오염이 아닌 것.
# 오탐이 나오면 여기에 추가한다. 추가할 때는 "이게 이 요청문 고유 표현인가"를 먼저 따진다.
ALLOWED = [
    "개인정보 처리방침",
    "이용약관",
]


def load_holdout_ids():
    path = ROOT / "golden" / "holdout.txt"
    ids = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        ids.append(line.split()[0])
    return ids


def load_request(request_id):
    matches = sorted((ROOT / "golden" / "requests").glob(f"*_{request_id}.txt"))
    if not matches:
        return None, None
    return matches[0].name, matches[0].read_text(encoding="utf-8")


def clauses(text):
    """문장·절 단위로 쪼갠다. 인용은 보통 이 단위로 일어난다."""
    parts = re.split(r"[\n。.!?！？·/|()\[\]“”\"']|,\s|、|:\s|;", text)
    out = set()
    for part in parts:
        part = part.strip(" -—:·~,")
        if len(part) < MIN_LEN:
            continue
        if any(a in part for a in ALLOWED) and len(part) < MIN_LEN + 10:
            continue
        out.add(part)
    return out


def main():
    prompt_files = sorted((ROOT / "prompts").glob("*.md"))
    if not prompt_files:
        print("prompts/*.md 를 찾지 못했다.", file=sys.stderr)
        return 2
    prompt_text = "\n".join(p.read_text(encoding="utf-8") for p in prompt_files)

    # 인자를 주면 그 요청문만 임시로 검사한다(검사기 자체가 작동하는지 확인할 때 쓴다).
    ids = sys.argv[1:] or load_holdout_ids()
    if not ids:
        print("golden/holdout.txt 에 지정된 요청문이 없다.", file=sys.stderr)
        return 2

    print(f"검사 대상 프롬프트: {', '.join(p.name for p in prompt_files)}")
    print(f"홀드아웃 {len(ids)}건: {', '.join(ids)}\n")

    total_hits = 0
    for request_id in ids:
        name, text = load_request(request_id)
        if text is None:
            print(f"  [!] {request_id} — 요청문 파일을 찾지 못했다")
            total_hits += 1
            continue
        hits = sorted((c for c in clauses(text) if c in prompt_text), key=len, reverse=True)
        if hits:
            total_hits += len(hits)
            print(f"  [오염] {name} — 프롬프트에 인용된 문장 {len(hits)}건")
            for h in hits[:10]:
                print(f"         · {h[:70]}")
        else:
            print(f"  [정상] {name}")

    print()
    if total_hits:
        print(f"오염 {total_hits}건. 이 요청문은 점수 측정에 쓸 수 없다.")
        print("프롬프트에서 해당 문장을 빼거나, 다른 요청문을 홀드아웃으로 교체할 것.")
        return 1

    print("오염 없음. 홀드아웃 3건은 시험 문제로 유효하다.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
