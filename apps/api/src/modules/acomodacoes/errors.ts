export class AcomodacaoError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message)
    this.name = 'AcomodacaoError'
  }
}

export function isAcomodacaoError(error: unknown): error is AcomodacaoError {
  return error instanceof AcomodacaoError
}
