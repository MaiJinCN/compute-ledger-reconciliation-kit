import { createLedgerEntryId } from "./id.js";

export function createDebitEntry({
  taskId,
  projectId = "",
  accountId = "",
  credits,
  balanceBefore,
  gpuSeconds = null,
  rawCost = null,
  providerTaskId = "",
  reason = "usage"
}) {
  if (!taskId) throw new Error("taskId is required.");
  if (!Number.isFinite(Number(credits)) || Number(credits) <= 0) {
    throw new Error("credits must be a positive number.");
  }
  const before = Number(balanceBefore);
  if (!Number.isFinite(before)) throw new Error("balanceBefore must be a number.");
  const cost = Number(credits);
  return {
    ledgerEntryId: createLedgerEntryId(),
    taskId,
    projectId,
    accountId,
    entryType: "debit",
    creditsDelta: -cost,
    balanceBefore: before,
    balanceAfter: before - cost,
    gpuSeconds,
    rawCost,
    providerTaskId,
    reason,
    createdAt: new Date().toISOString()
  };
}

export function createRefundEntry({
  taskId,
  projectId = "",
  accountId = "",
  credits,
  balanceBefore,
  reason = "refund"
}) {
  if (!taskId) throw new Error("taskId is required.");
  if (!Number.isFinite(Number(credits)) || Number(credits) <= 0) {
    throw new Error("credits must be a positive number.");
  }
  const before = Number(balanceBefore);
  if (!Number.isFinite(before)) throw new Error("balanceBefore must be a number.");
  const amount = Number(credits);
  return {
    ledgerEntryId: createLedgerEntryId(),
    taskId,
    projectId,
    accountId,
    entryType: "refund",
    creditsDelta: amount,
    balanceBefore: before,
    balanceAfter: before + amount,
    reason,
    createdAt: new Date().toISOString()
  };
}

export function summarizeLedger(entries = []) {
  return entries.reduce(
    (summary, entry) => {
      summary.count += 1;
      if (entry.entryType === "debit") {
        summary.debitCount += 1;
        summary.debitCredits += Math.abs(Number(entry.creditsDelta || 0));
      }
      if (entry.entryType === "refund") {
        summary.refundCount += 1;
        summary.refundCredits += Math.abs(Number(entry.creditsDelta || 0));
      }
      if (entry.balanceAfter !== undefined && entry.balanceAfter !== null) {
        summary.lastBalanceAfter = Number(entry.balanceAfter);
      }
      return summary;
    },
    {
      count: 0,
      debitCount: 0,
      refundCount: 0,
      debitCredits: 0,
      refundCredits: 0,
      lastBalanceAfter: null
    }
  );
}
