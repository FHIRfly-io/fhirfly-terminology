/**
 * FDA Label metadata returned in API responses.
 */
export interface FdaLabelMetadata {
  id: string;
  set_id: string;
  version: string;
  effective_time: string;
  brand_name: string[];
  generic_name: string[];
  manufacturer_name: string[];
  product_ndc: string[];
  package_ndc: string[];
  rxcui: string[];
  product_type: string[];
  route: string[];
  pharm_class_epc: string[];
  available_sections: string[];
}

/**
 * FDA Label data returned from lookup.
 * The API uses a metadata + sections model instead of compact/standard/full shapes.
 */
export interface FdaLabelData {
  metadata: FdaLabelMetadata;
  /** Section content, keyed by section name (e.g., "boxed_warning", "dosage_and_administration") */
  sections?: Record<string, string[]>;
}

/**
 * Known section bundle names for common use cases.
 */
export type FdaLabelBundleName =
  | "safety"
  | "dosing"
  | "interactions"
  | "pregnancy"
  | "ingredients";

/**
 * Options for FDA Label lookup (replaces standard LookupOptions shape).
 */
export interface FdaLabelLookupOptions {
  /** Specific section keys to fetch (e.g., ["boxed_warning", "dosage_and_administration"]) */
  sections?: string[];
  /** Predefined bundle of sections (e.g., "safety", "dosing") */
  bundle?: FdaLabelBundleName;
}

/**
 * FDA Label search result - compact shape (used by search endpoint).
 */
export interface FdaLabelSearchCompact {
  spl_id: string;
  set_id: string;
  brand_name: string | null;
  generic_name: string | null;
  manufacturer: string | null;
  product_type: string | null;
  route: string[];
}

/**
 * FDA Label search result - standard shape (used by search endpoint).
 */
export interface FdaLabelSearchStandard extends FdaLabelSearchCompact {
  substance_name: string[];
  pharm_class_epc: string[];
  rxcui: string[];
  product_ndc: string[];
  application_number: string[];
  effective_time: string;
  version: string;
}

/**
 * FDA Label search result - full shape (used by search endpoint).
 */
export interface FdaLabelSearchFull extends FdaLabelSearchStandard {
  pharm_class_moa: string[];
  pharm_class_pe: string[];
  pharm_class_cs: string[];
  package_ndc: string[];
  unii: string[];
  nui: string[];
}

/**
 * FDA Label search result type.
 */
export type FdaLabelSearchData =
  | FdaLabelSearchCompact
  | FdaLabelSearchStandard
  | FdaLabelSearchFull;

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
