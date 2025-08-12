import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  Edit,
  FileText,
  Tag,
  Target,
} from 'lucide-react';
import { Deal } from '@/types/crm';

interface DealViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: Deal | null;
  onEdit?: (deal: Deal) => void;
}

// Configuração dos estágios para exibição
const stageConfig = {
  contacted: { name: 'Em Contato', color: 'bg-blue-100 text-blue-800' },
  proposal: { name: 'Com Proposta', color: 'bg-yellow-100 text-yellow-800' },
  won: { name: 'Cliente Bem Sucedido', color: 'bg-green-100 text-green-800' },
  lost: { name: 'Cliente Perdido', color: 'bg-red-100 text-red-800' },
};

export function DealViewDialog({ 
  open, 
  onOpenChange, 
  deal, 
  onEdit 
}: DealViewDialogProps) {
  if (!deal) return null;

  const formatCurrency = (value: number, currency: string) => {
    const formatters = {
      BRL: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
      USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
      EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
    };
    return formatters[currency as keyof typeof formatters]?.format(value) || `${currency} ${value}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={deal.image} alt={deal.contactName} />
                <AvatarFallback className="text-lg">
                  {deal.contactName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl">{deal.title}</DialogTitle>
                <DialogDescription className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{deal.contactName}</span>
                  {deal.organization && (
                    <>
                      <span>•</span>
                      <Building className="h-4 w-4" />
                      <span>{deal.organization}</span>
                    </>
                  )}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={stageConfig[deal.stage]?.color || 'bg-gray-100 text-gray-800'}>
                {stageConfig[deal.stage]?.name || deal.stage}
              </Badge>
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(deal)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações de Contato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informações de Contato
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{deal.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{deal.mobile}</span>
                </div>
                {deal.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{deal.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Informações Financeiras
              </h3>
              <div className="space-y-3">
                {deal.budget && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Orçamento:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(deal.budget, deal.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Moeda:</span>
                  <span>{deal.currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estágio:</span>
                  <Badge className={stageConfig[deal.stage]?.color || 'bg-gray-100 text-gray-800'}>
                    {stageConfig[deal.stage]?.name || deal.stage}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tags */}
          {deal.tags && deal.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold flex items-center mb-3">
                <Tag className="h-5 w-5 mr-2" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {deal.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Descrição */}
          {deal.description && (
            <div>
              <h3 className="text-lg font-semibold flex items-center mb-3">
                <FileText className="h-5 w-5 mr-2" />
                Descrição
              </h3>
              <p className="text-sm text-muted-foreground bg-gray-50 p-4 rounded-lg">
                {deal.description}
              </p>
            </div>
          )}

          {/* Informações Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold flex items-center mb-3">
                <Calendar className="h-5 w-5 mr-2" />
                Datas Importantes
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criado em:</span>
                  <span>{formatDate(deal.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Atualizado em:</span>
                  <span>{formatDate(deal.updatedAt)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Referências</h3>
              <div className="space-y-2 text-sm">
                {deal.referredBy && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Indicado por:</span>
                    <span>{deal.referredBy}</span>
                  </div>
                )}
                {/* IMPLEMENTAÇÃO: Campo "Cadastrado por" - nome completo do perfil do colaborador */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cadastrado por:</span>
                  <span>{deal.registeredBy || 'Sistema Automático'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO DE DOCUMENTOS DO NEGÓCIO */}
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Documentos do Negócio
            </h3>
            {/* COMENTÁRIO IMPLEMENTAÇÃO:
                Esta seção mostrará os arquivos relacionados ao negócio/deal.
                
                FUNCIONALIDADES:
                - Arquivos anexados durante criação do deal
                - Contratos, propostas, documentos legais
                - Preview e download
                - Histórico de uploads
                - Controle de acesso
            */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Exemplo de arquivo - será dinâmico baseado nos documentos anexados */}
              <div className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">proposta_comercial.pdf</p>
                    <p className="text-xs text-muted-foreground">1.2 MB • PDF</p>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Visualizar
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Download
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">contrato_servicos.pdf</p>
                    <p className="text-xs text-muted-foreground">856 KB • PDF</p>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Visualizar
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Download
                  </Button>
                </div>
              </div>

              {/* Quando não há arquivos - funcionalidade será implementada dinamicamente */}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
