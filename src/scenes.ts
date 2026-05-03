import type { BaseContext, SceneContext } from "./context";
import type { Constructor } from "./core/types";
import { metadata } from "./decorators";

export interface SessionRecord {
  scene?: { name: string; step: number; state: Record<string, unknown> };
  conversation?: { id: string; step: number; state: Record<string, unknown> };
}

/** One step of a functional conversation (`bot.conversation`). Receives the same context as handlers on `bot.command` / `bot.onText`. */
export type ConversationStep = (ctx: BaseContext) => void | Promise<void>;

export interface SessionStore {
  get(key: string): Promise<SessionRecord | undefined>;
  set(key: string, value: SessionRecord): Promise<void>;
  delete(key: string): Promise<void>;
}

export class MemorySessionStore implements SessionStore {
  private readonly store = new Map<string, SessionRecord>();

  async get(key: string) {
    return this.store.get(key);
  }

  async set(key: string, value: SessionRecord) {
    this.store.set(key, value);
  }

  async delete(key: string) {
    this.store.delete(key);
  }
}

export class SceneManager {
  private readonly scenes = new Map<string, Constructor>();
  private readonly conversations = new Map<string, ConversationStep[]>();

  constructor(private readonly sessionStore: SessionStore = new MemorySessionStore()) {}

  /**
   * @param sceneClass - Class decorated with `@Scene`
   * @throws {Error} When the class has no `@Scene` name metadata
   */
  register(sceneClass: Constructor) {
    const meta = metadata.getSceneMeta(sceneClass.prototype);
    if (!meta?.name) throw new Error("Scene class is missing @Scene decorator");
    this.scenes.set(meta.name, sceneClass);
  }

  /**
   * @param id - Stable id passed to `ctx.conv.enter(id)`
   * @param steps - Ordered handlers; step 1 runs after enter, then call `ctx.conv.next()` to advance
   * @throws {Error} When `steps` is empty or `id` is already registered
   */
  registerConversation(id: string, steps: ConversationStep[]) {
    if (steps.length === 0) throw new Error("Conversation must define at least one step");
    if (this.conversations.has(id)) throw new Error(`Conversation "${id}" is already registered`);
    this.conversations.set(id, steps);
  }

  async buildControl(chatKey: string) {
    const record = (await this.sessionStore.get(chatKey)) ?? {};
    return {
      name: record.scene?.name,
      step: record.scene?.step,
      state: record.scene?.state ?? {},
      enter: async (name: string) => {
        const cur = (await this.sessionStore.get(chatKey)) ?? {};
        await this.sessionStore.set(chatKey, {
          ...cur,
          scene: { name, step: 1, state: {} },
          conversation: undefined,
        });
      },
      leave: async () => {
        const current = await this.sessionStore.get(chatKey);
        if (!current?.scene) return;
        const rest = { ...current };
        delete rest.scene;
        if (Object.keys(rest).length === 0) await this.sessionStore.delete(chatKey);
        else await this.sessionStore.set(chatKey, rest as SessionRecord);
      },
      next: async () => {
        const current = await this.sessionStore.get(chatKey);
        if (!current?.scene) return;
        await this.sessionStore.set(chatKey, {
          ...current,
          scene: { ...current.scene, step: current.scene.step + 1 },
        });
      },
    };
  }

  async buildConversationControl(chatKey: string) {
    const record = (await this.sessionStore.get(chatKey)) ?? {};
    const conv = record.conversation;
    return {
      id: conv?.id,
      step: conv?.step,
      state: conv?.state ?? {},
      enter: async (conversationId: string, initialState: Record<string, unknown> = {}) => {
        if (!this.conversations.has(conversationId)) {
          throw new Error(`Unknown conversation "${conversationId}"`);
        }
        const cur = (await this.sessionStore.get(chatKey)) ?? {};
        await this.sessionStore.set(chatKey, {
          ...cur,
          conversation: { id: conversationId, step: 1, state: { ...initialState } },
          scene: undefined,
        });
      },
      leave: async () => {
        const current = await this.sessionStore.get(chatKey);
        if (!current?.conversation) return;
        const rest = { ...current };
        delete rest.conversation;
        if (Object.keys(rest).length === 0) await this.sessionStore.delete(chatKey);
        else await this.sessionStore.set(chatKey, rest as SessionRecord);
      },
      next: async () => {
        const current = await this.sessionStore.get(chatKey);
        if (!current?.conversation) return;
        await this.sessionStore.set(chatKey, {
          ...current,
          conversation: { ...current.conversation, step: current.conversation.step + 1 },
        });
      },
    };
  }

  async tryHandleActiveConversation(chatKey: string, ctx: BaseContext): Promise<boolean> {
    const record = await this.sessionStore.get(chatKey);
    if (!record?.conversation) return false;
    const steps = this.conversations.get(record.conversation.id);
    if (!steps?.length) return false;
    const stepIndex = record.conversation.step - 1;
    if (stepIndex < 0 || stepIndex >= steps.length) {
      const current = await this.sessionStore.get(chatKey);
      if (current?.conversation) {
        const rest = { ...current };
        delete rest.conversation;
        if (Object.keys(rest).length === 0) await this.sessionStore.delete(chatKey);
        else await this.sessionStore.set(chatKey, rest as SessionRecord);
      }
      return false;
    }
    await steps[stepIndex](ctx);
    return true;
  }

  async tryHandleActiveScene(chatKey: string, ctx: SceneContext): Promise<boolean> {
    const record = await this.sessionStore.get(chatKey);
    if (!record?.scene) return false;
    const sceneClass = this.scenes.get(record.scene.name);
    if (!sceneClass) return false;
    const meta = metadata.getSceneMeta(sceneClass.prototype);
    if (!meta) return false;
    const handler = meta.steps.find((s) => s.step === record.scene?.step);
    if (!handler) return false;
    const instance = new sceneClass() as Record<
      string,
      (ctx: SceneContext) => Promise<void> | void
    >;
    const fn = instance[handler.methodName];
    if (typeof fn !== "function") return false;
    await fn.call(instance, ctx);
    return true;
  }
}
