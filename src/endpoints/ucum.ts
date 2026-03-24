// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
import type { HttpClient } from "../http.js";
import { ValidationError } from "../errors.js";
import type {
  ApiResponse,
  BatchResponse,
  LookupOptions,
  BatchLookupOptions,
  SearchOptions,
  SearchResponse,
} from "../types/common.js";
import type {
  UcumData,
  UcumSearchParams,
  UcumValidateResult,
  UcumConvertResult,
} from "../types/ucum.js";

/**
 * UCUM (Unified Code for Units of Measure) API endpoint.
 *
 * Provides access to standardized units of measure used in healthcare
 * and scientific applications, including validation and conversion.
 */
export class UcumEndpoint {
  constructor(private readonly http: HttpClient) {}

  /**
   * Look up a single UCUM unit code.
   *
   * @param code - UCUM unit code (e.g., "mg", "kg/m2", "mmol/L")
   * @param options - Response shape and include options
   * @returns UCUM unit data
   *
   * @example
   * ```ts
   * const unit = await client.ucum.lookup("mg");
   * console.log(unit.data.display); // "milligram"
   * ```
   */
  async lookup(code: string, options?: LookupOptions): Promise<ApiResponse<UcumData>> {
    return this.http.get<ApiResponse<UcumData>>(`/v1/ucum/${encodeURIComponent(code)}`, options);
  }

  /**
   * Look up multiple UCUM unit codes in a single request.
   *
   * @param codes - Array of UCUM unit codes (max 100)
   * @param options - Response shape, include, and batch options
   * @returns Batch response with results for each code
   */
  async lookupMany(
    codes: string[],
    options?: BatchLookupOptions
  ): Promise<BatchResponse<UcumData>> {
    if (codes.length === 0) throw new ValidationError("codes array must not be empty");
    if (codes.length > 100) throw new ValidationError(`UCUM batch lookup supports max 100 codes, got ${codes.length}`);
    return this.http.post<BatchResponse<UcumData>>(
      "/v1/ucum/_batch",
      { codes },
      options
    );
  }

  /**
   * Search for UCUM units.
   *
   * @param params - Search parameters (q, kind, property, metric, is_common_clinical)
   * @param options - Pagination and response shape options
   * @returns Search results with facets
   *
   * @example
   * ```ts
   * // Search for mass units
   * const results = await client.ucum.search({ q: "gram" });
   *
   * // Find common clinical units for length
   * const results = await client.ucum.search({
   *   kind: "length",
   *   is_common_clinical: true
   * });
   * ```
   */
  async search(
    params: UcumSearchParams,
    options?: SearchOptions
  ): Promise<SearchResponse<UcumData>> {
    return this.http.search<SearchResponse<UcumData>>("/v1/ucum/search", {
      ...params,
      ...options,
      include: options?.include?.join(","),
    });
  }

  /**
   * Validate a UCUM expression.
   *
   * Checks whether a UCUM expression is syntactically valid and all
   * component unit codes are recognized.
   *
   * @param expression - UCUM expression to validate (e.g., "mg/dL", "kg.m-2")
   * @returns Validation result with component breakdown
   *
   * @example
   * ```ts
   * const result = await client.ucum.validate("mg/dL");
   * console.log(result.data.valid); // true
   *
   * const invalid = await client.ucum.validate("xyz123");
   * console.log(invalid.data.valid); // false
   * console.log(invalid.data.error); // description of the problem
   * ```
   */
  async validate(expression: string): Promise<ApiResponse<UcumValidateResult>> {
    return this.http.get<ApiResponse<UcumValidateResult>>(
      `/v1/ucum/validate/${encodeURIComponent(expression)}`
    );
  }

  /**
   * Convert a value between UCUM units.
   *
   * Converts a numeric value from one UCUM unit to another compatible unit.
   * Both units must measure the same physical quantity (e.g., both mass,
   * both length).
   *
   * @param from - Source UCUM unit code
   * @param to - Target UCUM unit code
   * @param value - Numeric value to convert
   * @returns Conversion result with factor
   *
   * @example
   * ```ts
   * // Convert 5 kilograms to pounds
   * const result = await client.ucum.convert("kg", "[lb_av]", 5);
   * console.log(result.data.to.value); // ~11.0231
   *
   * // Convert temperature: 98.6 Fahrenheit to Celsius
   * const temp = await client.ucum.convert("[degF]", "Cel", 98.6);
   * console.log(temp.data.to.value); // 37
   * ```
   */
  async convert(
    from: string,
    to: string,
    value: number
  ): Promise<ApiResponse<UcumConvertResult>> {
    return this.http.search<ApiResponse<UcumConvertResult>>("/v1/ucum/convert", {
      from,
      to,
      value,
    });
  }
}
