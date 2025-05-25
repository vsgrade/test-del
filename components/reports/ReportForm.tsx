
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReportFormProps {
  onReportCreated?: () => void;
  onCancel?: () => void;
}

const ReportForm = ({ onReportCreated, onCancel }: ReportFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    config: "{}",
    is_public: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Не авторизован");

      let config = {};
      try {
        config = JSON.parse(formData.config);
      } catch {
        config = {};
      }

      const reportData = {
        name: formData.name,
        type: formData.type,
        config,
        is_public: formData.is_public,
        created_by: user.id,
      };

      const { error } = await supabase
        .from('reports')
        .insert([reportData]);

      if (error) throw error;

      toast({
        title: "Отчет создан",
        description: "Новый отчет успешно создан",
      });

      setFormData({
        name: "",
        type: "",
        config: "{}",
        is_public: false,
      });

      onReportCreated?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось создать отчет",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getConfigTemplate = (type: string) => {
    switch (type) {
      case 'tickets_stats':
        return JSON.stringify({
          date_range: "last_30_days",
          group_by: "status",
          metrics: ["count", "avg_resolution_time"]
        }, null, 2);
      case 'agent_performance':
        return JSON.stringify({
          date_range: "last_month",
          metrics: ["tickets_resolved", "avg_response_time", "customer_satisfaction"]
        }, null, 2);
      case 'client_analytics':
        return JSON.stringify({
          date_range: "last_quarter",
          metrics: ["total_tickets", "avg_resolution_time", "satisfaction_score"]
        }, null, 2);
      case 'sales_funnel':
        return JSON.stringify({
          date_range: "last_month",
          stages: ["lead", "qualified", "proposal", "closed"]
        }, null, 2);
      default:
        return "{}";
    }
  };

  const handleTypeChange = (type: string) => {
    setFormData({
      ...formData,
      type,
      config: getConfigTemplate(type)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Название отчета</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Статистика тикетов за месяц"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Тип отчета</Label>
        <Select value={formData.type} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите тип отчета" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tickets_stats">Статистика тикетов</SelectItem>
            <SelectItem value="agent_performance">Производительность агентов</SelectItem>
            <SelectItem value="client_analytics">Аналитика клиентов</SelectItem>
            <SelectItem value="sales_funnel">Воронка продаж</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="config">Конфигурация отчета (JSON)</Label>
        <Textarea
          id="config"
          value={formData.config}
          onChange={(e) => setFormData({ ...formData, config: e.target.value })}
          placeholder='{"date_range": "last_30_days"}'
          rows={6}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Настройки отчета в формате JSON (период, метрики, фильтры)
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_public"
          checked={formData.is_public}
          onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
        />
        <Label htmlFor="is_public">Публичный отчет (доступен всем пользователям)</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Создание..." : "Создать отчет"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        )}
      </div>
    </form>
  );
};

export default ReportForm;
