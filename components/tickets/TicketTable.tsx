
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Trash2, Eye, ArrowUpDown, Search, Filter, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import TicketForm from "./TicketForm";

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  channel: string;
  assigned_to?: string;
  client_id?: string;
  company_id?: string;
  tags: string[];
  due_date?: string;
  created_at: string;
  updated_at: string;
}

interface SortConfig {
  key: keyof Ticket;
  direction: 'asc' | 'desc';
}

const TicketTable = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' });
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

  const handleSort = (key: keyof Ticket) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedTickets = useMemo(() => {
    let filtered = tickets.filter(ticket => {
      const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Сортировка
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tickets, searchTerm, statusFilter, priorityFilter, sortConfig]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
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
      case 'pending': return 'secondary';
      case 'solved': return 'default';
      case 'closed': return 'secondary';
      default: return 'default';
    }
  };

  const handleTicketCreated = () => {
    setShowCreateForm(false);
    fetchTickets();
  };

  if (loading) {
    return <div className="p-4">Загрузка тикетов...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Панель управления */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск тикетов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 space-y-4">
              <div>
                <label className="text-sm font-medium">Статус</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="new">Новый</SelectItem>
                    <SelectItem value="open">Открыт</SelectItem>
                    <SelectItem value="pending">Ожидание</SelectItem>
                    <SelectItem value="solved">Решен</SelectItem>
                    <SelectItem value="closed">Закрыт</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Приоритет</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все приоритеты</SelectItem>
                    <SelectItem value="low">Низкий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                    <SelectItem value="urgent">Срочный</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Создать тикет
        </Button>
      </div>

      {/* Таблица */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <Button variant="ghost" onClick={() => handleSort('id')} className="h-auto p-0 font-medium">
                  ID
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('subject')} className="h-auto p-0 font-medium">
                  Тема
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('status')} className="h-auto p-0 font-medium">
                  Статус
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('priority')} className="h-auto p-0 font-medium">
                  Приоритет
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('channel')} className="h-auto p-0 font-medium">
                  Канал
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('created_at')} className="h-auto p-0 font-medium">
                  Создан
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                  {tickets.length === 0 ? "Тикетов пока нет" : "Тикеты не найдены"}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTickets.map((ticket) => (
                <TableRow key={ticket.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-xs">
                    {ticket.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="truncate font-medium">{ticket.subject}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {ticket.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ticket.channel}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Статистика */}
      <div className="text-sm text-muted-foreground">
        Показано {filteredAndSortedTickets.length} из {tickets.length} тикетов
      </div>

      {/* Диалоги */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Новый тикет</DialogTitle>
          </DialogHeader>
          <TicketForm onTicketCreated={handleTicketCreated} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingTicket} onOpenChange={() => setEditingTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                <p className="whitespace-pre-wrap">{viewingTicket.description}</p>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Канал:</h3>
                  <Badge variant="outline">{viewingTicket.channel}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold">Создан:</h3>
                  <p>{new Date(viewingTicket.created_at).toLocaleString()}</p>
                </div>
              </div>
              {viewingTicket.tags && viewingTicket.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold">Теги:</h3>
                  <div className="flex gap-2 flex-wrap">
                    {viewingTicket.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketTable;
