import type { BaseContext } from "./context";

export type GuardFn = (ctx: BaseContext) => boolean | Promise<boolean>;
export type DecoratorMiddleware = (
  ctx: BaseContext,
  next: () => Promise<void>,
) => Promise<void> | void;
export type HandlerKind =
  | "command"
  | "on"
  | "callback_query"
  | "inline_query"
  | "shipping_query"
  | "pre_checkout_query"
  | "chat_member"
  | "my_chat_member"
  | "chat_join_request"
  | "message_reaction"
  | "message_reaction_count"
  | "business_connection"
  | "business_message"
  | "edited_business_message"
  | "deleted_business_messages"
  | "scene_step";

export interface HandlerDefinition {
  methodName: string;
  kind: HandlerKind;
  trigger?: string;
  middleware: DecoratorMiddleware[];
  guards: GuardFn[];
  step?: number;
}

export interface ControllerMetadata {
  handlers: HandlerDefinition[];
  middleware: DecoratorMiddleware[];
}

export interface SceneMetadata {
  name: string;
  steps: HandlerDefinition[];
}

const CONTROLLER = Symbol("gramora:controller");
const SCENE = Symbol("gramora:scene");

const ensureControllerMeta = (target: object): ControllerMetadata => {
  const existing = Reflect.getMetadata(CONTROLLER, target) as ControllerMetadata | undefined;
  if (existing) return existing;
  const created: ControllerMetadata = { handlers: [], middleware: [] };
  Reflect.defineMetadata(CONTROLLER, created, target);
  return created;
};

/** Reflect metadata for `@Controller` / `@Scene` (see `registerHandler`). */
export const metadata = {
  ensureControllerMeta,
  getControllerMeta(target: object) {
    return Reflect.getMetadata(CONTROLLER, target) as ControllerMetadata | undefined;
  },
  setSceneMeta(target: object, data: SceneMetadata) {
    Reflect.defineMetadata(SCENE, data, target);
  },
  getSceneMeta(target: object) {
    return Reflect.getMetadata(SCENE, target) as SceneMetadata | undefined;
  },
};

/**
 * @param target - Controller prototype
 * @param methodName - Instance method key
 * @param partial - Kind and optional trigger/step (no middleware/guards here)
 * @returns New or updated handler row
 */
export function registerHandler(
  target: object,
  methodName: string,
  partial: Omit<HandlerDefinition, "methodName" | "middleware" | "guards">,
) {
  const meta = ensureControllerMeta(target);
  const existing = meta.handlers.find(
    (h) => h.methodName === methodName && h.kind === partial.kind,
  );
  if (existing) {
    existing.trigger = partial.trigger;
    existing.step = partial.step;
    return existing;
  }
  const h: HandlerDefinition = {
    methodName,
    kind: partial.kind,
    trigger: partial.trigger,
    step: partial.step,
    middleware: [],
    guards: [],
  };
  meta.handlers.push(h);
  return h;
}

/** @returns Class decorator; initializes controller metadata on the prototype */
export function Controller(): ClassDecorator {
  return (target) => {
    metadata.ensureControllerMeta(target.prototype);
  };
}

/**
 * @param command - Name without leading `/`
 * @returns Method decorator
 */
export function Command(command: string): MethodDecorator {
  return (target, propertyKey) => {
    registerHandler(target, String(propertyKey), {
      kind: "command",
      trigger: command,
    });
  };
}

/**
 * @param trigger - Message content key, `message`, or `*`
 * @returns Method decorator
 */
export function On(trigger: string): MethodDecorator {
  return (target, propertyKey) => {
    registerHandler(target, String(propertyKey), {
      kind: "on",
      trigger,
    });
  };
}

/**
 * @param trigger - `callback_data` regex (use `*` segments for wildcards)
 * @returns Method decorator
 */
export function CallbackQuery(trigger: string): MethodDecorator {
  return (target, propertyKey) => {
    registerHandler(target, String(propertyKey), {
      kind: "callback_query",
      trigger,
    });
  };
}

/**
 * @param trigger - Substring match on inline query text, or `*`
 * @returns Method decorator
 */
export function InlineQuery(trigger = "*"): MethodDecorator {
  return (target, propertyKey) => {
    registerHandler(target, String(propertyKey), {
      kind: "inline_query",
      trigger,
    });
  };
}

/** @returns Method decorator; update field `chat_member` */
export function OnChatMember(): MethodDecorator {
  return (target, propertyKey) => {
    registerHandler(target, String(propertyKey), { kind: "chat_member" });
  };
}

