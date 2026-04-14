import chalk from 'chalk';
import { git, header, warn, info } from '../lib/git.js';

export function fires({ since = '1 year ago' } = {}) {
  header('FIREFIGHTING FREQUENCY', `Reverts, hotfixes, and emergencies since "${since}"`);

  const raw = git(
    `log --oneline --since="${since}"`
  );

  if (!raw) {
    console.log(chalk.dim('  No commits in range.\n'));
    return;
  }

  const all = raw.split('\n').filter(Boolean);
  const pattern = /revert|hotfix|emergency|rollback|quick.?fix|urgent/i;
  const matches = all.filter(line => pattern.test(line));

  if (!matches.length) {
    console.log();
    console.log(chalk.green('  ✓ No revert/hotfix/emergency commits found.'));
    info(`Either things are stable, or commit messages don't use these keywords.`);
    console.log();
    return;
  }

  // Group by month
  const byMonth = {};
  for (const hash of matches.map(l => l.split(' ')[0])) {
    const month = git(`log -1 --format='%ad' --date=format:'%Y-%m' ${hash}`).replace(/'/g, '');
    if (month) byMonth[month] = (byMonth[month] || 0) + 1;
  }

  const monthEntries = Object.entries(byMonth).sort((a, b) => a[0].localeCompare(b[0]));
  const maxVal = Math.max(...monthEntries.map(([, c]) => c));

  console.log();
  for (const [month, count] of monthEntries) {
    const bar = chalk.red('▓'.repeat(count)) + chalk.dim('░'.repeat(Math.max(0, maxVal - count)));
    console.log(`  ${chalk.dim(month)}  ${bar}  ${chalk.red.bold(count)}`);
  }

  console.log();
  console.log(chalk.bold(`  Total: ${chalk.red.bold(matches.length)} fire commits out of ${chalk.white(all.length)} (${((matches.length / all.length) * 100).toFixed(1)}%)`));
  console.log();

  const perMonth = matches.length / Math.max(monthEntries.length, 1);
  if (perMonth >= 2) {
    warn(`Averaging ${perMonth.toFixed(1)} fire commits/month — team may not trust the deploy process.`);
  } else if (perMonth >= 1) {
    warn(`Some fire commits present. Worth checking test coverage and staging reliability.`);
  } else {
    info(`Low fire commit rate — relatively healthy deploy confidence.`);
  }

  console.log();
  console.log(chalk.bold.yellow('  Recent fire commits:'));
  for (const line of matches.slice(0, 10)) {
    console.log(chalk.dim(`    ${line}`));
  }
  console.log();
}
