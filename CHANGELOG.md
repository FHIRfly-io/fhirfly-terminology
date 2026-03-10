# Changelog

All notable changes to this project will be documented in this file.

## [0.10.1] - 2026-03-10

### Added
- `SourceInfo` interface for data provenance (name, url, version, fhirfly_updated_at, components)
- Optional `source` field on `BatchResponse.meta` (included when shape=full)

## [0.8.1] - 2026-03-02

### Changed
- Migrated repository URLs from GitHub to GitLab

## [0.8.0] - 2026-02-23

### Added
- Claims endpoint with `validateNcci()`, `lookupMue()`, `lookupPfs()`, `checkCoverage()` methods
- Batch validation for all endpoints with configurable limits
- SNOMED and Claims test suites

### Fixed
- NPI type drift between SDK and API response shapes
- Batch limits corrected per endpoint (NDC=500, FDA Labels=50, others=100)
- User-Agent header and package references
- NDC JSDoc documentation

### Changed
- Rewrote README with complete API coverage
- Removed dead `batchSize` option, capped retry sleep duration, updated package keywords

## [0.7.1] - 2026-02-17

### Changed
- Added copyright headers to all source files

## [0.7.0] - 2026-02-17

### Fixed
- Aligned SDK types with API response shapes for NDC, LOINC, NPI, MVX, and FDA Labels

### Added
- Pre-commit hooks: identity leak scan, secret detection, typecheck, lint

## [0.6.1] - 2026-02-17

### Added
- Initial public release
- 10 endpoint classes: NDC, NPI, RxNorm, LOINC, ICD-10, CVX, MVX, FDA Labels, SNOMED, Connectivity
- Fetch-based HTTP client with retry logic and timeout handling
- Error hierarchy: `FhirflyError` → `ApiError`, `NetworkError`, `TimeoutError`
- Compact / Standard / Full type shape variants per endpoint
- Dual ESM/CJS build with TypeScript declarations

[0.8.1]: https://gitlab.com/fhirfly-io/fhirfly-terminology/-/compare/v0.8.0...v0.8.1
[0.8.0]: https://gitlab.com/fhirfly-io/fhirfly-terminology/-/compare/v0.7.1...v0.8.0
[0.7.1]: https://gitlab.com/fhirfly-io/fhirfly-terminology/-/compare/v0.7.0...v0.7.1
[0.7.0]: https://gitlab.com/fhirfly-io/fhirfly-terminology/-/compare/v0.6.1...v0.7.0
[0.6.1]: https://gitlab.com/fhirfly-io/fhirfly-terminology/-/releases/v0.6.1
