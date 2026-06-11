import {
  createProjectId,
  createTaskId,
  createLedgerEntryId,
  reconcileTask
} from "../src/index.js";

const projectId = createProjectId(new Date("2026-06-11T12:00:00Z"));
const taskId = createTaskId("AUD", new Date("2026-06-11T12:01:00Z"));
const ledgerEntryId = createLedgerEntryId(new Date("2026-06-11T12:02:00Z"));

const result = reconcileTask({
  task: {
    taskId,
    projectId,
    taskType: "audio",
    status: "success",
    creditsConsumed: 30,
    gpuSeconds: 60
  },
  providerJobs: [
    {
      taskId,
      provider: "generic-cloud",
      providerTaskId: "provider-job-001",
      status: "success",
      gpuSeconds: 60,
      rawCost: 0.1
    }
  ],
  ledgerEntries: [
    {
      ledgerEntryId,
      taskId,
      entryType: "debit",
      creditsDelta: -30,
      balanceAfter: 970,
      gpuSeconds: 60,
      rawCost: 0.1
    }
  ],
  providerUsage: {
    status: "success",
    gpuSeconds: 60,
    rawCost: 0.1
  },
  pricing: {
    creditPerCurrencyUnit: 100,
    markup: 3
  }
});

console.log(JSON.stringify(result, null, 2));
