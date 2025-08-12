import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Edit, Trash2, Mail, Phone, ChevronLeft, ChevronRight, Pin, Eye } from 'lucide-react';
import { Deal, PipelineStage, DealStage } from '@/types/crm';

interface PipelineProps {
  stages: PipelineStage[];
  onAddDeal: (stage: DealStage) => void;
  onEditDeal: (deal: Deal) => void;
  onDeleteDeal: (dealId: string) => void;
  onMoveDeal: (dealId: string, newStage: DealStage) => void;
  onViewDeal?: (deal: Deal) => void; // NOVA FUNCIONALIDADE: Visualizar deals
}

// PIPELINE SIMPLIFICADO: Apenas 4 estágios conforme solicitado
const stageConfig = {
  contacted: { name: 'Em Contato', color: 'bg-blue-100 text-blue-800' },
  proposal: { name: 'Com Proposta', color: 'bg-yellow-100 text-yellow-800' },
  won: { name: 'Cliente Bem Sucedido', color: 'bg-green-100 text-green-800' },
  lost: { name: 'Cliente Perdido', color: 'bg-red-100 text-red-800' },
};

// REMOVIDOS: opportunity, advanced, general conforme solicitação

export function Pipeline({ stages, onAddDeal, onEditDeal, onDeleteDeal, onMoveDeal, onViewDeal }: PipelineProps) {
  // IMPLEMENTAÇÃO: Paginação Kanban - 5 cards por página
  const [stagePagination, setStagePagination] = useState<Record<string, number>>({});
  const [pinnedDeals, setPinnedDeals] = useState<Set<string>>(new Set());
  const CARDS_PER_PAGE = 5;
  const formatCurrency = (value: number, currency: string) => {
    const formatters = {
      BRL: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
      USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
      EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
    };
    return formatters[currency as keyof typeof formatters]?.format(value) || `${currency} ${value}`;
  };

  const getTotalValue = (deals: Deal[]) => {
    return deals.reduce((total, deal) => total + deal.budget, 0);
  };

  // FUNCIONALIDADES DE PAGINAÇÃO
  const getCurrentPageDeals = (deals: Deal[], stageId: string) => {
    const currentPage = stagePagination[stageId] || 0;
    const startIndex = currentPage * CARDS_PER_PAGE;
    const endIndex = startIndex + CARDS_PER_PAGE;

    // ORDENAÇÃO: Novos negócios aparecem no topo - mais recentes primeiro
    const sortedDeals = [...deals].sort((a, b) =>
      new Date(b.createdAt || b.updatedAt || 0).getTime() - new Date(a.createdAt || a.updatedAt || 0).getTime()
    );

    // Separar deals pinados (sempre no topo) dos não pinados
    const pinnedStageDeals = sortedDeals.filter(deal => pinnedDeals.has(deal.id));
    const unpinnedDeals = sortedDeals.filter(deal => !pinnedDeals.has(deal.id));

    // Deals pinados sempre aparecem primeiro, depois os paginados
    const visiblePinnedDeals = pinnedStageDeals.slice(0, CARDS_PER_PAGE);
    const remainingSlots = CARDS_PER_PAGE - visiblePinnedDeals.length;

    if (remainingSlots > 0) {
      const paginatedUnpinned = unpinnedDeals.slice(startIndex, startIndex + remainingSlots);
      return [...visiblePinnedDeals, ...paginatedUnpinned];
    }

    return visiblePinnedDeals;
  };

  const getTotalPages = (deals: Deal[], stageId: string) => {
    const unpinnedCount = deals.filter(deal => !pinnedDeals.has(deal.id)).length;
    const pinnedCount = deals.filter(deal => pinnedDeals.has(deal.id)).length;
    const totalVisibleSlots = Math.max(unpinnedCount + pinnedCount - pinnedCount, unpinnedCount);
    return Math.ceil(totalVisibleSlots / CARDS_PER_PAGE);
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

  const togglePin = (dealId: string) => {
    setPinnedDeals(prev => {
      const newPinned = new Set(prev);
      if (newPinned.has(dealId)) {
        newPinned.delete(dealId);
      } else {
        newPinned.add(dealId);
      }
      return newPinned;
    });
  };

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('text/plain', dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStage: DealStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    onMoveDeal(dealId, targetStage);
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
                  {stageConfig[stage.id]?.name || stage.name}
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onAddDeal(stage.id)}
                  className="h-6 w-6 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{stage.deals.length} negócios</span>
                <span>
                  {formatCurrency(getTotalValue(stage.deals), 'BRL')}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 p-3 pt-0">
              {/* IMPLEMENTAÇÃO: Cards paginados - 5 por página */}
              {getCurrentPageDeals(stage.deals, stage.id).map((deal) => (
                <Card
                  key={deal.id}
                  className={`cursor-move hover:shadow-md transition-shadow ${
                    pinnedDeals.has(deal.id) ? 'ring-2 ring-blue-200 bg-blue-50/50' : ''
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, deal.id)}
                >
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-medium line-clamp-2">
                          {deal.title}
                        </h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => togglePin(deal.id)}>
                              <Pin className={`mr-2 h-3 w-3 ${pinnedDeals.has(deal.id) ? 'text-blue-600' : ''}`} />
                              {pinnedDeals.has(deal.id) ? 'Desafixar' : 'Fixar'}
                            </DropdownMenuItem>
                            {onViewDeal && (
                              <DropdownMenuItem onClick={() => onViewDeal(deal)}>
                                <Eye className="mr-2 h-3 w-3" />
                                Visualizar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onEditDeal(deal)}>
                              <Edit className="mr-2 h-3 w-3" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDeleteDeal(deal.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-3 w-3" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={deal.image} alt={deal.contactName} />
                          <AvatarFallback className="text-xs">
                            {deal.contactName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">
                            {deal.contactName}
                          </div>
                          {deal.organization && (
                            <div className="text-xs text-muted-foreground truncate">
                              {deal.organization}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 mr-1" />
                          <span className="truncate">{deal.email}</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 mr-1" />
                          <span className="truncate">{deal.mobile}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(deal.budget, deal.currency)}
                        </div>
                        <Badge 
                          className={stageConfig[deal.stage]?.color || 'bg-gray-100 text-gray-800'}
                          variant="secondary"
                        >
                          {stageConfig[deal.stage]?.name || deal.stage}
                        </Badge>
                      </div>

                      {deal.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {deal.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {deal.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{deal.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}

                      {deal.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {deal.description}
                        </p>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Criado: {new Date(deal.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {stage.deals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Nenhum negócio</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onAddDeal(stage.id)}
                    className="mt-2"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Adicionar
                  </Button>
                </div>
              )}

              {/* CONTROLES DE PAGINAÇÃO */}
              {stage.deals.length > CARDS_PER_PAGE && (
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
                    {(stagePagination[stage.id] || 0) + 1} / {getTotalPages(stage.deals, stage.id)}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => nextPage(stage.id, getTotalPages(stage.deals, stage.id))}
                    disabled={(stagePagination[stage.id] || 0) >= getTotalPages(stage.deals, stage.id) - 1}
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
