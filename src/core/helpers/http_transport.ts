import type {
  TelegramHttpTransport,
  TelegramHttpTransportRequest,
  TelegramHttpTransportResponse,
} from "../types";

/** Anything with the same call signature as `globalThis.fetch` (undici, node-fetch v3, etc.). */
export type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

/**
 * Minimal `POST` surface for axios (default import or a configured instance).
 */
export type AxiosLikePost = (
  url: string,
  data?: unknown,
  config?: {
    headers?: Record<string, string>;
    timeout?: number;
    signal?: AbortSignal;
    validateStatus?: (status: number) => boolean;
    [key: string]: unknown;
  },
) => Promise<{ status: number; data: unknown }>;

/**
 * Minimal `ky.post` surface (`ky` or `ky.create({ … })`).
 */
export type KyLikePost = (
  url: string | URL,
  options?: {
    headers?: Record<string, string>;
    body?: string | FormData;
    timeout?: false | number;
    signal?: AbortSignal;
    throwHttpErrors?: boolean;
    retry?: { limit: number } | number;
    hooks?: unknown;
    [key: string]: unknown;
  },
) => Promise<Response>;

/**
 * Minimal `got.post` surface (default `got` or `got.extend({ … })`).
 */
export type GotLikePost = (
  url: string,
  options?: {
    headers?: Record<string, string>;
    body?: string | Buffer | FormData;
    timeout?: { request: number };
    signal?: AbortSignal;
    throwHttpErrors?: boolean;
    responseType?: string;
    [key: string]: unknown;
  },
) => Promise<{ statusCode: number; body: unknown }>;

export type CreateTransportFetchOptions = {
  requestInit?: RequestInit | ((req: TelegramHttpTransportRequest) => RequestInit | undefined);
};

export type CreateTransportAxiosOptions = {
  axiosConfig?: Record<string, unknown>;
};

/** Per-request options merged into `ky.post` (e.g. `dispatcher` for undici `ProxyAgent`). */
export type CreateTransportKyOptions = Record<string, unknown>;

/** Per-request options merged into `got.post`. */
export type CreateTransportGotOptions = Record<string, unknown>;

export type CreateTransportOptions =
  | ({
      adapter: "fetch";
      /** fetch implementation; default `globalThis.fetch` */
      fetch?: FetchLike;
    } & CreateTransportFetchOptions)
  | ({
      adapter: "axios";
      axios: { post: AxiosLikePost };
    } & CreateTransportAxiosOptions)
  | ({
      adapter: "ky";
      ky: { post: KyLikePost };
    } & { kyOptions?: CreateTransportKyOptions })
  | ({
      adapter: "got";
      got: { post: GotLikePost };
    } & { gotOptions?: CreateTransportGotOptions });

export type WrapTelegramHttpTransportHooks = {
  beforeRequest?: (req: TelegramHttpTransportRequest) => void | Promise<void>;
  afterResponse?: (
    req: TelegramHttpTransportRequest,
    res: Awaited<ReturnType<TelegramHttpTransport>>,
  ) => void | Promise<void>;
};

type PostCallable = { post: (...args: unknown[]) => unknown };

function requirePost(parent: string, obj: unknown, label: string): asserts obj is PostCallable {
  if (obj === null || typeof obj !== "object") {
    throw new TypeError(
      `createTransport(${parent}): expected ${label} object, got ${obj === null ? "null" : typeof obj}`,
    );
  }
  const post = (obj as { post?: unknown }).post;
  if (typeof post !== "function") {
    throw new TypeError(`createTransport(${parent}): expected ${label}.post to be a function`);
  }
}

function defaultFetch(): FetchLike {
  const f = globalThis.fetch;
  if (typeof f !== "function") {
    throw new TypeError(
      'createTransport("fetch", …): global fetch is not available; pass node-fetch as the second argument',
    );
  }
  return f.bind(globalThis) as FetchLike;
}

function transportFromFetch(
  fetchImpl: FetchLike,
  requestInit?: RequestInit | ((req: TelegramHttpTransportRequest) => RequestInit | undefined),
): TelegramHttpTransport {
  return async (req) => {
    const extra =
      typeof requestInit === "function" ? (requestInit(req) ?? {}) : (requestInit ?? {});
    return fetchImpl(req.url, {
      method: "POST",
      headers: req.headers,
      body: req.body as BodyInit | undefined,
      signal: req.signal,
      ...extra,
    });
  };
}

function transportFromAxios(
  axios: { post: AxiosLikePost },
  axiosConfig: Record<string, unknown> | undefined,
): TelegramHttpTransport {
  const defaults = axiosConfig ?? {};
  return async (req) => {
    const { url, headers, body, timeoutMs, signal } = req;
    const { status, data } = await axios.post(url, body ?? undefined, {
      ...defaults,
      headers: {
        ...(defaults.headers as Record<string, string> | undefined),
        ...headers,
      },
      timeout: timeoutMs,
      signal,
      validateStatus: () => true,
    });
    const res: TelegramHttpTransportResponse = {
      ok: status >= 200 && status < 300,
      status,
      json: async () => data,
    };
    return res;
  };
}

function transportFromKy(
  ky: { post: KyLikePost },
  kyOptions: Record<string, unknown> | undefined,
): TelegramHttpTransport {
  const extra = kyOptions ?? {};
  return async (req) => {
    const { url, headers, body, timeoutMs, signal } = req;
    return ky.post(url, {
      ...extra,
      headers,
      body: body as string | FormData,
      timeout: timeoutMs,
      signal,
      throwHttpErrors: false,
      retry: { limit: 0 },
    });
  };
}

