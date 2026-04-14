import chalk from 'chalk'
import { git, header, warn, info } from '../lib/git.js'

export function velocity(): void {
  header('COMMIT VELOCITY', 'Monthly commit count — full project history')

  const raw = git(`log --format='%ad' --date=format:'%Y-%m'`)
  if (!raw) {
    console.log(chalk.dim('  No commits found.\n'))
    return
  }

  const counts: Record<string, number> = {}
  for (const line of raw.split('\n')) {
    const m = line.trim().replace(/'/g, '')
    if (m) counts[m] = (counts[m] || 0) + 1
  }

  const months = Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]))
  if (!months.length) return

  const maxCount = Math.max(...months.map(([, c]) => c))
  const barWidth = 40

  console.log()
  for (const [month, count] of months) {
    const filled = Math.round((count / maxCount) * barWidth)
    const bar = '█'.repeat(filled) + chalk.dim('░'.repeat(barWidth - filled))
    const label = String(count).padStart(5)

    const pct = count / maxCount
    let barColor
    if (pct > 0.75) barColor = chalk.green
    else if (pct > 0.4) barColor = chalk.cyan
    else if (pct > 0.15) barColor = chalk.yellow
    else barColor = chalk.red

    console.log(
      `  ${chalk.dim(month)}  ${barColor(bar)}  ${chalk.white(label)}`,
    )
  }

  if (months.length >= 3) {
    const recent = months.slice(-3).map(([, c]) => c)
    const older = months.slice(-6, -3).map(([, c]) => c)
    if (older.length) {
      const recentAvg = recent.reduce((s, c) => s + c, 0) / recent.length
      const olderAvg = older.reduce((s, c) => s + c, 0) / older.length
      const change = ((recentAvg - olderAvg) / olderAvg) * 100
      console.log()
      if (change < -40) {
        warn(
          `Velocity down ${Math.abs(change).toFixed(0)}% vs 3 months prior — team losing momentum.`,
        )
      } else if (change > 40) {
        info(
          `Velocity up ${change.toFixed(0)}% vs 3 months prior — accelerating.`,
        )
      } else {
        info(`Velocity roughly stable over the last 6 months.`)
      }
    }
  }
  console.log()
}
