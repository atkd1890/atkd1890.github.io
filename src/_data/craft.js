// Proof of craft for /colophon, read from the repo at build time (logic in lib/craft.js).
import { fileURLToPath } from 'node:url';
import { collectCraft } from '../../lib/craft.js';

export default () => collectCraft(fileURLToPath(new URL('../..', import.meta.url)));
