/**
 * Logger utility with PII sanitization for production environments
 */

const isProduction = process.env.NODE_ENV === "production";

/**
 * Sanitize a string by redacting common PII patterns
 */
function sanitizePII(text: string): string {
  if (!text || typeof text !== "string") {
    return text;
  }

  let sanitized = text;

  // Email addresses
  sanitized = sanitized.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    "[EMAIL_REDACTED]"
  );

  // Phone numbers (various formats)
  sanitized = sanitized.replace(
    /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
    "[PHONE_REDACTED]"
  );

  // Credit card numbers (16 digits)
  sanitized = sanitized.replace(
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    "[CC_REDACTED]"
  );

  // SSN
  sanitized = sanitized.replace(
    /\b\d{3}-\d{2}-\d{4}\b/g,
    "[SSN_REDACTED]"
  );

  // Passwords/tokens (common patterns)
  sanitized = sanitized.replace(
    /"(password|token|authToken|accessToken|refreshToken|secret|apiKey)"\s*:\s*"[^"]*"/gi,
    (match, key) => `"${key}": "[REDACTED]"`
  );

  return sanitized;
}

/**
 * Compute a simple hash/checksum of sensitive data for logging
 */
function computeHash(text: string): string {
  if (!text) return "";
  
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).substring(0, 8);
}

/**
 * Sanitize an object for logging
 */
function sanitizeForLogging(data: any, maxLength: number = 500): string {
  if (!data) return String(data);

  let stringified: string;
  try {
    stringified = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  } catch {
    stringified = String(data);
  }

  if (isProduction) {
    // In production, replace sensitive content with hash
    const hash = computeHash(stringified);
    return `[REDACTED_HASH:${hash}]`;
  }

  // In development, sanitize PII but keep structure
  const sanitized = sanitizePII(stringified);
  return sanitized.length > maxLength
    ? sanitized.substring(0, maxLength) + "... [truncated]"
    : sanitized;
}

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogContext {
  eventId?: string;
  ticketId?: string;
  userId?: string;
  status?: number;
  errorCode?: string;
  [key: string]: any;
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext, error?: unknown) {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const contextStr = context ? ` ${JSON.stringify(this.sanitizeContext(context))}` : "";
    const errorStr = error ? ` Error: ${this.sanitizeError(error)}` : "";

    const logMessage = `[${timestamp}] [${levelName}] ${message}${contextStr}${errorStr}`;

    switch (level) {
      case LogLevel.DEBUG:
        if (!isProduction) {
          console.debug(logMessage);
        }
        break;
      case LogLevel.INFO:
        console.log(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.ERROR:
        console.error(logMessage);
        break;
    }
  }

  private sanitizeContext(context: LogContext): LogContext {
    const sanitized: LogContext = { ...context };
    
    // Keep safe identifiers (eventId, ticketId, userId) but redact in production if needed
    if (isProduction) {
      // In production, we can keep UUIDs but remove any other sensitive data
      delete sanitized.requestBody;
      delete sanitized.responseBody;
      delete sanitized.responseText;
    }

    return sanitized;
  }

  private sanitizeError(error: unknown): string {
    if (error instanceof Error) {
      const message = sanitizeForLogging(error.message);
      if (isProduction) {
        return message; // Error messages are usually safe
      }
      // In development, include stack trace
      return `${message}${error.stack ? `\n${error.stack}` : ""}`;
    }
    return sanitizeForLogging(String(error));
  }

  debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext, error?: unknown) {
    this.log(LogLevel.WARN, message, context, error);
  }

  error(message: string, context?: LogContext, error?: unknown) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log backend API request (sanitized)
   */
  logBackendRequest(
    method: string,
    url: string,
    context?: LogContext
  ) {
    if (isProduction) {
      // Redact all numeric ID segments in the URL path (e.g., /123, /456)
      // Matches a slash followed by one or more digits, followed by a slash or end-of-string
      const redactedUrl = url.replace(/\/\d+(?=\/|$)/g, "/***");
      
      this.info(`Backend ${method} ${redactedUrl}`, {
        ...context,
        url: redactedUrl,
      });
    } else {
      this.debug(`Backend ${method} ${url}`, context);
    }
  }

  /**
   * Log backend API response (sanitized)
   */
  logBackendResponse(
    status: number,
    context?: LogContext
  ) {
    const safeContext: LogContext = {
      status,
      ...(context?.eventId && { eventId: context.eventId }),
      ...(context?.ticketId && { ticketId: context.ticketId }),
      ...(context?.errorCode && { errorCode: context.errorCode }),
    };

    if (status >= 400) {
      this.error(`Backend responded with status ${status}`, safeContext);
    } else {
      this.info(`Backend responded with status ${status}`, safeContext);
    }
  }

  /**
   * Log backend error response (sanitized)
   */
  logBackendError(
    status: number,
    errorBody: any,
    responseText: string,
    context?: LogContext
  ) {
    const safeContext: LogContext = {
      status,
      ...(context?.eventId && { eventId: context.eventId }),
      ...(context?.ticketId && { ticketId: context.ticketId }),
    };

    if (isProduction) {
      // In production: log only status and error code if present
      const errorCode =
        errorBody?.code || errorBody?.errorCode || errorBody?.error?.code;
      if (errorCode) {
        safeContext.errorCode = String(errorCode);
      }
      this.error(`Backend error response (${status})`, safeContext);
    } else {
      // In development: log sanitized response
      const sanitizedErrorBody = sanitizeForLogging(errorBody);
      const sanitizedResponseText = sanitizeForLogging(responseText, 200);
      
      this.error(`Backend error response (${status})`, {
        ...safeContext,
        errorBody: sanitizedErrorBody,
        responseText: sanitizedResponseText,
      });
    }
  }
}

export const logger = new Logger();


