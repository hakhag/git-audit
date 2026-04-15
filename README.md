# git-audit

> Diagnose a git repository before reading any code.

A CLI that surfaces churn hotspots, bus factor, bug clusters, velocity trends, and more — in seconds, directly from commit history.

## Install

**From GitHub (no clone needed):**

```bash
pnpm add --global hakhag/git-audit
```

**From a local clone:**

```bash
pnpm add --global .
```

**Without installing (npx):**

```bash
npx hakhag/git-audit all
```

Then run from any git repo:

```bash
git-audit
```

## Development

After editing any `.ts` file, rebuild before the changes take effect:

```bash
pnpm build           # compile once
pnpm add --global .  # rebuild + reinstall globally
```

## Commands

| Command      | What it tells you                                                 |
| ------------ | ----------------------------------------------------------------- |
| `churn`      | Top most-changed files — the ones people warn you about           |
| `authors`    | Contributor ranking + bus factor warnings                         |
| `bugs`       | Files most touched in fix/bug commits                             |
| `velocity`   | Monthly commit bar chart — is the team accelerating or dying?     |
| `fires`      | Revert / hotfix / emergency commit frequency                      |
| `age`        | Files not touched in 1+ year — dead or forgotten code             |
| `ownership`  | Per-file blame ownership of top churned files                     |
| `coupling`   | Files that always change together — hidden dependencies           |
| `branches`   | Stale remote branches with no recent activity                     |
| `first-week` | Commits from the first two weeks — original project intent        |
| `hot`        | Files actively changing in the last 2 weeks + who's touching them |
| `wip`        | WIP / hack / temp commits that made it to main — debt signals     |
| `all`        | Run everything                                                    |

## Options

Most commands accept:

```bash
--since "6 months ago"   # lookback window
--top 10                 # number of results
```

## Examples

```bash
git-audit all
git-audit churn --since "6 months ago" --top 10
git-audit bugs --top 5
git-audit authors --since "3 months ago"
git-audit coupling --min-count 5
```

## Privacy

This tool runs entirely on your local machine. It only executes `git` commands, parses their output, and prints results to your terminal. No data leaves your machine — no AI, no network calls, no telemetry. Safe to use on proprietary or confidential codebases.

## Credits

Inspired by [The Git Commands I Run Before Reading Any Code](https://piechowski.io/post/git-commands-before-reading-code/) by Ally Piechowski.
