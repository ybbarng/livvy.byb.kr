import { getCollection, type CollectionEntry } from 'astro:content';

// draft:true 글은 사이트에서 제외한다. 최신순 정렬.
export async function getPublishedPosts(): Promise<CollectionEntry<'posts'>[]> {
  const posts = await getCollection('posts', ({ data }) => data.draft !== true);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
