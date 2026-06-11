/**
 * Telegram returned an error payload or the HTTP status was not OK.
 * @see https://core.telegram.org/bots/api#making-requests
 */
export class TelegramApiError extends Error {
  public readonly errorCode?: number;
  public readonly method?: string;
  /**
   * When the failure was returned with a non-2xx HTTP status (e.g. reverse proxy in front of Telegram).
   * Telegram’s JSON error body can still be present; see `responseBodySnippet` for raw text if unparsed.
   */
  public readonly httpStatus?: number;
  /** Truncated body when the response was not a parsable `ok: false` Bot API payload. */
  public readonly responseBodySnippet?: string;

  constructor(
    message: string,
    errorCode?: number,
    method?: string,
    options?: { httpStatus?: number; responseBodySnippet?: string },
  ) {
    super(message);
    this.name = "TelegramApiError";
    this.errorCode = errorCode;
    this.method = method;
    this.httpStatus = options?.httpStatus;
    this.responseBodySnippet = options?.responseBodySnippet;
  }
}

/**
 * 429 Too Many Requests from Telegram.
 * @param retryAfter - Seconds to wait before retrying (from Telegram `parameters.retry_after`).
 * @see https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this
 */
export class RateLimitError extends TelegramApiError {
  constructor(
    message: string,
    /** Minimum wait in seconds before the next attempt. */
    public readonly retryAfter: number,
    method?: string,
  ) {
    super(message, 429, method, { httpStatus: 429 });
    this.name = "RateLimitError";
  }
}

/**
 * Thrown before a Bot API call when an input value would be rejected by Telegram.
 * @param field - The option name that failed, e.g. `"text"` or `"caption"`.
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}
