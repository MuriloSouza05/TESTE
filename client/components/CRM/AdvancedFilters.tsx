import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface AdvancedFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: any) => void;
  existingTags?: string[]; // Tags já existentes em todos os clientes
}

const clientLevels = [
  'Premium',
  'Gold',
  'Silver',
  'Bronze',
  'Básico',
];

const locations = [
  'São Paulo - SP',
  'Rio de Janeiro - RJ',
  'Belo Horizonte - MG',
  'Salvador - BA',
  'Brasília - DF',
  'Curitiba - PR',
];

const budgetRanges = [
  { label: 'Até R$ 5.000', min: 0, max: 5000 },
  { label: 'R$ 5.001 - R$ 15.000', min: 5001, max: 15000 },
  { label: 'R$ 15.001 - R$ 30.000', min: 15001, max: 30000 },
  { label: 'R$ 30.001 - R$ 50.000', min: 30001, max: 50000 },
  { label: 'Acima de R$ 50.000', min: 50001, max: null },
];

export function AdvancedFilters({ open, onOpenChange, onApplyFilters, existingTags = [] }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState({
    levels: [] as string[],
    locations: [] as string[],
    budgetRange: '',
    tags: [] as string[],
    hasOrganization: '',
    dateRange: {
      start: '',
      end: '',
    },
  });

  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag.trim() && !filters.tags.includes(newTag.trim())) {
      setFilters({
        ...filters,
        tags: [...filters.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFilters({
      ...filters,
      tags: filters.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const addExistingTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      setFilters({
        ...filters,
        tags: [...filters.tags, tag],
      });
    }
  };

  const addLevel = (level: string) => {
    if (!filters.levels.includes(level)) {
      setFilters({
        ...filters,
        levels: [...filters.levels, level],
      });
    }
  };

  const removeLevel = (levelToRemove: string) => {
    setFilters({
      ...filters,
      levels: filters.levels.filter(level => level !== levelToRemove),
    });
  };

  const addLocation = (location: string) => {
    if (!filters.locations.includes(location)) {
      setFilters({
        ...filters,
        locations: [...filters.locations, location],
      });
    }
  };

  const removeLocation = (locationToRemove: string) => {
    setFilters({
      ...filters,
      locations: filters.locations.filter(location => location !== locationToRemove),
    });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onOpenChange(false);
  };

  const handleClear = () => {
    setFilters({
      levels: [],
      locations: [],
      budgetRange: '',
      tags: [],
      hasOrganization: '',
      dateRange: {
        start: '',
        end: '',
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filtros Avançados</DialogTitle>
          <DialogDescription>
            Configure filtros detalhados para encontrar clientes específicos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Levels */}
          <div className="space-y-2">
            <Label>Níveis de Cliente</Label>
            <Select onValueChange={addLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione níveis de cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientLevels.filter(level => !filters.levels.includes(level)).map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {filters.levels.map((level) => (
                <Badge key={level} variant="secondary" className="flex items-center gap-1">
                  {level}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeLevel(level)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-2">
            <Label>Localização</Label>
            <Select onValueChange={addLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione localizações" />
              </SelectTrigger>
              <SelectContent>
                {locations.filter(location => !filters.locations.includes(location)).map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {filters.locations.map((location) => (
                <Badge key={location} variant="secondary" className="flex items-center gap-1">
                  {location}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeLocation(location)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Budget Range */}
          <div className="space-y-2">
            <Label>Faixa de Orçamento</Label>
            <Select value={filters.budgetRange} onValueChange={(value) => setFilters({...filters, budgetRange: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma faixa de orçamento" />
              </SelectTrigger>
              <SelectContent>
                {budgetRanges.map((range, index) => (
                  <SelectItem key={index} value={range.label}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Has Organization */}
          <div className="space-y-2">
            <Label>Tipo de Cliente</Label>
            <Select value={filters.hasOrganization} onValueChange={(value) => setFilters({...filters, hasOrganization: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="with_org">Com Organização</SelectItem>
                <SelectItem value="without_org">Pessoa Física</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>

            {/* IMPLEMENTAÇÃO MELHORADA: Dropdown com tags existentes + input para novas */}
            <div className="space-y-3">
              {/* Dropdown com tags já existentes no sistema */}
              {existingTags.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground">Selecionar de tags existentes:</Label>
                  <Select onValueChange={addExistingTag}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolher tag existente" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingTags
                        .filter(tag => !filters.tags.includes(tag))
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
                <Label className="text-sm text-muted-foreground">Ou criar nova tag:</Label>
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
              {filters.tags.map((tag) => (
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

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Período de Cadastro</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Data Inicial</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, start: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="end-date">Data Final</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, end: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClear}>
            Limpar Filtros
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApply}>
              Aplicar Filtros
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
