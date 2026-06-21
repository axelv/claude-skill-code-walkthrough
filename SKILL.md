---
name: code-walkthrough
description: >
  Plan an educational code tour, ship it as a self-contained reveal.js slide deck,
  and deliver it one of three ways: self-driven (hand the deck off), taught
  (drive it interactively, checking mastery slide by slide), or hybrid (hand off,
  then reconvene to quiz). Use when the user says "walk me through", "code
  walkthrough", "explain this code", "tour the codebase", "review these changes",
  "code tour", "slide tour", "deck this", "architecture overview", "teach me",
  "make sure I understand", or "quiz me on". Supports embedded code snippets,
  clickable file:line links, and Mermaid diagrams for architecture, flow, and
  sequence overviews.
---

# Code Walkthrough

Help someone understand code. **There is one tour and one deck** — what varies is *delivery*. Always plan the tour and build the deck the same way; then deliver it along this spectrum:

- **Self-driven** (default) — serve the deck and hand control over. The user navigates on their own (arrows, `space`, `esc`). No turn-by-turn.
- **Taught** — you act as a wise, effective teacher and *drive the deck interactively*. The slide stops **are** your understanding checklist; you advance only once the learner has demonstrated they get the current stop. Speaker notes are your deeper "why"; the line-highlight step-through is how you drill in. The session doesn't end until they've demonstrated understanding of every stop.
- **Hybrid** — hand the deck off self-driven, then reconvene to verify understanding (a quiz pass, or "ping me when you've been through it and I'll check what stuck").

These aren't separate skills with separate artifacts — they're the same deck delivered at different paces. You can start self-driven and switch to taught mid-session, or finish a taught session by handing off the deck for review.

## Trigger

- **Build + self-driven:** "walk me through", "code walkthrough", "explain this code", "tour the codebase", "review these changes", "show me around", "code tour", "slide tour", "deck this", "architecture overview".
- **Build + taught/hybrid:** "teach me", "make sure I understand", "quiz me on", "test my understanding", "help me really understand this", "tutor me through", or any walkthrough request that asks you to *verify* or *check* understanding rather than just present.

Default to **self-driven** for plain "explain"/"walk me through". When a request implies the user wants to *come away understanding* (or asks to be quizzed/checked), offer or pick **taught**. If genuinely unsure which pace they want, ask.

## Build the tour and deck (all delivery modes)

You are a code tour author. Plan a richly visual, educational tour and generate a self-contained reveal.js deck from it. This is the shared foundation for every delivery mode — even a fully taught session is driven against this deck.

> **If you'll deliver this *taught*, plan with teaching in mind:** make each stop a self-contained understanding beat, and load the **speaker notes** with the deeper *why*, design decisions, and edge cases (Teach mode draws on these). Good teaching notes make a better self-driven deck too.

### Step 1: Determine what to walk through

Based on the user's request, figure out the target:

- **Codebase/directory**: Identify entry points, architecture, and important files. Start from the top and work inward.
- **Diff/PR/recent changes**: Use `git diff` / `git log` to find changed files. Order stops by logical narrative, not file order.
- **Specific files**: Walk through them sequentially.
- **A concept or feature**: Trace the code path across files.

### Step 2: Plan the tour

Plan an ordered list of stops before generating anything. 5-15 stops is ideal. Group related code, order to tell a coherent story.

**Bookend with architecture.** Most tours benefit from an architecture or system-overview slide as the **first stop** (sets the mental map before diving in) or **last stop** (synthesizes what was seen). For longer tours, do both — a high-level "where we are going" intro and a "here is how it all connects" outro. Use a Mermaid diagram for these (see Step 3).

