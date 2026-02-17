import { HttpClient, TokenManager, type HttpClientConfig } from "./http.js";
import { NdcEndpoint } from "./endpoints/ndc.js";
import { NpiEndpoint } from "./endpoints/npi.js";
import { RxNormEndpoint } from "./endpoints/rxnorm.js";
import { LoincEndpoint } from "./endpoints/loinc.js";
import { Icd10Endpoint } from "./endpoints/icd10.js";
import { CvxEndpoint } from "./endpoints/cvx.js";
import { MvxEndpoint } from "./endpoints/mvx.js";
import { FdaLabelsEndpoint } from "./endpoints/fda-labels.js";
import { ConnectivityEndpoint } from "./endpoints/connectivity.js";
import { SnomedEndpoint } from "./endpoints/snomed.js";

/**
 * Base configuration options shared by all auth modes.
 */
interface FhirflyBaseConfig {
  /**
   * Base URL for the API.
   * @default "https://api.fhirfly.io"
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds.
   * @default 30000
   */
  timeout?: number;

  /**
   * Maximum number of retry attempts for failed requests.
   * @default 3
   */
  maxRetries?: number;

  /**
   * Base delay between retries in milliseconds (exponential backoff).
   * @default 1000
   */
  retryDelay?: number;
}

/**
 * Configuration using an API key (simple credentials).
 */
export interface FhirflyApiKeyConfig extends FhirflyBaseConfig {
  /**
   * Your FHIRfly API key.
   * Get one at https://fhirfly.io/dashboard
   */
  apiKey: string;
  clientId?: never;
  clientSecret?: never;
  tokenUrl?: never;
  scopes?: never;
}

/**
 * Configuration using OAuth2 client credentials (secure credentials).
 */
export interface FhirflyOAuthConfig extends FhirflyBaseConfig {
  /**
   * OAuth2 client ID from your secure credential.
   */
  clientId: string;

  /**
   * OAuth2 client secret from your secure credential.
   */
  clientSecret: string;

  /**
   * OAuth2 token endpoint URL.
   * @default "{baseUrl}/oauth2/token"
   */
  tokenUrl?: string;

  /**
   * OAuth2 scopes to request.
   */
  scopes?: string[];

  apiKey?: never;
}

/**
 * Configuration options for the FHIRfly client.
 * Provide either `apiKey` OR `clientId`+`clientSecret`, not both.
 */
export type FhirflyConfig = FhirflyApiKeyConfig | FhirflyOAuthConfig;

/**
 * FHIRfly API client.
 *
 * Provides access to healthcare reference data including drug codes (NDC, RxNorm),
 * provider identifiers (NPI), lab codes (LOINC), diagnosis codes (ICD-10),
 * vaccine codes (CVX, MVX), and FDA drug labels.
 *
 * @example
 * ```ts
 * import { Fhirfly } from "@fhirfly/sdk";
 *
 * // Option A: API key (simple)
 * const client = new Fhirfly({ apiKey: "ffly_sk_live_..." });
 *
 * // Option B: Client credentials (secure)
 * const client = new Fhirfly({
 *   clientId: "ffly_client_...",
 *   clientSecret: "ffly_secret_...",
 * });
 *
 * // Look up a drug by NDC
 * const ndc = await client.ndc.lookup("0069-0151-01");
 * console.log(ndc.data.product_name); // "Lipitor"
 * ```
 */
export class Fhirfly {
  private readonly http: HttpClient;

  /**
   * NDC (National Drug Code) lookups.
   */
  readonly ndc: NdcEndpoint;

  /**
   * NPI (National Provider Identifier) lookups.
   */
  readonly npi: NpiEndpoint;

  /**
   * RxNorm drug terminology lookups.
   */
  readonly rxnorm: RxNormEndpoint;

  /**
   * LOINC laboratory and clinical observation code lookups.
   */
  readonly loinc: LoincEndpoint;

  /**
   * ICD-10 diagnosis and procedure code lookups.
   */
  readonly icd10: Icd10Endpoint;

  /**
   * CVX vaccine code lookups.
   */
  readonly cvx: CvxEndpoint;

  /**
   * MVX vaccine manufacturer code lookups.
   */
  readonly mvx: MvxEndpoint;

  /**
   * FDA drug label lookups.
   */
  readonly fdaLabels: FdaLabelsEndpoint;

  /**
   * Connectivity Intelligence lookups.
   * Find FHIR endpoints, Direct addresses, and other connectivity options for providers.
   */
  readonly connectivity: ConnectivityEndpoint;

  /**
   * SNOMED CT IPS (International Patient Set) lookups.
   * Look up clinical concepts from the SNOMED CT IPS free set (~12K concepts, CC BY 4.0).
   */
  readonly snomed: SnomedEndpoint;

  /**
   * Create a new FHIRfly client.
   *
   * @param config - Client configuration (API key or OAuth2 client credentials)
   * @throws {Error} If neither apiKey nor clientId+clientSecret is provided
   */
  constructor(config: FhirflyConfig) {
    const baseUrl = config.baseUrl ?? "https://api.fhirfly.io";

    let httpConfig: HttpClientConfig;

    if ("apiKey" in config && config.apiKey) {
      httpConfig = {
        baseUrl,
        auth: { type: "api-key", apiKey: config.apiKey },
        timeout: config.timeout,
        maxRetries: config.maxRetries,
        retryDelay: config.retryDelay,
      };
    } else if ("clientId" in config && config.clientId && config.clientSecret) {
      const tokenManager = new TokenManager({
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        tokenUrl: config.tokenUrl ?? `${baseUrl}/oauth2/token`,
        scopes: config.scopes,
      });
      httpConfig = {
        baseUrl,
        auth: { type: "oauth", tokenManager },
        timeout: config.timeout,
        maxRetries: config.maxRetries,
        retryDelay: config.retryDelay,
      };
    } else {
      throw new Error(
        "FHIRfly requires either an apiKey or clientId+clientSecret. Get credentials at https://fhirfly.io/dashboard"
      );
    }

    this.http = new HttpClient(httpConfig);

    // Initialize endpoints
    this.ndc = new NdcEndpoint(this.http);
    this.npi = new NpiEndpoint(this.http);
    this.rxnorm = new RxNormEndpoint(this.http);
    this.loinc = new LoincEndpoint(this.http);
    this.icd10 = new Icd10Endpoint(this.http);
    this.cvx = new CvxEndpoint(this.http);
    this.mvx = new MvxEndpoint(this.http);
    this.fdaLabels = new FdaLabelsEndpoint(this.http);
    this.connectivity = new ConnectivityEndpoint(this.http);
    this.snomed = new SnomedEndpoint(this.http);
  }
}
