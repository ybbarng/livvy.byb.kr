import { describe, expect, it, vi } from 'vitest';

// astro:content 의 getCollection 을 가짜 글로 대체(2번째 인자 filter 를 실제로 적용).
const POSTS = [
  { data: { title: 'B', date: '2019-01-01T00:00+09:00', draft: false } },
  { data: { title: 'A', date: '2020-01-01T00:00+09:00', draft: false } },
  { data: { title: 'D-draft', date: '2018-01-01T00:00+09:00', draft: true } },
  { data: { title: 'C-nodraft', date: '2017-01-01T00:00+09:00' } },
];

vi.mock('astro:content', () => ({
  // biome-ignore lint/suspicious/noExplicitAny: 테스트용 최소 목
  getCollection: async (_name: string, filter?: (e: any) => boolean) =>
    filter ? POSTS.filter(filter) : POSTS,
}));

const { getPublishedPosts } = await import('./content');

describe('getPublishedPosts', () => {
  it('draft:true 글은 제외한다', async () => {
    const titles = (await getPublishedPosts()).map((p) => p.data.title);
    expect(titles).not.toContain('D-draft');
  });

  it('draft 필드가 없는 글은 포함한다(draft !== true)', async () => {
    const titles = (await getPublishedPosts()).map((p) => p.data.title);
    expect(titles).toContain('C-nodraft');
  });

  it('최신순(날짜 내림차순)으로 정렬한다', async () => {
    const titles = (await getPublishedPosts()).map((p) => p.data.title);
    expect(titles).toEqual(['A', 'B', 'C-nodraft']);
  });
});
