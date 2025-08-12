import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  BarChart3,
  Clock,
  TrendingUp,
  AlertTriangle,
  Grid3X3,
  List
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProjectForm } from '@/components/Projects/ProjectForm';
import { ProjectKanban } from '@/components/Projects/ProjectKanban';
import { ProjectViewDialog } from '@/components/Projects/ProjectViewDialog';
import { Project, ProjectStage, ProjectStatus } from '@/types/projects';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';

// Mock data - in real app would come from API
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Ação Previdenciária - João Santos',
    description: 'Revisão de aposentadoria negada pelo INSS. Cliente tem direito a aposentadoria especial por tempo de contribuição.',
    clientName: 'João Santos',
    clientId: '1',
    organization: '',
    contacts: [
      {
        id: '1',
        name: 'João Santos',
        email: 'joao@email.com',
        phone: '(11) 99999-1234',
        role: 'Cliente'
      }
    ],
    address: 'Rua das Flores, 123, São Paulo - SP',
    budget: 8500,
    currency: 'BRL',
    status: 'proposal',
    startDate: '2024-01-05T00:00:00Z',
    dueDate: '2024-03-15T00:00:00Z',
    tags: ['Previdenciário', 'INSS', 'Urgente'],
    assignedTo: ['Dr. Silva', 'Ana Paralegal'],
    priority: 'high',
    progress: 65,
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    notes: 'Cliente já possui todos os documentos necessários. Aguardando resposta do INSS.',
    attachments: []
  },
  {
    id: '2',
    title: 'Divórcio Consensual - Maria e Carlos',
    description: 'Processo de divórcio consensual com partilha de bens. Casal possui imóvel e veículos para partilha.',
    clientName: 'Maria Silva',
    clientId: '2',
    contacts: [
      {
        id: '2',
        name: 'Maria Silva',
        email: 'maria@email.com',
        phone: '(11) 88888-5678',
        role: 'Cliente'
      },
      {
        id: '3',
        name: 'Carlos Santos',
        email: 'carlos@email.com',
        phone: '(11) 77777-9999',
        role: 'Ex-cônjuge'
      }
    ],
    address: 'Av. Paulista, 1000, São Paulo - SP',
    budget: 12000,
    currency: 'BRL',
    status: 'won',
    startDate: '2024-01-10T00:00:00Z',
    dueDate: '2024-02-28T00:00:00Z',
    tags: ['Família', 'Divórcio', 'Consensual'],
    assignedTo: ['Dra. Costa'],
    priority: 'medium',
    progress: 80,
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-22T11:45:00Z',
    notes: 'Documentação completa. Aguardando agendamento da audiência.',
    attachments: []
  },
  {
    id: '3',
    title: 'Recuperação Judicial - Tech LTDA',
    description: 'Processo de recuperação judicial para empresa de tecnologia com dificuldades financeiras.',
    clientName: 'Tech LTDA',
    clientId: '3',
    organization: 'Tech Solutions LTDA',
    contacts: [
      {
        id: '4',
        name: 'Roberto Tech',
        email: 'roberto@techltda.com',
        phone: '(11) 66666-8888',
        role: 'Sócio-Diretor'
      }
    ],
    address: 'Rua da Inovação, 500, São Paulo - SP',
    budget: 45000,
    currency: 'BRL',
    status: 'contacted',
    startDate: '2024-01-12T00:00:00Z',
    dueDate: '2024-04-30T00:00:00Z',
    tags: ['Empresarial', 'Recuperação', 'Urgente'],
    assignedTo: ['Dr. Oliveira', 'Dr. Silva', 'Ana Paralegal'],
    priority: 'urgent',
    progress: 40,
    createdAt: '2024-01-12T14:20:00Z',
    updatedAt: '2024-01-25T16:10:00Z',
    notes: 'Empresa em situação crítica. Prioridade máxima.',
    attachments: []
  },
  {
    id: '4',
    title: 'Ação Trabalhista - Pedro Souza',
    description: 'Ação contra ex-empregador por horas extras não pagas e verbas rescisórias.',
    clientName: 'Pedro Souza',
    contacts: [
      {
        id: '5',
        name: 'Pedro Souza',
        email: 'pedro@email.com',
        phone: '(11) 55555-7777',
        role: 'Cliente'
      }
    ],
    address: 'Rua do Trabalho, 789, São Paulo - SP',
    budget: 15000,
    currency: 'BRL',
    status: 'contacted',
    startDate: '2024-01-25T00:00:00Z',
    dueDate: '2024-05-15T00:00:00Z',
    tags: ['Trabalhista', 'Horas Extras'],
    assignedTo: ['Dra. Trabalho'],
    priority: 'medium',
    progress: 10,
    createdAt: '2024-01-25T08:30:00Z',
    updatedAt: '2024-01-25T08:30:00Z',
    notes: 'Início da coleta de documentos.',
    attachments: []
  }
];

