// 게시 토스트가 데스크톱/모바일 앱바(Sveltia 툴바)의 올바른 위치에 삽입되는지
// 실제 앱바 DOM 조각에 대고 검증한다. 로그인이 필요 없다.
// 실행: node scripts/cms-test/verify-toast.mjs
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const R = (p) => readFileSync(join(__dirname, p), 'utf8');

const toolbarDesktop = R('toolbar-desktop.html');
const toolbarMobile = R('toolbar-mobile.html');

// 배포되는 index.html에서 토스트 CSS(<style>)를 그대로 추출해 동일 스타일로 검증
const adminHtml = readFileSync(join(__dirname, '../../public/admin/index.html'), 'utf8');
const toastCss = adminHtml.match(/<style>([\s\S]*?)<\/style>/)[1];

// Sveltia 툴바의 flex 레이아웃을 흉내 낸 최소 CSS
const mockCss = `
  body { margin:0; font-family: -apple-system, 'Noto Sans KR', sans-serif; background:#fff; }
  [hidden] { display:none !important; }   /* 실제 Sveltia처럼 알림 버튼 숨김 반영 */
  .sui.toolbar.horizontal.primary { height:48px; background:#fafafa; border-bottom:1px solid #e0e0e0; box-sizing:border-box; }
  .sui.toolbar.horizontal.primary > .inner { display:flex; align-items:center; height:100%; padding:0 8px; gap:6px; box-sizing:border-box; }
  .sui.toolbar.horizontal.primary .buttons { display:flex; align-items:center; gap:4px; }
  .wrapper.svelte-lav5fn { flex:1 1 auto; min-width:0; }   /* 데스크톱 검색창이 늘어남 */
  .sui.spacer.flex { flex:1 1 auto; }                       /* 모바일 여유 공간이 늘어남 */
  .sui.button { min-width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center;
                border:1px solid #ddd; border-radius:6px; background:#fff; padding:0 6px; font-size:11px; color:#777; box-sizing:border-box; }
  .material-symbols-outlined { font-size:16px; }
  img.avatar { width:30px; height:30px; border-radius:50%; display:block; }
  .sui.text-input input { border:1px solid #ddd; border-radius:6px; height:28px; padding:0 8px; width:100%; box-sizing:border-box; }
  .sui.search-bar { display:flex; align-items:center; gap:4px; width:100%; }
  h2 { font-size:16px; margin:0; white-space:nowrap; }
`;

// index.html의 mount() 로직과 SPIN/CHECK 아이콘을 그대로 복제(동일 동작 검증)
const toastRuntime = `
  const SPIN = '<span class="dt-icon-wrap"><span class="dt-spin"></span></span>';
  const CHECK = '<span class="dt-icon-wrap"><svg class="dt-check" viewBox="0 0 24 24" fill="none">' +
    '<circle cx="12" cy="12" r="11" stroke="#fff" stroke-width="2"/>' +
    '<path d="M6.5 12.5l3.5 3.5 7.5-8" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></svg></span>';
  const toast = document.createElement('div');
  toast.id = 'deploy-toast';
  function mount() {
    const inner = document.querySelector('.sui.toolbar.horizontal.primary .inner');
    if (!inner) return false;
    const target =
      inner.querySelector('[aria-label="Create Entry or Assets"]') ||
      inner.querySelector('.floating-action-button-wrapper');
    if (target) {
      const parent = target.parentElement;
      if (toast.parentElement === parent && toast.nextElementSibling === target) return true;
      parent.insertBefore(toast, target);
      return true;
    }
    const groups = inner.querySelectorAll(':scope > .buttons');
    const g = groups[groups.length - 1];
    if (g) { if (!(toast.parentElement === inner && toast.nextElementSibling === g)) inner.insertBefore(toast, g); }
    else if (toast.parentElement !== inner) inner.appendChild(toast);
    return true;
  }
  function render(icon, text, bg, pop) {
    toast.innerHTML = icon + '<span>' + text + '</span>';
    toast.style.background = bg;
    toast.classList.toggle('done', !!pop);
    toast.style.display = 'flex';
    mount();
    requestAnimationFrame(() => toast.classList.add('show'));
  }
  window.__spin = () => render(SPIN, '게시 중… 빌드하고 있어요', '#475569', false);
  window.__done = () => render(CHECK, '게시 완료! 곧 반영돼요', '#059669', true);
  // 삽입 위치를 프로그램적으로도 확인할 수 있게 노출
  window.__where = () => {
    const p = toast.previousElementSibling, n = toast.nextElementSibling;
    const lbl = (el) => el ? (el.getAttribute('aria-label') || el.className || el.tagName) : null;
    return { prev: lbl(p), next: lbl(n), parent: toast.parentElement && toast.parentElement.className };
  };
`;

const pageHtml = (toolbar) => `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<style>${mockCss}${toastCss}</style></head>
<body>${toolbar}<script>${toastRuntime}</script></body></html>`;

const browser = await chromium.launch();
const results = {};

async function shoot(name, toolbar, width, state) {
  const page = await browser.newPage({ viewport: { width, height: 200 } });
  await page.setContent(pageHtml(toolbar), { waitUntil: 'load' });
  await page.waitForTimeout(200);
  await page.evaluate(state === 'done' ? 'window.__done()' : 'window.__spin()');
  await page.waitForTimeout(700); // 애니메이션 안정화
  const where = await page.evaluate('window.__where()');
  results[`${name}-${state}`] = where;
  const clip = { x: 0, y: 0, width, height: 56 };
  await page.screenshot({ path: join(__dirname, `verify-${name}-${state}.png`), clip });
  await page.close();
}

await shoot('desktop', toolbarDesktop, 1280, 'spin');
await shoot('desktop', toolbarDesktop, 1280, 'done');
await shoot('mobile', toolbarMobile, 390, 'spin');
await shoot('mobile', toolbarMobile, 390, 'done');

await browser.close();
writeFileSync(join(__dirname, 'verify-result.json'), JSON.stringify(results, null, 2));
console.log('=== 토스트 삽입 위치(이웃 요소) ===');
console.log(JSON.stringify(results, null, 2));
console.log('=== 캡처: scripts/cms-test/verify-*.png ===');
