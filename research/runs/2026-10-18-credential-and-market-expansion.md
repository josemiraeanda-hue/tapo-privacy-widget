# JM Vault audit — credential scope and exhaustive research expansion
Date: 2026-10-18
Repository: https://github.com/josemiraeanda-hue/tapo-privacy-widget
Production service: https://jm-api-vault.onrender.com/health

## Scope completed in this run
- Recovered the earlier JM API/automotive integration checklist from conversation context and expanded it into a version-controlled master prompt.
- Added a consolidated credential/access matrix, separating variables currently used by main-branch code from candidate variables that must not be created until an adapter and provider contract are confirmed.
- Expanded the central source catalog from 108 to 140 records; indexed the master prompt and credential matrix.
- Expanded searchable JM Vault knowledge to 117 entries.
- Added official documentation candidates for OfficeGest API v1/v2, TelePeças, RegCheck, CarsXE, CarAPI.app, TecAlliance/TecDoc/TecCom, Autodata, VDIM, YMMFit, eBay Browse API, FAPI, vehicle history, NHTSA/vPIC, public Portugal compliance sources and optional AI APIs.
- Existing Render production deploy was manually triggered by the user and screenshot showed a successful build and live service. Current research/catalog changes after that deploy may require a subsequent automatic or manual deploy; check Render's latest commit before assuming they're published in runtime knowledge.

## Current code-backed environment variable inventory
Confirmed by inspecting `api-vault/server.js`, `api-vault/vehicle-providers.js` and `api-vault/shopping-providers.js`:
- `VAULT_TOKEN`: private-route gate; do not replace if already working.
- `AUTO_DEV_API_KEY`: VIN decoder.
- `REGCHECK_USERNAME` and `REGCHECK_API_KEY`: Portuguese plate lookup.
- `TELEPECAS_API_TOKEN`: TelePeças adapter.
- `SERPAPI_API_KEY`: Google Shopping discovery.
- `AWIN_PUBLISHER_ID` and `AWIN_API_TOKEN`: Awin affiliate/coupon integration.
- `PORT`: normally supplied by Render.
Do not print values, prefixes, lengths or hashes. Test only boolean configured status and authorized real calls.

## Verified official documentation and material findings
- OfficeGest official API hub: https://api.officegest.com/docs
  - v2 docs: https://api.officegest.com/docs/officegest-api/v2 — REST API, Bearer token, marked experimental.
  - v1 docs: https://api.officegest.com/docs/officegest-api/v1 — original API uses HTTP Basic.
  - WebServices module: https://officegest.pt/webservices/ — official page describes REST, stock/documents/accounting and webhooks; module access must be confirmed.
- TelePeças official API docs: https://api.telepecas.com/docs/ — REST and prior OAuth2 authorization; sandbox recommended. Live token and account permissions remain unverified.
- RegCheck/Matricula.co.pt Portugal docs: https://www.matricula.co.pt/data/api-docs.aspx/portugal — Portugal-specific endpoint. Previously documented 10 free test credits, then €0.20 per successful query with a 100-credit minimum; VIN is not guaranteed.
- CarsXE official docs: https://docs.carsxe.com/docs/get-started and https://docs.carsxe.com/api-reference/plate-decoder/license-plate-decoder-v2 — plate decoder claimed for 60+ countries, but response fields vary by country; Portuguese plate/VIN must be tested.
- CarAPI.app plate pricing: https://carapi.app/pricing/license-plate/ — packages published at $4/10, $35/100, $150/500 and $250/1,000 lookups. Portugal support must be confirmed against its country list before payment.
- TecAlliance/TecDoc: https://www.tecalliance.net/tecdoc/ — key commercial candidate for vehicle-to-parts and OE references; licence/coverage required.
- Autodata API docs: https://developer.autodata-group.com/io-docs — API key and integration contact required. Retail plan does not prove API entitlement.
- VDIM docs: https://tire.vdim.app/api/docs — free tier documents 250 fitment lookups/month plus one-time 250 bonus from September 2026; separate quotas and fair-use terms apply.
- YMMFit: https://ymmfit.com/fitment-api — public sandbox and limited free fitment; full catalog advertised from €149, useful for audio/retrofit not mechanical parts.
- eBay Browse API: https://developer.ebay.com/api-docs/buy/browse/overview.html — application token required; compatibility support varies by marketplace/category.
- FAPI catalog schema: https://github.com/fapi-dev/catalog-openapi — documents VIN/vehicle catalog, aftermarket products, OE references and analogs; account/trial and data rights require validation.
- carVertical business API: https://www.carvertical.com/en/business/api — tailored B2B API; price and Portugal coverage require quote.
- NHTSA vPIC: https://vpic.nhtsa.dot.gov/api/ — public/free supplemental VIN source, primarily US data and not definitive for European trims.
- OpenAI API docs: https://platform.openai.com/docs/ — separate API billing; not included in ChatGPT subscription.
- Gemini API docs: https://ai.google.dev/gemini-api/docs — free tier may be limited and terms/quotas must be checked.
- xAI API docs: https://docs.x.ai/ — optional usage-billed model service.

## Credential priorities
1. Keep and confirm existing `VAULT_TOKEN`; never expose it.
2. Confirm `REGCHECK_USERNAME` + `REGCHECK_API_KEY` for real Portuguese plate testing.
3. Confirm `TELEPECAS_API_TOKEN` and the actual permitted stock-search endpoint.
4. Confirm `SERPAPI_API_KEY` quota and `AUTO_DEV_API_KEY` account access.
5. Confirm Awin only if the affiliate account is approved and useful.
6. Request OfficeGest API entitlement and TecDoc pricing/coverage before implementing deeper workshop/parts integrations.
7. Evaluate VDIM/YMMFit free limits for tyre and retrofit tasks.
8. Treat all other variables in the matrix as proposed only, not existing configuration.

## Not yet complete / no false claims
- No authenticated live API calls to RegCheck, TelePeças, SerpApi, Auto.dev or OfficeGest were performed in this run.
- No real Portuguese plate result or live vehicle-part compatibility has been validated here.
- No retailer checkout has been performed; coupons, shipping, VAT/customs and final delivered prices are not yet proven.
- No paid plan or credit pack was purchased.
- Some previously listed providers (VehicleDB, VINWhere, DB.VIN, VINAPI, OneAutoAPI, RevCarData, LicensePlateData, AutoPartsAPI/APIProfile, Parts Resolve, CarScan, AutoWiz and others) remain leads whose official identity, docs, current operation, Portugal coverage or pricing still need deeper verification. Do not mark them confirmed from name alone.

## Next exact actions
1. Check Render latest deployment commit and whether the catalog/knowledge updates are deployed.
2. In Render Environment, confirm only presence/absence of current code variables without reading/displaying values.
3. Have the user configure missing provider secrets in Render directly; never ask them to paste secrets in chat.
4. Once credentials exist, perform read-only real calls, capture redacted status/fields/latency/cost, and update each provider status separately.
5. Continue research against the master prompt until each lead is confirmed, rejected with evidence, or marked blocked with a specific reason.
