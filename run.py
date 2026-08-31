#!/usr/bin/env python3
"""요청문 → Stage1(명시 작업) → Stage2(숨은 작업) 실행.

사용법:
  export ANTHROPIC_API_KEY=sk-...
  python3 run.py            # 정답지가 있는 5건만
  python3 run.py --all      # golden/requests 전체
  python3 run.py 157964     # 특정 건만
"""
import json, os, re, sys, urllib.request, pathlib, time

ROOT = pathlib.Path(__file__).parent
MODEL = os.environ.get("BACKSTOP_MODEL", "claude-sonnet-5")
KEY = os.environ.get("ANTHROPIC_API_KEY")

def call(system, user, max_tokens=8000):
    if not KEY:
        sys.exit("ANTHROPIC_API_KEY 가 없습니다. export ANTHROPIC_API_KEY=... 후 다시 실행하세요.")
    body = json.dumps({
        "model": MODEL, "max_tokens": max_tokens,
        "system": system,
        "messages": [{"role": "user", "content": user}],
    }).encode()
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages", data=body,
        headers={"content-type": "application/json", "x-api-key": KEY,
                 "anthropic-version": "2023-06-01"})
    with urllib.request.urlopen(req, timeout=300) as r:
        d = json.loads(r.read())
    return "".join(b.get("text", "") for b in d.get("content", []))

def parse_json(text):
    m = re.search(r"```(?:json)?\s*(.*?)```", text, re.S)
    raw = m.group(1) if m else text
    i, j = raw.find("{"), raw.rfind("}")
    return json.loads(raw[i:j+1])

def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    use_all = "--all" in sys.argv
    golden = json.load(open(ROOT/"golden/answers/golden.json"))
    s1 = (ROOT/"prompts/stage1_extract.md").read_text()
    s2 = (ROOT/"prompts/stage2_hidden.md").read_text()
    outdir = ROOT/"out"; outdir.mkdir(exist_ok=True)

    if use_all:
        targets = [(p.stem.split("_")[-1], p) for p in sorted((ROOT/"golden/requests").glob("*.txt"))]
    else:
        targets = [(c["id"], ROOT/"golden/requests"/c["file"]) for c in golden["cases"]]
    if args:
        targets = [t for t in targets if t[0] in args]
    if not targets:
        sys.exit("대상이 없습니다.")

    for cid, path in targets:
        text = path.read_text()
        print(f"\n=== {cid} {path.name} ===")
        t0 = time.time()
        r1 = parse_json(call(s1, f"# 요청문\n\n{text}"))
        (outdir/f"{cid}.stage1.json").write_text(json.dumps(r1, ensure_ascii=False, indent=1))
        print(f"  stage1 완료 — 명시 작업 {len(r1.get('explicit_tasks', []))}개")

        u2 = (f"# 요청문\n\n{text}\n\n# Stage 1 결과\n\n"
              f"```json\n{json.dumps(r1, ensure_ascii=False, indent=1)}\n```")
        r2 = parse_json(call(s2, u2))
        (outdir/f"{cid}.stage2.json").write_text(json.dumps(r2, ensure_ascii=False, indent=1))
        h = r2.get("hidden_tasks", [])
        print(f"  stage2 완료 — 숨은 작업 {len(h)}개 / 판정 {r2.get('verdict',{}).get('decision','?')}"
              f" ({time.time()-t0:.0f}초)")

if __name__ == "__main__":
    main()
