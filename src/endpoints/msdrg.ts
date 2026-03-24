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
import type { MsdrgData, MsdrgSearchParams } from "../types/msdrg.js";

/**
 * MS-DRG (Medicare Severity Diagnosis Related Group) API endpoint.
 *
 * Provides access to CMS MS-DRG definitions used for inpatient hospital
 * payment under the Medicare IPPS system.
 */
export class MsdrgEndpoint {
  constructor(private readonly http: HttpClient) {}

  async lookup(code: string, options?: LookupOptions): Promise<ApiResponse<MsdrgData>> {
    return this.http.get<ApiResponse<MsdrgData>>(`/v1/msdrg/${encodeURIComponent(code)}`, options);
  }

  async lookupMany(codes: string[], options?: BatchLookupOptions): Promise<BatchResponse<MsdrgData>> {
    if (codes.length === 0) throw new ValidationError("codes array must not be empty");
    if (codes.length > 100) throw new ValidationError(`MS-DRG batch lookup supports max 100 codes, got ${codes.length}`);
    return this.http.post<BatchResponse<MsdrgData>>("/v1/msdrg/_batch", { codes }, options);
  }

  async search(params: MsdrgSearchParams, options?: SearchOptions): Promise<SearchResponse<MsdrgData>> {
    return this.http.search<SearchResponse<MsdrgData>>("/v1/msdrg/search", {
      ...params,
      ...options,
      include: options?.include?.join(","),
    });
  }
}
