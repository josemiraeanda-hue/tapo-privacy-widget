"use strict";

function validAmount(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function calculateLandedCost(offer = {}) {
  const missing = [];
  let item = offer.item_price_eur;
  if (!validAmount(item)) {
    if (offer.currency === "EUR" && validAmount(offer.price_value)) item = offer.price_value;
    else if (validAmount(offer.price_value) && offer.fx_status === "verified" && validAmount(offer.fx_rate_to_eur) && offer.fx_rate_to_eur > 0) item = offer.price_value * offer.fx_rate_to_eur;
    else { item = null; missing.push("item_price_eur_or_verified_fx"); }
  }

  let shipping = 0;
  if (offer.shipping_status === "free_verified") shipping = 0;
  else if (offer.shipping_status === "verified" && validAmount(offer.shipping_eur)) shipping = offer.shipping_eur;
  else missing.push("shipping_to_portugal");

  let tax = 0;
  if (offer.tax_status === "included" || offer.tax_status === "not_applicable") tax = 0;
  else if (offer.tax_status === "verified" && validAmount(offer.taxes_eur)) tax = offer.taxes_eur;
  else missing.push("vat_tax_treatment");

  let customs = 0;
  if (offer.customs_status === "not_applicable" || offer.customs_status === "none_verified") customs = 0;
  else if (offer.customs_status === "verified" && validAmount(offer.customs_eur)) customs = offer.customs_eur;
  else missing.push("customs_import_charges");

  let discount = 0;
  if (offer.coupon_status === "none") discount = 0;
  else if (offer.coupon_status === "verified" && validAmount(offer.coupon_discount_eur)) discount = offer.coupon_discount_eur;
  else missing.push("coupon_checkout_status");

  if (item !== null && validAmount(discount) && discount > item + shipping + tax + customs) {
    missing.push("coupon_discount_exceeds_known_cost");
  }

  const complete = missing.length === 0;
  const total = complete ? Math.round((item + shipping + tax + customs - discount + Number.EPSILON) * 100) / 100 : null;
  return {
    total_delivered_price_eur: total,
    landed_cost_status: complete ? "verified" : "incomplete",
    missing_components: [...new Set(missing)],
    components_eur: {
      item: validAmount(item) ? Math.round(item * 100) / 100 : null,
      shipping: offer.shipping_status === "free_verified" || (offer.shipping_status === "verified" && validAmount(offer.shipping_eur)) ? Math.round(shipping * 100) / 100 : null,
      tax: offer.tax_status === "included" || offer.tax_status === "not_applicable" || (offer.tax_status === "verified" && validAmount(offer.taxes_eur)) ? Math.round(tax * 100) / 100 : null,
      customs: offer.customs_status === "not_applicable" || offer.customs_status === "none_verified" || (offer.customs_status === "verified" && validAmount(offer.customs_eur)) ? Math.round(customs * 100) / 100 : null,
      coupon_discount: offer.coupon_status === "none" || (offer.coupon_status === "verified" && validAmount(offer.coupon_discount_eur)) ? Math.round(discount * 100) / 100 : null
    }
  };
}

function compareOffers(offers = []) {
  return offers.map(offer => ({ ...offer, landed_cost: calculateLandedCost(offer) }))
    .sort((a, b) => {
      const aVerified = a.landed_cost.landed_cost_status === "verified";
      const bVerified = b.landed_cost.landed_cost_status === "verified";
      if (aVerified !== bVerified) return aVerified ? -1 : 1;
      if (aVerified && bVerified) return a.landed_cost.total_delivered_price_eur - b.landed_cost.total_delivered_price_eur;
      const aPrice = Number.isFinite(a.price_value) ? a.price_value : Number.POSITIVE_INFINITY;
      const bPrice = Number.isFinite(b.price_value) ? b.price_value : Number.POSITIVE_INFINITY;
      return aPrice - bPrice;
    });
}

module.exports = { calculateLandedCost, compareOffers };
