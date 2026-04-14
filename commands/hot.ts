import chalk from 'chalk'
import { git, header, makeTable, info, isExcluded } from '../lib/git.js'

interface HotOptions {
  since?: string
  top?: number
}

export function hot({ since = '2 weeks ago', top = 20 }: HotOptions = {}): void {
  header('HOT FILES', `Files actively changing since "${since}"`)

  const raw = git(`log --format=COMMIT:%an --name-only --since="${since}"`)
  if (!raw) {
    console.log(chalk.dim('  No commits found in this range.\n'))
    return
  }

  const counts: Record<string, number> = {}
  const authors: Record<string, Set<string>> = {}
  let currentAuthor = ''

  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('COMMIT:')) {
      currentAuthor = trimmed.slice(7)
    } else if (trimmed && !isExcluded(trimmed)) {
      counts[trimmed] = (counts[trimmed] || 0) + 1
      if (!authors[trimmed]) authors[trimmed] = new Set()
      authors[trimmed].add(currentAuthor)
    }
  }

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)

  if (!sorted.length) {
    console.log(chalk.dim('  No file changes found in this range.\n'))
    return
  }

  const table = makeTable(['Commits', 'Authors', 'File'], [10, 24, 34])
  for (const [file, count] of sorted) {
    const fileAuthors = [...(authors[file] ?? [])].join(', ')
    const shortAuthors =
      fileAuthors.length > 22 ? fileAuthors.slice(0, 21) + '…' : fileAuthors
    const color = count >= 5 ? chalk.red : count >= 2 ? chalk.yellow : chalk.white
    table.push([color(String(count)), chalk.dim(shortAuthors), color(file)])
  }
  console.log(table.toString())

  console.log()
  info(`These files are in active flux — high chance of conflicts or recent context.`)
  info(`Check with the authors before making changes.`)
  console.log()
}
