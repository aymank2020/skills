import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateCatalog } from "./validate-catalog.mjs";

function fixture(t, shipped = ["./skills/engineering/build-it"]) {
  const root = mkdtempSync(join(tmpdir(), "skills-catalog-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const dir of [".claude-plugin", "skills/engineering/build-it", "skills/productivity", "docs/engineering"])
    mkdirSync(join(root, dir), { recursive: true });
  writeFileSync(join(root, ".claude-plugin/plugin.json"), JSON.stringify({ skills: shipped }));
  writeFileSync(join(root, "README.md"), "[build-it](./skills/engineering/build-it/SKILL.md)");
  writeFileSync(join(root, "skills/engineering/build-it/SKILL.md"), "---\nname: build-it\ndescription: Build it.\n---\n");
  writeFileSync(join(root, "docs/engineering/build-it.md"), "# Build it\n");
  return root;
}

test("a discoverable promoted skill has consistent distribution files", t => {
  assert.deepEqual(validateCatalog(fixture(t)), []);
});
test("disconnecting plugin registration fails validation", t => {
  assert.match(validateCatalog(fixture(t, [])).join("\n"), /missing plugin registration/);
});
test("a beta skill cannot silently ship in the plugin", t => {
  assert.match(validateCatalog(fixture(t, ["./skills/engineering/build-it", "./skills/in-progress/beta"])).join("\n"), /not promoted/);
});
test("missing public documentation is reported", t => {
  const root = fixture(t);
  rmSync(join(root, "docs/engineering/build-it.md"));
  writeFileSync(join(root, "README.md"), "");
  assert.equal(validateCatalog(root).length, 2);
});
