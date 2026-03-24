// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import type { DisplayField } from "./common.js";

export interface MsdrgFhirCoding {
  system: string;
  code: string;
  display?: string;
}

export interface MsdrgCompact extends DisplayField {
  drg_code: string;
  title: string | null;
  mdc: string | null;
  type: string | null;
}

export interface MsdrgStandard extends MsdrgCompact {
  weight: number | null;
  geometric_mean_los: number | null;
  arithmetic_mean_los: number | null;
  post_acute_drg: boolean | null;
  special_pay_drg: boolean | null;
  fiscal_year: number | null;
  fhir_coding: MsdrgFhirCoding;
}

export interface MsdrgFull extends MsdrgStandard {
  weight_before_cap: number | null;
  _meta: { ingested_at: string; source: string; source_file: string };
  ingest: { run_id: string; ingested_at: string; source_file: string };
}

export type MsdrgData = MsdrgCompact | MsdrgStandard | MsdrgFull;

export interface MsdrgSearchParams {
  q?: string;
  mdc?: string;
  type?: string;
  sort?: "relevance" | "code" | "title";
}
