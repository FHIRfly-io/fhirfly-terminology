// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the MIT License. See LICENSE file in the project root.
/**
 * @fhirfly-io/terminology - Official FHIRfly Terminology SDK for Node.js
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
  NdcFhirCoding,
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
  DrugClassEntry,
  Contraindication,
  RxNormFhirCoding,
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
  Icd10FhirCoding,
  Icd10Type,
  Icd10Compact,
  Icd10Standard,
  Icd10Full,
  Icd10Data,
  Icd10SearchParams,
  // CVX
  CvxNdcCrosswalk,
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
  // Claims
  NcciClaimType,
  NcciEditItem,
  NcciValidateData,
  NcciValidateResponse,
  MueServiceType,
  MueLimitItem,
  MueLookupData,
  MueLookupResponse,
  MueBatchResultItem,
  MueBatchResponse,
  PfsRvu,
  PfsPayment,
  PfsIndicators,
  PfsLookupData,
  PfsLookupResponse,
  PfsBatchResultItem,
  PfsBatchResponse,
  CoveragePolicyType,
  CoverageCheckItem,
  CoverageCheckData,
  CoverageCheckResponse,
  ClaimsLegalInfo,
  ClaimsMeta,
  // SMA
  SmaListOptions,
  SmaStateSummary,
  SmaMetaResponse,
  SmaStatesListResponse,
  SmaStateDetailResponse,
  SmaStatsResponse,
  // HCC
  HccFhirCoding,
  HccIngest,
  HccCompact,
  HccStandard,
  HccFull,
  HccData,
  HccReverseResult,
  HccSearchParams,
  // OPCS-4
  Opcs4FhirCoding,
  Opcs4Structure,
  Opcs4Legal,
  Opcs4Ingest,
  Opcs4Compact,
  Opcs4Standard,
  Opcs4Full,
  Opcs4Data,
  Opcs4SearchParams,
  // dm+d
  DmdConceptType,
  DmdFhirCoding,
  DmdLegal,
  DmdIngest,
  DmdLookupValue,
  DmdIngredient,
  DmdCompact,
  DmdStandard,
  DmdFull,
  DmdData,
  DmdSearchParams,
  // UCUM
  UcumFhirCoding,
  UcumCompact,
  UcumStandard,
  UcumFull,
  UcumData,
  UcumSearchParams,
  UcumValidateComponent,
  UcumValidateResult,
  UcumConvertResult,
  // RxClass
  RxClassFhirCoding,
  RxClassCompact,
  RxClassStandard,
  RxClassFull,
  RxClassData,
  RxClassSearchParams,
  RxClassMember,
  RxClassMembersResponse,
  // HCPCS
  HcpcsFhirCoding,
  HcpcsCompact,
  HcpcsStandard,
  HcpcsFull,
  HcpcsData,
  HcpcsModifierCompact,
  HcpcsModifierStandard,
  HcpcsModifierFull,
  HcpcsModifierData,
  HcpcsSearchParams,
  // MS-DRG
  MsdrgFhirCoding,
  MsdrgCompact,
  MsdrgStandard,
  MsdrgFull,
  MsdrgData,
  MsdrgSearchParams,
  // POS
  PosFhirCoding,
  PosCompact,
  PosStandard,
  PosFull,
  PosData,
  PosListResponse,
  // J-Code
  JcodeNdcEntry,
  JcodeByHcpcsResponse,
  JcodeByNdcHcpcsEntry,
  JcodeByNdcResponse,
  JcodeMeta,
} from "./types/index.js";

// Endpoint classes
export { HccEndpoint, type HccReverseLookupOptions } from "./endpoints/hcc.js";
export { Opcs4Endpoint } from "./endpoints/opcs4.js";
export { DmdEndpoint } from "./endpoints/dmd.js";
export { UcumEndpoint } from "./endpoints/ucum.js";
export { RxClassEndpoint } from "./endpoints/rxclass.js";
export { HcpcsEndpoint } from "./endpoints/hcpcs.js";
export { MsdrgEndpoint } from "./endpoints/msdrg.js";
export { PosEndpoint } from "./endpoints/pos.js";
export { JcodeEndpoint } from "./endpoints/jcode.js";
