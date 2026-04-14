import { execSync } from 'child_process'
import chalk, { type ChalkInstance } from 'chalk'
import Table from 'cli-table3'

export function git(cmd: string, opts: object = {}): string {
  try {
    return (
      execSync(`git ${cmd}`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        ...opts,
      }) as string
    ).trim()
  } catch {
    return ''
  }
}

export function assertGitRepo(): void {
  const result = git('rev-parse --is-inside-work-tree')
  if (result !== 'true') {
    console.error(chalk.red('✖ Not inside a git repository.'))
    process.exit(1)
  }
}

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

export const DEFAULT_EXCLUDES = new Set<string>([
  'yarn.lock',
  'package-lock.json',
  'package.json',
])

export function isExcluded(file: string): boolean {
  const base = file.split('/').pop() ?? file
  return DEFAULT_EXCLUDES.has(base)
}

export function heatColor(rank: number, total: number): ChalkInstance {
  const pct = rank / total
  if (pct < 0.15) return chalk.red.bold
  if (pct < 0.35) return chalk.yellow
  return chalk.white
}
