/**
 * Base error class for all FHIRfly SDK errors.
 */
export class FhirflyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FhirflyError";
    Object.setPrototypeOf(this, FhirflyError.prototype);
  }
}

/**
 * Error thrown when the API returns an error response.
 */
export class ApiError extends FhirflyError {
  readonly statusCode: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    code?: string,
    details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Error thrown when authentication fails (401).
 */
export class AuthenticationError extends ApiError {
  constructor(message = "Authentication failed. Check your API key.") {
    super(message, 401, "AUTHENTICATION_ERROR");
    this.name = "AuthenticationError";
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Error thrown when a resource is not found (404).
 */
export class NotFoundError extends ApiError {
  readonly code_type: string;
  readonly code_value: string;

  constructor(codeType: string, codeValue: string) {
    super(`${codeType} not found: ${codeValue}`, 404, "NOT_FOUND");
    this.name = "NotFoundError";
    this.code_type = codeType;
    this.code_value = codeValue;
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Error thrown when the request is invalid (400).
 */
export class ValidationError extends ApiError {
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
    this.field = field;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error thrown when rate limited (429).
 */
export class RateLimitError extends ApiError {
  readonly retryAfter?: number;
  readonly limit?: number;
  readonly remaining?: number;
  readonly reset?: Date;

  constructor(
    message = "Rate limit exceeded",
    retryAfter?: number,
    limit?: number,
    remaining?: number,
    reset?: Date
  ) {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
    this.limit = limit;
    this.remaining = remaining;
    this.reset = reset;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Error thrown when quota is exceeded (429 with quota context).
 */
export class QuotaExceededError extends ApiError {
  readonly quotaLimit?: number;
  readonly quotaUsed?: number;
  readonly quotaResetDate?: Date;

  constructor(
    message = "Monthly quota exceeded",
    quotaLimit?: number,
    quotaUsed?: number,
    quotaResetDate?: Date
  ) {
    super(message, 429, "QUOTA_EXCEEDED");
    this.name = "QuotaExceededError";
    this.quotaLimit = quotaLimit;
    this.quotaUsed = quotaUsed;
    this.quotaResetDate = quotaResetDate;
    Object.setPrototypeOf(this, QuotaExceededError.prototype);
  }
}

/**
 * Error thrown when the server returns a 5xx error.
 */
export class ServerError extends ApiError {
  constructor(message = "Server error", statusCode = 500) {
    super(message, statusCode, "SERVER_ERROR");
    this.name = "ServerError";
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

/**
 * Error thrown when a network error occurs.
 */
export class NetworkError extends FhirflyError {
  readonly cause?: Error;

  constructor(message = "Network error", cause?: Error) {
    super(message);
    this.name = "NetworkError";
    this.cause = cause;
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Error thrown when a request times out.
 */
export class TimeoutError extends FhirflyError {
  readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`);
    this.name = "TimeoutError";
    this.timeoutMs = timeoutMs;
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}
