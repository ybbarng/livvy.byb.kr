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

- 카테고리는 **코드에 고정**(하드코딩). 새 카테고리는 `site.ts`·`config.yml` 수정 필요(비개발자는 CMS만으로 못 늘림). 원본 Contentful은 Category 콘텐츠 타입이라 자유 추가가 가능했지만, 메뉴는 원본도 하드코딩이었음.

## 댓글 (Giscus + Disqus 정적 아카이브)

- **Giscus**(GitHub Discussions)로 새 댓글을 받는다. 저장소가 public이라 댓글도 GitHub에 공개되고, **GitHub 계정이 있으면 누구나** 달 수 있다(스팸 봇은 계정 문턱에서 걸러짐).
- 왜 Giscus: Disqus 무료 티어의 광고·추적·무거운 JS를 피하고 데이터를 우리 저장소 생태계에 둠. Cusdis(게스트 허용, 셀프호스팅 부담)·Disqus 유지도 검토했으나 제외.
- 다크모드 연동: 테마 토글 시 `iframe.giscus-frame`에 `postMessage`로 테마 동기화(`Menu.astro`).
- **옛 Disqus 댓글**은 giscus로 못 옮긴다(작성자 신원·작성 시각을 GitHub이 재현 못 함). 대신 `src/data/disqus-comments.json`으로 변환해 각 글 하단에 **읽기 전용 정적 아카이브**로 렌더(`DisqusArchive.astro`). 실제 존재하는 글의 댓글만, 삭제·유령 제외. 원본 export(개인 대화)는 `scripts/disqus/`에 gitignore로 로컬 보관.

## 다크모드 & 색 테마

- 색을 SCSS 정적 변수에서 **CSS 커스텀 속성**으로 옮겨 런타임 전환 가능(`src/styles/_theme.scss`의 `:root` / `[data-theme="dark"]`). `_variables.scss`의 `$color-*`는 `var(--c-*)`를 참조하므로 기존 `color: $color-base` 사용부는 자동으로 테마 대응.
- 토글은 상단 메뉴(해/달), 선택은 `localStorage` 저장, 최초는 `prefers-color-scheme` 따름. `<head>` 인라인 스크립트로 렌더 전에 테마를 적용해 깜빡임 방지.
- 제목 전용 토큰 `--c-heading`(라이트 #333 / 다크 #e8e8ea) — 하드코딩 #333이 다크에서 묻히던 문제 해결.

## 폰트 로딩 (FOUT·스크롤 튐 방지)

- 문제: 웹폰트 스왑 시 글자 높이가 바뀌어 레이아웃이 밀리고, 페이지 높이 변화로 새로고침 시 스크롤 복원 위치가 튐.
- 해결: **무거운 한글(Noto Sans KR/JP/SC)만 `font-display: optional`** — 빨리 준비 안 되면 그 페이지에선 스왑 안 해 밀림이 없음(캐시된 재방문은 처음부터 Noto). **가벼운 라틴(Roboto·Noto Sans latin)은 `swap` 유지** — 메뉴·월 표시가 항상 제 굵기로. 구현: `astro.config.mjs`의 커스텀 PostCSS 플러그인이 CJK 폰트 @font-face만 optional로 바꿈.
- fontaine(지표 맞춘 대체폰트)도 시도했으나, 4개 언어가 unicode-range로 섞인 스택에선 대체폰트가 엉뚱한 언어를 가로채 제외.
- 로고·첫 화면 사진은 `loading="eager"` + `fetchpriority="high"`(above-the-fold라 깜빡임 방지).

## 이미지 최적화 보강

- `astro.config` `image: { layout: 'constrained', responsiveStyles: true }` — 마크다운 이미지도 반응형 srcset·축소본 자동 생성(예: 4128px 원본을 그대로 내려받던 낭비 제거). `img { height:auto }`로 세로 늘어남도 방지.

## 코드 하이라이트 (Expressive Code)

- Prism okaidia → Shiki 듀얼 테마 → **Expressive Code**(`astro-expressive-code`, Shiki 기반)로 발전. 복사 버튼·파일명 프레임·줄 강조·diff. 라이트/다크는 EC 듀얼 테마(github-light/dark)를 `[data-theme='dark']` 셀렉터로 토글에 연동. 인라인 코드만 `_highlight.scss`에서 테마 대응(블록은 EC 담당).

## 후리가나·병음 (루비)

- 마크다운 `{한자|읽기}` → `<ruby>` 변환 remark 플러그인(`plugins/remark-ruby.mjs`). 일본어 후리가나·중국어 병음 공통. 코드 안은 건드리지 않음. 링크와 충돌하는 대괄호 대신 파이프 문법 사용.
- **주의**: `remarkPlugins` 사용을 위해 Astro 기본 마크다운 처리기(Sätteri)에서 `@astrojs/markdown-remark`(unified)로 전환.

## 소개 페이지 · 저자 페이지 · 글쓰기 가이드

- `/pages/about-{id}/` = 자기소개(길게). `/authors/{id}/` = 그 사람 글 목록 + 소개 **요약(description)** + "소개 더 보기 →". 저자 페이지엔 요약만 보여줘 전체 소개 중복 방지. footer의 `livvy`·`ybbarng` 링크 → 각자 소개 페이지.
- `/guide/`(글쓰기 가이드) = 개발자가 코드로 관리(`src/pages/guide.astro` + `src/guide-content.md`, CMS 밖). noindex + sitemap 제외, 메뉴에 노출. 후리가나 문법을 "입력→결과"로 보여주는 특수 렌더라 코드로 둠.

## CMS 선택 재확인 (2026)

- Sveltia는 **커스텀 블록** 컴포넌트(`registerEditorComponent`)는 지원하나 **인라인 커스텀(후리가나 버튼 등)은 미지원**. 그래서 후리가나는 타이핑(문법) + 가이드로 안내.
- 더 확장성 좋은 Keystatic을 검토했으나 에디터가 **Slate.js** 기반이라 CJK/IME 입력 리스크(= Sveltia로 온 이유)가 있어 보류. 결론: **입력 안정성 > 커스텀 버튼** → Sveltia 유지.
