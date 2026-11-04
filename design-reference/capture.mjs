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

// Playwright 번들 Chromium(145~155)은 보안 취약점이 있어 받지 않는다(2026-11-04 보안 공지).
// 패치된 시스템 Chrome만 샌드박스를 켜서 띄운다. 실행이 실패해도 샌드박스를 끄거나
// 번들 Chromium으로 바꿔 띄우지 않는다.
const BROWSER = { channel: 'chrome', chromiumSandbox: true };
// 취약점이 고쳐진 가장 낮은 Chrome 버전. 이보다 낮으면 페이지를 열지 않는다
const MIN_CHROME = '156.0.8078.73';

// 점으로 나눈 버전 비교: a가 b보다 낮으면 음수
function compareVersion(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

const browser = await chromium.launch(BROWSER);
const version = browser.version();
console.log(`브라우저: Chrome ${version} (${BROWSER.channel})`);
if (compareVersion(version, MIN_CHROME) < 0) {
  await browser.close();
  throw new Error(`Chrome ${version}은 보안 수정 전 버전이다. ${MIN_CHROME} 이상으로 올려야 한다`);
}
if (process.env.CAPTURE_CHECK_BROWSER_ONLY) {
  // 브라우저 설정만 확인하고 페이지는 열지 않는다
  await browser.close();
  process.exit(0);
}
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
