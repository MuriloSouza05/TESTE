# ESPECIFICAÇÕES - SISTEMA DE LOGIN/LOGOUT

## ESTRUTURA DE NAVEGAÇÃO E AUTENTICAÇÃO

### 1. FLUXO DE AUTENTICAÇÃO

```
Usuário acessa sistema → Verificar token JWT → 
  Se válido: Dashboard
  Se inválido: Página de Login
```

### 2. PÁGINAS DE LOGIN

#### A) Login Principal (Usuários das Empresas)
**Rota**: `/login`
**Funcionalidades**:
- Campo email + senha
- Botão "Lembrar-me" (refresh token de 30 dias)
- Link "Esqueci minha senha"
- Validação em tempo real
- Redirect para dashboard após login

#### B) Login Administrativo (Gestão do SaaS)
**Rota**: `/admin/login`
**Funcionalidades**:
- Interface diferenciada (mais formal)
- Campos email + senha + código 2FA (opcional)
- Redirect para `/admin/dashboard`
- Session mais curta (2 horas)

### 3. SISTEMA DE LOGOUT

#### Logout Normal
- Botão no header/sidebar
- Invalidar token JWT no backend
- Limpar localStorage/sessionStorage
- Redirect para `/login`

#### Logout Automático
- Token expirado → logout automático
- Inatividade prolongada → aviso + logout
- Múltiplas tentativas de acesso negado → logout

### 4. PROTEÇÃO DE ROTAS

```typescript
// Middleware de proteção
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

// Proteção administrativa
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { admin, loading } = useAdminAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!admin) return <Navigate to="/admin/login" replace />;
  
  return <>{children}</>;
};
```

### 5. ESTRUTURA DE ROTAS ATUALIZADA

```typescript
// client/App.tsx
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Rotas Protegidas - Usuários */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/crm" element={
          <ProtectedRoute>
            <CRM />
          </ProtectedRoute>
        } />
        
        {/* Rotas Condicionais por Plano */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <PlanProtectedRoute requiredPlan={['compound', 'manager']}>
              <Dashboard />
            </PlanProtectedRoute>
          </ProtectedRoute>
        } />
        
        <Route path="/fluxo-caixa" element={
          <ProtectedRoute>
            <PlanProtectedRoute requiredPlan={['compound', 'manager']}>
              <CashFlow />
            </PlanProtectedRoute>
          </ProtectedRoute>
        } />
        
        <Route path="/usuarios" element={
          <ProtectedRoute>
            <PlanProtectedRoute requiredPlan={['manager']}>
              <UserManagement />
            </PlanProtectedRoute>
          </ProtectedRoute>
        } />
        
        {/* Rotas Administrativas */}
        <Route path="/admin/*" element={
          <AdminProtectedRoute>
            <AdminRoutes />
          </AdminProtectedRoute>
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 6. HOOKS DE AUTENTICAÇÃO

```typescript
// hooks/useAuth.ts
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenant: {
    id: string;
    name: string;
    plan_type: 'simple' | 'compound' | 'manager';
  };
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('token', data.token);
      return { success: true };
    }
    
    return { success: false, error: 'Credenciais inválidas' };
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return { user, login, logout, loading };
};
```

### 7. CONTROLE DE ACESSO POR COMPONENTE

```typescript
// Exemplo: Dashboard com controle de acesso
export function Dashboard() {
  const { user } = useAuth();
  const canAccessDashboard = user?.tenant.plan_type !== 'simple';
  
  if (!canAccessDashboard) {
    return (
      <div className="text-center p-8">
        <h2>Acesso Restrito</h2>
        <p>Seu plano atual não inclui acesso ao Dashboard.</p>
        <Button onClick={() => navigate('/crm')}>
          Ir para CRM
        </Button>
      </div>
    );
  }
  
  return (
    <DashboardLayout>
      {/* Conteúdo normal do dashboard */}
    </DashboardLayout>
  );
}
```

### 8. SIDEBAR COM CONTROLE DINÂMICO

```typescript
// components/Layout/DashboardLayout.tsx
const navigationItems = [
  { name: 'CRM', href: '/crm', icon: Users, requiredPlan: ['simple', 'compound', 'manager'] },
  { name: 'Projetos', href: '/projetos', icon: FolderOpen, requiredPlan: ['simple', 'compound', 'manager'] },
  { name: 'Tarefas', href: '/tarefas', icon: CheckSquare, requiredPlan: ['simple', 'compound', 'manager'] },
  { name: 'Cobrança', href: '/cobranca', icon: CreditCard, requiredPlan: ['simple', 'compound', 'manager'] },
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3, requiredPlan: ['compound', 'manager'] },
  { name: 'Fluxo de Caixa', href: '/fluxo-caixa', icon: TrendingUp, requiredPlan: ['compound', 'manager'] },
  { name: 'Usuários', href: '/usuarios', icon: UserCog, requiredPlan: ['manager'] },
];

function Sidebar() {
  const { user } = useAuth();
  const userPlan = user?.tenant.plan_type;
  
  const filteredItems = navigationItems.filter(item => 
    item.requiredPlan.includes(userPlan)
  );
  
  return (
    <nav>
      {filteredItems.map(item => (
        <SidebarItem key={item.name} {...item} />
      ))}
    </nav>
  );
}
```

### 9. IMPLEMENTAÇÃO NO BACKEND

```typescript
// server/middleware/auth.ts
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// server/routes/auth.ts
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Validar credenciais
  const user = await prisma.user.findUnique({
    where: { email },
    include: { tenant: true }
  });
  
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  
  const token = jwt.sign({
    userId: user.id,
    tenantId: user.tenant_id,
    role: user.role
  }, process.env.JWT_SECRET!, { expiresIn: '24h' });
  
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenant: user.tenant
    }
  });
});

router.post('/logout', authenticateToken, async (req, res) => {
  // Implementar blacklist de tokens se necessário
  res.json({ message: 'Logout realizado com sucesso' });
});
```

### 10. REDIRECIONAMENTOS E UX

```typescript
// Interceptor para lidar com respostas 401
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

Esta estrutura garante que:
- ✅ Usuários não autenticados são redirecionados para login
- ✅ Existe separação entre login de usuários e admins
- ✅ Controle de acesso baseado no plano da empresa
- ✅ Logout seguro com limpeza de tokens
- ✅ Interface adaptativa baseada em permissões
- ✅ Proteção contra acesso não autorizado
