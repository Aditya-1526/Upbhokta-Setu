/* eslint-disable no-console */
/**
 * i18n parity check — verifies en.ts and hi.ts have identical keys.
 * Run with: node i18n-parity.js
 */
const fs = require("fs");
const path = require("path");

function extractKeys(source) {
  const keys = new Set();
  const keyRegex = /(\w+)\s*:\s*(?:"[^"]*"|"[^"]*"|true|false|\d+)/g;
  let m;
  while ((m = keyRegex.exec(source)) !== null) {
    keys.add(m[1]);
  }
  return keys;
}

const en = fs.readFileSync(path.join(__dirname, "i18n", "index.ts"), "utf8");
const hi = fs.readFileSync(path.join(__dirname, "i18n", "index.ts"), "utf8");

// Both locales are in the same file — extract keys from each const block
const enMatch = en.match(/export const en:[\s\S]*?^\};/m);
const hiMatch = en.match(/export const hi:[\s\S]*?^\};/m);

if (!enMatch || !hiMatch) {
  console.error("Could not find en or hi const blocks in i18n/index.ts");
  process.exit(1);
}

const enKeys = extractKeys(enMatch[0]);
const hiKeys = extractKeys(hiMatch[0]);

const missingInHi = [...enKeys].filter((k) => !hiKeys.has(k));
const missingInEn = [...hiKeys].filter((k) => !enKeys.has(k));

let ok = true;
if (missingInHi.length) {
  console.error("Missing in hi:", missingInHi);
  ok = false;
}
if (missingInEn.length) {
  console.error("Missing in en:", missingInEn);
  ok = false;
}

if (ok) {
  console.log("i18n parity OK (" + enKeys.size + " keys, en ↔ hi)");
  process.exit(0);
} else {
  console.error("i18n parity FAILED");
  process.exit(1);
}
