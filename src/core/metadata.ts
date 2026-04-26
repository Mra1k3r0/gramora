type MetadataTarget = object;

const store = new WeakMap<MetadataTarget, Map<symbol, unknown>>();

function getMap(target: MetadataTarget): Map<symbol, unknown> {
  let map = store.get(target);
  if (!map) {
    map = new Map();
    store.set(target, map);
  }
  return map;
}

export function defineMetadata(key: symbol, value: unknown, target: MetadataTarget): void {
  getMap(target).set(key, value);
}

export function getMetadata(key: symbol, target: MetadataTarget): unknown {
  return getMap(target).get(key);
}
