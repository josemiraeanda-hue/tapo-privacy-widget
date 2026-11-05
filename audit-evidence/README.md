# JM Vault audit — 2026-11-05

Base: `feat/jm-vault-local-database` at `2e6c28894d1b00d0e57a2d53cbda2223bb6c33dc`.
Main observed: `74265843bee40630847fd2e36ffbbe29737b3c56`.
Work isolated on `codex/vault-audit-20261105`. No production or staging deployment,
secret change, merge, or paid provider query was performed.

## Verified

- `live-http.json`: 26 HTTP requests to production/staging. Health: 200 with
  `{"status":"ok"}`. Six protected paths per environment return empty 404 for
  absent and invalid bearer tokens. This does not validate real authentication,
  configured providers, running commit or database connectivity.
- SQLite regenerated from original JSON: 117 knowledge entries, 140 research
  sources. Integrity OK, IDs distinct, full `source_json` round trip equal.
  See `sqlite-validation.json` for source hashes. The generated DB is intentionally
  ignored by Git; it was not recovered from a previous user's local installation.
- Original 27 Node tests passed. Added seven local HTTP tests and three provider
  failure tests. Final result: 37 Node tests and six Python tests passed.
- Provider responses and authentication in tests use synthetic fixtures only.
- Local test runtime: Node v24.22.1; configured CI remains Node 22 (not run here).

## Reproduced and fixed

- SQLite: failed second import previously committed the first; missing collection
  keys erased datasets; null IDs were coerced to text. Four of six new tests failed
  before fixes, all six pass now.
- HTTP: authenticate before JSON parser; generic JSON errors avoid internal stack
  output; reject structured search query; VIN requests get a 15-second timeout
  and uppercase normalization. Four of seven HTTP tests failed before fixes.
- Shopping: transport exceptions and upstream error text could echo credential
  URLs/values. Return controlled errors instead; error-bearing HTTP 200 responses
  no longer become successful empty searches. Three new tests failed before fixes.
- CI installs Express for new HTTP tests and runs SQLite tests.

## Reproduce

```sh
cd api-vault
npm install --ignore-scripts --no-audit --no-fund
npm test
cd ..
python3 -m unittest discover -s tools/local-db -p 'test_*.py'
python3 tools/local-db/create_database.py
```

## Remaining

- API still reads JSON, not SQLite. Authenticated read-only local bridge and
  integration with the user's Windows machine remain unimplemented.
- No safe production credential mechanism was available in this session.
- Render connector requires user-confirmed workspace before service metadata.
- `/health` only confirms the HTTP process. It does not check upstream services.
- Current provider code includes SerpApi, Awin, TelePeças and RegCheck Portugal,
  but account configuration and real contract responses remain unvalidated.
- Official Portugal provider documentation consulted 2026-11-05 lists vehicle
  fields and shows an empty VIN in its sample; no guaranteed plate-to-VIN claim.
  https://www.matricula.co.pt/data/api-docs.aspx/portugal
- Knowledge is a catalogue of sources, not proof all sources are integrated.

## Limitations and review

All fixes are candidates for review and merge; passing isolated tests does not
mean deployed. Imported schema is not a migration framework. Search remains SQL
LIKE/JSON matching, not a dedicated full-text local bridge. Existing provider
success payload forwarding, cache identity, detailed validation and comprehensive
integration tests remain outside this bounded regression correction.
