import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '../config/site';
import { getPublishedPosts } from '../lib/content';
import { postPath } from '../lib/path';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();

  return rss({
    title: site.title,
    description: site.subtitle,
    site: context.site ?? site.url,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      description: post.data.description ?? '',
      link: postPath(post.data.slug),
    })),
    customData: '<language>ko</language>',
  });
}
