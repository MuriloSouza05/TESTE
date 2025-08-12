import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { AppError, asyncHandler, createAuditLog } from '../utils/AppError';
import { requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const adminLoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  adminKey: z.string()
});

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password, adminKey } = adminLoginSchema.parse(req.body);

  if (adminKey !== process.env.ADMIN_KEY) {
    throw new AppError('Chave administrativa inválida', 401);
  }

  // Aqui você implementaria a lógica de verificação do admin
  // Por exemplo, verificar contra uma tabela de admins no banco
  // Por hora, vamos usar um admin mockado para demonstração
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (email !== adminEmail || password !== adminPassword) {
    throw new AppError('Credenciais administrativas inválidas', 401);
  }

  const token = jwt.sign(
    { isAdmin: true },
    process.env.JWT_SECRET || 'your_jwt_secret_key',
    { expiresIn: '24h' }
  );

  res.json({ token });
}));

// Rotas protegidas por autenticação administrativa
router.use(requireAdmin);

const createTenantSchema = z.object({
  companyName: z.string().min(3, 'Nome da empresa deve ter no mínimo 3 caracteres'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  planType: z.enum(['SIMPLE', 'COMPOSITE', 'MANAGERIAL']),
  expiresAt: z.string().datetime().optional()
});

router.post('/tenants', asyncHandler(async (req, res) => {
  const data = createTenantSchema.parse(req.body);

  const existingTenant = await prisma.tenant.findUnique({
    where: { cnpj: data.cnpj }
  });

  if (existingTenant) {
    throw new AppError('CNPJ já cadastrado', 409);
  }

  const tenant = await prisma.tenant.create({
    data: {
      ...data,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
    }
  });

  res.status(201).json(tenant);
}));

router.get('/tenants', asyncHandler(async (req, res) => {
  const tenants = await prisma.tenant.findMany({
    include: {
      _count: {
        select: {
          users: true,
          clients: true,
          projects: true
        }
      }
    }
  });

  res.json(tenants);
}));

router.get('/metrics', asyncHandler(async (req, res) => {
  const [totalTenants, activeTenants, totalUsers, transactions] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.transaction.findMany({
      where: {
        date: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
        }
      }
    })
  ]);

  const monthlyRevenue = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const metrics = {
    totalTenants,
    activeTenants,
    totalUsers,
    monthlyRevenue,
    systemUsage: {
      storage: 0, // Implementar cálculo real
      bandwidth: 0, // Implementar cálculo real
      apiCalls: 0 // Implementar contador real
    }
  };

  res.json(metrics);
}));

router.patch('/tenants/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive, expiresAt, planType } = req.body;

  const tenant = await prisma.tenant.update({
    where: { id },
    data: {
      ...(isActive !== undefined && { isActive }),
      ...(expiresAt && { expiresAt: new Date(expiresAt) }),
      ...(planType && { planType })
    }
  });

  res.json(tenant);
}));

router.get('/audit-logs', asyncHandler(async (req, res) => {
  const logs = await prisma.auditLog.findMany({
    include: {
      user: {
        select: {
          email: true
        }
      },
      tenant: {
        select: {
          companyName: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 100
  });

  res.json(logs);
}));

export { router as adminRoutes };