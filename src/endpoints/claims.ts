// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import type { HttpClient } from "../http.js";
import type {
  NcciClaimType,
  NcciValidateResponse,
  MueServiceType,
  MueLookupResponse,
  MueBatchResponse,
  PfsLookupResponse,
  PfsBatchResponse,
  CoverageCheckResponse,
} from "../types/claims.js";

/**
 * Options for NCCI PTP validation.
 */
export interface NcciValidateOptions {
  /** Filter by claim type. If omitted, returns edits for all claim types. */
  claim_type?: NcciClaimType;
}

/**
 * Options for MUE lookup.
 */
export interface MueLookupOptions {
  /** Filter by service type. If omitted, returns limits for all service types. */
  service_type?: MueServiceType;
}

/**
 * Options for coverage check.
 */
export interface CoverageCheckOptions {
  /** Return only active policies. Default: true */
  active?: boolean;
}

/**
 * Claims Intelligence API endpoints.
 *
 * Provides access to CMS claims editing and payment data:
 * - **NCCI PTP**: Validate if two CPT/HCPCS codes can be billed together
 * - **MUE**: Look up Medically Unlikely Edit limits for HCPCS codes
 * - **PFS/RVU**: Look up Physician Fee Schedule and Relative Value Units
 * - **Coverage**: Check LCD/NCD coverage determinations for HCPCS codes
 *
 * All claims endpoints require the `claims.read` scope.
 *
 * @example
 * ```ts
 * // Check if two codes can be billed together
 * const ncci = await client.claims.validateNcci("99213", "99214");
 * console.log(ncci.data.can_bill_together);
 *
 * // Look up MUE limits
 * const mue = await client.claims.lookupMue("99213");
 * for (const limit of mue.data.limits) {
 *   console.log(`${limit.service_type}: max ${limit.mue_value} units`);
 * }
 *
 * // Look up fee schedule / RVU data
 * const pfs = await client.claims.lookupPfs("99213");
 * console.log(`Payment: $${pfs.data.calculated_payment.non_facility}`);
 *
 * // Check coverage policies
 * const coverage = await client.claims.checkCoverage("99213");
 * console.log(`${coverage.data.policies_found} policies found`);
 * ```
 */
export class ClaimsEndpoint {
  constructor(private readonly http: HttpClient) {}

  // ==========================================================================
  // NCCI PTP Edits
  // ==========================================================================

  /**
   * Validate whether two CPT/HCPCS codes can be billed together.
   *
   * @param code1 - First CPT/HCPCS code (4-5 alphanumeric characters)
   * @param code2 - Second CPT/HCPCS code (4-5 alphanumeric characters)
   * @param options - Optional filters (claim_type)
   * @returns Validation result with edit details and billing summary
   *
   * @example
   * ```ts
   * const result = await client.claims.validateNcci("99213", "99214");
   * if (!result.data.can_bill_together) {
   *   console.log(result.data.summary);
   *   for (const edit of result.data.edits) {
   *     console.log(`${edit.claim_type}: modifier ${edit.modifier_allowed ? "allowed" : "not allowed"}`);
   *   }
   * }
   * ```
   */
  async validateNcci(
    code1: string,
    code2: string,
    options?: NcciValidateOptions
  ): Promise<NcciValidateResponse> {
    const params: Record<string, unknown> = {
      code1: encodeURIComponent(code1),
      code2: encodeURIComponent(code2),
    };
    if (options?.claim_type) {
      params.claim_type = options.claim_type;
    }
    const queryString = this.http.buildSearchQueryString(params);
    return this.http.get<NcciValidateResponse>(`/v1/ncci/validate${queryString}`);
  }

  // ==========================================================================
  // MUE (Medically Unlikely Edits)
  // ==========================================================================

