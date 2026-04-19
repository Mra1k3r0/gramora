import { describe, expect, it } from "vitest";
import { Gramora, RateLimitError, ValidationError } from "./index";

describe("public API", () => {
  it("exports Gramora constructor", () => {
    expect(typeof Gramora).toBe("function");
  });

  it("RateLimitError exposes retryAfter", () => {
    const err = new RateLimitError("slow down", 30, "sendMessage");
    expect(err.retryAfter).toBe(30);
    expect(err.errorCode).toBe(429);
    expect(err.name).toBe("RateLimitError");
  });

  it("ValidationError exposes field", () => {
    const err = new ValidationError("too long", "text");
    expect(err.field).toBe("text");
    expect(err.name).toBe("ValidationError");
  });
});
