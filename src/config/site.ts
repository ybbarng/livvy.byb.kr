// 기존 gatsby-config.js 의 siteMetadata 를 이식.
// 저자·카테고리는 2명/3개로 고정이므로 정적 데이터로 둔다(별도 컬렉션 불필요).

export interface Author {
  id: string;
  name: string;
  about: string;
  github?: string;
  email?: string;
  keybase?: string;
  facebook?: string;
  twitter?: string;
  rss?: string;
}

export interface Category {
  slug: string;
  name: string;
}

// 저작권 연도는 빌드 시점 기준으로 자동 계산한다(매년 직접 고칠 필요 없음).
// 새해가 지나면 다음 배포 때 자동으로 끝 연도가 바뀐다.
const COPYRIGHT_START_YEAR = 2017;
const currentYear = new Date().getFullYear();
const copyrightYears =
  currentYear > COPYRIGHT_START_YEAR
    ? `${COPYRIGHT_START_YEAR}–${currentYear}`
    : `${COPYRIGHT_START_YEAR}`;

export const site = {
  url: 'https://livvy.byb.kr',
  title: '현지와 용배의 블로그',
  subtitle: '현지와 용배가 만들어가는 블로그입니다.',
  copyright: `© ${copyrightYears} livvy & ybbarng`, // 플레인 텍스트(RSS 등에서 쓸 수 있게)
  footer: {
    years: copyrightYears,
    // 이름을 누르면 각자의 소개 페이지로 이동한다.
    authors: [
      { name: 'livvy', url: '/pages/about-livvy/' },
      { name: 'ybbarng', url: '/pages/about-ybbarng/' },
    ],
    // 이 블로그를 다시 만든 도구
    builtWith: { label: 'Claude Code', url: 'https://claude.com/claude-code' },
  },
  group: {
    name: '현지 & 용배',
  },
  menu: [
    { label: 'Home', path: '/' },
    { label: '잡담', path: '/categories/smalltalk/' },
    { label: '공부', path: '/categories/study/' },
    { label: '같이 놀기', path: '/categories/date/' },
  ],
  authors: [
    { id: 'livvy', name: '현지', about: '/pages/about-livvy/' },
    { id: 'ybbarng', name: '용배', about: '/pages/about-ybbarng/' },
  ] as Author[],
  categories: [
    { slug: 'smalltalk', name: '잡담' },
    { slug: 'study', name: '공부' },
    { slug: 'date', name: '같이 놀기' },
  ] as Category[],
};

export function authorName(id: string): string {
  return site.authors.find((a) => a.id === id)?.name ?? id;
}

export function categoryName(slug: string): string {
  return site.categories.find((c) => c.slug === slug)?.name ?? slug;
}
