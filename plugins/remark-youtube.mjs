// 유튜브 링크만 한 줄에 있으면 반응형 영상 embed 로 바꾸는 remark 플러그인.
//  - 지원: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID (뒤에 &t= 등 붙어도 됨)
//  - 문단이 "링크(또는 URL 텍스트) 하나"로만 이루어졌을 때만 변환한다.
//    → 문장 속에 섞인 유튜브 링크(예: "...[여기](유튜브)...")는 그대로 텍스트 링크로 둔다.
//  - 개인정보 보호를 위해 youtube-nocookie 로 임베드하고, 처음엔 썸네일만 보이다
//    클릭하면 재생된다(성능·프라이버시). 실제 iframe 교체는 BaseLayout 의 스크립트가 담당.
import { visit } from 'unist-util-visit';

const YT_RE =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})(?:[?&][^\s]*)?$/;

function videoId(url) {
  if (typeof url !== 'string') return null;
  const m = url.trim().match(YT_RE);
  return m ? m[1] : null;
}

function facade(id) {
  return `<div class="yt-embed" data-yt-id="${id}">
  <button class="yt-embed__btn" type="button" aria-label="유튜브 영상 재생">
    <img class="yt-embed__thumb" src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360" />
    <span class="yt-embed__play" aria-hidden="true">
      <svg viewBox="0 0 68 48" width="68" height="48"><path class="yt-embed__play-bg" d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"/><path d="M45 24 27 14v20z" fill="#fff"/></svg>
    </span>
  </button>
</div>`;
}

export default function remarkYoutube() {
  return (tree) => {
    visit(tree, 'paragraph', (node) => {
      if (node.children?.length !== 1) return;
      const child = node.children[0];

      // 순수 URL 텍스트이거나(gfm 미적용), gfm 자동 링크/명시 링크 하나뿐일 때
      let id = null;
      if (child.type === 'text') id = videoId(child.value);
      else if (child.type === 'link') id = videoId(child.url);
      if (!id) return;

      // 문단 자체를 raw HTML 로 치환
      node.type = 'html';
      node.value = facade(id);
      delete node.children;
    });
  };
}
