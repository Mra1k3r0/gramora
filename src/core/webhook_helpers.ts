import { ValidationError } from "./errors";

/**
 * Normalize a public webhook origin for Telegram (`setWebhook`): trims wrappers,
 * upgrades `http://` → `https://`, adds `https://` when missing, strips trailing slashes.
 * Does **not** interpret tunnel SDKs — pass whatever string your tool gives you (ngrok,
 * localtunnel, Cloudflare dev URLs, production hostname, …).
 *
 * Gramora applies this automatically when you pass **`domain`** to **`configureWebhook`**,
 * **`createWebhook`**, or **`launch({ transport: "webhook" })`**.
 *
 * @param raw — Required. Empty/whitespace-only after trim throws {@link ValidationError}.
 */
export function normalizeWebhookOrigin(raw: string): string {
  let s = raw.trim();
  if (!s) throw new ValidationError("webhook domain/origin must not be empty", "domain");

  s = s.replace(/^['"`<(]+/, "").trim();
  s = s.replace(/[`"'>)]+$/, "").trim();
  if (!s) throw new ValidationError("webhook domain/origin must not be empty", "domain");

  if (/^http:\/\//i.test(s)) {
    s = `https://${s.slice("http://".length)}`;
  }
  const withScheme = /^https:\/\//i.test(s) ? s : `https://${s}`;
  return withScheme.replace(/\/+$/, "");
}

/**
 * Full **`setWebhook`** URL: normalized **`https`** origin + webhook path segment.
 *
 * @param originOrRaw — Same accepted forms as {@link normalizeWebhookOrigin}.
 * @param mountPath — Required path segment; a leading **`/`** is added if missing.
 */
export function buildWebhookUrl(originOrRaw: string, mountPath: string): string {
  const base = normalizeWebhookOrigin(originOrRaw);
  const p = mountPath.startsWith("/") ? mountPath : `/${mountPath}`;
  return `${base}${p}`;
}
