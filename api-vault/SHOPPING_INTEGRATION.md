# Shopping and coupon provider integration (draft)

This integration is intentionally isolated on branch \`feat/shopping-coupons-providers\`. It is not deployed and does not change Render production.

## Required environment variables

Configure these only in a dedicated test/staging service after reviewing this draft. Do not commit credentials or reuse the shared \`VAULT_TOKEN\` as a provider key.

- \`SERPAPI_API_KEY\`: SerpApi key for Google Shopping results.
- \`AWIN_PUBLISHER_ID\`: numeric Awin publisher ID.
- \`AWIN_API_TOKEN\`: Awin user-level API token.

The endpoints already sit behind the existing Vault Bearer-token middleware. The provider credentials are read only from environment variables.

## Endpoints

### Provider configuration status

`GET /shopping/status` reports only whether the required environment variables are present; it never returns their values. Use it on staging before attempting provider requests.

### Product search

\`GET /shopping/products?q=óleo%205W30&location=Lisbon%2C%20Portugal&maxPrice=40&sortBy=1\`

- Defaults to Lisbon, Portugal, Google country \`pt\`, language \`pt-PT\`, EUR.
- \`maxPrice\` is optional and must be non-negative.
- \`sortBy=1\` sorts price ascending; \`sortBy=2\` sorts descending.
- Responses are cached in memory for five minutes.
- The result's \`total_delivered_price\` is deliberately null and \`delivery_price_status\` is \`not_verified\`: a product-listing snippet is not proof of final checkout cost.

### Coupon candidates

\`GET /shopping/coupons?q=óleo&country=PT&type=all\`

- Uses Awin's publisher promotions API with active offers filtered by country.
- \`type\` accepts \`all\`, \`voucher\`, or \`promotion\`.
- Responses are cached in memory for fifteen minutes.
- Every item is marked \`validation_status=not_tested_at_checkout\`. Awin feed presence does not prove that a code applies to a specific cart.

## Safe activation plan

1. Run \`npm test\` in the API directory.
2. Configure provider credentials only in an isolated staging service (never on production until tests and access controls are reviewed).
3. Test one product query and one coupon query; confirm results, quota usage, and that no secrets appear in logs or responses.
4. Test discount codes in a retailer checkout without placing an order.
5. Merge/deploy only after reviewing test evidence and explicitly approving the production change.

No checkout is submitted, no order is placed, and no paid API account is created by this code.
