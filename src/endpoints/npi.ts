import type { HttpClient } from "../http.js";
import type {
  ApiResponse,
  BatchResponse,
  LookupOptions,
  BatchLookupOptions,
  SearchOptions,
  SearchResponse,
} from "../types/common.js";
import type { NpiData, NpiSearchParams } from "../types/npi.js";

/**
 * NPI (National Provider Identifier) API endpoint.
 */
export class NpiEndpoint {
  constructor(private readonly http: HttpClient) {}

  /**
   * Look up a single NPI.
   *
   * @param npi - 10-digit NPI number
   * @param options - Response shape and include options
   * @returns NPI data
   *
   * @example
   * ```ts
   * const npi = await client.npi.lookup("1234567890");
   * console.log(npi.data.name);
   * ```
   */
  async lookup(npi: string, options?: LookupOptions): Promise<ApiResponse<NpiData>> {
    return this.http.get<ApiResponse<NpiData>>(`/v1/npi/${encodeURIComponent(npi)}`, options);
  }

  /**
   * Look up multiple NPIs in a single request.
   *
   * @param npis - Array of 10-digit NPI numbers (max 500)
   * @param options - Response shape, include, and batch options
   * @returns Batch response with results for each NPI
   *
   * @example
   * ```ts
   * const results = await client.npi.lookupMany([
   *   "1234567890",
   *   "0987654321"
   * ]);
   * ```
   */
  async lookupMany(
    npis: string[],
    options?: BatchLookupOptions
  ): Promise<BatchResponse<NpiData>> {
    return this.http.post<BatchResponse<NpiData>>(
      "/v1/npi/_batch",
      { codes: npis },
      options
    );
  }

  /**
   * Search for healthcare providers.
   *
   * @param params - Search parameters (q, name, specialty, state, etc.)
   * @param options - Pagination and response shape options
   * @returns Search results with facets
   *
   * @example
   * ```ts
   * // Search by name
   * const results = await client.npi.search({ q: "smith" });
   *
   * // Search with filters
   * const results = await client.npi.search({
   *   specialty: "cardiology",
   *   state: "CA",
   *   entity_type: "individual"
   * });
   *
   * console.log(`Found ${results.total} providers`);
   * ```
   */
  async search(
    params: NpiSearchParams,
    options?: SearchOptions
  ): Promise<SearchResponse<NpiData>> {
    return this.http.search<SearchResponse<NpiData>>("/v1/npi/search", {
      ...params,
      ...options,
      include: options?.include?.join(","),
    });
  }
}
