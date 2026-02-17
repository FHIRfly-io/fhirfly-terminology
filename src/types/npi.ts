import type { DisplayField } from "./common.js";

/**
 * Provider address information.
 */
export interface NpiAddress {
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  telephone?: string;
  fax?: string;
}

/**
 * Provider taxonomy/specialty information.
 */
export interface NpiTaxonomy {
  code: string;
  description?: string;
  primary?: boolean;
  state?: string;
  license?: string;
}

/**
 * Other identifier (non-NPI) for a provider.
 */
export interface NpiIdentifier {
  identifier: string;
  type?: string;
  state?: string;
  issuer?: string;
}

/**
 * NPI lookup result - compact shape.
 */
export interface NpiCompact extends DisplayField {
  npi: string;
  entity_type: "individual" | "organization";
  name: string;
  /** For individuals: first name */
  first_name?: string;
  /** For individuals: last name */
  last_name?: string;
  /** For organizations: organization name */
  organization_name?: string;
}

/**
 * NPI lookup result - standard shape.
 */
export interface NpiStandard extends NpiCompact {
  credential?: string;
  gender?: string;
  sole_proprietor?: boolean;
  enumeration_date?: string;
  last_updated?: string;
  status?: string;
  primary_taxonomy?: NpiTaxonomy;
  practice_address?: NpiAddress;
}

/**
 * NPI lookup result - full shape.
 */
export interface NpiFull extends NpiStandard {
  mailing_address?: NpiAddress;
  taxonomies?: NpiTaxonomy[];
  identifiers?: NpiIdentifier[];
  other_names?: Array<{
    type: string;
    name: string;
  }>;
  deactivation_date?: string;
  reactivation_date?: string;
}

/**
 * NPI response type based on shape.
 */
export type NpiData = NpiCompact | NpiStandard | NpiFull;

/**
 * NPI search parameters.
 */
export interface NpiSearchParams {
  /** General text search */
  q?: string;
  /** Search by provider name */
  name?: string;
  /** Filter by first name (individuals only) */
  first_name?: string;
  /** Filter by last name (individuals only) */
  last_name?: string;
  /** Search by organization name */
  organization?: string;
  /** Filter by taxonomy code */
  taxonomy?: string;
  /** Search by specialty description */
  specialty?: string;
  /** Filter by state (2-letter code) */
  state?: string;
  /** Filter by city */
  city?: string;
  /** Filter by postal code */
  postal_code?: string;
  /** Filter by phone number */
  phone?: string;
  /** Filter by entity type */
  entity_type?: "individual" | "organization";
  /** Filter by active status */
  active?: boolean;
  /** Sort order: "relevance", "name", "location" */
  sort?: "relevance" | "name" | "location";
}
