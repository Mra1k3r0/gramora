import { describe, it, expect } from "vitest";
import { UpdateRouter } from "./core/router";
import { ApiClient } from "./core/api/client";
import { SceneManager } from "./scenes";
import { Update } from "./types/telegram";

describe("Middleware Caching", () => {
  const api = new ApiClient("TOKEN");
  const scenes = new SceneManager();

  const createUpdate = (text: string): Update => ({
    update_id: 1,
    message: {
      message_id: 1,
      date: 123,
      chat: { id: 1, type: "private" },
      from: { id: 1, is_bot: false, first_name: "Test" },
      text,
    },
  });

  it("should preserve execution order and only compose once", async () => {
    const router = new UpdateRouter(api, scenes);
    const order: string[] = [];

    router.use(async (ctx, next) => {
      order.push("global-start");
      await next();
      order.push("global-end");
    });

    let handlerCalls = 0;
    router.registerSimpleHandler("on", "text", async () => {
      handlerCalls++;
      order.push("handler");
    });

    const update = createUpdate("hello");

    // First update
    await router.handleUpdate(update);
    expect(order).toEqual(["global-start", "handler", "global-end"]);
    expect(handlerCalls).toBe(1);

    // Second update (should reuse cached composition)
    order.length = 0;
    await router.handleUpdate(update);
    expect(order).toEqual(["global-start", "handler", "global-end"]);
    expect(handlerCalls).toBe(2);
  });

  it("should handle multiple handlers with their own cached compositions", async () => {
    const router = new UpdateRouter(api, scenes);
    const order: string[] = [];

    router.registerSimpleHandler("command", "start", async () => {
      order.push("start-handler");
    });

    router.registerSimpleHandler("command", "help", async () => {
      order.push("help-handler");
    });

    await router.handleUpdate(createUpdate("/start"));
    await router.handleUpdate(createUpdate("/help"));
    await router.handleUpdate(createUpdate("/start"));

    expect(order).toEqual(["start-handler", "help-handler", "start-handler"]);
  });

  it("should invalidate global cache when new global middleware is added", async () => {
    const router = new UpdateRouter(api, scenes);
    const order: string[] = [];

    router.use(async (ctx, next) => {
      order.push("mw1");
      await next();
    });

    router.registerSimpleHandler("on", "text", async () => {
      order.push("handler");
    });

    await router.handleUpdate(createUpdate("hi"));
    expect(order).toEqual(["mw1", "handler"]);

    // Add new global middleware
    router.use(async (ctx, next) => {
      order.push("mw2");
      await next();
    });

    order.length = 0;
    await router.handleUpdate(createUpdate("hi"));
    expect(order).toEqual(["mw1", "mw2", "handler"]);
  });
});
