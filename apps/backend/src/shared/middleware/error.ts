import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { HttpError, ValidationError } from "../errors";

/**
 * Global error handler middleware
 */
export const errorHandler = (err: Error, c: Context) => {
  console.error("Error:", err);

  // Handle Zod validation errors
  if (err.name === "ZodError") {
    const zodError = err as any;
    return c.json(
      {
        success: false,
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: zodError.errors,
      },
      422
    );
  }

  // Handle custom validation errors
  if (err instanceof ValidationError) {
    return c.json(
      {
        success: false,
        error: err.message,
        code: err.code,
        details: err.errors,
      },
      err.status as ContentfulStatusCode
    );
  }

  // Handle custom HTTP errors
  if (err instanceof HttpError) {
    return c.json(
      {
        success: false,
        error: err.message,
        code: err.code,
      },
      err.status as ContentfulStatusCode
    );
  }

  // Handle unknown errors
  return c.json(
    {
      success: false,
      error: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    },
    500
  );
};
