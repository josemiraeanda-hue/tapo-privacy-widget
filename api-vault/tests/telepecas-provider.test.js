"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { searchTelepecas } = require("../telepecas-provider");

function response(status, body) {
  return { ok: status >= 200 && status < 300, status, async json() { return body; } };
}

test("TelePeças search requires a query", async () => {
  await assert.rejects(searchTelepecas({ q: "", token: "test" }), e => e.statusCode === 400);
});

test("TelePeças search requires account access token", async () => {
  await assert.rejects(searchTelepecas({ q: "6Q0423155AA", token: "" }), e => e.statusCode === 503 && /TELEPECAS_API_TOKEN/.test(e.message));
});

test("TelePeças search normalizes reference and price, while leaving delivery unverified", async () => {
  const result = await searchTelepecas({
    q: "6Q0423155AA", token: "test-token",
    fetchImpl: async (url, options) => {
      assert.equal(new URL(url).pathname, "/v1/stock/search");
      assert.equal(new URL(url).searchParams.get("q"), "6Q0423155AA");
      assert.equal(options.headers.Authorization, "Bearer test-token");
      return response(200, { total: 2, items: [
        { id: "1", titulo: "Power steering pump", referencia: "6Q0423155AA", preco: 189, estado: "usado" },
        { id: "2", titulo: "Cheaper wrong result", referencia: "OTHER", preco: 20, estado: "usado" }
      ] });
    }
  });
  assert.equal(result.count, 2);
  assert.equal(result.results[0].part_reference, "OTHER");
  assert.equal(result.results[0].price_value, 20);
  assert.equal(result.results[0].shipping_status, "unknown");
  assert.equal(result.results[0].total_delivered_price, null);
  assert.equal(result.results[0].landed_cost.landed_cost_status, "incomplete");
});

test("TelePeças search applies maximum item price", async () => {
  const result = await searchTelepecas({
    q: "alternator", token: "test", maxPrice: "50",
    fetchImpl: async () => response(200, { total: 2, items: [
      { titulo: "Cheap alternator", referencia: "A1", preco: 40 },
      { titulo: "Expensive alternator", referencia: "A2", preco: 80 }
    ] })
  });
  assert.equal(result.count, 1);
  assert.equal(result.results[0].price_value, 40);
});

test("TelePeças errors do not expose provider response bodies", async () => {
  await assert.rejects(searchTelepecas({
    q: "part", token: "secret",
    fetchImpl: async () => response(403, { error: "internal details should not be shown" })
  }), e => e.statusCode === 503 && !e.message.includes("internal details") && !e.message.includes("secret"));
});
