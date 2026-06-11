# Integration Guide

## Step 1: Add Product-Owned IDs

Every billable action should create:

- `taskId` for the product task.
- `clientRequestId` for retry safety.

Never use a provider job ID as `taskId`.

## Step 2: Store Task Before Provider Submit

Before calling an external compute provider, insert a task row with status `pending` or `submitting`.

This makes timeout and broken-client recovery possible.

## Step 3: Bind Provider Job After Submit

After the provider returns a job ID, insert a `provider_jobs` row:

```text
taskId -> providerTaskId
```

If the same `clientRequestId` is submitted again, return the existing task and provider job instead of creating a new provider job.

## Step 4: Write Immutable Ledger Entries

When provider usage becomes billable, write a ledger entry.

Do not edit old ledger rows to fix mistakes. Add a refund or adjustment entry.

## Step 5: Reconcile Read-Only

Run reconciliation as a read-only check:

- Does a successful billable task have a debit ledger entry?
- Does a failed non-billable task have a debit entry?
- Are there duplicate debits for the same task?
- Does provider usage match saved usage?
- Does recalculated expected credit usage match the ledger?

## Step 6: Admin Review

Expose reconciliation results in an admin-only view.

Recommended fields:

- taskId
- projectId
- accountId
- taskType
- task status
- providerTaskId
- ledgerEntryId
- gpuSeconds
- creditsConsumed
- balanceAfter
- reconciliation level
- reconciliation message

## Step 7: User View

Keep user-facing records simple:

- taskId
- started time
- finished time
- task name
- task status
- usage seconds
- credits consumed
- balance after
- support action

Do not expose provider internals by default.
