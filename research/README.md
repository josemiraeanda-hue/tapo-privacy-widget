# JM Vault — Research and Automotive Integrations

Updated: 2026-10-17

## Structure
- `api-vault/knowledge.json`: searchable knowledge entries used by the protected API.
- `research/catalog/sources.json`: central, tagged index of sources and integration leads.
- `research/runs/`: dated audit logs and research results.
- Keep source discovery in one catalog. Use tags, not separate topic silos.
- Never store secret values, tokens, passwords, personal data, or private channel content here.

## Evidence statuses
- `confirmed`: verified from authoritative source or working service, with scope stated.
- `commercial` / `commercial-candidate`: licensing or account access likely required.
- `candidate`: research lead; not yet verified operationally.
- `limited`: useful only for specified geography/scope.
- `policy-scoped`: permitted research scope with explicit boundaries.

## Vehicle lookup
Portugal registration-to-VIN must be treated separately from VIN decoding. Auto.dev VIN decode does not itself provide Portuguese plate-to-VIN. Verify plate coverage, price, quota, terms, latency, and returned fields before production. After VIN resolution, use exact version/engine identification and parts-catalogue links; do not claim fitment based on model name alone.

## Parts comparison
Store each offer with source URL, OEM/aftermarket reference, fitment evidence, stock evidence, timestamp, currency, net/gross price, delivery destination, shipping status, VAT/customs, estimated delivery, coupon status, and total delivered cost. Use explicit statuses:
- `verified`: provider/checkout evidence captured.
- `estimated`: calculated from explicit assumptions.
- `unknown`: not supplied or not checked.
A discovered voucher is not validated until checkout confirms its applicability. Do not claim a landed price if shipping, VAT or customs are unknown.

## Security and legal boundaries
- API secrets remain in Render environment variables or a secret manager.
- Do not expose or log tokens.
- Use public sources and authorized accounts only.
- Adult-content research is limited to legal content involving consenting adults. Do not deliberately search for, collect, store, or link to sexual abuse material or content involving minors.
