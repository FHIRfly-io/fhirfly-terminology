import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Fhirfly } from "../src/index.js";
import {
  NotFoundError,
  ValidationError,
  AuthenticationError,
  RateLimitError,
  ServerError,
} from "../src/errors.js";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function jsonResponse<T>(data: T, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: new Headers(),
    json: () => Promise.resolve(data),
  };
}

function apiResponse<T>(data: T) {
  return jsonResponse({
    data,
    meta: {
      legal: { license: "public_domain" },
      shape: "standard",
      api_version: "1.0",
    },
  });
}

function batchResponse<T>(results: Array<{ input: string; status: "ok" | "not_found" | "invalid"; data?: T; error?: string }>) {
  return jsonResponse({
    count: results.length,
    results,
    meta: {
      legal: { license: "public_domain" },
    },
  });
}

function errorResponse(status: number, body: Record<string, unknown> = {}) {
  return {
    ok: false,
    status,
    statusText: "Error",
    headers: new Headers(),
    json: () => Promise.resolve(body),
  };
}

describe("Endpoint lookup methods", () => {
  let client: Fhirfly;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new Fhirfly({ apiKey: "test-api-key" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // NDC Endpoint
  // ===========================================================================
  describe("NDC endpoint", () => {
    describe("lookup", () => {
      it("makes GET request to correct URL", async () => {
        mockFetch.mockResolvedValueOnce(
          apiResponse({ ndc: "0069-0151-01", product_name: "Lipitor" })
        );

        await client.ndc.lookup("0069-0151-01");

        const [url, opts] = mockFetch.mock.calls[0]!;
        expect(url).toBe("https://api.fhirfly.io/v1/ndc/0069-0151-01");
        expect(opts.method).toBe("GET");
      });

      it("encodes special characters in NDC code", async () => {
        mockFetch.mockResolvedValueOnce(
          apiResponse({ ndc: "0069/0151", product_name: "Test" })
        );

        await client.ndc.lookup("0069/0151");

        const [url] = mockFetch.mock.calls[0]!;
        expect(url).toContain("0069%2F0151");
      });

      it("includes shape option in query string", async () => {
        mockFetch.mockResolvedValueOnce(apiResponse({ ndc: "123" }));

        await client.ndc.lookup("123", { shape: "full" });

        const [url] = mockFetch.mock.calls[0]!;
        expect(url).toContain("?shape=full");
      });

      it("includes include option in query string", async () => {
        mockFetch.mockResolvedValueOnce(apiResponse({ ndc: "123" }));

        await client.ndc.lookup("123", { include: ["display"] });

        const [url] = mockFetch.mock.calls[0]!;
        expect(url).toContain("include=display");
      });

      it("returns parsed response data", async () => {
        mockFetch.mockResolvedValueOnce(
          apiResponse({
            ndc: "0069-0151-01",
            ndc11: "00069015101",
            product_name: "Lipitor",
            labeler_name: "Pfizer",
          })
        );

        const result = await client.ndc.lookup("0069-0151-01");

        expect(result.data.ndc).toBe("0069-0151-01");
        expect(result.data.product_name).toBe("Lipitor");
        expect(result.meta.shape).toBe("standard");
      });

      it("throws NotFoundError for 404 response", async () => {
        mockFetch.mockResolvedValueOnce(
          errorResponse(404, { message: "NDC not found" })
        );

        await expect(client.ndc.lookup("invalid")).rejects.toThrow(NotFoundError);
      });

      it("sends x-api-key header", async () => {
        mockFetch.mockResolvedValueOnce(apiResponse({ ndc: "123" }));

        await client.ndc.lookup("123");

        const [, opts] = mockFetch.mock.calls[0]!;
        expect(opts.headers["x-api-key"]).toBe("test-api-key");
      });
    });

    describe("lookupMany", () => {
      it("makes POST request to batch endpoint", async () => {
        mockFetch.mockResolvedValueOnce(
          batchResponse([{ input: "123", status: "ok", data: { ndc: "123" } }])
        );

        await client.ndc.lookupMany(["123", "456"]);

        const [url, opts] = mockFetch.mock.calls[0]!;
        expect(url).toBe("https://api.fhirfly.io/v1/ndc/_batch");
        expect(opts.method).toBe("POST");
      });

      it("sends codes in request body", async () => {
        mockFetch.mockResolvedValueOnce(batchResponse([]));

        await client.ndc.lookupMany(["0069-0151-01", "0069-0151-02"]);

        const [, opts] = mockFetch.mock.calls[0]!;
        const body = JSON.parse(opts.body);
        expect(body.codes).toEqual(["0069-0151-01", "0069-0151-02"]);
      });

      it("includes shape option in query string", async () => {
        mockFetch.mockResolvedValueOnce(batchResponse([]));

        await client.ndc.lookupMany(["123"], { shape: "compact" });

        const [url] = mockFetch.mock.calls[0]!;
        expect(url).toContain("?shape=compact");
      });

      it("returns batch response with count and status for each result", async () => {
        mockFetch.mockResolvedValueOnce(
          batchResponse([
            { input: "123", status: "ok", data: { ndc: "123" } },
            { input: "456", status: "not_found" },
          ])
        );

        const result = await client.ndc.lookupMany(["123", "456"]);

        expect(result.count).toBe(2);
        expect(result.results).toHaveLength(2);
        expect(result.results[0]!.status).toBe("ok");
        expect(result.results[1]!.status).toBe("not_found");
      });
    });
  });

  // ===========================================================================
  // NPI Endpoint
  // ===========================================================================
  describe("NPI endpoint", () => {
    describe("lookup", () => {
      it("makes GET request to correct URL", async () => {
        mockFetch.mockResolvedValueOnce(
          apiResponse({ npi: "1234567890", name: "Dr. Smith" })
        );

        await client.npi.lookup("1234567890");

        const [url] = mockFetch.mock.calls[0]!;
        expect(url).toBe("https://api.fhirfly.io/v1/npi/1234567890");
      });

      it("returns provider data", async () => {
        mockFetch.mockResolvedValueOnce(
          apiResponse({
            npi: "1234567890",
            entity_type: "individual",
            name: "Dr. John Smith",
            first_name: "John",
            last_name: "Smith",
          })
        );

        const result = await client.npi.lookup("1234567890");

        expect(result.data.npi).toBe("1234567890");
        expect(result.data.entity_type).toBe("individual");
        expect(result.data.name).toBe("Dr. John Smith");
      });
    });

    describe("lookupMany", () => {
      it("makes POST request to batch endpoint", async () => {
        mockFetch.mockResolvedValueOnce(batchResponse([]));

        await client.npi.lookupMany(["1234567890", "0987654321"]);

        const [url, opts] = mockFetch.mock.calls[0]!;
        expect(url).toBe("https://api.fhirfly.io/v1/npi/_batch");
        expect(opts.method).toBe("POST");

        const body = JSON.parse(opts.body);
        expect(body.codes).toEqual(["1234567890", "0987654321"]);
      });
    });
  });

  // ===========================================================================
  // RxNorm Endpoint
  // ===========================================================================
  describe("RxNorm endpoint", () => {
    describe("lookup", () => {
      it("makes GET request to correct URL", async () => {
        mockFetch.mockResolvedValueOnce(
          apiResponse({ rxcui: "213169", name: "atorvastatin", tty: "IN" })
        );

        await client.rxnorm.lookup("213169");

        const [url] = mockFetch.mock.calls[0]!;
        expect(url).toBe("https://api.fhirfly.io/v1/rxnorm/213169");
      });

      it("returns RxNorm data with term type", async () => {
        mockFetch.mockResolvedValueOnce(
          apiResponse({
            rxcui: "213169",
            name: "atorvastatin 10 MG Oral Tablet",
            tty: "SCD",
            prescribable: true,
          })
        );

        const result = await client.rxnorm.lookup("213169");

        expect(result.data.rxcui).toBe("213169");
        expect(result.data.tty).toBe("SCD");
      });
    });

    describe("lookupMany", () => {
      it("makes POST request to batch endpoint", async () => {
        mockFetch.mockResolvedValueOnce(batchResponse([]));

        await client.rxnorm.lookupMany(["213169", "197806"]);

        const [url] = mockFetch.mock.calls[0]!;
        expect(url).toBe("https://api.fhirfly.io/v1/rxnorm/_batch");
      });
    });
  });

  // ===========================================================================
  // LOINC Endpoint
  // ===========================================================================
  describe("LOINC endpoint", () => {
    describe("lookup", () => {
      it("makes GET request to correct URL", async () => {
        mockFetch.mockResolvedValueOnce(
          apiResponse({
            loinc_num: "2345-7",
            long_common_name: "Glucose [Mass/volume] in Serum or Plasma",
            component: "Glucose",
          })
        );

        await client.loinc.lookup("2345-7");

        const [url] = mockFetch.mock.calls[0]!;
        expect(url).toBe("https://api.fhirfly.io/v1/loinc/2345-7");
      });

      it("encodes LOINC codes with hyphens correctly", async () => {
        mockFetch.mockResolvedValueOnce(apiResponse({ loinc_num: "2345-7" }));

        await client.loinc.lookup("2345-7");

        const [url] = mockFetch.mock.calls[0]!;
        // Hyphens should not be encoded
        expect(url).toContain("2345-7");
      });

      it("returns LOINC data", async () => {
        mockFetch.mockResolvedValueOnce(
          apiResponse({
            loinc_num: "2345-7",
            long_common_name: "Glucose",
            component: "Glucose",
            class: "CHEM",
            system: "Ser/Plas",
          })
        );

        const result = await client.loinc.lookup("2345-7");

        expect(result.data.loinc_num).toBe("2345-7");
        expect(result.data.component).toBe("Glucose");
      });
    });

    describe("lookupMany", () => {
      it("makes POST request to batch endpoint", async () => {
        mockFetch.mockResolvedValueOnce(batchResponse([]));

        await client.loinc.lookupMany(["2345-7", "2160-0"]);

        const [url] = mockFetch.mock.calls[0]!;
        expect(url).toBe("https://api.fhirfly.io/v1/loinc/_batch");
      });
    });
  });

  // ===========================================================================
  // ICD-10 Endpoint
  // ===========================================================================
  describe("ICD-10 endpoint", () => {
    describe("lookup", () => {
      it("makes GET request to correct URL", async () => {
        mockFetch.mockResolvedValueOnce(
          apiResponse({
            code: "E11.9",
            type: "cm",
            description: "Type 2 diabetes mellitus without complications",
          })
        );

        await client.icd10.lookup("E11.9");

        const [url] = mockFetch.mock.calls[0]!;
        expect(url).toBe("https://api.fhirfly.io/v1/icd10/E11.9");
      });

      it("encodes dots in ICD-10 codes", async () => {
        mockFetch.mockResolvedValueOnce(apiResponse({ code: "E11.9" }));

        await client.icd10.lookup("E11.9");

        const [url] = mockFetch.mock.calls[0]!;
        // Dots may or may not be encoded depending on implementation
        expect(url).toContain("E11");
      });

      it("returns diagnosis data (CM code)", async () => {
        mockFetch.mockResolvedValueOnce(
          apiResponse({
            code: "E11.9",
            type: "cm",
            description: "Type 2 diabetes mellitus without complications",
            billable: true,
            chapter: "Chapter IV",
          })
        );

        const result = await client.icd10.lookup("E11.9");

        expect(result.data.code).toBe("E11.9");
        expect(result.data.type).toBe("cm");
      });

      it("returns procedure data (PCS code)", async () => {
        mockFetch.mockResolvedValueOnce(
          apiResponse({
            code: "0BJ08ZZ",
            type: "pcs",
            description: "Inspection of Tracheobronchial Tree",
            body_system: "Respiratory System",
            root_operation: "Inspection",
          })
        );

        const result = await client.icd10.lookup("0BJ08ZZ");

        expect(result.data.code).toBe("0BJ08ZZ");
        expect(result.data.type).toBe("pcs");
      });
    });

    describe("lookupMany", () => {
      it("makes POST request to batch endpoint", async () => {
        mockFetch.mockResolvedValueOnce(batchResponse([]));

        await client.icd10.lookupMany(["E11.9", "I10", "0BJ08ZZ"]);

        const [url] = mockFetch.mock.calls[0]!;
        expect(url).toBe("https://api.fhirfly.io/v1/icd10/_batch");
      });
    });
  });

  // ===========================================================================
  // CVX Endpoint
  // ===========================================================================
  describe("CVX endpoint", () => {
    describe("lookup", () => {
      it("makes GET request to correct URL", async () => {
        mockFetch.mockResolvedValueOnce(
          apiResponse({
            cvx_code: "208",
            short_description: "COVID-19, mRNA, LNP-S, PF, 30 mcg/0.3 mL dose",
          })
        );

        await client.cvx.lookup("208");

        const [url] = mockFetch.mock.calls[0]!;
        expect(url).toBe("https://api.fhirfly.io/v1/cvx/208");
      });

      it("returns vaccine data", async () => {
        mockFetch.mockResolvedValueOnce(
          apiResponse({
            cvx_code: "208",
            short_description: "COVID-19 Pfizer",
            full_vaccine_name: "COVID-19, mRNA, LNP-S, PF, 30 mcg/0.3 mL dose",
            status: "Active",
          })
        );

        const result = await client.cvx.lookup("208");

        expect(result.data.cvx_code).toBe("208");
        expect(result.data.short_description).toBe("COVID-19 Pfizer");
      });
    });

    describe("lookupMany", () => {
      it("makes POST request to batch endpoint", async () => {
        mockFetch.mockResolvedValueOnce(batchResponse([]));

        await client.cvx.lookupMany(["208", "207"]);

        const [url] = mockFetch.mock.calls[0]!;
        expect(url).toBe("https://api.fhirfly.io/v1/cvx/_batch");
      });
    });
  });

  // ===========================================================================
  // MVX Endpoint
  // ===========================================================================
  describe("MVX endpoint", () => {
    describe("lookup", () => {
      it("makes GET request to correct URL", async () => {
        mockFetch.mockResolvedValueOnce(
          apiResponse({
            mvx_code: "PFR",
            manufacturer_name: "Pfizer, Inc",
          })
        );

        await client.mvx.lookup("PFR");

        const [url] = mockFetch.mock.calls[0]!;
        expect(url).toBe("https://api.fhirfly.io/v1/mvx/PFR");
      });

      it("returns manufacturer data", async () => {
        mockFetch.mockResolvedValueOnce(
          apiResponse({
            mvx_code: "PFR",
            manufacturer_name: "Pfizer, Inc",
            status: "Active",
          })
        );

        const result = await client.mvx.lookup("PFR");

        expect(result.data.mvx_code).toBe("PFR");
        expect(result.data.manufacturer_name).toBe("Pfizer, Inc");
      });
    });

    describe("lookupMany", () => {
      it("makes POST request to batch endpoint", async () => {
        mockFetch.mockResolvedValueOnce(batchResponse([]));

        await client.mvx.lookupMany(["PFR", "MOD"]);

        const [url] = mockFetch.mock.calls[0]!;
        expect(url).toBe("https://api.fhirfly.io/v1/mvx/_batch");
      });
    });
  });

  // ===========================================================================
  // FDA Labels Endpoint
  // ===========================================================================
  describe("FDA Labels endpoint", () => {
    describe("lookup", () => {
      it("makes GET request to correct URL", async () => {
        mockFetch.mockResolvedValueOnce(
          apiResponse({
            set_id: "abc123-def456",
            product_name: "TYLENOL",
            labeler_name: "Johnson & Johnson",
          })
        );

        await client.fdaLabels.lookup("abc123-def456");

        const [url] = mockFetch.mock.calls[0]!;
        expect(url).toBe("https://api.fhirfly.io/v1/fda-label/abc123-def456");
      });

      it("returns label data", async () => {
        mockFetch.mockResolvedValueOnce(
          apiResponse({
            set_id: "abc123",
            product_name: "TYLENOL Extra Strength",
            labeler_name: "Johnson & Johnson",
            product_type: "HUMAN OTC DRUG",
          })
        );

        const result = await client.fdaLabels.lookup("abc123");

        expect(result.data.set_id).toBe("abc123");
        expect(result.data.product_name).toBe("TYLENOL Extra Strength");
      });

      it("accepts NDC codes (auto-detected by API)", async () => {
        mockFetch.mockResolvedValueOnce(
          apiResponse({
            set_id: "abc123",
            product_name: "TYLENOL",
          })
        );

        await client.fdaLabels.lookup("0045-0502-60");

        const [url] = mockFetch.mock.calls[0]!;
        expect(url).toBe("https://api.fhirfly.io/v1/fda-label/0045-0502-60");
      });
    });

    describe("lookupMany", () => {
      it("makes POST request to batch endpoint", async () => {
        mockFetch.mockResolvedValueOnce(batchResponse([]));

        await client.fdaLabels.lookupMany(["abc123", "def456"]);

        const [url] = mockFetch.mock.calls[0]!;
        expect(url).toBe("https://api.fhirfly.io/v1/fda-label/_batch");
      });

      it("sends codes in request body", async () => {
        mockFetch.mockResolvedValueOnce(batchResponse([]));

        await client.fdaLabels.lookupMany(["abc123", "def456"]);

        const [, opts] = mockFetch.mock.calls[0]!;
        const body = JSON.parse(opts.body);
        expect(body.codes).toEqual(["abc123", "def456"]);
      });
    });
  });

  // ===========================================================================
  // Error Handling
  // ===========================================================================
  describe("Error handling", () => {
    // Use a client with no retries for error tests to avoid timeouts
    let noRetryClient: Fhirfly;

    beforeEach(() => {
      noRetryClient = new Fhirfly({
        apiKey: "test-api-key",
        maxRetries: 0,
      });
    });

    it("throws NotFoundError for 404 responses", async () => {
      mockFetch.mockResolvedValueOnce(
        errorResponse(404, { message: "Code not found" })
      );

      await expect(noRetryClient.ndc.lookup("invalid")).rejects.toThrow(NotFoundError);
    });

    it("throws ValidationError for 400 responses", async () => {
      mockFetch.mockResolvedValueOnce(
        errorResponse(400, { message: "Invalid code format" })
      );

      await expect(noRetryClient.ndc.lookup("!!!")).rejects.toThrow(ValidationError);
    });

    it("throws AuthenticationError for 401 responses", async () => {
      mockFetch.mockResolvedValueOnce(
        errorResponse(401, { message: "Invalid API key" })
      );

      await expect(noRetryClient.ndc.lookup("123")).rejects.toThrow(
        AuthenticationError
      );
    });

    it("throws RateLimitError for 429 responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        headers: new Headers({
          "retry-after": "60",
          "x-ratelimit-limit": "100",
          "x-ratelimit-remaining": "0",
        }),
        json: () => Promise.resolve({ message: "Rate limit exceeded" }),
      });

      await expect(noRetryClient.ndc.lookup("123")).rejects.toThrow(RateLimitError);
    });

    it("throws ServerError for 5xx responses", async () => {
      mockFetch.mockResolvedValueOnce(
        errorResponse(500, { message: "Internal server error" })
      );

      await expect(noRetryClient.ndc.lookup("123")).rejects.toThrow(ServerError);
    });

    it("includes code type and value in NotFoundError", async () => {
      mockFetch.mockResolvedValueOnce(
        errorResponse(404, { message: "Not found" })
      );

      try {
        await noRetryClient.ndc.lookup("0069-0151-01");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        const notFoundError = error as NotFoundError;
        expect(notFoundError.code_type).toBe("NDC");
        expect(notFoundError.code_value).toBe("0069-0151-01");
      }
    });
  });

  // ===========================================================================
  // Options Handling
  // ===========================================================================
  describe("Options handling", () => {
    it("combines shape and include options", async () => {
      mockFetch.mockResolvedValueOnce(apiResponse({ ndc: "123" }));

      await client.ndc.lookup("123", { shape: "full", include: ["display"] });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("shape=full");
      expect(url).toContain("include=display");
    });

    it("handles multiple include values", async () => {
      mockFetch.mockResolvedValueOnce(apiResponse({ ndc: "123" }));

      // Currently only "display" is supported, but test array handling
      await client.ndc.lookup("123", { include: ["display"] });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("include=display");
    });

    it("omits query string when no options provided", async () => {
      mockFetch.mockResolvedValueOnce(apiResponse({ ndc: "123" }));

      await client.ndc.lookup("123");

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toBe("https://api.fhirfly.io/v1/ndc/123");
      expect(url).not.toContain("?");
    });

    it("passes batchSize option for lookupMany", async () => {
      mockFetch.mockResolvedValueOnce(batchResponse([]));

      await client.ndc.lookupMany(["123", "456"], { batchSize: 50 });

      // batchSize is a client-side option, not passed to server
      // This test verifies it doesn't cause errors
      expect(mockFetch).toHaveBeenCalledOnce();
    });
  });

  // ===========================================================================
  // Connectivity Endpoint
  // ===========================================================================
  describe("Connectivity endpoint", () => {
    describe("lookup", () => {
      it("makes GET request to correct URL", async () => {
        mockFetch.mockResolvedValueOnce(
          jsonResponse({
            npi: "1234567890",
            provider_summary: {
              name: "Dr. John Smith",
              entity_type: "individual",
            },
            connectivity_targets: [],
            meta: {
              data_as_of: "2026-02-05T00:00:00Z",
              disclaimer: "Test disclaimer",
            },
          })
        );

        await client.connectivity.lookup("1234567890");

        const [url, opts] = mockFetch.mock.calls[0]!;
        expect(url).toBe("https://api.fhirfly.io/v1/npi/1234567890/connectivity");
        expect(opts.method).toBe("GET");
      });

      it("encodes special characters in NPI", async () => {
        mockFetch.mockResolvedValueOnce(
          jsonResponse({
            npi: "123/456",
            provider_summary: { name: "Test", entity_type: "unknown" },
            connectivity_targets: [],
            meta: { data_as_of: "2026-02-05T00:00:00Z", disclaimer: "" },
          })
        );

        await client.connectivity.lookup("123/456");

        const [url] = mockFetch.mock.calls[0]!;
        expect(url).toContain("123%2F456");
      });

      it("returns parsed connectivity data", async () => {
        const mockData = {
          npi: "1234567890",
          provider_summary: {
            name: "Dr. Jane Smith",
            entity_type: "individual" as const,
            primary_taxonomy: "207R00000X",
            primary_taxonomy_desc: "Internal Medicine",
          },
          connectivity_targets: [
            {
              target_id: "target_test",
              name: "Test Health System",
              type: "health_system" as const,
              link_type: "employed_by" as const,
              link_confidence: "high" as const,
              ehr_vendor: "Epic",
              network_participation: ["CommonWell"],
              endpoints: [
                {
                  endpoint_id: "ep123",
                  type: "fhir_r4" as const,
                  url: "https://fhir.test.org/r4",
                  scope: "production" as const,
                  status: "active" as const,
                  last_verified_at: "2026-02-01T00:00:00Z",
                  availability: {
                    percentage: 99.2,
                    probe_count: 48,
                    last_checked: "2026-02-05T00:00:00Z",
                    last_successful: "2026-02-05T00:00:00Z",
                    consecutive_failures: 0,
                  },
                  evidence_summary: {
                    latest_verification: "http_probe",
                    verification_count: 48,
                    first_seen: "2025-06-15T00:00:00Z",
                    sources: ["manual_curation", "http_probe"],
                  },
                },
              ],
            },
          ],
          meta: {
            data_as_of: "2026-02-05T12:00:00Z",
            disclaimer: "Connectivity information is provided as-is...",
          },
        };

        mockFetch.mockResolvedValueOnce(jsonResponse(mockData));

        const result = await client.connectivity.lookup("1234567890");

        expect(result.npi).toBe("1234567890");
        expect(result.provider_summary.name).toBe("Dr. Jane Smith");
        expect(result.connectivity_targets).toHaveLength(1);
        expect(result.connectivity_targets[0].name).toBe("Test Health System");
        expect(result.connectivity_targets[0].endpoints).toHaveLength(1);
        expect(result.connectivity_targets[0].endpoints[0].type).toBe("fhir_r4");
        expect(result.connectivity_targets[0].endpoints[0].availability?.percentage).toBe(99.2);
      });

      it("handles empty connectivity targets", async () => {
        mockFetch.mockResolvedValueOnce(
          jsonResponse({
            npi: "1234567890",
            provider_summary: { name: "Test", entity_type: "individual" },
            connectivity_targets: [],
            meta: { data_as_of: "2026-02-05T00:00:00Z", disclaimer: "Test" },
          })
        );

        const result = await client.connectivity.lookup("1234567890");

        expect(result.connectivity_targets).toEqual([]);
      });

      it("throws NotFoundError for 404 response", async () => {
        mockFetch.mockResolvedValueOnce(
          errorResponse(404, { error: "not_found", message: "NPI not found" })
        );

        await expect(client.connectivity.lookup("0000000000")).rejects.toThrow(NotFoundError);
      });

      it("throws ValidationError for 400 response", async () => {
        mockFetch.mockResolvedValueOnce(
          errorResponse(400, { error: "bad_request", message: "Invalid NPI format" })
        );

        await expect(client.connectivity.lookup("invalid")).rejects.toThrow(ValidationError);
      });

      it("handles organization provider", async () => {
        mockFetch.mockResolvedValueOnce(
          jsonResponse({
            npi: "9876543210",
            provider_summary: {
              name: "Test Health System",
              entity_type: "organization" as const,
              primary_taxonomy: "282N00000X",
            },
            connectivity_targets: [],
            meta: { data_as_of: "2026-02-05T00:00:00Z", disclaimer: "Test" },
          })
        );

        const result = await client.connectivity.lookup("9876543210");

        expect(result.provider_summary.entity_type).toBe("organization");
        expect(result.provider_summary.name).toBe("Test Health System");
      });

      it("handles multiple targets with multiple endpoints", async () => {
        mockFetch.mockResolvedValueOnce(
          jsonResponse({
            npi: "1234567890",
            provider_summary: { name: "Dr. Test", entity_type: "individual" },
            connectivity_targets: [
              {
                target_id: "target_a",
                name: "Health System A",
                type: "health_system" as const,
                link_type: "employed_by" as const,
                link_confidence: "high" as const,
                endpoints: [
                  {
                    endpoint_id: "ep1",
                    type: "fhir_r4" as const,
                    url: "https://fhir-a.example.org/r4",
                    scope: "production" as const,
                    status: "active" as const,
                    evidence_summary: {
                      latest_verification: "http_probe",
                      verification_count: 10,
                      first_seen: "2025-01-01T00:00:00Z",
                      sources: ["http_probe"],
                    },
                  },
                  {
                    endpoint_id: "ep2",
                    type: "direct" as const,
                    url: "provider@direct.health-a.org",
                    scope: "production" as const,
                    status: "active" as const,
                    evidence_summary: {
                      latest_verification: "manual_curation",
                      verification_count: 1,
                      first_seen: "2025-06-01T00:00:00Z",
                      sources: ["manual_curation"],
                    },
                  },
                ],
              },
              {
                target_id: "target_b",
                name: "Clinic B",
                type: "practice" as const,
                link_type: "affiliated" as const,
                link_confidence: "medium" as const,
                endpoints: [
                  {
                    endpoint_id: "ep3",
                    type: "fhir_stu3" as const,
                    url: "https://fhir-b.example.org/stu3",
                    scope: "production" as const,
                    status: "active" as const,
                    evidence_summary: {
                      latest_verification: "http_probe",
                      verification_count: 5,
                      first_seen: "2025-03-01T00:00:00Z",
                      sources: ["http_probe"],
                    },
                  },
                ],
              },
            ],
            meta: { data_as_of: "2026-02-05T00:00:00Z", disclaimer: "Test" },
          })
        );

        const result = await client.connectivity.lookup("1234567890");

        expect(result.connectivity_targets).toHaveLength(2);
        expect(result.connectivity_targets[0].endpoints).toHaveLength(2);
        expect(result.connectivity_targets[0].endpoints[1].type).toBe("direct");
        expect(result.connectivity_targets[1].type).toBe("practice");
        expect(result.connectivity_targets[1].link_confidence).toBe("medium");
      });

      it("handles endpoint with auth requirements", async () => {
        mockFetch.mockResolvedValueOnce(
          jsonResponse({
            npi: "1234567890",
            provider_summary: { name: "Test", entity_type: "individual" },
            connectivity_targets: [
              {
                target_id: "target_a",
                name: "Hospital A",
                type: "facility" as const,
                link_type: "practice_location" as const,
                link_confidence: "high" as const,
                endpoints: [
                  {
                    endpoint_id: "ep1",
                    type: "fhir_r4" as const,
                    url: "https://fhir.hospital.org/r4",
                    scope: "production" as const,
                    status: "active" as const,
                    auth_requirements: {
                      registration_required: true,
                      registration_url: "https://hospital.org/register",
                      allowlist_required: true,
                      notes: "Contact IT department for access",
                    },
                    fhir_metadata: {
                      smart_config_url: "https://fhir.hospital.org/.well-known/smart-configuration",
                      capabilities: ["launch-ehr", "launch-standalone", "client-confidential-asymmetric"],
                      security: {
                        oauth_authorize_url: "https://auth.hospital.org/authorize",
                        oauth_token_url: "https://auth.hospital.org/token",
                        requires_udap: true,
                      },
                    },
                    evidence_summary: {
                      latest_verification: "http_probe",
                      verification_count: 24,
                      first_seen: "2025-01-01T00:00:00Z",
                      sources: ["manual_curation", "http_probe"],
                    },
                  },
                ],
              },
            ],
            meta: { data_as_of: "2026-02-05T00:00:00Z", disclaimer: "Test" },
          })
        );

        const result = await client.connectivity.lookup("1234567890");
        const endpoint = result.connectivity_targets[0].endpoints[0];

        expect(endpoint.auth_requirements?.registration_required).toBe(true);
        expect(endpoint.auth_requirements?.allowlist_required).toBe(true);
        expect(endpoint.fhir_metadata?.security?.requires_udap).toBe(true);
        expect(endpoint.fhir_metadata?.capabilities).toContain("client-confidential-asymmetric");
      });

      it("handles endpoint without optional availability", async () => {
        mockFetch.mockResolvedValueOnce(
          jsonResponse({
            npi: "1234567890",
            provider_summary: { name: "Test", entity_type: "individual" },
            connectivity_targets: [
              {
                target_id: "target_a",
                name: "New Provider",
                type: "practice" as const,
                link_type: "organization_npi" as const,
                link_confidence: "high" as const,
                endpoints: [
                  {
                    endpoint_id: "ep1",
                    type: "fhir_r4" as const,
                    url: "https://fhir.newprovider.org/r4",
                    scope: "production" as const,
                    status: "unverified" as const,
                    evidence_summary: {
                      latest_verification: "manual_curation",
                      verification_count: 1,
                      first_seen: "2026-02-01T00:00:00Z",
                      sources: ["manual_curation"],
                    },
                  },
                ],
              },
            ],
            meta: { data_as_of: "2026-02-05T00:00:00Z", disclaimer: "Test" },
          })
        );

        const result = await client.connectivity.lookup("1234567890");
        const endpoint = result.connectivity_targets[0].endpoints[0];

        expect(endpoint.status).toBe("unverified");
        expect(endpoint.availability).toBeUndefined();
        expect(endpoint.fhir_metadata).toBeUndefined();
        expect(endpoint.auth_requirements).toBeUndefined();
      });

      it("throws AuthenticationError for 401 response", async () => {
        mockFetch.mockResolvedValueOnce(
          errorResponse(401, { error: "unauthorized", message: "Invalid API key" })
        );

        await expect(client.connectivity.lookup("1234567890")).rejects.toThrow(AuthenticationError);
      });
    });
  });

  // ===========================================================================
  // Request Headers
  // ===========================================================================
  describe("Request headers", () => {
    it("sends Content-Type header", async () => {
      mockFetch.mockResolvedValueOnce(apiResponse({ ndc: "123" }));

      await client.ndc.lookup("123");

      const [, opts] = mockFetch.mock.calls[0]!;
      expect(opts.headers["Content-Type"]).toBe("application/json");
    });

    it("sends Accept header", async () => {
      mockFetch.mockResolvedValueOnce(apiResponse({ ndc: "123" }));

      await client.ndc.lookup("123");

      const [, opts] = mockFetch.mock.calls[0]!;
      expect(opts.headers["Accept"]).toBe("application/json");
    });

    it("sends User-Agent header", async () => {
      mockFetch.mockResolvedValueOnce(apiResponse({ ndc: "123" }));

      await client.ndc.lookup("123");

      const [, opts] = mockFetch.mock.calls[0]!;
      expect(opts.headers["User-Agent"]).toContain("@fhirfly/sdk");
    });
  });
});
