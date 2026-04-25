import type { ApiClient } from "./api-client";
import {
  BaseContext,
  CallbackContext,
  CommandContext,
  InlineContext,
  MessageContext,
  SceneContext,
  SceneControl,
} from "../context";
import { metadata, type HandlerDefinition } from "../decorators";
import { compose } from "../middleware/pipeline";
import type { MiddlewareFn } from "../middleware/types";
import type { SceneManager } from "../scenes";
import type { Constructor } from "./types";
import type { Message, MessageContentKind, Update } from "../types/telegram";

interface RegisteredController {
  instance: object;
  handlers: HandlerDefinition[];
  classMiddleware: MiddlewareFn<BaseContext>[];
}
type SimpleHandler = (gram: BaseContext) => Promise<void> | void;
type FilteredHandler<T extends Update = Update> = {
  filter: (update: Update) => update is T;
  fn: (gram: BaseContext) => Promise<void> | void;
};
type RouterMode = "full" | "core";
type HandlerRunner = {
  def: HandlerDefinition;
  run: (ctx: BaseContext) => Promise<void>;
  middleware: MiddlewareFn<BaseContext>[];
  guards: HandlerDefinition["guards"];
  callbackRegex?: RegExp;
};

/** Routes `Update` objects to controllers, scenes, and `bot.on*` handlers. */
export class UpdateRouter {
  private readonly globalMiddleware: MiddlewareFn<BaseContext>[] = [];
  private readonly filteredHandlers: FilteredHandler[] = [];

  private readonly commandHandlers = new Map<string, HandlerRunner[]>();
  private readonly onMessageHandlers: HandlerRunner[] = [];
  private readonly onKindHandlers = new Map<string, HandlerRunner[]>();
  private readonly callbackLiteralHandlers = new Map<string, HandlerRunner[]>();
  private readonly callbackRegexHandlers: HandlerRunner[] = [];
  private readonly callbackOrderedHandlers: { runner: HandlerRunner; isLiteral: boolean }[] = [];
  private readonly inlineHandlers: HandlerRunner[] = [];
  private readonly shippingQueryHandlers: HandlerRunner[] = [];
  private readonly preCheckoutQueryHandlers: HandlerRunner[] = [];
  private readonly chatMemberHandlers: HandlerRunner[] = [];
  private readonly myChatMemberHandlers: HandlerRunner[] = [];
  private readonly chatJoinRequestHandlers: HandlerRunner[] = [];
  private readonly messageReactionHandlers: HandlerRunner[] = [];
  private readonly messageReactionCountHandlers: HandlerRunner[] = [];
  private readonly businessConnectionHandlers: HandlerRunner[] = [];
  private readonly businessMessageHandlers: HandlerRunner[] = [];
  private readonly editedBusinessMessageHandlers: HandlerRunner[] = [];
  private readonly deletedBusinessMessagesHandlers: HandlerRunner[] = [];
  private hasIndexedHandlers = false;

  /**
   * @param api - Shared API client for contexts
   * @param sceneManager - Scene state and step handling
   * @param options - `mode: 'core'` skips controller registration
   */
  constructor(
    private readonly api: ApiClient,
    private readonly sceneManager: SceneManager,
    private readonly options: { mode?: RouterMode } = {},
  ) {}
  /**
   * @param mw - Runs before each dispatched handler (after scene short-circuit)
   */
  use(mw: MiddlewareFn<BaseContext>) {
    this.globalMiddleware.push(mw);
  }

  /**
   * @param controllerClass - Class decorated with `@Controller`
   */
  registerController(controllerClass: Constructor) {
    if (this.options.mode === "core") {
      return;
    }
    const instance = new controllerClass() as object;
    const meta = metadata.getControllerMeta(controllerClass.prototype);
    if (!meta) return;
    const c: RegisteredController = {
      instance,
      handlers: meta.handlers,
      classMiddleware: meta.middleware as MiddlewareFn<BaseContext>[],
    };
    this.indexControllerHandlers(c);
  }

  /**
   * @param kind - Handler kind (command, on, callback_query, …)
   * @param trigger - Command name, callback pattern, or `*`
   * @param fn - Handler receiving a context
   */
  registerSimpleHandler(kind: HandlerDefinition["kind"], trigger: string, fn: SimpleHandler) {
    const def: HandlerDefinition = {
      methodName: "__simple__",
      kind,
      trigger,
      middleware: [],
      guards: [],
    };
    const runner: HandlerRunner = {
      def,
      run: async (ctx) => fn(ctx),
      middleware: [],
      guards: [],
      callbackRegex: kind === "callback_query" ? this.toRegex(trigger) : undefined,
    };
    this.addToIndices(runner);
  }

