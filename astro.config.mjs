import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';
import pxtorem from 'postcss-pxtorem';
import remarkEmbed from './plugins/remark-embed.mjs';
import remarkRuby from './plugins/remark-ruby.mjs';

// 폰트 로딩 시 밀림(FOUT)·스크롤 위치 튐 방지:
// 밀림의 주범인 무거운 한글(CJK) 폰트만 font-display: optional 로 바꾼다.
// → 폰트가 아주 빨리 준비되지 않으면 그 페이지에선 스왑하지 않고 시스템 폰트로 유지 →
//   레이아웃이 로딩 중 바뀌지 않는다. 재방문(캐시)에선 Noto 가 처음부터 적용된다.
// 가벼운 라틴(Roboto·Noto Sans)은 원래대로 swap 유지 → 상단 메뉴·월 표시가 항상 제 굵기로
// 보인다(라틴 폰트는 작아 스왑해도 밀림이 거의 없다). 아이콘 폰트(fontello)도 대상 아님.
const forceOptionalFontDisplay = () => ({
  postcssPlugin: 'force-optional-font-display',
  AtRule: {
    'font-face': (rule) => {
      let family = '';
      rule.walkDecls('font-family', (d) => {
        family = d.value;
      });
      if (!/Noto Sans (KR|JP|SC) Variable/i.test(family)) return;
      let found = false;
      rule.walkDecls('font-display', (d) => {
        d.value = 'optional';
        found = true;
      });
      if (!found) rule.append({ prop: 'font-display', value: 'optional' });
    },
  },
});
forceOptionalFontDisplay.postcss = true;

// 기존 Gatsby 사이트와 동일한 URL 규칙을 유지한다.
// - trailingSlash: 'always' + build.format: 'directory' → /posts/foo/ 형태 그대로
// - postcss-pxtorem: 기존 postcss-config.js 설정을 그대로 옮겨 px→rem 변환을 재현
export default defineConfig({
  site: 'https://livvy.byb.kr',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    // 코드 블록: Expressive Code(Shiki 기반) — 복사 버튼·파일명 프레임·줄 강조 등.
    // 첫 테마(github-light)가 기본, 다크는 [data-theme='dark'] 에서 활성화(수동 토글 연동).
    expressiveCode({
      themes: ['github-light', 'github-dark'],
      themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
      useDarkModeMediaQuery: false,
      styleOverrides: {
        borderRadius: '8px',
        borderColor: 'var(--c-border)',
        frames: { shadowColor: 'transparent' },
      },
    }),
    // /guide/(글쓰기 가이드)·/search/(검색)는 색인 대상이 아니라 sitemap 에서 제외
    sitemap({ filter: (page) => !page.includes('/guide') && !page.includes('/search') }),
  ],
  image: {
    // 마크다운 이미지도 자동으로 여러 크기의 축소본 + srcset 을 생성한다.
    // constrained: 표시 폭에 맞춰 내려받고(원본보다 크게는 안 키움), 화면 밀도별로 선택.
    // → 640px 로 보여줄 사진을 4128px 원본째 내려받던 낭비를 없앤다.
    layout: 'constrained',
    responsiveStyles: true,
  },
  markdown: {
    // 코드 블록은 Expressive Code(위 integrations)가 처리한다.
    syntaxHighlight: false,
    // 후리가나·병음 루비: {한자|읽기} → <ruby>
    remarkPlugins: [remarkRuby, remarkEmbed],
    smartypants: true,
  },
  vite: {
    css: {
      postcss: {
        plugins: [
          forceOptionalFontDisplay(),
          pxtorem({
            rootValue: 16,
            unitPrecision: 5,
            propList: [
              'font',
              'font-size',
              'line-height',
              'letter-spacing',
              'margin',
              'margin-top',
              'margin-left',
              'margin-bottom',
              'margin-right',
              'padding',
              'padding-top',
              'padding-left',
              'padding-bottom',
              'padding-right',
              'border-radius',
              'width',
              'max-width',
            ],
            selectorBlackList: [],
            replace: true,
            mediaQuery: false,
            minPixelValue: 0,
          }),
        ],
      },
    },
  },
});
