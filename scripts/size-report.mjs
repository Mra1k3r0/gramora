import { statSync, readdirSync } from "node:fs";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");

const walk = (dir) => {
  const entries = readdirSync(dir, { withFileTypes: true });
  let total = 0;
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      total += walk(fullPath);
    } else {
      total += statSync(fullPath).size;
    }
  }
  return total;
};

const totalBytes = walk(distDir);
const kb = (totalBytes / 1024).toFixed(2);

console.log("Gramora size report");
console.log(`dist_total_bytes: ${totalBytes}`);
console.log(`dist_total_kb: ${kb}`);
