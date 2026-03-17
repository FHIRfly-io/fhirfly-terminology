// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import type { HttpClient } from "../http.js";
import { ValidationError } from "../errors.js";
import type {
  ApiResponse,
  BatchResponse,
  LookupOptions,
  BatchLookupOptions,
  SearchOptions,
  SearchResponse,
} from "../types/common.js";
import type { HccData, HccReverseResult, HccSearchParams } from "../types/hcc.js";

/**
 * Options for HCC reverse lookups.
 */
export interface HccReverseLookupOptions extends LookupOptions {
  /** Filter by HCC model (e.g., "CMS-HCC", "RxHCC") */
  model?: string;
}

/**
 * HCC (Hierarchical Condition Categories) API endpoint.
 *
 * Provides access to HCC crosswalk data mapping ICD-10 diagnosis codes
 * to CMS risk adjustment condition categories.
 */
export class HccEndpoint {
  constructor(private readonly http: HttpClient) {}

  /**
   * Look up HCC mappings for a single ICD-10 code.
   *
   * Returns all HCC category mappings for the given diagnosis code.
   *
   * @param icd10Code - ICD-10-CM diagnosis code (e.g., "E11.9")
   * @param options - Response shape and include options
   * @returns HCC mapping data (may contain multiple mappings)
   *
   * @example
   * ```ts
   * const result = await client.hcc.lookup("E11.9");
   * console.log(result.data); // HCC mapping(s) for Type 2 diabetes
   * ```
   */
  async lookup(icd10Code: string, options?: LookupOptions): Promise<ApiResponse<HccData[]>> {
    return this.http.get<ApiResponse<HccData[]>>(`/v1/hcc/${encodeURIComponent(icd10Code)}`, options);
  }

  /**
   * Look up HCC mappings for multiple ICD-10 codes in a single request.
   *
   * @param codes - Array of ICD-10-CM codes (max 100)
   * @param options - Response shape, include, and batch options
   * @returns Batch response with HCC mappings for each code
   */
  async lookupMany(
    codes: string[],
    options?: BatchLookupOptions
  ): Promise<BatchResponse<HccData[]>> {
    if (codes.length === 0) throw new ValidationError("codes array must not be empty");
    if (codes.length > 100) throw new ValidationError(`HCC batch lookup supports max 100 codes, got ${codes.length}`);
    return this.http.post<BatchResponse<HccData[]>>(
      "/v1/hcc/_batch",
      { codes },
      options
    );
  }

  /**
   * Reverse lookup: find ICD-10 codes that map to a given HCC category.
   *
   * @param ccNumber - HCC condition category number
   * @param options - Response shape, include, and model filter options
   * @returns Reverse lookup result with array of ICD-10 codes
   *
   * @example
   * ```ts
   * // Find all ICD-10 codes that map to HCC 19 (Diabetes)
   * const result = await client.hcc.reverse(19);
   * console.log(result.data.icd10_codes);
   *
   * // Filter by model
   * const result = await client.hcc.reverse(19, { model: "CMS-HCC" });
   * ```
   */
  async reverse(
    ccNumber: number,
    options?: HccReverseLookupOptions
  ): Promise<ApiResponse<HccReverseResult>> {
    const { model, ...lookupOptions } = options ?? {};
    const endpoint = `/v1/hcc/reverse/${encodeURIComponent(String(ccNumber))}`;

    if (model) {
      // Use search-style query building to include model alongside shape/include
      return this.http.search<ApiResponse<HccReverseResult>>(endpoint, {
        model,
        shape: lookupOptions.shape,
        include: lookupOptions.include?.join(","),
      });
    }

    return this.http.get<ApiResponse<HccReverseResult>>(endpoint, lookupOptions);
  }

  /**
   * Search for HCC crosswalk mappings.
   *
   * @param params - Search parameters (q, model_version, model_type, cc_number, payment_year)
   * @param options - Pagination and response shape options
   * @returns Search results with facets
   *
   * @example
   * ```ts
   * // Search by ICD-10 code text
   * const results = await client.hcc.search({ q: "diabetes" });
   *
   * // Filter by model version
   * const results = await client.hcc.search({
   *   model_version: "V28",
   *   cc_number: 19
   * });
   * ```
   */
  async search(
    params: HccSearchParams,
    options?: SearchOptions
  ): Promise<SearchResponse<HccData>> {
    return this.http.search<SearchResponse<HccData>>("/v1/hcc/search", {
      ...params,
      ...options,
      include: options?.include?.join(","),
    });
  }
}
