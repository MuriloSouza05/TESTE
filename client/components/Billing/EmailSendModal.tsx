import React, { useState } from "react";
import {
  createSafeOnOpenChange,
  createSafeDialogHandler,
} from "@/lib/dialog-fix";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Send,
  Eye,
  X,
  Globe,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

interface EmailSendModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: any[];
  onSendEmail: (data: any) => Promise<void>;
}

export function EmailSendModal({
  open,
  onOpenChange,
  documents,
  onSendEmail,
}: EmailSendModalProps) {
  // Create safe onOpenChange handler
  const safeOnOpenChange = createSafeOnOpenChange(onOpenChange);
  const [emailData, setEmailData] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    fromName: "Escritório Silva & Associados",
    fromEmail: "contato@silva.adv.br",
    replyTo: "contato@silva.adv.br",
    attachPdf: true,
    customMessage: "",
  });

  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Get template content based on document type
  const getTemplateContent = (document: any) => {
    if (!document || !document.type) {
      return "<p>No document available for preview</p>";
    }

    const isInvoice = document.type === "invoice";

    const baseTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${isInvoice ? "Fatura" : "Orçamento"} - ${document.number}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${isInvoice ? "#059669" : "#3B82F6"}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #374151; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
        .amount { font-size: 24px; font-weight: bold; color: ${isInvoice ? "#dc2626" : "#059669"}; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th, .table td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
        .table th { background: #f3f4f6; }
        .alert { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${isInvoice ? "📄 FATURA" : "📋 ORÇAMENTO"}</h1>
        <p>Nº ${document.number}</p>
    </div>
    
    <div class="content">
        <p>Prezado(a) <strong>${document.receiverName || document.clientName || "Cliente"}</strong>,</p>

        <p>${isInvoice ? "Segue fatura referente aos serviços prestados:" : "Segue em anexo o orçamento solicitado para os serviços jurídicos:"}</p>

        <table class="table">
            <tr>
                <th>Empresa:</th>
                <td>Escritório Silva & Associados</td>
            </tr>
            <tr>
                <th>${isInvoice ? "Data de Emissão:" : "Data:"}</th>
                <td>${document.date ? new Date(document.date).toLocaleDateString("pt-BR") : "N/A"}</td>
            </tr>
            ${
              isInvoice
                ? `
            <tr>
                <th>Vencimento:</th>
                <td><strong>${document.dueDate ? new Date(document.dueDate).toLocaleDateString("pt-BR") : "N/A"}</strong></td>
            </tr>
            `
                : `
            <tr>
                <th>Validade:</th>
                <td>${document.validUntil || document.dueDate ? new Date(document.validUntil || document.dueDate).toLocaleDateString("pt-BR") : "N/A"}</td>
            </tr>
            `
            }
            <tr>
                <th>Cliente:</th>
                <td>${document.receiverName || document.clientName || "Cliente"}</td>
            </tr>
        </table>
        
        <h3>Descrição dos Serviços:</h3>
        <div>${document.description || "Serviços jurídicos especializados"}</div>
        
        <div style="text-align: center; margin: 30px 0;">
            <div class="amount">Valor Total: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(document.total)}</div>
        </div>
        
        ${
          emailData.customMessage
            ? `
        <div class="alert">
            <strong>📝 Mensagem:</strong><br>
            ${emailData.customMessage.replace(/\n/g, "<br>")}
        </div>
        `
            : ""
        }
        
        <p>${isInvoice ? "Para efetuar o pagamento, utilize os dados bancários em anexo ou entre em contato conosco." : "Para aceitar este orçamento, entre em contato conosco através dos canais abaixo."}</p>
        
        <p>Atenciosamente,<br>
        <strong>${emailData.fromName}</strong></p>
    </div>
    
    <div class="footer">
        <p>📧 ${emailData.fromEmail} | 📞 (11) 3333-4444</p>
        ${isInvoice ? "<p>PIX: contato@silva.adv.br</p>" : ""}
    </div>
</body>
</html>`;

    return baseTemplate;
  };

  const handleSend = async () => {
    setSending(true);
    try {
      // Simulate Resend API call
      const firstDoc = documents && documents[0] ? documents[0] : null;

      const emailPayload = {
        from: `${emailData.fromName} <${emailData.fromEmail}>`,
        to: emailData.to.split(",").map((email) => email.trim()),
        cc: emailData.cc
          ? emailData.cc.split(",").map((email) => email.trim())
          : undefined,
        bcc: emailData.bcc
          ? emailData.bcc.split(",").map((email) => email.trim())
          : undefined,
        subject: emailData.subject,
        html: firstDoc
          ? getTemplateContent(firstDoc)
          : "<p>No document content available</p>",
        reply_to: emailData.replyTo,
        // NOVIDADE: Anexar documentos reais ao invés de PDF
        // Em produção, isso seria integrado com sistema de armazenamento
        attachments:
          emailData.attachPdf && documents.length > 0
            ? documents.map(doc => ({
                filename: `${doc.type || "document"}_${doc.number || "unknown"}.json`,
                content: JSON.stringify(doc, null, 2), // Em produção: conteúdo real do arquivo
                contentType: "application/json", // Em produção: tipo correto do arquivo
              }))
            : undefined,
        // COMENTÁRIO PARA BACKEND: Implementar integração com Resend API
        // - Configurar API key do Resend no backend
        // - Converter documentos para formato adequado (PDF, Word, etc.)
        // - Implementar templates de email personalizáveis
        // - Adicionar controle de entrega e leitura
      };

      // Call the actual send function
      await onSendEmail(emailPayload);

      alert(
        `✅ Email${documents.length > 1 ? "s" : ""} enviado${documents.length > 1 ? "s" : ""} com sucesso!\n\n📧 Destinatário${documents.length > 1 ? "s" : ""}: ${emailData.to}\n🎯 ${documents.length} documento${documents.length > 1 ? "s" : ""} enviado${documents.length > 1 ? "s" : ""}`,
      );

      safeOnOpenChange(false);
    } catch (error) {
      alert(
        "❌ Erro ao enviar email. Verifique as configurações e tente novamente.",
      );
    } finally {
      setSending(false);
    }
  };

  const generateSubject = () => {
    if (!documents || documents.length === 0) {
      return "[Silva & Associados] Documento";
    }

    const doc = documents[0];
    if (!doc || !doc.type) {
      return "[Silva & Associados] Documento";
    }

    const isInvoice = doc.type === "invoice";
    const prefix = "[Silva & Associados]";

    if (documents.length === 1) {
      return `${prefix} ${isInvoice ? "Fatura" : "Orçamento"} ${doc.number || ""} - ${doc.title || ""}`;
    } else {
      return `${prefix} ${documents.length} documento${documents.length > 1 ? "s" : ""} - ${isInvoice ? "Faturas" : "Orçamentos"}`;
    }
  };

  React.useEffect(() => {
    if (open && documents && documents.length > 0 && documents[0]) {
      setEmailData((prev) => ({
        ...prev,
        subject: generateSubject(),
        to:
          documents[0].receiverDetails?.email ||
          documents[0].clientEmail ||
          documents[0].email ||
          "",
      }));
    }
  }, [open, documents]);

  return (
    <Dialog open={open} onOpenChange={safeOnOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Enviar Email - {documents.length} Documento
            {documents.length > 1 ? "s" : ""}
          </DialogTitle>
          <DialogDescription>
            Configure e envie os documentos selecionados por email usando a API
            Resend.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Summary */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">📄 Documentos Selecionados:</h4>
            <div className="flex flex-wrap gap-2">
              {documents && documents.length > 0 ? (
                documents.map((doc) => (
                  <Badge key={doc?.id || Math.random()} variant="secondary">
                    {doc?.type === "invoice" ? "📄" : "📋"}{" "}
                    {doc?.number || "N/A"} -{" "}
                    {doc?.total
                      ? new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(doc.total)
                      : "R$ 0,00"}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline">Nenhum documento selecionado</Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Configuration */}
            <div className="space-y-4">
              <h3 className="font-medium">📧 Configuração do Email</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from-name">Nome do Remetente</Label>
                  <Input
                    id="from-name"
                    value={emailData.fromName}
                    onChange={(e) =>
                      setEmailData((prev) => ({
                        ...prev,
                        fromName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="from-email">Email do Remetente</Label>
                  <Input
                    id="from-email"
                    type="email"
                    value={emailData.fromEmail}
                    onChange={(e) =>
                      setEmailData((prev) => ({
                        ...prev,
                        fromEmail: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="to">Para (destinatários) *</Label>
                <Input
                  id="to"
                  type="email"
                  placeholder="cliente@email.com, outro@email.com"
                  value={emailData.to}
                  onChange={(e) =>
                    setEmailData((prev) => ({ ...prev, to: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cc">CC (opcional)</Label>
                  <Input
                    id="cc"
                    type="email"
                    placeholder="cc@email.com"
                    value={emailData.cc}
                    onChange={(e) =>
                      setEmailData((prev) => ({ ...prev, cc: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="bcc">CCO (opcional)</Label>
                  <Input
                    id="bcc"
                    type="email"
                    placeholder="bcc@email.com"
                    value={emailData.bcc}
                    onChange={(e) =>
                      setEmailData((prev) => ({ ...prev, bcc: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Assunto</Label>
                <Input
                  id="subject"
                  value={emailData.subject}
                  onChange={(e) =>
                    setEmailData((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="custom-message">
                  Mensagem Personalizada (opcional)
                </Label>
                <Textarea
                  id="custom-message"
                  placeholder="Adicione uma mensagem personalizada que será incluída no email..."
                  value={emailData.customMessage}
                  onChange={(e) =>
                    setEmailData((prev) => ({
                      ...prev,
                      customMessage: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              {/* NOVIDADE: Anexar documentos ao invés de PDF */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="attach-docs"
                  checked={emailData.attachPdf} // Mantido nome para compatibilidade
                  onCheckedChange={(checked) =>
                    setEmailData((prev) => ({ ...prev, attachPdf: checked }))
                  }
                />
                <Label htmlFor="attach-docs">Anexar documentos selecionados</Label>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Os documentos selecionados serão enviados como anexo no email
              </p>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">👁️ Preview do Email</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const previewWindow = window.open(
                      "",
                      "_blank",
                      "width=800,height=600",
                    );
                    if (previewWindow) {
                      const content =
                        documents && documents[0]
                          ? getTemplateContent(documents[0])
                          : "<p>Nenhum documento disponível</p>";
                      previewWindow.document.write(content);
                      previewWindow.document.close();
                    }
                  }}
                  disabled={!documents || documents.length === 0}
                >
                  <Globe className="h-4 w-4 mr-1" />
                  Abrir Preview
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden h-[400px]">
                <iframe
                  srcDoc={
                    documents && documents[0]
                      ? getTemplateContent(documents[0])
                      : '<div style="padding: 20px; text-align: center; color: #666;">Nenhum documento selecionado para preview</div>'
                  }
                  className="w-full h-full"
                  title="Preview do Email"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>API Resend configurada</span>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={createSafeDialogHandler(() => safeOnOpenChange(false))}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSend}
              disabled={
                !emailData.to || sending || !documents || documents.length === 0
              }
            >
              {sending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Email{documents.length > 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
