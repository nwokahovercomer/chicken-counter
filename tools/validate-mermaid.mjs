// Parses every ```mermaid block in the given files/folders with the real Mermaid parser,
// so a broken diagram fails CI instead of silently rendering as an error box on the site.
// Usage: node tools/validate-mermaid.mjs docs README.md
import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
globalThis.window = dom.window;
globalThis.document = dom.window.document;
const { default: mermaid } = await import("mermaid");

function* markdownFiles(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) { yield target; return; }
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) { if (!["node_modules", ".git", "site"].includes(entry.name)) yield* markdownFiles(full); }
    else if (entry.name.endsWith(".md")) yield full;
  }
}

let checked = 0, invalid = 0;
for (const target of process.argv.slice(2)) {
  for (const file of markdownFiles(target)) {
    const text = fs.readFileSync(file, "utf8");
    for (const match of text.matchAll(/```mermaid\n([\s\S]*?)```/g)) {
      checked++;
      try { await mermaid.parse(match[1]); }
      catch (error) {
        invalid++;
        console.error(`INVALID diagram in ${file}\n  ${String(error.message || error).split("\n").slice(0, 3).join("\n  ")}`);
      }
    }
  }
}
console.log(`${checked} diagram(s) checked, ${invalid} invalid`);
process.exit(invalid ? 1 : 0);
