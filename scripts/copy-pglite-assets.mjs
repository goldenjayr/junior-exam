import { mkdirSync, copyFileSync, rmSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "node_modules/@electric-sql/pglite/dist");
const destDir = join(root, "public/pglite");

if (!existsSync(join(srcDir, "index.js"))) {
  console.warn(
    "[copy-pglite-assets] @electric-sql/pglite not installed; skipping"
  );
  process.exit(0);
}

rmSync(destDir, { recursive: true, force: true });
mkdirSync(destDir, { recursive: true });

const files = readdirSync(srcDir).filter(
  (name) =>
    name === "index.js" ||
    name === "pglite.wasm" ||
    name === "initdb.wasm" ||
    name === "pglite.data" ||
    (name.startsWith("chunk-") && name.endsWith(".js"))
);

for (const file of files) {
  copyFileSync(join(srcDir, file), join(destDir, file));
}

console.log(
  `[copy-pglite-assets] copied ${files.length} files to public/pglite`
);
