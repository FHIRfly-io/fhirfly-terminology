/**
 * Connectivity Intelligence API types.
 *
 * Types for looking up FHIR endpoints, Direct addresses, and other
 * connectivity options for healthcare providers by NPI.
 */

/**
 * Provider summary from NPI registry.
 */
export interface ProviderSummary {
  /** Provider name (individual or organization) */
  name: string;
  /** Entity type */
  entity_type: "individual" | "organization" | "unknown";
  /** Primary taxonomy code */
  primary_taxonomy?: string;
  /** Primary taxonomy description */
  primary_taxonomy_desc?: string;
}

/**
 * FHIR-specific metadata for an endpoint.
 */
export interface FhirMetadata {
  /** FHIR version (e.g., "4.0.1") */
  version?: string;
  /** Supported content types (e.g., ["application/fhir+json"]) */
  supported_formats?: string[];
  /** URL to SMART configuration */
  smart_config_url?: string;
  /** SMART launch capabilities */
  capabilities?: string[];
  /** Supported FHIR resource types */
  supported_resources?: string[];
  /** Security/OAuth configuration */
  security?: {
    oauth_authorize_url?: string;
    oauth_token_url?: string;
    requires_udap?: boolean;
  };
}

/**
 * Auth requirements for connecting to an endpoint.
 */
export interface EndpointAuthRequirements {
  /** Whether registration is required before connecting */
  registration_required?: boolean;
  /** URL for registration (if required) */
  registration_url?: string;
  /** Whether allowlist approval is required */
  allowlist_required?: boolean;
  /** Additional notes about auth requirements */
  notes?: string;
}

/**
 * Availability statistics for an endpoint.
 */
export interface EndpointAvailability {
  /** Uptime percentage (e.g., 99.2) */
  percentage: number;
  /** Total number of probes recorded */
  probe_count: number;
  /** When the endpoint was last checked (ISO date) */
  last_checked: string;
  /** When the endpoint was last successfully reached (ISO date or null) */
  last_successful: string | null;
  /** Current streak of consecutive failures */
  consecutive_failures: number;
}

/**
 * Evidence summary for an endpoint.
 */
export interface EvidenceSummary {
  /** Type of most recent verification */
  latest_verification: string;
  /** Total number of verifications recorded */
  verification_count: number;
  /** When the endpoint was first discovered (ISO date) */
  first_seen: string;
  /** Types of evidence sources */
  sources: string[];
}

/**
 * Endpoint connectivity information.
 */
export interface ConnectivityEndpointData {
  /** Unique endpoint identifier */
  endpoint_id: string;
  /** Endpoint type */
  type: "fhir_r4" | "fhir_stu3" | "fhir_dstu2" | "direct" | "hl7v2_adt" | "x12" | "other";
  /** Base URL or address */
  url: string;
  /** Scope (production vs sandbox) */
  scope: "production" | "sandbox" | "unknown";
  /** Current verification status */
  status: "active" | "inactive" | "unverified" | "unreachable";
  /** When the endpoint was last verified (ISO date) */
  last_verified_at?: string;
  /** FHIR-specific metadata (if applicable) */
  fhir_metadata?: FhirMetadata;
  /** Authentication requirements */
  auth_requirements?: EndpointAuthRequirements;
  /** Availability statistics */
  availability?: EndpointAvailability;
  /** Summary of verification evidence */
  evidence_summary: EvidenceSummary;
}

/**
 * Connectivity target (organization/health system).
 */
export interface ConnectivityTargetData {
  /** Unique target identifier */
  target_id: string;
  /** Organization name */
  name: string;
  /** Organization type */
  type: "health_system" | "facility" | "practice" | "hie" | "qhin" | "payer";
  /** How this NPI is linked to the target */
  link_type: "organization_npi" | "employed_by" | "affiliated" | "practice_location";
  /** Confidence level of the link */
  link_confidence: "high" | "medium" | "low" | "inferred";
  /** EHR vendor (if known) */
  ehr_vendor?: string;
  /** Network participation (e.g., CommonWell, Carequality) */
  network_participation?: string[];
  /** Available endpoints for this target */
  endpoints: ConnectivityEndpointData[];
}

/**
 * Response metadata for connectivity lookups.
 */
export interface ConnectivityMeta {
  /** Timestamp of when this data was retrieved (ISO date) */
  data_as_of: string;
  /** Disclaimer about the data */
  disclaimer: string;
}

/**
 * NPI connectivity response.
 *
 * Contains all connectivity options for reaching a provider's organization,
 * including FHIR endpoints, Direct addresses, and verification evidence.
 */
export interface NpiConnectivityData {
  /** The NPI that was looked up */
  npi: string;
  /** Summary of the provider from NPPES */
  provider_summary: ProviderSummary;
  /** Organizations linked to this NPI with their endpoints */
  connectivity_targets: ConnectivityTargetData[];
  /** Response metadata */
  meta: ConnectivityMeta;
}
