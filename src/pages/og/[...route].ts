// 글마다 제목·설명을 그려 넣은 OG 이미지(SNS 미리보기)를 빌드 시 생성한다.
// 한/일/중/프랑스어 제목을 모두 그릴 수 있게 Noto Sans 4종을 대체 순서로 넘긴다.
// 폰트는 브라우저로 전송되지 않고 빌드에서만 쓰인다(src/assets/og-fonts).
import { OGImageRoute } from 'astro-og-canvas';
import { getPublishedPosts } from '../../lib/content';

const posts = await getPublishedPosts();

// slug → 이미지에 넣을 제목·설명
const pages = Object.fromEntries(
  posts.map((post) => [
    post.data.slug,
    { title: post.data.title, description: post.data.description ?? '' },
  ]),
);

// 대체 순서: 한글 → 일본어 → 중국어 → 라틴(프랑스어 발음기호).
// fontsource CJK subset TTF는 굵기(700)와 무관하게 family명이 'Noto Sans KR Thin' 형태로
// 박혀 있어, CanvasKit이 인식하는 실제 이름을 그대로 쓴다.
const families = ['Noto Sans KR Thin', 'Noto Sans JP Thin', 'Noto Sans SC Thin', 'Noto Sans'];

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    logo: { path: './src/assets/images/blog_logo.png', size: [190] },
    bgGradient: [
      [26, 27, 30],
      [45, 47, 54],
    ],
    border: { color: [93, 147, 255], width: 12, side: 'inline-start' },
    padding: 70,
    font: {
      title: {
        color: [255, 255, 255],
        size: 62,
        weight: 'Bold',
        lineHeight: 1.3,
        families,
      },
      description: {
        color: [178, 184, 196],
        size: 30,
        lineHeight: 1.4,
        families,
      },
    },
    fonts: [
      './src/assets/og-fonts/NotoSansKR-Bold.ttf',
      './src/assets/og-fonts/NotoSansKR-Regular.ttf',
      './src/assets/og-fonts/NotoSansJP-Bold.ttf',
      './src/assets/og-fonts/NotoSansSC-Bold.ttf',
      './src/assets/og-fonts/NotoSans-Bold.ttf',
    ],
  }),
});
