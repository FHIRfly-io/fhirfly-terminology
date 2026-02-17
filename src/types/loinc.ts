// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import type { DisplayField } from "./common.js";

/**
 * LOINC semantic axis parts.
 */
export interface LoincParts {
  component: string | null;
  property: string | null;
  time_aspct: string | null;
  system: string | null;
  scale_typ: string | null;
  method_typ: string | null;
}

/**
 * LOINC example unit information.
 */
export interface LoincUnits {
  example_units: string | null;
  example_ucum_units: string | null;
}

/**
 * LOINC FHIR coding representation.
 */
export interface LoincFhirCoding {
  system: string;
  code: string;
  display: string;
}

/**
 * Ranking information for common tests/orders.
 */
export interface LoincRanks {
  common_test_rank: number | null;
  common_order_rank: number | null;
}

/**
 * Source organization and copyright info.
 */
export interface LoincSourceOrg {
  external_copyright_notice: string | null;
  external_copyright_link: string | null;
  org_name: string | null;
  org_terms_of_use: string | null;
  org_url: string | null;
}

/**
 * LOINC lookup result - compact shape.
 * Minimal data for lists, autocomplete, search results.
 */
export interface LoincCompact extends DisplayField {
  code: string;
  display_name: string;
  shortname: string | null;
  class: string | null;
  component: string | null;
}

/**
 * LOINC lookup result - standard shape.
 * Core structured data for most API integrations.
 */
export interface LoincStandard extends DisplayField {
  code: string;
  display_name: string;
  shortname: string | null;
  long_name: string | null;
  class: string | null;
  status: string;
  order_obs: string | null;
  parts: LoincParts;
  units: LoincUnits;
  map_to: string[];
  fhir_coding: LoincFhirCoding;
}

/**
 * LOINC lookup result - full shape.
 * Complete data with provenance for AI agents.
 */
export interface LoincFull extends DisplayField {
  code: string;
  display_name: string;
  shortname: string | null;
  long_name: string | null;
  consumer_name: string | null;
  class: string | null;
  classtype: number | null;
  status: string;
  status_reason: string | null;
  order_obs: string | null;
  parts: LoincParts;
  units: LoincUnits;
  map_to: string[];
  map_to_comment: string | null;
  fhir_coding: LoincFhirCoding;
  version: string;
  version_first_released: string | null;
  version_last_changed: string | null;
  ranks: LoincRanks;
  source_org: LoincSourceOrg;
}

/**
 * LOINC response type based on shape.
 */
export type LoincData = LoincCompact | LoincStandard | LoincFull;

/**
 * LOINC search parameters.
 */
export interface LoincSearchParams {
  /** General text search */
  q?: string;
  /** Search by component name */
  component?: string;
  /** Filter by LOINC class (e.g., "CHEM", "HEM/BC") */
  class?: string;
  /** Filter by specimen/system type (e.g., "Bld", "Ser", "Urine") */
  system?: string;
  /** Filter by property */
  property?: string;
  /** Filter by scale type: "Qn", "Ord", "Nom", "Nar", etc. */
  scale?: string;
  /** Filter by method */
  method?: string;
  /** Filter by order/observation type: "Order", "Observation", "Both" */
  order_obs?: string;
  /** Filter by status: "ACTIVE", "DEPRECATED", "DISCOURAGED", etc. */
  status?: string;
  /** Sort order: "relevance", "name", "code" */
  sort?: "relevance" | "name" | "code";
}
