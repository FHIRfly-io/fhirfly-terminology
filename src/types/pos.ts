// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import type { DisplayField } from "./common.js";

export interface PosFhirCoding {
  system: string;
  code: string;
  display?: string;
}

export interface PosCompact extends DisplayField {
  code: string;
  name: string;
}

export interface PosStandard extends PosCompact {
  description: string;
  fhir_coding: PosFhirCoding;
}

export interface PosFull extends PosStandard {
  _meta: { ingested_at: string; source: string };
  ingest: { run_id: string; ingested_at: string };
}

export type PosData = PosCompact | PosStandard | PosFull;

export interface PosListResponse {
  count: number;
  data: PosData[];
  meta: { legal: { license: string; attribution_required: boolean; source_name: string } };
}
