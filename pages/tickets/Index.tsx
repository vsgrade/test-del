
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/layout/MainLayout";
import TicketTable from "@/components/tickets/TicketTable";
import KanbanBoard from "@/components/tickets/KanbanBoard";

/**
 * Страница управления тикетами
 */
const TicketsPage = () => {
  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Тикеты</h1>
            <p className="text-muted-foreground">
              Управление обращениями клиентов
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="table" className="space-y-4">
          <TabsList>
            <TabsTrigger value="table">Таблица</TabsTrigger>
            <TabsTrigger value="kanban">Канбан</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table">
            <TicketTable />
          </TabsContent>
          
          <TabsContent value="kanban">
            <KanbanBoard />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default TicketsPage;
