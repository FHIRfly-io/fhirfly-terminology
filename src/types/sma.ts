// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
/**
 * SMA Endpoint Directory API types.
 *
 * Types for looking up state Medicaid agency FHIR endpoint implementation
 * status, including patient access and provider directory endpoints.
 */

/**
 * Summary of a state's SMA endpoint implementation status.
 */
export interface SmaStateSummary {
  /** State identifier (e.g., "california") */
  id: string;
  /** State display name (e.g., "California") */
  state: string;
  /** Two-letter abbreviation (e.g., "CA") or null for territories */
  abbreviation: string | null;
  /** Whether the state has implemented FHIR endpoints */
  is_implemented: boolean;
  /** API vendor (e.g., "Epic") or null */
  api_vendor: string | null;
  /** Patient access API status */
  patient_access_status: string | null;
  /** Provider directory API status */
  provider_directory_status: string | null;
  /** Number of production endpoint URLs */
  production_url_count: number;
  /** FHIR version (e.g., "R4") */
  fhir_version: string | null;
}

/**
 * Response metadata for SMA lookups.
 */
export interface SmaMetaResponse {
  /** Timestamp of when data was last updated */
  data_as_of: string;
  /** Data source name */
  source: string;
  /** URL to the source data */
  source_url: string;
}

/**
 * List of states with SMA endpoint implementation status.
 */
export interface SmaStatesListResponse {
  /** Array of state summaries */
  states: SmaStateSummary[];
  /** Total number of states returned */
  total: number;
  /** Response metadata */
  meta: SmaMetaResponse;
}

/**
 * Full detail for a single state's SMA endpoint implementation.
 */
export interface SmaStateDetailResponse {
  /** State identifier (e.g., "california") */
  id: string;
  /** State display name */
  state: string;
  /** Two-letter abbreviation or null */
  abbreviation: string | null;
  /** API vendor or null */
  api_vendor: string | null;
  /** Date of most recent survey or null */
  survey_date: string | null;
  /** Whether FHIR endpoints are implemented */
  is_implemented: boolean;
  /** Patient access API details */
  patient_access: {
    status: string | null;
    implementation_date: string | null;
    fhir_version: string | null;
    auth_protocol: string | null;
    refresh_frequency: string | null;
    endpoints: {
      claims: string[];
      pdex: string[];
      formulary: string[];
      chip: string[];
      capability_statement: string[];
      sandbox: string[];
    };
  };
  /** Provider directory API details */
  provider_directory: {
    status: string | null;
    implementation_date: string | null;
    fhir_version: string | null;
    is_public: boolean | null;
    refresh_frequency: string | null;
    endpoints: {
      production: string[];
      capability_statement: string[];
      sandbox: string[];
    };
  };
  /** Contact information */
  contacts: {
    member_phone: string | null;
    member_email: string | null;
    developer_contact: string | null;
    pd_developer_contact: string | null;
    registration_info: string | null;
    pd_registration_info: string | null;
  };
  /** All production endpoint URLs */
  all_production_urls: string[];
  /** Response metadata (includes ingested_at) */
  meta: SmaMetaResponse & { ingested_at: string };
}

/**
 * Aggregate statistics across all SMA endpoint implementations.
 */
export interface SmaStatsResponse {
  /** Summary counts */
  summary: {
    total_states: number;
    implemented: number;
    not_implemented: number;
    total_production_urls: number;
  };
  /** Counts by API vendor */
  by_vendor: Record<string, number>;
  /** Counts by patient access status */
  by_patient_access_status: Record<string, number>;
  /** Counts by FHIR version */
  by_fhir_version: Record<string, number>;
  /** Counts by authentication protocol */
  by_auth_protocol: Record<string, number>;
  /** Provider directory statistics */
  provider_directory: {
    total_with_pd: number;
    by_status: Record<string, number>;
  };
  /** Response metadata */
  meta: SmaMetaResponse;
}
