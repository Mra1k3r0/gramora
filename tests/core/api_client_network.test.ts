import { describe, expect, it } from "vitest";
import { ProxyAgent } from "undici";
import { ApiClient } from "../../src/core/api/client";

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
