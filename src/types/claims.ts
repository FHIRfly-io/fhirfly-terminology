// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.

/**
 * Claim type for NCCI PTP edits.
 */
export type NcciClaimType = "practitioner" | "hospital";

/**
 * MUE service type.
 */
export type MueServiceType = "practitioner" | "outpatient_hospital" | "dme";

/**
 * Coverage policy type.
 */
export type CoveragePolicyType = "lcd" | "ncd";

/**
 * Legal information for claims responses.
 */
export interface ClaimsLegalInfo {
  license: string;
  attribution_required: boolean;
  source_name: string;
  citation: string;
}

/**
 * Metadata included in claims API responses.
 */
export interface ClaimsMeta {
  source: {
    name: string;
    quarter?: string;
    url?: string;
  };
  legal: ClaimsLegalInfo;
}

// ============================================================================
// NCCI PTP Edits
// ============================================================================

/**
 * Individual NCCI PTP edit result.
 */
export interface NcciEditItem {
  claim_type: NcciClaimType;
  modifier_indicator: string;
  modifier_allowed: boolean;
  effective_date: string | null;
  is_active: boolean;
  rationale: string;
}

/**
 * NCCI PTP validation data.
 */
export interface NcciValidateData {
  code1: string;
  code2: string;
  can_bill_together: boolean;
  edits: NcciEditItem[];
  summary: string;
}

/**
 * NCCI PTP validation response.
 */
export interface NcciValidateResponse {
  data: NcciValidateData;
  meta: ClaimsMeta;
}

// ============================================================================
// MUE (Medically Unlikely Edits)
// ============================================================================

/**
 * Individual MUE limit entry.
 */
export interface MueLimitItem {
  hcpcs_code: string;
  service_type: string;
  mue_value: number;
  adjudication_indicator: number;
  adjudication_indicator_display: string;
  rationale: string;
}

/**
 * MUE lookup data.
 */
export interface MueLookupData {
  hcpcs_code: string;
  limits: MueLimitItem[];
}

/**
 * MUE single lookup response.
 */
export interface MueLookupResponse {
  data: MueLookupData;
  meta: ClaimsMeta;
}

/**
 * MUE batch result item.
 */
export interface MueBatchResultItem {
  input: string;
  hcpcs_code: string;
  status: "ok" | "not_found" | "invalid";
  data?: MueLookupData;
  error?: string;
}

/**
 * MUE batch response.
 */
export interface MueBatchResponse {
  count: number;
  results: MueBatchResultItem[];
  meta: { legal: ClaimsLegalInfo };
}

// ============================================================================
// PFS/RVU (Physician Fee Schedule / Relative Value Units)
// ============================================================================

/**
 * RVU breakdown values.
 */
export interface PfsRvu {
  work: number;
  pe_non_facility: number;
  pe_facility: number;
  mp: number;
  total_non_facility: number;
  total_facility: number;
}

/**
 * Calculated payment amounts.
 */
export interface PfsPayment {
  non_facility: number;
  facility: number;
}

/**
 * PFS billing indicators.
 */
export interface PfsIndicators {
  global_days: string | null;
  multiple_surgery: string | null;
  bilateral_surgery: string | null;
}

/**
 * PFS/RVU lookup data for a single HCPCS code.
 */
export interface PfsLookupData {
  hcpcs_code: string;
  description: string;
  status_code: string;
  rvu: PfsRvu;
  conversion_factor: number;
  calculated_payment: PfsPayment;
  indicators: PfsIndicators;
}

/**
 * PFS single lookup response.
 */
export interface PfsLookupResponse {
  data: PfsLookupData;
  meta: ClaimsMeta;
}

/**
 * PFS batch result item.
 */
export interface PfsBatchResultItem {
  input: string;
  hcpcs_code: string;
  status: "ok" | "not_found" | "invalid";
  data?: PfsLookupData;
  error?: string;
}

/**
 * PFS batch response.
 */
export interface PfsBatchResponse {
  count: number;
  results: PfsBatchResultItem[];
  meta: { legal: ClaimsLegalInfo };
}

// ============================================================================
// LCD/NCD Coverage Determination
// ============================================================================

/**
 * Individual coverage policy item.
 */
export interface CoverageCheckItem {
  policy_type: CoveragePolicyType;
  policy_id: string;
  display_id: string;
  policy_title: string;
  hcpcs_description: string;
  status: string;
  is_active: boolean;
  effective_date: string | null;
}

/**
 * Coverage check data.
 */
export interface CoverageCheckData {
  hcpcs_code: string;
  policies_found: number;
  policies: CoverageCheckItem[];
  summary: string;
}

/**
 * Coverage check response.
 */
export interface CoverageCheckResponse {
  data: CoverageCheckData;
  meta: ClaimsMeta;
}
