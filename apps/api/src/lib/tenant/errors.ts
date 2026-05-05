export class MissingTenantContextError extends Error {
  constructor() {
    super('Repository requires tenant context - ctx.orgId is missing or empty')
    this.name = 'MissingTenantContextError'
  }
}

export class TenantForbiddenError extends Error {
  constructor(operation: string) {
    super(`Role does not have permission to perform: ${operation}`)
    this.name = 'TenantForbiddenError'
  }
}