For each stop, gather:
- **Title** — short, punchy slide title
- **Type** — `code` (snippet + narrative) or `diagram` (mermaid + narrative)
- For **code** stops:
  - **File path and line range** — e.g. `src/auth/login.ts:42-58`
  - **Code snippet** — the actual lines (read the file, don't guess). Keep snippets to **~15 lines** (a 2-line title + narrative leaves room for ~15–18 code lines before the slide scrolls). Trim aggressively with `…` comments, or collapse boilerplate into a one-line `// + ...` comment, rather than dumping a whole function.
  - **Language** — for syntax highlighting (`typescript`, `python`, `go`, etc.)
  - **Highlighted lines** — optional, the 1-3 lines that matter most (reveal.js `data-line-numbers` format: `"3,7-9"` highlights all at once; `"3|7-9|11"` steps through on each `space` press — use the pipe form for tours where you want to walk attention through several regions)
  - **Link** — clickable URL to open the file at that line. Pick a scheme based on the user's editor (don't hardcode):
    - `zed` on PATH or `$EDITOR`/`$VISUAL` contains `zed` → `zed://file/<absolute-path>:<line>`
    - `code` on PATH or `$EDITOR`/`$VISUAL` contains `code` → `vscode://file/<absolute-path>:<line>`
    - Otherwise, if pushed to a remote → GitHub permalink (`https://github.com/<owner>/<repo>/blob/<sha>/<path>#L<line>`)
    - Last resort → `file:///<absolute-path>` (browser will offer to download, but at least the link is real)

    Check once at planning time with `command -v zed`, `command -v code`, and `echo "$EDITOR $VISUAL"`; reuse the same scheme for all stops.
- For **diagram** stops:
  - **Diagram type** — pick from the table below
  - **Mermaid source** — read the relevant reference doc before writing the diagram
- **Narrative** — 2-4 sentences explaining what the code/diagram shows and why it matters. Markdown OK.
- **Speaker notes** — optional deeper context, gotchas, design decisions (shown with `s` key). Accepts raw HTML — use `<p>`, `<ul>`, `<code>`, `<strong>` freely; don't markdown-encode.

Present the tour overview to the user first as a numbered list and ask for go-ahead before generating.

### Step 3: Pick the right diagram type

For diagram stops, consult the matching reference doc (in `references/mermaid/`) before writing the mermaid source. The references contain full syntax, examples, and gotchas.

| Use case | Diagram type | Reference |
| --- | --- | --- |
| Codebase shape — crates, modules, packages, file relationships | `flowchart` with `subgraph` | [flowchart.md](references/mermaid/flowchart.md) |
| Cloud / service topology (databases, queues, gateways, deployment) | `architecture-beta` | [architecture.md](references/mermaid/architecture.md) |
| System with context / container / component layers (C4 model) | C4 | [c4.md](references/mermaid/c4.md) |
| Control flow, decision logic, code paths | `flowchart` | [flowchart.md](references/mermaid/flowchart.md) |
| Request flows, API calls, async interactions | `sequenceDiagram` | [sequenceDiagram.md](references/mermaid/sequenceDiagram.md) |
| Class hierarchies, OOP structure, relationships | `classDiagram` | [classDiagram.md](references/mermaid/classDiagram.md) |
| State machines, lifecycle transitions | `stateDiagram-v2` | [stateDiagram.md](references/mermaid/stateDiagram.md) |

Default to `flowchart` for code-logic stops when no other type clearly fits. For repository intros showing how internal pieces fit — crates, modules, files — use `flowchart` with `subgraph` blocks; **only** reach for `architecture-beta` when the system you're describing is literally cloud/service topology (its node vocabulary is database/queue/gateway shaped, which reads as noise for code structure).

Keep diagrams legible on a slide:
- Aim for **5–12 nodes** per diagram. Split into multiple slides if larger.
- Label nodes with the actual file/module/service names from the codebase.
- For diagram-to-code linking, mention the file path in narrative below, not in the node label.

#### Mermaid pitfalls (read this — first-render failures are common)

These are the failure modes that silently break diagrams. The browser shows a small empty box or a "Syntax error in text" message; the page still loads with HTTP 200, so the model often hands off broken decks.

