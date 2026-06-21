# code-walkthrough

A [Claude Code](https://claude.com/claude-code) skill that helps you *understand* code. It turns a request like *"walk me through this codebase"* into a self-contained [reveal.js](https://revealjs.com/) slide deck — code snippets with syntax highlighting, clickable file:line links, and [Mermaid](https://mermaid.js.org/) diagrams.

**There's one tour and one deck; what varies is how it's delivered:**

- **Self-driven** (default) — the deck opens in the browser and you drive (arrow keys, `space`, `esc` for overview, `s` for speaker notes). No turn-by-turn back-and-forth.
- **Taught** — Claude acts as a teacher and drives the deck interactively. The slide stops *are* a mastery checklist (the problem, the solution, the broader context); Claude has you restate your understanding, drills into the *whys* using each slide's speaker notes and line-by-line highlights, and quizzes you with `AskUserQuestion`. The session doesn't end until you've demonstrated you understand every slide.
- **Hybrid** — drive the deck yourself, then reconvene and have Claude quiz you on what stuck.

Trigger the taught delivery with phrases like *"teach me"*, *"make sure I understand"*, *"quiz me on"*, or *"help me really understand this"*.

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
| Codebase shape — crates, modules, file relationships | `flowchart` + `subgraph` |
| Cloud / service topology (databases, queues, gateways) | `architecture-beta` |
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
