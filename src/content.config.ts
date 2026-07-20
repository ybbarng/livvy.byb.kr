import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 저자·카테고리는 site.ts 와 동일한 고정 집합. enum 으로 검증한다.
const authorEnum = z.enum(['livvy', 'ybbarng']);
const categoryEnum = z.enum(['smalltalk', 'study', 'date']);

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(), // kebab 처리된 최종 slug (URL 무손실용)
    date: z.coerce.date(),
    author: authorEnum,
    category: categoryEnum,
    tags: z.array(z.string()).default([]),
    description: z.string().optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { posts, pages };
