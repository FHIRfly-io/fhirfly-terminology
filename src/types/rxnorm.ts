// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import type { DisplayField } from "./common.js";
import type { SnomedEnrichmentStandard, SnomedEnrichmentFull } from "./snomed.js";

/**
 * Drug class entry from RxClass enrichment.
 */
export interface DrugClassEntry {
  class_id: string;
  class_name: string;
  class_type: string;
  source: string;
}

/**
 * Drug contraindication from enrichment.
 */
export interface Contraindication {
  disease_name: string;
  disease_id: string;
  disease_snomed: string | null;
  severity: string | null;
  relationship: string;
  source: string;
}

/**
 * RxNorm term type (TTY).
 */
/**
 * FHIR coding representation for RxNorm.
 */
export interface RxNormFhirCoding {
  system: "http://www.nlm.nih.gov/research/umls/rxnorm";
  code: string;
  display: string;
}

export type RxTermType =
  | "IN"    // Ingredient
  | "PIN"   // Precise Ingredient
  | "MIN"   // Multiple Ingredients
  | "SCDC"  // Semantic Clinical Drug Component
  | "SCDF"  // Semantic Clinical Drug Form
  | "SCDG"  // Semantic Clinical Dose Form Group
  | "SCD"   // Semantic Clinical Drug
  | "GPCK"  // Generic Pack
  | "BN"    // Brand Name
  | "SBDC"  // Semantic Branded Drug Component
  | "SBDF"  // Semantic Branded Drug Form
  | "SBDG"  // Semantic Branded Dose Form Group
  | "SBD"   // Semantic Branded Drug
  | "BPCK"  // Brand Name Pack
  | "PSN"   // Prescribable Name
  | "SY"    // Synonym
  | "TMSY"  // Tall Man Lettering Synonym
  | "DF"    // Dose Form
  | "ET"    // Entry Term
  | "DFG";  // Dose Form Group

/**
 * RxNorm lookup result - compact shape.
 */
export interface RxNormCompact extends DisplayField {
  rxcui: string;
  name: string;
  tty: RxTermType;
}

/**
 * RxNorm lookup result - standard shape.
 */
export interface RxNormStandard extends RxNormCompact {
  synonym?: string;
  suppress?: string;
  language?: string;
  prescribable?: boolean;
  ingredients?: Array<{
    rxcui: string;
    name: string;
  }>;
  /** FHIR coding for this RxNorm concept */
  fhir_coding?: RxNormFhirCoding;
  /** Drug class classifications (added by enrichment) */
  drug_classes?: DrugClassEntry[];
  /** SNOMED CT mappings (added by enrichment) */
  snomed?: SnomedEnrichmentStandard[];
}

/**
 * RxNorm lookup result - full shape.
 */
export interface RxNormFull extends Omit<RxNormStandard, "snomed"> {
  dose_form?: {
    rxcui: string;
    name: string;
  };
  brands?: Array<{
    rxcui: string;
    name: string;
  }>;
  related?: Array<{
    rxcui: string;
    name: string;
    tty: RxTermType;
    relation: string;
  }>;
  ndcs?: string[];
  /** Drug class classifications (added by enrichment) */
  drug_classes?: DrugClassEntry[];
  /** Drug contraindications (added by enrichment, full shape only) */
  contraindications?: Contraindication[];
  /** SNOMED CT mappings with FHIR coding (added by enrichment) */
  snomed?: SnomedEnrichmentFull[];
}

/**
 * RxNorm response type based on shape.
 */
export type RxNormData = RxNormCompact | RxNormStandard | RxNormFull;

/**
 * RxNorm search parameters.
 */
export interface RxNormSearchParams {
  /** General text search */
  q?: string;
  /** Search by drug name */
  name?: string;
  /** Search by ingredient name */
  ingredient?: string;
  /** Search by brand name */
  brand?: string;
  /** Filter by term type(s), comma-separated (e.g., "SCD,SBD") */
  tty?: string;
  /** Filter by prescribable status */
  is_prescribable?: boolean;
  /** Filter by status: "active", "removed", "remapped", "obsolete" */
  status?: string;
  /** Filter by semantic type */
  semantic_type?: string;
  /** Filter by NDC linkage */
  has_ndc?: boolean;
  /** Filter by specific NDC */
  ndc?: string;
  /** Sort order: "relevance", "name" */
  sort?: "relevance" | "name";
}
