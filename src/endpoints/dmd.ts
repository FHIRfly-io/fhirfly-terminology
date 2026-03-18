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
import type { DmdData, DmdSearchParams } from "../types/dmd.js";

/**
 * dm+d (Dictionary of Medicines and Devices) API endpoint.
 *
 * Provides access to the UK's medicines reference data standard used by the NHS.
 * Covers 5 concept types: VTM, VMP, AMP, VMPP, AMPP.
 */
export class DmdEndpoint {
  constructor(private readonly http: HttpClient) {}

  /**
   * Look up a single dm+d concept by code.
   *
   * @param code - dm+d code (SNOMED-style numeric identifier, 6-18 digits)
   * @param options - Response shape and include options
   * @returns dm+d concept data
   *
   * @example
   * ```ts
   * const result = await client.dmd.lookup("39732311000001104");
   * console.log(result.data.name); // "Paracetamol 500mg tablets"
   * ```
   */
  async lookup(code: string, options?: LookupOptions): Promise<ApiResponse<DmdData>> {
    return this.http.get<ApiResponse<DmdData>>(`/v1/dmd/${encodeURIComponent(code)}`, options);
  }

  /**
   * Look up multiple dm+d codes in a single request.
   *
   * @param codes - Array of dm+d codes (max 100)
   * @param options - Response shape, include, and batch options
   * @returns Batch response with results for each code
   */
  async lookupMany(
    codes: string[],
    options?: BatchLookupOptions
  ): Promise<BatchResponse<DmdData>> {
    if (codes.length === 0) throw new ValidationError("codes array must not be empty");
    if (codes.length > 100) throw new ValidationError(`dm+d batch lookup supports max 100 codes, got ${codes.length}`);
    return this.http.post<BatchResponse<DmdData>>(
      "/v1/dmd/_batch",
      { codes },
      options
    );
  }

  /**
   * Search for dm+d concepts.
   *
   * @param params - Search parameters (q, concept_type, status)
   * @param options - Pagination and response shape options
   * @returns Search results with facets
   *
   * @example
   * ```ts
   * // Search for paracetamol products
   * const results = await client.dmd.search({ q: "paracetamol" });
   *
   * // Filter by concept type
   * const results = await client.dmd.search({
   *   q: "amoxicillin",
   *   concept_type: "VMP"
   * });
   * ```
   */
  async search(
    params: DmdSearchParams,
    options?: SearchOptions
  ): Promise<SearchResponse<DmdData>> {
    return this.http.search<SearchResponse<DmdData>>("/v1/dmd/search", {
      ...params,
      ...options,
      include: options?.include?.join(","),
    });
  }
}
