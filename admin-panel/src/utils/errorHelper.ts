/**
 * Helper to extract human-readable error messages from NestJS backend responses,
 * error objects, or string exceptions.
 */
export function formatBackendErrorMessage(err: unknown): string {
  if (!err) return "An unexpected error occurred.";
  if (typeof err === "string") return err;

  if (err instanceof Error) {
    return err.message;
  }

  if (typeof err === "object" && err !== null) {
    const errorObj = err as Record<string, unknown>;
    if (Array.isArray(errorObj.message)) {
      return errorObj.message.join(", ");
    }
    if (typeof errorObj.message === "string") {
      return errorObj.message;
    }
    if (typeof errorObj.error === "string") {
      return errorObj.error;
    }
  }

  return "An unexpected error occurred.";
}
