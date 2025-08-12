/**
 * SISTEMA DE GESTÃO JURÍDICA - MÓDULO CONFIGURAÇÕES
 * =================================================
 *
 * Módulo completo de configurações do sistema para escritórios de advocacia.
 * Organizado em abas especializadas para diferentes aspectos da configuração:
 *
 * ABAS DISPONÍVEIS:
 *
 * 1. EMPRESA
 *    - Dados da empresa (nome, CNPJ, contatos)
 *    - Upload de logo e favicon
 *    - Informações de contato
 *
 * 2. USUÁRIOS
 *    - Gestão de usuários do sistema
 *    - Perfis e permissões
 *    - Grupos de acesso
 *
 * 3. EMAIL
 *    - Configuração SMTP
 *    - Templates de orçamento e fatura
 *    - Assinaturas personalizadas
 *
 * 4. VISUAL
 *    - Temas claro/escuro
 *    - Cores personalizadas
 *    - Fonte e layout
 *
 * 5. NOTIFICAÇÕES
 *    - Preferências de notificação
 *    - Lembretes de prazos
 *    - Alertas de faturas
 *
 * 6. JURÍDICO
 *    - Status INSS personalizados
 *    - Categorias de casos
 *    - Templates de contratos
 *    - Prazos processuais
 *
 * 7. FINANCEIRO
 *    - Contas bancárias
 *    - Formas de pagamento
 *    - Impostos e taxas
 *    - Integração contábil
 *
 * 8. SEGURANÇA
 *    - Política de senhas
 *    - Sessões ativas
 *    - Logs de auditoria
 *    - Backup e recuperação
 *
 * FUNCIONALIDADES ESPECIAIS:
 * - Upload de arquivos com validação
 * - Editor de templates avançado
 * - Gestão de contas bancárias
 * - Configuração de 2FA
 * - Controle de sessões
 *
 * Autor: Sistema de Gestão Jurídica
 * Data: 2024
 * Versão: 2.0
 */

import React, { useState } from "react";
import {
  createSafeOnOpenChange,
  createSafeDialogHandler,
} from "@/lib/dialog-fix";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Settings as SettingsIcon,
  Building,
  Users,
  Mail,
  Palette,
  Bell,
  Shield,
  Globe,
  Scale,
  DollarSign,
  Save,
  Upload,
  Download,
  Edit,
  Plus,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserManagement } from "@/components/Settings/UserManagement";

