/**
 * AuthError — thrown by AuthService for expected auth failures.
 * The router layer catches these and maps them to HTTP responses.
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly httpStatus: number = 400,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
