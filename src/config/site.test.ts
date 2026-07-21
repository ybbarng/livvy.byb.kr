import { describe, expect, it } from 'vitest';
import { authorName, categoryName } from './site';

describe('authorName — 저자 id → 표시 이름', () => {
  it('알려진 id 는 이름으로 바꾼다', () => {
    expect(authorName('livvy')).toBe('현지');
    expect(authorName('ybbarng')).toBe('용배');
  });

  it('모르는 id 는 그대로 돌려준다(폴백)', () => {
    expect(authorName('someone')).toBe('someone');
  });
});

describe('categoryName — 카테고리 slug → 표시 이름', () => {
  it('알려진 slug 는 이름으로 바꾼다', () => {
    expect(categoryName('smalltalk')).toBe('잡담');
    expect(categoryName('study')).toBe('공부');
    expect(categoryName('date')).toBe('같이 놀기');
  });

  it('모르는 slug 는 그대로 돌려준다(폴백)', () => {
    expect(categoryName('unknown')).toBe('unknown');
  });
});