  registerFilteredHandler<T extends Update>(
    filter: (update: Update) => update is T,
    fn: (gram: BaseContext) => Promise<void> | void,
  ) {
    this.filteredHandlers.push({ filter, fn });
  }

  /**
   * @param update - Telegram update payload
   * @see https://core.telegram.org/bots/api#update
   */
  async handleUpdate(update: Update) {
    const meta = this.getUpdateMetadata(update);
    const chatKey = meta.chatId !== undefined ? String(meta.chatId) : "global";

    const sceneControl = await this.sceneManager.buildControl(chatKey);
    if (this.options.mode !== "core") {
      const sceneCtx = new SceneContext({ update, api: this.api, scene: sceneControl });
      if (await this.sceneManager.tryHandleActiveScene(chatKey, sceneCtx)) return;
    }

    await this.dispatchIndexedHandlers(update, sceneControl, meta);

    for (const item of this.filteredHandlers) {
      if (!item.filter(update)) continue;
      const gram = new BaseContext({ update, api: this.api, scene: sceneControl });
      await this.runWithGlobalMiddleware(gram, async () => item.fn(gram));
    }
  }

  /**
   * @param update - Current update
   * @param handler - Matched handler metadata
   * @param sceneControl - Scene API for this chat key
   * @returns `CommandContext`, `MessageContext`, `BaseContext`, etc.
   */
  private createContext(
    update: Update,
    handler: HandlerDefinition,
    sceneControl: SceneControl,
  ): BaseContext {
    if (handler.kind === "command")
      return new CommandContext({ update, api: this.api, scene: sceneControl });
    if (handler.kind === "callback_query")
      return new CallbackContext({ update, api: this.api, scene: sceneControl });
    if (handler.kind === "inline_query")
      return new InlineContext({ update, api: this.api, scene: sceneControl });
    if (
      handler.kind === "chat_member" ||
      handler.kind === "my_chat_member" ||
      handler.kind === "chat_join_request" ||
      handler.kind === "message_reaction" ||
      handler.kind === "message_reaction_count" ||
      handler.kind === "business_connection" ||
      handler.kind === "business_message" ||
      handler.kind === "edited_business_message" ||
      handler.kind === "deleted_business_messages" ||
      handler.kind === "shipping_query" ||
      handler.kind === "pre_checkout_query"
    ) {
      return new BaseContext({ update, api: this.api, scene: sceneControl });
    }
    if (handler.kind === "scene_step")
      return new SceneContext({ update, api: this.api, scene: sceneControl });
    return new MessageContext<MessageContentKind>({
      update,
      api: this.api,
      scene: sceneControl,
    });
  }

  private matches(update: Update, handler: HandlerDefinition): { ok: boolean; groups?: string[] } {
    if (handler.kind === "command") {
      const text = update.message && "text" in update.message ? update.message.text : undefined;
      const parsed = this.parseCommand(text);
      return { ok: Boolean(parsed && parsed.command === handler.trigger) };
    }
    if (handler.kind === "on") {
      if (handler.trigger === "*" || handler.trigger === "message")
        return { ok: Boolean(update.message) };
      if (!update.message) return { ok: false };
      return { ok: this.messageHasKind(update.message, handler.trigger ?? "") };
    }
    if (handler.kind === "callback_query") {
      const data = update.callback_query?.data;
      if (!data || !handler.trigger) return { ok: false };
      const matched = data.match(this.toRegex(handler.trigger));
      return { ok: Boolean(matched), groups: matched ? matched.slice(1) : undefined };
    }
    if (handler.kind === "inline_query") {
      if (!update.inline_query) return { ok: false };
      const pattern = handler.trigger ?? "*";
      if (pattern === "*" || pattern === "") return { ok: true };
      return { ok: update.inline_query.query.includes(pattern) };
    }
    if (handler.kind === "shipping_query") return { ok: Boolean(update.shipping_query) };
    if (handler.kind === "pre_checkout_query") return { ok: Boolean(update.pre_checkout_query) };
    if (handler.kind === "chat_member") return { ok: Boolean(update.chat_member) };
    if (handler.kind === "my_chat_member") return { ok: Boolean(update.my_chat_member) };
    if (handler.kind === "chat_join_request") return { ok: Boolean(update.chat_join_request) };
    if (handler.kind === "message_reaction") return { ok: Boolean(update.message_reaction) };
    if (handler.kind === "message_reaction_count")
      return { ok: Boolean(update.message_reaction_count) };
    if (handler.kind === "business_connection") return { ok: Boolean(update.business_connection) };
    if (handler.kind === "business_message") return { ok: Boolean(update.business_message) };
    if (handler.kind === "edited_business_message")
      return { ok: Boolean(update.edited_business_message) };
    if (handler.kind === "deleted_business_messages")
      return { ok: Boolean(update.deleted_business_messages) };
    return { ok: false };
  }

