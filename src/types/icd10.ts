// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import type { DisplayField } from "./common.js";
import type { SnomedEnrichmentStandard, SnomedEnrichmentFull } from "./snomed.js";

/**
 * ICD-10 code type.
 */
export type Icd10Type = "cm" | "pcs";

/**
 * ICD-10 lookup result - compact shape.
 */
export interface Icd10Compact extends DisplayField {
  code: string;
  type: Icd10Type;
  display: string;
}

/**
 * ICD-10 lookup result - standard shape.
 */
export interface Icd10Standard extends Icd10Compact {
  long_description?: string;
  chapter?: string;
  chapter_description?: string;
  section?: string;
  section_description?: string;
  billable?: boolean;
  /** ICD-10-CM specific */
  is_header?: boolean;
  /** ICD-10-PCS specific */
  body_system?: string;
  root_operation?: string;
  /** SNOMED CT mappings (ICD-10-CM only, added by enrichment) */
  snomed?: SnomedEnrichmentStandard[];
}

/**
 * ICD-10 lookup result - full shape.
 */
export interface Icd10Full extends Omit<Icd10Standard, "snomed"> {
  /** ICD-10-CM specific */
  includes?: string[];
  excludes1?: string[];
  excludes2?: string[];
  code_first?: string[];
  use_additional?: string[];
  /** ICD-10-PCS specific */
  approach?: string;
  device?: string;
  qualifier?: string;
  /** Effective dates */
  effective_date?: string;
  end_date?: string;
  /** SNOMED CT mappings with FHIR coding (ICD-10-CM only, added by enrichment) */
  snomed?: SnomedEnrichmentFull[];
}

/**
 * ICD-10 response type based on shape.
 */
export type Icd10Data = Icd10Compact | Icd10Standard | Icd10Full;

/**
 * ICD-10 search parameters.
 */
export interface Icd10SearchParams {
  /** General text search */
  q?: string;
  /** Filter by code system: "CM" (diagnosis) or "PCS" (procedure) */
  code_system?: "CM" | "PCS";
  /** Filter by chapter (CM only) */
  chapter?: string;
  /** Filter by block (CM only) */
  block?: string;
  /** Filter by billable codes only */
  billable?: boolean;
  /** Filter by section (PCS only) */
  section?: string;
  /** Filter by body system (PCS only) */
  body_system?: string;
  /** Filter by root operation (PCS only) */
  root_operation?: string;
  /** Filter by approach (PCS only) */
  approach?: string;
  /** Filter by status */
  status?: string;
  /** Sort order: "relevance", "code", "display" */
  sort?: "relevance" | "code" | "display";
}
