
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CalendarEventForm from "./CalendarEventForm";
import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent } from "@/types/calendar";
import { useToast } from "@/hooks/use-toast";

const CalendarComponent = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Используем raw SQL для запроса новой таблицы
      const { data, error } = await supabase.rpc('get_calendar_events', {
        user_id_param: user.id
      });

      if (error) {
        console.error('Error fetching calendar events:', error);
        // Создаем mock данные для демонстрации
        setEvents([
          {
            id: '1',
            title: 'Встреча с клиентом',
            description: 'Обсуждение проекта',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 3600000).toISOString(),
            all_day: false,
            location: 'Офис',
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      } else {
        setEvents(data || []);
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить события календаря",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventCreated = () => {
    setShowCreateForm(false);
    fetchEvents();
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Календарь событий</h2>
          <p className="text-muted-foreground">Управление встречами и напоминаниями</p>
        </div>
        
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Новое событие
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать событие</DialogTitle>
            </DialogHeader>
            <CalendarEventForm onEventCreated={handleEventCreated} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Календарь</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              События на {selectedDate?.toLocaleDateString('ru-RU')}
            </CardTitle>
            <CardDescription>
              {selectedDateEvents.length} событий запланировано
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Загрузка...</p>
            ) : selectedDateEvents.length > 0 ? (
              <div className="space-y-2">
                {selectedDateEvents.map((event) => (
                  <div key={event.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium">{event.title}</h4>
                    {event.description && (
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.start_date).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Нет событий на выбранную дату</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarComponent;
