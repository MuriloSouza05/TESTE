import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  Users,
  DollarSign,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Pin,
  Eye
} from 'lucide-react';
import { Project, ProjectStage, ProjectStatus } from '@/types/projects';

interface ProjectKanbanProps {
  stages: ProjectStage[];
  onAddProject: (status: ProjectStatus) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onMoveProject: (projectId: string, newStatus: ProjectStatus) => void;
  onViewProject: (project: Project) => void;
}

// STAGES IGUAIS AO CRM: Mesmo pipeline do CRM Pipeline de Vendas
const statusConfig = {
  contacted: { name: 'Em Contato', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  proposal: { name: 'Com Proposta', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  won: { name: 'Cliente Bem Sucedido', color: 'bg-green-100 text-green-800 border-green-200' },
  lost: { name: 'Cliente Perdido', color: 'bg-red-100 text-red-800 border-red-200' },
};

const priorityConfig = {
  low: { icon: '🔵', color: 'text-blue-600' },
  medium: { icon: '🟡', color: 'text-yellow-600' },
  high: { icon: '🟠', color: 'text-orange-600' },
  urgent: { icon: '🔴', color: 'text-red-600' },
};

export function ProjectKanban({
  stages,
  onAddProject,
  onEditProject,
  onDeleteProject,
  onMoveProject,
  onViewProject
}: ProjectKanbanProps) {
  // IMPLEMENTAÇÃO: Paginação Kanban - 5 projects por página
  const [stagePagination, setStagePagination] = useState<Record<string, number>>({});
  const [pinnedProjects, setPinnedProjects] = useState<Set<string>>(new Set());
  const PROJECTS_PER_PAGE = 5;
  const formatCurrency = (value: number, currency: string) => {
    const formatters = {
      BRL: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
      USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
      EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
    };
    return formatters[currency as keyof typeof formatters]?.format(value) || `${currency} ${value}`;
  };

  const getTotalValue = (projects: Project[]) => {
    return projects.reduce((total, project) => total + project.budget, 0);
  };

  // FUNCIONALIDADES DE PAGINAÇÃO
  const getCurrentPageProjects = (projects: Project[], stageId: string) => {
    const currentPage = stagePagination[stageId] || 0;
    const startIndex = currentPage * PROJECTS_PER_PAGE;
    const endIndex = startIndex + PROJECTS_PER_PAGE;

    // ORDENAÇÃO: Novos projetos aparecem no topo - mais recentes primeiro
    const sortedProjects = [...projects].sort((a, b) =>
      new Date(b.createdAt || b.updatedAt || 0).getTime() - new Date(a.createdAt || a.updatedAt || 0).getTime()
    );

    // Separar projetos pinados (sempre no topo) dos não pinados
    const pinnedStageProjects = sortedProjects.filter(project => pinnedProjects.has(project.id));
    const unpinnedProjects = sortedProjects.filter(project => !pinnedProjects.has(project.id));

    // Projetos pinados sempre aparecem primeiro, depois os paginados
    const visiblePinnedProjects = pinnedStageProjects.slice(0, PROJECTS_PER_PAGE);
    const remainingSlots = PROJECTS_PER_PAGE - visiblePinnedProjects.length;

    if (remainingSlots > 0) {
      const paginatedUnpinned = unpinnedProjects.slice(startIndex, startIndex + remainingSlots);
      return [...visiblePinnedProjects, ...paginatedUnpinned];
    }

    return visiblePinnedProjects;
  };

  const getTotalPages = (projects: Project[], stageId: string) => {
    const unpinnedCount = projects.filter(project => !pinnedProjects.has(project.id)).length;
    const pinnedCount = projects.filter(project => pinnedProjects.has(project.id)).length;
    const totalVisibleSlots = Math.max(unpinnedCount + pinnedCount - pinnedCount, unpinnedCount);
    return Math.ceil(totalVisibleSlots / PROJECTS_PER_PAGE);
  };

  const nextPage = (stageId: string, totalPages: number) => {
    const currentPage = stagePagination[stageId] || 0;
    if (currentPage < totalPages - 1) {
      setStagePagination(prev => ({
        ...prev,
        [stageId]: currentPage + 1
      }));
    }
  };

  const prevPage = (stageId: string) => {
    const currentPage = stagePagination[stageId] || 0;
    if (currentPage > 0) {
      setStagePagination(prev => ({
        ...prev,
        [stageId]: currentPage - 1
      }));
    }
  };

  const togglePin = (projectId: string) => {
    setPinnedProjects(prev => {
      const newPinned = new Set(prev);
      if (newPinned.has(projectId)) {
        newPinned.delete(projectId);
      } else {
        newPinned.add(projectId);
      }
      return newPinned;
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isOverdue = (dueDate: string) => {
    return getDaysUntilDue(dueDate) < 0;
  };

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    e.dataTransfer.setData('text/plain', projectId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ProjectStatus) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('text/plain');
    onMoveProject(projectId, targetStatus);
  };

  return (
    <div className="w-full">
      {/* LAYOUT TOTALMENTE RESPONSIVO: Ocupa todo o container respeitando espaçamento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 w-full min-h-[600px]">
        {stages.map((stage) => (
        <div
          key={stage.id}
          className="flex flex-col h-full"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, stage.id)}
        >
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {statusConfig[stage.id]?.name || stage.name}
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onAddProject(stage.id)}
                  className="h-6 w-6 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{stage.projects.length} projetos</span>
                <span>
                  {formatCurrency(getTotalValue(stage.projects), 'BRL')}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 p-3 pt-0">
              {/* IMPLEMENTAÇÃO: Cards paginados - 5 por página */}
              {getCurrentPageProjects(stage.projects, stage.id).map((project) => {
                const daysUntilDue = getDaysUntilDue(project.dueDate);
                const overdue = isOverdue(project.dueDate);
                
                return (
                  <Card
                    key={project.id}
                    className={`cursor-move hover:shadow-md transition-shadow border-l-4 ${
                      pinnedProjects.has(project.id) ? 'ring-2 ring-blue-200 bg-blue-50/50' : ''
                    }`}
                    style={{ borderLeftColor: statusConfig[project.status]?.color.includes('blue') ? '#3b82f6' :
                                             statusConfig[project.status]?.color.includes('yellow') ? '#f59e0b' :
                                             statusConfig[project.status]?.color.includes('green') ? '#10b981' :
                                             statusConfig[project.status]?.color.includes('red') ? '#ef4444' : '#6b7280' }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, project.id)}
                  >
                    <CardContent className="p-3">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 
                              className="text-sm font-medium line-clamp-2 cursor-pointer hover:text-blue-600"
                              onClick={() => onViewProject(project)}
                            >
                              {project.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {project.clientName}
                              {project.organization && ` • ${project.organization}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs">
                              {priorityConfig[project.priority].icon}
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => togglePin(project.id)}>
                                  <Pin className={`mr-2 h-3 w-3 ${pinnedProjects.has(project.id) ? 'text-blue-600' : ''}`} />
                                  {pinnedProjects.has(project.id) ? 'Desafixar' : 'Fixar'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onViewProject(project)}>
                                  <Eye className="mr-2 h-3 w-3" />
                                  Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onEditProject(project)}>
                                  <Edit className="mr-2 h-3 w-3" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => onDeleteProject(project.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-3 w-3" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="font-medium">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-1" />
                        </div>

                        {/* Budget */}
                        <div className="flex items-center text-xs">
                          <DollarSign className="h-3 w-3 mr-1 text-green-600" />
                          <span className="font-semibold text-green-600">
                            {formatCurrency(project.budget, project.currency)}
                          </span>
                        </div>

                        {/* Due Date */}
                        <div className="flex items-center text-xs">
                          <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span className={overdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                            {new Date(project.dueDate).toLocaleDateString('pt-BR')}
                            {overdue && (
                              <span className="ml-1">
                                <AlertTriangle className="h-3 w-3 inline" />
                                Vencido
                              </span>
                            )}
                            {!overdue && daysUntilDue <= 7 && daysUntilDue > 0 && (
                              <span className="ml-1 text-orange-600">
                                <Clock className="h-3 w-3 inline" />
                                {daysUntilDue}d
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Assigned Users */}
                        {project.assignedTo.length > 0 && (
                          <div className="flex items-center text-xs">
                            <Users className="h-3 w-3 mr-1 text-muted-foreground" />
                            <div className="flex -space-x-1">
                              {project.assignedTo.slice(0, 3).map((user, index) => (
                                <Avatar key={index} className="h-5 w-5 border border-background">
                                  <AvatarFallback className="text-xs">
                                    {user.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {project.assignedTo.length > 3 && (
                                <div className="h-5 w-5 rounded-full bg-muted border border-background flex items-center justify-center text-xs">
                                  +{project.assignedTo.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {project.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                                {tag}
                              </Badge>
                            ))}
                            {project.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                +{project.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Description preview */}
                        {project.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                        )}

                        {/* Created date */}
                        <div className="text-xs text-muted-foreground border-t pt-2">
                          Criado: {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {stage.projects.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Nenhum projeto</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onAddProject(stage.id)}
                    className="mt-2"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Adicionar
                  </Button>
                </div>
              )}

              {/* CONTROLES DE PAGINAÇÃO */}
              {stage.projects.length > PROJECTS_PER_PAGE && (
                <div className="flex items-center justify-between pt-3 border-t">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => prevPage(stage.id)}
                    disabled={!stagePagination[stage.id] || stagePagination[stage.id] === 0}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>

                  <div className="text-xs text-muted-foreground">
                    {(stagePagination[stage.id] || 0) + 1} / {getTotalPages(stage.projects, stage.id)}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => nextPage(stage.id, getTotalPages(stage.projects, stage.id))}
                    disabled={(stagePagination[stage.id] || 0) >= getTotalPages(stage.projects, stage.id) - 1}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
