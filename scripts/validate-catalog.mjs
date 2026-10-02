#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Check the files consumers actually discover, rather than a second skill list.
export function validateCatalog(root) {
  const errors = [];
  const plugin = JSON.parse(readFileSync(join(root, ".claude-plugin/plugin.json"), "utf8"));
  const readme = readFileSync(join(root, "README.md"), "utf8");
  const promoted = [];
  for (const bucket of ["engineering", "productivity"]) {
    for (const entry of readdirSync(join(root, "skills", bucket), { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const relative = `./skills/${bucket}/${entry.name}`;
      const skill = join(root, relative, "SKILL.md");
      if (!existsSync(skill)) continue;
      promoted.push(relative);
      const source = readFileSync(skill, "utf8");
      const name = source.match(/^name:\s*(.+?)\s*$/m)?.[1]?.replace(/^(['"])(.*)\1$/, "$2");
      if (name !== entry.name) errors.push(`${relative}: frontmatter name must match directory`);
      if (!readme.includes(`(${relative}/SKILL.md)`)) errors.push(`${relative}: missing README link`);
      if (!existsSync(join(root, "docs", bucket, `${entry.name}.md`))) errors.push(`${relative}: missing human-facing docs`);
    }
  }
  const shipped = plugin.skills;
  if (!Array.isArray(shipped)) return [...errors, "plugin.skills must be an array"];
  for (const relative of promoted) {
    if (!shipped.includes(relative)) errors.push(`${relative}: missing plugin registration`);
  }
  for (const relative of shipped) {
    if (!promoted.includes(relative)) errors.push(`${relative}: plugin entry is missing or not promoted`);
  }
  for (const match of readme.matchAll(/\((\.\/skills\/[^)]+)\/SKILL\.md\)/g)) {
    if (!promoted.includes(match[1])) errors.push(`${match[1]}: README advertises a non-promoted skill`);
  }
  if (new Set(shipped).size !== shipped.length) errors.push("plugin.skills contains duplicate entries");
  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const errors = validateCatalog(join(dirname(fileURLToPath(import.meta.url)), ".."));
    if (errors.length) {
      process.stderr.write(errors.join("\n") + "\n");
      process.exitCode = 1;
    } else console.log("Promoted skill catalog, plugin registration, README links and docs agree.");
  } catch (error) {
    console.error(`Catalog validation failed: ${error.message}`);
    process.exitCode = 1;
  }
}
