
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ReportViewerProps {
  report: {
    id: string;
    name: string;
    type: string;
    config: any;
    is_public: boolean;
    created_at: string;
  };
}

const ReportViewer = ({ report }: ReportViewerProps) => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Симуляция загрузки данных отчета
    const generateMockData = () => {
      switch (report.type) {
        case 'tickets_stats':
          return {
            summary: {
              total_tickets: 156,
              resolved_tickets: 142,
              avg_resolution_time: "2.3 дня",
              satisfaction_score: 4.2
            },
            chartData: [
              { name: 'Новые', value: 12, color: '#8884d8' },
              { name: 'Открытые', value: 8, color: '#82ca9d' },
              { name: 'В работе', value: 15, color: '#ffc658' },
              { name: 'Решенные', value: 142, color: '#ff7300' },
              { name: 'Закрытые', value: 120, color: '#0088fe' }
            ]
          };
        case 'agent_performance':
          return {
            summary: {
              total_agents: 8,
              avg_tickets_per_agent: 19.5,
              best_performer: "Анна Иванова",
              avg_response_time: "1.2 часа"
            },
            chartData: [
              { name: 'Анна И.', tickets: 32, time: 0.8 },
              { name: 'Петр С.', tickets: 28, time: 1.1 },
              { name: 'Мария К.', tickets: 25, time: 1.3 },
              { name: 'Иван Д.', tickets: 22, time: 1.5 },
              { name: 'Елена П.', tickets: 18, time: 1.8 }
            ]
          };
        default:
          return {
            summary: { message: "Данные отчета" },
            chartData: []
          };
      }
    };

    setTimeout(() => {
      setReportData(generateMockData());
      setLoading(false);
    }, 1000);
  }, [report]);

  if (loading) {
    return <div className="p-4">Загрузка данных отчета...</div>;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Информация об отчете</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Тип отчета:</p>
                <p className="text-sm text-muted-foreground">{report.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Создан:</p>
                <p className="text-sm text-muted-foreground">{new Date(report.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Доступ:</p>
                <Badge variant={report.is_public ? "default" : "secondary"}>
                  {report.is_public ? "Публичный" : "Приватный"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {reportData.summary && (
          <Card>
            <CardHeader>
              <CardTitle>Сводка</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(reportData.summary).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <p className="text-2xl font-bold">{String(value)}</p>
                    <p className="text-sm text-muted-foreground">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {reportData.chartData && reportData.chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Графики</CardTitle>
            </CardHeader>
            <CardContent>
              {report.type === 'tickets_stats' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reportData.chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tickets" fill="#8884d8" name="Тикеты" />
                    {reportData.chartData[0]?.time && (
                      <Bar dataKey="time" fill="#82ca9d" name="Время (час)" />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReportViewer;
