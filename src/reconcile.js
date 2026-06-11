import { summarizeLedger } from "./ledger.js";
import { normalizeProviderUsage, estimateCreditsFromCost } from "./provider.js";

export function reconcileTask({
  task,
  providerJobs = [],
  ledgerEntries = [],
  providerUsage = null,
  pricing = {}
}) {
  const problems = [];

  if (!task || !task.taskId) {
    return result("error", "Task is missing taskId.", [{ code: "TASK_ID_MISSING", level: "error" }]);
  }

  const matchingProviderJobs = providerJobs.filter((job) => job.taskId === task.taskId);
  const matchingLedgerEntries = ledgerEntries.filter((entry) => entry.taskId === task.taskId);
  const ledger = summarizeLedger(matchingLedgerEntries);

  if (matchingProviderJobs.length === 0 && needsProviderJob(task)) {
    problems.push(problem("PROVIDER_JOB_MISSING", "warn", "Task has no provider job binding."));
  }

  if (ledger.debitCount > 1) {
    problems.push(problem("DUPLICATE_DEBIT", "error", "Task has multiple debit ledger entries."));
  }

  if (task.status === "success" && Number(task.creditsConsumed || 0) > 0 && ledger.debitCount === 0) {
    problems.push(problem("LEDGER_MISSING", "error", "Successful billable task has no debit ledger entry."));
  }

  if (task.status === "failed" && ledger.debitCount > 0 && !allowsFailedTaskDebit(task)) {
    problems.push(problem("FAILED_TASK_DEBIT", "error", "Failed task has a debit ledger entry."));
  }

  if (ledger.debitCount > 0) {
    const taskCredits = Number(task.creditsConsumed || 0);
    if (taskCredits > 0 && ledger.debitCredits !== taskCredits) {
      problems.push(problem("CREDIT_MISMATCH", "error", "Task credits and ledger debit credits do not match.", {
        taskCredits,
        ledgerDebitCredits: ledger.debitCredits
      }));
    }
  }

  if (providerUsage) {
    compareProviderUsage({ task, providerJobs: matchingProviderJobs, ledger, providerUsage, pricing, problems });
  }

  if (problems.some((item) => item.level === "error")) {
    return result("error", "Reconciliation found blocking mismatches.", problems);
  }
  if (problems.some((item) => item.level === "warn")) {
    return result("warn", "Reconciliation found items that need review.", problems);
  }
  return result("ok", "Task, provider job, and ledger are aligned.", []);
}

function compareProviderUsage({ task, providerJobs, ledger, providerUsage, pricing, problems }) {
  const usage = normalizeProviderUsage(providerUsage);
  const latestJob = providerJobs[providerJobs.length - 1] || {};

  if (latestJob.status && usage.status && String(latestJob.status).toLowerCase() !== usage.status) {
    problems.push(problem("PROVIDER_STATUS_MISMATCH", "error", "Saved provider status and current provider status do not match.", {
      saved: latestJob.status,
      current: usage.status
    }));
  }

  if (latestJob.gpuSeconds != null && usage.gpuSeconds != null && Math.abs(Number(latestJob.gpuSeconds) - Number(usage.gpuSeconds)) > 1) {
    problems.push(problem("GPU_SECONDS_MISMATCH", "error", "Saved GPU seconds and current provider GPU seconds do not match.", {
      saved: latestJob.gpuSeconds,
      current: usage.gpuSeconds
    }));
  }

  if (latestJob.rawCost != null && usage.rawCost != null && Math.abs(Number(latestJob.rawCost) - Number(usage.rawCost)) > 0.005) {
    problems.push(problem("RAW_COST_MISMATCH", "error", "Saved raw cost and current provider raw cost do not match.", {
      saved: latestJob.rawCost,
      current: usage.rawCost
    }));
  }

  const expectedCredits = estimateCreditsFromCost({
    rawCost: usage.rawCost,
    creditPerCurrencyUnit: pricing.creditPerCurrencyUnit ?? 100,
    markup: pricing.markup ?? 1,
    floor: pricing.floor ?? 1,
    cap: pricing.cap ?? 100000
  });

  if (expectedCredits > 0 && ledger.debitCredits > 0 && expectedCredits !== ledger.debitCredits) {
    problems.push(problem("EXPECTED_CREDITS_MISMATCH", "error", "Ledger debit credits do not match credits recalculated from provider usage.", {
      ledgerDebitCredits: ledger.debitCredits,
      expectedCredits
    }));
  }

  if (task.gpuSeconds != null && usage.gpuSeconds != null && Math.abs(Number(task.gpuSeconds) - Number(usage.gpuSeconds)) > 1) {
    problems.push(problem("TASK_GPU_SECONDS_MISMATCH", "warn", "Task GPU seconds and current provider GPU seconds do not match.", {
      taskGpuSeconds: task.gpuSeconds,
      providerGpuSeconds: usage.gpuSeconds
    }));
  }
}

function needsProviderJob(task) {
  return Boolean(task.providerRequired ?? ["audio", "video", "compute"].includes(String(task.taskType || "").toLowerCase()));
}

function allowsFailedTaskDebit(task) {
  return Boolean(task.billableOnFailure);
}

function problem(code, level, message, details = {}) {
  return { code, level, message, details };
}

function result(level, message, problems) {
  return { level, message, problems };
}
