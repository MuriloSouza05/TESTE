# PROMPT COMPLETO - BACKEND SISTEMA DE GESTÃO JURÍDICA SaaS

## CONTEXTO DO PROJETO

Este é um sistema de gestão para escritórios de advocacia desenvolvido como SaaS multi-tenant. O frontend já está implementado com React + TypeScript + Express, e agora precisa de um backend completo integrado com PostgreSQL.

## ESTRUTURA ATUAL DO PROJETO

```
client/                   # Frontend React já implementado
├── pages/               # Páginas: Dashboard, CRM, Projects, Tasks, Billing, CashFlow, etc.
├── components/          # Componentes UI já desenvolvidos
├── types/              # TypeScript interfaces já definidas
└── hooks/              # Hooks customizados

server/                  # Backend atual (básico, precisa expansão total)
├── index.ts            # Servidor Express básico
└── routes/             # Rotas básicas (apenas demo)

shared/                  # Tipos compartilhados
└── api.ts              # Interfaces de API
```

## REQUISITOS FUNCIONAIS PRINCIPAIS

### 1. SISTEMA MULTI-TENANT (ISOLAMENTO TOTAL DE DADOS)
- Cada empresa/escritório deve ter seus dados completamente isolados
- Todas as tabelas devem ter `tenant_id` para segregação de dados
- Middleware obrigatório para filtrar dados por tenant em todas as queries
- Sistema de onboarding para novas empresas

### 2. AUTENTICAÇÃO DUPLA E AUTORIZAÇÃO
**A) Login de Usuários das Empresas (Área Principal)**
- JWT Authentication com refresh tokens
- Controle de acesso baseado em roles por tenant
- Sessions persistentes com expiração configurável

**B) Login Administrativo do SaaS (Área /admin)**
- Login separado para administração do SaaS
- Super usuário com acesso a todas as empresas
- Dashboard administrativo completo

### 3. TRÊS TIPOS DE CONTA COM CONTROLE DE ACESSO

**CONTA SIMPLES**
- Módulos: CRM, Projetos, Tarefas, Cobrança, Configurações básicas
- Limitações: Sem Dashboard, sem Fluxo de Caixa, sem gestão de usuários

**CONTA COMPOSTA** 
- Tudo da Simples + Fluxo de Caixa + Dashboard básico
- Limitações: Sem gestão de usuários, configurações limitadas

**CONTA GERENCIAL**
- Acesso completo a todos os módulos
- Gestão de usuários da empresa
- Configurações avançadas
- Dashboard completo com todas as métricas

### 4. MÓDULOS DO SISTEMA (já implementados no frontend)

**CRM (Customer Relationship Management)**
- Clientes com dados completos
- Pipeline de vendas/negociações
- Histórico de interações
- Filtros avançados

**PROJETOS/CASOS JURÍDICOS**
- Gerenciamento de casos
- Status: Novo, Ativo, Finalizado, Suspenso, Arquivado
- Prazos e documentos
- Kanban board

**TAREFAS**
- Task management integrado aos projetos
- Atribuição de responsáveis
- Prazos e prioridades

**COBRANÇA/BILLING**
- Faturas e documentos fiscais
- Controle de pagamentos
- Relatórios financeiros

**FLUXO DE CAIXA** (apenas Conta Composta e Gerencial)
- Receitas e despesas
- Categorização
- Relatórios analíticos

**DASHBOARD** (limitado por tipo de conta)
- Métricas financeiras
- Gráficos e indicadores
- Visão geral operacional

### 5. PAINEL ADMINISTRATIVO (/admin)
- Gestão de empresas (tenants)
- Criação e suspensão de contas
- Monitoramento de uso por empresa
- Controle de planos e expiração
- Dashboard com métricas globais do SaaS
- Sistema de auditoria e logs
- Gestão de usuários super admin

## ESPECIFICAÇÕES TÉCNICAS

### TECNOLOGIAS OBRIGATÓRIAS
- **Backend**: Node.js + Express + TypeScript
- **Banco**: PostgreSQL + Prisma ORM
- **Autenticação**: JWT + bcrypt
- **Middleware**: cors, helmet, rate-limiting
- **Validação**: Zod (já usado no projeto)
- **Cache**: Redis (opcional mas recomendado)

### ESTRUTURA DO BANCO DE DADOS

#### TABELAS PRINCIPAIS (todas com tenant_id)

```sql
-- Tabela de empresas/tenants
tenants (
  id, name, plan_type, status, created_at, expires_at,
  settings_json, max_users, is_active
)

-- Usuários por tenant
users (
  id, tenant_id, email, password_hash, role, name,
  is_active, last_login, created_at
)

-- Clientes (CRM)
clients (
  id, tenant_id, name, email, phone, company,
  address_json, status, created_by, created_at
)

-- Projetos/Casos
projects (
  id, tenant_id, name, description, client_id,
  status, due_date, created_by, assigned_to, created_at
)

-- Tarefas
tasks (
  id, tenant_id, project_id, title, description,
  status, priority, due_date, assigned_to, created_at
)

-- Faturas
invoices (
  id, tenant_id, client_id, number, amount,
  status, due_date, created_at
)

-- Transações (Fluxo de Caixa)
transactions (
  id, tenant_id, type, category, amount, description,
  date, created_by, created_at
)

-- Sistema de auditoria
audit_logs (
  id, tenant_id, user_id, action, entity_type,
  entity_id, changes_json, created_at
)
```

