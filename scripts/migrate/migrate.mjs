// Contentful → 마크다운 마이그레이션 (일회성)
// 실행: set -a; source .env; set +a; node scripts/migrate/migrate.mjs
//
// - Preview API(있으면)로 draft 포함 전량 조회
// - 저자/카테고리 링크를 resolve, slug은 kebabCase로 원본 URL 재현
// - body 마크다운의 Contentful 이미지(공개 CDN)를 원본 해상도로 다운로드 → 글 폴더에 저장 → 경로 치환
// - src/content/posts/{slug}/index.md, src/content/pages/{slug}.md 로 저장
// - draft 글은 frontmatter draft:true
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import kebabCase from 'lodash-es/kebabCase.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SPACE = process.env.CONTENTFUL_SPACE_ID;
const PREVIEW = process.env.CONTENTFUL_PREVIEW_TOKEN;
const DELIVERY = process.env.CONTENTFUL_ACCESS_TOKEN;
const TOKEN = PREVIEW || DELIVERY;
const HOST = PREVIEW ? 'preview.contentful.com' : 'cdn.contentful.com';

if (!SPACE || !TOKEN) {
  console.error('CONTENTFUL_SPACE_ID / TOKEN 환경변수가 없습니다. `set -a; source .env; set +a` 후 실행하세요.');
  process.exit(1);
}

// 로케일이 여러 개면 필드가 {locale: value} 형태가 될 수 있으므로 첫 값을 편다.
const f = (v) => {
  if (v == null) return null;
  if (typeof v === 'object' && !v.sys && !Array.isArray(v)) return v[Object.keys(v)[0]];
  return v;
};

async function fetchAll() {
  const url = `https://${HOST}/spaces/${SPACE}/environments/master/entries?access_token=${TOKEN}&limit=1000&include=10`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Contentful ${res.status}: ${await res.text()}`);
  return res.json();
}

function yamlValue(v) {
  if (Array.isArray(v)) return `[${v.map((x) => JSON.stringify(x)).join(', ')}]`;
  if (v instanceof Date) return v.toISOString();
  return JSON.stringify(v);
}

function frontmatter(obj) {
  const lines = Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}: ${yamlValue(v)}`);
  return `---\n${lines.join('\n')}\n---\n`;
}

// body 안의 Contentful 이미지 URL을 찾아 다운로드하고 상대경로로 치환
async function processImages(body, dir) {
  const urls = new Set();
  body.replace(/!\[[^\]]*\]\(\s*([^)\s]+)/g, (_, u) => (urls.add(u), _));
  body.replace(/<img[^>]+src=["']([^"']+)["']/gi, (_, u) => (urls.add(u), _));

  const downloaded = [];
  for (const raw of urls) {
    if (!/ctfassets\.net|images\.contentful\.com/.test(raw)) continue;
    let full = raw.startsWith('//') ? 'https:' + raw : raw;
    full = full.split('?')[0]; // 리사이즈 파라미터 제거 → 원본
    const filename = decodeURIComponent(full.split('/').pop());
    try {
      const res = await fetch(full);
      if (!res.ok) {
        console.warn(`  이미지 실패 ${res.status}: ${full}`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      await fs.writeFile(path.join(dir, filename), buf);
      // 원본 참조(파라미터 포함 가능)를 상대경로로 치환
      body = body.split(raw).join(`./${filename}`);
      downloaded.push(filename);
    } catch (e) {
      console.warn(`  이미지 오류: ${full} — ${e.message}`);
    }
  }
  return { body, downloaded };
}

const data = await fetchAll();
const byId = {};
for (const e of [...data.items, ...(data.includes?.Entry || []), ...(data.includes?.Asset || [])]) {
  byId[e.sys.id] = e;
}
const resolve = (link) => (link?.sys?.id ? byId[link.sys.id] : null);

const posts = data.items.filter((i) => i.sys.contentType.sys.id === 'post');
const pages = data.items.filter((i) => i.sys.contentType.sys.id === 'page');

// 매핑 점검용 로그
console.log('=== 저자/카테고리 매핑 확인 ===');
const authorsSeen = new Set();
const catsSeen = new Set();

const postsDir = path.join(ROOT, 'src/content/posts');
const pagesDir = path.join(ROOT, 'src/content/pages');
await fs.rm(postsDir, { recursive: true, force: true });
await fs.mkdir(postsDir, { recursive: true });
await fs.rm(pagesDir, { recursive: true, force: true });
await fs.mkdir(pagesDir, { recursive: true });

let imgCount = 0;
for (const post of posts) {
  const title = f(post.fields.title);
  const rawSlug = f(post.fields.slug) || title || post.sys.id;
  const slug = kebabCase(rawSlug);
  const draft = !post.sys.publishedAt;
  const datetime = f(post.fields.datetime) || post.sys.createdAt;
  const authorEntry = resolve(post.fields.author);
  const catEntry = resolve(post.fields.category);
  // draft 초안은 author/category 가 비어있을 수 있다 → 기본값으로 채움(나중에 Sveltia에서 수정)
  const author = (authorEntry ? f(authorEntry.fields.slug) || f(authorEntry.fields.id) : null) || 'ybbarng';
  const category = (catEntry ? f(catEntry.fields.slug) : null) || 'study';
  const tags = f(post.fields.tags) || [];
  let description = f(post.fields.description);
  if (description === '-' || description === '') description = undefined;
  let body = f(post.fields.body) || '';

  authorsSeen.add(`${author} (${f(authorEntry?.fields?.name)})`);
  catsSeen.add(`${category} (${f(catEntry?.fields?.name)})`);

  const dir = path.join(postsDir, slug);
  await fs.mkdir(dir, { recursive: true });
  const r = await processImages(body, dir);
  body = r.body;
  imgCount += r.downloaded.length;

  const fm = frontmatter({
    title,
    slug,
    date: datetime,
    author,
    category,
    tags,
    description,
    draft: draft || undefined,
  });
  await fs.writeFile(path.join(dir, 'index.md'), `${fm}\n${body.trim()}\n`);
  console.log(`  ${draft ? '[draft] ' : '[발행]  '}${slug}  (author=${author}, category=${category}, tags=${tags.length}, img=${r.downloaded.length})`);
}

for (const page of pages) {
  const title = f(page.fields.title);
  const rawSlug = f(page.fields.slug) || kebabCase(title) || page.sys.id;
  const slug = kebabCase(rawSlug);
  let description = f(page.fields.description);
  if (description === '-' || description === '') description = undefined;
  let body = f(page.fields.body) || '';
  const dir = path.join(pagesDir, slug);
  await fs.mkdir(dir, { recursive: true });
  const r = await processImages(body, dir);
  body = r.body;
  imgCount += r.downloaded.length;
  const fm = frontmatter({ title, slug, description });
  await fs.writeFile(path.join(dir, 'index.md'), `${fm}\n${body.trim()}\n`);
  console.log(`  [page]  ${slug}`);
}

console.log('\n=== 요약 ===');
console.log('글:', posts.length, '(발행', posts.filter((p) => p.sys.publishedAt).length, '+ draft', posts.filter((p) => !p.sys.publishedAt).length, ')');
console.log('페이지:', pages.length);
console.log('이미지:', imgCount);
console.log('저자값:', [...authorsSeen].join(', '));
console.log('카테고리값:', [...catsSeen].join(', '));
