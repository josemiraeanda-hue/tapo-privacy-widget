"use strict";
function fail(statusCode, message) { const error = new Error(message); error.statusCode = statusCode; return error; }
function normalizePlate(value) { return String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, ""); }
function readVin(data) { return data?.VehicleIdentificationNumber || data?.VechileIdentificationNumber || data?.VIN || null; }
async function lookupPortugueseRegistration({ plate, username = process.env.REGCHECK_USERNAME, apiKey = process.env.REGCHECK_API_KEY, fetchImpl = globalThis.fetch } = {}) {
  const registration = normalizePlate(plate);
  if (!/^[A-Z0-9]{4,8}$/.test(registration)) throw fail(400, "Invalid registration number");
  if (!username || !apiKey) throw fail(503, "Portuguese registration lookup is not configured: REGCHECK_USERNAME and REGCHECK_API_KEY are required");
  if (typeof fetchImpl !== "function") throw fail(500, "This Node.js runtime does not provide fetch");
  const url = "https://www.regcheck.org.uk/api/json.aspx/CheckPortugal/" + encodeURIComponent(registration);
  const authorization = "Basic " + Buffer.from(String(username) + ":" + String(apiKey)).toString("base64");
  let response;
  try {
    response = await fetchImpl(url, { method: "GET", headers: { Authorization: authorization, Accept: "application/json" }, signal: AbortSignal.timeout(15000) });
  } catch {
    throw fail(502, "RegCheck request failed");
  }
  const bodyText = await response.text();
  if (!response.ok) throw fail(response.status === 401 ? 502 : response.status >= 500 ? 502 : response.status, "RegCheck returned HTTP " + response.status);
  let data;
  try {
    data = JSON.parse(bodyText);
    if (typeof data?.vehicleJson === "string") data = JSON.parse(data.vehicleJson);
  } catch {
    throw fail(502, "RegCheck returned an invalid JSON response");
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw fail(502, "RegCheck returned an unexpected response");
  const make = data?.CarMake?.CurrentTextValue || data?.MakeDescription || null;
  const model = data?.CarModel?.CurrentTextValue || data?.ModelDescription || null;
  const vin = readVin(data);
  return {
    provider: "regcheck_portugal",
    registration,
    checked_at: new Date().toISOString(),
    vehicle: {
      description: data.Description || null, make, model,
      registration_year: data.RegistrationYear || null,
      engine_size: data?.EngineSize?.CurrentTextValue || data.EngineSize || null,
      fuel_type: data?.FuelType?.CurrentTextValue || data.FuelType || null,
      transmission: data?.Transmission?.CurrentTextValue || data.Transmission || null,
      registration_date: data.RegistrationDate || null,
      imported: data.Imported ?? null,
      vin
    },
    vin_status: vin ? "provided_by_provider" : "not_returned_by_provider",
    source_url: "https://www.matricula.co.pt/data/api-docs.aspx/portugal",
    verification_note: "Vehicle fields depend on provider coverage; a missing VIN must not be inferred."
  };
}
module.exports = { lookupPortugueseRegistration, normalizePlate };
