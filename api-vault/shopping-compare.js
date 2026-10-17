"use strict";

const { compareOffers } = require("./landed-cost");

function fail(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function compareShoppingSources({ q, maxPrice, searchGoogle, searchTelepecas } = {}) {
  const query = String(q ?? "").trim().slice(0, 180);
  if (!query) throw fail(400, "Missing required query parameter: q");
  if (typeof searchGoogle !== "function" || typeof searchTelepecas !== "function") {
    throw fail(500, "Shopping provider functions are required");
  }

  const sources = [
    ["google_shopping", searchGoogle],
    ["telepecas", searchTelepecas]
  ];
  const settled = await Promise.allSettled(sources.map(([, run]) => run({ q: query, maxPrice })));
  const providers = {};
  const offers = [];

  settled.forEach((result, index) => {
    const name = sources[index][0];
    if (result.status === "fulfilled") {
      const value = result.value || {};
      const items = Array.isArray(value.results) ? value.results : [];
      providers[name] = { status: items.length ? "ok" : "empty", count: items.length };
      for (const item of items) offers.push({ ...item, provider: name });
    } else {
      const error = result.reason;
      providers[name] = {
        status: error?.statusCode === 503 ? "not_configured_or_not_authorized" : "error",
        error_code: Number.isInteger(error?.statusCode) ? error.statusCode : 502
      };
    }
  });

  const successes = Object.values(providers).some(p => p.status === "ok" || p.status === "empty");
  if (!successes) {
    const error = fail(503, "No shopping provider returned results; check provider configuration and permissions");
    error.providers = providers;
    throw error;
  }

  return {
    query,
    count: offers.length,
    providers,
    results: compareOffers(offers),
    ranking_note: "Verified delivered totals rank first. Offers with unknown shipping, tax/customs or checkout coupon status remain incomplete; advertised item prices are only a within-currency discovery sort, not a cheapest-delivered claim.",
    delivered_cost_verification: "A total is verified only when all material cost components have explicit evidence."
  };
}

module.exports = { compareShoppingSources };
