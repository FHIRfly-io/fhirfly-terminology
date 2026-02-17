// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
/**
 * IPS (International Patient Set) category.
 * Used to organize SNOMED concepts by their clinical use.
 */
export type IpsCategory =
  | "substance"
  | "product"
  | "condition"
  | "finding"
  | "procedure"
  | "body_structure"
  | "organism"
  | "qualifier"
  | "device"
  | "observable"
  | "specimen"
  | "situation"
  | "event"
  | "environment"
  | "social";

/**
 * SNOMED CT IPS concept lookup result.
 * Unlike other endpoints, SNOMED does not use response shapes (compact/standard/full).
 */
export interface SnomedConcept {
  concept_id: string;
  active: boolean;
  fsn: string | null;
  preferred_term: string | null;
  synonyms: string[] | null;
  ips_category: IpsCategory | null;
  semantic_tag: string | null;
}

/**
 * SNOMED mapping type indicating the semantic relationship.
 */
export type SnomedMappingType = "equivalent" | "broader" | "narrower" | "related";

/**
 * SNOMED mapping source system.
 */
export type SnomedMappingSourceSystem = "rxnorm" | "icd10_cm" | "icd10_pcs" | "ndc";

/**
 * SNOMED mapping source.
 */
export type SnomedMappingSource = "umls-rxnrel" | "snomed-extended-map" | "derived-rxnorm";

/**
 * SNOMED reverse mapping entry.
 */
export interface SnomedReverseMapping {
  source_system: SnomedMappingSourceSystem;
  source_code: string;
  map_type: SnomedMappingType;
  mapping_source: SnomedMappingSource;
}

/**
 * SNOMED reverse mapping lookup result.
 */
export interface SnomedReverseMappingData {
  snomed_code: string;
  snomed_display?: string;
  mappings: SnomedReverseMapping[];
}

/**
 * SNOMED batch result item.
 */
export interface SnomedBatchResultItem {
  input: string;
  concept_id: string;
  status: "ok" | "not_found" | "invalid";
  data?: SnomedConcept;
  error?: string;
}

/**
 * SNOMED IPS search parameters.
 */
export interface SnomedSearchParams {
  /** Text search across preferred terms, FSN, and synonyms */
  q?: string;
  /** Filter by IPS category */
  ips_category?: IpsCategory;
  /** Filter by semantic tag */
  semantic_tag?: string;
  /** Filter by active status (default: true) */
  active?: boolean;
  /** Maximum results (1-500, default 100) */
  limit?: number;
  /** Offset for pagination */
  skip?: number;
}

/**
 * SNOMED categories response.
 */
export interface SnomedCategoriesResponse {
  categories: IpsCategory[];
  description: Record<string, string>;
}

/**
 * SNOMED enrichment mapping (standard shape) as it appears on ICD-10, RxNorm, and NDC responses.
 */
export interface SnomedEnrichmentStandard {
  concept_id: string;
  display?: string;
  map_type: SnomedMappingType;
  map_source: string;
}

/**
 * SNOMED enrichment mapping (full shape) as it appears on ICD-10, RxNorm, and NDC responses.
 */
export interface SnomedEnrichmentFull extends SnomedEnrichmentStandard {
  fsn?: string;
  semantic_tag?: string;
  ips_category?: string;
  source_rxcuis?: string[];
  fhir_coding?: {
    system: "http://snomed.info/sct";
    code: string;
    display?: string;
  };
}
