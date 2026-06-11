export function normalizeProviderUsage(input = {}) {
  const status = String(input.status || input.providerStatus || "unknown").toLowerCase();
  const gpuSeconds = toNumberOrNull(input.gpuSeconds ?? input.taskCostTime ?? input.costTime);
  const rawCost = toNumberOrNull(input.rawCost ?? input.consumeMoney ?? input.cost);
  return {
    status,
    gpuSeconds,
    rawCost,
    outputUrl: input.outputUrl || "",
    raw: input.raw || input
  };
}

export function estimateCreditsFromCost({
  rawCost,
  creditPerCurrencyUnit = 100,
  markup = 1,
  floor = 1,
  cap = 100000
}) {
  const cost = Number(rawCost);
  if (!Number.isFinite(cost) || cost <= 0) return 0;
  const credits = Math.ceil(cost * Number(creditPerCurrencyUnit) * Number(markup));
  return Math.max(Number(floor), Math.min(Number(cap), credits));
}

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}
