# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install          # Install dependencies
pnpm build            # Compile TypeScript → dist/
pnpm add --global .   # Build and install CLI globally
```

No test suite or lint commands exist — TypeScript strict mode is the primary correctness check.

## Architecture

git-audit is a CLI tool that mines git history to surface code health metrics. It runs entirely locally — no network calls, no state, no async.

**Main layers:**
- `bin/git-audit.ts` — Commander.js CLI entry point; registers all commands, runs `assertGitRepo()` as a `preAction` hook
- `commands/` — 12 independent command modules (churn, authors, bugs, velocity, fires, age, ownership, coupling, branches, first-week, hot, wip) each exporting a single function
- `lib/git.ts` — `git(cmd)` wraps `execSync`, returns trimmed stdout or empty string on error; `isExcluded(file)` filters out lockfiles
- `lib/display.ts` — `header()`, `makeTable()`, `warn()`, `info()`, `heatColor()` for all terminal output

**Data flow per command:**
1. Receive CLI options (`--since`, `--top`, `--min-count`)
2. Call `git()` to run shell commands
3. Parse raw output into `Record<string, number>` maps
4. Sort/filter to top N
5. Render via display utilities and exit

**Adding a new command:** Create `commands/newcmd.ts` exporting a single function, register it in `bin/git-audit.ts` with `.command()`, add it to the `all` meta-command block, and export from `commands/index.ts`.

**Heat coloring:** `heatColor(rank, total)` returns red (top 15%), yellow (15–35%), or white (35%+) — used to highlight risk in tables.

**Coupling algorithm:** Groups files per commit, generates all file pairs, counts co-occurrences across history, filters by `--min-count`.

## Code Style

Prettier config: no semicolons, single quotes. Matches existing files exactly.
