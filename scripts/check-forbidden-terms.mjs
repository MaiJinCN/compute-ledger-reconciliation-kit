import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const forbidden = [
  "\u901f\u64ad",
  ["running", "hub"].join(""),
  ["Running", "Hub"].join(""),
  ["RUNNING", "HUB"].join("")
];
const ignoredDirs = new Set([".git", "node_modules", "coverage", "dist", "tmp"]);

function walk(dir, files = []) {
  for (const item of readdirSync(dir)) {
    if (ignoredDirs.has(item)) continue;
    const full = join(dir, item);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

const hits = [];
for (const file of walk(root)) {
  const text = readFileSync(file, "utf8");
  for (const term of forbidden) {
    if (text.includes(term)) {
      hits.push(`${file}: ${term}`);
    }
  }
}

if (hits.length > 0) {
  console.error("Forbidden terms found:");
  for (const hit of hits) console.error(`- ${hit}`);
  process.exit(1);
}

console.log("No forbidden terms found.");
