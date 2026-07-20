// 기존 moment 포맷을 Intl 로 대체한다(외부 의존 없음).

// 'MMMM YYYY' — 예: "February 2019" (목록 메타, Roboto 대문자로 표시)
export const monthYear = (d: Date) =>
  new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);

// 'MMMM D, YYYY' — 예: "February 21, 2019" (time datetime 속성용)
export const longDateEn = (d: Date) =>
  new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(d);

// 'YYYY년 MM월 DD일' — 예: "2019년 02월 21일" (글 상세 푸터)
export const koreanDate = (d: Date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC',
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}년 ${get('month')}월 ${get('day')}일`;
};
