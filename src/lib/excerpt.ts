// 본문 마크다운에서 목록용 요약(미리보기)을 만든다.
// description 이 없는 글의 홈/목록 미리보기에 쓴다. 마크다운 기호·코드·이미지를 걷어내고 자른다.
export function excerpt(body: string, maxLength = 110): string {
  const plain = (body ?? '')
    .replace(/```[\s\S]*?```/g, ' ') // 코드 블록 제거
    .replace(/`[^`]*`/g, ' ') // 인라인 코드
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 이미지
    .replace(/^\s*>\s*\[![^\]]*\].*$/gm, ' ') // 콜아웃 마커 줄(> [!NOTE])
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 링크 → 글자만
    .replace(/https?:\/\/\S+/g, ' ') // 남은 맨 URL(임베드 등)
    .replace(/\{([^|{}]+)\|[^|{}]+\}/g, '$1') // 루비 {한자|읽기} → 한자
    .replace(/\|\|([^|]+)\|\|/g, '$1') // 스포일러 ||x|| → x
    .replace(/[#>*_~[\]()]/g, '') // 남은 마크다운 기호
    .replace(/\s+/g, ' ') // 공백 정리
    .trim();
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trimEnd()}…`;
}
