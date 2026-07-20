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

export const site = {
  url: 'https://livvy.byb.kr',
  title: '현지와 용배의 블로그',
  subtitle: '현지와 용배가 만들어가는 블로그입니다.',
  copyright: '© 2017-2026 livvy & ybbarng All rights reserved.',
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
