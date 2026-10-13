"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { searchProducts, getCoupons } = require("../shopping-providers");

test("product search refuses to run without a key", async () => {
  await assert.rejects(searchProducts({ q: "engine oil", apiKey: "" }), e => e.statusCode === 503 && /SERPAPI_API_KEY/.test(e.message));
});
test("product search normalizes Portuguese-market results and caps by price", async () => {
  const result = await searchProducts({
    q: "óleo 5W30", apiKey: "test-key", maxPrice: 30,
    fetchImpl: async input => {
      const url = new URL(input);
      assert.equal(url.searchParams.get("gl"), "pt");
      assert.equal(url.searchParams.get("hl"), "pt-PT");
      assert.equal(url.searchParams.get("q"), "óleo 5W30");
      return { ok: true, status: 200, json: async () => ({ shopping_results: [
        { title: "Óleo A", price: "€20,00", extracted_price: 20, source: "Loja A", link: "https://example.com/a" },
        { title: "Óleo B", price: "€40,00", extracted_price: 40, source: "Loja B", link: "https://example.com/b" },
        { title: "Óleo C", price: "Preço indisponível", source: "Loja C", link: "https://example.com/c" }
      ] }) };
    }
  });
  assert.equal(result.count, 1);
  assert.equal(result.results[0].title, "Óleo A");
  assert.equal(result.results[0].total_delivered_price, null);
  assert.equal(result.results[0].delivery_price_status, "not_verified");
});
test("product search accepts SerpApi product_link and direct_link URL fields", async () => {
  const result = await searchProducts({
    q: "6L1858071", apiKey: "test-key",
    fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ shopping_results: [
      { title: "Produto via product_link", product_link: "https://example.com/product", source: "Loja A" },
      { title: "Produto via direct_link", direct_link: "https://example.com/direct", source: "Loja B" },
      { title: "Produto sem URL", source: "Loja C" }
    ] }) })
  });
  assert.equal(result.count, 2);
  assert.deepEqual(result.results.map(item => item.url), [
    "https://example.com/product",
    "https://example.com/direct"
  ]);
});
test("coupon feed marks codes as untested at checkout and filters region", async () => {
  const result = await getCoupons({
    q: "óleo", publisherId: "12345", token: "test-token",
    fetchImpl: async input => {
      const url = new URL(input);
      assert.equal(url.hostname, "api.awin.com");
      assert.equal(url.searchParams.get("accessToken"), "test-token");
      return { ok: true, status: 200, json: async () => [
        { promotionId: 1, type: "voucher", title: "Óleo com desconto", voucher: { code: "TESTE" }, regions: { list: [{ countryCode: "PT" }] } },
        { promotionId: 2, type: "voucher", title: "Oferta UK", voucher: { code: "UK" }, regions: { list: [{ countryCode: "GB" }] } }
      ] };
    }
  });
  assert.equal(result.count, 1);
  assert.equal(result.results[0].code, "TESTE");
  assert.equal(result.results[0].validation_status, "not_tested_at_checkout");
});
test("coupon feed fails clearly when Awin credentials are missing", async () => {
  await assert.rejects(getCoupons({ q: "telemóvel", publisherId: "", token: "" }),
    e => e.statusCode === 503 && /AWIN_PUBLISHER_ID/.test(e.message));
});
test("provider errors are surfaced without exposing the request URL", async () => {
  await assert.rejects(searchProducts({
    q: "filter", apiKey: "secret-test",
    fetchImpl: async () => ({ ok: false, status: 401, json: async () => ({ error: "Invalid API key" }) })
  }), /SerpApi request failed: Invalid API key/);
});
