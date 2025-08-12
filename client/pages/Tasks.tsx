import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Clock,
  TrendingUp,
  AlertTriangle,
  Timer,
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
import { TaskForm } from '@/components/Tasks/TaskForm';
import { TaskBoard } from '@/components/Tasks/TaskBoard';
import { TaskViewDialog } from '@/components/Tasks/TaskViewDialog';
import { Task, TaskBoard as TaskBoardType, TaskStatus, TaskPriority, TaskStats } from '@/types/tasks';
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
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Revisar contrato de prestação de serviços',
    description: 'Analisar cláusulas contratuais e identificar possíveis riscos jurídicos para o cliente.',
    startDate: '2024-01-20T00:00:00Z',
    endDate: '2024-01-25T00:00:00Z',
    status: 'in_progress',
    priority: 'high',
    assignedTo: 'Dr. Silva',
    projectId: '1',
    projectTitle: 'Ação Previdenciária - João Santos',
    clientId: '1',
    clientName: 'João Santos',
    tags: ['Contrato', 'Revisão', 'Urgente'],
    estimatedHours: 4,
    actualHours: 2.5,
    progress: 60,
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-22T14:30:00Z',
    notes: 'Cliente solicitou urgência devido a prazo de assinatura.',
    attachments: [],
    subtasks: [
      {
        id: '1',
        title: 'Ler contrato completo',
        completed: true,
        createdAt: '2024-01-20T09:00:00Z',
        completedAt: '2024-01-21T10:30:00Z',
      },
      {
        id: '2',
        title: 'Identificar cláusulas problemáticas',
        completed: true,
        createdAt: '2024-01-20T09:00:00Z',
        completedAt: '2024-01-22T11:15:00Z',
      },
      {
        id: '3',
        title: 'Elaborar parecer jurídico',
        completed: false,
        createdAt: '2024-01-20T09:00:00Z',
      },
      {
        id: '4',
        title: 'Enviar relatório ao cliente',
        completed: false,
        createdAt: '2024-01-20T09:00:00Z',
      },
    ],
  },
  {
    id: '2',
    title: 'Preparar petição inicial',
    description: 'Elaborar petição inicial para ação de divórcio consensual.',
    startDate: '2024-01-18T00:00:00Z',
    endDate: '2024-01-30T00:00:00Z',
    status: 'not_started',
    priority: 'medium',
    assignedTo: 'Dra. Costa',
    projectId: '2',
    projectTitle: 'Divórcio Consensual - Maria e Carlos',
    clientId: '2',
    clientName: 'Maria Silva',
    tags: ['Petição', 'Divórcio', 'Família'],
    estimatedHours: 6,
    actualHours: 0,
    progress: 0,
    createdAt: '2024-01-18T10:15:00Z',
    updatedAt: '2024-01-18T10:15:00Z',
    notes: 'Aguardando documentos do cliente.',
    attachments: [],
    subtasks: [
      {
        id: '5',
        title: 'Coletar documentos necessários',
        completed: false,
        createdAt: '2024-01-18T10:15:00Z',
      },
      {
        id: '6',
        title: 'Redigir petição',
        completed: false,
        createdAt: '2024-01-18T10:15:00Z',
      },
    ],
  },
  {
    id: '3',
    title: 'Acompanhar audiência no INSS',
    description: 'Comparecer à audiência administrativa no INSS para defesa do cliente.',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-01-28T00:00:00Z',
    status: 'completed',
    priority: 'urgent',
    assignedTo: 'Dr. Silva',
    projectId: '1',
    projectTitle: 'Ação Previdenciária - João Santos',
    clientId: '1',
    clientName: 'João Santos',
    tags: ['INSS', 'Audiência', 'Previdenciário'],
    estimatedHours: 3,
    actualHours: 3.5,
    progress: 100,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-28T16:45:00Z',
    completedAt: '2024-01-28T16:45:00Z',
    notes: 'Audiência realizada com sucesso. Aguardando decisão.',
    attachments: [],
    subtasks: [
      {
        id: '7',
        title: 'Preparar documentação',
        completed: true,
        createdAt: '2024-01-15T08:00:00Z',
        completedAt: '2024-01-20T09:30:00Z',
      },
      {
        id: '8',
        title: 'Comparecer à audiência',
        completed: true,
        createdAt: '2024-01-15T08:00:00Z',
        completedAt: '2024-01-28T16:45:00Z',
      },
    ],
  },
  {
    id: '4',
    title: 'Análise de viabilidade processual',
    description: 'Estudar caso e avaliar chances de sucesso na ação judicial.',
    startDate: '2024-01-25T00:00:00Z',
    endDate: '2024-02-05T00:00:00Z',
    status: 'on_hold',
    priority: 'low',
    assignedTo: 'Ana Paralegal',
    projectId: '4',
    projectTitle: 'Ação Trabalhista - Pedro Souza',
    clientId: '4',
    clientName: 'Pedro Souza',
    tags: ['Análise', 'Trabalhista', 'Viabilidade'],
    estimatedHours: 8,
    actualHours: 1,
    progress: 15,
    createdAt: '2024-01-25T11:20:00Z',
    updatedAt: '2024-01-26T14:10:00Z',
    notes: 'Pausado até recebimento de documentos adicionais.',
    attachments: [],
    subtasks: [],
  },
];

