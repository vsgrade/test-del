
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import DatabaseSettings from "@/components/settings/DatabaseSettings";
import KanbanBoard from "@/components/tickets/KanbanBoard";
import ChatComponent from "@/components/chat/ChatComponent";
import CalendarComponent from "@/components/calendar/CalendarComponent";
import IntegrationsManager from "@/components/integrations/IntegrationsManager";
import ReportsManager from "@/components/reports/ReportsManager";

/**
 * Страница настроек системы
 */
const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");
  
  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Настройки</h1>
          <p className="text-muted-foreground">
            Управление настройками системы
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-8 w-full max-w-6xl">
            <TabsTrigger value="general">Общие</TabsTrigger>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="database">База данных</TabsTrigger>
            <TabsTrigger value="integrations">Интеграции</TabsTrigger>
            <TabsTrigger value="calendar">Календарь</TabsTrigger>
            <TabsTrigger value="reports">Отчеты</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="chat">Чат</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Общие настройки</h2>
              <p>Здесь будут общие настройки системы</p>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Управление пользователями</h2>
              <p>Здесь будет управление пользователями системы</p>
            </Card>
          </TabsContent>
          
          <TabsContent value="database">
            <Card className="p-6">
              <DatabaseSettings />
            </Card>
          </TabsContent>
          
          <TabsContent value="integrations">
            <IntegrationsManager />
          </TabsContent>
          
          <TabsContent value="calendar">
            <CalendarComponent />
          </TabsContent>
          
          <TabsContent value="reports">
            <ReportsManager />
          </TabsContent>
          
          <TabsContent value="kanban">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Kanban доска тикетов</h2>
              <div className="mt-4">
                <KanbanBoard />
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="chat">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Внутренний чат команды</h2>
              <div className="mt-4">
                <ChatComponent />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
