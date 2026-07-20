import kebabCase from 'lodash-es/kebabCase';

// 기존 Gatsby getPath(model, key) = `/${prefix}/${kebabCase(key)}/` 를 재현.
// trailingSlash:'always' 와 함께 기존 URL을 그대로 유지한다.
export const postPath = (slug: string) => `/posts/${slug}/`;
export const pagePath = (slug: string) => `/pages/${slug}/`;
export const authorPath = (id: string) => `/authors/${id}/`;
export const categoryPath = (slug: string) => `/categories/${slug}/`;

// 태그는 원본이 kebabCase(tag) 로 URL을 만들었으므로 동일하게 재현한다.
export const tagSlug = (tag: string) => kebabCase(tag);
export const tagPath = (tag: string) => `/tags/${kebabCase(tag)}/`;
