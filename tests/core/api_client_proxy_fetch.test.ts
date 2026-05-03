import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockFetch } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
}));

vi.mock("undici", async (importOriginal) => {
  const actual = await importOriginal<typeof import("undici")>();
  return { ...actual, fetch: mockFetch };
});

import { ProxyAgent } from "undici";
import { ApiClient } from "../../src/core/api/client";

function dummyTelegramGetMeResponse() {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      ok: true,
      result: { id: 1, is_bot: true, first_name: "T", username: "tbot" },
    }),
  };
}

describe("ApiClient proxy → undici fetch (mocked)", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue(dummyTelegramGetMeResponse());
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  it("passes a dispatcher when proxy is an HTTP URL string", async () => {
    const api = new ApiClient("TOK", undefined, { proxy: "http://127.0.0.1:8080" });
    await api.getMe();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.telegram.org/botTOK/getMe",
      expect.objectContaining({
        method: "POST",
        dispatcher: expect.any(Object),
      }),
    );
  });

  it("passes a dispatcher when proxy is a SOCKS URL string", async () => {
    const api = new ApiClient("TOK", undefined, { proxy: "socks5://127.0.0.1:1080" });
    await api.getMe();
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.telegram.org/botTOK/getMe",
      expect.objectContaining({ dispatcher: expect.any(Object) }),
    );
  });

  it("passes the same Dispatcher instance when proxy is an undici ProxyAgent", async () => {
    const dispatcher = new ProxyAgent({ uri: "http://127.0.0.1:9" });
    const api = new ApiClient("TOK", undefined, { proxy: dispatcher });
    await api.getMe();
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.telegram.org/botTOK/getMe",
      expect.objectContaining({ dispatcher }),
    );
  });

  it("passes dispatcher undefined when proxy is unset", async () => {
    const api = new ApiClient("TOK");
    await api.getMe();
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.telegram.org/botTOK/getMe",
      expect.objectContaining({ dispatcher: undefined }),
    );
  });

  it("does not call undici fetch when httpTransport is set", async () => {
    const api = new ApiClient("TOK", undefined, {
      httpTransport: async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          ok: true,
          result: { id: 2, is_bot: true, first_name: "X", username: "xbot" },
        }),
      }),
    });
    await api.getMe();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
