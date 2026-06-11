# Contributing

Thank you for contributing.

## Development

```bash
npm test
npm run lint:forbidden
```

## Pull Request Checklist

- Add or update tests for behavior changes.
- Keep the package provider-neutral.
- Do not add secrets, private endpoints, private credentials, or product-specific names.
- Do not add automatic balance mutation to reconciliation functions.
- Document any intentional limitation in the pull request.

## Code Style

- Prefer small pure functions.
- Keep ledger logic append-only.
- Make mismatch reasons explicit and machine-readable.
- Avoid hidden compatibility shortcuts in billing-related code.
