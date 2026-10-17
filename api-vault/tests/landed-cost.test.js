"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateLandedCost, compareOffers } = require("../landed-cost");

test("calculates total only when shipping, tax, customs and coupon states are explicit", () => {
  const result = calculateLandedCost({
    item_price_eur: 100,
    shipping_status: "verified", shipping_eur: 5,
    tax_status: "verified", taxes_eur: 23,
    customs_status: "not_applicable",
    coupon_status: "verified", coupon_discount_eur: 10
  });
  assert.equal(result.landed_cost_status, "verified");
  assert.equal(result.total_delivered_price_eur, 118);
  assert.deepEqual(result.missing_components, []);
});

test("keeps total unknown if shipping or tax treatment is unknown", () => {
  const result = calculateLandedCost({ price_value: 49.9, currency: "EUR" });
  assert.equal(result.landed_cost_status, "incomplete");
  assert.equal(result.total_delivered_price_eur, null);
  assert.ok(result.missing_components.includes("shipping_to_portugal"));
  assert.ok(result.missing_components.includes("vat_tax_treatment"));
});

test("converts non-EUR item price only with a verified exchange rate", () => {
  const result = calculateLandedCost({
    price_value: 100, currency: "GBP", fx_rate_to_eur: 1.17, fx_status: "verified",
    shipping_status: "free_verified", tax_status: "included",
    customs_status: "not_applicable", coupon_status: "none"
  });
  assert.equal(result.total_delivered_price_eur, 117);
  assert.equal(result.landed_cost_status, "verified");
});

test("does not accept a coupon discount larger than known total cost", () => {
  const result = calculateLandedCost({
    item_price_eur: 20, shipping_status: "free_verified",
    tax_status: "included", customs_status: "not_applicable",
    coupon_status: "verified", coupon_discount_eur: 25
  });
  assert.equal(result.total_delivered_price_eur, null);
  assert.equal(result.landed_cost_status, "incomplete");
  assert.ok(result.missing_components.includes("coupon_discount_exceeds_known_cost"));
});

test("ranks verified delivered totals before unverified advertised prices", () => {
  const offers = compareOffers([
    { seller: "Unknown shipping", price_value: 10, currency: "EUR" },
    { seller: "Verified delivered", item_price_eur: 20, shipping_status: "free_verified", tax_status: "included", customs_status: "not_applicable", coupon_status: "none" }
  ]);
  assert.equal(offers[0].seller, "Verified delivered");
  assert.equal(offers[0].landed_cost.total_delivered_price_eur, 20);
  assert.equal(offers[1].landed_cost.landed_cost_status, "incomplete");
});

test("does not rank incomplete offers across different currencies", () => {
  const offers = compareOffers([
    { seller: "GBP offer", price_value: 20, currency: "GBP" },
    { seller: "EUR offer", price_value: 25, currency: "EUR" }
  ]);
  assert.equal(offers[0].seller, "GBP offer");
  assert.equal(offers[1].seller, "EUR offer");
});