interface ProjectCompactViewProps {
  projects: Project[];
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onViewProject: (project: Project) => void;
  onMoveProject: (projectId: string, newStatus: ProjectStatus) => void;
}

function ProjectCompactView({
  projects,
  onEditProject,
  onDeleteProject,
  onViewProject,
  onMoveProject
}: ProjectCompactViewProps) {
  const getStatusColor = (status: ProjectStatus) => {
    const colors = {
      contacted: 'bg-blue-100 text-blue-800',
      proposal: 'bg-yellow-100 text-yellow-800',
      won: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.contacted;
  };

  const getStatusLabel = (status: ProjectStatus) => {
    const labels = {
      contacted: 'Em Contato',
      proposal: 'Com Proposta',
      won: 'Cliente Bem Sucedido',
      lost: 'Cliente Perdido'
    };
    return labels[status] || status;
  };

  const statusOptions = [
    { value: 'contacted', label: 'Em Contato' },
    { value: 'proposal', label: 'Com Proposta' },
    { value: 'won', label: 'Cliente Bem Sucedido' },
    { value: 'lost', label: 'Cliente Perdido' }
  ];

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <Card key={project.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{project.title.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-sm truncate">{project.title}</h3>
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusLabel(project.status)}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>{project.clientName}</span>
                    <span>•</span>
                    <span>Vence: {new Date(project.dueDate).toLocaleDateString('pt-BR')}</span>
                    <span>•</span>
                    <span>R$ {project.budget.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium">{project.progress}%</div>
                  <Progress value={project.progress} className="w-20 h-2" />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewProject(project)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditProject(project)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteProject(project.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {projects.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum projeto encontrado com os filtros aplicados.
        </div>
      )}
    </div>
  );
}

export function Projects() {
  const [activeTab, setActiveTab] = useState('kanban');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showProjectView, setShowProjectView] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'compact'>('kanban');

  // Filter projects based on search, status, and priority
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [projects, searchTerm, statusFilter, priorityFilter]);

  // STAGES IGUAIS AO CRM: Mesmos estágios do Pipeline de Vendas
  const projectStages: ProjectStage[] = [
    {
      id: 'contacted',
      name: 'Em Contato',
      color: 'blue',
      projects: filteredProjects.filter(project => project.status === 'contacted'),
    },
    {
      id: 'proposal',
      name: 'Com Proposta',
      color: 'yellow',
      projects: filteredProjects.filter(project => project.status === 'proposal'),
    },
    {
      id: 'won',
      name: 'Cliente Bem Sucedido',
      color: 'green',
      projects: filteredProjects.filter(project => project.status === 'won'),
    },
    {
      id: 'lost',
      name: 'Cliente Perdido',
      color: 'red',
      projects: filteredProjects.filter(project => project.status === 'lost'),
    },
  ];

  const handleSubmitProject = (data: any) => {
    if (editingProject) {
      setProjects(projects.map(project =>
        project.id === editingProject.id
          ? {
              ...project,
              ...data,
              startDate: data.startDate + 'T00:00:00Z',
              dueDate: data.dueDate + 'T00:00:00Z',
              updatedAt: new Date().toISOString(),
              assignedTo: project.assignedTo, // Keep existing assignments
              attachments: project.attachments, // Keep existing attachments
            }
          : project
      ));
      setEditingProject(undefined);
    } else {
      const newProject: Project = {
        ...data,
        id: Date.now().toString(),
        startDate: data.startDate + 'T00:00:00Z',
        dueDate: data.dueDate + 'T00:00:00Z',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignedTo: ['Dr. Silva'], // Default assignment
        attachments: [],
      };
      setProjects([...projects, newProject]);
    }
    setShowProjectForm(false);
  };

  const handleAddProject = (status: ProjectStatus) => {
    setEditingProject(undefined);
    setShowProjectForm(true);
    // You could set default status here if needed
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(project => project.id !== projectId));
  };

  const handleMoveProject = (projectId: string, newStatus: ProjectStatus) => {
    setProjects(projects.map(project =>
      project.id === projectId
        ? { ...project, status: newStatus, updatedAt: new Date().toISOString() }
        : project
    ));
  };

  const handleViewProject = (project: Project) => {
    setViewingProject(project);
    setShowProjectView(true);
  };

  const handleEditFromView = (project: Project) => {
    setEditingProject(project);
    setShowProjectView(false);
    setShowProjectForm(true);
  };

  // Calculate metrics with new CRM-style statuses
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => !['won', 'lost'].includes(p.status)).length;
  const overdueProjects = projects.filter(p => new Date(p.dueDate) < new Date() && !['won', 'lost'].includes(p.status)).length;
  const totalRevenue = projects.filter(p => p.status === 'won').reduce((sum, project) => sum + project.budget, 0);
  const avgProgress = activeProjects > 0 ? Math.round(projects.filter(p => !['won', 'lost'].includes(p.status)).reduce((sum, project) => sum + project.progress, 0) / activeProjects) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Projetos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
            <p className="text-muted-foreground">
              Gerenciamento de projetos jurídicos com sistema Kanban
            </p>
          </div>
          <div className="flex space-x-2">
            <div className="flex border rounded-lg p-1">
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                Kanban
              </Button>
              <Button
                variant={viewMode === 'compact' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('compact')}
              >
                <List className="h-4 w-4 mr-1" />
                Lista
              </Button>
            </div>
            <Button onClick={() => handleAddProject('contacted')}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                {activeProjects} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgProgress}%</div>
              <p className="text-xs text-muted-foreground">
                Projetos ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projetos Vencidos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueProjects}</div>
              <p className="text-xs text-muted-foreground">
                Necessitam atenção
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Realizada</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Projetos concluídos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Procurar projetos..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="contacted">Em Contato</SelectItem>
              <SelectItem value="proposal">Com Proposta</SelectItem>
              <SelectItem value="won">Cliente Bem Sucedido</SelectItem>
              <SelectItem value="lost">Cliente Perdido</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Kanban Board */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderKanban className="h-5 w-5 mr-2" />
              Quadro Kanban de Projetos ({filteredProjects.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewMode === 'kanban' ? (
              <ProjectKanban
                stages={projectStages}
                onAddProject={handleAddProject}
                onEditProject={handleEditProject}
                onDeleteProject={handleDeleteProject}
                onMoveProject={handleMoveProject}
                onViewProject={handleViewProject}
              />
            ) : (
              <ProjectCompactView
                projects={filteredProjects}
                onEditProject={handleEditProject}
                onDeleteProject={handleDeleteProject}
                onViewProject={handleViewProject}
                onMoveProject={handleMoveProject}
              />
            )}
          </CardContent>
        </Card>

        {/* Project Form Modal */}
        <ProjectForm
          open={showProjectForm}
          onOpenChange={setShowProjectForm}
          project={editingProject}
          onSubmit={handleSubmitProject}
          isEditing={!!editingProject}
          existingTags={
            /* Extrair todas as tags únicas dos projetos existentes */
            Array.from(
              new Set(
                projects.flatMap(project => project.tags || [])
              )
            ).sort()
          }
        />

        {/* Project View Dialog */}
        <ProjectViewDialog
          open={showProjectView}
          onOpenChange={setShowProjectView}
          project={viewingProject}
          onEdit={handleEditFromView}
        />
      </div>
    </DashboardLayout>
  );
}
