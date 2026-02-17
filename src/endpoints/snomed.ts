// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import type { HttpClient } from "../http.js";
import type { ApiResponse } from "../types/common.js";
import type {
  SnomedConcept,
  SnomedReverseMappingData,
  SnomedSearchParams,
  SnomedCategoriesResponse,
  SnomedBatchResultItem,
} from "../types/snomed.js";

/**
 * Search result for SNOMED IPS concepts.
 */
export interface SnomedSearchResponse {
  count: number;
  results: SnomedConcept[];
  meta: {
    legal: {
      license: string;
      attribution_required: boolean;
      source_name: string;
      citation: string;
    };
  };
}

/**
 * Batch response for SNOMED concept lookups.
 */
export interface SnomedBatchResponse {
  count: number;
  results: SnomedBatchResultItem[];
  meta: {
    legal: {
      license: string;
      attribution_required: boolean;
      source_name: string;
      citation: string;
    };
  };
}

/**
 * SNOMED CT API endpoint.
 *
 * Provides access to SNOMED CT concepts from the IPS (International Patient Set)
 * free set, which contains ~12,000 curated clinical concepts licensed under CC BY 4.0.
 *
 * Unlike other endpoints, SNOMED does not use response shapes (compact/standard/full).
 */
export class SnomedEndpoint {
  constructor(private readonly http: HttpClient) {}

  /**
   * Look up a single SNOMED CT concept by concept ID.
   *
   * @param conceptId - SNOMED concept ID (numeric string, e.g., "73211009")
   * @returns SNOMED concept data with licensing metadata
   *
   * @example
   * ```ts
   * const result = await client.snomed.lookup("73211009");
   * console.log(result.data.preferred_term); // "Diabetes mellitus"
   * console.log(result.data.ips_category);   // "condition"
   * ```
   */
  async lookup(conceptId: string): Promise<ApiResponse<SnomedConcept>> {
    return this.http.get<ApiResponse<SnomedConcept>>(
      `/v1/snomed/${encodeURIComponent(conceptId)}`
    );
  }

  /**
   * Look up multiple SNOMED CT concepts in a single request.
   *
   * @param conceptIds - Array of SNOMED concept IDs (max 100)
   * @returns Batch response with results for each concept ID
   *
   * @example
   * ```ts
   * const result = await client.snomed.lookupMany(["73211009", "84114007"]);
   * for (const item of result.results) {
   *   if (item.status === "ok") {
   *     console.log(`${item.concept_id}: ${item.data.preferred_term}`);
   *   }
   * }
   * ```
   */
  async lookupMany(conceptIds: string[]): Promise<SnomedBatchResponse> {
    return this.http.post<SnomedBatchResponse>(
      "/v1/snomed/_batch",
      { codes: conceptIds }
    );
  }

  /**
   * Search SNOMED CT IPS concepts.
   *
   * @param params - Search parameters (q, ips_category, semantic_tag, active, limit, skip)
   * @returns Search results with matching concepts
   *
   * @example
   * ```ts
   * // Text search
   * const results = await client.snomed.search({ q: "heart failure" });
   *
   * // Filter by category
   * const conditions = await client.snomed.search({
   *   ips_category: "condition",
   *   limit: 20
   * });
   * ```
   */
  async search(params: SnomedSearchParams): Promise<SnomedSearchResponse> {
    return this.http.search<SnomedSearchResponse>("/v1/snomed/search", {
      ...params,
    });
  }

  /**
   * List all available IPS categories.
   *
   * @returns Categories with descriptions
   *
   * @example
   * ```ts
   * const result = await client.snomed.categories();
   * console.log(result.categories); // ["substance", "product", "condition", ...]
   * ```
   */
  async categories(): Promise<SnomedCategoriesResponse> {
    return this.http.get<SnomedCategoriesResponse>("/v1/snomed/categories");
  }

  /**
   * Look up reverse mappings for a SNOMED concept.
   *
   * Returns what terminology codes (ICD-10, RxNorm, NDC) map to this SNOMED concept.
   *
   * @param conceptId - SNOMED concept ID (numeric string)
   * @returns Reverse mapping data showing source codes that map to this concept
   *
   * @example
   * ```ts
   * const result = await client.snomed.mappings("73211009");
   * console.log(result.data.snomed_display); // "Diabetes mellitus"
   * for (const mapping of result.data.mappings) {
   *   console.log(`${mapping.source_system}: ${mapping.source_code}`);
   * }
   * ```
   */
  async mappings(conceptId: string): Promise<ApiResponse<SnomedReverseMappingData>> {
    return this.http.get<ApiResponse<SnomedReverseMappingData>>(
      `/v1/snomed/${encodeURIComponent(conceptId)}/mappings`
    );
  }
}
