import { describe, expect, it } from "vitest";
import { normalizeWebhookOrigin, buildWebhookUrl } from "../../src/core/webhook_helpers";
import { ValidationError } from "../../src/core/errors";

describe("webhook_helpers", () => {
  it("normalizeWebhookOrigin adds https and strips trailing slash", () => {
    expect(normalizeWebhookOrigin("example.com")).toBe("https://example.com");
    expect(normalizeWebhookOrigin("example.com/")).toBe("https://example.com");
  });

  it("upgrades http to https", () => {
    expect(normalizeWebhookOrigin("http://tunnel.local/")).toBe("https://tunnel.local");
  });

  it("preserves https and trims wrapper characters", () => {
    expect(normalizeWebhookOrigin(`"https://abc.example.test/"`)).toBe("https://abc.example.test");
  });

  it("buildWebhookUrl joins origin and path", () => {
    expect(buildWebhookUrl("http://x.test", "/hook")).toBe("https://x.test/hook");
    expect(buildWebhookUrl("https://y.test/", "telegram")).toBe("https://y.test/telegram");
  });

  it("throws ValidationError on empty origin", () => {
    expect(() => normalizeWebhookOrigin("")).toThrow(ValidationError);
    expect(() => normalizeWebhookOrigin("   ")).toThrow(ValidationError);
    expect(() => normalizeWebhookOrigin(`""`)).toThrow(ValidationError);
  });
});
