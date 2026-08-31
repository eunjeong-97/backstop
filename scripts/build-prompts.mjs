// prompts/*.md 를 읽어 lib/prompts.generated.ts 로 인라인한다.
// 서버리스에서 런타임 fs 읽기는 파일 추적 누락 위험이 있어 빌드 시점에 코드로 굳힌다.
// prompts/*.md 가 정본이며, 이 스크립트가 만든 파일은 직접 수정하지 않는다.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

const stage1 = read("prompts/stage1_extract.md");
const stage2 = read("prompts/stage2_hidden.md");

const out = `// 자동 생성 파일 — 직접 수정하지 마세요.
// 원본: prompts/stage1_extract.md, prompts/stage2_hidden.md
// 갱신: node scripts/build-prompts.mjs (npm run dev / build 시 자동 실행)

export const STAGE1_PROMPT = ${JSON.stringify(stage1)};

export const STAGE2_PROMPT = ${JSON.stringify(stage2)};
`;

mkdirSync(join(root, "lib"), { recursive: true });
writeFileSync(join(root, "lib/prompts.generated.ts"), out);
console.log(
  `prompts.generated.ts 생성 — stage1 ${stage1.length}자 / stage2 ${stage2.length}자`
);
