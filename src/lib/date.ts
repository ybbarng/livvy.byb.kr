// 게시일은 ISO 8601 문자열(offset 포함, 예: "2018-12-02T00:00+09:00")로 다룬다.
// 표시는 "작성 당시 현지 벽시계 시각"을 그대로 보여준다(파리에서 쓰면 파리 시각).
// 정렬/비교는 절대시각(UTC)으로 하려면 new Date(raw).valueOf() 를 쓴다.

// 절대시각에 offset 을 더해 "벽시계 값을 UTC 로 표현한 Date" 를 만든다.
// 이 Date 를 UTC 기준으로 읽으면 원본의 연월일시분이 그대로 나온다.
function wallClock(raw: string): Date {
  const abs = new Date(raw);
  const m = raw.match(/([+-])(\d{2}):?(\d{2})$/);
  const offsetMin = m
    ? (m[1] === '-' ? -1 : 1) * (parseInt(m[2], 10) * 60 + parseInt(m[3], 10))
    : 0;
  return new Date(abs.getTime() + offsetMin * 60000);
}

// 'MMMM YYYY' — 예: "February 2019" (목록 메타, Roboto 대문자)
export const monthYear = (raw: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    wallClock(raw),
  );

// 'YYYY년 MM월 DD일' — 예: "2018년 12월 02일" (글 상세 푸터)
export const koreanDate = (raw: string) => {
  const d = wallClock(raw);
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}년 ${mo}월 ${day}일`;
};

// 'YYYY년 MM월 DD일 HH:MM:SS' — 날짜에 마우스 올리거나 눌렀을 때 보여줄 상세 시각.
// koreanDate 와 같은 벽시계 기준(작성 당시 현지 시각)이라 시/분/초까지 그대로 보인다.
export const koreanDateTime = (raw: string) => {
  const d = wallClock(raw);
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const h = String(d.getUTCHours()).padStart(2, '0');
  const mi = String(d.getUTCMinutes()).padStart(2, '0');
  const s = String(d.getUTCSeconds()).padStart(2, '0');
  return `${y}년 ${mo}월 ${day}일 ${h}:${mi}:${s}`;
};

// 절대시각 정렬용 (최신순 비교)
export const toEpoch = (raw: string) => new Date(raw).valueOf();
