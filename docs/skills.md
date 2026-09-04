# Claude Code skills

This repo pins the [Claude Code](https://docs.claude.com/en/docs/claude-code)
skills it uses in [`skills-lock.json`](../skills-lock.json), the same way
`package-lock.json` pins npm dependencies.

- **Committed:** `skills-lock.json` — the manifest (source repo + content hash).
- **Ignored:** `.claude/skills/` — the installed skill source, treated like
  `node_modules`. Never edit it in place; it is reinstalled from the lockfile.

## Skills in use

| Skill | Source | What it does |
| --- | --- | --- |
| `archify` | [`tt-a1i/archify`](https://github.com/tt-a1i/archify) | Generates validated, interactive architecture / workflow / sequence diagrams as standalone HTML. |

## Installing after a fresh clone

`.claude/skills/` is gitignored, so a fresh clone has the lockfile but no skill
source. Reinstall with whatever tool manages `skills-lock.json` for you, or do it
by hand — the lockfile's `source` + `skillPath` tell you exactly what to fetch:

```bash
# archify: copy the repo's archify/ subtree into .claude/skills/archify
tmp=$(mktemp -d)
git clone --depth 1 https://github.com/tt-a1i/archify "$tmp"
mkdir -p .claude/skills
cp -R "$tmp/archify" .claude/skills/archify
rm -rf "$tmp"
```

Claude Code auto-discovers anything under `.claude/skills/`, so no extra config
is needed once the source is in place. Verify with:

```bash
node .claude/skills/archify/bin/archify.mjs doctor
```

## Regenerating the architecture diagram

The diagram source of truth is the committed spec, not the rendered HTML:

```bash
node .claude/skills/archify/bin/archify.mjs deliver architecture \
  docs/architecture/anchor.architecture.json \
  docs/architecture/anchor-architecture.html --quality showcase
```
