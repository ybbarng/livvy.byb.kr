import { describe, expect, it } from 'vitest';
import { excerpt } from './excerpt';

describe('excerpt', () => {
  it('짧은 본문은 그대로 돌려준다', () => {
    expect(excerpt('안녕하세요. 반갑습니다.')).toBe('안녕하세요. 반갑습니다.');
  });

  it('긴 본문은 잘라서 … 를 붙인다', () => {
    const long = '가'.repeat(200);
    const out = excerpt(long, 110);
    expect(out.endsWith('…')).toBe(true);
    expect(out.length).toBe(111); // 110자 + …
  });

  it('마크다운 기호·이미지·링크·코드를 걷어낸다', () => {
    const md = '## 제목\n\n![그림](/a.png) 이것은 **[링크](https://x.com)** 예요. `code`';
    const out = excerpt(md);
    expect(out).not.toContain('##');
    expect(out).not.toContain('![');
    expect(out).not.toContain('http');
    expect(out).toContain('링크');
    expect(out).toContain('이것은');
  });

  it('루비·스포일러 문법에서 보이는 글자만 남긴다', () => {
    expect(excerpt('{漢字|かんじ} 와 ||정답||')).toBe('漢字 와 정답');
  });

  it('콜아웃 마커 줄은 뺀다', () => {
    expect(excerpt('> [!NOTE]\n> 참고 내용')).toBe('참고 내용');
  });
});