### MIDDLEWARE OBRIGATÓRIO

```typescript
// Middleware de autenticação
authMiddleware()

// Middleware de tenant isolation
tenantMiddleware() // Adiciona tenant_id a todas as queries

// Middleware de autorização por role
roleMiddleware(['admin', 'user'])

// Middleware de controle de plano
planMiddleware(['simple', 'compound', 'manager'])
```

### ESTRUTURA DE ROTAS

```
/api/auth/
  POST /login
  POST /logout  
  POST /refresh
  GET /me

/api/admin/auth/
  POST /login
  GET /dashboard
  
/api/tenants/
  GET / (admin only)
  POST / (admin only)
  PUT /:id (admin only)
  DELETE /:id (admin only)

/api/clients/
  GET /
  POST /
  PUT /:id
  DELETE /:id
  GET /:id/projects

/api/projects/
  GET /
  POST /
  PUT /:id
  DELETE /:id
  GET /:id/tasks

/api/tasks/
  GET /
  POST /
  PUT /:id
  DELETE /:id

/api/invoices/
  GET /
  POST /
  PUT /:id
  DELETE /:id

/api/transactions/ (apenas conta compound/manager)
  GET /
  POST /
  PUT /:id
  DELETE /:id

/api/dashboard/ (limitado por plano)
  GET /metrics
  GET /charts-data

/api/users/ (apenas conta manager)
  GET /
  POST /
  PUT /:id
  DELETE /:id
```

### CONTROLE DE ACESSO DINÂMICO

```typescript
// Exemplo de controle por plano
const planPermissions = {
  simple: ['clients', 'projects', 'tasks', 'invoices'],
  compound: ['clients', 'projects', 'tasks', 'invoices', 'transactions', 'dashboard'],
  manager: ['*'] // Acesso total
};

// Middleware para verificar permissões
const checkPlanAccess = (module: string) => {
  return (req, res, next) => {
    const userPlan = req.tenant.plan_type;
    const hasAccess = planPermissions[userPlan].includes(module) || 
                     planPermissions[userPlan].includes('*');
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Plano não permite acesso a este módulo' });
    }
    next();
  };
};
```

## IMPLEMENTAÇÃO PRIORITÁRIA

### FASE 1: CORE DO SISTEMA
1. Configurar Prisma + PostgreSQL
2. Implementar sistema de autenticação
3. Criar middleware de tenant isolation
4. Implementar CRUD básico para todas as entidades

### FASE 2: CONTROLE DE ACESSO
1. Sistema de roles e permissões
2. Controle de planos
3. Middleware de autorização
4. Painel administrativo básico

### FASE 3: FUNCIONALIDADES AVANÇADAS
1. Sistema de auditoria
2. Dashboard com métricas reais
3. Relatórios e exports
4. Sistema de notificações

### FASE 4: OTIMIZAÇÕES
1. Cache com Redis
2. Rate limiting
3. Logs estruturados
4. Monitoramento

## CONFIGURAÇÕES NECESSÁRIAS

### Variáveis de Ambiente
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
ADMIN_JWT_SECRET=...
REDIS_URL=... (opcional)
NODE_ENV=development
PORT=8080
```

### Scripts Package.json
```json
{
  "scripts": {
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "tsx prisma/seed.ts",
    "dev:db": "docker compose up -d postgres",
    "dev": "concurrently \"npm run dev:db\" \"vite\""
  }
}
```

## DADOS DE TESTE E SEED

Criar um sistema completo de seed com:
- 3 empresas de teste (uma para cada plano)
- Usuários administrativos
- Dados fictícios para todos os módulos
- Relacionamentos completos entre entidades

## INTEGRAÇÃO COM FRONTEND

O frontend já está 100% implementado e funcionando com dados mock. A implementação do backend deve:

1. **Manter todas as interfaces TypeScript existentes** em `shared/api.ts`
2. **Substituir gradualmente os dados mock** por dados reais da API
3. **Implementar o sistema de logout** e redirecionamento para login
4. **Adicionar controle de acesso visual** baseado no plano do usuário
5. **Criar componentes condicionais** que aparecem/desaparecem baseado nas permissões

## RESULTADO ESPERADO

Após a implementação completa, o sistema deve:

✅ Permitir múltiplas empresas com dados totalmente isolados
✅ Ter autenticação robusta para usuários e admins
✅ Controlar acesso baseado no tipo de conta
✅ Funcionar com todos os módulos já implementados no frontend
✅ Ter painel administrativo para gestão do SaaS
✅ Sistema de auditoria completo
✅ Performance otimizada com cache
✅ Pronto para deploy em produção

## ENTREGÁVEIS

1. **Backend completo** com todas as rotas e middleware
2. **Schema Prisma** com todas as tabelas e relacionamentos
3. **Sistema de seed** com dados de teste
4. **Documentação da API** com todos os endpoints
5. **Arquivo de configuração** Docker Compose para PostgreSQL
6. **Integração completa** frontend + backend funcionando
7. **Scripts de deploy** e configuração de produção

---

**IMPORTANTE**: Este sistema deve ser implementado como um SaaS profissional, com isolamento total de dados, segurança robusta e escalabilidade para centenas de empresas clientes. Cada empresa deve ver apenas seus próprios dados, e o controle de acesso deve ser rigorosamente aplicado em todos os níveis.
