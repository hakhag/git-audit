import chalk from 'chalk'
import { git, header, makeTable, heatColor, isExcluded } from '../lib/git.js'

interface ChurnOptions {
  since?: string
  top?: number
}

export function churn({
  since = '1 year ago',
  top = 20,
}: ChurnOptions = {}): void {
  header('FILE CHURN', `Top ${top} most-changed files since "${since}"`)

  const raw = git(`log --format=format: --name-only --since="${since}"`)
  if (!raw) {
    console.log(chalk.dim('  No commits found in this range.\n'))
    return
  }

  const counts: Record<string, number> = {}
  for (const line of raw.split('\n')) {
    const f = line.trim()
    if (f && !isExcluded(f)) counts[f] = (counts[f] || 0) + 1
  }

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)

  const table = makeTable(['Commits', 'File'], [10, 70])
  sorted.forEach(([file, count], i) => {
    const color = heatColor(i, sorted.length)
    table.push([color(String(count)), color(file)])
  })
  console.log(table.toString())

  if (sorted.length > 0) {
    console.log()
    console.log(
      chalk.dim(
        '  Tip: High churn + high bug count = your biggest risk. Cross-reference with `git-audit bugs`.',
      ),
    )
  }
  console.log()
}
