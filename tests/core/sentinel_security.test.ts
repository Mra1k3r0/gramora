import { describe, expect, it } from "vitest";
import { WebhookTransport } from "../../src/core/polling";
import { stringifyForLog } from "../../src/core/logger";

describe("Sentinel Security Enhancements", () => {
  it("webhook responses should include security headers", async () => {
    const port = 10000 + Math.floor(Math.random() * 500);
    const transport = new WebhookTransport(async () => {});
    await transport.start({ port, path: "/webhook" });

    try {
      const response = await fetch(`http://127.0.0.1:${String(port)}/webhook`, {
        method: "GET", // Use GET to trigger 404 and check headers
      });

      expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    } finally {
      transport.stop();
    }
  });

  it("should mask new sensitive keys in objects", () => {
    const obj = {
      email: "user@example.com",
      phone: "+1234567890",
      phonenumber: "+0987654321",
      cardnumber: "1111-2222-3333-4444",
      cvv: "123",
      safe: "data",
    };

    const result = stringifyForLog(obj);

    expect(result).not.toContain("user@example.com");
    expect(result).not.toContain("+1234567890");
    expect(result).not.toContain("+0987654321");
    expect(result).not.toContain("1111-2222-3333-4444");
    expect(result).not.toContain("123");
    expect(result).toContain("[MASKED]");
    expect(result).toContain("data");
  });
});
