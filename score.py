#!/usr/bin/env python3
"""out/*.stage2.json 을 정답지와 대조해 재현율(놓친 비율)을 낸다.

사용법: python3 score.py
"""
import json, pathlib, sys

ROOT = pathlib.Path(__file__).parent
golden = json.load(open(ROOT/"golden/answers/golden.json"))

def haystack(item):
    return " ".join(str(item.get(k, "")) for k in
                    ("task", "why", "conflict_note", "evidence_quote")).lower()

def matched(g, model_items):
    terms = [t.lower() for t in g["key_terms"]]
    for m in model_items:
        h = haystack(m)
        if any(t in h for t in terms):
            return m
    return None

rows, total, hit = [], 0, 0
htotal, hhit = 0, 0
for c in golden["cases"]:
    f = ROOT/"out"/f"{c['id']}.stage2.json"
    if not f.exists():
        rows.append((c["id"], c["title"], None, None, None, []))
        continue
    r = json.loads(f.read_text())
    items = r.get("hidden_tasks", [])
    misses = []
    n = nh = 0
    for g in c["hidden"]:
        m = matched(g, items)
        if m: n += 1
        else: misses.append(g)
        if g["severity"] == "high":
            htotal += 1
            if m: nh += 1; hhit += 1
    total += len(c["hidden"]); hit += n
    verdict_ok = r.get("verdict", {}).get("decision", "").startswith(c["verdict"][:2])
    rows.append((c["id"], c["title"], f"{n}/{len(c['hidden'])}", len(items),
                 "O" if verdict_ok else "X", misses))

print(f"{'건':<8} {'제목':<34} {'적중':<7} {'모델출력':<8} {'판정':<4}")
print("-" * 70)
for cid, title, sc, cnt, v, misses in rows:
    if sc is None:
        print(f"{cid:<8} {title[:32]:<34} {'미실행':<7}")
        continue
    print(f"{cid:<8} {title[:32]:<34} {sc:<7} {cnt:<8} {v:<4}")
    for g in misses:
        print(f"         └ 놓침 [{g['severity']}/{g['slot']}] {g['task']}")

if total:
    print("-" * 70)
    print(f"전체 재현율 : {hit}/{total} = {hit/total*100:.0f}%")
    if htotal:
        print(f"high 재현율 : {hhit}/{htotal} = {hhit/htotal*100:.0f}%  ← 이 숫자가 제출 문서에 들어간다")
else:
    print("실행 결과가 없습니다. 먼저 run.py 를 실행하세요.")
