// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import type { DisplayField } from "./common.js";

/**
 * NDC crosswalk entry for a CVX vaccine code.
 * Returned when `include=crosswalks` is used.
 */
export interface CvxNdcCrosswalk {
  ndc: string;
  ndc11: string;
  product_ndc: string;
  trade_name: string | null;
  manufacturer: string | null;
  begin_date: string | null;
  end_date: string | null;
  source: string;
}

/**
 * CVX vaccine code lookup result - compact shape.
 */
export interface CvxCompact extends DisplayField {
  code: string;
  display: string;
  status: string;
}

/**
 * CVX vaccine code lookup result - standard shape.
 */
export interface CvxStandard extends CvxCompact {
  code_system: string;
  full_vaccine_name: string | null;
  notes?: string | null;
  is_covid_vaccine: boolean;
  vaccine_type: string | null;
  last_updated_by_cdc?: string | null;
  /** NDC crosswalks for this vaccine (included when `include=crosswalks`) */
  crosswalks?: { ndc: CvxNdcCrosswalk[] };
}

/**
 * CVX vaccine code lookup result - full shape.
 */
export interface CvxFull extends CvxStandard {
  short_description: string;
}

/**
 * CVX response type based on shape.
 */
export type CvxData = CvxCompact | CvxStandard | CvxFull;

/**
 * CVX search parameters.
 */
export interface CvxSearchParams {
  /** General text search */
  q?: string;
  /** Filter by status: "active", "inactive" */
  status?: string;
  /** Filter by vaccine type (e.g., "mRNA", "live", "inactivated") */
  vaccine_type?: string;
  /** Filter for COVID-19 vaccines only */
  is_covid_vaccine?: boolean;
  /** Sort order: "relevance", "name", "code" */
  sort?: "relevance" | "name" | "code";
}
