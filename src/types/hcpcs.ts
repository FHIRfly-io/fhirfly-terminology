// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import type { DisplayField } from "./common.js";

export interface HcpcsFhirCoding {
  system: string;
  code: string;
  display?: string;
}

// Procedure shapes
export interface HcpcsCompact extends DisplayField {
  code: string;
  display: string;
  category: string;
  status_code: string;
}

export interface HcpcsStandard extends HcpcsCompact {
  long_description: string;
  level: string;
  pricing_indicator: string | null;
  coverage_code: string | null;
  action_code: string | null;
  effective_date: string | null;
  termination_date: string | null;
  fhir_coding: HcpcsFhirCoding;
}

export interface HcpcsFull extends HcpcsStandard {
  betos: string | null;
  tos: string | null;
  add_date: string | null;
  _meta: { ingested_at: string; source: string; source_file: string };
  ingest: { run_id: string; ingested_at: string; source_file: string };
}

export type HcpcsData = HcpcsCompact | HcpcsStandard | HcpcsFull;

// Modifier shapes
export interface HcpcsModifierCompact extends DisplayField {
  code: string;
  display: string;
}

export interface HcpcsModifierStandard extends HcpcsModifierCompact {
  long_description: string;
  coverage_code: string | null;
  action_code: string | null;
  status_code: string;
  effective_date: string | null;
}

export interface HcpcsModifierFull extends HcpcsModifierStandard {
  add_date: string | null;
  termination_date: string | null;
  _meta: { ingested_at: string; source: string; source_file: string };
  ingest: { run_id: string; ingested_at: string };
}

export type HcpcsModifierData = HcpcsModifierCompact | HcpcsModifierStandard | HcpcsModifierFull;

// Search params
export interface HcpcsSearchParams {
  q?: string;
  category?: string;
  status_code?: string;
  sort?: "relevance" | "code" | "display";
}
