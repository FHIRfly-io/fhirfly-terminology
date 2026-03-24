// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import type { DisplayField } from "./common.js";

/**
 * FHIR coding representation for UCUM units.
 */
export interface UcumFhirCoding {
  system: "http://unitsofmeasure.org";
  code: string;
  display: string;
}

/**
 * UCUM unit lookup result - compact shape.
 */
export interface UcumCompact extends DisplayField {
  code: string;
  display: string;
  kind: string;
  property: string;
}

/**
 * UCUM unit lookup result - standard shape.
 */
export interface UcumStandard extends UcumCompact {
  code_system: string;
  metric: boolean;
  is_special: boolean;
  print_symbol: string;
  is_common_clinical: boolean;
  /** FHIR coding for this UCUM unit */
  fhir_coding?: UcumFhirCoding;
}

/**
 * UCUM unit lookup result - full shape.
 */
export interface UcumFull extends UcumStandard {
  class: string | null;
  value: { unit: string | null; factor: number | null } | null;
  ingest: {
    source: string;
    ucum_version: string;
    fhirfly_updated_at: string;
    fhirfly_etl_version: string;
  };
}

/**
 * UCUM response type based on shape.
 */
export type UcumData = UcumCompact | UcumStandard | UcumFull;

/**
 * UCUM search parameters.
 */
export interface UcumSearchParams {
  /** General text search */
  q?: string;
  /** Filter by kind (e.g., "length", "mass", "volume") */
  kind?: string;
  /** Filter by property (e.g., "length", "time", "temperature") */
  property?: string;
  /** Filter to metric units only */
  metric?: boolean;
  /** Filter to common clinical units only */
  is_common_clinical?: boolean;
  /** Sort order: "relevance", "code", "display" */
  sort?: "relevance" | "code" | "display";
}

/**
 * Component of a UCUM expression validation result.
 */
export interface UcumValidateComponent {
  code: string;
  found: boolean;
  resolved_as?: string;
}

/**
 * Result of validating a UCUM expression.
 */
export interface UcumValidateResult {
  valid: boolean;
  expression: string;
  components: UcumValidateComponent[];
  error?: string;
}

/**
 * Result of a UCUM unit conversion.
 */
export interface UcumConvertResult {
  from: { code: string; value: number };
  to: { code: string; value: number };
  factor: number;
}
