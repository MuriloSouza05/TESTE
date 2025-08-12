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
import { Deal, DealStage } from '@/types/crm';

const dealSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  contactName: z.string().min(1, 'Nome do contato é obrigatório'),
  organization: z.string().optional(),
  email: z.string().email('Email inválido'),
  mobile: z.string().min(1, 'Telefone é obrigatório'),
  address: z.string().optional(), // CAMPO NÃO OBRIGATÓRIO conforme solicitado
  budget: z.number().optional(), // CAMPO NÃO OBRIGATÓRIO conforme solicitado
  currency: z.enum(['BRL', 'USD', 'EUR']),
  // PIPELINE SIMPLIFICADO: Apenas 4 estágios conforme solicitado
  stage: z.enum(['contacted', 'proposal', 'won', 'lost']),
  description: z.string().optional(),
});

type DealFormData = z.infer<typeof dealSchema>;

interface DealFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: Deal;
  initialStage?: DealStage;
  onSubmit: (data: DealFormData & { tags: string[] }) => void;
  isEditing?: boolean;
}

// PIPELINE SIMPLIFICADO: Apenas 4 estágios conforme solicitado
const stageOptions = [
  { value: 'contacted', label: 'Em Contato' },
  { value: 'proposal', label: 'Com Proposta' },
  { value: 'won', label: 'Cliente Bem Sucedido' },
  { value: 'lost', label: 'Cliente Perdido' },
];

// REMOVIDOS: opportunity, advanced, general conforme solicitação

// Lista de tags existentes para dropdown - seria carregada da API
const existingTags = [
  'Consultoria Jurídica',
  'Ação Trabalhista',
  'Contrato Empresarial',
  'Direito Previdenciário',
  'Divórcio',
  'Inventário',
  'Recuperação Judicial',
  'Direito Imobiliário',
  'Direito Tributário',
  'Assessoria Legal'
];

export function DealForm({
  open,
  onOpenChange,
  deal,
  initialStage,
  onSubmit,
  isEditing = false
}: DealFormProps) {
  const [tags, setTags] = useState<string[]>(deal?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [selectedExistingTag, setSelectedExistingTag] = useState('');

  const form = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: deal?.title || '',
      contactName: deal?.contactName || '',
      organization: deal?.organization || '',
      email: deal?.email || '',
      mobile: deal?.mobile || '',
      address: deal?.address || '',
      budget: deal?.budget || undefined, // Permite campo vazio
      currency: deal?.currency || 'BRL',
      stage: deal?.stage || initialStage || 'contacted', // Estágio válido
      description: deal?.description || '',
    },
  });

  // Atualizar formulário quando deal mudar
  useEffect(() => {
    if (deal) {
      form.reset({
        title: deal.title || '',
        contactName: deal.contactName || '',
        organization: deal.organization || '',
        email: deal.email || '',
        mobile: deal.mobile || '',
        address: deal.address || '',
        budget: deal.budget || undefined, // Alterado para permitir campo vazio
        currency: deal.currency || 'BRL',
        stage: deal.stage || initialStage || 'contacted', // Alterado para stage válido
        description: deal.description || '',
      });
      setTags(deal.tags || []);
    } else {
      setTags([]);
      setSelectedExistingTag(''); // Reset dropdown selection
    }
  }, [deal, initialStage, form]);

  const handleClose = () => {
    form.reset();
    setTags([]);
    setNewTag('');
    setSelectedExistingTag(''); // Reset dropdown selection
    onOpenChange(false);
  };

  const handleSubmit = (data: DealFormData) => {
    onSubmit({ ...data, tags });
    handleClose();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Negócio' : 'Novo Negócio'}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do negócio no pipeline de vendas.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações do Negócio</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Título do Negócio *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Consultoria Jurídica Empresarial" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Contato *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do responsável" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organização</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone *</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Endereço completo (opcional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Orçamento</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00 (opcional)"
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
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moeda *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a moeda" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BRL">Real (R$)</SelectItem>
                          <SelectItem value="USD">Dólar (US$)</SelectItem>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stage"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Estágio no Pipeline *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o estágio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stageOptions.map((stage) => (
                            <SelectItem key={stage.value} value={stage.value}>
                              {stage.label}
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

            {/* Tags - DROPDOWN PARA TAGS EXISTENTES + CRIAÇÃO DE NOVAS */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tags</h3>

              {/* Dropdown para tags existentes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Selecionar tag existente:</label>
                <Select value={selectedExistingTag} onValueChange={setSelectedExistingTag}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolher tag existente..." />
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
                {selectedExistingTag && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (!tags.includes(selectedExistingTag)) {
                        setTags([...tags, selectedExistingTag]);
                        setSelectedExistingTag('');
                      }
                    }}
                  >
                    Adicionar tag selecionada
                  </Button>
                )}
              </div>

              {/* Campo para criar nova tag */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Ou criar nova tag:</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nova tag personalizada"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Tags adicionadas */}
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

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalhes sobre o negócio..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => {
                try {
                  setTimeout(() => {
                    handleClose();
                  }, 0);
                } catch (error) {
                  console.error('Erro ao cancelar:', error);
                  handleClose();
                }
              }}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? 'Atualizar Negócio' : 'Criar Negócio'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
