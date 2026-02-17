import type { HttpClient } from "../http.js";
import type {
  ApiResponse,
  BatchResponse,
  LookupOptions,
  BatchLookupOptions,
  SearchOptions,
  SearchResponse,
} from "../types/common.js";
import type { MvxData, MvxSearchParams } from "../types/mvx.js";

/**
 * MVX (Vaccine Manufacturer Codes) API endpoint.
 */
export class MvxEndpoint {
  constructor(private readonly http: HttpClient) {}

  /**
   * Look up a single MVX code.
   *
   * @param mvxCode - MVX manufacturer code
   * @param options - Response shape and include options
   * @returns MVX data
   *
   * @example
   * ```ts
   * const mvx = await client.mvx.lookup("PFR");
   * console.log(mvx.data.manufacturer_name); // "Pfizer, Inc"
   * ```
   */
  async lookup(mvxCode: string, options?: LookupOptions): Promise<ApiResponse<MvxData>> {
    return this.http.get<ApiResponse<MvxData>>(`/v1/mvx/${encodeURIComponent(mvxCode)}`, options);
  }

  /**
   * Look up multiple MVX codes in a single request.
   *
   * @param mvxCodes - Array of MVX codes (max 500)
   * @param options - Response shape, include, and batch options
   * @returns Batch response with results for each code
   */
  async lookupMany(
    mvxCodes: string[],
    options?: BatchLookupOptions
  ): Promise<BatchResponse<MvxData>> {
    return this.http.post<BatchResponse<MvxData>>(
      "/v1/mvx/_batch",
      { codes: mvxCodes },
      options
    );
  }

  /**
   * Search for vaccine manufacturers.
   *
   * @param params - Search parameters (q, status)
   * @param options - Pagination and response shape options
   * @returns Search results with facets
   *
   * @example
   * ```ts
   * // Search by name
   * const results = await client.mvx.search({ q: "pfizer" });
   *
   * // List all active manufacturers
   * const results = await client.mvx.search({ status: "active" });
   * ```
   */
  async search(
    params: MvxSearchParams,
    options?: SearchOptions
  ): Promise<SearchResponse<MvxData>> {
    return this.http.search<SearchResponse<MvxData>>("/v1/mvx/search", {
      ...params,
      ...options,
      include: options?.include?.join(","),
    });
  }
}
