# JM API Vault audit — 2026-10-17

## Scope
Review deployed Render services, GitHub source, API route design, vehicle-identification candidates, shopping/coupon providers, and free-hosting constraints. Website work intentionally deferred.

## Infrastructure findings (observed)
- GitHub repository: https://github.com/josemiraeanda-hue/tapo-privacy-widget
- Main service: https://jm-api-vault.onrender.com (Render Free, Frankfurt, branch main, auto-deploy on commit).
- Staging service: https://jm-api-vault-shopping-staging.onrender.com (Render Free, Frankfurt, branch feat/shopping-coupons-providers, auto-deploy disabled).
- Main deployment record shows last live deployment on 2026-10-13, commit cdb9b4f ("Enable shopping provider integration"), build/deploy marked successful by Render.
- Staging deployment record shows a successful deploy on 2026-10-13; most recent commit listed is 17bcc27 ("Remove temporary staging diagnostic route after validation").
- First external probe returned HTTP 503 for both public /health URLs; a second fresh probe returned HTTP 200 with {\"status\":\"ok\"} for both services. Current evidence is consistent with Render Free cold-start/sleep behavior, not a persistent application crash. Repeat monitoring is still needed to distinguish intermittent startup from other transient failures.
- Production main currently has /health, token-protected knowledge routes, /auto/vin/:vin, /shopping/status, /shopping/products and /shopping/coupons. The catalog branch now adds a protected /auto/registration/:plate route backed by a separate RegCheck adapter; it is not live in production until merged/deployed.
- /health is outside authentication middleware; other routes require Authorization: Bearer VAULT_TOKEN. Do not expose token to client code.

## Existing provider implementation
- `api-vault/shopping-providers.js` contains SerpApi Google Shopping and Awin Promotions adapters, with short in-memory cache.
- Product result normalizer sets `total_delivered_price: null` and `delivery_price_status: "not_verified"`; it does not currently calculate a complete delivered price.
- Coupon normalizer sets `validation_status: "not_tested_at_checkout"`; the code explicitly treats feed offers as candidates.
- Product search requires `SERPAPI_API_KEY`; coupon feed requires `AWIN_PUBLISHER_ID` and `AWIN_API_TOKEN`. Credential presence and live authenticated responses were not verifiable through the public endpoint during this audit.
- The repository has an offline Node test suite under `api-vault/tests/`. Existing shopping-provider tests pass in CI; a new mocked RegCheck adapter test suite has been added to the catalog branch and must be included in the latest CI run.

## Automotive integration assessment
- Auto.dev integration only decodes a supplied 17-character VIN. It does not solve Portuguese plate-to-VIN.
- Matricula.co.pt / RegCheck official documentation was fetched and confirms a Portugal-specific `CheckPortugal` REST route using Basic Auth. The site states 10 free test credits, then €0.20 per successful lookup with a 100-credit minimum (€20). It returns vehicle identification fields, but VIN is not guaranteed; the new adapter explicitly reports `vin_status` instead of fabricating a VIN. Live authenticated lookup is not yet validated.
- TecAlliance/TecDoc Web Service is the strongest catalogue candidate for vehicle-to-part linkage and OE/cross-reference data, but it is commercial/licensed; access and Portuguese coverage must be confirmed.
- OfficeGest API v2, TelePeças API, Autodata Developer and supplier integrations remain in the knowledge base as candidates/targets; no live authenticated integration has been proven in this audit.
- Priority supplier list: Autozitania, Create/Drive360, AleCarPecas/Auto Delta, MCoutinho. Request/verify official account-level API, EDI, feed or order access before scraping or implementing.

## Cost comparison requirements
Every offer should capture: queried reference and exact fitment, OEM/aftermarket identity, seller, stock proof, source URL, timestamp, currency, item price, VAT treatment, shipping to Portugal, customs/import charges where applicable, coupon eligibility/checkout result, delivery estimate and final delivered total.
If any material component is unknown, do not rank the result as the cheapest verified offer; label it estimated or incomplete.

## Free-hosting decision
- Keep the existing Render Free services while testing because they already exist and the project is small.
- Do not migrate solely on the assumption that another provider is permanently free. Free tiers can sleep, cap hours/egress, remove persistence, or change terms.
- Avoid introducing a database/Redis dependency until a concrete persistence need is established. Current in-memory caches are ephemeral and do not persist across restarts.

## Next validation gates
1. Monitor /health cold starts; both endpoints returned HTTP 200 on a second probe after an initial 503.
2. Test protected routes with a credential held only in the authorized secret store; never print the token.
3. Run the new RegCheck adapter tests in CI alongside the existing shopping provider tests; add protected-route authentication tests.
4. Verify SerpApi/Awin environment configuration using boolean status only; perform real provider requests only if the accounts/quotas allow.
5. Run the documented RegCheck test plate `90-27-QL` with a valid account, record returned fields and whether VIN is present, and validate one real OE reference with TecDoc/supplier evidence.
6. Implement delivered-cost calculations only where shipping/tax evidence is available; otherwise retain unknown status.


## Follow-up verification (2026-10-17)
- Both health endpoints recovered on the second live probe: HTTP 200, JSON `{"status":"ok"}`. Render Free services spin down after idle time and can take about a minute to restart; see https://render.com/docs/free. A single 503 should not be treated as a confirmed outage, but the cold-start delay is a user-facing limitation.
- Existing repository workflow uses `api-vault/tests/*.test.js`; an adapter test suite already exists at `api-vault/tests/shopping-providers.test.js`. CI must be re-run on this clean catalog branch before considering the documentation changes merged.
- This catalog branch is isolated from the existing shopping-provider feature branch to avoid accidentally including unrelated commits in the PR.
- Added `api-vault/vehicle-providers.js` and a protected `/auto/registration/:plate` route in the branch. It uses `REGCHECK_USERNAME` and `REGCHECK_API_KEY`, never returns provider error bodies, and explicitly leaves VIN unknown when absent. This has mocked unit tests; no production credentials were used.
- The catalog and searchable knowledge now contain 100 records, including official RegCheck/Portugal documentation and TecDoc scope. Current PR: https://github.com/josemiraeanda-hue/tapo-privacy-widget/pull/4.
