import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return walk(entryPath);
    }

    return [entryPath];
  });
}

const testsDir = path.resolve(".test-dist", "tests");

if (!fs.existsSync(testsDir)) {
  console.error("Compiled tests directory not found:", testsDir);
  process.exit(1);
}

const files = walk(testsDir)
  .filter((file) => file.endsWith(".test.js"))
  .sort();

if (files.length === 0) {
  console.error("No compiled test files were found.");
  process.exit(1);
}

const result = spawnSync(process.execPath, ["--test", ...files], {
  stdio: "inherit",
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
