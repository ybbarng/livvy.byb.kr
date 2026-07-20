import { describe, it, expect } from 'vitest';
import { postPath, pagePath, authorPath, categoryPath, tagPath, tagSlug } from './path';

describe('path — 원본 URL 재현(trailing slash + kebabCase)', () => {
  it('글·페이지·저자·카테고리 경로는 끝에 / 를 붙인다', () => {
    expect(postPath('hello-tls-1-3')).toBe('/posts/hello-tls-1-3/');
    expect(pagePath('about-ybbarng')).toBe('/pages/about-ybbarng/');
    expect(authorPath('ybbarng')).toBe('/authors/ybbarng/');
    expect(categoryPath('study')).toBe('/categories/study/');
  });

  it('한글 slug 는 그대로 보존한다', () => {
    expect(postPath('흔하지만-흔하지-않은-붕어빵')).toBe('/posts/흔하지만-흔하지-않은-붕어빵/');
  });

  it('태그는 kebabCase 로 URL 을 만든다(원본 getPath 규칙)', () => {
    expect(tagPath('tls')).toBe('/tags/tls/');
    expect(tagSlug('tls-1-3')).toBe('tls-1-3');
    expect(tagPath('일상')).toBe('/tags/일상/');
  });
});
