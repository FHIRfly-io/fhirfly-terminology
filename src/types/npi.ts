import type { DisplayField } from "./common.js";

/**
 * Person name object for individual providers.
 */
export interface PersonName {
  first: string;
  last: string;
  middle?: string;
  prefix?: string;
  suffix?: string;
  credential?: string;
}

/**
 * Provider address information.
 */
export interface NpiAddress {
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country_code?: string;
  phone?: string;
  phone_digits?: string;
  fax?: string;
}

/**
 * Enriched taxonomy with NUCC data merged.
 */
export interface EnrichedTaxonomy {
  code: string;
  primary: boolean;
  license_number?: string;
  license_state?: string;
  classification: string;
  specialization: string | null;
  display_name: string;
  grouping?: string;
  /** Only included in full shape */
  definition?: string;
}

/**
 * Secondary practice location from pl_pfile.
 */
export interface SecondaryLocation {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal: string;
  country?: string;
  phone?: string;
  phone_digits?: string;
  phone_ext?: string;
  fax?: string;
}

/**
 * Deactivation information.
 */
export interface Deactivation {
  code?: string;
  date?: string;
  reactivation_date?: string;
}

/**
 * Authorized official for organizations.
 */
export interface AuthorizedOfficial {
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  title?: string;
  phone?: string;
  credential?: string;
}

/**
 * Other identifier (non-NPI) for a provider.
 */
export interface OtherIdentifier {
  identifier: string;
  type_code: string;
  state?: string;
  issuer?: string;
}

/**
 * NPI lookup result - compact shape.
 * Minimal data for lists, autocomplete, search results.
 */
export interface NpiCompact extends DisplayField {
  npi: string;
  name: string;
  type: "individual" | "organization";
  specialty: string | null;
  location: string | null;
  active: boolean;
}

/**
 * NPI lookup result - standard shape.
 * Core structured data for most API integrations.
 */
export interface NpiStandard extends DisplayField {
  npi: string;
  entity_type: "individual" | "organization";
  name: PersonName | null;
  organization_name: string | null;
  taxonomies: Omit<EnrichedTaxonomy, "definition">[];
  practice_address: NpiAddress | null;
  enumeration_date: string;
  last_update_date: string;
  is_active: boolean;
}

/**
 * NPI lookup result - full shape.
 * Complete data with provenance for AI agents and auditing.
 */
export interface NpiFull extends DisplayField {
  npi: string;
  entity_type: "individual" | "organization";
  name: PersonName | null;
  organization_name: string | null;
  taxonomies: EnrichedTaxonomy[];
  practice_address: NpiAddress | null;
  secondary_locations: SecondaryLocation[];
  mailing_address: NpiAddress | null;
  enumeration_date: string;
  last_update_date: string;
  is_active: boolean;
  is_sole_proprietor: boolean | null;
  deactivation: Deactivation | null;
  authorized_official: AuthorizedOfficial | null;
  other_identifiers: OtherIdentifier[];
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
