import { describe, expect, it } from "vitest";
import { Gramora } from "./core/bot";
import type { Update } from "./types/telegram";

describe("shipping and pre_checkout queries", () => {
  it("indexes and dispatches shipping_query", async () => {
    const bot = new Gramora({ token: "test", mode: "core" });
    let handled = false;

    bot.onShippingQuery(() => {
      handled = true;
    });

    const update: Update = {
      update_id: 1,
      shipping_query: {
        id: "q1",
        from: { id: 1, is_bot: false, first_name: "User" },
        invoice_payload: "p1",
        shipping_address: {
          country_code: "US",
          state: "NY",
          city: "New York",
          street_line1: "1st St",
          street_line2: "",
          post_code: "10001",
        },
      },
    };

    await bot.handleUpdate(update);
    expect(handled).toBe(true);
  });

  it("indexes and dispatches pre_checkout_query", async () => {
    const bot = new Gramora({ token: "test", mode: "core" });
    let handled = false;

    bot.onPreCheckoutQuery(() => {
      handled = true;
    });

    const update: Update = {
      update_id: 1,
      pre_checkout_query: {
        id: "q2",
        from: { id: 1, is_bot: false, first_name: "User" },
        currency: "USD",
        total_amount: 100,
        invoice_payload: "p2",
      },
    };

    await bot.handleUpdate(update);
    expect(handled).toBe(true);
  });
});
