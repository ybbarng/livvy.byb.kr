import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import pxtorem from 'postcss-pxtorem';

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
  markdown: {
    // 기존 gatsby-remark-prismjs(okaidia 테마)를 재현. CSS는 styles/base/_highlight.scss.
    syntaxHighlight: 'prism',
    smartypants: true,
  },
  vite: {
    css: {
      postcss: {
        plugins: [
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
