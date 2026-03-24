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
import type {
  RxClassData,
  RxClassSearchParams,
  RxClassMembersResponse,
} from "../types/rxclass.js";

/**
 * RxClass (Drug Classification) API endpoint.
 *
 * Provides access to the RxNorm drug classification hierarchy, including
 * ATC, EPC, MOA, PE, and CHEM class types.
 */
export class RxClassEndpoint {
  constructor(private readonly http: HttpClient) {}

  /**
   * Look up a single RxClass drug class.
   *
   * @param classId - RxClass identifier
   * @param options - Response shape and include options
   * @returns RxClass data
   *
   * @example
   * ```ts
   * const cls = await client.rxclass.lookup("N0000175557");
   * console.log(cls.data.class_name); // "HMG-CoA Reductase Inhibitors"
   * ```
   */
  async lookup(classId: string, options?: LookupOptions): Promise<ApiResponse<RxClassData>> {
    return this.http.get<ApiResponse<RxClassData>>(`/v1/rxclass/${encodeURIComponent(classId)}`, options);
  }

  /**
   * Look up multiple RxClass drug classes in a single request.
   *
   * @param classIds - Array of RxClass identifiers (max 100)
   * @param options - Response shape, include, and batch options
   * @returns Batch response with results for each class ID
   */
  async lookupMany(
    classIds: string[],
    options?: BatchLookupOptions
  ): Promise<BatchResponse<RxClassData>> {
    if (classIds.length === 0) throw new ValidationError("classIds array must not be empty");
    if (classIds.length > 100) throw new ValidationError(`RxClass batch lookup supports max 100 codes, got ${classIds.length}`);
    return this.http.post<BatchResponse<RxClassData>>(
      "/v1/rxclass/_batch",
      { codes: classIds },
      options
    );
  }

  /**
   * Search for drug classes.
   *
   * @param params - Search parameters (q, class_type)
   * @param options - Pagination and response shape options
   * @returns Search results with facets
   *
   * @example
   * ```ts
   * // Search for statin-related classes
   * const results = await client.rxclass.search({ q: "statin" });
   *
   * // Find all EPC (Established Pharmacologic Class) entries
   * const results = await client.rxclass.search({
   *   class_type: "EPC"
   * });
   * ```
   */
  async search(
    params: RxClassSearchParams,
    options?: SearchOptions
  ): Promise<SearchResponse<RxClassData>> {
    return this.http.search<SearchResponse<RxClassData>>("/v1/rxclass/search", {
      ...params,
      ...options,
      include: options?.include?.join(","),
    });
  }

  /**
   * Get member drugs of a drug class.
   *
   * Returns the list of RxNorm concepts (RxCUIs) that belong to the
   * specified drug class.
   *
   * @param classId - RxClass identifier
   * @param options - Response shape and include options
   * @returns Members response with array of RxCUI members
   *
   * @example
   * ```ts
   * // Get all drugs in a class
   * const members = await client.rxclass.members("N0000175557");
   * console.log(members.data.count); // number of member drugs
   * console.log(members.data.members); // [{ rxcui: "...", name: "..." }, ...]
   * ```
   */
  async members(
    classId: string,
    options?: LookupOptions
  ): Promise<ApiResponse<RxClassMembersResponse>> {
    return this.http.get<ApiResponse<RxClassMembersResponse>>(
      `/v1/rxclass/${encodeURIComponent(classId)}/members`,
      options
    );
  }
}
