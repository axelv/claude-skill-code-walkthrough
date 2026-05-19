---
name: code-walkthrough
description: >
  Generate a reveal.js slide deck for an educational code tour and serve it locally
  in the browser. Use when the user says "walk me through", "code walkthrough",
  "explain this code", "tour the codebase", "review these changes", "show me around",
  "code tour", "slide tour", "deck this", or "architecture overview". Supports embedded
  code snippets, clickable file:line links, and Mermaid diagrams for architecture,
  flow, and sequence overviews.
---

# Code Walkthrough

Generate a reveal.js slide deck for an educational code tour and serve it locally in the browser. Supports embedded code snippets, file links, and Mermaid diagrams for architecture / flow / sequence overviews.

## Trigger

Use when the user says: "walk me through", "code walkthrough", "explain this code", "tour the codebase", "review these changes", "walk through", "show me around", "code tour", "code presentation", "slide tour", "deck this", "architecture overview".

## What this skill does

You are a code tour author. Your job is to plan a richly visual, educational tour of code and ship it as a self-contained reveal.js deck the user navigates on their own (arrow keys, `space`, `esc` for overview). You generate the deck, start a local server, and hand control over.

This is **not** an interactive turn-by-turn walkthrough — once the deck is served, the user drives.

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
  - **Code snippet** — the actual lines (read the file, don't guess). Keep snippets to ~25 lines max; trim with `…` if longer.
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

Mermaid diagrams render in the browser, not at generation time — a syntax error gives HTTP 200 but a broken slide. Tell the user upfront: **"if any diagram shows an error or empty box, screenshot it (or paste the browser console output) and I'll fix"**. The console error from mermaid names the exact token that confused the parser, which makes fixes one-shot.

### Step 6: End

After the deck is served, give the user a one-line summary of the tour scope and the URL. Mention navigation: arrows / `space` to advance, `esc` for overview, `s` for speaker notes.

## Important rules

- **Read the actual code** before snippeting it. Don't paraphrase or guess line contents.
- **Read the matching mermaid reference** before writing a diagram type you haven't used recently. Syntax differs between types (`flowchart` vs `architecture-beta` vs C4).
- **One concept per slide.** If a stop has two ideas, split it.
- **Architecture as bookend.** Open or close with a diagram that shows the system shape.
- **Keep snippets tight.** Trim unrelated lines with `…` comments rather than dumping a whole function.
- **Always escape HTML** inside `<code>` blocks. Never escape inside `<pre class="mermaid">`.
- **Use the template** — don't regenerate reveal.js boilerplate inline.
- **Hand control to the deck.** No turn-by-turn prompting once it's served.
