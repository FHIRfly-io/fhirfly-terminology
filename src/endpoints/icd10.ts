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
import type { Icd10Data, Icd10SearchParams } from "../types/icd10.js";

/**
 * ICD-10 API endpoint.
 */
export class Icd10Endpoint {
  constructor(private readonly http: HttpClient) {}

  /**
   * Look up a single ICD-10 code (CM or PCS).
   *
   * The API auto-detects whether the code is CM (diagnoses) or PCS (procedures)
   * based on the code format.
   *
   * @param code - ICD-10 code (e.g., "E11.9" for CM, "02HA0QZ" for PCS)
   * @param options - Response shape and include options
   * @returns ICD-10 data
   *
   * @example
   * ```ts
   * // Diagnosis code (CM)
   * const diagnosis = await client.icd10.lookup("E11.9");
   * console.log(diagnosis.data.display); // "Type 2 diabetes mellitus without complications"
   *
   * // Procedure code (PCS)
   * const procedure = await client.icd10.lookup("02HA0QZ");
   * console.log(procedure.data.display);
   * ```
   */
  async lookup(code: string, options?: LookupOptions): Promise<ApiResponse<Icd10Data>> {
    return this.http.get<ApiResponse<Icd10Data>>(`/v1/icd10/${encodeURIComponent(code)}`, options);
  }

  /**
   * Look up multiple ICD-10 codes in a single request.
   *
   * Codes can be a mix of CM (diagnoses) and PCS (procedures).
   *
   * @param codes - Array of ICD-10 codes (max 500)
   * @param options - Response shape, include, and batch options
   * @returns Batch response with results for each code
   */
  async lookupMany(
    codes: string[],
    options?: BatchLookupOptions
  ): Promise<BatchResponse<Icd10Data>> {
    return this.http.post<BatchResponse<Icd10Data>>(
      "/v1/icd10/_batch",
      { codes },
      options
    );
  }

  /**
   * Search for ICD-10 codes (both CM and PCS).
   *
   * @param params - Search parameters (q, code_system, chapter, billable, etc.)
   * @param options - Pagination and response shape options
   * @returns Search results with facets
   *
   * @example
   * ```ts
   * // Search diagnosis codes
   * const results = await client.icd10.search({
   *   q: "diabetes",
   *   code_system: "CM",
   *   billable: true
   * });
   *
   * // Search procedure codes
   * const results = await client.icd10.search({
   *   q: "bypass",
   *   code_system: "PCS"
   * });
   * ```
   */
  async search(
    params: Icd10SearchParams,
    options?: SearchOptions
  ): Promise<SearchResponse<Icd10Data>> {
    return this.http.search<SearchResponse<Icd10Data>>("/v1/icd10/search", {
      ...params,
      ...options,
      include: options?.include?.join(","),
    });
  }
}
