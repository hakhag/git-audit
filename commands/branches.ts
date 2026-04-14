import chalk from 'chalk'
import { git } from '../lib/git.js'
import { header, makeTable, info, warn } from '../lib/display.js'

interface BranchesOptions {
  threshold?: string
}

interface StaleBranch {
  branch: string
  date: string
  daysAgo: number
  author: string
  subject: string
}

export function branches({ threshold = '3 months ago' }: BranchesOptions = {}): void {
  header(
    'STALE BRANCHES',
    `Remote branches with no activity since "${threshold}"`,
  )

  const raw = git(`branch -r --sort=-committerdate`)
  if (!raw) {
    console.log(chalk.dim('\n  No remote branches found.\n'))
    return
  }

  const remoteBranches = raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.includes('HEAD ->') && !l.includes('->'))

  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  const stale: StaleBranch[] = []

  for (const branch of remoteBranches) {
    const date = git(`log -1 --format="%ad" --date=short ${branch} 2>/dev/null`)
    if (!date) continue
    const d = new Date(date)
    if (d < cutoff) {
      const author = git(`log -1 --format="%an" ${branch} 2>/dev/null`)
      const subject = git(`log -1 --format="%s" ${branch} 2>/dev/null`)
      const daysAgo = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
      stale.push({
        branch: branch.replace('origin/', ''),
        date,
        daysAgo,
        author,
        subject,
      })
    }
  }

  if (!stale.length) {
    console.log(chalk.green('\n  ✓ No stale remote branches found.\n'))
    return
  }

  stale.sort((a, b) => b.daysAgo - a.daysAgo)

  const table = makeTable(
    ['Last Activity', 'Days Ago', 'Author', 'Branch'],
    [14, 10, 20, 24],
  )
  for (const { branch, date, daysAgo, author } of stale) {
    const color =
      daysAgo > 180 ? chalk.red : daysAgo > 90 ? chalk.yellow : chalk.white
    const shortAuthor = author.length > 18 ? author.slice(0, 17) + '…' : author
    const shortBranch = branch.length > 22 ? branch.slice(0, 21) + '…' : branch
    table.push([
      color(date),
      color(String(daysAgo)),
      chalk.dim(shortAuthor),
      color(shortBranch),
    ])
  }
  console.log(table.toString())

  console.log()
  warn(`${stale.length} stale branches out of ${remoteBranches.length} total.`)
  info(`Consider pruning with: git remote prune origin`)
  console.log()
}
