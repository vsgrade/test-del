
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TicketForm from "./TicketForm";

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  channel: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const TicketList = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  const { toast } = useToast();

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось загрузить тикеты",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот тикет?")) return;

    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Тикет удален",
        description: "Тикет успешно удален",
      });

      fetchTickets();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось удалить тикет",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'default';
      case 'open': return 'default';
      case 'in_progress': return 'default';
      case 'resolved': return 'default';
      case 'closed': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return <div className="p-4">Загрузка тикетов...</div>;
  }

  return (
    <div className="space-y-4">
      {tickets.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Тикетов пока нет</p>
          </CardContent>
        </Card>
      ) : (
        tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                  <CardDescription>
                    ID: {ticket.id.slice(0, 8)}... • Создан: {new Date(ticket.created_at).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setViewingTicket(ticket)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingTicket(ticket)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(ticket.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{ticket.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                <Badge variant={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                <Badge variant="outline">{ticket.channel}</Badge>
                {ticket.tags?.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={!!editingTicket} onOpenChange={() => setEditingTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать тикет</DialogTitle>
          </DialogHeader>
          {editingTicket && (
            <TicketForm
              initialData={editingTicket}
              isEditing={true}
              onTicketCreated={() => {
                setEditingTicket(null);
                fetchTickets();
              }}
              onCancel={() => setEditingTicket(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingTicket} onOpenChange={() => setViewingTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Просмотр тикета</DialogTitle>
          </DialogHeader>
          {viewingTicket && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Тема:</h3>
                <p>{viewingTicket.subject}</p>
              </div>
              <div>
                <h3 className="font-semibold">Описание:</h3>
                <p>{viewingTicket.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Статус:</h3>
                  <Badge variant={getStatusColor(viewingTicket.status)}>{viewingTicket.status}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold">Приоритет:</h3>
                  <Badge variant={getPriorityColor(viewingTicket.priority)}>{viewingTicket.priority}</Badge>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Теги:</h3>
                <div className="flex gap-2 flex-wrap">
                  {viewingTicket.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketList;
