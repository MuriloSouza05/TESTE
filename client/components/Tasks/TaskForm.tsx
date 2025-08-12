import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, Trash2 } from 'lucide-react';
import { Task, TaskStatus, TaskPriority, Subtask } from '@/types/tasks';

const taskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().min(1, 'Data de fim é obrigatória'),
  status: z.enum(['not_started', 'in_progress', 'completed', 'on_hold', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assignedTo: z.string().min(1, 'Responsável é obrigatório'),
  projectId: z.string().optional(),
  clientId: z.string().optional(),
  estimatedHours: z.number().optional(),
  actualHours: z.number().optional(),
  progress: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  onSubmit: (data: TaskFormData & { tags: string[]; subtasks: Subtask[] }) => void;
  isEditing?: boolean;
  existingTags?: string[]; // Tags existentes de outras tarefas
}

const statusOptions = [
  { value: 'not_started', label: '🔴 Não Feito', color: 'bg-red-100 text-red-800' },
  { value: 'in_progress', label: '🟡 Em Progresso', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'completed', label: '🟢 Feito', color: 'bg-green-100 text-green-800' },
  { value: 'on_hold', label: '⏸️ Pausado', color: 'bg-gray-100 text-gray-800' },
  { value: 'cancelled', label: '❌ Cancelado', color: 'bg-red-100 text-red-800' },
];

const priorityOptions = [
  { value: 'low', label: 'Baixa', color: 'text-gray-600' },
  { value: 'medium', label: 'Média', color: 'text-blue-600' },
  { value: 'high', label: 'Alta', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgente', color: 'text-red-600' },
];

// RESPONSÁVEL: Colaboradores que têm acesso ao sistema
// COMENTÁRIO IMPLEMENTAÇÃO: Lista todos os colaboradores cadastrados no sistema com acesso
// Incluindo: Contas Simples, Contas Compostas e Contas Gerenciais
// Esta lista seria carregada dinamicamente da API: GET /api/users/collaborators
// Filtros por tipo de conta e permissões de acesso
const assignedToOptions = [
  // CONTA GERENCIAL (acesso total)
  'Dr. Silva - Sócio Gerente',
  'Dra. Costa - Sócia Diretora',

  // CONTA COMPOSTA (acesso ao fluxo de caixa e dashboard completo)
  'Dr. Oliveira - Advogado Sênior',
  'Dra. Ferreira - Advogada Especialista',

  // CONTA SIMPLES (acesso limitado - sem financeiro)
  'Ana Paralegal - Assistente Jurídica',
  'Carlos Estagiário - Estagiário',
  'Marina Santos - Advogada Júnior',
  'Rafael Lima - Paralegal',

  // IMPLEMENTAÇÃO FUTURA:
  // Esta lista será carregada dinamicamente do backend baseada em:
  // - Usuários ativos no sistema
  // - Tipo de conta (Simples, Composta, Gerencial)
  // - Permissões específicas
  // - Status do colaborador (ativo/inativo)
  // API: GET /api/users?role=collaborator&status=active
];

const projectOptions = [
  { id: '1', name: 'Ação Previdenciária - João Santos' },
  { id: '2', name: 'Divórcio Consensual - Maria e Carlos' },
  { id: '3', name: 'Recuperação Judicial - Tech LTDA' },
  { id: '4', name: 'Ação Trabalhista - Pedro Souza' },
];

export function TaskForm({ open, onOpenChange, task, onSubmit, isEditing = false, existingTags = [] }: TaskFormProps) {
  const [tags, setTags] = useState<string[]>(task?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks || []);
  const [newSubtask, setNewSubtask] = useState('');

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      startDate: task?.startDate ? task.startDate.split('T')[0] : '',
      endDate: task?.endDate ? task.endDate.split('T')[0] : '',
      status: task?.status || 'not_started',
      priority: task?.priority || 'medium',
      assignedTo: task?.assignedTo || '',
      projectId: task?.projectId || 'none',
      clientId: task?.clientId || '',
      estimatedHours: task?.estimatedHours || 0,
      actualHours: task?.actualHours || 0,
      progress: task?.progress || 0,
      notes: task?.notes || '',
    },
  });

  // Atualizar formulário quando task mudar ou modal abrir
  useEffect(() => {
    if (open) {
      if (task) {
        form.reset({
          title: task.title || '',
          description: task.description || '',
          startDate: task.startDate ? task.startDate.split('T')[0] : '',
          endDate: task.endDate ? task.endDate.split('T')[0] : '',
          status: task.status || 'not_started',
          priority: task.priority || 'medium',
          assignedTo: task.assignedTo || '',
          projectId: task.projectId || 'none',
          clientId: task.clientId || '',
          estimatedHours: task.estimatedHours || 0,
          actualHours: task.actualHours || 0,
          progress: task.progress || 0,
          notes: task.notes || '',
        });
        setTags(task.tags || []);
        setSubtasks(task.subtasks || []);
      } else {
        // Reset para nova tarefa
        form.reset({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          status: 'not_started',
          priority: 'medium',
          assignedTo: '',
          projectId: 'none',
          clientId: '',
          estimatedHours: 0,
          actualHours: 0,
          progress: 0,
          notes: '',
        });
        setTags([]);
        setSubtasks([]);
      }
    }
  }, [task, form, open]);

  const handleSubmit = (data: TaskFormData) => {
    // Convert "none" back to empty string for projectId
    const submitData = {
      ...data,
      projectId: data.projectId === 'none' ? '' : data.projectId,
      tags,
      subtasks
    };
    onSubmit(submitData);
    onOpenChange(false);
    form.reset();
    setTags([]);
    setSubtasks([]);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addExistingTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      const subtask: Subtask = {
        id: Date.now().toString(),
        title: newSubtask.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setSubtasks([...subtasks, subtask]);
      setNewSubtask('');
    }
  };

  const removeSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.filter(subtask => subtask.id !== subtaskId));
  };

  const toggleSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.map(subtask => 
      subtask.id === subtaskId 
        ? { 
            ...subtask, 
            completed: !subtask.completed,
            completedAt: !subtask.completed ? new Date().toISOString() : undefined
          }
        : subtask
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações da tarefa. Campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações da Tarefa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Título *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Revisar contrato de prestação de serviços" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descrição detalhada da tarefa..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Final *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Status e Prioridade */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Status e Prioridade</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a prioridade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorityOptions.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value}>
                              {priority.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o responsável" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {assignedToOptions.map((person) => (
                            <SelectItem key={person} value={person}>
                              {person}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="progress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Progresso (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="100" 
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Relacionamentos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Relacionamentos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Projeto Relacionado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um projeto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhum projeto</SelectItem>
                          {projectOptions.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Horas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Controle de Horas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estimatedHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horas Estimadas</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.5"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="actualHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horas Realizadas</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.5"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Subtarefas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Subtarefas</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar subtarefa"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                />
                <Button type="button" onClick={addSubtask}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2 flex-1">
                      <Checkbox
                        checked={subtask.completed}
                        onCheckedChange={() => toggleSubtask(subtask.id)}
                      />
                      <span className={subtask.completed ? 'line-through text-muted-foreground' : ''}>
                        {subtask.title}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubtask(subtask.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tags</h3>

              {/* IMPLEMENTAÇÃO MELHORADA: Dropdown com tags existentes + input para novas */}
              <div className="space-y-3">
                {/* Dropdown com tags já existentes no sistema */}
                {existingTags.length > 0 && (
                  <div>
                    <label className="text-sm text-muted-foreground">Selecionar de tags existentes:</label>
                    <Select onValueChange={addExistingTag}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolher tag existente" />
                      </SelectTrigger>
                      <SelectContent>
                        {existingTags
                          .filter(tag => !tags.includes(tag))
                          .map((tag) => (
                            <SelectItem key={tag} value={tag}>
                              {tag}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Input para criar nova tag */}
                <div>
                  <label className="text-sm text-muted-foreground">Ou criar nova tag:</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite nova tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag}>
                      Adicionar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tags selecionadas */}
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Observações */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Informações adicionais sobre a tarefa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? 'Atualizar Tarefa' : 'Criar Tarefa'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
