# @fhirfly-io/terminology

Official FHIRfly SDK for Node.js — typed access to healthcare reference data APIs.

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
console.log(ndc.data.brand_name); // "Lipitor"

// Look up a provider by NPI
const npi = await client.npi.lookup("1234567890");
console.log(npi.data.name);
```

## Features

- **Full TypeScript support** with comprehensive type definitions
- **10 healthcare APIs**: NDC, NPI, RxNorm, LOINC, ICD-10, CVX, MVX, FDA Labels, SNOMED CT, Connectivity
- **Search** with full-text queries, filters, facets, and pagination
- **Batch lookups** for efficient bulk operations
- **Response shapes**: compact, standard, or full detail levels
- **Two auth modes**: API key (simple) and OAuth2 client credentials (secure)
- **Automatic retries** with exponential backoff
- **Detailed error types** for proper error handling
- **Zero runtime dependencies**

## Authentication

### API Key (Simple)

```typescript
const client = new Fhirfly({
  apiKey: "ffly_sk_live_...",
  baseUrl: "https://api.fhirfly.io", // Optional, default shown
  timeout: 30000,              // Optional, request timeout in ms
  maxRetries: 3,               // Optional, retry attempts
  retryDelay: 1000,            // Optional, base retry delay in ms
});
```

### OAuth2 Client Credentials (Secure)

```typescript
const client = new Fhirfly({
  clientId: "ffly_client_...",
  clientSecret: "ffly_secret_...",
  scopes: ["ndc.read", "npi.read"], // Optional
  tokenUrl: "https://api.fhirfly.io/oauth2/token", // Optional, default shown
});
```

OAuth2 tokens are cached and automatically refreshed before expiry.

## API Reference

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
  if (item.status === "ok") {
    console.log(item.data.brand_name);
  }
}

// Search
const results = await client.ndc.search({
  q: "advil",
  dosage_form: "TABLET",
  is_active: true,
});
```

Batch lookups return per-item results and never throw for individual misses. Each item has `status: "ok" | "not_found" | "invalid"`.

### NPI (National Provider Identifiers)

```typescript
// Single lookup
const npi = await client.npi.lookup("1234567890");

// Batch lookup (up to 100)
const results = await client.npi.lookupMany(["1234567890", "0987654321"]);

// Search for providers
const results = await client.npi.search({
  q: "smith",
  specialty: "cardiology",
  state: "CA",
  entity_type: "individual",
});
console.log(`Found ${results.total} providers`);
```

### RxNorm

```typescript
// Look up by RxCUI
const rx = await client.rxnorm.lookup("213169");
console.log(rx.data.name); // "atorvastatin 10 MG Oral Tablet"

// Search for drugs
const results = await client.rxnorm.search({
  ingredient: "metformin",
  is_prescribable: true,
});
```

### LOINC

```typescript
// Look up lab code
const loinc = await client.loinc.lookup("2345-7");
console.log(loinc.data.display_name);

// Search
const results = await client.loinc.search({
  q: "glucose",
  class: "CHEM",
  system: "Bld",
});
```

### ICD-10

The API auto-detects CM (diagnoses) vs PCS (procedures) based on code format.

```typescript
// Diagnosis code (CM)
const diagnosis = await client.icd10.lookup("E11.9");
console.log(diagnosis.data.display); // "Type 2 diabetes mellitus without complications"

// Procedure code (PCS)
const procedure = await client.icd10.lookup("02HA0QZ");

// Batch lookup (mix of CM and PCS, up to 100)
const results = await client.icd10.lookupMany(["E11.9", "I10", "02HA0QZ"]);

// Search
const results = await client.icd10.search({
  q: "diabetes",
  code_system: "CM",
  billable: true,
});
```

### CVX (Vaccine Codes)

```typescript
const cvx = await client.cvx.lookup("208");
console.log(cvx.data.display);

// Search for COVID vaccines
const results = await client.cvx.search({
  is_covid_vaccine: true,
  status: "active",
});
```

### MVX (Vaccine Manufacturers)

```typescript
const mvx = await client.mvx.lookup("PFR");
console.log(mvx.data.manufacturer_name); // "Pfizer, Inc"

const results = await client.mvx.search({ q: "pfizer" });
```

### FDA Labels

```typescript
// Look up by Set ID, NDC, or RxCUI (auto-detected)
const label = await client.fdaLabels.lookup("0069-0151-01");

// With safety sections
const label = await client.fdaLabels.lookup("0069-0151-01", {
  bundle: "safety",
});

// With specific sections
const label = await client.fdaLabels.lookup("0069-0151-01", {
  sections: ["boxed_warning", "dosage_and_administration"],
});

// Batch (up to 50, metadata only)
const results = await client.fdaLabels.lookupMany(["0069-0151-01", "0002-1433-80"]);

// Search
const results = await client.fdaLabels.search({
  substance: "acetaminophen",
  product_type: "otc",
});
```

### SNOMED CT (IPS)

Access to ~12,000 curated clinical concepts from the SNOMED CT IPS (International Patient Set), licensed under CC BY 4.0.

```typescript
// Look up a concept
const concept = await client.snomed.lookup("73211009");
console.log(concept.data.preferred_term); // "Diabetes mellitus"

// Batch lookup (up to 100)
const results = await client.snomed.lookupMany(["73211009", "38341003"]);

// Search by category
const results = await client.snomed.search({
  q: "diabetes",
  ips_category: "condition",
});

// List all IPS categories
const categories = await client.snomed.categories();

// Reverse mappings (what ICD-10/RxNorm/NDC codes map to this concept?)
const mappings = await client.snomed.mappings("73211009");
```

### Connectivity Intelligence

Discover how to reach a provider's organization electronically — FHIR endpoints, Direct addresses, and more.

```typescript
// Look up connectivity options for a provider
const conn = await client.connectivity.lookup("1234567890");

console.log(conn.provider_summary.name);

for (const target of conn.connectivity_targets) {
  console.log(`${target.name} (${target.type})`);
  for (const ep of target.endpoints) {
    console.log(`  ${ep.type}: ${ep.url} [${ep.status}]`);
  }
}
```

## Response Shapes

All lookup and search methods accept a `shape` option to control response detail:

| Shape | Description |
|-------|-------------|
| `compact` | Minimal fields for quick lookups and autocomplete |
| `standard` | Balanced detail (default for REST) |
| `full` | Complete data with provenance (default for MCP/agents) |

```typescript
const ndc = await client.ndc.lookup("0069-0151-01", { shape: "full" });
```

**Exceptions**: SNOMED always returns full data (no shapes). FDA Labels lookup uses a metadata + sections model instead of shapes; search uses shapes.

## Search

All endpoints except Connectivity support full-text search with filters, facets, and pagination:

```typescript
const results = await client.ndc.search(
  { q: "advil", is_active: true },        // Search params
  { shape: "compact", limit: 50, page: 1 } // Options
);

console.log(`${results.total} results, page ${results.page}`);
console.log(results.facets); // Facet counts for filtering

for (const item of results.items) {
  console.log(item.name);
}

if (results.has_more) {
  // Fetch next page...
}
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
