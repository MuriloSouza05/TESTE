import { Request, Response, NextFunction } from 'express';
import { PrismaClient, PlanType } from '@prisma/client';

const prisma = new PrismaClient();

// Definição dos níveis de plano (do menor para o maior)
const PLAN_LEVELS = {
  SIMPLE: 1,
  COMPOSITE: 2,
  MANAGERIAL: 3
};

// Módulos disponíveis por plano
const PLAN_MODULES = {
  SIMPLE: [
    'dashboard',
    'crm',
    'clients',
    'basic_reports'
  ],
  COMPOSITE: [
    'dashboard',
    'crm',
    'clients',
    'projects',
    'tasks',
    'basic_reports',
    'project_reports',
    'file_management'
  ],
  MANAGERIAL: [
    'dashboard',
    'crm',
    'clients',
    'projects',
    'tasks',
    'billing',
    'invoices',
    'cash_flow',
    'transactions',
    'advanced_reports',
    'analytics',
    'file_management',
    'audit_logs',
    'user_management'
  ]
};

// Limites por plano
const PLAN_LIMITS = {
  SIMPLE: {
    maxUsers: 3,
    maxClients: 50,
    maxProjects: 0, // Não permitido
    maxStorage: 1024 * 1024 * 100, // 100MB
    features: {
      projects: false,
      billing: false,
      advanced_reports: false,
      api_access: false
    }
  },
  COMPOSITE: {
    maxUsers: 10,
    maxClients: 200,
    maxProjects: 100,
    maxStorage: 1024 * 1024 * 500, // 500MB
    features: {
      projects: true,
      billing: false,
      advanced_reports: false,
      api_access: true
    }
  },
  MANAGERIAL: {
    maxUsers: -1, // Ilimitado
    maxClients: -1, // Ilimitado
    maxProjects: -1, // Ilimitado
    maxStorage: 1024 * 1024 * 1024 * 5, // 5GB
    features: {
      projects: true,
      billing: true,
      advanced_reports: true,
      api_access: true
    }
  }
};

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    tenantId: string;
    accountType: string;
  };
  tenant?: {
    id: string;
    planType: PlanType;
    isActive: boolean;
  };
}

/**
 * Middleware para verificar se o plano do tenant permite acesso a um módulo específico
 */
