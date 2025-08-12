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
import { X, Plus } from 'lucide-react';
import { Transaction, PaymentMethod, TransactionStatus } from '@/types/cashflow';

/**
 * Schema de validação para transações usando Zod
 * Define as regras de validação para todos os campos obrigatórios e opcionais
 */
const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  date: z.string().min(1, 'Data é obrigatória'),
  paymentMethod: z.enum(['pix', 'credit_card', 'debit_card', 'bank_transfer', 'boleto', 'cash', 'check']).optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled']),
  projectId: z.string().optional(),
  clientId: z.string().optional(),
  notes: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurringFrequency: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

/**
 * Interface para as props do componente TransactionForm
 */
interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
  onSubmit: (data: TransactionFormData & { tags: string[] }) => void;
  isEditing?: boolean;
  forceRecurring?: boolean;
}

/**
 * Categorias específicas para escritórios de advocacia
 * Separadas por tipo (receita/despesa) com cores personalizadas
 */
const incomeCategories = [
  { id: 'honorarios', name: '⚖️ Honorários advocatícios', color: '#10B981' },
  { id: 'consultorias', name: '📋 Consultorias jurídicas', color: '#3B82F6' },
  { id: 'acordos', name: '🤝 Acordos e mediações', color: '#8B5CF6' },
  { id: 'custas_reemb', name: '🏛️ Custas judiciais reembolsadas', color: '#F59E0B' },
  { id: 'outros_servicos', name: '📄 Outros serviços jurídicos', color: '#6B7280' },
];

const expenseCategories = [
  { id: 'salarios', name: '👥 Salários e encargos trabalhistas', color: '#EF4444' },
  { id: 'aluguel', name: '🏢 Aluguel / condomínio', color: '#F97316' },
  { id: 'contas', name: '⚡ Contas (água, luz, internet)', color: '#84CC16' },
  { id: 'material', name: '📎 Material de escritório', color: '#06B6D4' },
  { id: 'marketing', name: '📢 Marketing e publicidade', color: '#EC4899' },
  { id: 'custas_judiciais', name: '🏛️ Custas judiciais', color: '#8B5CF6' },
  { id: 'treinamentos', name: '📚 Treinamentos e cursos', color: '#10B981' },
  { id: 'transporte', name: '🚗 Transporte e viagens', color: '#F59E0B' },
  { id: 'manutencao', name: '🔧 Manutenção e equipamentos', color: '#6B7280' },
  { id: 'impostos', name: '📋 Impostos e taxas', color: '#DC2626' },
  { id: 'oab', name: '🏛️ Associações profissionais (OAB)', color: '#7C3AED' },
  { id: 'seguro', name: '🛡️ Seguro profissional', color: '#059669' },
];

/**
 * Formas de pagamento disponíveis
 */
const paymentMethods = [
  { value: 'pix', label: 'PIX' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'bank_transfer', label: 'Transferência Bancária' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'check', label: 'Cheque' },
];

/**
 * Status disponíveis para transações
 */
