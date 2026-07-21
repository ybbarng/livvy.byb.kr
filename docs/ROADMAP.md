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

- **다국어**: [I18N-ROADMAP.md](I18N-ROADMAP.md) (발음 표기·언어 태그·DeepL)
- **Disqus 댓글 17개 → Giscus**: ✅ 완료 — giscus 전환 + 옛 댓글은 글 하단 정적 아카이브로 보존
