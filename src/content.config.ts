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
    // ISO 8601 문자열(offset 포함)로 둔다. 작성 당시 현지 시각+시간대를 보존하기 위해
    // Date 로 파싱하지 않는다(파싱하면 offset 정보가 사라짐). 정렬은 코드에서 절대시각으로.
    date: z.string(),
    author: authorEnum,
    category: categoryEnum,
    tags: z.array(z.string()).default([]),
    description: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    date: z.string().optional(), // 정적 페이지의 게시일(offset 포함 ISO). 표시엔 안 쓰지만 보존.
    description: z.string().optional(),
  }),
});

export const collections = { posts, pages };
