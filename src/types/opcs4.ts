// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import type { DisplayField } from "./common.js";

/**
 * FHIR coding representation for OPCS-4.
 */
export interface Opcs4FhirCoding {
  system: string;
  code: string;
  display?: string;
}

/**
 * OPCS-4 structural hierarchy information.
 */
export interface Opcs4Structure {
  chapter: {
    code: string;
    title: string;
  };
  category: string;
}

/**
 * Legal/licensing information for OPCS-4.
 */
export interface Opcs4Legal {
  license: string;
  copyright: string;
  attribution: string;
}

/**
 * ETL ingest tracking metadata for OPCS-4.
 */
export interface Opcs4Ingest {
  source: string;
  file_tag: string;
  etl_version: string;
  run_id: string;
  first_seen: string;
  last_seen: string;
  is_current: boolean;
}

/**
 * OPCS-4 procedure code lookup result - compact shape.
 * Minimal data for lists, autocomplete.
 */
export interface Opcs4Compact extends DisplayField {
  code: string;
  code_system: "OPCS-4";
  display: string;
}

/**
 * OPCS-4 procedure code lookup result - standard shape.
 * Core structured data for most API integrations.
 */
export interface Opcs4Standard extends Opcs4Compact {
  system: string;
  version: string;
  structure: Opcs4Structure;
  fhir_coding: Opcs4FhirCoding;
  effective_date: string;
}

/**
 * OPCS-4 procedure code lookup result - full shape.
 * Complete data with provenance for AI agents.
 */
export interface Opcs4Full extends Opcs4Standard {
  legal: Opcs4Legal;
  ingest: Opcs4Ingest;
}

/**
 * OPCS-4 response type based on shape.
 */
export type Opcs4Data = Opcs4Compact | Opcs4Standard | Opcs4Full;

/**
 * OPCS-4 search parameters.
 */
export interface Opcs4SearchParams {
  /** General text search */
  q?: string;
  /** Filter by chapter code */
  chapter?: string;
  /** Filter by category */
  category?: string;
  /** Sort order: "relevance", "code", "display" */
  sort?: "relevance" | "code" | "display";
}
