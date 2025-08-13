import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AppError, asyncHandler, createAuditLog } from '../utils/AppError';
import { checkPermission } from '../middleware/auth';
import { checkPlanAccess, checkPlanLimits, checkPlanFeature } from '../middleware/planAccess';

const router = Router();
const prisma = new PrismaClient();

// Rotas de Clientes
const createClientSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  pis: z.string().optional(),
  cei: z.string().optional(),
  inssStatus: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional()
  }).optional()
});

router.post('/clients', checkPlanAccess('clients'), checkPlanLimits('clients'), asyncHandler(async (req, res) => {
  const data = createClientSchema.parse(req.body);
  const { user } = req;

  const client = await prisma.client.create({
    data: {
      ...data,
      tenantId: user!.tenantId
    }
  });

  await createAuditLog(
    prisma,
    user!.userId,
    user!.tenantId,
    'CREATE',
    'CLIENT',
    client.id
  );

  res.status(201).json(client);
}));

// Rotas de Projetos
const createProjectSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  clientId: z.string().uuid('ID do cliente inválido'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  budget: z.number().optional(),
  userId: z.string().uuid('ID do usuário inválido')
});

router.post('/projects', checkPlanAccess('projects'), checkPlanLimits('projects'), asyncHandler(async (req, res) => {
  const data = createProjectSchema.parse(req.body);
  const { user } = req;

  const project = await prisma.project.create({
    data: {
      ...data,
      tenantId: user!.tenantId,
      status: 'NOT_STARTED',
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null
    }
  });

  await createAuditLog(
    prisma,
    user!.userId,
    user!.tenantId,
    'CREATE',
    'PROJECT',
    project.id
  );

  res.status(201).json(project);
}));

// Rotas de Tarefas
const createTaskSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  projectId: z.string().uuid('ID do projeto inválido'),
  userId: z.string().uuid('ID do usuário inválido'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  estimatedHours: z.number().optional(),
  dueDate: z.string().datetime().optional()
});

router.post('/tasks', checkPlanAccess('tasks'), asyncHandler(async (req, res) => {
  const data = createTaskSchema.parse(req.body);
  const { user } = req;

  const task = await prisma.task.create({
    data: {
      ...data,
      tenantId: user!.tenantId,
      status: 'TODO',
      dueDate: data.dueDate ? new Date(data.dueDate) : null
    }
  });

  await createAuditLog(
    prisma,
    user!.userId,
    user!.tenantId,
    'CREATE',
    'TASK',
    task.id
  );

  res.status(201).json(task);
}));

// Rotas de Faturamento
const createInvoiceSchema = z.object({
  number: z.string(),
  clientId: z.string().uuid('ID do cliente inválido'),
  projectId: z.string().uuid('ID do projeto inválido'),
  amount: z.number().positive('Valor deve ser positivo'),
  dueDate: z.string().datetime(),
  description: z.string().optional()
});

router.post('/invoices', checkPlanAccess('billing'), checkPermission(['COMPOSITE', 'MANAGERIAL']), asyncHandler(async (req, res) => {
  const data = createInvoiceSchema.parse(req.body);
  const { user } = req;

  const invoice = await prisma.invoice.create({
    data: {
      ...data,
      tenantId: user!.tenantId,
      status: 'DRAFT',
      dueDate: new Date(data.dueDate)
    }
  });

  await createAuditLog(
    prisma,
    user!.userId,
    user!.tenantId,
    'CREATE',
    'INVOICE',
    invoice.id
  );

  res.status(201).json(invoice);
}));

// Rotas de Fluxo de Caixa
const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().positive('Valor deve ser positivo'),
  category: z.string(),
  description: z.string().optional(),
  date: z.string().datetime(),
  isRecurring: z.boolean().default(false)
});

router.post('/transactions', checkPlanAccess('cash_flow'), checkPermission(['COMPOSITE', 'MANAGERIAL']), asyncHandler(async (req, res) => {
  const data = createTransactionSchema.parse(req.body);
  const { user } = req;

  const transaction = await prisma.transaction.create({
    data: {
      ...data,
      tenantId: user!.tenantId,
      date: new Date(data.date)
    }
  });

  await createAuditLog(
    prisma,
    user!.userId,
    user!.tenantId,
    'CREATE',
    'TRANSACTION',
    transaction.id
  );

  res.status(201).json(transaction);
}));

// Rotas de Dashboard
router.get('/dashboard', asyncHandler(async (req, res) => {
  const { user } = req;

  const [projects, tasks, invoices, transactions] = await Promise.all([
    prisma.project.count({ where: { tenantId: user!.tenantId } }),
    prisma.task.count({ where: { tenantId: user!.tenantId, status: 'TODO' } }),
    prisma.invoice.findMany({
      where: {
        tenantId: user!.tenantId,
        status: 'SENT',
        dueDate: {
          gte: new Date()
        }
      },
      select: {
        amount: true
      }
    }),
    prisma.transaction.findMany({
      where: {
        tenantId: user!.tenantId,
        date: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
        }
      }
    })
  ]);

  const totalReceivables = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const monthlyBalance = transactions.reduce((sum, t) => {
    return sum + (t.type === 'INCOME' ? t.amount : -t.amount);
  }, 0);

  res.json({
    activeProjects: projects,
    pendingTasks: tasks,
    totalReceivables,
    monthlyBalance
  });
}));

// Rotas GET para buscar dados
router.get('/clients', asyncHandler(async (req, res) => {
  const { user } = req;
  
  const clients = await prisma.client.findMany({
    where: { tenantId: user!.tenantId },
    orderBy: { createdAt: 'desc' }
  });
  
  res.json(clients);
}));

router.get('/projects', asyncHandler(async (req, res) => {
  const { user } = req;
  
  const projects = await prisma.project.findMany({
    where: { tenantId: user!.tenantId },
    include: {
      client: { select: { name: true } },
      assignedTo: { select: { email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  res.json(projects);
}));

router.get('/tasks', asyncHandler(async (req, res) => {
  const { user } = req;
  
  const tasks = await prisma.task.findMany({
    where: { tenantId: user!.tenantId },
    include: {
      project: { select: { title: true } },
      assignedTo: { select: { email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  res.json(tasks);
}));

router.get('/invoices', asyncHandler(async (req, res) => {
  const { user } = req;
  
  const invoices = await prisma.invoice.findMany({
    where: { tenantId: user!.tenantId },
    include: {
      client: { select: { name: true } },
      project: { select: { title: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  res.json(invoices);
}));

router.get('/transactions', asyncHandler(async (req, res) => {
  const { user } = req;
  
  const transactions = await prisma.transaction.findMany({
    where: { tenantId: user!.tenantId },
    orderBy: { date: 'desc' }
  });
  
  res.json(transactions);
}));

export { router as tenantRoutes };