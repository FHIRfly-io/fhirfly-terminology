// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import type { HttpClient } from "../http.js";
import type { JcodeByHcpcsResponse, JcodeByNdcResponse } from "../types/jcode.js";

/**
 * J-Code/NDC Crosswalk API endpoint.
 *
 * Provides bidirectional lookups between HCPCS J-codes (injectable drugs)
 * and NDC codes. Essential for Medicare Part B drug billing.
 */
export class JcodeEndpoint {
  constructor(private readonly http: HttpClient) {}

  /**
   * Look up NDC codes for a HCPCS J-code.
   * @param code - HCPCS code (J, Q, A, C codes or 5-digit numeric)
   */
  async byHcpcs(code: string): Promise<JcodeByHcpcsResponse> {
    return this.http.get<JcodeByHcpcsResponse>(`/v1/jcode/by-hcpcs/${encodeURIComponent(code)}`);
  }

  /**
   * Reverse lookup: find HCPCS codes for an NDC.
   * @param ndc - NDC code (11 digits, with or without dashes)
   */
  async byNdc(ndc: string): Promise<JcodeByNdcResponse> {
    return this.http.get<JcodeByNdcResponse>(`/v1/jcode/by-ndc/${encodeURIComponent(ndc)}`);
  }
}
