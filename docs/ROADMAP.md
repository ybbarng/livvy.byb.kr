# 개선 로드맵

앞으로 하고 싶은 것들. 우선순위와 시점은 유연하게.

## 코드 표현 강화 (개발자 글 대상) ✅ 완료

용배님의 기술 글(TLS, SQL 등)에서 코드가 잘 보이도록.

- Prism `okaidia` → **Shiki 듀얼 테마**로 전환(라이트/다크 자동 전환)
- **[Expressive Code](https://expressive-code.com/)** 도입 — 파일명 탭·복사 버튼·프레임
- 줄 강조·diff·터미널 프레임 등은 EC 기능으로 글에서 바로 사용 가능

## 인터랙티브 코드 (동적 실행)

코드를 보여주는 것을 넘어 **실행·조작**까지:

- **MDX** 도입 → 글 안에 컴포넌트/위젯 삽입 가능
- 브라우저에서 바로 실행: JS/TS 예시는 클라이언트 실행, 또는 **[Sandpack](https://sandpack.codesandbox.io/)**(CodeSandbox)·**StackBlitz** 임베드
- 예: "이 코드를 바꿔보세요" 하는 실행 가능한 예제
- 정적 사이트 + 필요한 글에만 인터랙티브(Astro islands)라 성능 부담이 적음

## 이미지 첨부 경험 (비개발자 친화)

마크다운 수동 이미지 첨부는 경로 관리가 번거롭다(특히 비개발자에게 큰 장벽). **Sveltia CMS**가 이걸 해결:

- 에디터에서 **드래그앤드롭·붙여넣기**로 이미지 첨부 → 자동으로 저장소에 커밋 + 마크다운에 삽입
- 미디어 라이브러리로 기존 이미지 재사용

**현재 동작**:
- **Browse**(이미지 버튼 → 파일 선택): 이미지가 글 폴더에 저장 + `astro:assets` 최적화 ✅
- **드래그앤드롭·붙여넣기**: **Sveltia 버그([#830](https://github.com/sveltia/sveltia-cms/issues/830), open)**로 이미지가 저장소 루트에 저장됨. 빌드 시 `scripts/normalize-cms-images.mjs`가 참조하는 글 폴더로 자동 이동해 우회한다(GitHub Actions에서 정리 커밋 후 빌드). 사용자는 드래그앤드롭을 그대로 쓸 수 있다.

**추적**: [Sveltia #830](https://github.com/sveltia/sveltia-cms/issues/830)이 fix되면 normalize 우회를 제거. 이미지가 아주 많아지면 Cloudflare R2/Images로 분리하는 것도 대안.

## 폰트

- 로딩 성능 추가 최적화(선택·낮은 우선순위)는 [I18N-ROADMAP.md](I18N-ROADMAP.md) 참조

## 기타

- **다국어**: [I18N-ROADMAP.md](I18N-ROADMAP.md) (발음 표기 ✅ / 언어 태그·DeepL 미결)
- **Disqus 댓글 → Giscus**: ✅ 완료 — giscus 전환 + 옛 댓글은 글 하단 정적 아카이브로 보존
- **글별 OG 이미지**: ✅ 완료 — `astro-og-canvas`로 빌드 때 글마다 제목·설명 카드(1200×630) 생성. 제목이 한/일/중/프랑스어 어느 것이든 그려지도록 Noto Sans 4종 TTF를 `src/assets/og-fonts/`에 두고 대체 순서(`Noto Sans KR Thin` 등 실제 family명)로 넘김 — 이 폰트는 이미지 생성 전용이라 브라우저로 전송되지 않는다. 트위터 큰 카드 메타 포함.
- **글 검색**: ✅ 완료 — `Pagefind`로 빌드 때 글 본문 색인(`data-pagefind-body`), 메뉴 돋보기 → `/search/`에서 정적 검색. 한/영 모두 검색·강조. dev에선 색인이 없어 빌드·배포본에서만 동작.
- **화면 전환·애니메이션**: ✅ 완료 — View Transitions(부드러운 페이지 전환·전환 후 테마 유지, 토글은 이벤트 위임), 목차 펼침/접힘·모바일 메뉴 슬라이드, `prefers-reduced-motion` 존중.
- **접속 통계**: ✅ 완료 — Cloudflare Web Analytics beacon(`BaseLayout`, `spa:true`). 쿠키·개인정보 없음. (CMS 로그인용 Cloudflare Worker `sveltia-cms-auth`와는 별개)
- **링크 임베드**: ✅ 완료 — `plugins/remark-embed.mjs`. 링크만 한 줄에 두면 임베드로 변환(문장 속 링크는 텍스트 유지).
  - 유튜브: 반응형 16:9, 썸네일 클릭 시 `youtube-nocookie` iframe 재생(성능·프라이버시)
  - 트위터/X: `.../status/ID` → 트윗 카드(widgets.js, `data-dnt`). ⚠️ 트위터 스크립트를 로드하므로 완전한 무추적은 아님
  - 구글 지도: 좌표(`@위도,경도`) 포함 전체 URL 또는 `maps/embed?pb=` 임베드 URL → API 키 없이 `output=embed`. 단축링크(goo.gl)는 좌표가 없어 미지원(텍스트 링크로 남김)
  - Vimeo 등도 같은 구조로 확장 가능

## 열린 결정 (정하면 진행)

- **언어 태그 분류** — "프랑스어로 **쓴** 글" vs "프랑스어가 **주제로 섞인** 글"을 어떻게 구분할지 미결. `langs: []` 배열이면 한 글이 여러 언어에 태그돼 각 언어 모아보기에 나타남.
- **DeepL 번역** — Sveltia 내장 DeepL은 다중 로케일(i18n) 기능이라, 단일 로케일(한국어 UI + 본문에 언어 섞기) 구조엔 안 맞음. 진짜 다국어 사이트로 갈지, 작성 보조 도구를 따로 볼지 미결. (무료 티어는 있음)
- **소개 페이지 정리** — 지금은 `/pages/about-*`(전용) + `/authors/*`(요약+글) 둘 다. 저자 페이지로 일원화할지 유지할지.
- **메뉴 아이콘** — 검색은 돋보기 아이콘(데스크톱)·아이콘+라벨(모바일)로 넣음. 글쓰기 가이드·글쓰기는 아직 텍스트만(넣는다면 📖·✏️).

## 운영 미완 (계정·인프라)

- **cms-debug PAT 폐기** — 디버깅용으로 발급한 GitHub PAT를 revoke 필요(작업 끝남).
- **Contentful 스페이스 삭제** — 고객센터에 개인정보 삭제 요청 처리 중. 백업은 `./backup/`(gitignore, 초안·에셋 포함)에 로컬 보관 — 외부에도 한 벌 두면 안전.
- **giscus 앱** 설치 완료 / **Contentful 토큰**은 삭제 후 `.env`에서 제거.
