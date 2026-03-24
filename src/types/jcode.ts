// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.

export interface JcodeNdcEntry {
  ndc: string;
  ndc_hyphenated: string;
  drug_name: string;
  labeler_name: string;
  hcpcs_dosage: string;
  pkg_size: number | null;
  pkg_qty: number | null;
  bill_units: number | null;
  bill_units_pkg: number | null;
}

export interface JcodeByHcpcsResponse {
  hcpcs_code: string;
  hcpcs_description: string;
  ndc_count: number;
  entries: JcodeNdcEntry[];
  meta: JcodeMeta;
}

export interface JcodeByNdcHcpcsEntry {
  hcpcs_code: string;
  hcpcs_description: string;
  drug_name: string;
  hcpcs_dosage: string;
  bill_units: number | null;
}

export interface JcodeByNdcResponse {
  ndc: string;
  ndc_hyphenated: string;
  hcpcs_codes: JcodeByNdcHcpcsEntry[];
  meta: JcodeMeta;
}

export interface JcodeMeta {
  source?: { name: string; url?: string };
  legal: { license: string; attribution_required: boolean; source_name: string; citation: string };
}
