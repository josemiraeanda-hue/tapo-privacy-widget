"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { compareShoppingSources } = require("../shopping-compare");

test("compares both providers and returns explicit provider status", async () => {
  const result = await compareShoppingSources({
    q: "6Q0423155AA",
    searchGoogle: async ({ q }) => ({ results: [{ title: "Google result", price_value: 80, currency: "EUR", shipping_status: "unknown" }] }),
    searchTelepecas: async ({ q }) => ({ results: [{ title: "TelePeças result", price_value: 60, currency: "EUR", shipping_status: "unknown" }] })
  });
  assert.equal(result.count, 2);
  assert.equal(result.providers.google_shopping.status, "ok");
  assert.equal(result.providers.telepecas.status, "ok");
  assert.equal(result.results[0].provider, "telepecas");
  assert.match(result.ranking_note, /not a cheapest-delivered claim/);
});

test("keeps partial results if one provider is not configured", async () => {
  const result = await compareShoppingSources({
    q: "alternator",
    searchGoogle: async () => ({ results: [{ title: "Google result", price_value: 100, currency: "EUR" }] }),
    searchTelepecas: async () => { const e = new Error("missing token"); e.statusCode = 503; throw e; }
  });
  assert.equal(result.count, 1);
  assert.equal(result.providers.telepecas.status, "not_configured_or_not_authorized");
});

test("fails clearly when no provider is configured", async () => {
  await assert.rejects(compareShoppingSources({
    q: "part",
    searchGoogle: async () => { const e = new Error("no key"); e.statusCode = 503; throw e; },
    searchTelepecas: async () => { const e = new Error("no token"); e.statusCode = 503; throw e; }
  }), e => e.statusCode === 503 && e.providers.google_shopping.status === "not_configured_or_not_authorized");
});

test("requires a query", async () => {
  await assert.rejects(compareShoppingSources({
    q: "",
    searchGoogle: async () => ({ results: [] }),
    searchTelepecas: async () => ({ results: [] })
  }), e => e.statusCode === 400);
});
