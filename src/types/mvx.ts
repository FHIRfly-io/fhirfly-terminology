import type { DisplayField } from "./common.js";

/**
 * FHIR coding representation for MVX.
 */
export interface MvxFhirCoding {
  system: string;
  code: string;
  display: string;
}

/**
 * ETL ingest tracking metadata.
 */
export interface MvxIngest {
  source: string;
  file_tag: string;
  etl_version: string;
  run_id: string;
  first_seen: string;
  last_seen: string;
  is_current: boolean;
  was_removed: boolean;
  removed_at: string | null;
  removed_file_tag: string | null;
}

/**
 * MVX vaccine manufacturer lookup result - compact shape.
 * Minimal data for lists, autocomplete.
 */
export interface MvxCompact extends DisplayField {
  code: string;
  display: string;
  status: string;
}

/**
 * MVX vaccine manufacturer lookup result - standard shape.
 * Core structured data for most API integrations.
 */
export interface MvxStandard extends DisplayField {
  code: string;
  code_system: string;
  display: string;
  status: string;
  manufacturer_name: string;
  notes: string | null;
  last_updated_by_cdc: string | null;
  fhir_coding: MvxFhirCoding;
}

/**
 * MVX vaccine manufacturer lookup result - full shape.
 * Complete data with provenance for AI agents.
 */
export interface MvxFull extends DisplayField {
  code: string;
  code_system: string;
  display: string;
  status: string;
  manufacturer_name: string;
  notes: string | null;
  last_updated_by_cdc: string | null;
  fhir_coding: MvxFhirCoding;
  ingest: MvxIngest;
}

/**
 * MVX response type based on shape.
 */
export type MvxData = MvxCompact | MvxStandard | MvxFull;

/**
 * MVX search parameters.
 */
export interface MvxSearchParams {
  /** General text search */
  q?: string;
  /** Filter by status: "active", "inactive" */
  status?: string;
  /** Sort order: "relevance", "name", "code" */
  sort?: "relevance" | "name" | "code";
}
