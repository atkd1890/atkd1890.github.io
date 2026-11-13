#!/usr/bin/env node
// After `npm run build` in Deploy: fails on token permission errors, warns on any other data problem.
// Usage: node scripts/check-data.js
import { existsSync, readFileSync } from 'node:fs';
import { checkStatus } from '../lib/data-check.js';

const file = '.cache/github-status.json';
const { errors, warnings } = checkStatus(existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null);
const gha = Boolean(process.env.GITHUB_ACTIONS);
for (const w of warnings) console.log(gha ? `::warning title=GitHub data::${w}` : `data: warning: ${w}`);
for (const e of errors) console.log(gha ? `::error title=GitHub data::${e}` : `data: error: ${e}`);
if (errors.length) process.exit(1);
console.log(`data: ok${warnings.length ? ` (${warnings.length} warning(s))` : ''}`);
