# Agent Reuse Instructions

These instructions are for coding agents that need to integrate this kit into another product.

## Objective

Integrate a provider-neutral task and credit-ledger reconciliation layer.

The integration must keep product task IDs, provider job IDs, and credit ledger entries separate.

## Non-Negotiable Rules

1. Do not use a provider job ID as the product task ID.
2. Do not expose provider names or provider costs in ordinary user interfaces unless the product owner explicitly wants that.
3. Do not automatically debit, refund, or adjust balances from reconciliation results.
4. Do not mutate historical ledger entries. Add new adjustment entries instead.
5. Use `clientRequestId` or an equivalent idempotency key for every submit action that can be retried.
6. Show full IDs in admin audit views. Do not shorten IDs where support or reconciliation depends on exact matching.
7. Before changing billing logic, write tests for duplicate submit, failed provider job, missing ledger, duplicate debit, and provider usage mismatch.

## One-Pass Integration Prompt

Copy this prompt into a coding agent:

```text
Integrate the Compute Ledger Reconciliation Kit into this product.

Read AGENTS.md and docs/integration-guide.md first.

Implement a provider-neutral billing model:
- projectId groups related work.
- taskId is the product-owned ID for each billable task.
- clientRequestId prevents duplicate submit and retry double-charge.
- providerTaskId stores the external execution job ID.
- ledgerEntryId identifies each immutable ledger movement.

Keep user UI simple:
- show taskId, task name, status, started time, finished time, usage seconds, credits consumed, balance after, and support action.
- do not show provider internals by default.

Keep admin UI complete:
- show taskId, projectId, device/account ID, providerTaskId, ledgerEntryId, usage, cost source, reconciliation result, and anomaly level.
- show full long IDs.

Build reconciliation as read-only first:
- compare task record, ledger entries, and provider usage.
- return ok/warn/error with clear reasons.
- never auto-debit, auto-refund, auto-delete, or auto-overwrite ledger rows.

After implementation:
- run tests for duplicate submit, missing ledger, duplicate debit, failed task with debit, provider usage mismatch, and readonly reconciliation.
- report any deferred cleanup as technical debt with reason, risk, cleanup trigger, and blocking status.
```

## Suggested Implementation Order

1. Add ID generation helpers from `src/id.js`.
2. Add task, provider job, and ledger tables using `docs/database-schema.sql`.
3. Add submit idempotency with `clientRequestId`.
4. Write task records before calling the provider.
5. Store provider job bindings after provider submission.
6. Write immutable ledger entries when usage is billable.
7. Add read-only reconciliation using `src/reconcile.js`.
8. Add admin-only provider recheck if the provider supports usage query.
9. Add tests before release.

## Review Checklist

- Product task IDs and provider task IDs are not mixed.
- Ledger entries are append-only.
- Retry does not create duplicate provider jobs or duplicate debits.
- Failed tasks with billable provider usage are handled explicitly.
- Reconciliation never changes balance automatically.
- Admin views show complete IDs.
- User views stay provider-neutral.
