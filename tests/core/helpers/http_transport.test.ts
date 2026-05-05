import { describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../../src/core/api/client";
import {
  createTransport,
  type FetchLike,
  telegramHttpResultFromJson,
  wrapTelegramHttpTransport,
} from "../../../src/core/helpers";

function fetchInputUrl(input: string | URL | Request): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

describe("createTransport", () => {
  it('adapter "fetch" forwards POST fields and returns Response', async () => {
    const fetchMock = vi.fn(
      async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
        expect(fetchInputUrl(input)).toContain("/getMe");
        expect(init?.method).toBe("POST");
        return new Response(
          JSON.stringify({
            ok: true,
            result: { id: 1, is_bot: true, first_name: "F", username: "u" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    );
    const transport = createTransport("fetch", fetchMock as unknown as FetchLike);
    const api = new ApiClient("TOK", "https://api.telegram.org", { httpTransport: transport });
    const me = await api.getMe();
    expect(me.username).toBe("u");
    expect(fetchMock).toHaveBeenCalledOnce();
    const first = fetchMock.mock.calls[0]!;
    const [, init] = first as [string | URL | Request, RequestInit | undefined];
    expect(init?.headers && (init.headers as Record<string, string>)["Content-Type"]).toBeDefined();
  });

  it('adapter "fetch" merges requestInit', async () => {
    const fetchMock = vi.fn(
      async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
        void input;
        void init;
        return new Response(
          JSON.stringify({ ok: true, result: { id: 0, is_bot: true, first_name: "x" } }),
          { status: 200 },
        );
      },
    );
    const transport = createTransport("fetch", fetchMock as unknown as FetchLike, {
      requestInit: { cache: "no-store" },
    });
    const api = new ApiClient("TOK", "https://api.telegram.org", { httpTransport: transport });
    await api.getMe();
    const first = fetchMock.mock.calls[0]!;
    const [, init] = first as [string | URL | Request, RequestInit | undefined];
    expect(init?.cache).toBe("no-store");
  });

  it('adapter "axios" maps axios result', async () => {
    const axiosPost = vi.fn(async () => ({
      status: 200,
      data: { ok: true, result: { id: 2, is_bot: true, first_name: "A", username: "ab" } },
    }));
    const transport = createTransport("axios", { post: axiosPost });
    const api = new ApiClient("TOK", "https://api.telegram.org", { httpTransport: transport });
    const me = await api.getMe();
    expect(me.username).toBe("ab");
    expect(axiosPost).toHaveBeenCalledOnce();
    const first = axiosPost.mock.calls[0]!;
    const [, data, cfg] = first as unknown as [
      string,
      unknown,
      { validateStatus?: (s: number) => boolean },
    ];
    expect(cfg?.validateStatus?.(500)).toBe(true);
    expect(data).toBeUndefined();
  });

  it('adapter "ky" calls ky.post with throwHttpErrors false', async () => {
    const kyPost = vi.fn(
      async (): Promise<Response> =>
        new Response(
          JSON.stringify({ ok: true, result: { id: 3, is_bot: true, first_name: "K" } }),
          { status: 200 },
        ),
    );
    const transport = createTransport("ky", { post: kyPost });
    const api = new ApiClient("TOK", "https://api.telegram.org", { httpTransport: transport });
    await api.getMe();
    expect(kyPost).toHaveBeenCalledOnce();
    const first = kyPost.mock.calls[0]!;
    const [, opts] = first as unknown as [string, Record<string, unknown>];
    expect(opts.throwHttpErrors).toBe(false);
    expect(opts.retry).toEqual({ limit: 0 });
  });

  it('adapter "got" maps statusCode and body', async () => {
    const gotPost = vi.fn(async () => ({
      statusCode: 200,
      body: { ok: true, result: { id: 4, is_bot: true, first_name: "G", username: "gb" } },
    }));
    const transport = createTransport("got", { post: gotPost });
    const api = new ApiClient("TOK", "https://api.telegram.org", { httpTransport: transport });
    const me = await api.getMe();
    expect(me.username).toBe("gb");
    expect(gotPost).toHaveBeenCalledOnce();
    const first = gotPost.mock.calls[0]!;
    const [, opts] = first as unknown as [string, Record<string, unknown>];
    expect(opts.throwHttpErrors).toBe(false);
    expect(opts.responseType).toBe("json");
  });

  it("merges ky third argument into ky.post (e.g. dispatcher)", async () => {
    const kyPost = vi.fn(
      async (): Promise<Response> =>
        new Response(
          JSON.stringify({ ok: true, result: { id: 7, is_bot: true, first_name: "d" } }),
          {
            status: 200,
          },
        ),
    );
    const dispatcher = { tag: "proxy-mock" };
    const transport = createTransport("ky", { post: kyPost }, { dispatcher });
    const api = new ApiClient("TOK", "https://api.telegram.org", { httpTransport: transport });
    await api.getMe();
    const first = kyPost.mock.calls[0]!;
    const [, opts] = first as unknown as [string, Record<string, unknown>];
    expect(opts.dispatcher).toBe(dispatcher);
  });

  it("object form { adapter, … } still works", async () => {
    const axiosPost = vi.fn(async () => ({
      status: 200,
      data: { ok: true, result: { id: 99, is_bot: true, first_name: "legacy", username: "leg" } },
    }));
    const transport = createTransport({ adapter: "axios", axios: { post: axiosPost } });
    const api = new ApiClient("TOK", "https://api.telegram.org", { httpTransport: transport });
    expect((await api.getMe()).username).toBe("leg");
  });

  it("validates axios client", () => {
    expect(() => createTransport("axios", {} as never)).toThrow(/expected axios\.post/);
    expect(() => createTransport("axios", null as never)).toThrow(/expected axios object/);
  });

  it("validates ky client", () => {
    expect(() => createTransport("ky", { post: "not-a-function" as never })).toThrow(
      /expected ky\.post/,
    );
  });

  it("validates got client", () => {
    expect(() => createTransport("got", {} as never)).toThrow(/expected got\.post/);
  });

  it("validates fetch override when provided", () => {
    expect(() => createTransport("fetch", "not-a-fn" as unknown as FetchLike)).toThrow(
      /must be a function when provided/,
    );
  });
});

describe("http transport utilities", () => {
  it("telegramHttpResultFromJson builds transport response", async () => {
    const res = telegramHttpResultFromJson(418, {
      ok: false,
      error_code: 1,
      description: "teapot",
    });
    expect(res.ok).toBe(false);
    expect(res.status).toBe(418);
    expect(await res.json()).toEqual({ ok: false, error_code: 1, description: "teapot" });
  });

  it("wrapTelegramHttpTransport runs hooks", async () => {
    const before = vi.fn();
    const after = vi.fn();
    const inner = vi.fn(async () =>
      telegramHttpResultFromJson(200, {
        ok: true,
        result: { id: 0, is_bot: true, first_name: "w" },
      }),
    );
    const wrapped = wrapTelegramHttpTransport(inner, {
      beforeRequest: before,
      afterResponse: after,
    });
    const api = new ApiClient("TOK", "https://api.telegram.org", { httpTransport: wrapped });
    await api.getMe();
    expect(before).toHaveBeenCalledOnce();
    expect(after).toHaveBeenCalledOnce();
    expect(inner).toHaveBeenCalledOnce();
  });
});
