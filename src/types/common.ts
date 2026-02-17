/**
 * Response shape options for controlling the level of detail returned.
 */
export type ResponseShape = "compact" | "standard" | "full";

/**
 * Include options for additional data in responses.
 */
export type IncludeOption = "display";

/**
 * Common options for all lookup methods.
 */
export interface LookupOptions {
  /** Response detail level. Default: "standard" */
  shape?: ResponseShape;
  /** Include additional fields like pre-formatted display strings */
  include?: IncludeOption[];
}

/**
 * Common options for batch lookup methods.
 */
export interface BatchLookupOptions extends LookupOptions {
  /** Maximum codes per batch (default: 100, max: 500) */
  batchSize?: number;
}

/**
 * Legal/licensing information included in responses.
 */
export interface LegalInfo {
  license: string;
  attribution?: string;
  source_url?: string;
}

/**
 * Metadata included in all API responses.
 */
export interface ResponseMeta {
  legal: LegalInfo;
  shape: ResponseShape;
  api_version: string;
}

/**
 * Standard API response wrapper.
 */
export interface ApiResponse<T> {
  data: T;
  meta: ResponseMeta;
}

/**
 * Batch response item - success, not found, or invalid input.
 */
export interface BatchResultItem<T> {
  /** The input identifier that was looked up */
  input: string;
  /** Status of the lookup */
  status: "ok" | "not_found" | "invalid";
  /** The data if found */
  data?: T;
  /** Error message if status is "invalid" */
  error?: string;
}

/**
 * Batch response wrapper.
 */
export interface BatchResponse<T> {
  /** Number of items in results */
  count: number;
  /** Batch lookup results */
  results: BatchResultItem<T>[];
  /** Response metadata */
  meta: {
    legal: LegalInfo;
  };
}

/**
 * Display field that may be included when include=display is specified.
 */
export interface DisplayField {
  display?: string;
}

// ============================================================================
// Search Types
// ============================================================================

/**
 * Common options for all search methods.
 */
export interface SearchOptions {
  /** Response detail level. Default: "compact" */
  shape?: ResponseShape;
  /** Include additional fields like pre-formatted display strings */
  include?: IncludeOption[];
  /** Results per page (1-100). Default: 20 */
  limit?: number;
  /** Page number (1-100). Default: 1 */
  page?: number;
}

/**
 * Facet counts in search results.
 */
export type SearchFacets = Record<string, Record<string, number>>;

/**
 * Legal metadata for search results.
 */
export interface SearchLegalInfo {
  license: string;
  source_name: string;
  citation: string;
  attribution_required: boolean;
}

/**
 * Search response wrapper.
 */
export interface SearchResponse<T> {
  /** Search result items */
  items: T[];
  /** Total number of matching results */
  total: number;
  /** Whether total was capped (e.g., at 10,000) */
  total_capped: boolean;
  /** Whether there are more results */
  has_more: boolean;
  /** Current page number */
  page: number;
  /** Results per page */
  limit: number;
  /** Facet counts for filtering */
  facets: SearchFacets;
  /** Legal and attribution metadata */
  meta: {
    legal: SearchLegalInfo;
  };
}
