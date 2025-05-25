
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { BarChart, LineChart, DonutChart } from "@/components/ui/charts";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Компонент для отображения статистики на дашборде
 */
const DashboardStats = () => {
  // В реальном приложении данные должны загружаться с сервера
  // Здесь мы имитируем запрос через React Query и возвращаем тестовые данные

  const { data: ticketStats, isLoading: ticketsLoading } = useQuery({
    queryKey: ['ticketStats'],
    queryFn: async () => {
      // В реальном приложении здесь был бы запрос к API
      return {
        open: 12,
        inProgress: 8,
        waitingCustomer: 5,
        resolved: 32,
        closed: 143
      };
    },
    staleTime: 1000 * 60 * 5, // 5 минут
  });

  const { data: dealStats, isLoading: dealsLoading } = useQuery({
    queryKey: ['dealStats'],
    queryFn: async () => {
      // В реальном приложении здесь был бы запрос к API
      return {
        lead: 18,
        qualified: 12,
        proposal: 6,
        negotiation: 4,
        closedWon: 8,
        closedLost: 14
      };
    },
    staleTime: 1000 * 60 * 5, // 5 минут
  });
  
  const { data: channelStats, isLoading: channelsLoading } = useQuery({
    queryKey: ['channelStats'],
    queryFn: async () => {
      // В реальном приложении здесь был бы запрос к API
      return [
        { name: "Email", value: 43 },
        { name: "Telegram", value: 27 },
        { name: "WhatsApp", value: 18 },
        { name: "Web", value: 35 },
        { name: "Phone", value: 22 },
        { name: "VK", value: 12 }
      ];
    },
    staleTime: 1000 * 60 * 5, // 5 минут
  });

  const { data: timelineData, isLoading: timelineLoading } = useQuery({
    queryKey: ['timelineData'],
    queryFn: async () => {
      // В реальном приложении здесь был бы запрос к API
      return [
        { name: "Пн", tickets: 12, deals: 5 },
        { name: "Вт", tickets: 19, deals: 3 },
        { name: "Ср", tickets: 14, deals: 8 },
        { name: "Чт", tickets: 22, deals: 4 },
        { name: "Пт", tickets: 25, deals: 6 },
        { name: "Сб", tickets: 8, deals: 2 },
        { name: "Вс", tickets: 6, deals: 1 }
      ];
    },
    staleTime: 1000 * 60 * 5, // 5 минут
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Статистика тикетов */}
      <Card>
        <CardHeader>
          <CardTitle>Тикеты</CardTitle>
          <CardDescription>Статистика обращений</CardDescription>
        </CardHeader>
        <CardContent>
          {ticketsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-[150px] w-full" />
            </div>
          ) : (
            ticketStats && (
              <BarChart 
                data={[
                  { name: "Открытые", value: ticketStats.open },
                  { name: "В работе", value: ticketStats.inProgress },
                  { name: "Ожидают", value: ticketStats.waitingCustomer },
                  { name: "Решены", value: ticketStats.resolved },
                  { name: "Закрыты", value: ticketStats.closed }
                ]}
                index="name"
                categories={["value"]}
                colors={["violet"]}
                valueFormatter={(value) => `${value}`}
                className="h-[200px]"
              />
            )
          )}
        </CardContent>
      </Card>

      {/* Статистика сделок */}
      <Card>
        <CardHeader>
          <CardTitle>Сделки</CardTitle>
          <CardDescription>Воронка продаж</CardDescription>
        </CardHeader>
        <CardContent>
          {dealsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-[150px] w-full" />
            </div>
          ) : (
            dealStats && (
              <BarChart 
                data={[
                  { name: "Лиды", value: dealStats.lead },
                  { name: "Квалиф.", value: dealStats.qualified },
                  { name: "Предлож.", value: dealStats.proposal },
                  { name: "Перегов.", value: dealStats.negotiation },
                  { name: "Выиграно", value: dealStats.closedWon },
                  { name: "Проиграно", value: dealStats.closedLost }
                ]}
                index="name"
                categories={["value"]}
                colors={["blue"]}
                valueFormatter={(value) => `${value}`}
                className="h-[200px]"
              />
            )
          )}
        </CardContent>
      </Card>

      {/* Каналы обращений */}
      <Card>
        <CardHeader>
          <CardTitle>Каналы</CardTitle>
          <CardDescription>Источники обращений</CardDescription>
        </CardHeader>
        <CardContent>
          {channelsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-[150px] w-full" />
            </div>
          ) : (
            <DonutChart 
              data={channelStats || []}
              index="name"
              category="value"
              valueFormatter={(value) => `${value}`}
              className="h-[200px]"
            />
          )}
        </CardContent>
      </Card>

      {/* График за неделю */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Активность за неделю</CardTitle>
          <CardDescription>Количество новых тикетов и сделок</CardDescription>
        </CardHeader>
        <CardContent>
          {timelineLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-[200px] w-full" />
            </div>
          ) : (
            <LineChart 
              data={timelineData || []}
              index="name"
              categories={["tickets", "deals"]}
              colors={["violet", "blue"]}
              valueFormatter={(value) => `${value}`}
              yAxisWidth={40}
              className="h-[300px]"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
