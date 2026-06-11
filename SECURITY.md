# Security Policy

## Reporting

Please report security issues privately to the repository owner.

Do not open a public issue for vulnerabilities that expose billing, account, ledger, or provider credentials.

## Scope

Security-sensitive areas include:

- Credit ledger mutation.
- Idempotency and duplicate submit handling.
- Provider usage import.
- Admin-only reconciliation views.
- Any code path that changes user balances.

## Safe Defaults

This package does not store secrets and does not call any real provider API by default.

Reconciliation functions are read-only.
