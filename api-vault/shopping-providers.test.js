"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { searchProducts, getCoupons } = require("./shopping-providers");

function fakeResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, async json() { return body; } };
}

test("product search rejects a missing query", async () => {
  await assert.rejects(
    searchProducts({ q: "", apiKey: "test-key", fetchImpl: async () => fakeResponse(200, {}) }),
    (err) => err.statusCode === 400
  );
});

test("product search fails clearly when provider key is absent", async () => {
  await assert.rejects(
    searchProducts({ q: "6Q0423155AA", apiKey: "", fetchImpl: async () => fakeResponse(200, {}) }),
    (err) => err.statusCode === 503 && /SERPAPI_API_KEY/.test(err.message)
  );
});

test("product search normalizes a result and does not invent shipping cost", async () => {
  const result = await searchProducts({
    q: "6Q0423155AA",
    apiKey: "test-key",
    fetchImpl: async (url) => {
      const parsed = new URL(url);
      assert.equal(parsed.searchParams.get("gl"), "pt");
      assert.equal(parsed.searchParams.get("q"), "6Q0423155AA");
      return fakeResponse(200, { shopping_results: [{
        title: "Power steering pump",
        price: "€49.90",
        extracted_price: 49.9,
        currency: "EUR",
        source: "Example Seller",
        product_link: "https://example.test/item"
      }] });
    }
  });
  assert.equal(result.count, 1);
  assert.equal(result.results[0].price_value, 49.9);
  assert.equal(result.results[0].total_delivered_price, null);
  assert.equal(result.results[0].delivery_price_status, "not_verified");
});

test("product search surfaces provider failures without leaking credentials", async () => {
  await assert.rejects(
    searchProducts({
      q: "test-part",
      apiKey: "never-print-this",
      fetchImpl: async () => fakeResponse(401, { error: "invalid api key" })
    }),
    (err) => err.statusCode === undefined && !err.message.includes("never-print-this")
  );
});

test("coupon search requires configured Awin credentials", async () => {
  await assert.rejects(
    getCoupons({ publisherId: "", token: "", fetchImpl: async () => fakeResponse(200, []) }),
    (err) => err.statusCode === 503
  );
});

test("coupon feed marks offers as unverified until checkout", async () => {
  const result = await getCoupons({
    q: "example",
    country: "PT",
    publisherId: "12345",
    token: "test-token",
    fetchImpl: async (url, options) => {
      assert.equal(new URL(url).pathname, "/publisher/12345/promotions");
      assert.equal(options.method, "POST");
      return fakeResponse(200, [{
        promotionId: 1,
        type: "voucher",
        advertiser: { name: "Example Store" },
        title: "Example 10% voucher",
        voucher: { code: "TEST10" },
        regions: { list: [{ countryCode: "PT" }] },
        url: "https://example.test/promo"
      }]);
    }
  });
  assert.equal(result.count, 1);
  assert.equal(result.results[0].code, "TEST10");
  assert.equal(result.results[0].validation_status, "not_tested_at_checkout");
});
