import type { DisplayField } from "./common.js";

/**
 * FDA Label lookup result - compact shape.
 */
export interface FdaLabelCompact extends DisplayField {
  set_id: string;
  product_name: string;
  labeler_name: string;
}

/**
 * FDA Label lookup result - standard shape.
 */
export interface FdaLabelStandard extends FdaLabelCompact {
  version?: number;
  effective_time?: string;
  product_type?: string;
  route?: string[];
  substance_name?: string[];
  indications_and_usage?: string;
  dosage_and_administration?: string;
}

/**
 * FDA Label lookup result - full shape.
 */
export interface FdaLabelFull extends FdaLabelStandard {
  spl_id?: string;
  document_type?: string;
  warnings?: string;
  precautions?: string;
  contraindications?: string;
  adverse_reactions?: string;
  drug_interactions?: string;
  overdosage?: string;
  clinical_pharmacology?: string;
  mechanism_of_action?: string;
  pharmacodynamics?: string;
  pharmacokinetics?: string;
  how_supplied?: string;
  storage_and_handling?: string;
  boxed_warning?: string;
  pregnancy?: string;
  nursing_mothers?: string;
  pediatric_use?: string;
  geriatric_use?: string;
}

/**
 * FDA Label response type based on shape.
 */
export type FdaLabelData = FdaLabelCompact | FdaLabelStandard | FdaLabelFull;

/**
 * FDA Label search parameters.
 */
export interface FdaLabelSearchParams {
  /** General text search */
  q?: string;
  /** Search by product name */
  name?: string;
  /** Search by brand name */
  brand?: string;
  /** Search by generic name */
  generic?: string;
  /** Search by active substance/ingredient */
  substance?: string;
  /** Search by manufacturer name */
  manufacturer?: string;
  /** Filter by product type: "otc", "rx", "cellular" */
  product_type?: "otc" | "rx" | "cellular";
  /** Filter by administration route */
  route?: string;
  /** Filter by pharmacologic class */
  pharm_class?: string;
  /** Filter by RxNorm linkage */
  has_rxcui?: boolean;
  /** Filter by specific RxCUI */
  rxcui?: string;
  /** Filter by specific NDC */
  ndc?: string;
  /** Filter by FDA application number */
  application_number?: string;
  /** Filter for current labels only (default: true) */
  is_current?: boolean;
  /** Sort order: "relevance", "name", "manufacturer" */
  sort?: "relevance" | "name" | "manufacturer";
}
