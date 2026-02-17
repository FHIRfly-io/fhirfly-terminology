import type { HttpClient } from "../http.js";
import type {
  ApiResponse,
  BatchResponse,
  LookupOptions,
  BatchLookupOptions,
  SearchOptions,
  SearchResponse,
} from "../types/common.js";
import type { CvxData, CvxSearchParams } from "../types/cvx.js";

/**
 * CVX (Vaccine Codes) API endpoint.
 */
export class CvxEndpoint {
  constructor(private readonly http: HttpClient) {}

  /**
   * Look up a single CVX code.
   *
   * @param cvxCode - CVX vaccine code
   * @param options - Response shape and include options
   * @returns CVX data
   *
   * @example
   * ```ts
   * const cvx = await client.cvx.lookup("208");
   * console.log(cvx.data.display); // "COVID-19, mRNA, LNP-S, PF, 30 mcg/0.3 mL dose"
   * ```
   */
  async lookup(cvxCode: string, options?: LookupOptions): Promise<ApiResponse<CvxData>> {
    return this.http.get<ApiResponse<CvxData>>(`/v1/cvx/${encodeURIComponent(cvxCode)}`, options);
  }

  /**
   * Look up multiple CVX codes in a single request.
   *
   * @param cvxCodes - Array of CVX codes (max 500)
   * @param options - Response shape, include, and batch options
   * @returns Batch response with results for each code
   */
  async lookupMany(
    cvxCodes: string[],
    options?: BatchLookupOptions
  ): Promise<BatchResponse<CvxData>> {
    return this.http.post<BatchResponse<CvxData>>(
      "/v1/cvx/_batch",
      { codes: cvxCodes },
      options
    );
  }

  /**
   * Search for vaccine codes.
   *
   * @param params - Search parameters (q, status, vaccine_type, is_covid_vaccine)
   * @param options - Pagination and response shape options
   * @returns Search results with facets
   *
   * @example
   * ```ts
   * // Search for flu vaccines
   * const results = await client.cvx.search({ q: "influenza" });
   *
   * // Find all COVID-19 vaccines
   * const results = await client.cvx.search({
   *   is_covid_vaccine: true,
   *   status: "active"
   * });
   * ```
   */
  async search(
    params: CvxSearchParams,
    options?: SearchOptions
  ): Promise<SearchResponse<CvxData>> {
    return this.http.search<SearchResponse<CvxData>>("/v1/cvx/search", {
      ...params,
      ...options,
      include: options?.include?.join(","),
    });
  }
}
