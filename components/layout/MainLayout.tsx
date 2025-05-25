
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  TicketCheck, 
  Users, 
  BadgeDollarSign, 
  BarChart3, 
  Settings, 
  BookOpen,
  Menu,
  Bell,
  User,
  Search,
  MessageSquare
} from "lucide-react";
import { 
  SidebarProvider,
  Sidebar, 
  SidebarTrigger,
  SidebarContent, 
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

/**
 * Интерфейс для пунктов главного меню
 */
interface MainMenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
  badge?: number | string;
}

/**
 * Компонент основного макета приложения
 * 
 * @param {React.ReactNode} children - Дочерние компоненты
 * @returns {JSX.Element} Компонент главного макета
 */
const MainLayout = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Определяем основные пункты меню
  const mainMenuItems: MainMenuItem[] = [
    {
      title: "Панель управления",
      path: "/dashboard",
      icon: LayoutDashboard
    },
    {
      title: "Тикеты",
      path: "/tickets",
      icon: TicketCheck,
      badge: 12
    },
    {
      title: "CRM",
      path: "/crm",
      icon: Users
    },
    {
      title: "Сделки",
      path: "/deals",
      icon: BadgeDollarSign,
      badge: "Новое"
    },
    {
      title: "Отчеты",
      path: "/reports",
      icon: BarChart3
    },
    {
      title: "База знаний",
      path: "/knowledge-base",
      icon: BookOpen
    },
    {
      title: "Настройки",
      path: "/settings",
      icon: Settings
    }
  ];

  /**
   * Определяет активный ли данный пункт меню
   * 
   * @param {string} path - Путь пункта меню
   * @returns {boolean} Флаг активности пункта меню
   */
  const isActive = (path: string): boolean => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Сайдбар */}
        <Sidebar className="border-r shadow-sm">
          <SidebarHeader className="flex h-14 items-center border-b px-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 px-2 font-semibold"
              onClick={() => navigate("/")}
            >
              <span className="text-gradient font-bold">CRM & Тикеты</span>
            </Button>
          </SidebarHeader>
          
          <SidebarContent>
            <div className="px-3 py-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск..."
                  className="pl-8 bg-muted/40 border-muted focus-visible:ring-primary"
                />
              </div>
            </div>
            
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    isActive={isActive(item.path)}
                    onClick={() => navigate(item.path)}
                    tooltip={item.title}
                    className="hover-lift"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <div className="ml-auto">
                        <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                          {item.badge}
                        </span>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            
            <SidebarSeparator />
            
            <div className="px-3 py-2">
              <h3 className="mb-2 px-2 text-xs font-medium text-muted-foreground">Проекты</h3>
              <div className="space-y-1">
                {[
                  { name: "Разработка CRM", color: "bg-blue-500" },
                  { name: "Веб-сайт", color: "bg-green-500" },
                  { name: "Мобильное приложение", color: "bg-amber-500" }
                ].map((project, i) => (
                  <button
                    key={i}
                    className="w-full rounded-md px-2 py-1.5 text-sm flex items-center hover:bg-muted/50 transition-colors hover-lift"
                  >
                    <div className={`mr-2 h-2 w-2 rounded-full ${project.color}`}></div>
                    {project.name}
                  </button>
                ))}
              </div>
            </div>
          </SidebarContent>
          
          <SidebarFooter className="border-t p-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback className="bg-primary/10 text-primary">АИ</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">Алексей Иванов</p>
                  <p className="text-xs text-muted-foreground">Администратор</p>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/50">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-effect">
                  <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate("/profile")} className="hover-lift">
                      Профиль
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")} className="hover-lift">
                      Настройки
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="hover-lift">
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        {/* Основное содержимое */}
        <SidebarInset className="bg-gradient-subtle">
          {/* Верхняя панель */}
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 sm:px-6 shadow-sm">
            <SidebarTrigger />
            
            <div className="flex-1" />
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-muted/50">
                <MessageSquare className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary/80 text-[10px] text-primary-foreground animate-pulse-glow">
                  3
                </span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-muted/50">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      5
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 glass-effect">
                  <DropdownMenuLabel>Уведомления</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-96 overflow-auto">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <DropdownMenuItem key={i} className="cursor-pointer p-4 hover-lift">
                        <div className="flex flex-col gap-1">
                          <p className="font-medium">Новый тикет #{1000 + i}</p>
                          <p className="text-sm text-muted-foreground">
                            Поступил новый тикет от клиента
                          </p>
                          <p className="text-xs text-muted-foreground">
                            5 минут назад
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer justify-center hover-lift">
                    Показать все уведомления
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/50">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                      <AvatarImage src="/placeholder.svg" alt="User" />
                      <AvatarFallback className="bg-primary/10 text-primary">АИ</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-effect">
                  <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate("/profile")} className="hover-lift">
                      Профиль
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")} className="hover-lift">
                      Настройки
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="hover-lift">
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          
          {/* Основной контент */}
          <div className="flex-1 animate-fade-in">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
