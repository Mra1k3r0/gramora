import { describe, expect, it, vi } from "vitest";
import { createWebhookHandler } from "../src/core/polling";
import { IncomingMessage, ServerResponse } from "node:http";
import { EventEmitter } from "node:events";

describe("Webhook Security Enhancement", () => {
  it("should set security headers and handle socket errors", async () => {
    const onUpdate = vi.fn();
    const handler = createWebhookHandler({ onUpdate });

    const req = new EventEmitter() as unknown as IncomingMessage;
    req.method = "POST";
    req.url = "/webhook";
    req.headers = { "content-type": "application/json" };

    const res = {
      statusCode: 0,
      headers: {} as Record<string, string>,
      setHeader: vi.fn(function (
        this: { headers: Record<string, string> },
        name: string,
        value: string,
      ) {
        this.headers[name.toLowerCase()] = value;
      }),
      end: vi.fn(),
      writableEnded: false,
    } as unknown as ServerResponse;

    // Simulate request
    handler(req, res);

    // Check headers
    expect(res.setHeader).toHaveBeenCalled();
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("DENY");

    // Simulate socket error
    req.emit("error", new Error("socket error"));
    expect(res.statusCode).toBe(400);
    expect(res.end).toHaveBeenCalledWith("bad request");
  });
});
