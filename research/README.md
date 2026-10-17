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


## Implemented in the catalog branch (not yet production)
- Protected route: `GET /auto/registration/:plate`.
- Provider: RegCheck Portugal REST endpoint (`CheckPortugal`).
- Required Render environment variables: `REGCHECK_USERNAME`, `REGCHECK_API_KEY`. Keep these server-side; never put them in frontend code or the catalog.
- The provider is metered: the documentation advertises 10 free test credits and €0.20 per successful lookup after that, with a 100-credit minimum purchase. Do not claim this adapter is permanently free.
- VIN is optional in the returned payload. If absent, the adapter returns `vin_status: "not_returned_by_provider"`; it must not guess a VIN.
- The adapter has mocked unit tests. A real provider call requires valid account credentials and consumes a credit except for the provider's documented test registration.


## Delivered-cost comparison
- Protected endpoint: `POST /shopping/landed-cost`, JSON body `{"offers":[...]}`.
- Supports explicit item price in EUR or a verified FX conversion, shipping to Portugal, VAT/tax treatment, customs/import charges and coupon checkout status.
- Only returns `landed_cost_status: "verified"` and a numeric `total_delivered_price_eur` when every material component has explicit evidence. Unknown shipping/tax/customs/coupon status yields `total_delivered_price_eur: null` and a list of missing components.
- The Google Shopping adapter still cannot infer shipping or final VAT from an advertised item price. It remains a discovery source, not a verified delivered-price source.


## Current integration shortlist (evidence-graded)
1. **TelePeças API — verify account access first.** Official portal describes free APIs, sandbox/production, stock search, OEM compatibility, plate/VIN identification, quotes/orders and webhooks. OAuth2 and seller/integrator permissions apply; confirm which documented endpoint is enabled for your account.
2. **RegCheck / Matricula.co.pt.** Official Portugal-specific CheckPortugal route. 10 free test credits; then €0.20 per successful lookup with a 100-credit minimum. Vehicle data is documented; VIN may be absent.
3. **CarAPI.app.** Official docs list PT and claim plate-to-VIN. Paid credits ($0.40 for 10 down to $0.25 for 1,000); no free Portugal test plate was found in the current docs.
4. **TecAlliance TecDoc.** Strong vehicle-to-part/OE linkage source, commercial licence and coverage confirmation required.
5. **eBay Browse API.** Global marketplace discovery and item compatibility checks; application token and production access required. Treat shipping/fitment as unverified until item data confirms it.
6. **SerpApi Google Shopping.** Broad discovery with a limited free quota, but not proof of delivered cost.

Auto.dev's public Plate-to-VIN page currently says the feature is for US plates and is not included in Free/Growth; do not use it as a Portugal registration decoder.
