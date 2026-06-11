# Compute Ledger Reconciliation Kit

Provider-neutral task, ledger, and usage reconciliation utilities for credit-based compute products.

This package helps teams keep three records aligned:

1. The product task record.
2. The internal credit ledger.
3. The external compute provider usage result.

It is designed for products that charge users in credits while paying external providers in money, seconds, tokens, or other measured usage units.

## What This Solves

- Stable product task IDs independent of provider IDs.
- Idempotency keys for retry-safe submissions.
- Ledger entries that can represent debit, refund, adjustment, and manual review.
- Reconciliation rules that detect mismatches without automatically changing balances.
- Agent-ready instructions so coding agents can integrate the pattern safely.

## Core Principle

The product owns the user-facing task ID and ledger.

External provider IDs are execution details. They should be stored for audit and support, but they should not replace product task IDs in user-facing workflows.

## Quick Start

```bash
git clone <repo-url>
cd compute-ledger-reconciliation-kit
npm test
```

Use the library:

```js
import {
  createTaskId,
  createClientRequestId,
  createLedgerEntryId,
  reconcileTask
} from "compute-ledger-reconciliation-kit";

const taskId = createTaskId("AUD");
const clientRequestId = createClientRequestId();
const ledgerEntryId = createLedgerEntryId();

const result = reconcileTask({
  task: {
    taskId,
    projectId: "PRJ-20260611-120000-ABC123",
    taskType: "audio",
    status: "success",
    creditsConsumed: 30,
    gpuSeconds: 60
  },
  providerJobs: [
    {
      taskId,
      provider: "generic-cloud",
      providerTaskId: "provider-task-001",
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
  ]
});

console.log(result.level, result.message);
```

## Agent One-Click Integration

This package ships with [AGENTS.md](./AGENTS.md) — a ready-to-use instruction file designed for AI coding assistants (Claude Code, Cursor, Copilot, etc.).

To integrate this reconciliation layer into your product, copy the prompt from AGENTS.md into your AI coding tool. The agent will:

1. Add ID generation helpers.
2. Set up task, provider job, and ledger tables.
3. Add submit idempotency via `clientRequestId`.
4. Wire up read-only reconciliation.
5. Run tests for duplicate submit, missing ledger, duplicate debit, and provider mismatch.

No need to manually read through all source files — the agent understands the pattern from AGENTS.md alone, making integration quick and consistent across projects.

## Data Model

Recommended ID chain:

```text
projectId
└─ taskId
   ├─ clientRequestId
   ├─ providerTaskId
   └─ ledgerEntryId
```

| ID | Owner | Purpose |
|---|---|---|
| `projectId` | Product | Groups many tasks under one user project. |
| `taskId` | Product | Main user-support and reconciliation key for one billable task. |
| `clientRequestId` | Client | Makes retry and duplicate-click handling safe. |
| `providerTaskId` | External provider | Locates the provider execution job. |
| `ledgerEntryId` | Product | Identifies one immutable credit ledger movement. |

## Files

- `src/` - Core reusable code.
- `docs/database-schema.sql` - Reference SQL schema.
- `docs/integration-guide.md` - Integration checklist.
- `examples/node-basic.mjs` - Minimal usage example.
- `AGENTS.md` - One-pass instructions for coding agents.

## Safety Defaults

The reconciliation utilities only report mismatches. They do not automatically debit, refund, delete, or mutate user balances.

Balance changes should be handled by an explicit product-side workflow with audit logs.

## License

MIT.
