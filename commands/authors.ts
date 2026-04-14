import chalk from 'chalk'
import { git } from '../lib/git.js'
import { header, makeTable, warn, info } from '../lib/display.js'

interface AuthorsOptions {
  since?: string
}

interface AuthorEntry {
  count: number
  author: string
}

export function authors({ since }: AuthorsOptions = {}): void {
  const sinceFlag = since ? `--since="${since}"` : ''
  const label = since ? `since "${since}"` : 'all time'
  header('AUTHORS & BUS FACTOR', `Contributor ranking — ${label}`)

  const raw = git(`shortlog -sn --no-merges ${sinceFlag} HEAD`)
  if (!raw) {
    console.log(chalk.dim('  No commits found.\n'))
    return
  }

  const lines = raw.split('\n').filter(Boolean)
  const entries: AuthorEntry[] = lines
    .map((line) => {
      const m = line.trim().match(/^(\d+)\s+(.+)$/)
      return m ? { count: parseInt(m[1], 10), author: m[2] } : null
    })
    .filter((e): e is AuthorEntry => e !== null)

  const total = entries.reduce((s, e) => s + e.count, 0)

  const table = makeTable(['Commits', '%', 'Author'], [10, 8, 44])
  entries.forEach((e, i) => {
    const pct = ((e.count / total) * 100).toFixed(1)
    const color = i === 0 ? chalk.cyan.bold : chalk.white
    table.push([color(String(e.count)), color(`${pct}%`), color(e.author)])
  })
  console.log(table.toString())

  if (entries.length > 0) {
    const top = entries[0]
    const topPct = (top.count / total) * 100
    console.log()
    if (topPct >= 60) {
      warn(
        `Bus factor risk: ${top.author} owns ${topPct.toFixed(0)}% of commits.`,
      )
    } else if (entries.length === 1) {
      warn(`Only 1 contributor — single point of failure.`)
    } else {
      info(`Top contributor: ${top.author} (${topPct.toFixed(0)}% of commits)`)
    }

    if (!since) {
      const recent = git(`shortlog -sn --no-merges --since="6 months ago" HEAD`)
      const recentAuthors = new Set(
        recent
          .split('\n')
          .filter(Boolean)
          .map((l) => l.trim().replace(/^\d+\s+/, '')),
      )
      const inactive = entries
        .slice(0, 5)
        .filter((e) => !recentAuthors.has(e.author))
        .map((e) => e.author)

      if (inactive.length) {
        warn(
          `Top contributors inactive in last 6 months: ${inactive.join(', ')}`,
        )
      }
    }
  }
  console.log()
}
