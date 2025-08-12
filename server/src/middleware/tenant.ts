import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.tenantId) {
      throw new AppError('Tenant ID não encontrado', 401);
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: req.user.tenantId },
      select: { isActive: true, expiresAt: true }
    });

    if (!tenant) {
      throw new AppError('Tenant não encontrado', 404);
    }

    if (!tenant.isActive) {
      throw new AppError('Tenant inativo', 403);
    }

    if (tenant.expiresAt && tenant.expiresAt < new Date()) {
      throw new AppError('Assinatura expirada', 403);
    }

    // Adiciona o tenant ID ao contexto do Prisma para todas as queries
    const tenantId = req.user.tenantId;
    
    // Middleware que adiciona automaticamente o tenantId em todas as operações
    prisma.$use(async (params, next) => {
      // Lista de modelos que devem ter o tenant ID
      const tenantModels = [
        'User',
        'Client',
        'Project',
        'Task',
        'Invoice',
        'Transaction',
        'AuditLog'
      ];

      if (tenantModels.includes(params.model)) {
        if (params.action === 'findUnique' || params.action === 'findFirst') {
          // Adiciona tenantId na condição where
          params.args.where['tenantId'] = tenantId;
        }
        else if (params.action === 'findMany') {
          // Adiciona tenantId na condição where
          if (!params.args) params.args = { where: {} };
          if (!params.args.where) params.args.where = {};
          params.args.where['tenantId'] = tenantId;
        }
        else if (params.action === 'create' || params.action === 'createMany') {
          // Adiciona tenantId nos dados
          if (params.args.data) {
            params.args.data['tenantId'] = tenantId;
          }
        }
        else if (params.action === 'update' || params.action === 'updateMany') {
          // Adiciona tenantId na condição where
          if (!params.args.where) params.args.where = {};
          params.args.where['tenantId'] = tenantId;
        }
        else if (params.action === 'delete' || params.action === 'deleteMany') {
          // Adiciona tenantId na condição where
          if (!params.args.where) params.args.where = {};
          params.args.where['tenantId'] = tenantId;
        }
      }

      return next(params);
    });

    next();
  } catch (error) {
    next(error);
  }
};