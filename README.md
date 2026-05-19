# code-walkthrough

A [Claude Code](https://claude.com/claude-code) skill that turns a request like *"walk me through this codebase"* into a self-contained [reveal.js](https://revealjs.com/) slide deck — code snippets with syntax highlighting, clickable file:line links, and [Mermaid](https://mermaid.js.org/) diagrams for architecture and flow overviews.

The deck is served locally and opens in the browser. Once it's up, you drive (arrow keys, `space`, `esc` for overview, `s` for speaker notes) — there's no turn-by-turn back-and-forth with the model.

## How it works

1. You ask Claude to walk through something — a repo, a PR, a feature, a diff.
2. Claude plans an ordered tour (5–15 stops), typically bookended by an architecture diagram.
3. Each stop becomes a slide: code snippet + narrative, or Mermaid diagram + narrative.
4. Claude generates `index.html` from `template.html` into `/tmp/code-tour-<timestamp>/`, starts a local HTTP server, and opens the URL.

## Slide types

- **Code slides** — syntax-highlighted snippet with line highlighting (`data-line-numbers`), a clickable link to the source file at the exact line, narrative below, optional speaker notes.
- **Diagram slides** — a Mermaid block (architecture, C4, flowchart, sequence, class, state), rendered on slide change so SVGs get the right dimensions.
- **Vertical drill-downs** — nested `<section>`s let an overview stop expand into details on the down arrow.

## Mermaid diagram types

The skill ships syntax references for the diagram types most useful in code tours, under `references/mermaid/`:

| Use case | Type |
| --- | --- |
| Service topology, deployment shape | `architecture-beta` |
| Software architecture (context / container / component) | C4 |
| Control flow, decision logic | `flowchart` |
| API calls, async interactions | `sequenceDiagram` |
| Class hierarchies, OOP structure | `classDiagram` |
| State machines, lifecycle transitions | `stateDiagram-v2` |

References pulled from [WH-2099/mermaid-skill](https://github.com/WH-2099/mermaid-skill).

## Triggers

The skill activates on phrases like:

> walk me through · code walkthrough · explain this code · tour the codebase · review these changes · architecture overview · code tour · slide tour · deck this

## Installation

Clone into your Claude Code skills directory:

```bash
git clone git@github.com:axelv/claude-skill-code-walkthrough.git \
  ~/.claude/skills/code-walkthrough
```

Then trigger it from any Claude Code session with one of the phrases above.

## Repo layout

```
SKILL.md                  # skill instructions Claude follows
template.html             # reveal.js boilerplate with {{TITLE}} / {{SLIDES}} placeholders
references/mermaid/       # per-diagram-type syntax references
```

## Requirements

- Claude Code
- Python 3 (for the local server: `python3 -m http.server`)
- A modern browser (reveal.js 5 + Mermaid 11 loaded from jsDelivr)
