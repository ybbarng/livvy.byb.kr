// Sveltia CMS /admin 을 자동 조작해 이미지 첨부 문제를 재현·디버깅한다.
// 실행: set -a; source .env; set +a; node scripts/cms-test/run.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) throw new Error('GITHUB_TOKEN 없음');
const shot = (page, name) => page.screenshot({ path: join(__dirname, name), fullPage: true });

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', (m) => console.log('[console]', m.type(), m.text().slice(0, 160)));
page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 160)));
// 토큰 입력이 브라우저 prompt 로 뜨는 경우 대비
page.on('dialog', async (d) => {
  console.log('[dialog]', d.type(), '|', d.message().slice(0, 80));
  if (d.type() === 'prompt') await d.accept(TOKEN);
  else await d.accept();
});

console.log('→ /admin 접속');
await page.goto('https://livvy.byb.kr/admin/', { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(5000);

console.log('→ Access Token 로그인 버튼 클릭');
await page.getByRole('button', { name: /Sign In Using Access Token/i }).click();
const dialog = page.locator('dialog[aria-label*="Access Token"]');
await dialog.waitFor({ state: 'visible', timeout: 15000 });
await page.waitForTimeout(1000);
await shot(page, '02-dialog.png');

console.log('→ dialog 안 토큰 입력');
const input = dialog.locator('input, textarea');
console.log('dialog 입력 필드 수:', await input.count());
await input.first().fill(TOKEN);
await page.waitForTimeout(500);
// dialog 안 제출 버튼
const submit = dialog.getByRole('button', { name: /sign in|log in|submit|확인|continue|ok/i });
if (await submit.count()) {
  await submit.first().click();
} else {
  await input.first().press('Enter');
}

console.log('→ 로그인 처리 대기');
await page.waitForTimeout(6000);
await shot(page, '03-after-login.png');

const btns = await page.locator('button, a, [role="button"]').allTextContents();
console.log('로그인 후 요소:', JSON.stringify(btns.filter((t) => t.trim()).slice(0, 25)));
// 글 목록/컬렉션 흔적
console.log('→ New 글 작성 화면 진입');
await page.getByRole('button', { name: /New/ }).first().click();
await page.waitForTimeout(3500);
await shot(page, '04-editor.png');
const editorEls = await page.locator('button, [role="button"], [aria-label]').allTextContents();
console.log('편집 화면 버튼:', JSON.stringify([...new Set(editorEls.filter((t) => t.trim()))].slice(0, 40)));
// 본문(markdown) 에디터 영역의 aria-label 있는 요소
const labels = await page.locator('[aria-label]').evaluateAll((els) =>
  els.map((e) => e.getAttribute('aria-label')).filter(Boolean).slice(0, 40),
);
console.log('aria-label 목록:', JSON.stringify([...new Set(labels)]));
// 파일 input 존재?
console.log('file input 수:', await page.locator('input[type="file"]').count());

console.log('→ 제목/slug/본문 입력');
await page.locator('[aria-label*="제목"]').locator('input, textarea').first().fill('CMS 자동 테스트');
await page.locator('[aria-label*="slug"]').locator('input, textarea').first().fill('cms-auto-test');
console.log('→ 저자/카테고리 선택');
await page.locator('[aria-label*="저자"]').getByText('용배', { exact: false }).first().click().catch(() => console.log('저자 클릭 실패'));
await page.locator('[aria-label*="카테고리"]').getByText('잡담', { exact: false }).first().click().catch(() => console.log('카테고리 클릭 실패'));
await page.waitForTimeout(500);
const bodyField = page.locator('[aria-label*="본문"]');
const body = bodyField.locator('[contenteditable="true"], [role="textbox"], textarea').first();
await body.click();
await page.keyboard.type('자동 테스트 본문.\n');
await page.waitForTimeout(500);

console.log('→ 본문에 이미지 드래그앤드롭(사용자 방식 재현)');
const imgPath = join(__dirname, '../../src/assets/images/blog_logo.png');
const b64 = readFileSync(imgPath).toString('base64');
const dt = await page.evaluateHandle(({ b64, name, type }) => {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const f = new File([bytes], name, { type });
  const d = new DataTransfer();
  d.items.add(f);
  return d;
}, { b64, name: 'dragdrop-test.png', type: 'image/png' });
await body.dispatchEvent('dragenter', { dataTransfer: dt });
await body.dispatchEvent('dragover', { dataTransfer: dt });
await body.dispatchEvent('drop', { dataTransfer: dt });
await page.waitForTimeout(3000);
await shot(page, '06-dropped.png');

console.log('→ Save(저장)');
await page.getByRole('button', { name: /^\s*Save\s*$/ }).first().click();
await page.waitForTimeout(7000);
await shot(page, '08-saved.png');
console.log('저장 후 본문:', (await page.locator('body').innerText()).slice(0, 150).replace(/\n+/g, ' | '));

await browser.close();
console.log('완료 — png 확인');
