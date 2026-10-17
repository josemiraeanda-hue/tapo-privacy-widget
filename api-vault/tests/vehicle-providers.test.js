"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { lookupPortugueseRegistration, normalizePlate } = require("../vehicle-providers");

function response(status, body) {
  return { ok: status >= 200 && status < 300, status, async text() { return typeof body === "string" ? body : JSON.stringify(body); } };
}

test("normalizes Portuguese registration punctuation", () => {
  assert.equal(normalizePlate("90-27-QL"), "9027QL");
});

test("rejects malformed registration numbers before network access", async () => {
  await assert.rejects(lookupPortugueseRegistration({ plate: "A!", username: "u", apiKey: "k", fetchImpl: async () => { throw new Error("should not run"); } }), e => e.statusCode === 400);
});

test("requires RegCheck credentials", async () => {
  await assert.rejects(lookupPortugueseRegistration({ plate: "90-27-QL", username: "", apiKey: "", fetchImpl: async () => response(200, {}) }), e => e.statusCode === 503 && /REGCHECK_USERNAME/.test(e.message));
});

test("returns normalized vehicle data and does not fabricate a VIN", async () => {
  const result = await lookupPortugueseRegistration({
    plate: "90-27-QL", username: "test-user", apiKey: "test-key",
    fetchImpl: async (url, options) => {
      assert.match(url, /CheckPortugal\/9027QL$/);
      assert.match(options.headers.Authorization, /^Basic /);
      return response(200, {
        Description: "MITSUBISHI PAJERO DIESEL",
        RegistrationYear: "2000",
        CarMake: { CurrentTextValue: "MITSUBISHI" },
        CarModel: { CurrentTextValue: "PAJERO DIESEL" },
        EngineSize: { CurrentTextValue: "3200" },
        FuelType: { CurrentTextValue: "DIESEL" },
        Imported: 0
      });
    }
  });
  assert.equal(result.registration, "9027QL");
  assert.equal(result.vehicle.make, "MITSUBISHI");
  assert.equal(result.vehicle.engine_size, "3200");
  assert.equal(result.vehicle.vin, null);
  assert.equal(result.vin_status, "not_returned_by_provider");
});

test("does not expose provider response bodies on authentication failures", async () => {
  await assert.rejects(lookupPortugueseRegistration({
    plate: "90-27-QL", username: "test-user", apiKey: "test-key",
    fetchImpl: async () => response(401, "sensitive provider response")
  }), e => e.statusCode === 502 && !e.message.includes("sensitive provider response") && !e.message.includes("test-key"));
});

test("rejects malformed provider JSON", async () => {
  await assert.rejects(lookupPortugueseRegistration({
    plate: "90-27-QL", username: "test-user", apiKey: "test-key",
    fetchImpl: async () => response(200, "<xml>")
  }), e => e.statusCode === 502 && /invalid JSON/.test(e.message));
});
