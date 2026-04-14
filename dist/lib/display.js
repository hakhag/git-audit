import chalk from 'chalk';
import Table from 'cli-table3';
export function header(title, subtitle) {
    const width = 60;
    const line = '─'.repeat(width);
    console.log();
    console.log(chalk.bold.cyan(`┌${line}┐`));
    console.log(chalk.bold.cyan('│') +
        chalk.bold.white(` ${title}`.padEnd(width)) +
        chalk.bold.cyan('│'));
    if (subtitle) {
        console.log(chalk.bold.cyan('│') +
            chalk.dim(` ${subtitle}`.padEnd(width)) +
            chalk.bold.cyan('│'));
    }
    console.log(chalk.bold.cyan(`└${line}┘`));
}
export function makeTable(head, colWidths) {
    return new Table({
        head: head.map((h) => chalk.bold.yellow(h)),
        colWidths,
        style: { border: ['cyan'], head: [] },
        chars: {
            top: '─',
            'top-mid': '┬',
            'top-left': '┌',
            'top-right': '┐',
            bottom: '─',
            'bottom-mid': '┴',
            'bottom-left': '└',
            'bottom-right': '┘',
            left: '│',
            'left-mid': '├',
            mid: '─',
            'mid-mid': '┼',
            right: '│',
            'right-mid': '┤',
            middle: '│',
        },
    });
}
export function warn(msg) {
    console.log(chalk.bold.red('  ⚠  ') + chalk.yellow(msg));
}
export function info(msg) {
    console.log(chalk.dim('  →  ') + msg);
}
export function heatColor(rank, total) {
    const pct = rank / total;
    if (pct < 0.15)
        return chalk.red.bold;
    if (pct < 0.35)
        return chalk.yellow;
    return chalk.white;
}
