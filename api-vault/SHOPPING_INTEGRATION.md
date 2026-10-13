# Shopping and coupon provider integration

This integration is merged into `main` and deployed to the JM API Vault. Provider routes remain protected by the existing Vault Bearer-token middleware.

## Required environment variables

Set provider credentials only in the Render service's environment settings. Never commit credentials or expose them in URLs, logs, responses, or chat.

- `SERPAPI_API_KEY`: SerpApi key for Google Shopping results.
- `AWIN_PUBLISHER_ID`: numeric Awin publisher ID.
- `AWIN_API_TOKEN`: Awin publisher API token.

## Endpoints

### Provider configuration status

`GET /shopping/status` reports only whether required environment variables are present; it never returns their values.

### Product search

`GET /shopping/products?q=óleo%205W30&location=Lisbon%2C%20Portugal&maxPrice=40&sortBy=1`

- Defaults to Lisbon, Portugal, Google country `pt`, language `pt-PT`, and EUR.
- `maxPrice` is optional and must be non-negative.
- `sortBy=1` requests ascending price; `sortBy=2` requests descending price.
- Results are cached in memory for five minutes.
- Product links accept SerpApi's `link`, `product_link`, and `direct_link` fields.
- `total_delivered_price` remains null and `delivery_price_status` is `not_verified`; a listing snippet does not prove final checkout cost.

### Coupon candidates

`GET /shopping/coupons?q=óleo&country=PT&type=all`

- Uses Awin's publisher promotions API, filtering active offers by country.
- `type` accepts `all`, `voucher`, or `promotion`.
- Results are cached in memory for fifteen minutes.
- Each item is marked `validation_status=not_tested_at_checkout`. Awin feed presence does not prove a code applies to a specific cart.
- Coupon retrieval returns HTTP 503 until both Awin environment variables are configured with valid credentials.

## Verification and limitations

- The production deployment for commit `cdb9b4fac58cebbb3b9d3500880034bf983e92ba` is live and `/health` returns `{"status":"ok"}`.
- Staging tests confirmed SerpApi returned results for a part-number query and generic product query after link normalization was fixed.
- Offline provider tests use mocked fetch responses and do not spend API quota.
- Authenticated production endpoint testing and real Awin coupon retrieval still require valid service credentials. Do not expose or paste secrets into chat.
- No checkout is submitted, no order is placed, and no paid account is created by this code.

## Awin API reference

The implementation follows Awin's publisher `POST /publisher/{publisherId}/promotions` schema: https://help.awin.com/apidocs/promotions
