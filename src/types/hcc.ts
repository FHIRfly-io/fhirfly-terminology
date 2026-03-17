// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.

/**
 * FHIR coding representation for HCC.
 */
export interface HccFhirCoding {
  system: string;
  code: string;
  display?: string;
}

/**
 * ETL ingest tracking metadata for HCC.
 */
export interface HccIngest {
  source: string;
  file_tag: string;
  etl_version: string;
  run_id: string;
  first_seen: string;
  last_seen: string;
  is_current: boolean;
}

/**
 * HCC crosswalk lookup result - compact shape.
 * Minimal data for lists, autocomplete.
 */
export interface HccCompact {
  icd10_code: string;
  cc_number: number;
  model_version: string;
  model_type: string;
}

/**
 * HCC crosswalk lookup result - standard shape.
 * Core structured data for most API integrations.
 */
export interface HccStandard extends HccCompact {
  payment_year: string;
  release_type: string;
  mapping_source: string;
  fhir_coding: HccFhirCoding;
}

/**
 * HCC crosswalk lookup result - full shape.
 * Complete data with provenance for AI agents.
 */
export interface HccFull extends HccStandard {
  ingest: HccIngest;
}

/**
 * HCC response type based on shape.
 */
export type HccData = HccCompact | HccStandard | HccFull;

/**
 * HCC reverse lookup result.
 * Returns ICD-10 codes that map to a given HCC category.
 */
export interface HccReverseResult {
  cc_number: number;
  model_version: string;
  model_type: string;
  icd10_codes: string[];
}

/**
 * HCC search parameters.
 */
export interface HccSearchParams {
  /** General text search */
  q?: string;
  /** Filter by model version (e.g., "V28", "V24") */
  model_version?: string;
  /** Filter by model type (e.g., "CMS-HCC", "RxHCC") */
  model_type?: string;
  /** Filter by condition category number */
  cc_number?: number;
  /** Filter by payment year */
  payment_year?: string;
  /** Sort order: "relevance", "cc_number", "icd10_code" */
  sort?: "relevance" | "cc_number" | "icd10_code";
}
