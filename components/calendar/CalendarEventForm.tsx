
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CalendarEventFormProps {
  onEventCreated?: () => void;
}

const CalendarEventForm = ({ onEventCreated }: CalendarEventFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    all_day: false,
    location: "",
    reminder_minutes: 15,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Не авторизован");

      // Создаем событие напрямую в таблице
      const { error } = await supabase
        .from('calendar_events')
        .insert({
          title: formData.title,
          description: formData.description,
          start_time: formData.start_date,
          end_time: formData.end_date,
          type: formData.all_day ? 'all_day' : 'meeting',
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Событие создано",
        description: "Новое событие успешно добавлено в календарь",
      });

      setFormData({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        all_day: false,
        location: "",
        reminder_minutes: 15,
      });

      onEventCreated?.();
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось создать событие",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Название события</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Встреча с клиентом"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Дополнительная информация о событии"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Начало</Label>
          <Input
            id="start_date"
            type="datetime-local"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">Окончание</Label>
          <Input
            id="end_date"
            type="datetime-local"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="all_day"
          checked={formData.all_day}
          onCheckedChange={(checked) => setFormData({ ...formData, all_day: checked })}
        />
        <Label htmlFor="all_day">Весь день</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Место проведения</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Офис, онлайн, адрес"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reminder">Напомнить за (минут)</Label>
        <Input
          id="reminder"
          type="number"
          value={formData.reminder_minutes}
          onChange={(e) => setFormData({ ...formData, reminder_minutes: parseInt(e.target.value) || 15 })}
          min="0"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Создание..." : "Создать событие"}
      </Button>
    </form>
  );
};

export default CalendarEventForm;
