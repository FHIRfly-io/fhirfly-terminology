// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import type { DisplayField } from "./common.js";

/**
 * dm+d concept type in the BNF hierarchy.
 */
export type DmdConceptType = "VTM" | "VMP" | "AMP" | "VMPP" | "AMPP";

/**
 * FHIR coding representation for dm+d.
 */
export interface DmdFhirCoding {
  system: string;
  code: string;
  display: string;
}

/**
 * Legal/licensing information for dm+d.
 */
export interface DmdLegal {
  license: string;
  copyright: string;
  attribution: string;
}

/**
 * ETL ingest tracking metadata for dm+d.
 */
export interface DmdIngest {
  source: string;
  release_id: string;
  version: string;
  run_id: string;
  ingested_at: string;
}

/**
 * Resolved lookup value (code + display).
 */
export interface DmdLookupValue {
  code: string;
  display: string | null;
}

/**
 * Ingredient entry on VMP documents.
 */
export interface DmdIngredient {
  isid?: string;
  name?: string;
  basis_substance?: {
    subid?: string;
    name?: string;
  };
  strength_numerator?: {
    value?: number;
    uom?: DmdLookupValue;
  };
  strength_denominator?: {
    value?: number;
    uom?: DmdLookupValue;
  };
}

/**
 * dm+d concept lookup result - compact shape.
 * Minimal data for lists, autocomplete.
 */
export interface DmdCompact extends DisplayField {
  code: string;
  code_system: "dm+d";
  concept_type: DmdConceptType;
  name: string;
  display: string;
}

/**
 * dm+d concept lookup result - standard shape.
 * Core structured data for most API integrations.
 */
export interface DmdStandard extends DmdCompact {
  status: "valid" | "invalid";
  fhir_coding: DmdFhirCoding;
  /** VMP/AMP parent VTM code */
  vtm_code?: string | null;
  /** AMP/VMPP/AMPP parent VMP code */
  vmp_code?: string | null;
  /** AMPP parent AMP code */
  amp_code?: string | null;
  /** AMPP parent VMPP code */
  vmpp_code?: string;
  /** Drug form (VMP) */
  form?: DmdLookupValue | null;
  /** Multiple drug forms (VMP, if >1) */
  forms?: DmdLookupValue[];
  /** Administration routes (VMP) */
  route?: DmdLookupValue[];
  /** Active ingredients (VMP) */
  ingredients?: DmdIngredient[];
  /** Supplier (AMP) */
  supplier?: DmdLookupValue;
  /** Pack quantity (VMPP) */
  quantity?: { value?: number; uom?: DmdLookupValue };
  /** Prescribing status (VMP) */
  prescribing_status?: DmdLookupValue;
  /** Legal category (AMPP) */
  legal_category?: DmdLookupValue;
  /** Controlled drug status (VMP) */
  controlled_drug?: DmdLookupValue;
  /** Licensed routes (AMP) */
  licensed_routes?: DmdLookupValue[];
}

/**
 * dm+d concept lookup result - full shape.
 * Complete data with provenance for AI agents.
 */
export interface DmdFull extends DmdStandard {
  /** Dose form indicator (VMP) */
  dose_form_indicator?: DmdLookupValue;
  /** Unit dose form size (VMP) */
  unit_dose_form_size?: number;
  /** Unit dose form UOM code (VMP) */
  unit_dose_form_uom_code?: string;
  /** Combination product flag */
  combination_product?: string;
  /** Non-availability date (VMP) */
  non_availability_date?: string;
  /** Licence authority (AMP) */
  licence_auth?: DmdLookupValue;
  /** Abbreviated name (AMP) */
  abbreviated_name?: string;
  /** Tariff information (VMPP) */
  tariff_info?: Record<string, unknown>;
  /** Combination content (VMPP) */
  combo_content?: unknown[];
  /** Combination pack (AMPP) */
  combination_pack?: unknown;
  /** Discontinued date (AMPP) */
  discontinued_date?: string;
  /** Subpack info (AMPP) */
  subpack_info?: unknown;
  /** Reimbursement info (AMPP) */
  reimbursement?: unknown;
  /** Previous code (VTM) */
  previous_code?: string;
  /** Legal/copyright information */
  legal: DmdLegal;
  /** ETL ingest metadata */
  ingest: DmdIngest;
}

/**
 * dm+d response type based on shape.
 */
export type DmdData = DmdCompact | DmdStandard | DmdFull;

/**
 * dm+d search parameters.
 */
export interface DmdSearchParams {
  /** General text search across medicine names */
  q?: string;
  /** Filter by concept type */
  concept_type?: DmdConceptType;
  /** Filter by validity status */
  status?: "valid" | "invalid";
  /** Sort order: "relevance", "code", "name" */
  sort?: "relevance" | "code" | "name";
}
