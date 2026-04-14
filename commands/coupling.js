import chalk from 'chalk';
import { git, header, makeTable, info, isExcluded } from '../lib/git.js';

export function coupling({ since = '1 year ago', top = 15, minCount = 3 } = {}) {
  header('CHANGE COUPLING', `Files that frequently change together since "${since}"`);
  info(`Reveals hidden dependencies — files that should maybe be one module.`);
  console.log();

  // Get all commits and their changed files
  const raw = git(`log --format='COMMIT:%H' --name-only --since="${since}"`);
  if (!raw) {
    console.log(chalk.dim('  No data.\n'));
    return;
  }

  // Parse commits
  const commits = [];
  let current = [];
  for (const line of raw.split('\n')) {
    const l = line.trim().replace(/'/g, '');
    if (l.startsWith('COMMIT:')) {
      if (current.length > 1) commits.push(current);
      current = [];
    } else if (l && !isExcluded(l)) {
      current.push(l);
    }
  }
  if (current.length > 1) commits.push(current);

  // Count co-occurrences
  const pairs = {};
  for (const files of commits) {
    for (let i = 0; i < files.length; i++) {
      for (let j = i + 1; j < files.length; j++) {
        const key = [files[i], files[j]].sort().join(' ↔ ');
        pairs[key] = (pairs[key] || 0) + 1;
      }
    }
  }

  const sorted = Object.entries(pairs)
    .filter(([, c]) => c >= minCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, top);

  if (!sorted.length) {
    console.log(chalk.dim(`  No file pairs changed together ${minCount}+ times.\n`));
    return;
  }

  const table = makeTable(['Co-changes', 'File Pair'], [12, 56]);
  for (const [pair, count] of sorted) {
    const color = count > 10 ? chalk.red.bold : count > 5 ? chalk.yellow : chalk.white;
    table.push([color(String(count)), color(pair)]);
  }
  console.log(table.toString());

  console.log();
  info(`High coupling between files suggests implicit dependencies or missing abstractions.`);
  console.log();
}
