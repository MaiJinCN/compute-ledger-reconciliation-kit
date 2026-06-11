export type TaskStatus = "pending" | "submitted" | "success" | "failed" | "cancelled";
export type LedgerEntryType = "debit" | "refund" | "adjustment";
export type ReconcileLevel = "ok" | "warn" | "error";

export interface TaskRecord {
  taskId: string;
  projectId?: string;
  taskType?: string;
  status: TaskStatus | string;
  creditsConsumed?: number;
  gpuSeconds?: number;
  providerRequired?: boolean;
  billableOnFailure?: boolean;
}

export interface ProviderJob {
  taskId: string;
  provider: string;
  providerTaskId: string;
  status?: string;
  gpuSeconds?: number;
  rawCost?: number;
}

export interface LedgerEntry {
  ledgerEntryId: string;
  taskId: string;
  entryType: LedgerEntryType | string;
  creditsDelta: number;
  balanceBefore?: number;
  balanceAfter?: number;
  gpuSeconds?: number;
  rawCost?: number;
  providerTaskId?: string;
}

export interface ProviderUsage {
  status?: string;
  gpuSeconds?: number;
  taskCostTime?: number;
  rawCost?: number;
  consumeMoney?: number;
}

export interface ReconcileProblem {
  code: string;
  level: ReconcileLevel;
  message: string;
  details?: Record<string, unknown>;
}

export interface ReconcileResult {
  level: ReconcileLevel;
  message: string;
  problems: ReconcileProblem[];
}

export function createProjectId(date?: Date): string;
export function createTaskId(taskPrefix: string, date?: Date): string;
export function createClientRequestId(date?: Date): string;
export function createLedgerEntryId(date?: Date): string;
export function reconcileTask(input: {
  task: TaskRecord;
  providerJobs?: ProviderJob[];
  ledgerEntries?: LedgerEntry[];
  providerUsage?: ProviderUsage | null;
  pricing?: {
    creditPerCurrencyUnit?: number;
    markup?: number;
    floor?: number;
    cap?: number;
  };
}): ReconcileResult;
