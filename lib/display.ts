import chalk, { type ChalkInstance } from 'chalk'
import Table from 'cli-table3'

export function header(title: string, subtitle?: string): void {
  const width = 60
  const line = '─'.repeat(width)
  console.log()
  console.log(chalk.bold.cyan(`┌${line}┐`))
  console.log(
    chalk.bold.cyan('│') +
      chalk.bold.white(` ${title}`.padEnd(width)) +
      chalk.bold.cyan('│'),
  )
  if (subtitle) {
    console.log(
      chalk.bold.cyan('│') +
        chalk.dim(` ${subtitle}`.padEnd(width)) +
        chalk.bold.cyan('│'),
    )
  }
  console.log(chalk.bold.cyan(`└${line}┘`))
}

export function makeTable(head: string[], colWidths: number[]) {
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
  })
}

export function warn(msg: string): void {
  console.log(chalk.bold.red('  ⚠  ') + chalk.yellow(msg))
}

export function info(msg: string): void {
  console.log(chalk.dim('  →  ') + msg)
}

export function heatColor(rank: number, total: number): ChalkInstance {
  const pct = rank / total
  if (pct < 0.15) return chalk.red.bold
  if (pct < 0.35) return chalk.yellow
  return chalk.white
}
