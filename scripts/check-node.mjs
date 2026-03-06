#!/usr/bin/env node
/**
 * Soft Node version guard.
 * Expo SDKs typically publish a minimum supported Node version (often Node 20.x for current SDKs).
 * We allow newer Node to avoid blocking installs, but print a clear warning.
 */
const v = process.versions.node || "";
const major = Number((v.split(".")[0] || "0").replace(/^v/, ""));
const minMajor = 20;

function warn(msg) {
  console.warn(`\n[Ntsiniz] ${msg}\n`);
}

if (!Number.isFinite(major) || major <= 0) {
  warn(`Could not parse Node version: "${v}". Proceeding, but builds may be unstable.`);
  process.exit(0);
}

if (major < minMajor) {
  warn(`Node ${v} is too old. Recommended: Node 20.x. You may hit Expo/Metro tooling issues.`);
} else if (major !== 20) {
  warn(
    `You are using Node ${v}. Recommended for Expo tooling: Node 20.x.\n` +
    `We allow this install to proceed, but if you hit Metro/Pods/Gradle issues, switch to Node 20 (Volta is easiest).`
  );
}
process.exit(0);
