
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { ArrowLeft, Clock, User, Building, Tag, Send } from "lucide-react";
import { 
  getTicketById, 
  getTicketComments, 
  addTicketComment, 
  updateTicketStatus,
  updateTicketPriority,
  assignTicket
} from "@/services/ticketService";
import { Ticket, TicketComment } from "@/types";

const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sendToTelegram, setSendToTelegram] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadTicketData();
    }
  }, [id]);

  const loadTicketData = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const [ticketData, commentsData] = await Promise.all([
        getTicketById(id),
        getTicketComments(id)
      ]);

      if (!ticketData) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Тикет не найден"
        });
        navigate("/tickets");
        return;
      }

      setTicket(ticketData);
      setComments(commentsData);
      
      // Автоматически включаем отправку в Telegram для тикетов из Telegram
      if (ticketData.channel === 'telegram') {
        setSendToTelegram(true);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка загрузки",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !id) return;

    setIsSubmitting(true);
    try {
      const comment = await addTicketComment(id, newComment, isInternal, sendToTelegram);
      setComments([...comments, comment]);
      setNewComment("");
      
      toast({
        title: "Комментарий добавлен",
        description: sendToTelegram ? "Комментарий добавлен и отправлен в Telegram" : "Комментарий успешно добавлен"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !ticket) return;

    try {
      const updatedTicket = await updateTicketStatus(id, newStatus);
      setTicket(updatedTicket);
      
      toast({
        title: "Статус обновлен",
        description: `Статус тикета изменен на "${newStatus}"`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message
      });
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!id || !ticket) return;

    try {
      const updatedTicket = await updateTicketPriority(id, newPriority);
      setTicket(updatedTicket);
      
      toast({
        title: "Приоритет обновлен",
        description: `Приоритет тикета изменен на "${newPriority}"`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'open': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'solved': return 'bg-purple-100 text-purple-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Загрузка тикета...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!ticket) {
    return (
      <MainLayout>
        <div className="container py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Тикет не найден</h1>
            <Button onClick={() => navigate("/tickets")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Вернуться к списку тикетов
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/tickets")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{ticket.subject}</h1>
              <p className="text-muted-foreground">Тикет #{ticket.id.slice(0, 8)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(ticket.status)}>
              {ticket.status}
            </Badge>
            <Badge className={getPriorityColor(ticket.priority)}>
              {ticket.priority}
            </Badge>
            {ticket.channel === 'telegram' && (
              <Badge variant="outline">📱 Telegram</Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Описание тикета</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{ticket.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Комментарии</CardTitle>
                <CardDescription>
                  {comments.length} комментариев
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">
                            {comment.author_type === 'user' ? 'Поддержка' : 
                             comment.author_type === 'client' ? 'Клиент' : 'Система'}
                          </span>
                          {comment.is_internal && (
                            <Badge variant="outline" className="text-xs">
                              Внутренний
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Комментариев пока нет
                  </p>
                )}

                <div className="space-y-3">
                  <Textarea
                    placeholder="Добавить комментарий..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="internal" 
                        checked={isInternal}
                        onCheckedChange={(checked) => setIsInternal(checked as boolean)}
                      />
                      <label htmlFor="internal" className="text-sm">
                        Внутренний комментарий
                      </label>
                    </div>
                    
                    {ticket.channel === 'telegram' && !isInternal && (
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="telegram" 
                          checked={sendToTelegram}
                          onCheckedChange={(checked) => setSendToTelegram(checked as boolean)}
                        />
                        <label htmlFor="telegram" className="text-sm">
                          Отправить в Telegram
                        </label>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmitting}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Отправка..." : "Добавить комментарий"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Управление тикетом</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Статус</label>
                  <Select value={ticket.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Новый</SelectItem>
                      <SelectItem value="open">Открыт</SelectItem>
                      <SelectItem value="pending">Ожидание</SelectItem>
                      <SelectItem value="solved">Решен</SelectItem>
                      <SelectItem value="closed">Закрыт</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Приоритет</label>
                  <Select value={ticket.priority} onValueChange={handlePriorityChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Низкий</SelectItem>
                      <SelectItem value="medium">Средний</SelectItem>
                      <SelectItem value="high">Высокий</SelectItem>
                      <SelectItem value="urgent">Критический</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Создан</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(ticket.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Канал</p>
                    <p className="text-sm text-muted-foreground">{ticket.channel}</p>
                  </div>
                </div>

                {ticket.tags.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">Теги</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ticket.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TicketDetail;
