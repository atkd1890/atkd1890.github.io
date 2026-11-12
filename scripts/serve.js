#!/usr/bin/env node
// Minimal static server for _site, used by e2e tests. Mirrors GitHub Pages: /dir → /dir/index.html,
// unknown paths → /404.html with status 404.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const root = join(process.cwd(), '_site');
const port = Number(process.env.PORT || 8090);
/** @type {Record<string, string>} */
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.xml': 'application/xml',
};

/** @param {string} p */
async function resolveFile(p) {
  const safe = normalize(decodeURIComponent(p)).replace(/^(\.\.[/\\])+/, '');
  let file = join(root, safe);
  const s = await stat(file).catch(() => null);
  if (s?.isDirectory()) file = join(file, 'index.html');
  return (await stat(file).catch(() => null))?.isFile() ? file : null;
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const file = await resolveFile(url.pathname);
  const target = file ?? join(root, '404.html');
  res.writeHead(file ? 200 : 404, { 'content-type': types[extname(target)] ?? 'application/octet-stream' });
  res.end(await readFile(target));
}).listen(port, () => console.log(`serving _site on http://localhost:${port}`));
