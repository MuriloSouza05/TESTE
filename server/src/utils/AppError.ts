export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const asyncHandler = (
  fn: Function
) => (
  req: any,
  res: any,
  next: any
) => Promise.resolve(fn(req, res, next)).catch(next);

export const validateRequiredFields = (
  obj: any,
  requiredFields: string[]
): void => {
  const missingFields = requiredFields.filter(field => !obj[field]);
  
  if (missingFields.length > 0) {
    throw new AppError(
      `Campos obrigatórios ausentes: ${missingFields.join(', ')}`,
      400
    );
  }
};

export const sanitizeOutput = <T extends Record<string, any>>(
  data: T,
  excludeFields: string[] = ['passwordHash']
): Partial<T> => {
  const sanitized = { ...data };
  excludeFields.forEach(field => delete sanitized[field]);
  return sanitized;
};

export const createAuditLog = async (
  prisma: any,
  userId: string,
  tenantId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  details?: Record<string, any>
) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        tenantId,
        action,
        resourceType,
        resourceId,
        details
      }
    });
  } catch (error) {
    console.error('Erro ao criar log de auditoria:', error);
  }
};