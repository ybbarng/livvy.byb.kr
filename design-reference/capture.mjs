// 원본/새 사이트의 디자인 스크린샷을 캡처하는 스크립트.
// 사용법:
//   node capture.mjs              → 원본 라이브(https://livvy.byb.kr)를 reference/ 에 저장
//   node capture.mjs http://localhost:4321 current  → 새 사이트를 current/ 에 저장
// 저장 후 compare.mjs 로 pixelmatch diff 를 생성한다.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const baseUrl = process.argv[2] || 'https://livvy.byb.kr';
const outDir = join(__dirname, process.argv[3] || 'reference');

// 대표 페이지(sitemap 기준): 각 템플릿을 최소 하나씩 + 한글 slug/코드/이미지 케이스 포함
const pages = [
  ['home', '/'],
  ['post-code', '/posts/hello-tls-1-3/'],
  ['post-ko', '/posts/흔하지만-흔하지-않은-붕어빵/'],
  ['post-image', '/posts/john-legend-ticket/'],
  ['categories', '/categories/'],
  ['category-study', '/categories/study/'],
  ['tags', '/tags/'],
  ['tag-tls', '/tags/tls/'],
  ['author-ybbarng', '/authors/ybbarng/'],
  ['author-livvy', '/authors/livvy/'],
  ['page-about', '/pages/about-ybbarng/'],
  ['notfound', '/this-page-does-not-exist/'],
];

const viewports = [
  ['desktop', 1280, 900],
  ['mobile', 375, 812],
];

const browser = await chromium.launch();
await mkdir(outDir, { recursive: true });

for (const [vName, width, height] of viewports) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  for (const [name, path] of pages) {
    const url = baseUrl + path;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      // 폰트/이미지 로딩 안정화
      await page.waitForTimeout(800);
      const file = join(outDir, `${name}-${vName}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`✓ ${name}-${vName}`);
    } catch (e) {
      console.log(`✗ ${name}-${vName}: ${e.message.split('\n')[0]}`);
    }
  }
  await context.close();
}

await browser.close();
console.log(`\n완료 → ${outDir}`);
