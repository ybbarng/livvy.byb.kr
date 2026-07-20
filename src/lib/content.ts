import { getCollection, type CollectionEntry } from 'astro:content';
import { toEpoch } from './date';

// draft:true 글은 사이트에서 제외한다. 절대시각(UTC) 기준 최신순 정렬.
export async function getPublishedPosts(): Promise<CollectionEntry<'posts'>[]> {
  const posts = await getCollection('posts', ({ data }) => data.draft !== true);
  return posts.sort((a, b) => toEpoch(b.data.date) - toEpoch(a.data.date));
}
