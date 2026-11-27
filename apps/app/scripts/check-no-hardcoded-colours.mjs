// Fails when a colour literal appears outside src/theme/tokens.ts (docs/02 section 5: tokens only).
// Tests (__tests__) are not scanned: they are not shipped and may use literal fixtures.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const scanned = ['app', 'src'];
const allowed = new Set([join('src', 'theme', 'tokens.ts')]);
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.css'];
const patterns = [/#[0-9a-fA-F]{3,8}\b/, /\b(?:rgba?|hsla?|hwb|oklch)\(/];

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name !== 'node_modules' && name !== '__tests__') yield* files(path);
    } else if (extensions.some((ext) => name.endsWith(ext))) {
      yield path;
    }
  }
}

const problems = [];
for (const dir of scanned) {
  for (const path of files(join(root, dir))) {
    const rel = relative(root, path);
    if (allowed.has(rel.split(sep).join(sep))) continue;
    readFileSync(path, 'utf8')
      .split('\n')
      .forEach((line, index) => {
        if (patterns.some((p) => p.test(line))) problems.push(`${rel}:${index + 1}: ${line.trim()}`);
      });
  }
}

if (problems.length > 0) {
  console.error('Hardcoded colours found. Use tokens from src/theme/tokens.ts:\n' + problems.join('\n'));
  process.exit(1);
}
console.log('No hardcoded colours outside src/theme/tokens.ts.');
