import { describe, expect, it } from 'vitest';
import remarkRuby from './remark-ruby.mjs';

// 플러그인 변환기를 mdast(문단 안 노드 하나)에 실행하고 그 자식들을 돌려준다.
function run(value, nodeType = 'text') {
  const tree = {
    type: 'root',
    children: [{ type: 'paragraph', children: [{ type: nodeType, value }] }],
  };
  remarkRuby()(tree);
  return tree.children[0].children;
}

describe('remark-ruby — {한자|읽기} → <ruby>', () => {
  it('후리가나를 ruby 로 변환한다', () => {
    const out = run('{漢字|かんじ}');
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe('html');
    expect(out[0].value).toBe('<ruby>漢字<rp>(</rp><rt>かんじ</rt><rp>)</rp></ruby>');
  });

  it('병음도 같은 문법으로 변환한다', () => {
    const out = run('{中文|zhōngwén}');
    expect(out[0].value).toContain('<rt>zhōngwén</rt>');
  });

  it('앞뒤 텍스트를 보존한다', () => {
    const out = run('私は{漢字|かんじ}です');
    expect(out.map((n) => n.type)).toEqual(['text', 'html', 'text']);
    expect(out[0].value).toBe('私は');
    expect(out[2].value).toBe('です');
  });

  it('한 텍스트의 여러 개를 모두 변환한다', () => {
    const out = run('{中文|zhōngwén}{漢字|かんじ}');
    expect(out.filter((n) => n.type === 'html')).toHaveLength(2);
  });

  it('파이프 없는 중괄호는 변환하지 않는다', () => {
    const out = run('그냥 {중괄호} 예요');
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe('text');
    expect(out[0].value).toBe('그냥 {중괄호} 예요');
  });

  it('브레이스가 없으면 그대로 둔다', () => {
    const out = run('안녕하세요');
    expect(out).toHaveLength(1);
    expect(out[0].value).toBe('안녕하세요');
  });

  it('인라인 코드(text 노드가 아님)는 건드리지 않는다', () => {
    const out = run('{code|x}', 'inlineCode');
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe('inlineCode');
    expect(out[0].value).toBe('{code|x}');
  });
});
