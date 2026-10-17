"use strict";

const { calculateLandedCost } = require("./landed-cost");

function fail(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function searchTelepecas({
  q,
  token = process.env.TELEPECAS_API_TOKEN,
  fetchImpl = globalThis.fetch,
  maxPrice
} = {}) {
  const query = String(q ?? "").trim().slice(0, 180);
  if (!query) throw fail(400, "Missing required query parameter: q");
  if (!token) throw fail(503, "TelePeças API is not configured: TELEPECAS_API_TOKEN is required");
  if (typeof fetchImpl !== "function") throw fail(500, "This Node.js runtime does not provide fetch");
  if (maxPrice !== undefined && maxPrice !== "" && (!Number.isFinite(Number(maxPrice)) || Number(maxPrice) < 0)) {
    throw fail(400, "maxPrice must be a non-negative number");
  }

  const url = new URL("https://api.telepecas.com/v1/stock/search");
  url.searchParams.set("q", query);
  let response;
  try {
    response = await fetchImpl(url.toString(), {
      method: "GET",
      headers: { Authorization: "Bearer " + token, Accept: "application/json" },
      signal: AbortSignal.timeout(15000)
    });
  } catch {
    throw fail(502, "TelePeças API request failed");
  }

  let body;
  try { body = await response.json(); }
  catch { throw fail(502, "TelePeças API returned an invalid JSON response"); }
  if (!response.ok) {
    const status = response.status === 401 || response.status === 403 ? 503 : 502;
    throw fail(status, response.status === 401 || response.status === 403 ? "TelePeças API rejected the configured credentials or permissions" : "TelePeças API request failed with HTTP " + response.status);
  }

  const items = Array.isArray(body?.items) ? body.items : [];
  const limitPrice = maxPrice === undefined || maxPrice === "" ? null : Number(maxPrice);
  const results = items.map(item => {
    const price = item?.preco !== null && item?.preco !== undefined && item?.preco !== "" && Number.isFinite(Number(item.preco)) ? Number(item.preco) : null;
    const normalized = {
      title: String(item?.titulo || item?.title || "").trim(),
      part_reference: String(item?.referencia || item?.reference || "").trim() || null,
      price_value: price,
      currency: "EUR",
      seller: String(item?.vendedor || item?.seller || "").trim() || null,
      condition: String(item?.estado || item?.condition || "").trim() || null,
      url: String(item?.url || item?.link || "").trim() || null,
      source: "telepecas",
      price_checked_at: new Date().toISOString(),
      shipping_cost_eur: null,
      shipping_status: "unknown",
      taxes_eur: null,
      tax_status: "unknown",
      customs_eur: null,
      customs_status: "unknown",
      coupon_discount_eur: null,
      coupon_status: "not_checked",
      total_delivered_price: null,
      delivery_price_status: "not_verified"
    };
    normalized.landed_cost = calculateLandedCost({ price_value: price, currency: "EUR" });
    return normalized;
  }).filter(item => item.title && item.part_reference)
    .filter(item => limitPrice === null || (item.price_value !== null && item.price_value <= limitPrice))
    .sort((a, b) => (a.price_value ?? Number.POSITIVE_INFINITY) - (b.price_value ?? Number.POSITIVE_INFINITY))
    .slice(0, 100);

  return {
    provider: "telepecas_stock_search",
    query,
    count: results.length,
    total_reported: Number.isFinite(Number(body?.total)) ? Number(body.total) : null,
    cached: false,
    results,
    note: "TelePeças API result prices are discovery data; shipping, tax treatment, seller permissions and final delivered cost must be verified separately."
  };
}

module.exports = { searchTelepecas };
