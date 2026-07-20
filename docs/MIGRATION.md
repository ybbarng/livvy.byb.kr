# 이전(마이그레이션) 기록

2026년, 낡은 스택에서 현대 스택으로 옮긴 기록입니다. git 히스토리에 없는 **인프라 전환 정보**를 남겨둡니다.

## 전환 개요

| | 이전 | 이후 |
|---|---|---|
| 프레임워크 | Gatsby v2 (Node 12) | Astro 7 (Node 24) |
| 콘텐츠 | Contentful CMS | git 저장소 내 마크다운 |
| 호스팅 | Netlify | GitHub Pages |
| 편집 | Contentful 위지윅 | Sveltia CMS *(예정)* |
| 댓글 | Disqus | Giscus |
| 도메인 | `livvy.byb.kr` (Netlify DNS) | `livvy.byb.kr` (GitHub Pages) |

전환일: **2026-07-20**

## 인프라 정보

### Contentful (콘텐츠 원본)
- Space ID: `yfvzzgl62yai`, Space name: `livvy.byb.kr`
- 생성: 2018-01-20 (Yongbae Bang)
- Content model: Post(8필드), Page(5필드), Author(2필드), Category(2필드)
- 마이그레이션: Content Delivery + Preview API로 전량 덤프 (`scripts/migrate/migrate.mjs`)
- **이사 후 삭제 예정** — 삭제 직전 space 전체 export(백업 json)를 받아둘 것

### Netlify (이전 호스팅)
- Project: `livvy-and-byb`, Site ID: `66ed832a-011d-42ca-83a5-1c8eea288727`
- 생성: 2017-10-28
- **2026-07-20 프로젝트 제거 + 계정 탈퇴 완료** — 관련 뱃지/설정 모두 삭제

### DNS
- `livvy.byb.kr` → CNAME `ybbarng.github.io` (2026-07-20 전환, GitHub Pages)
- 참고: `gh.byb.kr`은 용배 개인 블로그(`ybbarng.github.io`)로 별도 운영 — 건드리지 않음

## 콘텐츠 마이그레이션 결과

- **발행 글 11개** — 원본 sitemap과 정확히 일치(URL 무손실)
- **미발행 초안 5개** — `draft:true`로 가져와 사이트에서 숨김. "안 보이던 글"의 정체는 빌드 버그가 아니라 **미발행 상태**였음:
  - 네트워크 시대의 망내인, t-test를 수행하기 위한 test(..), 무선 공유기의 이론상 최대 속도 계산하기, sql에서 가입일·접속일 차이 구하기, MYSQL workbench로 분석 환경 구축하기(1)
- **about 페이지 1개** (about-ybbarng) — 원본이 lorem ipsum 플레이스홀더 상태라 실제 소개글로 채워야 함. about-livvy는 Contentful에 아예 없었음
- **이미지 34개** — 공개 CDN(`images.ctfassets.net`)에서 원본 해상도로 받아 `astro:assets`로 최적화
- **slug**: Contentful slug을 `kebabCase`로 변환해 원본 URL 재현
- **게시일**: `datetime` 필드(분 단위, offset 포함)를 ISO 문자열로 그대로 보존. 초/밀리초는 원본에 없었음(분까지가 전부)

## Gatsby→정적 이전 시 주의점 (놓치기 쉬운 함정)

- **Service Worker 잔재**: `gatsby-plugin-offline`이 설치한 SW가 방문자 브라우저에 남아 페이지 이동 시 `page-data.json`을 요청해 화면이 깨진다. `public/sw.js`(self-unregister kill-switch) + `BaseLayout`의 unregister 스크립트로 제거. → [ARCHITECTURE.md](ARCHITECTURE.md#service-worker-gatsby-잔재-제거)
- **하이드레이션 크래시**: 일부 글이 흰 화면이 되던 문제. 정적 사이트로 옮기며 해소

## 남은 작업 (TODO)

- [ ] **Disqus 댓글 17개 이전** — `scripts/disqus/export.xml`에 확보(gitignore). 두 분의 대화가 대부분(테스트성 4개 제외). Giscus Discussions로 "작성자·날짜 표기" 형태로 이전 예정. 독립 작업이라 언제든 가능
- [ ] **Sveltia CMS 설정** — 현지님 편집 환경 + 날짜 타임존 선택 필드
- [ ] **Contentful space 삭제** — 배포 안정 확인 + 백업 export 후
- [ ] about 페이지 실제 소개글 작성 (현재 lorem ipsum)

## 정리한 것

- 원격 브랜치: dependabot 30여 개 + `build-bug`·`pages`·`update/gatsby-2-0-0`·`master` 삭제. `archive/gatsby`(원본 보존)와 `main`만 유지
- `netlify.toml`, Netlify 뱃지 제거
