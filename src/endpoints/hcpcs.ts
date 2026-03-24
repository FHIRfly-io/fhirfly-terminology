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
import type { HcpcsData, HcpcsModifierData, HcpcsSearchParams } from "../types/hcpcs.js";

/**
 * HCPCS Level II procedure and supply code API endpoint.
 *
 * Provides access to CMS HCPCS Level II codes used for billing non-physician
 * services, supplies, and equipment on CMS-1500 claims.
 */
export class HcpcsEndpoint {
  constructor(private readonly http: HttpClient) {}

  async lookup(code: string, options?: LookupOptions): Promise<ApiResponse<HcpcsData>> {
    return this.http.get<ApiResponse<HcpcsData>>(`/v1/hcpcs/${encodeURIComponent(code)}`, options);
  }

  async lookupModifier(code: string, options?: LookupOptions): Promise<ApiResponse<HcpcsModifierData>> {
    return this.http.get<ApiResponse<HcpcsModifierData>>(`/v1/hcpcs/modifier/${encodeURIComponent(code)}`, options);
  }

  async lookupMany(codes: string[], options?: BatchLookupOptions): Promise<BatchResponse<HcpcsData>> {
    if (codes.length === 0) throw new ValidationError("codes array must not be empty");
    if (codes.length > 100) throw new ValidationError(`HCPCS batch lookup supports max 100 codes, got ${codes.length}`);
    return this.http.post<BatchResponse<HcpcsData>>("/v1/hcpcs/_batch", { codes }, options);
  }

  async search(params: HcpcsSearchParams, options?: SearchOptions): Promise<SearchResponse<HcpcsData>> {
    return this.http.search<SearchResponse<HcpcsData>>("/v1/hcpcs/search", {
      ...params,
      ...options,
      include: options?.include?.join(","),
    });
  }
}
