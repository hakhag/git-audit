import chalk from 'chalk';
import { git, header, makeTable, info, warn, isExcluded } from '../lib/git.js';

export function age({ threshold = '1 year ago', top = 20 } = {}) {
  header('STALE FILES', `Files not modified since "${threshold}"`);

  // Get all tracked files
  const allFiles = git('ls-files').split('\n').filter(f => f && !isExcluded(f));

  const results = [];
  for (const file of allFiles) {
    const lastTouch = git(`log -1 --format="%ad" --date=short -- "${file}"`);
    if (!lastTouch) continue;
    const lastDate = new Date(lastTouch);
    const cutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    if (lastDate < cutoff) {
      results.push({ file, lastTouch, daysAgo: Math.floor((Date.now() - lastDate) / (1000 * 60 * 60 * 24)) });
    }
  }

  results.sort((a, b) => b.daysAgo - a.daysAgo);
  const display = results.slice(0, top);

  if (!display.length) {
    console.log(chalk.green('\n  ✓ No stale files found — everything has been touched recently.\n'));
    return;
  }

  const table = makeTable(['Last Modified', 'Age (days)', 'File'], [16, 14, 38]);
  for (const { file, lastTouch, daysAgo } of display) {
    const color = daysAgo > 730 ? chalk.red : daysAgo > 450 ? chalk.yellow : chalk.white;
    table.push([color(lastTouch), color(String(daysAgo)), color(file)]);
  }
  console.log(table.toString());

  console.log();
  warn(`${results.length} stale files total. These may be dead code, abandoned features, or forgotten utilities.`);
  info(`Consider removing, archiving, or adding a deprecation notice to the oldest ones.`);
  console.log();
}
