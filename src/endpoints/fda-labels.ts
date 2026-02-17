import type { HttpClient } from "../http.js";
import type {
  ApiResponse,
  BatchResponse,
  LookupOptions,
  BatchLookupOptions,
  SearchOptions,
  SearchResponse,
} from "../types/common.js";
import type { FdaLabelData, FdaLabelSearchParams } from "../types/fda-labels.js";

/**
 * FDA Labels API endpoint.
 */
export class FdaLabelsEndpoint {
  constructor(private readonly http: HttpClient) {}

  /**
   * Look up FDA label by identifier (Set ID, NDC, or RxCUI).
   *
   * The API auto-detects the identifier type based on format.
   *
   * @param identifier - FDA SPL Set ID, NDC code, or RxCUI
   * @param options - Response shape and include options
   * @returns FDA Label data
   *
   * @example
   * ```ts
   * // By Set ID
   * const label = await client.fdaLabels.lookup("abc123-def456");
   *
   * // By NDC
   * const label = await client.fdaLabels.lookup("0069-0151-01");
   *
   * // By RxCUI
   * const label = await client.fdaLabels.lookup("404773");
   * ```
   */
  async lookup(identifier: string, options?: LookupOptions): Promise<ApiResponse<FdaLabelData>> {
    return this.http.get<ApiResponse<FdaLabelData>>(`/v1/fda-label/${encodeURIComponent(identifier)}`, options);
  }

  /**
   * Look up multiple FDA labels by identifiers in a single request.
   *
   * Identifiers can be Set IDs, NDC codes, or RxCUIs (mixed).
   *
   * @param identifiers - Array of identifiers (max 500)
   * @param options - Response shape, include, and batch options
   * @returns Batch response with results for each identifier
   */
  async lookupMany(
    identifiers: string[],
    options?: BatchLookupOptions
  ): Promise<BatchResponse<FdaLabelData>> {
    return this.http.post<BatchResponse<FdaLabelData>>(
      "/v1/fda-label/_batch",
      { codes: identifiers },
      options
    );
  }

  /**
   * Search for FDA drug labels.
   *
   * @param params - Search parameters (q, name, brand, substance, manufacturer, etc.)
   * @param options - Pagination and response shape options
   * @returns Search results with facets
   *
   * @example
   * ```ts
   * // Search by drug name
   * const results = await client.fdaLabels.search({ q: "advil" });
   *
   * // Search OTC pain relievers
   * const results = await client.fdaLabels.search({
   *   substance: "acetaminophen",
   *   product_type: "otc"
   * });
   *
   * // Search by manufacturer
   * const results = await client.fdaLabels.search({
   *   manufacturer: "pfizer",
   *   product_type: "rx"
   * });
   * ```
   */
  async search(
    params: FdaLabelSearchParams,
    options?: SearchOptions
  ): Promise<SearchResponse<FdaLabelData>> {
    return this.http.search<SearchResponse<FdaLabelData>>("/v1/fda-label/search", {
      ...params,
      ...options,
      include: options?.include?.join(","),
    });
  }
}
