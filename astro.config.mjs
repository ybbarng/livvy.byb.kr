import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import pxtorem from 'postcss-pxtorem';

// 폰트 로딩 시 밀림(FOUT)·스크롤 위치 튐 방지:
// 본문 웹폰트(Noto/Roboto Variable)를 font-display: optional 로 바꾼다.
// → 폰트가 아주 빨리 준비되지 않으면 그 페이지에선 스왑하지 않고 시스템 폰트로 유지 →
//   레이아웃이 로딩 중 바뀌지 않는다. 재방문(캐시)에선 Noto 가 처음부터 적용된다.
// 아이콘 폰트(fontello)는 건드리면 아이콘이 안 보일 수 있어, 'Variable' 폰트만 대상으로 한다.
const forceOptionalFontDisplay = () => ({
  postcssPlugin: 'force-optional-font-display',
  AtRule: {
    'font-face': (rule) => {
      let family = '';
      rule.walkDecls('font-family', (d) => {
        family = d.value;
      });
      if (!/Variable/i.test(family)) return;
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
  integrations: [sitemap()],
  image: {
    // 마크다운 이미지도 자동으로 여러 크기의 축소본 + srcset 을 생성한다.
    // constrained: 표시 폭에 맞춰 내려받고(원본보다 크게는 안 키움), 화면 밀도별로 선택.
    // → 640px 로 보여줄 사진을 4128px 원본째 내려받던 낭비를 없앤다.
    layout: 'constrained',
    responsiveStyles: true,
  },
  markdown: {
    // 기존 gatsby-remark-prismjs(okaidia 테마)를 재현. CSS는 styles/base/_highlight.scss.
    syntaxHighlight: 'prism',
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
