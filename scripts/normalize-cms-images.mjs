// Sveltia CMS 드래그앤드롭 버그 우회:
// 드래그앤드롭/붙여넣기로 첨부한 이미지는 저장소 루트에 저장되고 마크다운엔 파일명만 들어간다
// (media_folder 설정이 무시됨). 빌드 전에 그 이미지들을 참조하는 글 폴더로 옮겨,
// 마크다운의 상대경로(파일명)가 정상 resolve 되고 astro:assets 최적화도 받게 한다.
import fs from 'node:fs';
import path from 'node:path';

const roots = ['src/content/posts', 'src/content/pages'];
let moved = 0;

for (const base of roots) {
  if (!fs.existsSync(base)) continue;
  for (const slug of fs.readdirSync(base)) {
    const dir = path.join(base, slug);
    const md = path.join(dir, 'index.md');
    if (!fs.existsSync(md)) continue;
    const content = fs.readFileSync(md, 'utf8');
    // ![alt](참조) 에서 http/절대(/)/상대(./ ../) 가 아닌 "순수 파일명"만 대상
    for (const m of content.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)) {
      const ref = decodeURIComponent(m[1]);
      if (/^(https?:|\/|\.\/|\.\.\/)/.test(ref)) continue;
      const rootPath = ref; // 루트 기준
      const destPath = path.join(dir, ref);
      if (fs.existsSync(rootPath) && !fs.existsSync(destPath)) {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.renameSync(rootPath, destPath);
        console.log(`  이동: ${ref} → ${dir}/`);
        moved++;
      }
    }
  }
}

console.log(`[normalize-cms-images] 정리한 이미지: ${moved}개`);
