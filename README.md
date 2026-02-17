# @fhirfly-io/terminology

Official FHIRfly SDK for Node.js — typed access to healthcare reference data APIs (NDC, NPI, LOINC, RxNorm, ICD-10, CVX, MVX, FDA Labels).

[![npm version](https://img.shields.io/npm/v/@fhirfly-io/terminology.svg)](https://www.npmjs.com/package/@fhirfly-io/terminology)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @fhirfly-io/terminology
```

## Quick Start

```typescript
import { Fhirfly } from "@fhirfly-io/terminology";

const client = new Fhirfly({ apiKey: "your-api-key" });

// Look up a drug by NDC
const ndc = await client.ndc.lookup("0069-0151-01");
console.log(ndc.data.product_name); // "Lipitor"

// Look up a provider by NPI
const npi = await client.npi.lookup("1234567890");
console.log(npi.data.name);
```

## Features

- **Full TypeScript support** with comprehensive type definitions
- **All FHIRfly APIs**: NDC, NPI, RxNorm, LOINC, ICD-10, CVX, MVX, FDA Labels
- **Batch lookups** for efficient bulk operations
- **Response shapes**: compact, standard, or full detail levels
- **Automatic retries** with exponential backoff
- **Detailed error types** for proper error handling
- **Designed for both human developers and programmatic agents**

## API Reference

### Client Configuration

```typescript
const client = new Fhirfly({
  apiKey: "your-api-key",      // Required
  baseUrl: "https://api.fhirfly.io", // Optional, default shown
  timeout: 30000,              // Optional, request timeout in ms
  maxRetries: 3,               // Optional, retry attempts
  retryDelay: 1000,            // Optional, base retry delay in ms
});
```

### NDC (National Drug Codes)

```typescript
// Single lookup
const ndc = await client.ndc.lookup("0069-0151-01");

// With options
const ndc = await client.ndc.lookup("0069-0151-01", {
  shape: "full",           // "compact" | "standard" | "full"
  include: ["display"],    // Include pre-formatted display strings
});

// Batch lookup (up to 500 codes)
const results = await client.ndc.lookupMany([
  "0069-0151-01",
  "0069-0151-02",
]);

for (const item of results.results) {
  if (item.found) {
    console.log(item.data.product_name);
  }
}
```

Batch lookups return per-item results and never throw for individual misses.

### NPI (National Provider Identifiers)

```typescript
// Single lookup
const npi = await client.npi.lookup("1234567890");

// Batch lookup
const results = await client.npi.lookupMany(["1234567890", "0987654321"]);
```

### RxNorm

```typescript
// Look up by RxCUI
const rx = await client.rxnorm.lookup("213169");
console.log(rx.data.name); // "atorvastatin 10 MG Oral Tablet"
```

### LOINC

```typescript
// Look up lab code
const loinc = await client.loinc.lookup("2345-7");
console.log(loinc.data.long_common_name);
```

### ICD-10

```typescript
// ICD-10-CM (diagnoses)
const diagnosis = await client.icd10.lookupCm("E11.9");

// ICD-10-PCS (procedures)
const procedure = await client.icd10.lookupPcs("0BJ08ZZ");

// Batch lookups
const cmResults = await client.icd10.lookupCmMany(["E11.9", "I10"]);
const pcsResults = await client.icd10.lookupPcsMany(["0BJ08ZZ"]);
```

### CVX (Vaccine Codes)

```typescript
const cvx = await client.cvx.lookup("208");
console.log(cvx.data.short_description);
```

### MVX (Vaccine Manufacturers)

```typescript
const mvx = await client.mvx.lookup("PFR");
console.log(mvx.data.manufacturer_name); // "Pfizer, Inc"
```

### FDA Labels

```typescript
// By Set ID
const label = await client.fdaLabels.lookup("set-id-here");

// By NDC
const label = await client.fdaLabels.lookupByNdc("0069-0151-01");
```

## Response Shapes

All lookup methods accept a `shape` option to control response detail:

| Shape | Description |
|-------|-------------|
| `compact` | Minimal fields for quick lookups |
| `standard` | Balanced detail (default) |
| `full` | Complete data with all available fields |

```typescript
// Get full details
const ndc = await client.ndc.lookup("0069-0151-01", { shape: "full" });
```

## Error Handling

The SDK provides typed errors for different failure scenarios:

```typescript
import {
  Fhirfly,
  NotFoundError,
  RateLimitError,
  AuthenticationError
} from "@fhirfly-io/terminology";

try {
  const ndc = await client.ndc.lookup("invalid-code");
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log(`Code not found: ${error.code_value}`);
  } else if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry after: ${error.retryAfter}s`);
  } else if (error instanceof AuthenticationError) {
    console.log("Invalid API key");
  }
}
```

### Error Types

| Error | Status | Description |
|-------|--------|-------------|
| `AuthenticationError` | 401 | Invalid or missing API key |
| `NotFoundError` | 404 | Code/identifier not found |
| `ValidationError` | 400 | Invalid request parameters |
| `RateLimitError` | 429 | Rate limit exceeded |
| `QuotaExceededError` | 429 | Monthly quota exceeded |
| `ServerError` | 5xx | Server-side error |
| `NetworkError` | - | Network connectivity issue |
| `TimeoutError` | - | Request timed out |

`RateLimitError` indicates short-term throttling; `QuotaExceededError` indicates monthly plan limits.

## Requirements

- Node.js 18+
- FHIRfly API key ([Get one free](https://fhirfly.io/dashboard))

## License

MIT - see [LICENSE](./LICENSE) for details.

## Links

- [FHIRfly Documentation](https://fhirfly.io/docs)
- [API Reference](https://fhirfly.io/docs/api-reference)
- [Get an API Key](https://fhirfly.io/dashboard)
