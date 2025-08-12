import React from 'react';
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
import { X, Upload } from 'lucide-react';
import { Client } from '@/types/crm';

const clientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  organization: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  mobile: z.string().min(1, 'Telefone é obrigatório'),
  country: z.string().min(1, 'País é obrigatório'),
  state: z.string().min(1, 'Estado é obrigatório'),
  address: z.string().optional(),
  city: z.string().min(1, 'Cidade é obrigatória'),
  zipCode: z.string().optional(),
  budget: z.number().min(0, 'Orçamento deve ser positivo').optional(),
  currency: z.enum(['BRL', 'USD', 'EUR']),
  level: z.string().optional(),
  description: z.string().optional(),
  pis: z.string().optional(),
  cei: z.string().optional(),
  professionalTitle: z.string().optional(),
  maritalStatus: z.string().optional(),
  birthDate: z.string().optional(),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  inssStatus: z.string().optional(),
  amountPaid: z.number().optional(),
  referredBy: z.string().optional(),
  registeredBy: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
  onSubmit: (data: ClientFormData) => void;
  isEditing?: boolean;
  existingTags?: string[]; // Tags existentes de outros clientes
}

const countries = [
  { value: 'BR', label: 'Brasil' },
  { value: 'US', label: 'Estados Unidos' },
  { value: 'DE', label: 'Alemanha' },
  { value: 'FR', label: 'França' },
];

const maritalStatuses = [
  { value: 'single', label: 'Solteiro(a)' },
  { value: 'married', label: 'Casado(a)' },
  { value: 'divorced', label: 'Divorciado(a)' },
  { value: 'widowed', label: 'Viúvo(a)' },
];

const inssStatuses = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'retired', label: 'Aposentado' },
  { value: 'pensioner', label: 'Pensionista' },
];

