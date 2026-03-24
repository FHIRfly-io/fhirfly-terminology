// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import type { HttpClient } from "../http.js";
import { ValidationError } from "../errors.js";
import type {
  ApiResponse,
  BatchResponse,
  LookupOptions,
  BatchLookupOptions,
} from "../types/common.js";
import type { PosData, PosListResponse } from "../types/pos.js";

/**
 * Place of Service (POS) code API endpoint.
 *
 * Provides access to CMS Place of Service codes used to identify where
 * healthcare services were rendered on claims.
 */
export class PosEndpoint {
  constructor(private readonly http: HttpClient) {}

  async lookup(code: string, options?: LookupOptions): Promise<ApiResponse<PosData>> {
    return this.http.get<ApiResponse<PosData>>(`/v1/pos/${encodeURIComponent(code)}`, options);
  }

  async lookupMany(codes: string[], options?: BatchLookupOptions): Promise<BatchResponse<PosData>> {
    if (codes.length === 0) throw new ValidationError("codes array must not be empty");
    if (codes.length > 100) throw new ValidationError(`POS batch lookup supports max 100 codes, got ${codes.length}`);
    return this.http.post<BatchResponse<PosData>>("/v1/pos/_batch", { codes }, options);
  }

  /**
   * List all Place of Service codes (~52 codes).
   */
  async list(options?: LookupOptions): Promise<PosListResponse> {
    return this.http.get<PosListResponse>("/v1/pos/list", options);
  }
}
