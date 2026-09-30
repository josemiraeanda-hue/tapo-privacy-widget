# JM Beloura — AI Portable Project Context

Updated: 2026-09-30
Purpose: portable context for ChatGPT and complementary AI systems.

## 1. Mandatory operating rule
Before asking José to create, connect, reconnect or configure GitHub, Render, Auto.dev, APIs, accounts or infrastructure, check the existing JM project resources first.

Do not recreate existing infrastructure.

For relevant JM Beloura automotive/workshop research:
1. Consult JM API Vault / knowledge base first.
2. Use Notion as the structured human/project knowledge layer.
3. Then perform live web/official-source research when freshness or verification is required.
4. Cross-check and distinguish confirmed, candidate, limited and unverified sources.
5. Preserve useful new findings back into the appropriate knowledge store.

Work autonomously: execute, verify, correct and continue. Ask only when a genuinely non-determinable decision is required.

## 2. Existing infrastructure — DO NOT RECREATE
- JM API Vault: https://jm-api-vault.onrender.com
- Render service: jm-api-vault
- Render dashboard: https://dashboard.render.com/web/srv-dau4vamk1f9s73acgna0
- GitHub repository: https://github.com/josemiraeanda-hue/tapo-privacy-widget
- Vault code: api-vault/
- Knowledge base: api-vault/knowledge.json
- Auto deploy: GitHub main -> Render
- Secrets: VAULT_TOKEN and AUTO_DEV_API_KEY exist as Render environment variables. Never expose or copy their values.

## 3. Existing JM Vault capabilities
Protected API endpoints:
- GET /health — public, returns only {"status":"ok"}
- GET / — protected service/capability summary
- GET /knowledge/search?q=...&limit=...
- GET /knowledge/categories
- GET /knowledge/item/:id
- GET /auto/vin/:vin

Authentication for protected endpoints:
Authorization: Bearer <VAULT_TOKEN>

Auto.dev key is server-side only. Never place credentials in GitHub, Notion, prompts or this file.

## 4. Existing confirmed / relevant APIs and sources
Already recorded in JM Vault:
- Auto.dev VIN Decode — VIN decoding gateway
- OfficeGest API v2 — workshop/back-office integration target
- TelePeças API — Portuguese parts/vehicle integration source
- Autodata Developer — commercial technical data
- TecAlliance / TecDoc ecosystem
- HaynesPro WorkshopData
- TecCom supplier integration candidate
- Portuguese domains/sources: IMT/IPO, IRN/Registo Automóvel, AT/IUC, ASF/Tem Seguro, ENSE fuel prices, IPMA
- Vehicle history candidates: carVertical, autoDNA, CARFAX Europe
- Multiple VIN/vehicle/parts/fitment candidates are already catalogued in knowledge.json.

## 5. JM Beloura workshop target architecture
Preferred flow:
MATRÍCULA -> VIN -> exact vehicle/version/engine -> technical data -> maintenance -> DTC -> TecDoc/parts -> OE/equivalents -> suppliers -> stock -> price -> individual margin -> quote -> OfficeGest -> repair order -> history -> alerts.

Supplier ecosystem already known:
- Autozitania
- Create / Drive360
- AleCarPecas
- Auto Delta (through AleCarPecas)
- MCoutinho

Do not ask the user to create these integrations from zero if the existing project context already contains them.

## 6. How to invoke JM knowledge
Natural language is enough. Preferred interpretations:
- "Procura uma API para X" -> consult JM Vault first.
- "JM Vault: X" -> force Vault-first research.
- "JM Vault + web: X" -> Vault + current web/official verification.
- "Valida X no JM Vault" -> compare against stored knowledge and identify stale/uncertain entries.
- "Guarda isto no JM Vault" -> add/update the canonical knowledge base.
- "Guarda isto no Notion" -> capture structured project knowledge/decision/documentation in Notion.
- "Integra isto no JM Vault" -> assess endpoint/auth/schema and fit with the existing gateway.
- "Pesquisa isto a fundo" -> Vault + primary/official sources + alternatives + coverage + cost + integration feasibility.
The user should not need to use special syntax; the AI should infer JM context from the subject.

## 7. Storage model
JM API Vault / knowledge.json:
- canonical machine-readable technical/API/source registry
- endpoints, source status, coverage, integration notes and verification state
- no secrets

Notion:
- human-readable architecture, decisions, procedures, research briefs, integration notes and project history
- links back to JM Vault/GitHub where useful
- no secrets

Portable context:
- this file is the handoff/reference block for other AI systems
- keep it synchronized when architecture or important resources change

## 8. Status meanings
- confirmed = verified/established in the JM project
- workshop-priority = directly relevant to JM Beloura suppliers/workflow
- commercial = known commercial ecosystem/source; exact access/package may still need validation
- candidate = possible source; verify before production
- limited = known limitation or geographic/product limitation
- unverified = do not rely on it without fresh verification

## 9. Critical continuity rule
The existence of this context means future AI sessions must first inspect/reuse the established JM resources instead of repeatedly asking José to:
- create GitHub
- create another repository
- create Auto.dev
- create another Render service
- recreate the JM API Vault
- reconnect existing infrastructure without checking its state

If a resource appears unavailable, first distinguish:
1. not connected to the current AI,
2. temporarily inaccessible,
3. actually absent/deleted.
Do not assume it was never created.

## 10. Security
Never include:
- VAULT_TOKEN value
- AUTO_DEV_API_KEY value
- any supplier credentials
- passwords
- private API keys
- private access tokens

The JM Vault architecture deliberately keeps secrets server-side in Render environment variables.
