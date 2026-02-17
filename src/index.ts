// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
/**
 * @fhirfly/sdk - Official FHIRfly SDK for Node.js
 *
 * Healthcare reference data APIs for clinical coding, drug information, and provider lookup.
 *
 * @packageDocumentation
 */

// Main client
export { Fhirfly, type FhirflyConfig, type FhirflyApiKeyConfig, type FhirflyOAuthConfig } from "./client.js";

// Auth utilities
export { TokenManager } from "./http.js";

// Errors
export {
  FhirflyError,
  ApiError,
  AuthenticationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  QuotaExceededError,
  ServerError,
  NetworkError,
  TimeoutError,
} from "./errors.js";

// Types
export type {
  // Common
  ResponseShape,
  IncludeOption,
  LookupOptions,
  BatchLookupOptions,
  LegalInfo,
  ResponseMeta,
  ApiResponse,
  BatchResultItem,
  BatchResponse,
  DisplayField,
  // Search types
  SearchOptions,
  SearchFacets,
  SearchLegalInfo,
  SearchResponse,
  // NDC
  ActiveIngredient,
  NdcType,
  NdcCompact,
  NdcStandard,
  NdcFull,
  NdcData,
  NdcSearchParams,
  // NPI
  PersonName,
  NpiAddress,
  EnrichedTaxonomy,
  SecondaryLocation,
  Deactivation,
  AuthorizedOfficial,
  OtherIdentifier,
  NpiCompact,
  NpiStandard,
  NpiFull,
  NpiData,
  NpiSearchParams,
  // RxNorm
  RxTermType,
  RxNormCompact,
  RxNormStandard,
  RxNormFull,
  RxNormData,
  RxNormSearchParams,
  // LOINC
  LoincParts,
  LoincUnits,
  LoincFhirCoding,
  LoincRanks,
  LoincSourceOrg,
  LoincCompact,
  LoincStandard,
  LoincFull,
  LoincData,
  LoincSearchParams,
  // ICD-10
  Icd10Type,
  Icd10Compact,
  Icd10Standard,
  Icd10Full,
  Icd10Data,
  Icd10SearchParams,
  // CVX
  CvxCompact,
  CvxStandard,
  CvxFull,
  CvxData,
  CvxSearchParams,
  // MVX
  MvxFhirCoding,
  MvxIngest,
  MvxCompact,
  MvxStandard,
  MvxFull,
  MvxData,
  MvxSearchParams,
  // FDA Labels
  FdaLabelMetadata,
  FdaLabelData,
  FdaLabelBundleName,
  FdaLabelLookupOptions,
  FdaLabelSearchCompact,
  FdaLabelSearchStandard,
  FdaLabelSearchFull,
  FdaLabelSearchData,
  FdaLabelSearchParams,
  // SNOMED
  IpsCategory,
  SnomedConcept,
  SnomedMappingType,
  SnomedMappingSourceSystem,
  SnomedMappingSource,
  SnomedReverseMapping,
  SnomedReverseMappingData,
  SnomedBatchResultItem,
  SnomedSearchParams,
  SnomedCategoriesResponse,
  SnomedEnrichmentStandard,
  SnomedEnrichmentFull,
  // Connectivity
  ProviderSummary,
  FhirMetadata,
  EndpointAuthRequirements,
  EndpointAvailability,
  EvidenceSummary,
  ConnectivityEndpointData,
  ConnectivityTargetData,
  ConnectivityMeta,
  NpiConnectivityData,
} from "./types/index.js";
