import chalk from 'chalk';
import { git, isExcluded } from '../lib/git.js';
import { header, makeTable, info } from '../lib/display.js';
export function bugs({ since = '1 year ago', top = 20, } = {}) {
    header('BUG HOTSPOTS', `Files most mentioned in fix/bug commits since "${since}"`);
    const raw = git(`log -i -E --grep="fix|bug|broken|crash|error|regression|🐛" --name-only --format='' --since="${since}"`);
    if (!raw) {
        console.log(chalk.dim('  No bug-related commits found. Either very healthy or commit messages lack keywords.\n'));
        return;
    }
    const counts = {};
    for (const line of raw.split('\n')) {
        const f = line.trim();
        if (f && !isExcluded(f))
            counts[f] = (counts[f] || 0) + 1;
    }
    const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, top);
    if (!sorted.length) {
        console.log(chalk.dim('  No files found.\n'));
        return;
    }
    const table = makeTable(['Bug Fixes', 'File'], [12, 56]);
    sorted.forEach(([file, count], i) => {
        const color = i < 3 ? chalk.red.bold : i < 8 ? chalk.yellow : chalk.white;
        table.push([color(String(count)), color(file)]);
    });
    console.log(table.toString());
    console.log();
    info(`Files at the top keep breaking without being properly fixed.`);
    info(`Cross-reference with \`git-audit churn\` to find highest-risk files.`);
    console.log();
}