function transportFromGot(
  got: { post: GotLikePost },
  gotOptions: Record<string, unknown> | undefined,
): TelegramHttpTransport {
  const extra = gotOptions ?? {};
  return async (req) => {
    const { url, headers, body, timeoutMs, signal } = req;
    const r = await got.post(url, {
      ...extra,
      headers,
      body: body as string | Buffer | FormData | undefined,
      timeout: { request: timeoutMs },
      signal,
      throwHttpErrors: false,
      responseType: "json",
    });
    return telegramHttpResultFromJson(r.statusCode, r.body);
  };
}

function createTransportFromOptions(options: CreateTransportOptions): TelegramHttpTransport {
  switch (options.adapter) {
    case "fetch": {
      const fetchImpl = options.fetch ?? defaultFetch();
      if (typeof fetchImpl !== "function") {
        throw new TypeError(
          'createTransport("fetch", fn): second argument must be a function when provided',
        );
      }
      return transportFromFetch(fetchImpl, options.requestInit);
    }
    case "axios": {
      requirePost("axios", options.axios, "axios");
      return transportFromAxios(options.axios, options.axiosConfig);
    }
    case "ky": {
      requirePost("ky", options.ky, "ky");
      return transportFromKy(options.ky, options.kyOptions);
    }
    case "got": {
      requirePost("got", options.got, "got");
      return transportFromGot(options.got, options.gotOptions);
    }
    default: {
      const _never: never = options;
      void _never;
      throw new TypeError("createTransport: unknown adapter");
    }
  }
}

/**
 * Common HTTP stacks for {@link TelegramHttpTransport}. Prefer positional calls, e.g.
 * `createTransport("ky", ky, { dispatcher })`; object form `{ adapter, … }` stays supported.
 *
 * - **`fetch`** — undici / `globalThis.fetch` / **node-fetch** v3 (optional 2nd arg).
 * - **`axios`** — default or instance; `validateStatus: () => true`.
 * - **`ky`** — `throwHttpErrors: false`, `retry: { limit: 0 }`; returns a `Response`.
 * - **`got`** — `throwHttpErrors: false`, `responseType: "json"`.
 */
export function createTransport(options: CreateTransportOptions): TelegramHttpTransport;
export function createTransport(
  adapter: "fetch",
  fetchImpl?: FetchLike,
  options?: CreateTransportFetchOptions,
): TelegramHttpTransport;
export function createTransport(
  adapter: "axios",
  axios: { post: AxiosLikePost },
  options?: CreateTransportAxiosOptions,
): TelegramHttpTransport;
export function createTransport(
  adapter: "ky",
  ky: { post: KyLikePost },
  options?: CreateTransportKyOptions,
): TelegramHttpTransport;
export function createTransport(
  adapter: "got",
  got: { post: GotLikePost },
  options?: CreateTransportGotOptions,
): TelegramHttpTransport;
export function createTransport(
  arg1: CreateTransportOptions | CreateTransportOptions["adapter"],
  arg2?: FetchLike | { post: AxiosLikePost } | { post: KyLikePost } | { post: GotLikePost },
  arg3?: CreateTransportFetchOptions | CreateTransportAxiosOptions | CreateTransportKyOptions,
): TelegramHttpTransport {
  if (typeof arg1 === "object" && arg1 !== null && "adapter" in arg1) {
    return createTransportFromOptions(arg1);
  }

  const adapter = arg1 as "fetch" | "axios" | "ky" | "got";
  switch (adapter) {
    case "fetch": {
      const fetchImpl = (arg2 as FetchLike | undefined) ?? defaultFetch();
      if (typeof fetchImpl !== "function") {
        throw new TypeError(
          'createTransport("fetch", fn): second argument must be a function when provided',
        );
      }
      const opts = arg3 as CreateTransportFetchOptions | undefined;
      return transportFromFetch(fetchImpl, opts?.requestInit);
    }
    case "axios": {
      const axios = arg2 as { post: AxiosLikePost };
      requirePost("axios", axios, "axios");
      const opts = arg3 as CreateTransportAxiosOptions | undefined;
      return transportFromAxios(axios, opts?.axiosConfig);
    }
    case "ky": {
      const ky = arg2 as { post: KyLikePost };
      requirePost("ky", ky, "ky");
      return transportFromKy(ky, arg3 as CreateTransportKyOptions | undefined);
    }
    case "got": {
      const got = arg2 as { post: GotLikePost };
      requirePost("got", got, "got");
      return transportFromGot(got, arg3 as CreateTransportGotOptions | undefined);
    }
    default: {
      throw new TypeError(`createTransport: unknown adapter ${String(adapter)}`);
    }
  }
}

/** Map HTTP status + parsed JSON body into Gramora’s transport result (custom clients). */
export function telegramHttpResultFromJson(
  status: number,
  data: unknown,
): TelegramHttpTransportResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  };
}

/**
 * Compose logging, metrics, or small tweaks around any transport. For full control over the
 * response, use a custom {@link TelegramHttpTransport} that delegates to an inner one.
 */
export function wrapTelegramHttpTransport(
  inner: TelegramHttpTransport,
  hooks: WrapTelegramHttpTransportHooks,
): TelegramHttpTransport {
  return async (req) => {
    await hooks.beforeRequest?.(req);
    const res = await inner(req);
    await hooks.afterResponse?.(req, res);
    return res;
  };
}
