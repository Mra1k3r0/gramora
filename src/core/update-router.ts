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
  private readonly simpleHandlers: Array<{
    def: HandlerDefinition;
    fn: SimpleHandler;
    callbackRegex?: RegExp;
  }> = [];

  private readonly commandHandlers = new Map<string, HandlerRunner[]>();
  private readonly onMessageHandlers: HandlerRunner[] = [];
  private readonly onKindHandlers = new Map<string, HandlerRunner[]>();
  private readonly callbackHandlers: HandlerRunner[] = [];
  private readonly inlineHandlers: HandlerRunner[] = [];
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
    this.simpleHandlers.push({
      def: {
        methodName: "__simple__",
        kind,
        trigger,
        middleware: [],
        guards: [],
      },
      fn,
      callbackRegex: kind === "callback_query" ? this.toRegex(trigger) : undefined,
    });
  }

  /**
   * @param update - Telegram update payload
   * @see https://core.telegram.org/bots/api#update
   */
  async handleUpdate(update: Update) {
    const chatKey = String(
      update.message?.chat.id ??
        update.callback_query?.message?.chat.id ??
        update.chat_member?.chat.id ??
        update.my_chat_member?.chat.id ??
        update.chat_join_request?.chat.id ??
        update.message_reaction?.chat.id ??
        update.message_reaction_count?.chat.id ??
        update.business_message?.chat.id ??
        update.edited_business_message?.chat.id ??
        update.deleted_business_messages?.chat.id ??
        "global",
    );
    const sceneControl = await this.sceneManager.buildControl(chatKey);
    if (this.options.mode !== "core") {
      const sceneCtx = new SceneContext({ update, api: this.api, scene: sceneControl });
      if (await this.sceneManager.tryHandleActiveScene(chatKey, sceneCtx)) return;
    }

    await this.dispatchIndexedHandlers(update, sceneControl);

    for (const item of this.simpleHandlers) {
      const match = this.matches(update, item.def);
      if (!match.ok) continue;
      const gram = this.createContext(update, item.def, sceneControl);
      if (match.groups) gram.match = match.groups;
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
        this.callbackHandlers.push(runner);
      } else if (handler.kind === "inline_query") {
        this.inlineHandlers.push(runner);
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
    }

    this.hasIndexedHandlers = true;
  }

  private async dispatchIndexedHandlers(update: Update, sceneControl: SceneControl) {
    if (!this.hasIndexedHandlers) return;

    const text = update.message && "text" in update.message ? update.message.text : undefined;
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

    if (update.message) {
      for (const runner of this.onMessageHandlers) {
        await this.runControllerRunner(update, runner, sceneControl);
      }

      for (const [kind, runners] of this.onKindHandlers.entries()) {
        if (!this.messageHasKind(update.message, kind)) continue;
        for (const runner of runners) {
          await this.runControllerRunner(update, runner, sceneControl);
        }
      }
    }

    if (update.callback_query?.data) {
      for (const runner of this.callbackHandlers) {
        const matched = runner.callbackRegex?.exec(update.callback_query.data);
        if (!matched) continue;
        await this.runControllerRunner(update, runner, sceneControl, matched.slice(1));
      }
    }

    if (update.inline_query) {
      for (const runner of this.inlineHandlers) {
        const pattern = runner.def.trigger ?? "*";
        if (pattern !== "*" && pattern !== "" && !update.inline_query.query.includes(pattern))
          continue;
        await this.runControllerRunner(update, runner, sceneControl);
      }
    }

    if (update.chat_member) {
      for (const runner of this.chatMemberHandlers) {
        await this.runControllerRunner(update, runner, sceneControl);
      }
    }
    if (update.my_chat_member) {
      for (const runner of this.myChatMemberHandlers) {
        await this.runControllerRunner(update, runner, sceneControl);
      }
    }
    if (update.chat_join_request) {
      for (const runner of this.chatJoinRequestHandlers) {
        await this.runControllerRunner(update, runner, sceneControl);
      }
    }
    if (update.message_reaction) {
      for (const runner of this.messageReactionHandlers) {
        await this.runControllerRunner(update, runner, sceneControl);
      }
    }
    if (update.message_reaction_count) {
      for (const runner of this.messageReactionCountHandlers) {
        await this.runControllerRunner(update, runner, sceneControl);
      }
    }
    if (update.business_connection) {
      for (const runner of this.businessConnectionHandlers) {
        await this.runControllerRunner(update, runner, sceneControl);
      }
    }
    if (update.business_message) {
      for (const runner of this.businessMessageHandlers) {
        await this.runControllerRunner(update, runner, sceneControl);
      }
    }
    if (update.edited_business_message) {
      for (const runner of this.editedBusinessMessageHandlers) {
        await this.runControllerRunner(update, runner, sceneControl);
      }
    }
    if (update.deleted_business_messages) {
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
}
