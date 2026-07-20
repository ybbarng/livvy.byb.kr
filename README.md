# 현지와 용배의 블로그 · livvy.byb.kr

현지와 용배가 함께 쓰는 블로그입니다. Astro 정적 사이트 + 마크다운으로 만들어졌습니다.

## 기술 스택

- **[Astro](https://astro.build/)** — 정적 사이트 생성 (JS 최소, 빠른 로딩)
- **마크다운 + Content Collections** — 글을 git 저장소에 마크다운으로 보관
- **[GitHub Pages](https://pages.github.com/)** — 무료 정적 호스팅 (커스텀 도메인 `livvy.byb.kr`)
- **[Giscus](https://giscus.app/)** — GitHub Discussions 기반 댓글
- **[Sveltia CMS](https://github.com/sveltia/sveltia-cms)** — 위지윅 편집 *(설정 예정)*
- **가변 폰트** — Noto Sans KR/JP/SC + 라틴, Roboto (다국어 지원)

## 개발

Node 24 이상이 필요합니다(`.nvmrc` 참고).

```bash
npm install
npm run dev       # 개발 서버 (http://localhost:4321)
npm run build     # 프로덕션 빌드 → dist/
npm run preview   # 빌드 결과 미리보기
npm test          # vitest (날짜·URL 유틸 테스트)
npm run check     # astro 타입 체크
```

## 콘텐츠 구조

```
src/content/posts/{slug}/index.md   # 글 (같은 폴더에 이미지)
src/content/pages/{slug}/index.md   # 정적 페이지 (about 등)
```

글 frontmatter:

```yaml
title: "글 제목"
slug: "kebab-case-slug"          # URL이 되는 값 (한글 가능)
date: "2019-02-21T12:00+09:00"   # ISO 8601, 작성 당시 시간대(offset) 보존
author: "ybbarng"                # livvy | ybbarng
category: "study"                # smalltalk | study | date
tags: ["tls", "security"]
description: "목록·메타에 쓰는 요약"
draft: false                     # true 면 사이트에 노출 안 됨(초안)
```

사이트 메타데이터(제목·메뉴·저자·카테고리)는 `src/config/site.ts`에 있습니다.

## 배포

`main` 브랜치에 push하면 **GitHub Actions**가 빌드해 **GitHub Pages**로 자동 배포합니다(`.github/workflows/deploy.yml`). 커스텀 도메인은 `public/CNAME`.

## 문서

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — 구조와 설계 결정(URL 규칙, 날짜 처리, 폰트 등)
- [`docs/MIGRATION.md`](docs/MIGRATION.md) — Gatsby·Contentful·Netlify에서 이전한 기록과 인프라 정보
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — 개선 로드맵(코드 표현·실행, 이미지 첨부 등)
- [`docs/I18N-ROADMAP.md`](docs/I18N-ROADMAP.md) — 다국어 지원 로드맵

## License

MIT © 2017–2026 livvy & ybbarng
