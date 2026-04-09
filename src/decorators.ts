import type { BaseContext } from "./context";

export type GuardFn = (ctx: BaseContext) => boolean | Promise<boolean>;
export type DecoratorMiddleware = (
  ctx: BaseContext,
  next: () => Promise<void>,
) => Promise<void> | void;
export type HandlerKind = "command" | "on" | "callback_query" | "inline_query" | "scene_step";

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

export function Controller(): ClassDecorator {
  return (target) => {
    metadata.ensureControllerMeta(target.prototype);
  };
}

export function Command(command: string): MethodDecorator {
  return (target, propertyKey) => {
    registerHandler(target, String(propertyKey), {
      kind: "command",
      trigger: command,
    });
  };
}

export function On(trigger: string): MethodDecorator {
  return (target, propertyKey) => {
    registerHandler(target, String(propertyKey), {
      kind: "on",
      trigger,
    });
  };
}

export function CallbackQuery(trigger: string): MethodDecorator {
  return (target, propertyKey) => {
    registerHandler(target, String(propertyKey), {
      kind: "callback_query",
      trigger,
    });
  };
}

export function InlineQuery(trigger = "*"): MethodDecorator {
  return (target, propertyKey) => {
    registerHandler(target, String(propertyKey), {
      kind: "inline_query",
      trigger,
    });
  };
}

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

export function Scene(name: string): ClassDecorator {
  return (target) => {
    const existing = metadata.getSceneMeta(target.prototype);
    metadata.setSceneMeta(target.prototype, {
      name,
      steps: existing?.steps ?? [],
    });
  };
}

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
