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
import type { Opcs4Data, Opcs4SearchParams } from "../types/opcs4.js";

/**
 * OPCS-4 (Office of Population Censuses and Surveys Classification of
 * Interventions and Procedures) API endpoint.
 *
 * Provides access to the UK's procedural coding system used by the NHS.
 */
export class Opcs4Endpoint {
  constructor(private readonly http: HttpClient) {}

  /**
   * Look up a single OPCS-4 procedure code.
   *
   * @param code - OPCS-4 procedure code (e.g., "W37.1")
   * @param options - Response shape and include options
   * @returns OPCS-4 data
   *
   * @example
   * ```ts
   * const result = await client.opcs4.lookup("W37.1");
   * console.log(result.data.display); // Procedure description
   * ```
   */
  async lookup(code: string, options?: LookupOptions): Promise<ApiResponse<Opcs4Data>> {
    return this.http.get<ApiResponse<Opcs4Data>>(`/v1/opcs4/${encodeURIComponent(code)}`, options);
  }

  /**
   * Look up multiple OPCS-4 codes in a single request.
   *
   * @param codes - Array of OPCS-4 codes (max 100)
   * @param options - Response shape, include, and batch options
   * @returns Batch response with results for each code
   */
  async lookupMany(
    codes: string[],
    options?: BatchLookupOptions
  ): Promise<BatchResponse<Opcs4Data>> {
    if (codes.length === 0) throw new ValidationError("codes array must not be empty");
    if (codes.length > 100) throw new ValidationError(`OPCS-4 batch lookup supports max 100 codes, got ${codes.length}`);
    return this.http.post<BatchResponse<Opcs4Data>>(
      "/v1/opcs4/_batch",
      { codes },
      options
    );
  }

  /**
   * Search for OPCS-4 procedure codes.
   *
   * @param params - Search parameters (q, chapter, category)
   * @param options - Pagination and response shape options
   * @returns Search results with facets
   *
   * @example
   * ```ts
   * // Search for knee procedures
   * const results = await client.opcs4.search({ q: "knee replacement" });
   *
   * // Filter by chapter
   * const results = await client.opcs4.search({
   *   chapter: "W",
   *   q: "joint"
   * });
   * ```
   */
  async search(
    params: Opcs4SearchParams,
    options?: SearchOptions
  ): Promise<SearchResponse<Opcs4Data>> {
    return this.http.search<SearchResponse<Opcs4Data>>("/v1/opcs4/search", {
      ...params,
      ...options,
      include: options?.include?.join(","),
    });
  }
}
