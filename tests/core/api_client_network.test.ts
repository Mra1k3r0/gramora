import { describe, expect, it } from "vitest";
import { ProxyAgent } from "undici";
import { ApiClient, TelegramApiError } from "../../src/core/api/client";

describe("ApiClient networking", () => {
  it("treats ProxyAgent passed as proxy for hasProxy()", () => {
    const dispatcher = new ProxyAgent({ uri: "http://127.0.0.1:9" });
    const api = new ApiClient("TOKEN", undefined, { proxy: dispatcher });
    expect(api.hasProxy()).toBe(true);
  });

  it("configure({ proxy: undefined }) clears proxy", () => {
    const api = new ApiClient("TOKEN", undefined, {
      proxy: new ProxyAgent({ uri: "http://127.0.0.1:9" }),
    });
    expect(api.hasProxy()).toBe(true);
    api.configureNetwork({ proxy: undefined });
    expect(api.hasProxy()).toBe(false);
  });

  it("hasProxy() is false when neither dispatcher nor proxy is set", () => {
    const api = new ApiClient("TOKEN");
    expect(api.hasProxy()).toBe(false);
  });

  it("uses httpTransport for Bot API calls", async () => {
    let lastUrl = "";
    const api = new ApiClient("TOK", "https://api.telegram.org", {
      httpTransport: async (req) => {
        lastUrl = req.url;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            ok: true,
            result: {
              id: 1,
              is_bot: true,
              first_name: "T",
              username: "tbot",
            },
          }),
        };
      },
    });
    expect(api.hasProxy()).toBe(true);
    const me = await api.getMe();
    expect(me.username).toBe("tbot");
    expect(lastUrl).toBe("https://api.telegram.org/botTOK/getMe");
  });

  it("includes Telegram JSON description on non-2xx HTTP when body is ok:false", async () => {
    const api = new ApiClient("TOK", "https://api.telegram.org", {
      httpTransport: async () => ({
        ok: false,
        status: 502,
        json: async () => ({
          ok: false,
          error_code: 123,
          description: "Bad gateway from proxy",
        }),
      }),
    });
    await expect(api.getMe()).rejects.toMatchObject({
      name: "TelegramApiError",
      message: "Bad gateway from proxy",
      errorCode: 123,
    });
  });

  it("surfaces raw body snippet on non-2xx when body is not Telegram JSON", async () => {
    const api = new ApiClient("TOK", "https://api.telegram.org", {
      httpTransport: async () => ({
        ok: false,
        status: 503,
        json: async () => "<html>unavailable</html>",
      }),
    });
    try {
      await api.getMe();
      expect.fail("expected throw");
    } catch (e) {
      expect(e).toBeInstanceOf(TelegramApiError);
      const err = e as TelegramApiError;
      expect(err.message).toContain("503");
      expect(err.responseBodySnippet).toContain("<html>");
    }
  });

  it("clears httpTransport via configure", () => {
    const api = new ApiClient("TOKEN", undefined, {
      httpTransport: async () => ({
        ok: true,
        status: 200,
        json: async () => ({ ok: true, result: { id: 0, is_bot: true, first_name: "x" } }),
      }),
    });
    expect(api.hasProxy()).toBe(true);
    api.configureNetwork({ httpTransport: undefined });
    expect(api.hasProxy()).toBe(false);
  });
});
