<div align="center">

<img src="src/assets/images/blog_logo.png" alt="Y❤️H — 현지와 용배의 블로그" width="340">

<h1>현지와 용배의 블로그</h1>

<p><i>현지와 용배가 함께 쓰는 블로그 · Astro 정적 사이트 + 마크다운</i></p>

<p>
  <a href="https://github.com/ybbarng/livvy.byb.kr/actions/workflows/deploy.yml">
    <img src="https://github.com/ybbarng/livvy.byb.kr/actions/workflows/deploy.yml/badge.svg" alt="Deploy">
  </a>
  <a href="https://livvy.byb.kr">
    <img src="https://img.shields.io/badge/%F0%9F%8C%90_livvy.byb.kr-live-2ea44f" alt="Live site">
  </a>
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License MIT">
</p>

<p>
  <img src="https://img.shields.io/badge/Astro-BC52EE?logo=astro&logoColor=white" alt="Astro">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Sass-CC6699?logo=sass&logoColor=white" alt="Sass">
  <img src="https://img.shields.io/badge/Sveltia_CMS-FF3E00?logo=svelte&logoColor=white" alt="Sveltia CMS">
  <img src="https://img.shields.io/badge/GitHub_Pages-222?logo=github&logoColor=white" alt="GitHub Pages">
</p>

<p>
  <a href="https://livvy.byb.kr">🌐 사이트</a> ·
  <a href="https://livvy.byb.kr/guide/">✍️ 글쓰기 가이드</a> ·
  <a href="docs/ARCHITECTURE.md">📐 설계 문서</a>
</p>

</div>

---

## ✨ 특징

- **[Astro](https://astro.build/)** 정적 사이트 — JS를 거의 안 실어 빠르고, GitHub Pages 무료 호스팅으로 서버 비용 0
- **마크다운 + Content Collections** — 글을 git 저장소에 보관(백업·이식성)
- **[Sveltia CMS](https://github.com/sveltia/sveltia-cms)** — 위지윅 편집. 에디터가 Lexical이라 한/일/중 IME 입력이 안정적
- **[Giscus](https://giscus.app/)** — GitHub Discussions 기반 댓글(옛 Disqus 댓글은 글 하단에 정적 아카이브로 보존)
- **다크모드** — CSS 변수 기반 테마, 상단 토글(OS 선호 따름 + 저장)
- **[Expressive Code](https://expressive-code.com/)** — 코드 블록에 복사 버튼·파일명 탭, 라이트/다크 자동 전환
- **후리가나·병음** — 마크다운 `{한자|읽기}` → `<ruby>` (일본어·중국어 공부용)
- **가변 폰트** — Noto Sans KR/JP/SC + 라틴, Roboto. `unicode-range`로 언어별 자동 로딩, CJK는 `font-display:optional`로 로딩 중 밀림 방지

## 🛠 개발

Node 24 이상이 필요합니다(`.nvmrc` 참고).

```bash
npm install
npm run dev       # 개발 서버 (http://localhost:4321)
npm run build     # 프로덕션 빌드 → dist/
npm run preview   # 빌드 결과 미리보기
npm test          # vitest (날짜·URL 유틸 테스트)
npm run check     # astro 타입 체크
```

## 📁 콘텐츠 구조

```
src/content/posts/{slug}/index.md   # 글 (같은 폴더에 이미지)
src/content/pages/{slug}/index.md   # 정적 페이지 (about 등)
```

글 frontmatter:

```yaml
title: "글 제목"
slug: "kebab-case-slug"          # URL이 되는 값 (영어 권장, 한글도 가능)
date: "2019-02-21T12:00+09:00"   # ISO 8601, 작성 당시 시간대(offset) 보존
author: "ybbarng"                # livvy | ybbarng
category: "study"                # smalltalk | study | date
tags: ["tls", "security"]
description: "목록·메타에 쓰는 요약"
draft: false                     # true 면 사이트에 노출 안 됨(초안)
```

사이트 메타데이터(제목·메뉴·저자·카테고리)는 `src/config/site.ts`에 있습니다.

## 🚀 배포

`main` 브랜치에 push하면 **GitHub Actions**가 빌드해 **GitHub Pages**로 자동 배포합니다(`.github/workflows/deploy.yml`). 커스텀 도메인은 `public/CNAME`.

## 📚 문서

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — 구조와 설계 결정(URL·날짜·폰트·다크모드·댓글·코드 하이라이트 등)
- [`docs/MIGRATION.md`](docs/MIGRATION.md) — Gatsby·Contentful·Netlify에서 이전한 기록과 인프라 정보
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — 개선 로드맵
- [`docs/I18N-ROADMAP.md`](docs/I18N-ROADMAP.md) — 다국어 지원 로드맵

## License

MIT © 2017–2026 livvy & ybbarng
