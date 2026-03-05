// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import type { HttpClient } from "../http.js";
import type {
  SmaListOptions,
  SmaStatesListResponse,
  SmaStateDetailResponse,
  SmaStatsResponse,
} from "../types/sma.js";

/**
 * SMA (State Medicaid Agency) Endpoint Directory API endpoints.
 *
 * Provides access to CMS SMA Endpoint Directory data showing which state
 * Medicaid agencies have implemented FHIR-based patient access and provider
 * directory APIs.
 *
 * All SMA endpoints require the `connectivity.read` scope.
 *
 * @example
 * ```ts
 * // List all implemented states
 * const list = await client.sma.listStates({ implemented: true });
 * console.log(`${list.total} states have FHIR endpoints`);
 *
 * // Get details for California
 * const ca = await client.sma.getState("CA");
 * console.log(`Vendor: ${ca.api_vendor}`);
 * console.log(`Claims endpoints: ${ca.patient_access.endpoints.claims.length}`);
 *
 * // Get aggregate statistics
 * const stats = await client.sma.stats();
 * console.log(`${stats.summary.implemented} of ${stats.summary.total_states} implemented`);
 * ```
 */
export class SmaEndpoint {
  constructor(private readonly http: HttpClient) {}

  /**
   * List all states with SMA endpoint implementation status.
   *
   * @param options - Optional filters (implemented, vendor, status, fhir_version)
   * @returns List of state summaries with implementation status
   *
   * @example
   * ```ts
   * // All states
   * const all = await client.sma.listStates();
   *
   * // Only Epic-based implementations
   * const epic = await client.sma.listStates({ vendor: "Epic" });
   *
   * // Only implemented states
   * const live = await client.sma.listStates({ implemented: true });
   * ```
   */
  async listStates(options?: SmaListOptions): Promise<SmaStatesListResponse> {
    const params: Record<string, unknown> = {};
    if (options?.implemented !== undefined) {
      params.implemented = options.implemented.toString();
    }
    if (options?.vendor) {
      params.vendor = options.vendor;
    }
    if (options?.status) {
      params.status = options.status;
    }
    if (options?.fhir_version) {
      params.fhir_version = options.fhir_version;
    }
    const queryString = this.http.buildSearchQueryString(params);
    return this.http.get<SmaStatesListResponse>(`/v1/sma/states${queryString}`);
  }

  /**
   * Get full SMA details for a specific state.
   *
   * Accepts state abbreviation (CA), underscore ID (california), or
   * display name (California).
   *
   * @param state - State identifier (abbreviation, ID, or display name)
   * @returns Full state detail with endpoints, contacts, and metadata
   *
   * @example
   * ```ts
   * const ca = await client.sma.getState("CA");
   * console.log(`${ca.state}: ${ca.is_implemented ? "Implemented" : "Not implemented"}`);
   *
   * for (const url of ca.patient_access.endpoints.claims) {
   *   console.log(`Claims endpoint: ${url}`);
   * }
   * ```
   */
  async getState(state: string): Promise<SmaStateDetailResponse> {
    return this.http.get<SmaStateDetailResponse>(
      `/v1/sma/states/${encodeURIComponent(state)}`
    );
  }

  /**
   * Get aggregate SMA statistics.
   *
   * Returns implementation counts, breakdowns by vendor/status/FHIR version,
   * and provider directory statistics.
   *
   * @returns Aggregate statistics across all states
   *
   * @example
   * ```ts
   * const stats = await client.sma.stats();
   * console.log(`${stats.summary.implemented} / ${stats.summary.total_states} states implemented`);
   * console.log(`Total production URLs: ${stats.summary.total_production_urls}`);
   * ```
   */
  async stats(): Promise<SmaStatsResponse> {
    return this.http.get<SmaStatsResponse>("/v1/sma/stats");
  }
}
