import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { AppError, asyncHandler, createAuditLog } from '../utils/AppError';

const router = Router();
const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  tenantId: z.string().optional()
});

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password, tenantId } = loginSchema.parse(req.body);

  const user = await prisma.user.findFirst({
    where: {
      email,
      ...(tenantId && { tenantId })
    },
    include: {
      tenant: {
        select: {
          id: true,
          companyName: true,
          planType: true,
          isActive: true,
          expiresAt: true
        }
      }
    }
  });

  if (!user) {
    throw new AppError('Credenciais inválidas', 401);
  }

  if (!user.isActive) {
    throw new AppError('Usuário inativo', 403);
  }

  if (!user.tenant.isActive) {
    throw new AppError('Empresa inativa', 403);
  }

  if (user.tenant.expiresAt && user.tenant.expiresAt < new Date()) {
    throw new AppError('Assinatura expirada', 403);
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    throw new AppError('Credenciais inválidas', 401);
  }

  const token = jwt.sign(
    {
      userId: user.id,
      tenantId: user.tenantId,
      accountType: user.accountType
    },
    process.env.JWT_SECRET || 'your_jwt_secret_key',
    { expiresIn: '24h' }
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  });

  await createAuditLog(
    prisma,
    user.id,
    user.tenantId,
    'LOGIN',
    'USER',
    user.id,
    { email: user.email }
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      accountType: user.accountType,
      tenant: user.tenant
    }
  });
}));

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  tenantId: z.string().uuid('ID do tenant inválido'),
  accountType: z.enum(['SIMPLE', 'COMPOSITE', 'MANAGERIAL'])
});

router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, tenantId, accountType } = registerSchema.parse(req.body);

  const existingUser = await prisma.user.findFirst({
    where: { email, tenantId }
  });

  if (existingUser) {
    throw new AppError('Usuário já existe', 409);
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId }
  });

  if (!tenant) {
    throw new AppError('Tenant não encontrado', 404);
  }

  if (!tenant.isActive) {
    throw new AppError('Tenant inativo', 403);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      tenantId,
      accountType
    }
  });

  await createAuditLog(
    prisma,
    user.id,
    tenantId,
    'REGISTER',
    'USER',
    user.id,
    { email: user.email, accountType }
  );

  res.status(201).json({
    message: 'Usuário criado com sucesso',
    user: {
      id: user.id,
      email: user.email,
      accountType
    }
  });
}));

// Rota de logout
router.post('/logout', asyncHandler(async (req, res) => {
  // Em um sistema com blacklist de tokens, você adicionaria o token à blacklist aqui
  // Para JWT stateless, o logout é feito no frontend removendo o token
  
  res.json({
    message: 'Logout realizado com sucesso'
  });
}));

export { router as authRoutes };