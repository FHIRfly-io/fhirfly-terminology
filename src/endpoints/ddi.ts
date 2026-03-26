// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import type { HttpClient } from "../http.js";
import { ValidationError } from "../errors.js";
import type { DdiReferenceResponse, DdiBatchResponse } from "../types/ddi.js";

/**
 * Options for DDI reference lookups.
 */
export interface DdiReferenceOptions {
  /** Filter to specific label sections (e.g., ["drug_interactions", "warnings"]). */
  sections?: string[];
}

/**
 * Drug-Drug Interaction (DDI) Reference API endpoint.
 *
 * Provides FDA-approved drug interaction text, warnings, RxNorm drug classes,
 * ingredients, and DailyMed links for individual drugs or multi-drug batches.
 */
export class DdiEndpoint {
  constructor(private readonly http: HttpClient) {}

  /**
   * Look up interaction reference data for a single drug.
   * @param identifier - RxCUI, drug name, or NDC code
   * @param options - Optional settings (e.g., filter to specific label sections)
   */
  async reference(identifier: string, options?: DdiReferenceOptions): Promise<DdiReferenceResponse> {
    let path = `/v1/ddi/reference/${encodeURIComponent(identifier)}`;
    if (options?.sections?.length) {
      const params = new URLSearchParams();
      params.set("sections", options.sections.join(","));
      path += `?${params.toString()}`;
    }
    return this.http.get<DdiReferenceResponse>(path);
  }

  /**
   * Look up interaction reference data for multiple drugs.
   * @param drugs - Array of RxCUI, drug name, or NDC identifiers (max 25)
   * @param options - Optional settings (e.g., filter to specific label sections)
   * @throws {ValidationError} If drugs array is empty or exceeds 25 items
   */
  async referenceMany(drugs: string[], options?: DdiReferenceOptions): Promise<DdiBatchResponse> {
    if (drugs.length === 0) {
      throw new ValidationError("At least one drug identifier is required");
    }
    if (drugs.length > 25) {
      throw new ValidationError(`Batch size ${drugs.length} exceeds maximum of 25 drugs`);
    }
    const body: Record<string, unknown> = { drugs };
    if (options?.sections?.length) {
      body.sections = options.sections;
    }
    return this.http.post<DdiBatchResponse>("/v1/ddi/reference", body);
  }

}
