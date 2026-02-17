// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import type { HttpClient } from "../http.js";
import type {
  ApiResponse,
  BatchResponse,
  LookupOptions,
  BatchLookupOptions,
  SearchOptions,
  SearchResponse,
} from "../types/common.js";
import type { NdcData, NdcSearchParams } from "../types/ndc.js";

/**
 * NDC (National Drug Code) API endpoint.
 */
export class NdcEndpoint {
  constructor(private readonly http: HttpClient) {}

  /**
   * Look up a single NDC code.
   *
   * @param code - NDC code (10-digit, 11-digit, or hyphenated format)
   * @param options - Response shape and include options
   * @returns NDC data
   *
   * @example
   * ```ts
   * const ndc = await client.ndc.lookup("0069-0151-01");
   * console.log(ndc.data.product_name); // "Lipitor"
   * ```
   */
  async lookup(code: string, options?: LookupOptions): Promise<ApiResponse<NdcData>> {
    return this.http.get<ApiResponse<NdcData>>(`/v1/ndc/${encodeURIComponent(code)}`, options);
  }

  /**
   * Look up multiple NDC codes in a single request.
   *
   * @param codes - Array of NDC codes (max 500)
   * @param options - Response shape, include, and batch options
   * @returns Batch response with results for each code
   *
   * @example
   * ```ts
   * const results = await client.ndc.lookupMany([
   *   "0069-0151-01",
   *   "0069-0151-02",
   *   "invalid-code"
   * ]);
   *
   * for (const item of results.results) {
   *   if (item.found) {
   *     console.log(item.data.product_name);
   *   } else {
   *     console.log(`Not found: ${item.code}`);
   *   }
   * }
   * ```
   */
  async lookupMany(
    codes: string[],
    options?: BatchLookupOptions
  ): Promise<BatchResponse<NdcData>> {
    return this.http.post<BatchResponse<NdcData>>(
      "/v1/ndc/_batch",
      { codes },
      options
    );
  }

  /**
   * Search for NDC products.
   *
   * @param params - Search parameters (q, name, brand, ingredient, etc.)
   * @param options - Pagination and response shape options
   * @returns Search results with facets
   *
   * @example
   * ```ts
   * // Search by drug name
   * const results = await client.ndc.search({ q: "advil" });
   *
   * // Search with filters
   * const results = await client.ndc.search({
   *   ingredient: "ibuprofen",
   *   dosage_form: "TABLET",
   *   product_type: "otc"
   * });
   *
   * console.log(`Found ${results.total} products`);
   * for (const item of results.items) {
   *   console.log(item.product_name);
   * }
   * ```
   */
  async search(
    params: NdcSearchParams,
    options?: SearchOptions
  ): Promise<SearchResponse<NdcData>> {
    return this.http.search<SearchResponse<NdcData>>("/v1/ndc/search", {
      ...params,
      ...options,
      include: options?.include?.join(","),
    });
  }
}
