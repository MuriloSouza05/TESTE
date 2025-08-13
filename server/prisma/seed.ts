import { PrismaClient, PlanType, AccountType, ProjectStatus, TaskStatus, Priority, InvoiceStatus, TransactionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.auditLog.deleteMany();
  await prisma.file.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  console.log('🗑️ Dados existentes removidos');

  // Criar 3 empresas de teste (uma para cada plano)
  const tenants = await Promise.all([
    prisma.tenant.create({
      data: {
        companyName: 'Escritório Advocacia Simples Ltda',
        planType: PlanType.SIMPLE,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
      }
    }),
    prisma.tenant.create({
      data: {
        companyName: 'Advocacia & Consultoria Composta S/A',
        planType: PlanType.COMPOSITE,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
      }
    }),
    prisma.tenant.create({
      data: {
        companyName: 'Mega Escritório Jurídico Gerencial',
        planType: PlanType.MANAGERIAL,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
      }
    })
  ]);

  console.log('🏢 Tenants criados:', tenants.length);

  // Criar usuários para cada tenant
  const passwordHash = await bcrypt.hash('123456', 10);
  
  const users = [];
  
  // Usuários para tenant SIMPLE
  const simpleUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@simples.com',
        passwordHash,
        accountType: AccountType.SIMPLE,
        tenantId: tenants[0].id,
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'user@simples.com',
        passwordHash,
        accountType: AccountType.SIMPLE,
        tenantId: tenants[0].id,
        isActive: true
      }
    })
  ]);
  
  // Usuários para tenant COMPOSITE
  const compositeUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@composta.com',
        passwordHash,
        accountType: AccountType.COMPOSITE,
        tenantId: tenants[1].id,
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'user@composta.com',
        passwordHash,
        accountType: AccountType.COMPOSITE,
        tenantId: tenants[1].id,
        isActive: true
      }
    })
  ]);
  
  // Usuários para tenant MANAGERIAL
  const managerialUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@gerencial.com',
        passwordHash,
        accountType: AccountType.MANAGERIAL,
        tenantId: tenants[2].id,
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'user@gerencial.com',
        passwordHash,
        accountType: AccountType.MANAGERIAL,
        tenantId: tenants[2].id,
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'manager@gerencial.com',
        passwordHash,
        accountType: AccountType.MANAGERIAL,
        tenantId: tenants[2].id,
        isActive: true
      }
    })
  ]);
  
  users.push(...simpleUsers, ...compositeUsers, ...managerialUsers);
  console.log('👥 Usuários criados:', users.length);

  // Criar clientes para cada tenant
  const clients = [];
  
  for (let i = 0; i < tenants.length; i++) {
    const tenantClients = await Promise.all([
      prisma.client.create({
        data: {
          name: `Cliente ${i + 1}.1 - João Silva`,
          cpf: `123.456.789-0${i}`,
          email: `joao.silva${i + 1}@email.com`,
          phone: `(11) 9999${i}-000${i}`,
          address: {
            street: `Rua das Flores, ${100 + i * 10}`,
            city: 'São Paulo',
            state: 'SP',
            zipCode: `01234-${i}00`
          },
          tenantId: tenants[i].id
        }
      }),
      prisma.client.create({
        data: {
          name: `Cliente ${i + 1}.2 - Maria Santos`,
          cpf: `987.654.321-0${i}`,
          email: `maria.santos${i + 1}@email.com`,
          phone: `(11) 8888${i}-000${i}`,
          address: {
            street: `Av. Paulista, ${1000 + i * 100}`,
            city: 'São Paulo',
            state: 'SP',
            zipCode: `01310-${i}00`
          },
          tenantId: tenants[i].id
        }
      }),
      prisma.client.create({
        data: {
          name: `Cliente ${i + 1}.3 - Empresa ABC Ltda`,
          email: `contato${i + 1}@empresaabc.com`,
          phone: `(11) 7777${i}-000${i}`,
          address: {
            street: `Rua Comercial, ${500 + i * 50}`,
            city: 'São Paulo',
            state: 'SP',
            zipCode: `04567-${i}00`
          },
          tenantId: tenants[i].id
        }
      })
    ]);
    clients.push(...tenantClients);
  }
  
  console.log('🏢 Clientes criados:', clients.length);

  // Criar projetos para cada tenant
  const projects = [];
  
  for (let i = 0; i < tenants.length; i++) {
    const tenantProjects = await Promise.all([
      prisma.project.create({
        data: {
          title: `Processo Trabalhista - ${tenants[i].companyName}`,
          description: 'Ação trabalhista movida contra empresa XYZ',
          status: ProjectStatus.IN_PROGRESS,
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-06-15'),
          budget: 15000.00,
          progress: 45.5,
          tenantId: tenants[i].id,
          clientId: clients[i * 3].id,
          userId: users[i * 2].id
        }
      }),
      prisma.project.create({
        data: {
          title: `Consultoria Jurídica - ${tenants[i].companyName}`,
          description: 'Consultoria para revisão de contratos',
          status: ProjectStatus.NOT_STARTED,
          startDate: new Date('2024-02-01'),
          budget: 8000.00,
          progress: 0,
          tenantId: tenants[i].id,
          clientId: clients[i * 3 + 1].id,
          userId: users[i * 2 + 1].id
        }
      }),
      prisma.project.create({
        data: {
          title: `Ação Civil - ${tenants[i].companyName}`,
          description: 'Ação de cobrança de valores em atraso',
          status: ProjectStatus.COMPLETED,
          startDate: new Date('2023-10-01'),
          endDate: new Date('2024-01-30'),
          budget: 12000.00,
          progress: 100,
          tenantId: tenants[i].id,
          clientId: clients[i * 3 + 2].id,
          userId: users[i * 2].id
        }
      })
    ]);
    projects.push(...tenantProjects);
  }
  
  console.log('📁 Projetos criados:', projects.length);

  // Criar tarefas para cada projeto
  const tasks = [];
  
  for (let i = 0; i < projects.length; i++) {
    const projectTasks = await Promise.all([
      prisma.task.create({
        data: {
          title: `Análise inicial do caso - Projeto ${i + 1}`,
          description: 'Revisar documentos e evidências do caso',
          status: TaskStatus.DONE,
          priority: Priority.HIGH,
          estimatedHours: 8,
          actualHours: 6.5,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          tenantId: projects[i].tenantId,
          projectId: projects[i].id,
          userId: projects[i].userId
        }
      }),
      prisma.task.create({
        data: {
          title: `Elaborar petição inicial - Projeto ${i + 1}`,
          description: 'Redigir e revisar petição inicial',
          status: TaskStatus.IN_PROGRESS,
          priority: Priority.MEDIUM,
          estimatedHours: 12,
          actualHours: 4,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          tenantId: projects[i].tenantId,
          projectId: projects[i].id,
          userId: projects[i].userId
        }
      }),
      prisma.task.create({
        data: {
          title: `Acompanhar audiência - Projeto ${i + 1}`,
          description: 'Participar da audiência de conciliação',
          status: TaskStatus.TODO,
          priority: Priority.URGENT,
          estimatedHours: 4,
          dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          tenantId: projects[i].tenantId,
          projectId: projects[i].id,
          userId: projects[i].userId
        }
      })
    ]);
    tasks.push(...projectTasks);
  }
  
  console.log('✅ Tarefas criadas:', tasks.length);

  // Criar faturas para cada projeto
  const invoices = [];
  
  for (let i = 0; i < projects.length; i++) {
    const projectInvoices = await Promise.all([
      prisma.invoice.create({
        data: {
          number: `INV-${String(i + 1).padStart(4, '0')}-001`,
          status: InvoiceStatus.PAID,
          amount: projects[i].budget ? projects[i].budget * 0.3 : 3000,
          dueDate: new Date('2024-01-30'),
          paidAt: new Date('2024-01-25'),
          description: 'Primeira parcela do projeto',
          tenantId: projects[i].tenantId,
          clientId: projects[i].clientId,
          projectId: projects[i].id
        }
      }),
      prisma.invoice.create({
        data: {
          number: `INV-${String(i + 1).padStart(4, '0')}-002`,
          status: InvoiceStatus.SENT,
          amount: projects[i].budget ? projects[i].budget * 0.4 : 4000,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          description: 'Segunda parcela do projeto',
          tenantId: projects[i].tenantId,
          clientId: projects[i].clientId,
          projectId: projects[i].id
        }
      })
    ]);
    invoices.push(...projectInvoices);
  }
  
  console.log('💰 Faturas criadas:', invoices.length);

  // Criar transações (apenas para tenants COMPOSITE e MANAGERIAL)
  const transactions = [];
  
  for (let i = 1; i < tenants.length; i++) { // Começar do índice 1 (pular SIMPLE)
    const tenantTransactions = await Promise.all([
      // Receitas
      prisma.transaction.create({
        data: {
          type: TransactionType.INCOME,
          amount: 15000.00,
          category: 'Honorários Advocatícios',
          description: 'Pagamento de honorários - Processo Trabalhista',
          date: new Date('2024-01-25'),
          tenantId: tenants[i].id
        }
      }),
      prisma.transaction.create({
        data: {
          type: TransactionType.INCOME,
          amount: 8500.00,
          category: 'Consultoria',
          description: 'Consultoria jurídica empresarial',
          date: new Date('2024-02-10'),
          tenantId: tenants[i].id
        }
      }),
      // Despesas
      prisma.transaction.create({
        data: {
          type: TransactionType.EXPENSE,
          amount: 2500.00,
          category: 'Custas Processuais',
          description: 'Pagamento de custas judiciais',
          date: new Date('2024-01-15'),
          tenantId: tenants[i].id
        }
      }),
      prisma.transaction.create({
        data: {
          type: TransactionType.EXPENSE,
          amount: 1200.00,
          category: 'Material de Escritório',
          description: 'Compra de materiais e suprimentos',
          date: new Date('2024-02-05'),
          tenantId: tenants[i].id
        }
      }),
      prisma.transaction.create({
        data: {
          type: TransactionType.EXPENSE,
          amount: 3500.00,
          category: 'Aluguel',
          description: 'Aluguel do escritório - Fevereiro/2024',
          date: new Date('2024-02-01'),
          isRecurring: true,
          tenantId: tenants[i].id
        }
      })
    ]);
    transactions.push(...tenantTransactions);
  }
  
  console.log('💳 Transações criadas:', transactions.length);

  // Criar logs de auditoria
  const auditLogs = [];
  
  for (let i = 0; i < users.length; i++) {
    const userAuditLogs = await Promise.all([
      prisma.auditLog.create({
        data: {
          action: 'LOGIN',
          resourceType: 'USER',
          resourceId: users[i].id,
          details: { email: users[i].email, timestamp: new Date() },
          tenantId: users[i].tenantId,
          userId: users[i].id
        }
      }),
      prisma.auditLog.create({
        data: {
          action: 'CREATE',
          resourceType: 'CLIENT',
          resourceId: clients[Math.floor(i / 2) * 3]?.id || clients[0].id,
          details: { action: 'Cliente criado' },
          tenantId: users[i].tenantId,
          userId: users[i].id
        }
      })
    ]);
    auditLogs.push(...userAuditLogs);
  }
  
  console.log('📋 Logs de auditoria criados:', auditLogs.length);

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📊 Resumo dos dados criados:');
  console.log(`   • ${tenants.length} Tenants (empresas)`);
  console.log(`   • ${users.length} Usuários`);
  console.log(`   • ${clients.length} Clientes`);
  console.log(`   • ${projects.length} Projetos`);
  console.log(`   • ${tasks.length} Tarefas`);
  console.log(`   • ${invoices.length} Faturas`);
  console.log(`   • ${transactions.length} Transações`);
  console.log(`   • ${auditLogs.length} Logs de auditoria`);
  
  console.log('\n🔑 Credenciais de teste:');
  console.log('   PLANO SIMPLES:');
  console.log('   • admin@simples.com / 123456');
  console.log('   • user@simples.com / 123456');
  console.log('\n   PLANO COMPOSTO:');
  console.log('   • admin@composta.com / 123456');
  console.log('   • user@composta.com / 123456');
  console.log('\n   PLANO GERENCIAL:');
  console.log('   • admin@gerencial.com / 123456');
  console.log('   • user@gerencial.com / 123456');
  console.log('   • manager@gerencial.com / 123456');
  console.log('\n   ADMIN DO SAAS:');
  console.log('   • admin@example.com / admin123 (com ADMIN_KEY)');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });