
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Plus, Eye, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ReportForm from "./ReportForm";
import ReportViewer from "./ReportViewer";

interface Report {
  id: string;
  name: string;
  type: string;
  config: any;
  is_public: boolean;
  created_by: string;
  created_at: string;
}

const ReportsManager = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось загрузить отчеты",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'tickets_stats': return 'Статистика тикетов';
      case 'agent_performance': return 'Производительность агентов';
      case 'client_analytics': return 'Аналитика клиентов';
      case 'sales_funnel': return 'Воронка продаж';
      default: return type;
    }
  };

  if (loading) {
    return <div className="p-4">Загрузка отчетов...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Отчеты и аналитика</h2>
          <p className="text-muted-foreground">Создание и просмотр аналитических отчетов</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Новый отчет
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Создать отчет</DialogTitle>
            </DialogHeader>
            <ReportForm
              onReportCreated={() => {
                setShowForm(false);
                fetchReports();
              }}
              onCancel={() => setShowForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Отчетов пока нет</p>
            <p className="text-sm text-muted-foreground">Создайте первый отчет для анализа данных</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      {report.name}
                    </CardTitle>
                    <CardDescription>
                      {getReportTypeLabel(report.type)} • Создан: {new Date(report.created_at).toLocaleString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={report.is_public ? "default" : "secondary"}>
                      {report.is_public ? "Публичный" : "Приватный"}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => setViewingReport(report)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!viewingReport} onOpenChange={() => setViewingReport(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Просмотр отчета: {viewingReport?.name}</DialogTitle>
          </DialogHeader>
          {viewingReport && <ReportViewer report={viewingReport} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsManager;