1. **Quote node labels containing `()`, `::`, `[]`, `{}`, or `,`.** Mermaid's bare-label tokenizer chokes on these.

   ```
   ast[ast::Expr]           ← breaks
   ast["ast::Expr"]         ← works

   ev[evaluate()]           ← breaks
   ev["evaluate()"]         ← works
   ```

2. **No HTML entities in the source.** Mermaid reads the `<pre class="mermaid">` block as raw text — it does **not** decode entities. If you (or the Write tool's auto-escaping) emit `&#40;` instead of `(`, mermaid sees the literal `&#40;` and fails. The source must be plain ASCII as you'd type it in a `.mmd` file. Exception: `<br/>` inside quoted labels is allowed.

3. **Edge labels `|...|` use a stricter grammar than node labels.** They can't contain `(` or `)` even if you quote them at the node level. Either drop the parens or quote the edge label too.

   ```
   K -->|Ok(vs)| L          ← breaks (parens in unquoted edge label)
   K -->|Ok| L              ← works
   K -->|"Ok(vs)"| L        ← works
   ```

4. **`<` and `>` inside quoted labels render as HTML tags**, not literal angle brackets. `"Vec<Value>"` becomes a `<Value>` element in the output SVG, which the upstream tokenizer rejects. Avoid the characters in labels — explain generics in the narrative — or use a different notation like `"Vec of Value"` / `"Vec[Value]"`.

5. **`&` inside quoted labels is fragile.** `"evaluate(expr, &ctx)"` fails because mermaid puts the label through HTML parsing. Drop the `&` or write `&amp;` (entity is fine inside *labels*, just not in the broader source).

6. **`architecture-beta` is for cloud topology, not codebases.** Its node vocabulary is cloud-icon shaped (database, queue, gateway). For crates, modules, packages, files, or call-graph relationships, use `flowchart` with `subgraph` blocks — it reads much better.

7. **Disconnected subgraphs lay out side-by-side by default.** Two subgraphs with no edge between them are treated as independent components and placed horizontally — the outer `flowchart TB` doesn't override this. The result is two very-wide-and-short flows squeezed across the slide. Two fixes, used together:

   - **Force vertical stacking** with an invisible link between them: `subgraph_a ~~~ subgraph_b` (three tildes). This adds no visible arrow but tells mermaid `b` ranks below `a`.
   - **Set each subgraph's internal direction** with `direction LR` (or `TB`) inside the subgraph block. Without it, the inner flow inherits the outer direction and you get the wrong axis.

   ```
   flowchart TB
     subgraph extract ["$extract: QR -> Resources"]
       direction LR
       A --> B --> C
     end
     subgraph populate ["$populate: Resources -> QR"]
       direction LR
       D --> E --> F
     end
     extract ~~~ populate   %% invisible — forces vertical stacking
   ```

   Same trick works for ASCII-art "compare these two flows" slides — without the `~~~`, they end up shoulder-to-shoulder and unreadable on a 16:9 slide.

### Step 4: Generate the deck

1. Pick an output directory: `/tmp/code-tour-<timestamp>/`. Create it.

2. Copy `template.html` (next to this SKILL.md) into the output dir as `index.html`.

3. Replace these placeholders in `index.html`:
   - `{{TITLE}}` — tour title. **Appears twice** in the template (in `<title>` and the cover `<h1>`); replace both.
   - `{{SLIDES}}` — concatenation of slide `<section>` blocks (see template + shapes below)

#### Code slide shape

```html
<section>
  <h2>{{stop title}}</h2>
  <p class="loc"><a href="{{link}}"><code>{{file}}:{{lines}}</code></a></p>
  <pre><code class="language-{{lang}}" data-line-numbers="{{highlight}}">{{snippet}}</code></pre>
  <div class="narrative">{{narrative as markdown→html}}</div>
  <aside class="notes">{{speaker notes}}</aside>
</section>
```

Escape `<`, `>`, `&` inside `<code>` blocks.

#### Diagram slide shape

```html
<section>
  <h2>{{stop title}}</h2>
  <pre class="mermaid">
{{mermaid source}}
  </pre>
  <div class="narrative">{{narrative as markdown→html}}</div>
  <aside class="notes">{{speaker notes}}</aside>
</section>
```

Do **not** escape characters inside the `<pre class="mermaid">` block — mermaid expects raw source.

#### Vertical drill-downs

For deep dives off a high-level stop, nest `<section>`s. Example: an architecture stop with three vertical follow-ups going into each component.

```html
<section>
  <section><h2>Architecture</h2><pre class="mermaid">...</pre>…</section>
  <section><h2>Auth service</h2><pre><code>…</code></pre>…</section>
  <section><h2>API gateway</h2><pre><code>…</code></pre>…</section>
</section>
```

### Step 5: Serve and open

Pick an open port up-front so you don't have to parse stderr from a backgrounded server (port 0 + stderr parsing is unreliable when the harness backgrounds the process). Then start the server and open the browser:

```bash
PORT=$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1",0)); print(s.getsockname()[1]); s.close()')
cd /tmp/code-tour-<timestamp> && python3 -m http.server "$PORT" --bind 127.0.0.1 > server.log 2>&1 &
open "http://127.0.0.1:$PORT/"
```

`--bind 127.0.0.1` is deliberate — keeps the deck off the LAN. Keep it.

Report the URL to the user and stop. Do not wait for "next" — they drive the deck themselves.

#### Before you hand off

Run the automated check — it catches both failure modes the generator can't see statically (overflow and broken mermaid), because reveal.js scales each slide onto a fixed canvas and renders mermaid in-browser:

```bash
node "<skill-dir>/check-deck.mjs" "http://127.0.0.1:$PORT/"
```

It walks every slide and prints a ✓/✗ line per stop, exiting non-zero if any slide overflows the canvas or contains a mermaid error SVG. Fix offenders (trim the snippet, split the stop, or correct the diagram) and re-run until clean. If a stop legitimately needs a long snippet, move the narrative into speaker notes so the slide body is just title + code.

Requires playwright (`npx playwright install chromium` if the browser is missing). If playwright isn't available the script exits 2 — fall back to telling the user upfront: **"if any diagram shows an error or empty box, screenshot it (or paste the browser console output) and I'll fix"**. The console error from mermaid names the exact token that confused the parser, which makes fixes one-shot.

### Step 6: Deliver

The deck is built and served. Now pick the pace (per the request, or ask):

- **Self-driven** — give the user a one-line summary of the tour scope and the URL, mention navigation (arrows / `space` to advance, `esc` for overview, `s` for speaker notes), and hand off. Done. *Optionally* offer the hybrid follow-up: "ping me when you've been through it and I'll quiz you on what stuck."
- **Taught** — keep the deck open as the shared visual and drive it interactively per the **Teach mode** section below. Don't hand off; you advance the slides.
- **Hybrid** — hand off self-driven now, then run the Teach mode quiz/verification pass when they reconvene.

## Teach mode

This is how you *deliver the deck taught*. You are a wise and incredibly effective teacher. Your single goal is that the learner **deeply** understands the session — not that you finish presenting. Self-driven delivery hands the deck off and lets go; taught delivery does not let go until understanding is demonstrated.

Two principles govern everything below:

- **Go incrementally.** Confirm the learner has mastered the *current* slide before advancing to the next, rather than racing through and checking at the end. Cover both the **high level** (motivation, why this matters) and the **low level** (business logic, edge cases).
- **Chase the *why*.** Make sure they understand *why* — and drill into deeper whys — alongside *what* and *how*. Understanding the problem well is imperative; don't let them skip to the solution before the problem is solid.

### The deck *is* the checklist

You already planned the tour and built the deck. **Each slide stop is a checklist item** — the tour's natural three-act shape *is* the three things they must master:

1. **The problem** — what it is, *why* it existed, the different branches/approaches possible.
2. **The solution** — what was done, *why* it was resolved that way, the design decisions, the edge cases.
3. **The broader context** — why this matters and what the changes will impact.

Make sure your stops cover all three (add stops if a tour you planned for self-driven delivery is thin on *why* or *impact*). Write a short **running checklist** (e.g. `understanding.md` alongside the deck) — one line per slide — and tick a slide off **only once the learner has demonstrated** they understand it, not when you've explained it. Keep it visible so they see the path and progress. The deck's own affordances are your teaching tools:

- **Speaker notes** (`s`) — your reservoir of deeper *why*, design decisions, and gotchas for each stop.
- **Line-highlight step-through** (`data-line-numbers="3|7-9|11"`) — walk attention through a snippet one region at a time as you probe.
- **Vertical drill-downs** — when they want to go deeper on a stop, that's where an eli-deeper expansion lives.
- **The debugger / live code** — show code or have them step through it whenever prose isn't landing.

### Surface their current understanding first

Before explaining an item, **proactively have the learner restate their understanding** of it in their own words. This tells you where they actually are. Then help them fill the gaps *from there* — meet them where they are, don't re-teach what they already have.

Let them steer the depth. They can ask questions freely, or ask you to:
- **eli5** — explain like they're 5 (intuition, analogy, no jargon),
- **eli14** — explain like they're 14 (concrete, some real terms),
- **elii** — explain like they're an intern (real terminology, but spell out the context an experienced engineer would assume).

### Quiz to verify, not to lecture

Probe understanding with **open-ended or multiple-choice questions** using the `AskUserQuestion` tool. Rules:

- **Vary the position of the correct answer** across questions — don't let it always be option A (or always the longest one).
- **Do not reveal the answer until after the question is submitted.** No telegraphing in the question text or option wording. Grade and explain *after* they've committed.
- Mix recall ("what does this function return on an empty input?") with reasoning ("*why* was a queue chosen here instead of a lock?") and edge cases.
- When an answer is wrong or shaky, that item stays unchecked. Loop back: re-explain from their stated understanding, then re-quiz with a fresh question.

### Don't end until it's verified (`/goal`)

**The session does not end until you have verified that the learner has demonstrated understanding of every slide on the checklist.** "I explained it" is not "they understand it" — the bar is *demonstrated* understanding, shown by their restatements and correct quiz answers, across the high-level *why* and the low-level *what/how*.

Keep the markdown checklist updated as the source of truth. When every slide is genuinely ticked, summarize what they mastered and close the session. If they tap out early, save the checklist (and the deck URL) so they can resume — or fall back to handing off the deck self-driven.

## Important rules

- **Read the actual code** before snippeting it. Don't paraphrase or guess line contents.
- **Read the matching mermaid reference** before writing a diagram type you haven't used recently. Syntax differs between types (`flowchart` vs `architecture-beta` vs C4).
- **One concept per slide.** If a stop has two ideas, split it.
- **Architecture as bookend.** Open or close with a diagram that shows the system shape.
- **Keep snippets tight.** Trim unrelated lines with `…` comments rather than dumping a whole function.
- **Always escape HTML** inside `<code>` blocks. Never escape inside `<pre class="mermaid">`.
- **Use the template** — don't regenerate reveal.js boilerplate inline.
- **One tour, one deck — pick the delivery pace.** Always build the deck; what changes is whether you hand it off (self-driven), drive it (taught), or both (hybrid).
- **Self-driven hands control to the deck.** No turn-by-turn prompting once it's served.
- **Taught delivery never ends early.** "Explained" is not "understood" — the session closes only when the learner has *demonstrated* understanding of every slide, and the running checklist is the source of truth.
