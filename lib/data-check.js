// Health of the GitHub data a build used (.cache/github-status.json, written by lib/github-load.js).
// Permission errors fail the deploy: a query that needs more than Metadata: read-only (ADR 0004) would
// otherwise fall back to the snapshot without anyone noticing. Everything else is a warning.

const PERMISSION = /FORBIDDEN|INSUFFICIENT_SCOPES|HTTP 403|not accessible/i;

/**
 * @param {{source?: string, privateToken?: boolean, expected?: number, fetched?: number, problems?: string[]}|null} status
 * @returns {{errors: string[], warnings: string[]}}
 */
export function checkStatus(status) {
  if (!status) return { errors: ['no .cache/github-status.json: the GitHub data loader did not run'], warnings: [] };
  const problems = status.problems ?? [];
  const errors = problems.filter((p) => PERMISSION.test(p)).map((p) => `token permission: ${p}`);
  const warnings = problems.filter((p) => !PERMISSION.test(p));
  if (status.source !== 'live') warnings.push(`data source is ${status.source}, not live`);
  if (status.privateToken && (status.fetched ?? 0) < (status.expected ?? 0))
    warnings.push(`private stats for ${status.fetched} of ${status.expected} codenames`);
  return { errors, warnings };
}