  /**
   * Look up MUE limits for a HCPCS/CPT code.
   *
   * @param hcpcs - HCPCS/CPT code (4-5 alphanumeric characters)
   * @param options - Optional filters (service_type)
   * @returns MUE limit data including max units per service type
   *
   * @example
   * ```ts
   * const mue = await client.claims.lookupMue("99213");
   * for (const limit of mue.data.limits) {
   *   console.log(`${limit.service_type}: max ${limit.mue_value} units`);
   * }
   * ```
   */
  async lookupMue(
    hcpcs: string,
    options?: MueLookupOptions
  ): Promise<MueLookupResponse> {
    const params: Record<string, unknown> = {};
    if (options?.service_type) {
      params.service_type = options.service_type;
    }
    const queryString = this.http.buildSearchQueryString(params);
    return this.http.get<MueLookupResponse>(
      `/v1/mue/${encodeURIComponent(hcpcs)}${queryString}`
    );
  }

  /**
   * Batch MUE lookup for multiple HCPCS codes.
   *
   * @param codes - Array of HCPCS/CPT codes (max 100)
   * @returns Batch results with per-code MUE limits
   *
   * @example
   * ```ts
   * const results = await client.claims.lookupMueMany(["99213", "99214", "99215"]);
   * for (const item of results.results) {
   *   if (item.status === "ok") {
   *     console.log(`${item.hcpcs_code}: ${item.data.limits.length} limits`);
   *   }
   * }
   * ```
   */
  async lookupMueMany(codes: string[]): Promise<MueBatchResponse> {
    return this.http.post<MueBatchResponse>("/v1/mue/_batch", { codes });
  }

  // ==========================================================================
  // PFS/RVU (Physician Fee Schedule / Relative Value Units)
  // ==========================================================================

  /**
   * Look up Physician Fee Schedule and RVU data for a HCPCS/CPT code.
   *
   * @param hcpcs - HCPCS/CPT code (4-5 alphanumeric characters)
   * @returns Fee schedule data including RVU breakdown and calculated payments
   *
   * @example
   * ```ts
   * const pfs = await client.claims.lookupPfs("99213");
   * console.log(`Description: ${pfs.data.description}`);
   * console.log(`Work RVU: ${pfs.data.rvu.work}`);
   * console.log(`Non-facility payment: $${pfs.data.calculated_payment.non_facility}`);
   * console.log(`Facility payment: $${pfs.data.calculated_payment.facility}`);
   * ```
   */
  async lookupPfs(hcpcs: string): Promise<PfsLookupResponse> {
    return this.http.get<PfsLookupResponse>(
      `/v1/pfs/${encodeURIComponent(hcpcs)}`
    );
  }

  /**
   * Batch PFS/RVU lookup for multiple HCPCS codes.
   *
   * @param codes - Array of HCPCS/CPT codes (max 100)
   * @returns Batch results with per-code fee schedule data
   *
   * @example
   * ```ts
   * const results = await client.claims.lookupPfsMany(["99213", "99214", "99215"]);
   * for (const item of results.results) {
   *   if (item.status === "ok") {
   *     console.log(`${item.hcpcs_code}: $${item.data.calculated_payment.non_facility}`);
   *   }
   * }
   * ```
   */
  async lookupPfsMany(codes: string[]): Promise<PfsBatchResponse> {
    return this.http.post<PfsBatchResponse>("/v1/pfs/_batch", { codes });
  }

  // ==========================================================================
  // LCD/NCD Coverage Determination
  // ==========================================================================

  /**
   * Check LCD/NCD coverage determinations linked to a HCPCS code.
   *
   * @param hcpcs - HCPCS/CPT code (4-5 alphanumeric characters)
   * @param options - Optional filters (active only)
   * @returns Coverage policies linked to the code
   *
   * @example
   * ```ts
   * const coverage = await client.claims.checkCoverage("99213");
   * console.log(`${coverage.data.policies_found} policies found`);
   * for (const policy of coverage.data.policies) {
   *   console.log(`${policy.display_id}: ${policy.policy_title} [${policy.status}]`);
   * }
   * ```
   */
  async checkCoverage(
    hcpcs: string,
    options?: CoverageCheckOptions
  ): Promise<CoverageCheckResponse> {
    const params: Record<string, unknown> = {
      hcpcs: encodeURIComponent(hcpcs),
    };
    if (options?.active !== undefined) {
      params.active = options.active.toString();
    }
    const queryString = this.http.buildSearchQueryString(params);
    return this.http.get<CoverageCheckResponse>(`/v1/coverage/check${queryString}`);
  }
}
