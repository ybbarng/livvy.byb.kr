// 후리가나·병음 루비 문법을 <ruby> 로 변환하는 remark 플러그인.
// 문법: {한자|읽기}  예) {漢字|かんじ}, {中文|zhōngwén}
//  - 일본어 후리가나·중국어 병음 공통
//  - 코드 블록/인라인 코드(code·inlineCode 노드)는 text 노드가 아니라 건드리지 않는다
//  - <rp>(...)</rp> 는 루비 미지원 환경용 대체 표기
import { visit } from 'unist-util-visit';

const RUBY_RE = /\{([^|{}]+)\|([^|{}]+)\}/g;

export default function remarkRuby() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index == null || !node.value.includes('|')) return;
      RUBY_RE.lastIndex = 0;
      if (!RUBY_RE.test(node.value)) return;

      RUBY_RE.lastIndex = 0;
      const value = node.value;
      const children = [];
      let last = 0;
      let m;
      while ((m = RUBY_RE.exec(value)) !== null) {
        if (m.index > last) children.push({ type: 'text', value: value.slice(last, m.index) });
        const base = m[1];
        const reading = m[2];
        children.push({
          type: 'html',
          value: `<ruby>${base}<rp>(</rp><rt>${reading}</rt><rp>)</rp></ruby>`,
        });
        last = m.index + m[0].length;
      }
      if (last < value.length) children.push({ type: 'text', value: value.slice(last) });

      parent.children.splice(index, 1, ...children);
      return index + children.length; // 삽입한 노드 다음부터 계속
    });
  };
}
