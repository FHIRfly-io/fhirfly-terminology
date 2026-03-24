// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import type { DisplayField, LegalInfo } from "./common.js";

/**
 * FHIR coding representation for RxClass.
 */
export interface RxClassFhirCoding {
  system: string;
  code: string;
  display: string;
}

/**
 * RxClass drug class lookup result - compact shape.
 */
export interface RxClassCompact extends DisplayField {
  class_id: string;
  class_name: string;
  class_type: string;
}

/**
 * RxClass drug class lookup result - standard shape.
 */
export interface RxClassStandard extends RxClassCompact {
  parent_class_id: string | null;
  member_count: number;
  /** FHIR coding for this drug class */
  fhir_coding?: RxClassFhirCoding;
}

/**
 * RxClass drug class lookup result - full shape.
 */
export interface RxClassFull extends RxClassStandard {
  member_rxcuis: string[];
  ingest: {
    source: string;
    fhirfly_updated_at: string;
    fhirfly_etl_version: string;
  };
}

/**
 * RxClass response type based on shape.
 */
export type RxClassData = RxClassCompact | RxClassStandard | RxClassFull;

/**
 * RxClass search parameters.
 */
export interface RxClassSearchParams {
  /** General text search */
  q?: string;
  /** Filter by class type (e.g., "ATC1-4", "EPC", "MOA", "PE", "CHEM") */
  class_type?: string;
  /** Sort order: "relevance", "name" */
  sort?: "relevance" | "name";
}

/**
 * A member drug within an RxClass drug class.
 */
export interface RxClassMember {
  rxcui: string;
  name?: string;
}

/**
 * Response from the RxClass members endpoint.
 */
export interface RxClassMembersResponse {
  class_id: string;
  class_name: string;
  members: RxClassMember[];
  count: number;
  meta: {
    legal: LegalInfo;
  };
}
