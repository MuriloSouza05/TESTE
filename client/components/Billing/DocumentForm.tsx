import React, { useState, useEffect } from "react";
import {
  createSafeOnOpenChange,
  createSafeDialogHandler,
} from "@/lib/dialog-fix";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Calculator } from "lucide-react";
import { BillingItem, BaseDocument, CompanyDetails } from "@/types/billing";

const documentSchema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  dueDate: z.string().min(1, "Data de vencimento é obrigatória"),
  senderId: z.string().min(1, "Remetente é obrigatório"),
  receiverId: z.string().min(1, "Destinatário é obrigatório"),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  currency: z.enum(["BRL", "USD", "EUR"]),
  discount: z.number().min(0, "Desconto deve ser positivo"),
  discountType: z.enum(["percentage", "fixed"]),
  fee: z.number().min(0, "Taxa deve ser positiva"),
  feeType: z.enum(["percentage", "fixed"]),
  tax: z.number().min(0, "Imposto deve ser positivo"),
  taxType: z.enum(["percentage", "fixed"]),
  notes: z.string().optional(),
}).refine((data) => true, {
  message: "Pelo menos um item deve ser adicionado",
  path: ["items"], // Campo virtual para mostrar erro
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface DocumentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document?: BaseDocument;
  onSubmit: (data: DocumentFormData & { items: BillingItem[] }) => void;
  isEditing?: boolean;
  type: "estimate" | "invoice";
}

const mockCompanies = [
  {
    id: "1",
    name: "Escritório Silva & Associados",
    document: "12.345.678/0001-90",
    email: "contato@silva.adv.br",
    phone: "(11) 3333-4444",
    address: "Av. Paulista, 1000, Bela Vista",
    city: "São Paulo",
    state: "SP",
    zipCode: "01310-100",
    country: "Brasil",
  },
];

const mockClients = [
  {
    id: "1",
    name: "Maria Silva Santos",
    document: "123.456.789-00",
    email: "maria@email.com",
    phone: "(11) 99999-1234",
    address: "Rua Augusta, 123, Cerqueira César",
    city: "São Paulo",
    state: "SP",
    zipCode: "01305-000",
    country: "Brasil",
  },
  {
    id: "2",
    name: "João Carlos Oliveira",
    document: "987.654.321-00",
    email: "joao@email.com",
    phone: "(11) 88888-5678",
    address: "Av. Copacabana, 456",
    city: "Rio de Janeiro",
    state: "RJ",
    zipCode: "22070-000",
    country: "Brasil",
  },
];

const serviceItems = [
  "Consulta jurídica",
  "Elaboração de contrato",
  "Petição inicial",
  "Recurso processual",
  "Acompanhamento processual",
  "Audiência judicial",
  "Parecer jurídico",
  "Análise de documentos",
];

export function DocumentForm({
  open,
  onOpenChange,
  document: doc,
  onSubmit,
  isEditing = false,
  type,
}: DocumentFormProps) {
  // Create safe onOpenChange handler
  const safeOnOpenChange = createSafeOnOpenChange(onOpenChange);
  const [items, setItems] = useState<BillingItem[]>(doc?.items || []);
  const [newItem, setNewItem] = useState({
    description: "",
    quantity: 1,
    rate: 0,
    // REMOVIDO: Campos de taxa para simplificar o formulário
  });

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      date: doc?.date
        ? doc.date.split("T")[0]
        : new Date().toISOString().split("T")[0],
      dueDate: doc?.dueDate ? doc.dueDate.split("T")[0] : "",
      senderId: doc?.senderId || "1",
      receiverId: doc?.receiverId || "",
      title: doc?.title || "",
      description: doc?.description || "",
      currency: doc?.currency || "BRL",
      discount: doc?.discount || 0,
      discountType: doc?.discountType || "fixed",
      fee: doc?.fee || 0,
      feeType: doc?.feeType || "fixed",
      tax: doc?.tax || 0,
      taxType: doc?.taxType || "percentage",
      notes: doc?.notes || "",
    },
  });

  // Calculate totals
  const calculations = React.useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const discount = form.watch("discount") || 0;
    const discountType = form.watch("discountType");
    const fee = form.watch("fee") || 0;
    const feeType = form.watch("feeType");
    const tax = form.watch("tax") || 0;
    const taxType = form.watch("taxType");

    const discountAmount =
      discountType === "percentage" ? (subtotal * discount) / 100 : discount;
    const feeAmount = feeType === "percentage" ? (subtotal * fee) / 100 : fee;
    const taxAmount = taxType === "percentage" ? (subtotal * tax) / 100 : tax;

    const total = subtotal - discountAmount + feeAmount + taxAmount;

    return {
      subtotal,
      discountAmount,
      feeAmount,
      taxAmount,
      total,
    };
  }, [
    items,
    form.watch("discount"),
    form.watch("discountType"),
    form.watch("fee"),
    form.watch("feeType"),
    form.watch("tax"),
    form.watch("taxType"),
  ]);

  const addItem = () => {
    if (newItem.description.trim() && newItem.rate > 0) {
      // CORREÇÃO: Cálculo simplificado sem taxa individual por item
      const amount = newItem.quantity * newItem.rate;

      const item: BillingItem = {
        id: Date.now().toString(),
        description: newItem.description,
        quantity: newItem.quantity,
        rate: newItem.rate,
        amount: amount,
        tax: 0, // Mantido para compatibilidade com tipos
      };

      setItems([...items, item]);
      setNewItem({
        description: "",
        quantity: 1,
        rate: 0,
      });
    }
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setItems(
      items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              // CORREÇÃO: Cálculo simplificado sem taxa individual
              amount: quantity * item.rate,
            }
          : item,
      ),
    );
  };

  // Atualizar formulário quando document mudar
  useEffect(() => {
    if (!open) return;

    if (doc) {
      form.reset({
        date: doc.date
          ? doc.date.split("T")[0]
          : new Date().toISOString().split("T")[0],
        dueDate: doc.dueDate ? doc.dueDate.split("T")[0] : "",
        senderId: doc.senderId || "1",
        receiverId: doc.receiverId || "",
        title: doc.title || "",
        description: doc.description || "",
        currency: doc.currency || "BRL",
        discount: doc.discount || 0,
        discountType: doc.discountType || "fixed",
        fee: doc.fee || 0,
        feeType: doc.feeType || "fixed",
        tax: doc.tax || 0,
        taxType: doc.taxType || "percentage",
        notes: doc.notes || "",
      });
      setItems(doc.items || []);
    } else {
      setItems([]);
    }
  }, [doc, open]);

  const handleSubmit = createSafeDialogHandler((data: DocumentFormData) => {
    // NOVIDADE: Validação obrigatória de itens para Orçamentos e Faturas
    if (items.length === 0) {
      alert("Erro: Pelo menos um item deve ser adicionado ao documento!");
      return;
    }

    // CORREÇÃO: Garantir que valores não sejam undefined/NaN
    const validItems = items.filter(item =>
      item.description &&
      !isNaN(item.quantity) &&
      !isNaN(item.rate) &&
      !isNaN(item.amount)
    );

    if (validItems.length === 0) {
      alert("Erro: Todos os itens devem ter valores válidos!");
      return;
    }

    onSubmit({ ...data, items: validItems });
    safeOnOpenChange(false);
  });

  const handleClose = createSafeDialogHandler(() => {
    setItems([]);
    setNewItem({
      description: "",
      quantity: 1,
      rate: 0,
      tax: 0,
      taxType: "percentage",
    });
    safeOnOpenChange(false);
  });

  const formatCurrency = (value: number) => {
    const currency = form.watch("currency") || "BRL";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
    }).format(value);
  };

  const getDocumentTitle = () => {
    switch (type) {
      case "estimate":
        return isEditing ? "Editar Orçamento" : "Novo Orçamento";
      case "invoice":
        return isEditing ? "Editar Fatura" : "Nova Fatura";

      default:
        return "Documento";
    }
  };

  return (
    <Dialog open={open} onOpenChange={safeOnOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDocumentTitle()}</DialogTitle>
          <DialogDescription>
            Preencha as informações do documento de cobrança. Campos marcados
            com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => handleSubmit(data))}
            className="space-y-6"
          >
            {/* Document Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Informações do Documento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data do Documento *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Vencimento *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
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

            {/* Sender and Receiver */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Remetente e Destinatário
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="senderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remetente *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o remetente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockCompanies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
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
                  name="receiverId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destinatário *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o destinatário" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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

            {/* Title and Description */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Serviços Jurídicos - Janeiro 2024"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrição adicional do documento..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Items */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Itens *</h3>
                <p className="text-sm text-muted-foreground">
                  Pelo menos um item deve ser adicionado ao documento
                </p>
              </div>

              {/* Add new item */}
              <div className="grid grid-cols-10 gap-2 p-4 border rounded-lg bg-muted/50">
                <div className="col-span-5">
                  <label className="text-xs text-muted-foreground block mb-1">
                    Descrição do Serviço
                  </label>
                  <Select
                    value={newItem.description}
                    onValueChange={(value) =>
                      setNewItem({ ...newItem, description: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceItems.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground block mb-1">
                    Quantidade
                  </label>
                  <Input
                    type="number"
                    placeholder="Qtd"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground block mb-1">
                    Valor Unitário (R$)
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={newItem.rate}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        rate: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                {/* REMOVIDO: Campo taxa sem funcionalidade conforme solicitado */}
                <div className="col-span-1">
                  <label className="text-xs text-muted-foreground block mb-1">
                    Ação
                  </label>
                  <Button type="button" onClick={addItem} className="w-full">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Items table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-20">Qtd</TableHead>
                    <TableHead className="w-32">Valor Unit.</TableHead>
                    <TableHead className="w-32">Total</TableHead>
                    <TableHead className="w-12">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItemQuantity(
                              item.id,
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>{formatCurrency(item.rate)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(item.amount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Nenhum item adicionado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Calculations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Cálculos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desconto</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormField
                          control={form.control}
                          name="discountType"
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fixed">R$</SelectItem>
                                <SelectItem value="percentage">%</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormField
                          control={form.control}
                          name="feeType"
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fixed">R$</SelectItem>
                                <SelectItem value="percentage">%</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imposto</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormField
                          control={form.control}
                          name="taxType"
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fixed">R$</SelectItem>
                                <SelectItem value="percentage">%</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Summary */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(calculations.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Desconto:</span>
                  <span className="text-red-600">
                    -{formatCurrency(calculations.discountAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa:</span>
                  <span>+{formatCurrency(calculations.feeAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Imposto:</span>
                  <span>+{formatCurrency(calculations.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(calculations.total)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? "Atualizar" : "Criar"}{" "}
                {type === "estimate" ? "Orçamento" : "Fatura"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
