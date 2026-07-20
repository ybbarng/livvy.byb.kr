import { describe, it, expect } from 'vitest';
import { monthYear, koreanDate, toEpoch } from './date';

describe('date — 작성 당시 현지 벽시계(offset) 보존 표시', () => {
  it('KST(+09:00) 게시일을 그대로 표시', () => {
    expect(koreanDate('2018-12-02T00:00+09:00')).toBe('2018년 12월 02일');
    expect(monthYear('2019-02-21T12:00+09:00')).toBe('February 2019');
  });

  it('UTC(+00:00) 게시일을 그대로 표시(붕어빵 글 케이스)', () => {
    expect(koreanDate('2017-12-05T06:11+00:00')).toBe('2017년 12월 05일');
  });

  it('여행 시나리오: 파리 밤(+01:00)에 쓴 글은 파리 날짜(3/10)로 유지', () => {
    // 파리 3/10 23:00 = UTC 3/10 22:00 = 한국 3/11 07:00.
    // 한국시간 고정이면 3/11로 밀리지만, 벽시계 보존이면 파리 기준 3/10 유지.
    expect(koreanDate('2026-03-10T23:00+01:00')).toBe('2026년 03월 10일');
  });

  it('음수 offset(뉴욕 -05:00) 자정 직후도 그 지역 날짜 유지', () => {
    expect(koreanDate('2026-01-01T00:30-05:00')).toBe('2026년 01월 01일');
  });

  it('Z(UTC) 표기도 처리', () => {
    expect(koreanDate('2020-05-16T09:00:00.000Z')).toBe('2020년 05월 16일');
  });

  it('toEpoch: offset이 달라도 같은 절대시각이면 동일', () => {
    expect(toEpoch('2026-03-10T22:00+00:00')).toBe(toEpoch('2026-03-10T23:00+01:00'));
  });

  it('toEpoch: 절대시각 기준 정렬(파리 밤 < 한국 다음날 아침)', () => {
    expect(toEpoch('2026-03-10T23:00+01:00')).toBeLessThan(toEpoch('2026-03-11T08:00+09:00'));
  });
});