export function ClientForm({ open, onOpenChange, client, onSubmit, isEditing = false, existingTags = [] }: ClientFormProps) {
  const [tags, setTags] = React.useState<string[]>(client?.tags || []);
  const [newTag, setNewTag] = React.useState('');
  const [selectedExistingTag, setSelectedExistingTag] = React.useState('');

  // FUNCIONALIDADE: Upload de arquivos para cliente
  // Sistema de planos futuros:
  // - Plano Básico: 1 arquivo por cliente
  // - Plano Intermediário: 2 arquivos por cliente
  // - Plano Premium: arquivos ilimitados por cliente
  const [clientFiles, setClientFiles] = React.useState<File[]>([]);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const MAX_FILES_BY_PLAN = 3; // Temporário - será dinâmico baseado no plano

  // Atualizar tags quando client mudar
  React.useEffect(() => {
    setTags(client?.tags || []);
    setSelectedExistingTag(''); // Reset dropdown quando trocar cliente
  }, [client]);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name || '',
      organization: client?.organization || '',
      email: client?.email || '',
      mobile: client?.mobile || '',
      country: client?.country || 'BR',
      state: client?.state || '',
      address: client?.address || '',
      city: client?.city || '',
      zipCode: client?.zipCode || '',
      budget: client?.budget || 0,
      currency: client?.currency || 'BRL',
      level: client?.level || '',
      description: client?.description || '',
      pis: client?.pis || '',
      cei: client?.cei || '',
      professionalTitle: client?.professionalTitle || '',
      maritalStatus: client?.maritalStatus || '',
      birthDate: client?.birthDate || '',
      cpf: client?.cpf || '',
      rg: client?.rg || '',
      inssStatus: client?.inssStatus || '',
      amountPaid: client?.amountPaid || 0,
      referredBy: client?.referredBy || '',
      // IMPLEMENTAÇÃO FUTURA: Pegar usuário atual logado do contexto/token
      // registeredBy: currentUser?.name || 'Dr. Advogado',
      registeredBy: client?.registeredBy || 'Dr. Advogado', // Temporário - será dinâmico
    },
  });

  // Atualizar formulário quando client mudar
  React.useEffect(() => {
    if (client) {
      form.reset({
        name: client.name || '',
        organization: client.organization || '',
        email: client.email || '',
        mobile: client.mobile || '',
        country: client.country || 'BR',
        state: client.state || '',
        address: client.address || '',
        city: client.city || '',
        zipCode: client.zipCode || '',
        budget: client.budget || 0,
        currency: client.currency || 'BRL',
        level: client.level || '',
        description: client.description || '',
        pis: client.pis || '',
        cei: client.cei || '',
        professionalTitle: client.professionalTitle || '',
        maritalStatus: client.maritalStatus || '',
        birthDate: client.birthDate || '',
        cpf: client.cpf || '',
        rg: client.rg || '',
        inssStatus: client.inssStatus || '',
        amountPaid: client.amountPaid || 0,
        referredBy: client.referredBy || '',
        // IMPLEMENTAÇÃO FUTURA: Pegar usuário atual logado
        registeredBy: client.registeredBy || 'Dr. Advogado', // Será currentUser.name
      });
    }
  }, [client, form]);

  const handleSubmit = (data: ClientFormData) => {
    onSubmit({ ...data, tags });
    onOpenChange(false);
    form.reset();
    setTags([]);
    setSelectedExistingTag(''); // Reset dropdown
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
      setSelectedExistingTag(''); // Reset dropdown selection
    }
  };

  // FUNCIONALIDADE: Gerenciamento de arquivos do cliente
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Verificar limite de arquivos baseado no plano
    if (clientFiles.length + files.length > MAX_FILES_BY_PLAN) {
      setFileError(`Limite excedido. Seu plano permite até ${MAX_FILES_BY_PLAN} arquivos por cliente.`);
      return;
    }

    // Verificar tipos de arquivo permitidos
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      setFileError('Apenas arquivos PNG, JPEG e PDF são permitidos.');
      return;
    }

    // Verificar tamanho dos arquivos (máximo 10MB por arquivo)
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setFileError('Arquivos devem ter no máximo 10MB.');
      return;
    }

    setClientFiles([...clientFiles, ...files]);
    setFileError(null);
  };

  const removeFile = (index: number) => {
    setClientFiles(clientFiles.filter((_, i) => i !== index));
    setFileError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Cliente' : 'Adicionar Novo Cliente'}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do cliente. Campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
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
                      <FormLabel>Email</FormLabel>
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
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o país" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
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
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado *</FormLabel>
                      <FormControl>
                        <Input placeholder="São Paulo" {...field} />
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
                        <Input placeholder="Rua, número, bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade *</FormLabel>
                      <FormControl>
                        <Input placeholder="São Paulo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input placeholder="00000-000" {...field} />
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
                          placeholder="0.00" 
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
              </div>
            </div>

            {/* Campos Jurídicos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações Jurídicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input placeholder="000.000.000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RG</FormLabel>
                      <FormControl>
                        <Input placeholder="00.000.000-0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PIS</FormLabel>
                      <FormControl>
                        <Input placeholder="000.00000.00-0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cei"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEI</FormLabel>
                      <FormControl>
                        <Input placeholder="00.000.00000/00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="professionalTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título Profissional</FormLabel>
                      <FormControl>
                        <Input placeholder="Advogado, Aposentado, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maritalStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado Civil</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o estado civil" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {maritalStatuses.map((status) => (
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
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="inssStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status INSS</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status INSS" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {inssStatuses.map((status) => (
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
                  name="amountPaid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Pago (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
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
                  name="referredBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Indicado Por</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do indicador" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registeredBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Colaborador que Cadastrou</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do colaborador" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                    <Select value={selectedExistingTag} onValueChange={addExistingTag}>
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

            {/* Upload de Arquivos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Documentos do Cliente</h3>
              <div className="border-2 border-dashed border-muted rounded-lg p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Faça upload de documentos do cliente (PNG, JPEG, PDF)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Máximo: {MAX_FILES_BY_PLAN} arquivos • Até 10MB por arquivo
                    </p>
                    {/* COMENTÁRIO IMPLEMENTAÇÃO FUTURA:
                        Sistema de planos que limitará quantidade de arquivos:
                        - Plano Básico: 1 arquivo por cliente
                        - Plano Intermediário: 2 arquivos por cliente
                        - Plano Premium: arquivos ilimitados por cliente

                        A verificação será feita no backend baseada no plano do usuário:
                        const userPlan = await getUserPlan(userId);
                        const maxFiles = getMaxFilesByPlan(userPlan);
                    */}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('client-file-upload')?.click()}
                    disabled={clientFiles.length >= MAX_FILES_BY_PLAN}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Adicionar Arquivos
                  </Button>

                  <input
                    id="client-file-upload"
                    type="file"
                    multiple
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {fileError && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive">{fileError}</p>
                  </div>
                )}

                {clientFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium">Arquivos Selecionados:</h4>
                    {clientFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                            {file.type.includes('pdf') ? '📄' : '🖼️'}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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
                    <Textarea placeholder="Informações adicionais sobre o cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => {
                try {
                  setTimeout(() => {
                    onOpenChange(false);
                  }, 0);
                } catch (error) {
                  console.error('Erro ao cancelar:', error);
                  onOpenChange(false);
                }
              }}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? 'Atualizar Cliente' : 'Adicionar Cliente'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
