import type { DisplayField } from "./common.js";

/**
 * LOINC lookup result - compact shape.
 */
export interface LoincCompact extends DisplayField {
  loinc_num: string;
  long_common_name: string;
  component: string;
}

/**
 * LOINC lookup result - standard shape.
 */
export interface LoincStandard extends LoincCompact {
  short_name?: string;
  class?: string;
  class_type?: number;
  property?: string;
  time_aspect?: string;
  system?: string;
  scale_type?: string;
  method_type?: string;
  status?: string;
  order_obs?: string;
}

/**
 * LOINC lookup result - full shape.
 */
export interface LoincFull extends LoincStandard {
  definition_description?: string;
  consumer_name?: string;
  survey_question_text?: string;
  survey_question_source?: string;
  units_required?: string;
  submitted_units?: string;
  related_names_2?: string;
  example_units?: string;
  example_ucum_units?: string;
  example_si_ucum_units?: string;
  status_reason?: string;
  status_text?: string;
  change_reason_public?: string;
  common_test_rank?: number;
  common_order_rank?: number;
  hl7_field_subfield_id?: string;
  external_copyright_notice?: string;
  panel_type?: string;
  ask_at_order_entry?: string;
  associated_observations?: string;
  version_first_released?: string;
  version_last_changed?: string;
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
