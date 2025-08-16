import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { 
  LayoutDashboard, Users, DollarSign, Trophy, MessageSquare, 
  Settings, HelpCircle, Bot, Gamepad2, BarChart3, Database,
  Gift, Calendar, Shield, FileText, Zap, Star, Crown,
  ChevronDown, ChevronRight, LogOut, Building2, Activity, CheckCircle
} from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/shared/ui/collapsible";

interface NavItem {
  title: string;
  href?: string;
  icon: any;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Gestão de Usuários",
    icon: Users,
    children: [
      { title: "Todos os Usuários", href: "/admin/users", icon: Users },
      { title: "Usuários Premium", href: "/admin/users/premium", icon: Crown },
      { title: "Moderação", href: "/admin/users/moderation", icon: Shield },
    ]
  },
  {
    title: "Sistema Financeiro",
    icon: DollarSign,
    children: [
      { title: "Receitas", href: "/admin/finance/revenue", icon: DollarSign },
      { title: "Gestão de Beetz", href: "/admin/finance/beetz", icon: Zap },
      { title: "Assinaturas", href: "/admin/finance/subscriptions", icon: Star },
      { title: "Relatórios", href: "/admin/finance/reports", icon: FileText },
    ]
  },
  {
    title: "Conteúdo & Quiz",
    icon: HelpCircle,
    children: [
      { title: "Banco de Questões", href: "/admin/quiz/questions", icon: Database },
      { title: "Aprovar Questões", href: "/admin/quiz/questions?tab=approval", icon: CheckCircle },
      { title: "Categorias", href: "/admin/quiz/categories", icon: HelpCircle },
      { title: "Lições Diárias", href: "/admin/daily-lessons", icon: Calendar },
      { title: "Analytics Quiz", href: "/admin/quiz/analytics", icon: BarChart3 },
    ]
  },
  {
    title: "Gamificação",
    icon: Trophy,
    children: [
      { title: "Badges & Conquistas", href: "/admin/gamification/badges", icon: Trophy },
      { title: "Loot Boxes", href: "/admin/gamification/lootboxes", icon: Gift },
      { title: "Missões Diárias", href: "/admin/gamification/missions", icon: Calendar },
      { title: "Eventos Especiais", href: "/admin/gamification/events", icon: Star },
    ]
  },
  {
    title: "Torneios & Competições",
    icon: Gamepad2,
    children: [
      { title: "Gerenciar Torneios", href: "/admin/tournaments", icon: Gamepad2 },
      { title: "Criar Torneio", href: "/admin/tournaments/create", icon: Gamepad2 },
      { title: "Analytics", href: "/admin/tournaments/analytics", icon: BarChart3 },
    ]
  },
  {
    title: "Sistema de Bots",
    href: "/admin/bots",
    icon: Bot,
  },
  {
    title: "Painel de Patrocinadores",
    href: "/admin/sponsors",
    icon: Building2,
  },
  {
    title: "Gestão de Distritos",
    icon: Building2,
    children: [
      { title: "Poderes dos Distritos", href: "/admin/districts/powers", icon: Zap },
      { title: "Logs de Poder", href: "/admin/districts/power-logs", icon: FileText },
    ]
  },
  {
    title: "Social & Comunicação",
    icon: MessageSquare,
    children: [
      { title: "Posts & Comentários", href: "/admin/social/posts", icon: MessageSquare },
      { title: "Notificações", href: "/admin/social/notifications", icon: MessageSquare },
      { title: "Chat Monitoring", href: "/admin/social/chat", icon: MessageSquare },
    ]
  },
  {
    title: "Analytics Avançados",
    icon: BarChart3,
    children: [
      { title: "Real-Time Analytics", href: "/admin/analytics/realtime", icon: Activity },
      { title: "Funil de Conversão", href: "/admin/analytics/funnel", icon: BarChart3 },
      { title: "Retenção", href: "/admin/analytics/retention", icon: BarChart3 },
      { title: "Cohort Analysis", href: "/admin/analytics/cohort", icon: BarChart3 },
      { title: "A/B Testing", href: "/admin/analytics/ab-testing", icon: BarChart3 },
    ]
  },
  {
    title: "Hub de Testes",
    href: "/testing-hub",
    icon: Settings,
  },
  {
    title: "Configurações",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const [openSections, setOpenSections] = useState<string[]>(['Dashboard']);

  const toggleSection = (title: string) => {
    setOpenSections(prev => 
      prev.includes(title) 
        ? prev.filter(s => s !== title)
        : [...prev, title]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const renderNavItem = (item: NavItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openSections.includes(item.title);

    if (hasChildren) {
      return (
        <Collapsible key={item.title} open={isOpen} onOpenChange={() => toggleSection(item.title)}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-between font-medium text-left",
                "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </div>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 pl-6">
            {item.children?.map(renderNavItem)}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Button
        key={item.title}
        variant={isActive(item.href) ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-3 font-medium",
          isActive(item.href) && "bg-accent text-accent-foreground"
        )}
        asChild
      >
        <Link to={item.href!}>
          <item.icon className="h-5 w-5" />
          <span>{item.title}</span>
        </Link>
      </Button>
    );
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
          Admin Panel
        </h2>
        <p className="text-sm text-muted-foreground">
          Satoshi Finance Game
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-auto">
        {navigation.map(renderNavItem)}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={() => {
            localStorage.removeItem("admin_access_granted");
            window.location.reload();
          }}
        >
          <LogOut className="h-5 w-5" />
          <span>Sair do Admin</span>
        </Button>
      </div>
    </div>
  );
}
