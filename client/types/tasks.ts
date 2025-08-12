export interface Task {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  projectId?: string;
  projectTitle?: string;
  clientId?: string;
  clientName?: string;
  tags: string[];
  estimatedHours?: number;
  actualHours?: number;
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  notes?: string;
  attachments: TaskAttachment[];
  subtasks: Subtask[];
}

export type TaskStatus = 
  | 'not_started'    // Não Feito
  | 'in_progress'    // Em Progresso
  | 'completed'      // Feito
  | 'on_hold'        // Pausado
  | 'cancelled';     // Cancelado

export type TaskPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  content: string;
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  type: 'status_change' | 'comment' | 'attachment' | 'assignment' | 'deadline_change' | 'progress_update';
  description: string;
  details?: any;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface TaskBoard {
  id: TaskStatus;
  name: string;
  color: string;
  tasks: Task[];
}

export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignedTo?: string[];
  projectId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
}

export interface TaskStats {
  total: number;
  notStarted: number;
  inProgress: number;
  completed: number;
  overdue: number;
  completionRate: number;
  averageCompletionTime: number; // in days
}
