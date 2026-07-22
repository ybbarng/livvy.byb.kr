// 정답/번역 가리기(스포일러) remark 플러그인.
// 문법:  ||가릴 내용||   → 눌러야 보이는 가림 처리(자기주도 학습용).
//  - 코드(code·inlineCode)는 text 노드가 아니라 건드리지 않는다.
import { visit } from 'unist-util-visit';

const RE = /\|\|([^|]+)\|\|/g;

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default function remarkSpoiler() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index == null || !node.value.includes('||')) return;
      RE.lastIndex = 0;
      if (!RE.test(node.value)) return;

      RE.lastIndex = 0;
      const value = node.value;
      const children = [];
      let last = 0;
      let m = RE.exec(value);
      while (m !== null) {
        if (m.index > last) children.push({ type: 'text', value: value.slice(last, m.index) });
        children.push({
          type: 'html',
          value: `<span class="spoiler" role="button" tabindex="0" aria-label="가려진 내용, 눌러서 보기">${esc(m[1])}</span>`,
        });
        last = m.index + m[0].length;
        m = RE.exec(value);
      }
      if (last < value.length) children.push({ type: 'text', value: value.slice(last) });

      parent.children.splice(index, 1, ...children);
      return index + children.length;
    });
  };
}
