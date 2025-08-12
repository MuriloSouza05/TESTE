/**
 * LAYOUT PRINCIPAL DO SISTEMA - DashboardLayout
 * =============================================
 *
 * Componente de layout que envolve todas as páginas do sistema.
 * Responsável por:
 *
 * ESTRUTURA:
 * - Sidebar de navegação com todos os módulos
 * - Header com busca, notificações e perfil
 * - Área de conteúdo principal
 * - Sistema de breadcrumbs
 *
 * FUNCIONALIDADES:
 * - Navegação responsiva
 * - Sidebar colapsável
 * - Notificações em tempo real
 * - Perfil do usuário
 * - Busca global
 * - Estado de autenticação
 *
 * COMPONENTES FILHOS:
 * - NotificationsPanel: Painel de notificações
 * - UserProfileDialog: Modal de perfil
 *
 * Este layout garante consistência visual em todo o sistema.
 */

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  FileText,
  TrendingUp,
  Settings,
  Search,
  Menu,
  Bell,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserProfileDialog } from "./UserProfileDialog";
import { NotificationsPanel } from "./NotificationsPanel";
import { useDialogBodyFix } from "@/hooks/use-dialog-body-fix";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "CRM", href: "/crm", icon: Users },
  { name: "Projetos", href: "/projetos", icon: FolderKanban },
  { name: "Tarefas", href: "/tarefas", icon: CheckSquare },
  { name: "Cobrança", href: "/cobranca", icon: FileText },
  { name: "Fluxo de Caixa", href: "/fluxo-caixa", icon: TrendingUp },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Apply global dialog body freeze fix
  useDialogBodyFix();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to search results - you could create a dedicated search page
      console.log("Searching for:", searchTerm);
      // For now, we'll navigate to the most relevant module based on search term
      if (searchTerm.toLowerCase().includes("cliente")) {
        navigate("/crm");
      } else if (searchTerm.toLowerCase().includes("projeto")) {
        navigate("/projetos");
      } else if (
        searchTerm.toLowerCase().includes("fatura") ||
        searchTerm.toLowerCase().includes("cobrança")
      ) {
        navigate("/cobranca");
      } else {
        // General search - could navigate to a search results page
        navigate("/");
      }
    }
  };

  const handleLogout = () => {
    // Add logout logic here
    console.log("User logged out");
    // For demo purposes, just show an alert
    alert("Logout realizado com sucesso!");
    // In a real app, you would clear auth tokens and redirect to login
  };

  const handleViewProfile = () => {
    setShowProfileDialog(true);
  };

  const handleSettings = () => {
    navigate("/configuracoes");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "sidebar-nav transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64",
        )}
      >
        {/* Logo/Brand */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <Scale className="h-8 w-8 text-sidebar-primary" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-sidebar-foreground">
                  {/* IMPLEMENTAÇÃO FUTURA: Nome dinâmico da empresa
                      Este "LegalSaaS" será substituído pelo nome real da empresa
                      configurado em Settings > Empresa quando o backend estiver implementado.
                      O valor virá de uma API que retorna o nome da empresa baseado no
                      usuário logado. Exemplo: companySettings.name || "LegalSaaS" */}
                  LegalSaaS
                </span>
                <span className="text-xs text-sidebar-foreground/70">
                  Sistema Advocacia
                </span>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <Scale className="h-8 w-8 text-sidebar-primary mx-auto" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  sidebarCollapsed && "justify-center",
                )}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Recolher
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar clientes, projetos, faturas..."
                    className="pl-10 bg-background"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </form>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <NotificationsPanel />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" alt="Usuário" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">Dr. Advogado</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        advogado@escritorio.com.br
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleViewProfile}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSettings}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-muted/30">{children}</main>
      </div>

      {/* Profile Dialog */}
      <UserProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
      />
    </div>
  );
}
