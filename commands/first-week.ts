import chalk from 'chalk'
import { git } from '../lib/git.js'
import { header, info } from '../lib/display.js'

export function firstWeek(): void {
  header('ORIGIN STORY', 'Commits from the first two weeks of the project')

  const firstCommit = git(
    `log --reverse --format="%ad" --date=format:"%Y-%m-%d" | head -1`,
  )
  if (!firstCommit) {
    console.log(chalk.dim('\n  No commits found.\n'))
    return
  }

  const start = new Date(firstCommit)
  const end = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000)
  const endStr = end.toISOString().split('T')[0]

  const raw = git(
    `log --reverse --format="%ad|%an|%s" --date=format:"%Y-%m-%d" --after="${firstCommit}" --before="${endStr}"`,
  )

  const firstFull = git(
    `log --reverse --format="%ad %an: %s" --date=format:"%Y-%m-%d" | head -1`,
  )

  console.log()
  if (firstFull) {
    console.log(chalk.bold.cyan('  First commit:'))
    console.log(chalk.dim(`    ${firstFull}`))
    console.log()
  }

  if (!raw) {
    info('Only one commit in the first two weeks.')
    console.log()
    return
  }

  console.log(chalk.bold.cyan('  First two weeks of commits:'))
  for (const line of raw.split('\n').filter(Boolean).slice(0, 20)) {
    const [date, author, ...rest] = line.split('|')
    const subject = rest.join('|')
    console.log(`  ${chalk.dim(date)}  ${chalk.cyan(author)}  ${chalk.white(subject)}`)
  }

  console.log()
  info(`This shows the original intent and tech choices made under pressure.`)
  info(`"Move fast" code from week one often becomes the permanent foundation.`)
  console.log()
}
