// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.

export interface DdiIngredient {
  rxcui: string;
  name: string;
  tty: string;
}

export interface DdiDrugClassEntry {
  class_id: string;
  class_name: string;
  class_type: string;
  source: string;
}

export interface DdiDrugInfo {
  rxcui: string;
  name: string;
  tty: string | null;
  brand_names: string[];
  generic_name: string[];
  substance_name: string[];
  pharm_class_epc: string[];
  ingredients: DdiIngredient[];
  drug_classes: DdiDrugClassEntry[];
}

export interface DdiLabelInfo {
  spl_id: string;
  set_id: string;
  sections: Record<string, string[]>;
  dailymed_url: string;
}

export interface DdiLegalInfo {
  license: string;
  attribution_required: boolean;
  sources: Array<{ name: string; url: string }>;
  disclaimer: string;
}

export interface DdiMeta {
  legal: DdiLegalInfo;
}

export interface DdiReferenceResponse {
  data: {
    drug: DdiDrugInfo;
    label: DdiLabelInfo;
  };
  meta: DdiMeta;
}

export interface DdiDrugResult {
  input: string;
  status: "ok" | "not_found" | "invalid";
  drug?: DdiDrugInfo;
  label?: DdiLabelInfo;
  error?: string;
}

export interface DdiBatchResponse {
  count: number;
  drugs: DdiDrugResult[];
  meta: DdiMeta;
}

