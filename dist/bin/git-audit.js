#!/usr/bin/env node
import { program } from 'commander';
import chalk from 'chalk';
import { assertGitRepo } from '../lib/git.js';
import { churn, authors, bugs, velocity, fires, age, ownership, coupling, branches, firstWeek, hot, wip, } from '../commands/index.js';
const COMMANDS = [
    { name: 'churn', desc: 'Top most-changed files' },
    { name: 'authors', desc: 'Contributor ranking + bus factor warnings' },
    { name: 'bugs', desc: 'Files most touched in bug/fix commits' },
    { name: 'velocity', desc: 'Commit activity over time (bar chart)' },
    { name: 'fires', desc: 'Revert / hotfix / emergency frequency' },
    { name: 'age', desc: 'Files not touched in 1+ year (stale code)' },
    { name: 'ownership', desc: 'Per-file blame ownership of top churned files' },
    { name: 'coupling', desc: 'Files that always change together' },
    { name: 'branches', desc: 'Stale remote branches' },
    {
        name: 'first-week',
        desc: 'Commits from the first two weeks of the project',
    },
    { name: 'hot', desc: 'Files actively changing in the last 2 weeks' },
    { name: 'wip', desc: 'WIP / hack / temp commits that made it to main' },
    { name: 'all', desc: 'Run everything' },
];
program
    .name('git-audit')
    .description(chalk.cyan('Diagnose a git repo before reading any code'))
    .version('1.0.0');
program.hook('preAction', () => {
    assertGitRepo();
});
// ── churn ──────────────────────────────────────────────────────────────────
program
    .command('churn')
    .description(COMMANDS.find((c) => c.name === 'churn').desc)
    .option('--since <date>', 'Lookback window', '1 year ago')
    .option('--top <n>', 'Number of files', '20')
    .action((opts) => {
    churn({ since: opts.since, top: parseInt(opts.top) });
});
// ── authors ────────────────────────────────────────────────────────────────
program
    .command('authors')
    .description(COMMANDS.find((c) => c.name === 'authors').desc)
    .option('--since <date>', 'Limit to commits since date')
    .action((opts) => {
    authors({ since: opts.since });
});
// ── bugs ───────────────────────────────────────────────────────────────────
program
    .command('bugs')
    .description(COMMANDS.find((c) => c.name === 'bugs').desc)
    .option('--since <date>', 'Lookback window', '1 year ago')
    .option('--top <n>', 'Number of files', '20')
    .action((opts) => {
    bugs({ since: opts.since, top: parseInt(opts.top) });
});
// ── velocity ───────────────────────────────────────────────────────────────
program
    .command('velocity')
    .description(COMMANDS.find((c) => c.name === 'velocity').desc)
    .action(() => {
    velocity();
});
// ── fires ──────────────────────────────────────────────────────────────────
program
    .command('fires')
    .description(COMMANDS.find((c) => c.name === 'fires').desc)
    .option('--since <date>', 'Lookback window', '1 year ago')
    .action((opts) => {
    fires({ since: opts.since });
});
// ── age ────────────────────────────────────────────────────────────────────
program
    .command('age')
    .description(COMMANDS.find((c) => c.name === 'age').desc)
    .option('--top <n>', 'Number of files', '20')
    .action((opts) => {
    age({ top: parseInt(opts.top) });
});
// ── ownership ──────────────────────────────────────────────────────────────
program
    .command('ownership')
    .description(COMMANDS.find((c) => c.name === 'ownership').desc)
    .option('--top <n>', 'Number of files', '15')
    .action((opts) => {
    ownership({ top: parseInt(opts.top) });
});
// ── coupling ───────────────────────────────────────────────────────────────
program
    .command('coupling')
    .description(COMMANDS.find((c) => c.name === 'coupling').desc)
    .option('--since <date>', 'Lookback window', '1 year ago')
    .option('--top <n>', 'Number of pairs', '15')
    .option('--min-count <n>', 'Min co-change count', '3')
    .action((opts) => {
    coupling({
        since: opts.since,
        top: parseInt(opts.top),
        minCount: parseInt(opts.minCount),
    });
});
// ── branches ───────────────────────────────────────────────────────────────
program
    .command('branches')
    .description(COMMANDS.find((c) => c.name === 'branches').desc)
    .action(() => {
    branches();
});
// ── first-week ─────────────────────────────────────────────────────────────
program
    .command('first-week')
    .description(COMMANDS.find((c) => c.name === 'first-week').desc)
    .action(() => {
    firstWeek();
});
// ── hot ────────────────────────────────────────────────────────────────────
program
    .command('hot')
    .description(COMMANDS.find((c) => c.name === 'hot').desc)
    .option('--since <date>', 'Lookback window', '2 weeks ago')
    .option('--top <n>', 'Number of files', '20')
    .action((opts) => {
    hot({ since: opts.since, top: parseInt(opts.top) });
});
// ── wip ────────────────────────────────────────────────────────────────────
program
    .command('wip')
    .description(COMMANDS.find((c) => c.name === 'wip').desc)
    .option('--since <date>', 'Lookback window', '1 year ago')
    .action((opts) => {
    wip({ since: opts.since });
});
// ── all ────────────────────────────────────────────────────────────────────
program
    .command('all')
    .description('Run all audit commands')
    .option('--since <date>', 'Lookback window for applicable commands', '1 year ago')
    .option('--top <n>', 'Number of results per command', '15')
    .action((opts) => {
    const top = parseInt(opts.top);
    const since = opts.since;
    console.log(chalk.bold.cyan('\n  ╔══════════════════════════════════╗'));
    console.log(chalk.bold.cyan('  ║       git-audit — full report    ║'));
    console.log(chalk.bold.cyan('  ╚══════════════════════════════════╝'));
    churn({ since, top });
    authors();
    bugs({ since, top });
    velocity();
    fires({ since });
    age({ top });
    ownership({ top });
    coupling({ since, top });
    branches();
    firstWeek();
    hot({ since, top });
    wip({ since });
});
// ── default: show help menu ────────────────────────────────────────────────
if (process.argv.length === 2) {
    console.log();
    console.log(chalk.bold.cyan('  git-audit') +
        chalk.dim(' — diagnose a codebase before reading any code'));
    console.log();
    console.log(chalk.bold('  Commands:'));
    const maxLen = Math.max(...COMMANDS.map((c) => c.name.length));
    for (const { name, desc } of COMMANDS) {
        console.log(`    ${chalk.cyan(name.padEnd(maxLen + 2))} ${chalk.dim(desc)}`);
    }
    console.log();
    console.log(chalk.dim('  Options on any command: --since "6 months ago"  --top 10'));
    console.log(chalk.dim('  Example: git-audit churn --since "6 months ago" --top 10'));
    console.log();
    process.exit(0);
}
program.parse();
