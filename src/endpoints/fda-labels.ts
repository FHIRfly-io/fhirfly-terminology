import type { HttpClient } from "../http.js";
import type {
  ApiResponse,
  BatchResponse,
  SearchOptions,
  SearchResponse,
} from "../types/common.js";
import type {
  FdaLabelData,
  FdaLabelLookupOptions,
  FdaLabelSearchData,
  FdaLabelSearchParams,
} from "../types/fda-labels.js";

/**
 * FDA Labels API endpoint.
 *
 * Unlike other endpoints, FDA Labels uses a metadata + sections model instead of
 * compact/standard/full shapes for lookup. The search endpoint still uses shapes.
 */
export class FdaLabelsEndpoint {
  constructor(private readonly http: HttpClient) {}

  /**
   * Look up FDA label by identifier (Set ID, NDC, or RxCUI).
   *
   * The API auto-detects the identifier type based on format.
   * Returns metadata by default; specify `sections` or `bundle` to include label content.
   *
   * @param identifier - FDA SPL Set ID, NDC code, or RxCUI
   * @param options - Sections or bundle to include
   * @returns FDA Label metadata and optional sections
   *
   * @example
   * ```ts
   * // Metadata only
   * const label = await client.fdaLabels.lookup("0069-0151-01");
   *
   * // With safety sections
   * const label = await client.fdaLabels.lookup("0069-0151-01", {
   *   bundle: "safety"
   * });
   *
   * // With specific sections
   * const label = await client.fdaLabels.lookup("0069-0151-01", {
   *   sections: ["boxed_warning", "dosage_and_administration"]
   * });
   * ```
   */
  async lookup(
    identifier: string,
    options?: FdaLabelLookupOptions
  ): Promise<ApiResponse<FdaLabelData>> {
    let url = `/v1/fda-label/${encodeURIComponent(identifier)}`;
    const params = new URLSearchParams();
    if (options?.sections?.length) {
      params.set("sections", options.sections.join(","));
    }
    if (options?.bundle) {
      params.set("bundle", options.bundle);
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
    return this.http.get<ApiResponse<FdaLabelData>>(url);
  }

  /**
   * Look up multiple FDA labels by identifiers in a single request.
   *
   * Returns metadata only (no sections) for batch efficiency.
   * Identifiers can be Set IDs, NDC codes, or RxCUIs (mixed).
   *
   * @param identifiers - Array of identifiers (max 500)
   * @returns Batch response with results for each identifier
   */
  async lookupMany(
    identifiers: string[]
  ): Promise<BatchResponse<FdaLabelData>> {
    return this.http.post<BatchResponse<FdaLabelData>>(
      "/v1/fda-label/_batch",
      { codes: identifiers }
    );
  }

  /**
   * Search for FDA drug labels.
   *
   * Search uses compact/standard/full shapes (unlike lookup which uses metadata+sections).
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
   * ```
   */
  async search(
    params: FdaLabelSearchParams,
    options?: SearchOptions
  ): Promise<SearchResponse<FdaLabelSearchData>> {
    return this.http.search<SearchResponse<FdaLabelSearchData>>(
      "/v1/fda-label/search",
      {
        ...params,
        ...options,
        include: options?.include?.join(","),
      }
    );
  }
}
