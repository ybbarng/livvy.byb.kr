// GitHub식 콜아웃(강조 박스)을 만드는 remark 플러그인.
// 문법:  > [!NOTE]
//        > 내용...
// 종류: NOTE(참고)·TIP(팁)·IMPORTANT(중요)·WARNING(주의)·CAUTION(경고)
import { visit } from 'unist-util-visit';

const TYPES = {
  NOTE: '참고',
  TIP: '팁',
  IMPORTANT: '중요',
  WARNING: '주의',
  CAUTION: '경고',
};

const ICONS = {
  NOTE: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm6.5-.25A.75.75 0 017.25 7h1a.75.75 0 01.75.75v2.75h.25a.75.75 0 010 1.5h-2a.75.75 0 010-1.5h.25v-2h-.25a.75.75 0 01-.75-.75zM8 6a1 1 0 100-2 1 1 0 000 2z"/></svg>',
  TIP: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 1.5c-2.36 0-4 1.79-4 4 0 1.28.68 2.4 1.66 3.15.36.28.59.62.7.95l.28.87a.75.75 0 00.71.51h1.38a.75.75 0 00.71-.51l.28-.87c.11-.33.34-.67.7-.95C11.32 7.9 12 6.78 12 5.5c0-2.21-1.64-4-4-4zM6.5 13.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75z"/></svg>',
  IMPORTANT:
    '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M0 3.75C0 2.784.784 2 1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0114.25 14H1.75A1.75 1.75 0 010 12.25zM8 4a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0v-3.5A.75.75 0 008 4zm0 8a1 1 0 100-2 1 1 0 000 2z"/></svg>',
  WARNING:
    '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.383c.66 1.234-.235 2.57-1.543 2.57H1.918c-1.308 0-2.203-1.336-1.543-2.57zM8 5a.75.75 0 00-.75.75v2.5a.75.75 0 001.5 0v-2.5A.75.75 0 008 5zm0 7a1 1 0 100-2 1 1 0 000 2z"/></svg>',
  CAUTION:
    '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M4.47.22A.75.75 0 015 0h6a.75.75 0 01.53.22l4.25 4.25c.141.14.22.331.22.53v6a.75.75 0 01-.22.53l-4.25 4.25a.75.75 0 01-.53.22H5a.75.75 0 01-.53-.22L.22 11.53A.75.75 0 010 11V5a.75.75 0 01.22-.53zM8 4a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0v-3.5A.75.75 0 008 4zm0 8a1 1 0 100-2 1 1 0 000 2z"/></svg>',
};

const MARK_RE = /^\[!(\w+)\]\s*/;

export default function remarkCallout() {
  return (tree) => {
    visit(tree, 'blockquote', (node) => {
      const firstPara = node.children?.[0];
      if (firstPara?.type !== 'paragraph') return;
      const firstText = firstPara.children?.[0];
      if (firstText?.type !== 'text') return;

      const m = firstText.value.match(MARK_RE);
      if (!m) return;
      const type = m[1].toUpperCase();
      const label = TYPES[type];
      if (!label) return;

      // 마커 텍스트를 지운다. 마커만 있던 줄이면 그 텍스트와 뒤따르는 줄바꿈을 없앤다.
      firstText.value = firstText.value.replace(MARK_RE, '');
      if (firstText.value === '') {
        firstPara.children.shift();
        if (firstPara.children[0]?.type === 'break') firstPara.children.shift();
      }

      // blockquote 를 콜아웃 div 로 렌더하고, 제목(아이콘+라벨) 문단을 앞에 붙인다.
      node.data = {
        hName: 'div',
        hProperties: { className: ['callout', `callout--${type.toLowerCase()}`] },
      };
      node.children.unshift({
        type: 'html',
        value: `<p class="callout__title">${ICONS[type]}<span>${label}</span></p>`,
      });
    });
  };
}