const statusOptions = [
  { value: 'pending', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmado', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
];

/**
 * Dados mock para projetos - em produção viriam da API
 */
const mockProjects = [
  { id: '1', name: 'Ação Previdenciária - João Santos' },
  { id: '2', name: 'Divórcio Consensual - Maria e Carlos' },
  { id: '3', name: 'Recuperação Judicial - Tech LTDA' },
];

/**
 * Dados mock para clientes - em produção viriam da API
 */
const mockClients = [
  { id: '1', name: 'Maria Silva Santos' },
  { id: '2', name: 'João Carlos Oliveira' },
  { id: '3', name: 'Tech LTDA' },
];

/**
 * Componente TransactionForm
 * Formulário completo para criação e edição de transações financeiras
 * 
 * @param open - Controla se o modal está aberto
 * @param onOpenChange - Callback para alterar estado do modal
 * @param transaction - Transação a ser editada (opcional)
 * @param onSubmit - Callback para submissão do formulário
 * @param isEditing - Indica se está editando uma transação existente
 * @param forceRecurring - Força o formulário para modo recorrente
 */
export function TransactionForm({ 
  open, 
  onOpenChange, 
  transaction, 
  onSubmit, 
  isEditing = false,
  forceRecurring = false
}: TransactionFormProps) {
  // Estados locais do componente
  const [tags, setTags] = useState<string[]>(transaction?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isRecurring, setIsRecurring] = useState(forceRecurring || transaction?.isRecurring || false);
  const [error, setError] = useState<string | null>(null);

  // Log para debug
  console.log('TransactionForm renderizado:', { open, isEditing, forceRecurring, transaction });

  /**
   * Configuração do formulário com React Hook Form e Zod
   */
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type || 'income',
      amount: transaction?.amount || 0,
      categoryId: transaction?.categoryId || '',
      description: transaction?.description || '',
      date: transaction?.date ? transaction.date.split('T')[0] : new Date().toISOString().split('T')[0],
      paymentMethod: transaction?.paymentMethod || undefined,
      status: transaction?.status || 'confirmed',
      projectId: transaction?.projectId || 'none',
      clientId: transaction?.clientId || 'none',
      notes: transaction?.notes || '',
      isRecurring: isRecurring,
      recurringFrequency: transaction?.recurringFrequency || 'monthly',
    },
  });

  // Observa o tipo de transação para alterar categorias dinamicamente
  const transactionType = form.watch('type');
  const categories = transactionType === 'income' ? incomeCategories : expenseCategories;

  /**
   * Effect para atualizar formulário quando a transação ou props mudarem
   */
  useEffect(() => {
    if (!open) return;

    const recurringState = forceRecurring || transaction?.isRecurring || false;
    setIsRecurring(recurringState);

    if (transaction) {
      // Preenche formulário com dados da transação existente
      form.reset({
        type: transaction.type || 'income',
        amount: transaction.amount || 0,
        categoryId: transaction.categoryId || '',
        description: transaction.description || '',
        date: transaction.date ? transaction.date.split('T')[0] : new Date().toISOString().split('T')[0],
        paymentMethod: transaction.paymentMethod || undefined,
        status: transaction.status || 'confirmed',
        projectId: transaction.projectId || 'none',
        clientId: transaction.clientId || 'none',
        notes: transaction.notes || '',
        isRecurring: recurringState,
        recurringFrequency: transaction.recurringFrequency || 'monthly',
      });
      setTags(transaction.tags || []);
    } else {
      // Reseta formulário para nova transação
      form.reset({
        type: 'income',
        amount: 0,
        categoryId: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: undefined,
        status: 'confirmed',
        projectId: 'none',
        clientId: 'none',
        notes: '',
        isRecurring: recurringState,
        recurringFrequency: 'monthly',
      });
      setTags([]);
    }

    setError(null);
  }, [transaction, forceRecurring, open]);

  /**
   * Função para fechar o modal de forma segura
   * Previne travamentos ao resetar estados
   */
  const handleClose = () => {
    setTags([]);
    setNewTag('');
    setIsRecurring(false);
    setError(null);
    onOpenChange(false);
  };

  /**
   * Função para submeter o formulário
   * Inclui validação e tratamento de erro
   */
  const handleSubmit = (data: TransactionFormData) => {
    const submitData = {
      ...data,
      projectId: data.projectId === 'none' ? '' : data.projectId,
      clientId: data.clientId === 'none' ? '' : data.clientId,
      tags,
      isRecurring,
      recurringFrequency: isRecurring ? data.recurringFrequency : undefined
    };

    onSubmit(submitData);
    onOpenChange(false);
  };

  /**
   * Adiciona uma nova tag à lista
   */
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  /**
   * Remove uma tag da lista
   */
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  /**
   * Copia dados da última transação (funcionalidade futura)
   */
  const copyLastTransaction = () => {
    console.log('Funcionalidade: Copiar última transação');
    // TODO: Implementar cópia da última transação
  };

  // Exibe erro se houver problemas no componente
  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Erro</DialogTitle>
            <DialogDescription>{error}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={handleClose}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Transação' : forceRecurring ? 'Nova Transação Recorrente' : 'Nova Transação'}
          </DialogTitle>
          <DialogDescription>
            {forceRecurring ? 
              'Configure uma transação que se repetirá automaticamente. Campos marcados com * são obrigatórios.' :
              'Registre uma entrada ou saída no fluxo de caixa. Campos marcados com * são obrigatórios.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Seção: Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Campo: Tipo */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="income">💰 Receita</SelectItem>
                          <SelectItem value="expense">💸 Despesa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campo: Valor */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0,00"
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

            {/* Seção: Categoria e Descrição */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {/* Campo: Categoria */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={`Selecione uma categoria de ${transactionType === 'income' ? 'receita' : 'despesa'}`} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campo: Descrição */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Honorários advocatícios - Caso João Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Seção: Data e Status */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Campo: Data */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campo: Status */}
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

                {/* Campo: Forma de Pagamento */}
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forma de Pagamento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
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

            {/* Seção: Relacionamentos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Relacionamentos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Campo: Projeto */}
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
                          {mockProjects.map((project) => (
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

                {/* Campo: Cliente */}
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente Relacionado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhum cliente</SelectItem>
                          {mockClients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
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

            {/* Seção: Tags */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tags</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
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

            {/* Seção: Configurações de Recorrência */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recorrência</h3>
              <div className="flex items-center space-x-2 p-4 border rounded-lg bg-muted/30">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={isRecurring}
                  onChange={(e) => {
                    setIsRecurring(e.target.checked);
                    form.setValue('isRecurring', e.target.checked);
                  }}
                  className="w-4 h-4"
                />
                <label htmlFor="isRecurring" className="text-sm font-medium">
                  Esta é uma transação recorrente
                </label>
              </div>
              
              {isRecurring && (
                <FormField
                  control={form.control}
                  name="recurringFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequência</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a frequência" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">📅 Mensal</SelectItem>
                          <SelectItem value="quarterly">📆 Trimestral</SelectItem>
                          <SelectItem value="yearly">📅 Anual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Seção: Observações */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Informações adicionais sobre a transação..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Seção: Botões de Ação */}
            <div className="flex justify-between">
              {!forceRecurring && (
                <Button type="button" variant="outline" onClick={copyLastTransaction}>
                  Copiar Última
                </Button>
              )}
              {forceRecurring && <div></div>}
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {isEditing ? 'Atualizar Transação' : 'Adicionar Transação'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