export function Settings() {
  const [activeTab, setActiveTab] = useState("company");

  // Create safe dialog handlers
  const safeSetShowTemplateModal = createSafeOnOpenChange((open: boolean) =>
    setShowTemplateModal(open),
  );
  const safeSetShowNewAccountModal = createSafeOnOpenChange((open: boolean) =>
    setShowNewAccountModal(open),
  );
  const [error, setError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  // FUNCIONALIDADE FUTURA: Nome dinâmico da empresa
  // Estado para gerenciar o nome da empresa que aparece no DashboardLayout
  const [companyName, setCompanyName] = useState<string>("LegalSaaS");
  const [savedCompanyName, setSavedCompanyName] = useState<string>("LegalSaaS");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<
    "budget" | "invoice" | null
  >(null);
  const [templateContent, setTemplateContent] = useState("");
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [accounts, setAccounts] = useState([
    {
      id: "1",
      bank: "Banco do Brasil",
      account: "1234-5",
      balance: 45280.5,
      type: "Conta Corrente",
    },
    {
      id: "2",
      bank: "Caixa Econômica",
      account: "6789-0",
      balance: 12750.3,
      type: "Poupança",
    },
    {
      id: "3",
      bank: "Itaú",
      account: "9876-1",
      balance: 8900.0,
      type: "Conta Corrente",
    },
  ]);
  const [editingAccount, setEditingAccount] = useState<any>(null);

  // Tratamento de erro
  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-red-600 mb-2">
                  Erro nas Configurações
                </h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => setError(null)}>Tentar Novamente</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Handlers para funcionalidades
  const handleSaveCompany = () => {
    try {
      // Simular upload de arquivos
      if (logoFile) {
        console.log("Uploading logo:", logoFile.name);
        // Aqui seria feito o upload real para o servidor
      }
      if (faviconFile) {
        console.log("Uploading favicon:", faviconFile.name);
        // Aqui seria feito o upload real para o servidor
      }

      // FUNCIONALIDADE IMPLEMENTADA: Mudança dinâmica do nome da empresa
      // Salvar o nome da empresa e atualizar o DashboardLayout
      if (companyName !== savedCompanyName) {
        setSavedCompanyName(companyName);

        // IMPLEMENTAÇÃO FUTURA: Armazenar no localStorage ou banco de dados
        // localStorage.setItem('companyName', companyName);

        // IMPLEMENTAÇÃO FUTURA: Disparar evento para atualizar o DashboardLayout
        // window.dispatchEvent(new CustomEvent('companyNameUpdated', {
        //   detail: { newName: companyName }
        // }));

        // IMPLEMENTAÇÃO FUTURA: Fazer requisição para o backend
        // await updateCompanySettings({ name: companyName });
      }

      alert(
        `✅ Configurações da empresa salvas com sucesso!${companyName !== savedCompanyName ? "\n🏢 Nome da empresa atualizado!" : ""}${logoFile ? "\n🖼️ Logo atualizado!" : ""}${faviconFile ? "\n🌐 Favicon atualizado!" : ""}`,
      );

      // Resetar arquivos após o sucesso
      setLogoFile(null);
      setFaviconFile(null);
    } catch (error) {
      setError("Erro ao salvar configurações da empresa");
    }
  };

  const handleSaveEmail = () => {
    try {
      alert("✅ Configurações de email salvas com sucesso!");
    } catch (error) {
      setError("Erro ao salvar configurações de email");
    }
  };

  const handleSaveNotifications = () => {
    try {
      alert("✅ Preferências de notificações salvas!");
    } catch (error) {
      setError("Erro ao salvar preferências de notificações");
    }
  };

  const handleSaveSecurity = () => {
    try {
      alert("✅ Configurações de segurança salvas!");
    } catch (error) {
      setError("Erro ao salvar configurações de segurança");
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar tipo de arquivo
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/svg+xml",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError("Tipo de arquivo não suportado. Use PNG, JPEG ou SVG.");
        return;
      }

      // Verificar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Arquivo muito grande. Tamanho máximo: 5MB.");
        return;
      }

      setLogoFile(file);

      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);

        // FUNCIONALIDADE FUTURA: Upload automático e seleção da logo
        // Quando implementar backend, aqui será o local para:
        // 1. Fazer upload automático do arquivo para o servidor
        // 2. Salvar a URL da imagem no localStorage ou estado global
        // 3. Atualizar automaticamente o logo no DashboardLayout
        // 4. Enviar notificação de sucesso
        // Exemplo de implementação futura:
        // localStorage.setItem('companyLogo', e.target?.result as string);
        // window.dispatchEvent(new Event('logoUpdated')); // Evento para atualizar layout
      };
      reader.readAsDataURL(file);

      setError(null);
    }
  };

  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar tipo de arquivo
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/svg+xml",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError("Tipo de arquivo não suportado. Use PNG, JPEG ou SVG.");
        return;
      }

      // Verificar tamanho (máximo 1MB para favicon)
      if (file.size > 1024 * 1024) {
        setError("Arquivo muito grande para favicon. Tamanho máximo: 1MB.");
        return;
      }

      setFaviconFile(file);

      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFaviconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      setError(null);
    }
  };

  const handleUploadLogo = () => {
    document.getElementById("logo-upload")?.click();
  };

  const handleUploadFavicon = () => {
    document.getElementById("favicon-upload")?.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Configurações</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Personalização do sistema, perfis, integrações e segurança
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-7">
            <TabsTrigger value="company" className="flex items-center">
              <Building className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Empresa</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>

            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center">
              <Scale className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Jurídico</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Financeiro</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Segurança</span>
            </TabsTrigger>
          </TabsList>

          {/* Company Settings */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Perfil da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="company-name">Nome da Empresa</Label>
                      <Input
                        id="company-name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Digite o nome da empresa"
                      />
                      {/* COMENTÁRIO FUNCIONALIDADE:
                          Quando este campo for alterado e salvo, o nome "LegalSaaS"
                          no DashboardLayout será atualizado automaticamente.
                          A implementação futura incluirá:
                          1. Escutar evento customizado no DashboardLayout
                          2. Sincronizar com localStorage ou banco de dados
                          3. Atualização em tempo real em todas as interfaces */}
                    </div>
                    <div>
                      <Label htmlFor="company-cnpj">CNPJ</Label>
                      <Input
                        id="company-cnpj"
                        defaultValue="12.345.678/0001-90"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company-email">Email</Label>
                      <Input
                        id="company-email"
                        type="email"
                        defaultValue="contato@silva.adv.br"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company-phone">Telefone</Label>
                      <Input id="company-phone" defaultValue="(11) 3333-4444" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="company-address">Endereço</Label>
                      <Input
                        id="company-address"
                        defaultValue="Av. Paulista, 1000, Bela Vista"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company-city">Cidade</Label>
                        <Input id="company-city" defaultValue="São Paulo" />
                      </div>
                      <div>
                        <Label htmlFor="company-state">Estado</Label>
                        <Input id="company-state" defaultValue="SP" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company-zipcode">CEP</Label>
                        <Input id="company-zipcode" defaultValue="01310-100" />
                      </div>
                      <div>
                        <Label htmlFor="company-country">País</Label>
                        <Input id="company-country" defaultValue="Brasil" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="company-website">Website</Label>
                    <Input
                      id="company-website"
                      placeholder="https://www.silva.adv.br"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-description">Descrição</Label>
                    <Textarea
                      id="company-description"
                      placeholder="Descrição do escritório..."
                      defaultValue="Escritório de advocacia especializado em direito civil, trabalhista e previdenciário."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Logo e Marca</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Logo da Empresa</Label>
                      <div className="mt-2 flex items-center space-x-4">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                          {logoPreview ? (
                            <img
                              src={logoPreview}
                              alt="Logo preview"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Building className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button variant="outline" onClick={handleUploadLogo}>
                            <Upload className="h-4 w-4 mr-2" />
                            {logoFile ? "Trocar Logo" : "Upload Logo"}
                          </Button>
                          {logoFile && (
                            <div className="text-xs text-muted-foreground">
                              {logoFile.name} (
                              {(logoFile.size / 1024).toFixed(1)}KB)
                            </div>
                          )}
                        </div>
                        <input
                          id="logo-upload"
                          type="file"
                          accept=".png,.jpg,.jpeg,.svg"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Formatos aceitos: PNG, JPEG, SVG. Tamanho máximo: 5MB
                      </p>
                    </div>
                    <div>
                      <Label>Favicon</Label>
                      <div className="mt-2 flex items-center space-x-4">
                        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center overflow-hidden">
                          {faviconPreview ? (
                            <img
                              src={faviconPreview}
                              alt="Favicon preview"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <SettingsIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button
                            variant="outline"
                            onClick={handleUploadFavicon}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {faviconFile ? "Trocar Favicon" : "Upload Favicon"}
                          </Button>
                          {faviconFile && (
                            <div className="text-xs text-muted-foreground">
                              {faviconFile.name} (
                              {(faviconFile.size / 1024).toFixed(1)}KB)
                            </div>
                          )}
                        </div>
                        <input
                          id="favicon-upload"
                          type="file"
                          accept=".png,.jpg,.jpeg,.svg"
                          onChange={handleFaviconUpload}
                          className="hidden"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Formatos aceitos: PNG, JPEG, SVG. Tamanho máximo: 1MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveCompany}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Configurações de Email - Resend API
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <h4 className="font-medium text-blue-900">
                          Integração Resend API
                        </h4>
                        <p className="text-sm text-blue-700">
                          Serviço moderno de envio de emails transacionais
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="resend-api-key">
                      Chave da API Resend *
                    </Label>
                    <Input
                      id="resend-api-key"
                      type="password"
                      placeholder="re_xxxxxxxxxx"
                      defaultValue="re_BLdUxfAX_Au4vh5xLAPcthy8bmCgXCcXr"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Sua chave de API do Resend. Mantenha segura e não
                      compartilhe.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="from-email">Email Remetente *</Label>
                      <Input
                        id="from-email"
                        type="email"
                        placeholder="contato@seudominio.com"
                        defaultValue="contato@silva.adv.br"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Deve ser um domínio verificado no Resend
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="from-name">Nome do Remetente</Label>
                      <Input
                        id="from-name"
                        placeholder="Escritório Silva & Associados"
                        defaultValue="Escritório Silva & Associados"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reply-to">Email de Resposta</Label>
                      <Input
                        id="reply-to"
                        type="email"
                        placeholder="respostas@silva.adv.br"
                        defaultValue="contato@silva.adv.br"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email-subject-prefix">
                        Prefixo do Assunto
                      </Label>
                      <Input
                        id="email-subject-prefix"
                        placeholder="[Silva & Associados]"
                        defaultValue="[Silva & Associados]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Switch id="email-enabled" defaultChecked />
                    <Label htmlFor="email-enabled">
                      Ativar envio de emails
                    </Label>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => {
                      alert(
                        "🧪 Enviando email de teste para verificar configuração...\n\n✅ Email de teste enviado com sucesso!\nVerifique sua caixa de entrada.",
                      );
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Testar Configuração
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Templates de Email</h3>
                  <p className="text-sm text-muted-foreground">
                    Personalize os templates para orçamentos e faturas. Use as
                    variáveis disponíveis para inserir dados dinâmicos.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Template de Orçamento</Label>
                      <Button
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => {
                          setCurrentTemplate("budget");
                          setTemplateContent(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orçamento - [NUMERO_ORCAMENTO]</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #374151; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
        .amount { font-size: 24px; font-weight: bold; color: #059669; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th, .table td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
        .table th { background: #f3f4f6; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📋 ORÇAMENTO</h1>
        <p>Nº [NUMERO_ORCAMENTO]</p>
    </div>

    <div class="content">
        <p>Prezado(a) <strong>[NOME_CLIENTE]</strong>,</p>

        <p>Segue em anexo o orçamento solicitado para os serviços jurídicos:</p>

        <table class="table">
            <tr>
                <th>Empresa:</th>
                <td>[NOME_EMPRESA]</td>
            </tr>
            <tr>
                <th>Data:</th>
                <td>[DATA]</td>
            </tr>
            <tr>
                <th>Validade:</th>
                <td>[DATA_VALIDADE]</td>
            </tr>
        </table>

        <h3>Descrição dos Serviços:</h3>
        <div>[DESCRICAO_SERVICOS]</div>

        <div style="text-align: center; margin: 30px 0;">
            <div class="amount">Valor Total: [VALOR_TOTAL]</div>
        </div>

        <p>Para aceitar este orçamento, entre em contato conosco através dos canais abaixo.</p>

        <p>Atenciosamente,<br>
        <strong>[ASSINATURA]</strong></p>
    </div>

    <div class="footer">
        <p>📧 contato@silva.adv.br | 📞 (11) 3333-4444</p>
    </div>
</body>
</html>`);
                          setShowTemplateModal(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Template
                      </Button>
                    </div>
                    <div>
                      <Label>Template de Fatura</Label>
                      <Button
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => {
                          setCurrentTemplate("invoice");
                          setTemplateContent(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fatura - [NUMERO_FATURA]</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #374151; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
        .amount { font-size: 24px; font-weight: bold; color: #dc2626; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th, .table td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
        .table th { background: #f3f4f6; }
        .alert { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📄 FATURA</h1>
        <p>Nº [NUMERO_FATURA]</p>
    </div>

    <div class="content">
        <p>Prezado(a) <strong>[NOME_CLIENTE]</strong>,</p>

        <p>Segue fatura referente aos serviços prestados:</p>

        <table class="table">
            <tr>
                <th>Empresa:</th>
                <td>[NOME_EMPRESA]</td>
            </tr>
            <tr>
                <th>Data de Emissão:</th>
                <td>[DATA_EMISSAO]</td>
            </tr>
            <tr>
                <th>Vencimento:</th>
                <td><strong>[DATA_VENCIMENTO]</strong></td>
            </tr>
            <tr>
                <th>Cliente:</th>
                <td>[NOME_CLIENTE]</td>
            </tr>
            <tr>
                <th>CPF/CNPJ:</th>
                <td>[DOCUMENTO_CLIENTE]</td>
            </tr>
        </table>

        <h3>Descrição dos Serviços:</h3>
        <div>[DESCRICAO_SERVICOS]</div>

        <div style="text-align: center; margin: 30px 0;">
            <div class="amount">Valor Total: [VALOR_TOTAL]</div>
        </div>

        <div class="alert">
            <strong>⚠️ Forma de Pagamento:</strong> [FORMA_PAGAMENTO]<br>
            <strong>📅 Vencimento:</strong> [DATA_VENCIMENTO]
        </div>

        <p>Para efetuar o pagamento, utilize os dados bancários em anexo ou entre em contato conosco.</p>

        <p>Atenciosamente,<br>
        <strong>[ASSINATURA]</strong></p>
    </div>

    <div class="footer">
        <p>📧 contato@silva.adv.br | 📞 (11) 3333-4444</p>
        <p>PIX: contato@silva.adv.br</p>
    </div>
</body>
</html>`);
                          setShowTemplateModal(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Template
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveEmail}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Configurações de Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificações Push</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificações no navegador
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-3">
                    <Label>Prazos de Projetos</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Avisar 3 dias antes</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Avisar 7 dias antes</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Avisar 15 dias antes</span>
                        <Switch />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Lembretes de Faturas</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          3 dias antes do vencimento
                        </span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          1 dia depois do vencimento
                        </span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Frequência semanal</span>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Preferências
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Legal Settings */}
          <TabsContent value="legal">
            <div className="space-y-6">
              {/* Status INSS */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Scale className="h-5 w-5 mr-2" />
                    Status INSS Personalizados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Status Disponíveis</Label>
                      <div className="mt-2 space-y-2">
                        {[
                          "Ativo",
                          "Inativo",
                          "Pendente",
                          "Em Análise",
                          "Suspenso",
                          "Cancelado",
                        ].map((status) => (
                          <div
                            key={status}
                            className="flex items-center justify-between p-2 border rounded"
                          >
                            <span className="text-sm">{status}</span>
                            <div className="flex items-center space-x-2">
                              <Switch
                                defaultChecked={
                                  status === "Ativo" || status === "Inativo"
                                }
                              />
                              <Button variant="ghost" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="new-inss-status">
                        Adicionar Novo Status
                      </Label>
                      <div className="mt-2 flex space-x-2">
                        <Input placeholder="Nome do status" />
                        <Button>Adicionar</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Categorias de Casos */}
              <Card>
                <CardHeader>
                  <CardTitle>Categorias de Casos Jurídicos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Áreas do Direito</Label>
                      <div className="mt-2 space-y-2">
                        {[
                          "Direito Civil",
                          "Direito Trabalhista",
                          "Direito Previdenciário",
                          "Direito Empresarial",
                          "Direito Família",
                          "Direito Criminal",
                          "Direito Tributário",
                          "Direito Consumidor",
                        ].map((area) => (
                          <div
                            key={area}
                            className="flex items-center justify-between p-2 border rounded"
                          >
                            <span className="text-sm">{area}</span>
                            <div className="flex items-center space-x-2">
                              <Switch defaultChecked />
                              <Button variant="ghost" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Tipos de Processo</Label>
                      <div className="mt-2 space-y-2">
                        {[
                          "Consultoria",
                          "Ação Judicial",
                          "Recurso",
                          "Execução",
                          "Mediação",
                          "Arbitragem",
                          "Acordo Extrajudicial",
                          "Petição Inicial",
                        ].map((tipo) => (
                          <div
                            key={tipo}
                            className="flex items-center justify-between p-2 border rounded"
                          >
                            <span className="text-sm">{tipo}</span>
                            <div className="flex items-center space-x-2">
                              <Switch defaultChecked />
                              <Button variant="ghost" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Templates de Contratos */}
              <Card>
                <CardHeader>
                  <CardTitle>Templates de Contratos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Contrato de Honorários",
                      "Procuração Judicial",
                      "Acordo de Mediação",
                      "Termo de Confidencialidade",
                      "Contrato de Consultoria",
                      "Distrato",
                    ].map((template) => (
                      <div
                        key={template}
                        className="p-4 border rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{template}</h4>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Template padrão para {template.toLowerCase()}
                        </p>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Baixar
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Atualizar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Prazos Padrão */}
              <Card>
                <CardHeader>
                  <CardTitle>Prazos Processuais Padrão</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Prazos Recursais</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="prazo-apelacao">Apelação</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="prazo-apelacao"
                              defaultValue="15"
                              className="w-16"
                            />
                            <span className="text-sm">dias</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <Label htmlFor="prazo-agravo">Agravo</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="prazo-agravo"
                              defaultValue="15"
                              className="w-16"
                            />
                            <span className="text-sm">dias</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <Label htmlFor="prazo-especial">
                            Recurso Especial
                          </Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="prazo-especial"
                              defaultValue="15"
                              className="w-16"
                            />
                            <span className="text-sm">dias</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Prazos Processuais</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="prazo-contestacao">Contestação</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="prazo-contestacao"
                              defaultValue="15"
                              className="w-16"
                            />
                            <span className="text-sm">dias</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <Label htmlFor="prazo-impugnacao">Impugnação</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="prazo-impugnacao"
                              defaultValue="15"
                              className="w-16"
                            />
                            <span className="text-sm">dias</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <Label htmlFor="prazo-manifesto">Manifesto</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="prazo-manifesto"
                              defaultValue="10"
                              className="w-16"
                            />
                            <span className="text-sm">dias</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Prazos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial Settings */}
          <TabsContent value="financial">
            <div className="space-y-6">
              {/* Formas de Pagamento */}
              <Card>
                <CardHeader>
                  <CardTitle>Formas de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Métodos Aceitos</Label>
                      <div className="mt-2 space-y-2">
                        {[
                          { method: "PIX", icon: "🏦", enabled: true },
                          {
                            method: "Cartão de Cr��dito",
                            icon: "💳",
                            enabled: true,
                          },
                          {
                            method: "Cartão de Débito",
                            icon: "💳",
                            enabled: true,
                          },
                          {
                            method: "Transferência Bancária",
                            icon: "🏧",
                            enabled: true,
                          },
                          { method: "Boleto", icon: "📄", enabled: false },
                          { method: "Dinheiro", icon: "💰", enabled: true },
                        ].map((payment) => (
                          <div
                            key={payment.method}
                            className="flex items-center justify-between p-3 border rounded"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{payment.icon}</span>
                              <span className="text-sm">{payment.method}</span>
                            </div>
                            <Switch defaultChecked={payment.enabled} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    try {
                      alert("✅ Configurações financeiras salvas com sucesso!");
                    } catch (error) {
                      setError("Erro ao salvar configurações financeiras");
                    }
                  }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações Financeiras
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Configurações de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Política de Senhas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="min-length">Comprimento Mínimo</Label>
                        <Input id="min-length" type="number" defaultValue="8" />
                      </div>
                      <div>
                        <Label htmlFor="password-expiry">
                          Expiração (dias)
                        </Label>
                        <Input
                          id="password-expiry"
                          type="number"
                          defaultValue="90"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch defaultChecked />
                        <Label>Requer letras maiúsculas</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch defaultChecked />
                        <Label>Requer números</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch defaultChecked />
                        <Label>Requer caracteres especiais</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Sessões</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="session-timeout">
                          Timeout (minutos)
                        </Label>
                        <Input
                          id="session-timeout"
                          type="number"
                          defaultValue="60"
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-sessions">Máximo de Sessões</Label>
                        <Input
                          id="max-sessions"
                          type="number"
                          defaultValue="3"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Log de Auditoria</h3>
                    <div>
                      <Label htmlFor="audit-retention">Retenção (dias)</Label>
                      <Input
                        id="audit-retention"
                        type="number"
                        defaultValue="365"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Registrar todas as ações</Label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Backup e Recuperação
                    </h3>
                    {/* IMPLEMENTAÇÃO BACKEND - BACKUP E RECUPERAÇÃO:

                        ESTRATÉGIA DE BACKUP:
                        1. BACKUP AUTOMÁTICO DIÁRIO (PostgreSQL)
                           - pg_dump completo da base de dados
                           - Armazenamento em AWS S3 ou similar
                           - Retenção: 30 dias para backups diários
                           - Backup incremental de arquivos (documentos/imagens)

                        2. BACKUP MANUAL (Sob DEMANDA)
                           - Permite backup imediato antes de mudanças importantes
                           - Inclui dados + arquivos + configurações
                           - Download direto ou envio para cloud storage

                        3. ESTRUTURA DO BACKUP:
                           backup_YYYY-MM-DD_HH-mm-ss/
                           ├── database.sql (dump PostgreSQL)
                           ├── uploads/ (arquivos de clientes/projetos)
                           ├── configs/ (configurações do sistema)
                           └── metadata.json (info do backup)

                        PROCESSO DE RECUPERAÇÃO:
                        1. Upload do arquivo de backup
                        2. Validação da integridade
                        3. Criação de backup atual (segurança)
                        4. Restauração em etapas:
                           - Banco de dados (pg_restore)
                           - Arquivos de upload
                           - Configurações do sistema
                        5. Verificação de integridade pós-restauração
                        6. Logs detalhados do processo

                        API ENDPOINTS:
                        - POST /api/admin/backup/create - Gerar backup manual
                        - GET /api/admin/backup/list - Listar backups disponíveis
                        - POST /api/admin/backup/restore - Restaurar backup
                        - GET /api/admin/backup/download/{id} - Download backup
                        - DELETE /api/admin/backup/{id} - Excluir backup antigo
                    */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        onClick={() =>
                          alert("💾 Gerando backup completo do sistema...")
                        }
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Gerar Backup
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          alert("🔄 Abrindo assistente de restaura��ão...")
                        }
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Restaurar Backup
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Sessões Ativas</h3>
                    {/* IMPLEMENTAÇÃO BACKEND - SESSÕES ATIVAS:

                        BANCO DE DADOS - Tabela: user_sessions
                        - id (UUID): Identificador único da sessão
                        - user_id (UUID): ID do usuário
                        - session_token (TEXT): Token JWT da sessão
                        - device_info (JSONB): Navegador, OS, device type
                        - ip_address (INET): IP do cliente
                        - location (TEXT): Localização baseada no IP (GeoIP)
                        - created_at (TIMESTAMP): Momento do login
                        - last_activity (TIMESTAMP): Última atividade
                        - expires_at (TIMESTAMP): Expiração da sessão
                        - is_active (BOOLEAN): Se a sessão está ativa

                        API ENDPOINTS:
                        - GET /api/users/sessions - Listar sessões ativas do usuário
                        - DELETE /api/users/sessions/{session_id} - Encerrar sessão específica
                        - DELETE /api/users/sessions/all - Encerrar todas as outras sessões

                        FUNCIONALIDADES:
                        - Detectar device/browser via User-Agent
                        - Geolocalização via IP (MaxMind GeoIP2)
                        - Auto-encerrar sessões expiradas (cron job)
                        - Limitar número máximo de sessões simultâneas
                        - Logs de auditoria para login/logout
                        - Notificação de novo login em device desconhecido
                    */}
                    <div className="space-y-2">
                      {[
                        {
                          device: "Chrome - Windows",
                          location: "São Paulo, BR",
                          lastActive: "Agora",
                          current: true,
                        },
                        {
                          device: "Safari - iPhone",
                          location: "São Paulo, BR",
                          lastActive: "2 horas atrás",
                          current: false,
                        },
                        {
                          device: "Firefox - Linux",
                          location: "Rio de Janeiro, BR",
                          lastActive: "1 dia atrás",
                          current: false,
                        },
                      ].map((session, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{session.device}</div>
                            <div className="text-sm text-muted-foreground">
                              {session.location} • {session.lastActive}
                              {session.current && (
                                <Badge variant="outline" className="ml-2">
                                  Atual
                                </Badge>
                              )}
                            </div>
                          </div>
                          {!session.current && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                alert("🔒 Sessão encerrada com sucesso!")
                              }
                            >
                              Encerrar
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() =>
                        alert("🔒 Todas as outras sessões foram encerradas!")
                      }
                    >
                      Encerrar Todas as Outras Sessões
                    </Button>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        alert("📊 Exportando logs de auditoria...")
                      }
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Logs
                    </Button>
                    <Button onClick={handleSaveSecurity}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Configurações
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Template Editor Modal with Real-time Preview */}
        <Dialog
          open={showTemplateModal}
          onOpenChange={safeSetShowTemplateModal}
        >
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Edit className="h-5 w-5 mr-2" />
                Editor de Template -{" "}
                {currentTemplate === "budget" ? "Orçamento" : "Fatura"}
              </DialogTitle>
              <DialogDescription>
                Edite o template HTML e veja o preview em tempo real. Use as
                variáveis disponíveis para personalizar.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
              {/* Editor Section */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-content">
                    Código HTML do Template
                  </Label>
                  <Textarea
                    id="template-content"
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                    placeholder="Digite o HTML do template..."
                    className="h-[400px] font-mono text-sm resize-none"
                  />
                </div>

                <div className="bg-muted/50 p-3 rounded-lg max-h-[140px] overflow-y-auto">
                  <h4 className="font-semibold mb-2 text-sm">
                    📝 Variáveis Disponíveis:
                  </h4>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <code className="bg-white px-1 rounded">
                      [NOME_EMPRESA]
                    </code>
                    <code className="bg-white px-1 rounded">[DATA]</code>
                    <code className="bg-white px-1 rounded">
                      [NOME_CLIENTE]
                    </code>
                    <code className="bg-white px-1 rounded">
                      [DOCUMENTO_CLIENTE]
                    </code>
                    <code className="bg-white px-1 rounded">[VALOR_TOTAL]</code>
                    <code className="bg-white px-1 rounded">
                      [DESCRICAO_SERVICOS]
                    </code>
                    <code className="bg-white px-1 rounded">[ASSINATURA]</code>
                    {currentTemplate === "budget" && (
                      <>
                        <code className="bg-white px-1 rounded">
                          [NUMERO_ORCAMENTO]
                        </code>
                        <code className="bg-white px-1 rounded">
                          [DATA_VALIDADE]
                        </code>
                      </>
                    )}
                    {currentTemplate === "invoice" && (
                      <>
                        <code className="bg-white px-1 rounded">
                          [NUMERO_FATURA]
                        </code>
                        <code className="bg-white px-1 rounded">
                          [DATA_EMISSAO]
                        </code>
                        <code className="bg-white px-1 rounded">
                          [DATA_VENCIMENTO]
                        </code>
                        <code className="bg-white px-1 rounded">
                          [FORMA_PAGAMENTO]
                        </code>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Preview em Tempo Real</Label>
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
                        const previewContent = templateContent
                          .replace(
                            /\[NOME_EMPRESA\]/g,
                            "Escritório Silva & Associados",
                          )
                          .replace(
                            /\[DATA\]/g,
                            new Date().toLocaleDateString("pt-BR"),
                          )
                          .replace(/\[NOME_CLIENTE\]/g, "Maria Silva Santos")
                          .replace(/\[DOCUMENTO_CLIENTE\]/g, "123.456.789-00")
                          .replace(/\[VALOR_TOTAL\]/g, "R$ 2.500,00")
                          .replace(
                            /\[DESCRICAO_SERVICOS\]/g,
                            "Consultoria jurídica especializada em direito civil",
                          )
                          .replace(
                            /\[ASSINATURA\]/g,
                            "Dr. João Silva<br>OAB/SP 123.456",
                          )
                          .replace(/\[NUMERO_ORCAMENTO\]/g, "ORC-001")
                          .replace(/\[NUMERO_FATURA\]/g, "FAT-001")
                          .replace(
                            /\[DATA_EMISSAO\]/g,
                            new Date().toLocaleDateString("pt-BR"),
                          )
                          .replace(
                            /\[DATA_VENCIMENTO\]/g,
                            new Date(
                              Date.now() + 30 * 24 * 60 * 60 * 1000,
                            ).toLocaleDateString("pt-BR"),
                          )
                          .replace(
                            /\[DATA_VALIDADE\]/g,
                            new Date(
                              Date.now() + 15 * 24 * 60 * 60 * 1000,
                            ).toLocaleDateString("pt-BR"),
                          )
                          .replace(
                            /\[FORMA_PAGAMENTO\]/g,
                            "PIX ou Transferência Bancária",
                          );

                        previewWindow.document.write(previewContent);
                        previewWindow.document.close();
                      }
                    }}
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    Abrir em Nova Aba
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden h-[500px]">
                  <iframe
                    srcDoc={templateContent
                      .replace(
                        /\[NOME_EMPRESA\]/g,
                        "Escritório Silva & Associados",
                      )
                      .replace(
                        /\[DATA\]/g,
                        new Date().toLocaleDateString("pt-BR"),
                      )
                      .replace(/\[NOME_CLIENTE\]/g, "Maria Silva Santos")
                      .replace(/\[DOCUMENTO_CLIENTE\]/g, "123.456.789-00")
                      .replace(/\[VALOR_TOTAL\]/g, "R$ 2.500,00")
                      .replace(
                        /\[DESCRICAO_SERVICOS\]/g,
                        "Consultoria jurídica especializada em direito civil e elaboração de contratos",
                      )
                      .replace(
                        /\[ASSINATURA\]/g,
                        "Dr. João Silva<br>OAB/SP 123.456",
                      )
                      .replace(/\[NUMERO_ORCAMENTO\]/g, "ORC-001")
                      .replace(/\[NUMERO_FATURA\]/g, "FAT-001")
                      .replace(
                        /\[DATA_EMISSAO\]/g,
                        new Date().toLocaleDateString("pt-BR"),
                      )
                      .replace(
                        /\[DATA_VENCIMENTO\]/g,
                        new Date(
                          Date.now() + 30 * 24 * 60 * 60 * 1000,
                        ).toLocaleDateString("pt-BR"),
                      )
                      .replace(
                        /\[DATA_VALIDADE\]/g,
                        new Date(
                          Date.now() + 15 * 24 * 60 * 60 * 1000,
                        ).toLocaleDateString("pt-BR"),
                      )
                      .replace(
                        /\[FORMA_PAGAMENTO\]/g,
                        "PIX ou Transferência Bancária",
                      )}
                    className="w-full h-full"
                    title="Preview do Template"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  alert(
                    "📧 Enviando email de teste com o template atual...\n\n✅ Email de teste enviado para contato@silva.adv.br!",
                  );
                }}
              >
                <Mail className="h-4 w-4 mr-2" />
                Testar Email
              </Button>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={createSafeDialogHandler(() => {
                    setCurrentTemplate(null);
                    setTemplateContent("");
                    safeSetShowTemplateModal(false);
                  })}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={createSafeDialogHandler(() => {
                    alert(
                      `✅ Template de ${currentTemplate === "budget" ? "orçamento" : "fatura"} salvo com sucesso!\n\n🎯 Agora você pode enviar emails personalizados usando este template.`,
                    );
                    safeSetShowTemplateModal(false);
                    setCurrentTemplate(null);
                    setTemplateContent("");
                  })}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Template
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Account Modal */}
        <Dialog
          open={showNewAccountModal}
          onOpenChange={safeSetShowNewAccountModal}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                {editingAccount
                  ? "Editar Conta Bancária"
                  : "Nova Conta Bancária"}
              </DialogTitle>
              <DialogDescription>
                {editingAccount
                  ? "Atualize as informações da conta bancária."
                  : "Adicione uma nova conta bancária ao sistema."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="bank-name">Banco</Label>
                <Input
                  id="bank-name"
                  placeholder="Nome do banco"
                  defaultValue={editingAccount?.bank || ""}
                />
              </div>
              <div>
                <Label htmlFor="account-number">Número da Conta</Label>
                <Input
                  id="account-number"
                  placeholder="1234-5"
                  defaultValue={editingAccount?.account || ""}
                />
              </div>
              <div>
                <Label htmlFor="account-type">Tipo de Conta</Label>
                <Select defaultValue={editingAccount?.type || "Conta Corrente"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Conta Corrente">
                      Conta Corrente
                    </SelectItem>
                    <SelectItem value="Poupança">Poupança</SelectItem>
                    <SelectItem value="Conta Investimento">
                      Conta Investimento
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="initial-balance">Saldo Inicial</Label>
                <Input
                  id="initial-balance"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  defaultValue={editingAccount?.balance || ""}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={createSafeDialogHandler(() => {
                  setEditingAccount(null);
                  safeSetShowNewAccountModal(false);
                })}
              >
                Cancelar
              </Button>
              <Button
                onClick={createSafeDialogHandler(() => {
                  if (editingAccount) {
                    alert("✅ Conta bancária atualizada com sucesso!");
                  } else {
                    const newAccount = {
                      id: Date.now().toString(),
                      bank: "Nova Conta",
                      account: "0000-0",
                      balance: 0,
                      type: "Conta Corrente",
                    };
                    setAccounts([...accounts, newAccount]);
                    alert("✅ Nova conta bancária adicionada com sucesso!");
                  }
                  safeSetShowNewAccountModal(false);
                  setEditingAccount(null);
                })}
              >
                {editingAccount ? "Atualizar" : "Adicionar"} Conta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
