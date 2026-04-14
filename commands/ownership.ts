import chalk from 'chalk'
import { git, header, makeTable, info, isExcluded } from '../lib/git.js'

interface OwnershipOptions {
  top?: number
}

export function ownership({ top = 15 }: OwnershipOptions = {}): void {
  header('FILE OWNERSHIP', 'Who owns the most lines in the busiest files')

  const churnRaw = git(`log --format=format: --name-only --since="1 year ago"`)
  const churnCounts: Record<string, number> = {}
  for (const line of churnRaw.split('\n')) {
    const f = line.trim()
    if (f && !isExcluded(f)) churnCounts[f] = (churnCounts[f] || 0) + 1
  }

  const topFiles = Object.entries(churnCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([f]) => f)

  if (!topFiles.length) {
    console.log(chalk.dim('\n  No data.\n'))
    return
  }

  const table = makeTable(
    ['Top Owner', 'Own%', 'Contributors', 'File'],
    [22, 7, 14, 25],
  )

  for (const file of topFiles) {
    const blame = git(`blame --line-porcelain "${file}" 2>/dev/null`)
    if (!blame) continue

    const authorLines: Record<string, number> = {}
    for (const line of blame.split('\n')) {
      if (line.startsWith('author ')) {
        const author = line.replace('author ', '').trim()
        authorLines[author] = (authorLines[author] || 0) + 1
      }
    }

    const totalLines = Object.values(authorLines).reduce((s, c) => s + c, 0)
    if (!totalLines) continue

    const sorted = Object.entries(authorLines).sort((a, b) => b[1] - a[1])
    const [topAuthor, topCount] = sorted[0]
    const pct = ((topCount / totalLines) * 100).toFixed(0)
    const contribs = sorted.length

    const color =
      parseInt(pct) > 80
        ? chalk.red
        : parseInt(pct) > 60
          ? chalk.yellow
          : chalk.green
    const shortAuthor =
      topAuthor.length > 18 ? topAuthor.slice(0, 16) + '..' : topAuthor
    const shortFile = file.length > 23 ? '…' + file.slice(-22) : file

    table.push([
      color(shortAuthor),
      color(`${pct}%`),
      chalk.white(String(contribs)),
      chalk.dim(shortFile),
    ])
  }

  console.log(table.toString())
  console.log()
  info(`Red = one person owns 80%+ of a high-churn file. High bus factor risk.`)
  console.log()
}