export const checkPlanAccess = (requiredModule: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user?.tenantId;
      
      if (!tenantId) {
        return res.status(401).json({ 
          error: 'Token de autenticação inválido',
          code: 'INVALID_TOKEN'
        });
      }

      // Buscar informações do tenant
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
          id: true,
          planType: true,
          isActive: true,
          expiresAt: true
        }
      });

      if (!tenant) {
        return res.status(404).json({ 
          error: 'Empresa não encontrada',
          code: 'TENANT_NOT_FOUND'
        });
      }

      if (!tenant.isActive) {
        return res.status(403).json({ 
          error: 'Conta da empresa está inativa',
          code: 'TENANT_INACTIVE'
        });
      }

      // Verificar se a conta expirou
      if (tenant.expiresAt && new Date() > tenant.expiresAt) {
        return res.status(403).json({ 
          error: 'Plano da empresa expirou',
          code: 'PLAN_EXPIRED',
          expiresAt: tenant.expiresAt
        });
      }

      // Verificar se o plano permite acesso ao módulo
      const allowedModules = PLAN_MODULES[tenant.planType];
      if (!allowedModules.includes(requiredModule)) {
        return res.status(403).json({ 
          error: `Acesso negado. O plano ${tenant.planType} não inclui o módulo '${requiredModule}'`,
          code: 'PLAN_ACCESS_DENIED',
          currentPlan: tenant.planType,
          requiredModule,
          allowedModules,
          suggestedPlans: getSuggestedPlans(requiredModule)
        });
      }

      // Adicionar informações do tenant à requisição
      req.tenant = tenant;
      next();
    } catch (error) {
      console.error('Erro no middleware de controle de plano:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

/**
 * Middleware para verificar limites do plano (usuários, clientes, etc.)
 */
export const checkPlanLimits = (resourceType: 'users' | 'clients' | 'projects' | 'storage') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user?.tenantId;
      const tenant = req.tenant;
      
      if (!tenant || !tenantId) {
        return res.status(401).json({ 
          error: 'Informações de autenticação inválidas',
          code: 'INVALID_AUTH'
        });
      }

      const limits = PLAN_LIMITS[tenant.planType];
      let currentCount = 0;
      let maxAllowed = 0;

      switch (resourceType) {
        case 'users':
          currentCount = await prisma.user.count({ where: { tenantId } });
          maxAllowed = limits.maxUsers;
          break;
        case 'clients':
          currentCount = await prisma.client.count({ where: { tenantId } });
          maxAllowed = limits.maxClients;
          break;
        case 'projects':
          currentCount = await prisma.project.count({ where: { tenantId } });
          maxAllowed = limits.maxProjects;
          break;
        case 'storage':
          // Calcular uso de storage (implementar conforme necessário)
          const files = await prisma.file.findMany({ 
            where: { tenantId },
            select: { size: true }
          });
          currentCount = files.reduce((total, file) => total + (file.size || 0), 0);
          maxAllowed = limits.maxStorage;
          break;
      }

      // -1 significa ilimitado
      if (maxAllowed !== -1 && currentCount >= maxAllowed) {
        return res.status(403).json({ 
          error: `Limite do plano atingido para ${resourceType}`,
          code: 'PLAN_LIMIT_EXCEEDED',
          currentPlan: tenant.planType,
          resourceType,
          currentCount,
          maxAllowed,
          suggestedPlans: getSuggestedPlansForLimit(resourceType, tenant.planType)
        });
      }

      next();
    } catch (error) {
      console.error('Erro no middleware de limite de plano:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

/**
 * Middleware para verificar se uma feature específica está disponível no plano
 */
export const checkPlanFeature = (feature: keyof typeof PLAN_LIMITS.SIMPLE.features) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tenant = req.tenant;
      
      if (!tenant) {
        return res.status(401).json({ 
          error: 'Informações de autenticação inválidas',
          code: 'INVALID_AUTH'
        });
      }

      const limits = PLAN_LIMITS[tenant.planType];
      
      if (!limits.features[feature]) {
        return res.status(403).json({ 
          error: `Feature '${feature}' não disponível no plano ${tenant.planType}`,
          code: 'FEATURE_NOT_AVAILABLE',
          currentPlan: tenant.planType,
          feature,
          suggestedPlans: getSuggestedPlansForFeature(feature)
        });
      }

      next();
    } catch (error) {
      console.error('Erro no middleware de feature do plano:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

/**
 * Função para obter planos sugeridos que incluem um módulo específico
 */
function getSuggestedPlans(requiredModule: string): PlanType[] {
  const suggestions: PlanType[] = [];
  
  Object.entries(PLAN_MODULES).forEach(([plan, modules]) => {
    if (modules.includes(requiredModule)) {
      suggestions.push(plan as PlanType);
    }
  });
  
  return suggestions;
}

/**
 * Função para obter planos sugeridos baseado em limites
 */
function getSuggestedPlansForLimit(resourceType: string, currentPlan: PlanType): PlanType[] {
  const currentLevel = PLAN_LEVELS[currentPlan];
  const suggestions: PlanType[] = [];
  
  Object.entries(PLAN_LEVELS).forEach(([plan, level]) => {
    if (level > currentLevel) {
      suggestions.push(plan as PlanType);
    }
  });
  
  return suggestions;
}

/**
 * Função para obter planos sugeridos baseado em features
 */
function getSuggestedPlansForFeature(feature: string): PlanType[] {
  const suggestions: PlanType[] = [];
  
  Object.entries(PLAN_LIMITS).forEach(([plan, limits]) => {
    if (limits.features[feature as keyof typeof limits.features]) {
      suggestions.push(plan as PlanType);
    }
  });
  
  return suggestions;
}

/**
 * Função utilitária para obter informações do plano
 */
export const getPlanInfo = (planType: PlanType) => {
  return {
    planType,
    level: PLAN_LEVELS[planType],
    modules: PLAN_MODULES[planType],
    limits: PLAN_LIMITS[planType]
  };
};

/**
 * Função utilitária para verificar se um plano pode acessar um módulo
 */
export const canAccessModule = (planType: PlanType, module: string): boolean => {
  return PLAN_MODULES[planType].includes(module);
};

/**
 * Função utilitária para verificar se um plano tem uma feature
 */
export const hasFeature = (planType: PlanType, feature: keyof typeof PLAN_LIMITS.SIMPLE.features): boolean => {
  return PLAN_LIMITS[planType].features[feature];
};

export { PLAN_MODULES, PLAN_LIMITS, PLAN_LEVELS };