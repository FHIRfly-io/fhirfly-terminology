// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import type { DisplayField } from "./common.js";
import type { SnomedEnrichmentStandard, SnomedEnrichmentFull } from "./snomed.js";

/**
 * Active ingredient in a drug product (full shape only).
 */
export interface ActiveIngredient {
  name: string;
  strength: string | null;
  unit: string | null;
}

/**
 * NDC type: product-level or package-level.
 */
export type NdcType = "package" | "product";

/**
 * NDC lookup result - compact shape.
 * Minimal data for lists, autocomplete, search results.
 */
export interface NdcCompact extends DisplayField {
  ndc: string;
  type: NdcType;
  name: string;
  generic: string | null;
  labeler: string | null;
  active: boolean;
}

/**
 * NDC lookup result - standard shape.
 * Core structured data for most API integrations.
 */
export interface NdcStandard extends DisplayField {
  ndc: string;
  type: NdcType;
  /** Package-specific: hyphenated 5-4-2 NDC */
  ndc11_hyph?: string;
  /** Package-specific: parent product NDC */
  product_ndc?: string;
  /** Package-specific: package description */
  package_description?: string;
  brand_name: string | null;
  generic_name: string | null;
  labeler_name: string | null;
  dosage_form: string | null;
  route: string[] | null;
  strength: string | null;
  rxcui: string[];
  is_active: boolean;
  /** SNOMED CT mappings (derived via RxNorm, added by enrichment) */
  snomed?: SnomedEnrichmentStandard[];
}

/**
 * NDC lookup result - full shape.
 * Complete data with provenance for AI agents and auditing.
 */
export interface NdcFull extends DisplayField {
  ndc: string;
  type: NdcType;
  /** Package-specific: hyphenated 5-4-2 NDC */
  ndc11_hyph?: string;
  /** Package-specific: parent product NDC */
  product_ndc?: string;
  /** Package-specific: package description */
  package_description?: string;
  brand_name: string | null;
  generic_name: string | null;
  labeler_name: string | null;
  dosage_form: string | null;
  route: string[] | null;
  strength: string | null;
  rxcui: string[];
  is_active: boolean;
  marketing_category: string | null;
  application_number: string | null;
  product_type: string | null;
  listing_expiration_date: string | null;
  is_generic: boolean;
  generic_basis: string[];
  active_ingredients: ActiveIngredient[];
  pharm_class: string[];
  dea_schedule: string | null;
  /** SNOMED CT mappings with FHIR coding (derived via RxNorm, added by enrichment) */
  snomed?: SnomedEnrichmentFull[];
}

/**
 * NDC response type based on shape.
 */
export type NdcData = NdcCompact | NdcStandard | NdcFull;

/**
 * NDC search parameters.
 */
export interface NdcSearchParams {
  /** General text search across product names */
  q?: string;
  /** Search by product name */
  name?: string;
  /** Search by brand name */
  brand?: string;
  /** Search by generic name */
  generic?: string;
  /** Search by active ingredient */
  ingredient?: string;
  /** Filter by strength (e.g., "200mg", "10mg/5ml") */
  strength?: string;
  /** Filter by dosage form (e.g., "TABLET", "CAPSULE") */
  dosage_form?: string;
  /** Filter by administration route */
  route?: string;
  /** Filter by labeler/manufacturer name */
  labeler?: string;
  /** Filter by product type: "otc", "rx", or "all" */
  product_type?: "otc" | "rx" | "all";
  /** Filter by DEA schedule: "ci", "cii", "ciii", "civ", "cv", "none" */
  dea_schedule?: "ci" | "cii" | "ciii" | "civ" | "cv" | "none";
  /** Filter by marketing category */
  marketing_category?: string;
  /** Filter by pharmacologic class */
  pharm_class?: string;
  /** Filter by active status */
  is_active?: boolean;
  /** Filter by RxNorm linkage */
  has_rxcui?: boolean;
  /** Filter by specific RxNorm CUI */
  rxcui?: string;
  /** Sort order: "relevance", "name", "labeler" */
  sort?: "relevance" | "name" | "labeler";
}
