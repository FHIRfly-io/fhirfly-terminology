import type { DisplayField } from "./common.js";

/**
 * MVX vaccine manufacturer lookup result - compact shape.
 */
export interface MvxCompact extends DisplayField {
  mvx_code: string;
  manufacturer_name: string;
}

/**
 * MVX vaccine manufacturer lookup result - standard shape.
 */
export interface MvxStandard extends MvxCompact {
  notes?: string;
  status: "Active" | "Inactive";
  last_updated?: string;
}

/**
 * MVX vaccine manufacturer lookup result - full shape.
 */
export interface MvxFull extends MvxStandard {
  vaccines?: Array<{
    cvx_code: string;
    vaccine_name: string;
  }>;
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