/** @returns Method decorator; update field `my_chat_member` */
export function OnMyChatMember(): MethodDecorator {
  return (target, propertyKey) => {
    registerHandler(target, String(propertyKey), { kind: "my_chat_member" });
  };
}

/** @returns Method decorator; update field `chat_join_request` */
export function OnChatJoinRequest(): MethodDecorator {
  return (target, propertyKey) => {
    registerHandler(target, String(propertyKey), { kind: "chat_join_request" });
  };
}

/** @returns Method decorator; update field `message_reaction` */
export function OnMessageReaction(): MethodDecorator {
  return (target, propertyKey) => {
    registerHandler(target, String(propertyKey), { kind: "message_reaction" });
  };
}

/** @returns Method decorator; update field `message_reaction_count` */
export function OnMessageReactionCount(): MethodDecorator {
  return (target, propertyKey) => {
    registerHandler(target, String(propertyKey), { kind: "message_reaction_count" });
  };
}

/** @returns Method decorator; update field `business_connection` */
export function OnBusinessConnection(): MethodDecorator {
  return (target, propertyKey) => {
    registerHandler(target, String(propertyKey), { kind: "business_connection" });
  };
}

/** @returns Method decorator; update field `business_message` */
export function OnBusinessMessage(): MethodDecorator {
  return (target, propertyKey) => {
    registerHandler(target, String(propertyKey), { kind: "business_message" });
  };
}

/** @returns Method decorator; update field `edited_business_message` */
export function OnEditedBusinessMessage(): MethodDecorator {
  return (target, propertyKey) => {
    registerHandler(target, String(propertyKey), { kind: "edited_business_message" });
  };
}

/** @returns Method decorator; update field `deleted_business_messages` */
export function OnDeletedBusinessMessages(): MethodDecorator {
  return (target, propertyKey) => {
    registerHandler(target, String(propertyKey), { kind: "deleted_business_messages" });
  };
}

/**
 * @param guard - Return false to skip the handler
 * @returns Method decorator
 */
export function Guard(guard: GuardFn): MethodDecorator {
  return (target, propertyKey) => {
    const methodName = String(propertyKey);
    const meta = metadata.ensureControllerMeta(target);
    const linked = meta.handlers.filter((h) => h.methodName === methodName);
    if (linked.length === 0) {
      const fallback = registerHandler(target, methodName, {
        kind: "on",
        trigger: "*",
      });
      fallback.guards.push(guard);
      return;
    }
    for (const handler of linked) handler.guards.push(guard);
  };
}

/**
 * @param mw - Per-method middleware, or class-wide if applied to the controller class
 * @returns Method and class decorator
 */
export function UseMiddleware(mw: DecoratorMiddleware): MethodDecorator & ClassDecorator {
  return (target: object | { prototype: object }, propertyKey?: string | symbol) => {
    if (propertyKey) {
      const methodName = String(propertyKey);
      const meta = metadata.ensureControllerMeta(target);
      const linked = meta.handlers.filter((h) => h.methodName === methodName);
      if (linked.length === 0) {
        const fallback = registerHandler(target, methodName, {
          kind: "on",
          trigger: "*",
        });
        fallback.middleware.push(mw);
        return;
      }
      for (const handler of linked) handler.middleware.push(mw);
      return;
    }
    const controllerTarget = "prototype" in target ? target.prototype : target;
    const meta = metadata.ensureControllerMeta(controllerTarget);
    meta.middleware.push(mw);
  };
}

/**
 * @param name - Scene id used with scene control
 * @returns Class decorator
 */
export function Scene(name: string): ClassDecorator {
  return (target) => {
    const existing = metadata.getSceneMeta(target.prototype);
    metadata.setSceneMeta(target.prototype, {
      name,
      steps: existing?.steps ?? [],
    });
  };
}

/**
 * @param step - Step index inside the scene
 * @returns Method decorator
 */
export function Step(step: number): MethodDecorator {
  return (target, propertyKey) => {
    const handler = registerHandler(target, String(propertyKey), {
      kind: "scene_step",
      trigger: String(step),
      step,
    });
    const scene = metadata.getSceneMeta(target) ?? { name: "", steps: [] };
    if (!scene.steps.some((s) => s.methodName === handler.methodName && s.step === handler.step)) {
      scene.steps.push(handler);
    }
    metadata.setSceneMeta(target, scene);
  };
}
