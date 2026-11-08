// Practice #07 Task 06 - deliberate defects (mutation trials).
// Usage: node scripts/mutate.mjs M1|M2|M3   (applies ONE small defect)
//        node scripts/mutate.mjs restore    (restores the correct code)
// The tests are never changed; only src/lib/availability.ts is mutated,
// starting from a backup copy of the correct code.
import { readFileSync, writeFileSync, copyFileSync, existsSync, unlinkSync } from "node:fs";

const FILE = "src/lib/availability.ts";
const BACKUP = "scripts/availability.ts.orig";
const MUTANTS = {
  // M1: reject duration >= 120 instead of > 120
  M1: ["if (duration > MAX_DURATION_MINUTES)", "if (duration >= MAX_DURATION_MINUTES)"],
  // M2: treat touching endpoints as an overlap
  M2: ["return aStart < bEnd && bStart < aEnd;", "return aStart <= bEnd && bStart <= aEnd;"],
  // M3: remove the blocked-room rejection (the branch can never run)
  M3: ["if (room.blocked) {", "if (false && room.blocked) {"],
};

const id = process.argv[2];
if (id === "restore") {
  if (existsSync(BACKUP)) {
    copyFileSync(BACKUP, FILE);
    unlinkSync(BACKUP);
  }
  console.log("restored correct " + FILE);
  process.exit(0);
}
const m = MUTANTS[id];
if (!m) {
  console.error("unknown mutant: " + id);
  process.exit(2);
}
if (!existsSync(BACKUP)) copyFileSync(FILE, BACKUP);
const src = readFileSync(BACKUP, "utf8");
if (!src.includes(m[0])) {
  console.error("pattern not found for " + id);
  process.exit(3);
}
writeFileSync(FILE, src.replace(m[0], m[1]));
console.log(id + " applied: '" + m[0] + "'  ->  '" + m[1] + "'");
