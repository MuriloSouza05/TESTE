# SaaS Legal Management System

## 🚀 Sobre o Projeto

Sistema de gestão jurídica multi-tenant desenvolvido como uma solução SaaS (Software as a Service), oferecendo funcionalidades completas para escritórios de advocacia e departamentos jurídicos.

### Principais Funcionalidades

- **Dashboard Personalizado**
- **CRM para Clientes**
- **Gestão de Projetos**
- **Sistema de Tarefas**
- **Faturamento**
- **Fluxo de Caixa**
- **Configurações Avançadas**

### Sistema Multi-Tenant

- **3 Tipos de Conta:**
  - Conta Simples
  - Conta Composta
  - Conta Gerencial

- **Painel Administrativo**
  - Gestão de Empresas
  - Métricas de Uso
  - Controle de Usuários

## 🛠 Tecnologias

### Frontend
- React
- TypeScript
- Vite
- TailwindCSS

### Backend
- Express.js
- Node.js
- PostgreSQL
- Prisma ORM

### DevOps
- Docker
- Docker Compose

## 🚀 Começando

### Pré-requisitos

- Node.js 20.x
- Docker e Docker Compose
- PostgreSQL (via Docker)

### Instalação

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd sas-legal
```

2. Configure as variáveis de ambiente:
```bash
cp server/.env.example server/.env
# Edite as variáveis conforme necessário
```

3. Inicie os containers:
```bash
docker-compose up -d
```

4. Execute as migrações do banco de dados:
```bash
docker-compose exec backend npx prisma migrate dev
```

5. Acesse a aplicação:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Adminer (gerenciador DB): http://localhost:8080

## 📚 Documentação

### Estrutura do Projeto

```
├── client/          # Frontend React
├── server/          # Backend Express
│   ├── src/
│   │   ├── routes/  # Rotas da API
│   │   ├── middleware/  # Middlewares
│   │   └── utils/   # Utilitários
│   ├── prisma/      # Schema e migrações
│   └── tests/       # Testes
└── docker/          # Configurações Docker
```

### API Endpoints

#### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de usuário

#### Admin
- `POST /api/admin/auth/login` - Login administrativo
- `GET /api/admin/tenants` - Lista todos os tenants
- `POST /api/admin/tenants` - Cria novo tenant
- `GET /api/admin/metrics` - Métricas do sistema

#### Tenant
- `POST /api/tenant/clients` - Cria novo cliente
- `POST /api/tenant/projects` - Cria novo projeto
- `POST /api/tenant/tasks` - Cria nova tarefa
- `POST /api/tenant/invoices` - Cria nova fatura

## 🔐 Segurança

- Autenticação JWT
- Isolamento de dados por tenant
- Rate limiting
- Validação de dados com Zod
- Logs de auditoria

## 📈 Roadmap

- [ ] Implementação de testes automatizados
- [ ] Sistema de notificações
- [ ] Integração com serviços externos
- [ ] Dashboard analytics avançado
- [ ] App mobile

## 👥 Contribuição

1. Fork o projeto
2. Crie sua Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.