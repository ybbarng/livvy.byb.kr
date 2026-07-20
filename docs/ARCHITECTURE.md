# 구조와 설계 결정

이 블로그가 왜 지금의 모습인지, 핵심 규칙과 그 이유를 적어둡니다.

## 배경

원래 2017년 Gatsby v2(gatsby-starter-lumen 포크) + Contentful CMS + Netlify로 만든 1인용 블로그 템플릿을, 2명(현지·용배)이 쓰도록 개조해 운영했습니다. 이후 유지보수가 끊기며 낡은 스택(Node 12), 버그 많은 위지윅 편집, 일부 글이 안 보이는 문제가 쌓였습니다. 2026년, **디자인과 느낌은 유지하면서** 현대 스택으로 재작성했습니다.

## 스택 선택

| 선택 | 이유 |
|---|---|
| **Astro** (정적) | 콘텐츠 블로그에 최적. JS를 거의 안 실어 빠르고, GitHub Pages 무료 호스팅으로 트래픽이 몰려도 서버 비용 0 |
| **마크다운 + git** | 콘텐츠를 저장소에 두어 백업·이식성 확보, 외부 SaaS 의존 제거 |
| **Sveltia CMS** | 옛 netlify-cms의 후신. 에디터를 Slate→**Lexical**로 바꿔 한/일/중 IME 입력 버그 해결, 다국어 1급 지원 |
| **Giscus** | Disqus의 광고·추적 제거, GitHub Discussions 기반 무료 댓글 |
| **가변 폰트(fontsource)** | Noto Sans 계열을 self-host, `font-display:swap` + `unicode-range`로 언어별 자동 로딩 |

## 디자인 보존

디자인이 전부 `_variables.scss`에 값으로 정의돼 있어서(색 3개, leading 26px, 레이아웃 1070px/640px, 브레이크포인트 685/960/1100), 이 토큰·믹스인·컴포넌트 SCSS를 **그대로 이식**했습니다. 재해석이 아니라 이식이라 발산 위험이 낮습니다.

- SCSS는 `src/styles/`로 옮겨 거의 원본 유지
- `lost` 그리드만 CSS(`float`+`calc`)로 대체 (`_generic.scss`, `Sidebar`, `Menu`)
- `postcss-pxtorem`은 그대로 유지(px→rem)
- 검증: 작업 전 라이브 사이트를 Playwright로 캡처(`design-reference/reference/`), 새 사이트를 같은 스크립트로 캡처해 비교

### 원본에 있던 잠재 버그 (재작성 중 발견)

- `html { font-size: 100 }` (무단위) — 브라우저가 무시해 16px로 동작했으나, 최신 빌드(lightningcss)가 `100px`로 정규화해 1rem=100px가 되던 문제. → `100%`로 명시
- 일부 글이 **흰 화면**이 되던 버그 — Gatsby의 하이드레이션 크래시. Astro는 정적 HTML을 그대로 서빙해 구조적으로 해결

## URL 규칙 (링크 무손실의 핵심)

기존 Gatsby `getPath(model, key) = /${prefix}/${kebabCase(key)}/` 를 재현합니다.

- `astro.config.mjs`: `trailingSlash: 'always'` + `build.format: 'directory'` → `/posts/foo/` 형태 유지
- `src/lib/path.ts`가 `postPath`·`categoryPath`·`tagPath`(kebabCase) 등을 담당
- 마이그레이션 시 Contentful slug을 `kebabCase`로 변환해 원본 URL과 일치 (예: Contentful `흔하지 않은 붕어빵` → `/posts/흔하지만-흔하지-않은-붕어빵/`)
- 한글 slug 그대로 지원

## 날짜·타임존 처리

게시일은 **작성 당시 현지 시각과 시간대(offset)를 함께 보존**합니다.

- 저장: `date`를 ISO 8601 문자열(offset 포함, 예: `2018-12-02T00:00+09:00`)로 둠. `Date`로 파싱하지 않아 offset이 살아있음
- 표시(`src/lib/date.ts`): 그 offset의 **벽시계 시각**을 그대로 표시 → 파리에서 밤에 쓴 글은 파리 날짜로 남음
- 정렬·RSS: `toEpoch()`로 절대시각(UTC) 기준
- 이유: 여행 다니며 쓰는 블로그라 "그때 그곳의 시각"이 의미 있음. UTC 고정 표시는 `+09:00` 글을 하루 밀리게 만들어 폐기
- 테스트: `src/lib/date.test.ts` (offset별·여행 시나리오·자정 근처)

## Service Worker (Gatsby 잔재 제거)

옛 `gatsby-plugin-offline`이 설치한 Service Worker가 방문자 브라우저에 남아, 페이지 이동을 가로채 존재하지 않는 `page-data.json`을 요청해 화면이 깨지던 문제가 있었습니다.

- `public/sw.js`: 스스로 `unregister` + 캐시 삭제하는 kill-switch로 기존 `/sw.js`를 덮어씀
- `BaseLayout.astro`: 방문 즉시 SW를 `unregister` + 캐시 삭제

## 이미지

- 글 이미지는 글 폴더에 함께 두고(`src/content/posts/{slug}/`) 마크다운 상대경로로 참조
- Astro `astro:assets`가 빌드 시 WebP로 최적화 (Contentful이 하던 리사이즈·CDN을 대체)

## 저자·카테고리

2명·3개로 고정이라 별도 컬렉션 없이 `src/config/site.ts`의 정적 데이터로 둡니다. 저자별/카테고리별/태그별 목록은 `getCollection`을 런타임 필터링해 생성합니다.
