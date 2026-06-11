import test from "node:test";
import assert from "node:assert/strict";

import {
  createTaskId,
  reconcileTask,
  estimateCreditsFromCost
} from "../src/index.js";

test("creates provider-neutral task IDs", () => {
  const id = createTaskId("AUD", new Date("2026-06-11T12:00:00Z"));
  assert.match(id, /^AUD-20260611-120000-[A-F0-9]{6}$/);
});

test("returns ok when task, provider job, and ledger match", () => {
  const taskId = "AUD-20260611-120000-ABC123";
  const result = reconcileTask({
    task: {
      taskId,
      taskType: "audio",
      status: "success",
      creditsConsumed: 30,
      gpuSeconds: 60
    },
    providerJobs: [
      { taskId, provider: "generic-cloud", providerTaskId: "job-001", status: "success", gpuSeconds: 60, rawCost: 0.1 }
    ],
    ledgerEntries: [
      { ledgerEntryId: "LED-1", taskId, entryType: "debit", creditsDelta: -30, balanceAfter: 970 }
    ],
    providerUsage: { status: "success", gpuSeconds: 60, rawCost: 0.1 },
    pricing: { creditPerCurrencyUnit: 100, markup: 3 }
  });

  assert.equal(result.level, "ok");
});

test("detects duplicate debit", () => {
  const taskId = "AUD-20260611-120000-ABC123";
  const result = reconcileTask({
    task: { taskId, taskType: "audio", status: "success", creditsConsumed: 30 },
    providerJobs: [{ taskId, provider: "generic-cloud", providerTaskId: "job-001", status: "success" }],
    ledgerEntries: [
      { ledgerEntryId: "LED-1", taskId, entryType: "debit", creditsDelta: -10 },
      { ledgerEntryId: "LED-2", taskId, entryType: "debit", creditsDelta: -20 }
    ]
  });

  assert.equal(result.level, "error");
  assert.equal(result.problems.some((p) => p.code === "DUPLICATE_DEBIT"), true);
});

test("detects provider usage mismatch", () => {
  const taskId = "VID-20260611-120000-ABC123";
  const result = reconcileTask({
    task: { taskId, taskType: "video", status: "success", creditsConsumed: 60, gpuSeconds: 100 },
    providerJobs: [{ taskId, provider: "generic-cloud", providerTaskId: "job-001", status: "success", gpuSeconds: 100, rawCost: 0.2 }],
    ledgerEntries: [{ ledgerEntryId: "LED-1", taskId, entryType: "debit", creditsDelta: -60 }],
    providerUsage: { status: "success", gpuSeconds: 140, rawCost: 0.4 },
    pricing: { creditPerCurrencyUnit: 100, markup: 3 }
  });

  assert.equal(result.level, "error");
  assert.equal(result.problems.some((p) => p.code === "GPU_SECONDS_MISMATCH"), true);
  assert.equal(result.problems.some((p) => p.code === "RAW_COST_MISMATCH"), true);
});

test("estimates credits from provider cost", () => {
  assert.equal(estimateCreditsFromCost({ rawCost: 0.1, creditPerCurrencyUnit: 100, markup: 3 }), 30);
});
