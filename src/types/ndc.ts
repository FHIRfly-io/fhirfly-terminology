import type { DisplayField } from "./common.js";
import type { SnomedEnrichmentStandard, SnomedEnrichmentFull } from "./snomed.js";

/**
 * Active ingredient in a drug product.
 */
export interface ActiveIngredient {
  name: string;
  strength?: string;
  unit?: string;
}

/**
 * Packaging information for an NDC.
 */
export interface NdcPackaging {
  ndc: string;
  description?: string;
  package_ndc?: string;
}

/**
 * NDC lookup result - compact shape.
 */
export interface NdcCompact extends DisplayField {
  ndc: string;
  ndc11: string;
  product_name: string;
  labeler_name: string;
}

/**
 * NDC lookup result - standard shape.
 */
export interface NdcStandard extends NdcCompact {
  generic_name?: string;
  dosage_form?: string;
  route?: string;
  active_ingredients: ActiveIngredient[];
  dea_schedule?: string;
  marketing_status?: string;
  /** SNOMED CT mappings (derived via RxNorm, added by enrichment) */
  snomed?: SnomedEnrichmentStandard[];
}

/**
 * NDC lookup result - full shape.
 */
export interface NdcFull extends Omit<NdcStandard, "snomed"> {
  application_number?: string;
  product_type?: string;
  marketing_start_date?: string;
  marketing_end_date?: string;
  listing_expiration_date?: string;
  pharm_class?: string[];
  packaging?: NdcPackaging[];
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