  private toRegex(pattern: string): RegExp {
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "(.+)");
    return new RegExp(`^${escaped}$`);
  }

  private messageHasKind(message: Message, kind: string) {
    return kind in message;
  }

  private parseCommand(text?: string): { command: string; mention?: string } | undefined {
    if (!text?.startsWith("/")) return undefined;
    const [raw] = text.trim().split(/\s+/);
    const body = raw.slice(1);
    if (!body) return undefined;
    const atIndex = body.indexOf("@");
    if (atIndex === -1) return { command: body };
    const command = body.slice(0, atIndex);
    const mention = body.slice(atIndex + 1);
    if (!command) return undefined;
    return { command, mention };
  }

  private addToIndices(runner: HandlerRunner) {
    const handler = runner.def;
    if (handler.kind === "command" && handler.trigger) {
      const current = this.commandHandlers.get(handler.trigger) ?? [];
      current.push(runner);
      this.commandHandlers.set(handler.trigger, current);
    } else if (handler.kind === "on") {
      if (handler.trigger === "message" || handler.trigger === "*" || !handler.trigger) {
        this.onMessageHandlers.push(runner);
      } else {
        const current = this.onKindHandlers.get(handler.trigger) ?? [];
        current.push(runner);
        this.onKindHandlers.set(handler.trigger, current);
      }
    } else if (handler.kind === "callback_query") {
      const isLiteral = Boolean(handler.trigger) && !/[.+*?^${}()|[\]\\]/.test(handler.trigger!);
      if (isLiteral) {
        const trigger = handler.trigger!;
        const current = this.callbackLiteralHandlers.get(trigger) ?? [];
        current.push(runner);
        this.callbackLiteralHandlers.set(trigger, current);
      } else {
        this.callbackRegexHandlers.push(runner);
      }
      this.callbackOrderedHandlers.push({ runner, isLiteral });
    } else if (handler.kind === "inline_query") {
      this.inlineHandlers.push(runner);
    } else if (handler.kind === "shipping_query") {
      this.shippingQueryHandlers.push(runner);
    } else if (handler.kind === "pre_checkout_query") {
      this.preCheckoutQueryHandlers.push(runner);
    } else if (handler.kind === "chat_member") {
      this.chatMemberHandlers.push(runner);
    } else if (handler.kind === "my_chat_member") {
      this.myChatMemberHandlers.push(runner);
    } else if (handler.kind === "chat_join_request") {
      this.chatJoinRequestHandlers.push(runner);
    } else if (handler.kind === "message_reaction") {
      this.messageReactionHandlers.push(runner);
    } else if (handler.kind === "message_reaction_count") {
      this.messageReactionCountHandlers.push(runner);
    } else if (handler.kind === "business_connection") {
      this.businessConnectionHandlers.push(runner);
    } else if (handler.kind === "business_message") {
      this.businessMessageHandlers.push(runner);
    } else if (handler.kind === "edited_business_message") {
      this.editedBusinessMessageHandlers.push(runner);
    } else if (handler.kind === "deleted_business_messages") {
      this.deletedBusinessMessagesHandlers.push(runner);
    }
    this.hasIndexedHandlers = true;
  }

  private indexControllerHandlers(controller: RegisteredController) {
    for (const handler of controller.handlers) {
      const method = (
        controller.instance as Record<string, (ctx: BaseContext) => Promise<void> | void>
      )[handler.methodName];
      if (typeof method !== "function") continue;

      const runner: HandlerRunner = {
        def: handler,
        middleware: [...controller.classMiddleware, ...handler.middleware],
        guards: handler.guards,
        callbackRegex:
          handler.kind === "callback_query" && handler.trigger
            ? this.toRegex(handler.trigger)
            : undefined,
        run: async (ctx) => method.call(controller.instance, ctx),
      };

      this.addToIndices(runner);
    }
  }

  /**
   * Dispatches the update to all matching indexed handlers.
   * Execution order for messages:
   * 1. Command handlers (exact match)
   * 2. Global message handlers (`onMessage`, `on('*')`)
   * 3. Kind-specific message handlers (`onText`, `on('photo')`, etc.)
   *
   * For other update types, handlers are executed if the update matches the kind.
   */
  private async dispatchIndexedHandlers(
    update: Update,
    sceneControl: SceneControl,
    meta: { kind: string; chatId?: number },
  ) {
    if (!this.hasIndexedHandlers) return;

    if (meta.kind === "message" && update.message) {
      const text = "text" in update.message ? update.message.text : undefined;
      if (text?.startsWith("/") && this.commandHandlers.size > 0) {
        const parsedCommand = this.parseCommand(text);
        if (parsedCommand) {
          const commandName = parsedCommand.command;
          const commandRunners = this.commandHandlers.get(commandName);
          if (commandRunners) {
            for (const runner of commandRunners) {
              await this.runControllerRunner(update, runner, sceneControl);
            }
          }
        }
      }

      for (const runner of this.onMessageHandlers) {
        await this.runControllerRunner(update, runner, sceneControl);
      }

      for (const [kind, runners] of this.onKindHandlers) {
        if (kind in update.message) {
          for (const runner of runners) {
            await this.runControllerRunner(update, runner, sceneControl);
          }
        }
      }
    }

    // Kind-specific handlers for non-message updates (e.g. on('callback_query'))
    const otherKindRunners = this.onKindHandlers.get(meta.kind);
    if (otherKindRunners && meta.kind !== "message") {
      for (const runner of otherKindRunners) {
        await this.runControllerRunner(update, runner, sceneControl);
      }
    }

    // Forward compatibility: check for handlers that might match properties of the update
    // even if getUpdateMetadata doesn't recognize the kind or if it's a new Telegram update type.
    // We skip meta.kind to avoid double-dispatching handlers that were already run.
    for (const [kind, runners] of this.onKindHandlers) {
      if (kind !== "*" && kind !== "message" && kind !== meta.kind && kind in update) {
        for (const runner of runners) {
          await this.runControllerRunner(update, runner, sceneControl);
        }
      }
    }

    // Handle on('*') and other global update handlers from onKindHandlers
    const catchAllRunners = this.onKindHandlers.get("*");
    if (catchAllRunners) {
      for (const runner of catchAllRunners) {
        await this.runControllerRunner(update, runner, sceneControl);
      }
    }

    if (meta.kind === "callback_query" && update.callback_query?.data) {
      const data = update.callback_query.data;
      // Optimization: if we only have literal handlers, use the Map for O(1)
      if (this.callbackRegexHandlers.length === 0) {
        const literalRunners = this.callbackLiteralHandlers.get(data);
        if (literalRunners) {
          for (const runner of literalRunners) {
            await this.runControllerRunner(update, runner, sceneControl);
          }
        }
      } else {
        // Fallback to ordered execution if regex handlers are present to preserve registration order
        for (const item of this.callbackOrderedHandlers) {
          if (item.isLiteral) {
            if (item.runner.def.trigger === data) {
              await this.runControllerRunner(update, item.runner, sceneControl);
            }
          } else {
            const matched = item.runner.callbackRegex?.exec(data);
            if (matched) {
              await this.runControllerRunner(update, item.runner, sceneControl, matched.slice(1));
            }
          }
        }
      }
    }

    if (meta.kind === "inline_query" && update.inline_query) {
      for (const runner of this.inlineHandlers) {
        const pattern = runner.def.trigger ?? "*";
        if (pattern !== "*" && pattern !== "" && !update.inline_query.query.includes(pattern))
          continue;
        await this.runControllerRunner(update, runner, sceneControl);
      }
    }

    if (meta.kind === "shipping_query") {
      for (const runner of this.shippingQueryHandlers) {
        await this.runControllerRunner(update, runner, sceneControl);
      }
    } else if (meta.kind === "pre_checkout_query") {
      for (const runner of this.preCheckoutQueryHandlers) {
        await this.runControllerRunner(update, runner, sceneControl);
      }
    } else if (meta.kind === "chat_member") {
      for (const runner of this.chatMemberHandlers) {
        await this.runControllerRunner(update, runner, sceneControl);
      }
    } else if (meta.kind === "my_chat_member") {
      for (const runner of this.myChatMemberHandlers) {
        await this.runControllerRunner(update, runner, sceneControl);
      }
    } else if (meta.kind === "chat_join_request") {
      for (const runner of this.chatJoinRequestHandlers) {
        await this.runControllerRunner(update, runner, sceneControl);
      }
    } else if (meta.kind === "message_reaction") {
      for (const runner of this.messageReactionHandlers) {
        await this.runControllerRunner(update, runner, sceneControl);
      }
    } else if (meta.kind === "message_reaction_count") {
      for (const runner of this.messageReactionCountHandlers) {
        await this.runControllerRunner(update, runner, sceneControl);
      }
    } else if (meta.kind === "business_connection") {
      for (const runner of this.businessConnectionHandlers) {
        await this.runControllerRunner(update, runner, sceneControl);
      }
    } else if (meta.kind === "business_message") {
      for (const runner of this.businessMessageHandlers) {
        await this.runControllerRunner(update, runner, sceneControl);
      }
    } else if (meta.kind === "edited_business_message") {
      for (const runner of this.editedBusinessMessageHandlers) {
        await this.runControllerRunner(update, runner, sceneControl);
      }
    } else if (meta.kind === "deleted_business_messages") {
      for (const runner of this.deletedBusinessMessagesHandlers) {
        await this.runControllerRunner(update, runner, sceneControl);
      }
    }
  }

  private async runControllerRunner(
    update: Update,
    runner: HandlerRunner,
    sceneControl: SceneControl,
    match?: string[],
  ) {
    const ctx = this.createContext(update, runner.def, sceneControl);
    if (match) ctx.match = match;

    for (const guard of runner.guards) {
      if (!(await guard(ctx))) {
        return;
      }
    }

    if (this.globalMiddleware.length === 0 && runner.middleware.length === 0) {
      await runner.run(ctx);
      return;
    }

    const stack: MiddlewareFn<BaseContext>[] = [
      ...this.globalMiddleware,
      ...runner.middleware,
      async (innerCtx) => runner.run(innerCtx),
    ];
    await compose(stack)(ctx, async () => undefined);
  }

  private async runWithGlobalMiddleware(ctx: BaseContext, run: () => Promise<void> | void) {
    if (this.globalMiddleware.length === 0) {
      await run();
      return;
    }
    await compose(this.globalMiddleware)(ctx, async () => {
      await run();
    });
  }

  /**
   * Efficiently extracts the primary update kind and associated chat ID.
   * This avoids repeated property checks throughout the dispatch pipeline.
   * Note: Some update types (like edited_message) deliberately do not have a chatId
   * to match the original framework behavior of using "global" as the chat key.
   */
  private getUpdateMetadata(update: Update): { kind: string; chatId?: number } {
    if (update.message) return { kind: "message", chatId: update.message.chat.id };
    if (update.callback_query)
      return { kind: "callback_query", chatId: update.callback_query.message?.chat.id };
    if (update.business_message)
      return { kind: "business_message", chatId: update.business_message.chat.id };
    if (update.chat_member) return { kind: "chat_member", chatId: update.chat_member.chat.id };
    if (update.my_chat_member)
      return { kind: "my_chat_member", chatId: update.my_chat_member.chat.id };
    if (update.chat_join_request)
      return { kind: "chat_join_request", chatId: update.chat_join_request.chat.id };
    if (update.message_reaction)
      return { kind: "message_reaction", chatId: update.message_reaction.chat.id };
    if (update.message_reaction_count)
      return { kind: "message_reaction_count", chatId: update.message_reaction_count.chat.id };
    if (update.edited_business_message)
      return { kind: "edited_business_message", chatId: update.edited_business_message.chat.id };
    if (update.deleted_business_messages)
      return {
        kind: "deleted_business_messages",
        chatId: update.deleted_business_messages.chat.id,
      };

    if (update.inline_query) return { kind: "inline_query" };
    if (update.chosen_inline_result) return { kind: "chosen_inline_result" };
    if (update.shipping_query) return { kind: "shipping_query" };
    if (update.pre_checkout_query) return { kind: "pre_checkout_query" };
    if (update.poll_answer) return { kind: "poll_answer" };
    if (update.poll) return { kind: "poll" };
    if (update.business_connection) return { kind: "business_connection" };
    if (update.edited_message) return { kind: "edited_message" };

    return { kind: "unknown" };
  }
}
