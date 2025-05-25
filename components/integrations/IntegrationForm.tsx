
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface IntegrationFormProps {
  onIntegrationCreated?: () => void;
  onCancel?: () => void;
}

const IntegrationForm = ({ onIntegrationCreated, onCancel }: IntegrationFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    config: "{}",
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

      // Используем RPC функцию для создания интеграции
      const { error } = await supabase.rpc('create_integration', {
        integration_name: formData.name,
        integration_type: formData.type,
        integration_config: config,
        integration_user_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Интеграция создана",
        description: "Новая интеграция успешно добавлена",
      });

      setFormData({
        name: "",
        type: "",
        config: "{}",
      });

      onIntegrationCreated?.();
    } catch (error: any) {
      console.error('Error creating integration:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось создать интеграцию. Функция будет доступна после настройки базы данных.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getConfigTemplate = (type: string) => {
    switch (type) {
      case 'telegram':
        return JSON.stringify({
          bot_token: "YOUR_BOT_TOKEN",
          webhook_url: "https://your-domain.com/webhook/telegram"
        }, null, 2);
      case 'whatsapp':
        return JSON.stringify({
          phone_number_id: "YOUR_PHONE_NUMBER_ID",
          access_token: "YOUR_ACCESS_TOKEN",
          webhook_verify_token: "YOUR_VERIFY_TOKEN"
        }, null, 2);
      case 'email':
        return JSON.stringify({
          smtp_host: "smtp.gmail.com",
          smtp_port: 587,
          smtp_user: "your-email@gmail.com",
          smtp_password: "your-app-password"
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
        <Label htmlFor="name">Название интеграции</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Telegram Bot"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Тип интеграции</Label>
        <Select value={formData.type} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите тип" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="telegram">Telegram</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="api">API</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="config">Конфигурация (JSON)</Label>
        <Textarea
          id="config"
          value={formData.config}
          onChange={(e) => setFormData({ ...formData, config: e.target.value })}
          placeholder='{"key": "value"}'
          rows={8}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Введите настройки интеграции в формате JSON
        </p>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Создание..." : "Создать интеграцию"}
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

export default IntegrationForm;
