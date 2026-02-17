import type { DisplayField } from "./common.js";
import type { SnomedEnrichmentStandard, SnomedEnrichmentFull } from "./snomed.js";

/**
 * RxNorm term type (TTY).
 */
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
