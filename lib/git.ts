import { execSync } from 'child_process'
import chalk from 'chalk'

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

export const DEFAULT_EXCLUDES = new Set<string>([
  'yarn.lock',
  'package-lock.json',
  'package.json',
])

export function isExcluded(file: string): boolean {
  const base = file.split('/').pop() ?? file
  return DEFAULT_EXCLUDES.has(base)
}
