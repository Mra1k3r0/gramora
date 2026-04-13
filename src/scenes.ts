import type { SceneContext } from "./context";
import type { Constructor } from "./core/types";
import { metadata } from "./decorators";

export interface SessionRecord {
  scene?: { name: string; step: number; state: Record<string, unknown> };
}

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

  async buildControl(chatKey: string) {
    const record = (await this.sessionStore.get(chatKey)) ?? {};
    return {
      name: record.scene?.name,
      step: record.scene?.step,
      state: record.scene?.state ?? {},
      enter: async (name: string) => {
        await this.sessionStore.set(chatKey, {
          scene: { name, step: 1, state: {} },
        });
      },
      leave: async () => {
        await this.sessionStore.delete(chatKey);
      },
      next: async () => {
        const current = await this.sessionStore.get(chatKey);
        if (!current?.scene) return;
        await this.sessionStore.set(chatKey, {
          scene: { ...current.scene, step: current.scene.step + 1 },
        });
      },
    };
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
