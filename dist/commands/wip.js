import chalk from 'chalk';
import { git } from '../lib/git.js';
import { header, makeTable, warn, info } from '../lib/display.js';
const WIP_PATTERN = /\bwip\b|\btemp\b|\bhack\b|fixme|do.?not.?merge|\bdnm\b|cleanup.?later|needs.?cleanup/i;
export function wip({ since = '1 year ago' } = {}) {
    header('WIP COMMITS', `Unfinished / throwaway commits merged since "${since}"`);
    const raw = git(`log --format="%ad|%an|%s" --date=format:"%Y-%m-%d" --since="${since}"`);
    if (!raw) {
        console.log(chalk.dim('  No commits found in this range.\n'));
        return;
    }
    const all = raw.split('\n').filter(Boolean);
    const matches = all.filter((line) => WIP_PATTERN.test(line));
    if (!matches.length) {
        console.log();
        console.log(chalk.green('  ✓ No WIP/hack/temp commits found.'));
        info(`Either very disciplined, or commit messages don't use these keywords.`);
        console.log();
        return;
    }
    const table = makeTable(['Date', 'Author', 'Message'], [14, 22, 32]);
    for (const line of matches.slice(0, 20)) {
        const [date, author, ...rest] = line.split('|');
        const subject = rest.join('|');
        const shortAuthor = author.length > 20 ? author.slice(0, 19) + '…' : author;
        const shortSubject = subject.length > 30 ? subject.slice(0, 29) + '…' : subject;
        table.push([
            chalk.dim(date),
            chalk.dim(shortAuthor),
            chalk.yellow(shortSubject),
        ]);
    }
    console.log(table.toString());
    console.log();
    warn(`${matches.length} WIP-like commits out of ${all.length} total (${((matches.length / all.length) * 100).toFixed(1)}%).`);
    info(`These may indicate rushed merges, unfinished features, or lingering debt.`);
    console.log();
}
