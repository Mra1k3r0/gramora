import { performance } from "node:perf_hooks";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { Gramora } = require("../dist/index.js");

const TOTAL_UPDATES = 25000;
const bot = new Gramora({ token: "BENCH_TOKEN", mode: "core" });

let handled = 0;
bot.onText(async (ctx) => {
  if (ctx.text) handled += 1;
});

const sampleUpdate = {
  update_id: 1,
  message: {
    message_id: 1,
    date: Math.floor(Date.now() / 1000),
    chat: { id: 1, type: "private" },
    from: { id: 1, is_bot: false, first_name: "Bench" },
    text: "/hello benchmark",
  },
};

const start = performance.now();
for (let i = 0; i < TOTAL_UPDATES; i += 1) {
  await bot.handleUpdate({
    ...sampleUpdate,
    update_id: i + 1,
    message: { ...sampleUpdate.message, message_id: i + 1 },
  });
}
const elapsedMs = performance.now() - start;
const updatesPerSec = Math.round((TOTAL_UPDATES / elapsedMs) * 1000);

console.log("Gramora benchmark");
console.log(`updates: ${TOTAL_UPDATES}`);
console.log(`handled: ${handled}`);
console.log(`elapsed_ms: ${Math.round(elapsedMs)}`);
console.log(`updates_per_sec: ${updatesPerSec}`);
