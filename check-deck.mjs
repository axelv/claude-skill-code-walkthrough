#!/usr/bin/env node
/**
 * Pre-handoff gate for a code-walkthrough deck.
 *
 * reveal.js scales each slide onto a fixed virtual canvas, so overflow can only
 * be measured live in a browser — not from the HTML. This walks every slide and
 * flags two things the generator cannot catch statically:
 *   1. Overflow — the slide's content is taller than the canvas (would scroll
 *      or clip). The flex-column layout in template.html should prevent this;
 *      this asserts it.
 *   2. Broken mermaid — a syntax error renders as an error SVG with HTTP 200, so
 *      it's invisible to a status check. Caught via aria-roledescription="error".
 *
 * Usage:  node check-deck.mjs http://127.0.0.1:<port>/
 * Exit:   0 = all slides clean, 1 = problems found, 2 = bad usage / no playwright.
 *
 * Requires playwright (`npx playwright install chromium` if the browser is
 * missing). If playwright isn't available, skip this step and fall back to
 * asking the user to eyeball the deck.
 */

const url = process.argv[2];
if (!url) {
  console.error("usage: node check-deck.mjs <deck-url>");
  process.exit(2);
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("playwright not installed — skipping automated check.");
  process.exit(2);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.Reveal && window.Reveal.isReady && window.Reveal.isReady());
await page.evaluate(() => window.Reveal.slide(0, 0));

const problems = [];
let idx = 0;

// eslint-disable-next-line no-constant-condition
while (true) {
  await page.waitForTimeout(380); // let the transition settle + mermaid render

  const report = await page.evaluate(() => {
    const s = document.querySelector(".reveal .slides section.present");
    if (!s) return null;
    const title = (s.querySelector("h1, h2")?.textContent || "").trim().replace(/\s+/g, " ").slice(0, 64);
    return {
      title,
      overflow: s.scrollHeight - s.clientHeight,
      mermaidError: !!s.querySelector('svg[aria-roledescription="error"], pre.mermaid.mermaid-error'),
    };
  });

  if (report) {
    const issues = [];
    if (report.overflow > 4) issues.push(`overflow +${report.overflow}px`);
    if (report.mermaidError) issues.push("mermaid error");
    console.log(`${issues.length ? "✗" : "✓"}  [${idx}] ${report.title || "(untitled)"}${issues.length ? "  — " + issues.join(", ") : ""}`);
    if (issues.length) problems.push({ idx, ...report, issues });
  }

  const hasNext = await page.evaluate(() => {
    const r = window.Reveal.availableRoutes();
    return r.right || r.down;
  });
  if (!hasNext) break;
  await page.evaluate(() => window.Reveal.next());
  idx++;
}

await browser.close();

if (problems.length) {
  console.error(`\n${problems.length} slide(s) need attention — trim the snippet or split the stop.`);
  process.exit(1);
}
console.log("\nAll slides fit the canvas, no mermaid errors.");
