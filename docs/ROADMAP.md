# 개선 로드맵

앞으로 하고 싶은 것들. 우선순위와 시점은 유연하게.

## 코드 표현 강화 (개발자 글 대상)

용배님의 기술 글(TLS, SQL 등)에서 코드가 잘 보이도록.

- 현재: Prism `okaidia` 하이라이트 (원본 디자인 유지)
- 개선 검토: **[Expressive Code](https://expressive-code.com/)** — 파일명 탭, 복사 버튼, 줄 강조, diff 표시 등 풍부한 코드 블록
- 언어별 구문 강조 확장

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

**현재 상태**: 이미지를 `public/uploads/`에 저장하고 절대경로(`/uploads/파일명`)로 참조. 동작은 확실하지만 `astro:assets` 최적화(webp 변환·리사이즈)는 적용되지 않고 원본이 그대로 서빙됨.

**개선 예정**: 글 폴더에 이미지를 함께 저장(entry-relative)해 `astro:assets` 최적화를 받게 하기. Sveltia의 `media_folder` entry-relative 동작이 기대와 달라(루트에 저장됨) 추가 조사가 필요. 이미지가 많아지면 Cloudflare R2/Images로 분리하는 것도 대안.

## 폰트

- 원본과 픽셀 대조해 미세 차이 조정(원본은 Noto Sans 웹폰트 로드가 주석 처리돼 시스템 폰트로 보였을 가능성)
- 로딩 성능 추가 최적화는 [I18N-ROADMAP.md](I18N-ROADMAP.md) 참조

## 기타

- **다국어**: [I18N-ROADMAP.md](I18N-ROADMAP.md) (발음 표기·언어 태그·DeepL)
- **Disqus 댓글 17개 → Giscus 이전**: [MIGRATION.md](MIGRATION.md) 참조
