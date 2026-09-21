/**
 * Request correlation utility for tracing operations across client and server.
 * Ensures consistent traceability without exposing sensitive identifiers.
 */
export function generateCorrelationId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `mw-${crypto.randomUUID()}`;
  }
  return `mw-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
