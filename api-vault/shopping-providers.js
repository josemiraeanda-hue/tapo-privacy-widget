"use strict";

const PRODUCT_CACHE_TTL_MS = 5 * 60 * 1000;
const COUPON_CACHE_TTL_MS = 15 * 60 * 1000;
const cache = new Map();

function cleanText(value, max = 200) {
  return String(value ?? "").trim().slice(0, max);
}
function normalized(value) {
  return cleanText(value, 500).toLocaleLowerCase("pt-PT").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function cacheGet(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (item.expiresAt <= Date.now()) { cache.delete(key); return null; }
  return item.value;
}
function cacheSet(key, value, ttl) {
  cache.set(key, { value, expiresAt: Date.now() + ttl });
  if (cache.size > 100) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
}
async function readJson(response, provider) {
  let body;
  try { body = await response.json(); }
  catch { throw new Error(provider + " returned an invalid JSON response"); }
  if (!response.ok) {
    const message = cleanText(body?.error || body?.message || ("HTTP " + response.status), 180);
    throw new Error(provider + " request failed: " + message);
  }
  return body;
}
function normalizeProduct(item) {
  const price = Number.isFinite(Number(item?.extracted_price)) && item?.extracted_price !== null && item?.extracted_price !== ""
    ? Number(item.extracted_price) : null;
  return {
    title: cleanText(item?.title, 300),
    price: cleanText(item?.price, 80) || null,
    price_value: price,
    currency: cleanText(item?.currency, 8) || "EUR",
    seller: cleanText(item?.source, 120) || null,
    url: cleanText(item?.link, 1500) || null,
    delivery: cleanText(item?.delivery, 200) || null,
    product_id: cleanText(item?.product_id, 100) || null,
    image: cleanText(item?.thumbnail, 1500) || null,
    source: "google_shopping",
    price_checked_at: new Date().toISOString(),
    total_delivered_price: null,
    delivery_price_status: "not_verified"
  };
}
async function searchProducts({ q, location = "Lisbon, Portugal", maxPrice, sortBy = "1", apiKey = process.env.SERPAPI_API_KEY, fetchImpl = globalThis.fetch } = {}) {
  const query = cleanText(q, 180);
  if (!query) { const e = new Error("Missing required query parameter: q"); e.statusCode = 400; throw e; }
  if (!apiKey) { const e = new Error("Product search is not configured: SERPAPI_API_KEY is missing"); e.statusCode = 503; throw e; }
  if (typeof fetchImpl !== "function") { const e = new Error("This Node.js runtime does not provide fetch"); e.statusCode = 500; throw e; }

  const safeLocation = cleanText(location, 120) || "Lisbon, Portugal";
  const safeSort = sortBy === "2" ? "2" : "1";
  const numericMax = maxPrice === undefined || maxPrice === "" ? null : Number(maxPrice);
  if (numericMax !== null && (!Number.isFinite(numericMax) || numericMax < 0)) {
    const e = new Error("maxPrice must be a non-negative number"); e.statusCode = 400; throw e;
  }
  const cacheKey = "products:" + normalized(query) + ":" + safeLocation + ":" + numericMax + ":" + safeSort;
  const cached = cacheGet(cacheKey);
  if (cached) return { ...cached, cached: true };

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_shopping");
  url.searchParams.set("q", query);
  url.searchParams.set("location", safeLocation);
  url.searchParams.set("gl", "pt");
  url.searchParams.set("hl", "pt-PT");
  url.searchParams.set("sort_by", safeSort);
  url.searchParams.set("api_key", apiKey);
  if (numericMax !== null) url.searchParams.set("max_price", String(numericMax));

  const response = await fetchImpl(url.toString(), {
    method: "GET", headers: { Accept: "application/json" }, signal: AbortSignal.timeout(15000)
  });
  const body = await readJson(response, "SerpApi");
  const results = (Array.isArray(body.shopping_results) ? body.shopping_results : [])
    .map(normalizeProduct)
    .filter(item => item.title && item.url)
    .filter(item => numericMax === null || item.price_value === null || item.price_value <= numericMax)
    .slice(0, 40);
  const result = { provider: "serpapi_google_shopping", query, location: safeLocation, country: "PT", currency: "EUR", count: results.length, cached: false, results };
  cacheSet(cacheKey, result, PRODUCT_CACHE_TTL_MS);
  return result;
}
function normalizeCoupon(item) {
  const regions = item?.regions?.all ? ["ALL"] :
    (Array.isArray(item?.regions?.list) ? item.regions.list.map(r => cleanText(r?.countryCode, 2).toUpperCase()).filter(Boolean) : []);
  return {
    id: item?.promotionId ?? null,
    type: cleanText(item?.type, 20) || "promotion",
    advertiser: cleanText(item?.advertiser?.name, 160) || null,
    title: cleanText(item?.title, 300),
    description: cleanText(item?.description, 800) || null,
    terms: cleanText(item?.terms, 800) || null,
    code: cleanText(item?.voucher?.code, 100) || null,
    start_date: item?.startDate ?? null,
    end_date: item?.endDate ?? null,
    regions,
    url: cleanText(item?.url, 1500) || null,
    tracking_url: cleanText(item?.urlTracking, 1500) || null,
    validation_status: "not_tested_at_checkout"
  };
}
async function getCoupons({ q = "", country = "PT", type = "all", publisherId = process.env.AWIN_PUBLISHER_ID, token = process.env.AWIN_API_TOKEN, fetchImpl = globalThis.fetch } = {}) {
  const query = cleanText(q, 180);
  const region = cleanText(country, 2).toUpperCase() || "PT";
  const selectedType = ["all", "voucher", "promotion"].includes(type) ? type : "all";
  if (!publisherId || !/^\d+$/.test(String(publisherId))) {
    const e = new Error("Coupon feed is not configured: AWIN_PUBLISHER_ID is missing or invalid"); e.statusCode = 503; throw e;
  }
  if (!token) { const e = new Error("Coupon feed is not configured: AWIN_API_TOKEN is missing"); e.statusCode = 503; throw e; }
  if (typeof fetchImpl !== "function") { const e = new Error("This Node.js runtime does not provide fetch"); e.statusCode = 500; throw e; }

  const cacheKey = "coupons:" + publisherId + ":" + region + ":" + selectedType + ":" + normalized(query);
  const cached = cacheGet(cacheKey);
  if (cached) return { ...cached, cached: true };

  const url = new URL("https://api.awin.com/publisher/" + encodeURIComponent(publisherId) + "/promotions");
  // Awin's current endpoint schema documents accessToken as a query parameter;
  // the Bearer header is also sent per its authentication guide.
  url.searchParams.set("accessToken", token);
  const response = await fetchImpl(url.toString(), {
    method: "POST",
    headers: { Authorization: "Bearer " + token, Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ filters: { regionCodes: [region], status: "active", type: selectedType, membership: "all" }, pagination: { page: 1, pageSize: 100 } }),
    signal: AbortSignal.timeout(15000)
  });
  const body = await readJson(response, "Awin");
  const offers = Array.isArray(body) ? body :
    (Array.isArray(body?.promotions) ? body.promotions : Array.isArray(body?.offers) ? body.offers : Array.isArray(body?.data) ? body.data : []);
  const needle = normalized(query);
  const results = offers.map(normalizeCoupon)
    .filter(item => !needle || normalized([item.advertiser, item.title, item.description, item.terms].join(" ")).includes(needle))
    .filter(item => item.regions.includes("ALL") || item.regions.includes(region))
    .slice(0, 100);
  const result = {
    provider: "awin_promotions", query, country: region, count: results.length, cached: false, results,
    note: "Coupon-feed entries are candidates only; validity must be confirmed in the retailer checkout."
  };
  cacheSet(cacheKey, result, COUPON_CACHE_TTL_MS);
  return result;
}
module.exports = { searchProducts, getCoupons };
