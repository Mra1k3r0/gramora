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

export const log = (level: LogLevel, scope: string, message: string) => {
  const levelTag = colorizeBg(` ${level} `, HEX_COLORS[level]);
  const scopeTag = colorize(`${scope}:`, TOKEN_COLORS.scope);
  const line = `${levelTag} ${scopeTag} ${message}`;
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
  if (typeof value === "string") return colorize(`"${value}"`, TOKEN_COLORS.string);
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

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return colorize("{}", TOKEN_COLORS.punctuation);
  const lines = entries.map(([k, v]) => {
    const key = colorize(`"${k}"`, TOKEN_COLORS.key);
    return `${indent(depth + 1)}${key}${colorize(":", TOKEN_COLORS.punctuation)} ${prettyObject(v, depth + 1)}`;
  });
  return `${colorize("{", TOKEN_COLORS.punctuation)}\n${lines.join(",\n")}\n${indent(depth)}${colorize("}", TOKEN_COLORS.punctuation)}`;
};

export const stringifyForLog = (value: unknown) => {
  try {
    return prettyObject(value);
  } catch {
    return colorize(String(value), TOKEN_COLORS.string);
  }
};
