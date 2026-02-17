import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Fhirfly } from "../src/index.js";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function searchResponse<T>(items: T[], total = items.length) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    headers: new Headers(),
    json: () =>
      Promise.resolve({
        items,
        total,
        total_capped: false,
        has_more: false,
        page: 1,
        limit: 20,
        facets: {},
        meta: {
          legal: {
            license: "public_domain",
            source_name: "FHIRfly",
            citation: "FHIRfly API",
            attribution_required: false,
          },
        },
      }),
  };
}

describe("Search endpoints", () => {
  let client: Fhirfly;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new Fhirfly({ apiKey: "test-key" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("NDC search", () => {
    it("builds correct query string for text search", async () => {
      mockFetch.mockResolvedValueOnce(
        searchResponse([{ ndc: "0069-0151-01", type: "package", name: "Lipitor", generic: "Atorvastatin", labeler: "Pfizer", active: true }])
      );

      await client.ndc.search({ q: "advil" });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("/v1/ndc/search");
      expect(url).toContain("q=advil");
    });

    it("includes all search parameters", async () => {
      mockFetch.mockResolvedValueOnce(searchResponse([]));

      await client.ndc.search({
        q: "ibuprofen",
        ingredient: "ibuprofen",
        dosage_form: "TABLET",
        product_type: "otc",
        is_active: true,
      });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("q=ibuprofen");
      expect(url).toContain("ingredient=ibuprofen");
      expect(url).toContain("dosage_form=TABLET");
      expect(url).toContain("product_type=otc");
      expect(url).toContain("is_active=true");
    });

    it("includes pagination options", async () => {
      mockFetch.mockResolvedValueOnce(searchResponse([]));

      await client.ndc.search({ q: "test" }, { limit: 50, page: 2 });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("limit=50");
      expect(url).toContain("page=2");
    });

    it("includes shape option", async () => {
      mockFetch.mockResolvedValueOnce(searchResponse([]));

      await client.ndc.search({ q: "test" }, { shape: "full" });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("shape=full");
    });

    it("returns search response with facets", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        json: () =>
          Promise.resolve({
            items: [{ ndc: "123", type: "product", name: "Test", generic: null, labeler: null, active: true }],
            total: 100,
            total_capped: false,
            has_more: true,
            page: 1,
            limit: 20,
            facets: {
              product_type: { otc: 60, rx: 40 },
              dosage_form: { TABLET: 50, CAPSULE: 30 },
            },
            meta: {
              legal: {
                license: "public_domain",
                source_name: "FDA NDC",
                citation: "FDA NDC Directory",
                attribution_required: false,
              },
            },
          }),
      });

      const result = await client.ndc.search({ q: "test" });

      expect(result.total).toBe(100);
      expect(result.has_more).toBe(true);
      expect(result.items).toHaveLength(1);
      expect(result.facets.product_type).toEqual({ otc: 60, rx: 40 });
    });
  });

  describe("NPI search", () => {
    it("builds correct query string", async () => {
      mockFetch.mockResolvedValueOnce(
        searchResponse([{ npi: "1234567890", name: "Dr. Smith", type: "individual", specialty: "Cardiology", location: "Los Angeles, CA", active: true }])
      );

      await client.npi.search({
        q: "smith",
        state: "TX",
        entity_type: "individual",
      });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("/v1/npi/search");
      expect(url).toContain("q=smith");
      expect(url).toContain("state=TX");
      expect(url).toContain("entity_type=individual");
    });

    it("handles specialty search", async () => {
      mockFetch.mockResolvedValueOnce(searchResponse([]));

      await client.npi.search({ specialty: "cardiology", state: "CA" });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("specialty=cardiology");
      expect(url).toContain("state=CA");
    });
  });

  describe("RxNorm search", () => {
    it("builds correct query string", async () => {
      mockFetch.mockResolvedValueOnce(
        searchResponse([{ rxcui: "213169", name: "atorvastatin" }])
      );

      await client.rxnorm.search({
        ingredient: "metformin",
        is_prescribable: true,
      });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("/v1/rxnorm/search");
      expect(url).toContain("ingredient=metformin");
      expect(url).toContain("is_prescribable=true");
    });

    it("handles tty filter", async () => {
      mockFetch.mockResolvedValueOnce(searchResponse([]));

      await client.rxnorm.search({ q: "lisinopril", tty: "SCD,SBD" });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("tty=SCD%2CSBD");
    });
  });

  describe("LOINC search", () => {
    it("builds correct query string", async () => {
      mockFetch.mockResolvedValueOnce(
        searchResponse([{ code: "2345-7", display_name: "Glucose [Mass/volume] in Serum or Plasma", shortname: "Glucose SerPl-mCnc", class: "CHEM", component: "Glucose" }])
      );

      await client.loinc.search({
        q: "glucose",
        class: "CHEM",
        system: "Bld",
      });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("/v1/loinc/search");
      expect(url).toContain("q=glucose");
      expect(url).toContain("class=CHEM");
      expect(url).toContain("system=Bld");
    });

    it("handles scale filter", async () => {
      mockFetch.mockResolvedValueOnce(searchResponse([]));

      await client.loinc.search({ component: "hemoglobin", scale: "Qn" });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("component=hemoglobin");
      expect(url).toContain("scale=Qn");
    });
  });

  describe("ICD-10 search", () => {
    it("builds correct query string for CM codes", async () => {
      mockFetch.mockResolvedValueOnce(
        searchResponse([{ code: "E11.9", display: "Type 2 diabetes" }])
      );

      await client.icd10.search({
        q: "diabetes",
        code_system: "CM",
        billable: true,
      });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("/v1/icd10/search");
      expect(url).toContain("q=diabetes");
      expect(url).toContain("code_system=CM");
      expect(url).toContain("billable=true");
    });

    it("builds correct query string for PCS codes", async () => {
      mockFetch.mockResolvedValueOnce(searchResponse([]));

      await client.icd10.search({
        q: "bypass",
        code_system: "PCS",
        body_system: "Heart and Great Vessels",
      });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("code_system=PCS");
      expect(url).toContain("body_system=Heart");
    });
  });

  describe("CVX search", () => {
    it("builds correct query string", async () => {
      mockFetch.mockResolvedValueOnce(
        searchResponse([{ code: "208", display: "COVID-19" }])
      );

      await client.cvx.search({
        is_covid_vaccine: true,
        status: "active",
      });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("/v1/cvx/search");
      expect(url).toContain("is_covid_vaccine=true");
      expect(url).toContain("status=active");
    });

    it("handles vaccine type filter", async () => {
      mockFetch.mockResolvedValueOnce(searchResponse([]));

      await client.cvx.search({ q: "covid", vaccine_type: "mRNA" });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("vaccine_type=mRNA");
    });
  });

  describe("MVX search", () => {
    it("builds correct query string", async () => {
      mockFetch.mockResolvedValueOnce(
        searchResponse([{ code: "PFR", display: "Pfizer, Inc", status: "active" }])
      );

      await client.mvx.search({ q: "pfizer" });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("/v1/mvx/search");
      expect(url).toContain("q=pfizer");
    });

    it("handles status filter", async () => {
      mockFetch.mockResolvedValueOnce(searchResponse([]));

      await client.mvx.search({ status: "active" });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("status=active");
    });
  });

  describe("FDA Labels search", () => {
    it("builds correct query string", async () => {
      mockFetch.mockResolvedValueOnce(
        searchResponse([{ spl_id: "abc", set_id: "abc-def", brand_name: "Advil", generic_name: "ibuprofen", manufacturer: "Pfizer", product_type: "HUMAN OTC DRUG", route: ["ORAL"] }])
      );

      await client.fdaLabels.search({
        q: "advil",
        product_type: "otc",
      });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("/v1/fda-label/search");
      expect(url).toContain("q=advil");
      expect(url).toContain("product_type=otc");
    });

    it("handles substance and manufacturer search", async () => {
      mockFetch.mockResolvedValueOnce(searchResponse([]));

      await client.fdaLabels.search({
        substance: "acetaminophen",
        manufacturer: "johnson",
      });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("substance=acetaminophen");
      expect(url).toContain("manufacturer=johnson");
    });

    it("handles NDC and RxCUI filters", async () => {
      mockFetch.mockResolvedValueOnce(searchResponse([]));

      await client.fdaLabels.search({
        ndc: "0363-0225",
        has_rxcui: true,
      });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("ndc=0363-0225");
      expect(url).toContain("has_rxcui=true");
    });

    it("handles is_current filter", async () => {
      mockFetch.mockResolvedValueOnce(searchResponse([]));

      await client.fdaLabels.search({
        q: "tylenol",
        is_current: false,
      });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("is_current=false");
    });
  });

  describe("HTTP client search method", () => {
    it("omits undefined and null values from query string", async () => {
      mockFetch.mockResolvedValueOnce(searchResponse([]));

      await client.ndc.search({
        q: "test",
        ingredient: undefined,
        dosage_form: undefined,
      });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("q=test");
      expect(url).not.toContain("ingredient");
      expect(url).not.toContain("dosage_form");
    });

    it("omits empty strings from query string", async () => {
      mockFetch.mockResolvedValueOnce(searchResponse([]));

      await client.ndc.search({
        q: "test",
        ingredient: "",
        labeler: "",
      });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).not.toContain("ingredient=");
      expect(url).not.toContain("labeler=");
    });

    it("converts boolean values to strings", async () => {
      mockFetch.mockResolvedValueOnce(searchResponse([]));

      await client.ndc.search({
        q: "test",
        is_active: true,
        has_rxcui: false,
      });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("is_active=true");
      expect(url).toContain("has_rxcui=false");
    });

    it("converts number values to strings", async () => {
      mockFetch.mockResolvedValueOnce(searchResponse([]));

      await client.ndc.search({ q: "test" }, { limit: 50, page: 3 });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain("limit=50");
      expect(url).toContain("page=3");
    });
  });
});