interface TasksListViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onViewTask: (task: Task) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
}

function TasksListView({
  tasks,
  onEditTask,
  onDeleteTask,
  onViewTask,
  onMoveTask
}: TasksListViewProps) {
  const getStatusColor = (status: TaskStatus) => {
    const colors = {
      not_started: 'bg-red-100 text-red-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      on_hold: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.not_started;
  };

  const getStatusLabel = (status: TaskStatus) => {
    const labels = {
      not_started: '🔴 Não Feito',
      in_progress: '🟡 Em Progresso',
      completed: '🟢 Feito',
      on_hold: '⏸️ Pausado',
      cancelled: '❌ Cancelado'
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: TaskPriority) => {
    const colors = {
      low: 'text-gray-600',
      medium: 'text-blue-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    };
    return colors[priority] || colors.medium;
  };

  const statusOptions = [
    { value: 'not_started', label: '🔴 Não Feito' },
    { value: 'in_progress', label: '🟡 Em Progresso' },
    { value: 'completed', label: '🟢 Feito' },
    { value: 'on_hold', label: '⏸️ Pausado' },
    { value: 'cancelled', label: '❌ Cancelado' }
  ];

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card key={task.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{task.title.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-sm truncate">{task.title}</h3>
                    <Badge className={getStatusColor(task.status)}>
                      {getStatusLabel(task.status)}
                    </Badge>
                    <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>{task.assignedTo}</span>
                    <span>•</span>
                    <span>Vence: {new Date(task.endDate).toLocaleDateString('pt-BR')}</span>
                    {task.clientName && (
                      <>
                        <span>•</span>
                        <span>{task.clientName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium">{task.progress || 0}%</div>
                  <Progress value={task.progress || 0} className="w-20 h-2" />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewTask(task)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditTask(task)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteTask(task.id)}
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

      {tasks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma tarefa encontrada com os filtros aplicados.
        </div>
      )}
    </div>
  );
}

export function Tasks() {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTaskView, setShowTaskView] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Filter tasks based on search, status, priority, and assignee
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (task.clientName?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'all' || task.assignedTo === assigneeFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter, assigneeFilter]);

  // Task boards with filtered tasks
  const taskBoards: TaskBoardType[] = [
    {
      id: 'not_started',
      name: '🔴 Não Feito',
      color: 'red',
      tasks: filteredTasks.filter(task => task.status === 'not_started'),
    },
    {
      id: 'in_progress',
      name: '🟡 Em Progresso',
      color: 'yellow',
      tasks: filteredTasks.filter(task => task.status === 'in_progress'),
    },
    {
      id: 'completed',
      name: '🟢 Feito',
      color: 'green',
      tasks: filteredTasks.filter(task => task.status === 'completed'),
    },
    {
      id: 'on_hold',
      name: '⏸️ Pausado',
      color: 'gray',
      tasks: filteredTasks.filter(task => task.status === 'on_hold'),
    },
    {
      id: 'cancelled',
      name: '❌ Cancelado',
      color: 'red',
      tasks: filteredTasks.filter(task => task.status === 'cancelled'),
    },
  ];

  const handleSubmitTask = (data: any) => {
    if (editingTask) {
      setTasks(tasks.map(task =>
        task.id === editingTask.id
          ? {
              ...task,
              ...data,
              startDate: data.startDate + 'T00:00:00Z',
              endDate: data.endDate + 'T00:00:00Z',
              updatedAt: new Date().toISOString(),
              attachments: task.attachments, // Keep existing attachments
            }
          : task
      ));
      setEditingTask(undefined);
    } else {
      const newTask: Task = {
        ...data,
        id: Date.now().toString(),
        startDate: data.startDate + 'T00:00:00Z',
        endDate: data.endDate + 'T00:00:00Z',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attachments: [],
        clientName: data.projectId ? 'Cliente do Projeto' : undefined,
        projectTitle: data.projectId ? 'Projeto Relacionado' : undefined,
      };
      setTasks([...tasks, newTask]);

      // NOVIDADE: Enviar notificação quando nova tarefa for criada
      // Em produção, isso seria uma chamada para API de notificações
      console.log("📢 NOTIFICAÇÃO ENVIADA: Nova tarefa criada", {
        type: 'info',
        title: 'Nova Tarefa Criada',
        message: `${newTask.title} foi atribuída${newTask.assignedTo ? ` a ${newTask.assignedTo}` : ''}`,
        category: 'task',
        createdBy: 'Usuário Atual', // Em produção: pegar do contexto de auth
        taskData: {
          id: newTask.id,
          title: newTask.title,
          assignedTo: newTask.assignedTo,
          priority: newTask.priority,
          endDate: newTask.endDate,
          projectTitle: newTask.projectTitle,
          tags: newTask.tags
        }
      });

      // FUTURO: Integração com sistema de notificações
      // await NotificationService.create({
      //   type: 'task_created',
      //   title: 'Nova Tarefa Criada',
      //   message: `${newTask.title} foi${newTask.assignedTo ? ` atribuída a ${newTask.assignedTo}` : ' criada'}`,
      //   entityId: newTask.id,
      //   entityType: 'task',
      //   userId: currentUser.id,
      //   assignedUserId: newTask.assignedTo ? getUserIdByName(newTask.assignedTo) : null
      // });
    }
    setShowTaskForm(false);
  };

  const handleAddTask = (status: TaskStatus) => {
    setEditingTask(undefined);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
            progress: newStatus === 'completed' ? 100 : task.progress
          }
        : task
    ));
  };

  const handleViewTask = (task: Task) => {
    setViewingTask(task);
    setShowTaskView(true);
  };

  const handleEditFromView = (task: Task) => {
    setEditingTask(task);
    setShowTaskView(false);
    setShowTaskForm(true);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            subtasks: task.subtasks.map(subtask =>
              subtask.id === subtaskId
                ? {
                    ...subtask,
                    completed: !subtask.completed,
                    completedAt: !subtask.completed ? new Date().toISOString() : undefined
                  }
                : subtask
            ),
            updatedAt: new Date().toISOString()
          }
        : task
    ));
  };

  // Calculate task statistics
  const taskStats: TaskStats = useMemo(() => {
    const total = tasks.length;
    const notStarted = tasks.filter(t => t.status === 'not_started').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = tasks.filter(t =>
      new Date(t.endDate) < new Date() &&
      !['completed', 'cancelled'].includes(t.status)
    ).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate average completion time
    const completedTasks = tasks.filter(t => t.status === 'completed' && t.completedAt);
    const avgCompletionTime = completedTasks.length > 0
      ? Math.round(completedTasks.reduce((sum, task) => {
          const start = new Date(task.createdAt);
          const end = new Date(task.completedAt!);
          const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
          return sum + diffDays;
        }, 0) / completedTasks.length)
      : 0;

    return {
      total,
      notStarted,
      inProgress,
      completed,
      overdue,
      completionRate,
      averageCompletionTime: avgCompletionTime
    };
  }, [tasks]);

  // Get unique assignees for filter
  const assignees = [...new Set(tasks.map(task => task.assignedTo))];

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Tarefas</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
            <p className="text-muted-foreground">
              Gerenciamento pessoal de tarefas por colaborador
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
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-1" />
                Lista
              </Button>
            </div>
            <Button onClick={() => handleAddTask('not_started')}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.total}</div>
              <p className="text-xs text-muted-foreground">
                {taskStats.inProgress} em progresso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {taskStats.completed} concluídas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tarefas Vencidas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
              <p className="text-xs text-muted-foreground">
                Necessitam atenção
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.averageCompletionTime}d</div>
              <p className="text-xs text-muted-foreground">
                Para conclusão
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Procurar tarefas..."
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
              <SelectItem value="not_started">Não Feito</SelectItem>
              <SelectItem value="in_progress">Em Progresso</SelectItem>
              <SelectItem value="completed">Feito</SelectItem>
              <SelectItem value="on_hold">Pausado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
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
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {assignees.map((assignee) => (
                <SelectItem key={assignee} value={assignee}>
                  {assignee}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Task Board */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckSquare className="h-5 w-5 mr-2" />
              Quadro de Tarefas ({filteredTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewMode === 'kanban' ? (
              <TaskBoard
                boards={taskBoards}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onMoveTask={handleMoveTask}
                onViewTask={handleViewTask}
                onToggleSubtask={handleToggleSubtask}
              />
            ) : (
              <TasksListView
                tasks={filteredTasks}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onViewTask={handleViewTask}
                onMoveTask={handleMoveTask}
              />
            )}
          </CardContent>
        </Card>

        {/* Task Form Modal */}
        <TaskForm
          open={showTaskForm}
          onOpenChange={setShowTaskForm}
          task={editingTask}
          onSubmit={handleSubmitTask}
          isEditing={!!editingTask}
          existingTags={
            /* Extrair todas as tags únicas das tarefas existentes */
            Array.from(
              new Set(
                tasks.flatMap(task => task.tags || [])
              )
            ).sort()
          }
        />

        {/* Task View Dialog */}
        <TaskViewDialog
          open={showTaskView}
          onOpenChange={setShowTaskView}
          task={viewingTask}
          onEdit={handleEditFromView}
        />
      </div>
    </DashboardLayout>
  );
}
