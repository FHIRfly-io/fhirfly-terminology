// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import type { HttpClient } from "../http.js";
import type { NpiConnectivityData } from "../types/connectivity.js";

/**
 * Connectivity Intelligence API endpoint.
 *
 * Provides methods for looking up connectivity options (FHIR endpoints,
 * Direct addresses, etc.) for healthcare providers by NPI.
 */
export class ConnectivityEndpoint {
  constructor(private readonly http: HttpClient) {}

  /**
   * Look up connectivity options for a provider by NPI.
   *
   * Returns organizations linked to this NPI and their available endpoints
   * (FHIR servers, Direct addresses, etc.) with verification evidence and
   * availability metrics.
   *
   * @param npi - 10-digit NPI number
   * @returns Connectivity information including endpoints and verification status
   *
   * @example
   * ```ts
   * const result = await client.connectivity.lookup("1234567890");
   *
   * console.log(`Provider: ${result.provider_summary.name}`);
   * console.log(`Found ${result.connectivity_targets.length} organization(s)`);
   *
   * for (const target of result.connectivity_targets) {
   *   console.log(`\n${target.name} (${target.ehr_vendor || 'Unknown EHR'})`);
   *   console.log(`  Link: ${target.link_type} (${target.link_confidence} confidence)`);
   *
   *   for (const endpoint of target.endpoints) {
   *     console.log(`  - ${endpoint.type}: ${endpoint.url}`);
   *     console.log(`    Status: ${endpoint.status}`);
   *     if (endpoint.availability) {
   *       console.log(`    Availability: ${endpoint.availability.percentage}%`);
   *     }
   *   }
   * }
   * ```
   */
  async lookup(npi: string): Promise<NpiConnectivityData> {
    return this.http.get<NpiConnectivityData>(
      `/v1/npi/${encodeURIComponent(npi)}/connectivity`
    );
  }
}
