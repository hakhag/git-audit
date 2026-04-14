import { execSync } from 'child_process'
import chalk from 'chalk'
import Table from 'cli-table3'

export function git(cmd, opts = {}) {
  try {
    return execSync(`git ${cmd}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      ...opts,
    }).trim()
  } catch (e) {
    return ''
  }
}

export function assertGitRepo() {
  const result = git('rev-parse --is-inside-work-tree')
  if (result !== 'true') {
    console.error(chalk.red('✖ Not inside a git repository.'))
    process.exit(1)
  }
}

export function header(title, subtitle) {
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
  })
}

export function warn(msg) {
  console.log(chalk.bold.red('  ⚠  ') + chalk.yellow(msg))
}

export function info(msg) {
  console.log(chalk.dim('  →  ') + msg)
}

export const DEFAULT_EXCLUDES = new Set([
  'yarn.lock',
  'package-lock.json',
  'package.json',
])

export function isExcluded(file) {
  const base = file.split('/').pop()
  return DEFAULT_EXCLUDES.has(base)
}

export function heatColor(rank, total) {
  const pct = rank / total
  if (pct < 0.15) return chalk.red.bold
  if (pct < 0.35) return chalk.yellow
  return chalk.white
}
