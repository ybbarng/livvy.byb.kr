// 한 줄에 링크만 두면 자동으로 임베드로 바꾸는 remark 플러그인.
//  - 유튜브: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
//  - 트위터/X: twitter.com|x.com/사용자/status/ID
//  - 구글 지도: 좌표(@위도,경도)가 담긴 전체 URL, 또는 google.com/maps/embed?pb=... 임베드 URL
// 문단이 "링크(또는 URL 텍스트) 하나"로만 이루어졌을 때만 변환한다.
// → 문장 속에 섞인 링크는 그대로 텍스트 링크로 둔다.
import { visit } from 'unist-util-visit';

const YT_RE =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})(?:[?&][^\s]*)?$/;
const TWEET_RE = /^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[^/]+\/status\/(\d+)/i;
const MAPS_EMBED_RE = /^https?:\/\/(?:www\.)?google\.[a-z.]+\/maps\/embed\?pb=[^\s]+$/i;
const MAPS_AT_RE = /^https?:\/\/(?:www\.)?google\.[a-z.]+\/maps\/[^\s]*@(-?\d+\.\d+),(-?\d+\.\d+)/i;

// 유튜브 재생 전 썸네일 facade. 클릭 시 iframe 교체는 BaseLayout 스크립트가 담당.
function youtubeHtml(id) {
  return `<div class="yt-embed" data-yt-id="${id}">
  <button class="yt-embed__btn" type="button" aria-label="유튜브 영상 재생">
    <img class="yt-embed__thumb" src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360" />
    <span class="yt-embed__play" aria-hidden="true">
      <svg viewBox="0 0 68 48" width="68" height="48"><path class="yt-embed__play-bg" d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"/><path d="M45 24 27 14v20z" fill="#fff"/></svg>
    </span>
  </button>
</div>`;
}

// 트위터 위젯 스크립트(platform.twitter.com/widgets.js)가 blockquote 를 카드로 렌더한다.
// data-dnt: 추적 최소화(Do Not Track).
function tweetHtml(url) {
  return `<blockquote class="twitter-tweet" data-dnt="true"><a href="${url}"></a></blockquote>`;
}

function mapHtml(src) {
  return `<div class="map-embed"><iframe src="${src}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen title="지도"></iframe></div>`;
}

// 링크 하나를 임베드 HTML 로 분류. 해당 없으면 null.
function embedHtml(url) {
  if (typeof url !== 'string') return null;
  const u = url.trim();

  const yt = u.match(YT_RE);
  if (yt) return youtubeHtml(yt[1]);

  if (TWEET_RE.test(u)) return tweetHtml(u);

  if (MAPS_EMBED_RE.test(u)) return mapHtml(u);
  const at = u.match(MAPS_AT_RE);
  if (at) {
    const src = `https://www.google.com/maps?q=${at[1]},${at[2]}&z=16&hl=ko&output=embed`;
    return mapHtml(src);
  }

  return null;
}

export default function remarkEmbed() {
  return (tree) => {
    visit(tree, 'paragraph', (node) => {
      if (node.children?.length !== 1) return;
      const child = node.children[0];

      let url = null;
      if (child.type === 'text') url = child.value;
      else if (child.type === 'link') url = child.url;

      const html = embedHtml(url);
      if (!html) return;

      node.type = 'html';
      node.value = html;
      delete node.children;
    });
  };
}
