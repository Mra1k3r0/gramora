type LogLevel = "info" | "debug" | "warn" | "error";

const HEX_COLORS: Record<LogLevel, string> = {
  info: "#00D084",
  debug: "#5E9BFF",
  warn: "#FFB020",
  error: "#FF4D4F",
};

const TOKEN_COLORS = {
  scope: "#A26BFF",
  username: "#00E5FF",
  id: "#FFD166",
  key: "#7FDBFF",
  string: "#79E26D",
  number: "#FFC857",
  boolean: "#FF6FB5",
  null: "#BFBFBF",
  punctuation: "#C7C7C7",
};

const REDACTION_TOKENS = new Set<string>();
const SENSITIVE_KEYS = new Set([
  "token",
  "secrettoken",
  "providertoken",
  "password",
  "secret",
  "apikey",
  "accesstoken",
  "sessionid",
  "certificate",
  "passphrase",
  "authorization", // mask common auth headers
]);

/** Registers a sensitive token (like the bot token) to be replaced with [REDACTED] in all logs. */
export const addRedactionToken = (token: string) => {
  if (token) {
    REDACTION_TOKENS.add(token);
  }
};

/** Test helper: clears registered redaction tokens to avoid cross-test leakage. */
export const clearRedactionTokensForTests = () => {
  REDACTION_TOKENS.clear();
};

const redact = (text: unknown): string => {
  const str = typeof text === "string" ? text : String(text);
  let result = str;
  for (const token of REDACTION_TOKENS) {
    result = result.split(token).join("[REDACTED]");
  }
  return result;
};

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
};

const colorize = (text: string, hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;
};

const colorizeBg = (text: string, hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  return `\x1b[48;2;${r};${g};${b}m\x1b[38;2;15;15;15m${text}\x1b[0m`;
};

export const highlightUsername = (value: string) => colorize(value, TOKEN_COLORS.username);
export const highlightId = (value: string | number) => colorize(String(value), TOKEN_COLORS.id);

/** Latency tiers for `formatProxyProbeMessage` speed coloring (round-trip `getMe` via proxy). */
const PROXY_SPEED_GOOD_MS = 1500;
const PROXY_SPEED_WARN_MS = 4000;
const PROXY_SPEED_HEX = { good: "#22c55e", warn: "#fbbf24", bad: "#f87171" } as const;

function proxySpeedHex(ms: number): string {
  if (ms < PROXY_SPEED_GOOD_MS) return PROXY_SPEED_HEX.good;
  if (ms < PROXY_SPEED_WARN_MS) return PROXY_SPEED_HEX.warn;
  return PROXY_SPEED_HEX.bad;
}

/** One-line JSON-like proxy status for the terminal (keys / punctuation / values colored; speed by latency). */
export function formatProxyProbeMessage(input: {
  is_working: boolean;
  speedMs: number;
  error?: string;
}): string {
  const p = (s: string) => colorize(s, TOKEN_COLORS.punctuation);
  const key = (name: string) => colorize(`"${name}"`, TOKEN_COLORS.key);
  const boolColor = input.is_working ? PROXY_SPEED_HEX.good : PROXY_SPEED_HEX.bad;
  const boolPart = colorize(String(input.is_working), boolColor);
  const speedPart = colorize(`${String(input.speedMs)}ms`, proxySpeedHex(input.speedMs));
  let body = `${p("{")} ${key("is_working")}${p(":")} ${boolPart}${p(",")} ${key("speed")}${p(":")} ${speedPart}`;
  if (input.error !== undefined) {
    body += `${p(",")} ${key("error")}${p(":")} ${colorize(JSON.stringify(redact(input.error)), TOKEN_COLORS.string)}`;
  }
  return `${body} ${p("}")}`;
}

export const log = (level: LogLevel, scope: string, message: string) => {
  const levelTag = colorizeBg(` ${level} `, HEX_COLORS[level]);
  const scopeTag = colorize(`${scope}:`, TOKEN_COLORS.scope);
  const redactedMessage = redact(message);
  const line = `${levelTag} ${scopeTag} ${redactedMessage}`;
  if (level === "warn") {
    console.warn(line);
    return;
  }
  if (level === "error") {
    console.error(line);
    return;
  }
  console.log(line);
};

const indent = (depth: number) => "  ".repeat(depth);

const stringifyPrimitive = (value: unknown) => {
  if (typeof value === "string") return colorize(`"${redact(value)}"`, TOKEN_COLORS.string);
  if (typeof value === "number") return colorize(String(value), TOKEN_COLORS.number);
  if (typeof value === "boolean") return colorize(String(value), TOKEN_COLORS.boolean);
  if (value === null) return colorize("null", TOKEN_COLORS.null);
  return colorize(String(value), TOKEN_COLORS.string);
};

const prettyObject = (value: unknown, depth = 0): string => {
  if (value === null || typeof value !== "object") {
    return stringifyPrimitive(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return colorize("[]", TOKEN_COLORS.punctuation);
    const items = value.map((item) => `${indent(depth + 1)}${prettyObject(item, depth + 1)}`);
    return `${colorize("[", TOKEN_COLORS.punctuation)}\n${items.join(",\n")}\n${indent(depth)}${colorize("]", TOKEN_COLORS.punctuation)}`;
  }

  const keys =
    value instanceof Error
      ? Object.getOwnPropertyNames(value) // include non-enumerable properties like message and stack for redaction
      : Object.keys(value as Record<string, unknown>);

  if (keys.length === 0) return colorize("{}", TOKEN_COLORS.punctuation);
  const lines = keys.map((k) => {
    const v = (value as Record<string, unknown>)[k];
    const key = colorize(`"${k}"`, TOKEN_COLORS.key);
    const normalizedK = k.toLowerCase().replace(/[_-]/g, "");
    const isSensitive =
      SENSITIVE_KEYS.has(normalizedK) ||
      normalizedK.endsWith("token") ||
      normalizedK.endsWith("password") ||
      normalizedK.endsWith("secret") ||
      normalizedK.endsWith("passphrase");
    const val = isSensitive
      ? colorize('"[MASKED]"', TOKEN_COLORS.string)
      : prettyObject(v, depth + 1);
    return `${indent(depth + 1)}${key}${colorize(":", TOKEN_COLORS.punctuation)} ${val}`;
  });
  return `${colorize("{", TOKEN_COLORS.punctuation)}\n${lines.join(",\n")}\n${indent(depth)}${colorize("}", TOKEN_COLORS.punctuation)}`;
};

export const stringifyForLog = (value: unknown) => {
  try {
    return prettyObject(value);
  } catch {
    return colorize(redact(String(value)), TOKEN_COLORS.string);
  }
};
