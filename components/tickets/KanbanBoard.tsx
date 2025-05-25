
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, User, Calendar, AlertCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: {
    name: string;
    avatar?: string;
  };
  dueDate?: Date;
  tags: string[];
  commentsCount: number;
}

interface Column {
  id: string;
  title: string;
  color: string;
  tickets: Ticket[];
}

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'new',
      title: 'Новые',
      color: 'bg-blue-500',
      tickets: [
        {
          id: '1',
          title: 'Проблема с входом в систему',
          description: 'Пользователь не может войти в систему',
          priority: 'high',
          assignee: {
            name: 'Иван Петров',
            avatar: '/placeholder.svg'
          },
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          tags: ['авторизация', 'срочно'],
          commentsCount: 3
        },
        {
          id: '2',
          title: 'Запрос на новую функцию',
          description: 'Клиент просит добавить экспорт отчетов',
          priority: 'medium',
          tags: ['функционал', 'отчеты'],
          commentsCount: 1
        }
      ]
    },
    {
      id: 'inprogress',
      title: 'В работе',
      color: 'bg-yellow-500',
      tickets: [
        {
          id: '3',
          title: 'Оптимизация производительности',
          description: 'Система работает медленно',
          priority: 'medium',
          assignee: {
            name: 'Мария Сидорова',
            avatar: '/placeholder.svg'
          },
          tags: ['производительность'],
          commentsCount: 5
        }
      ]
    },
    {
      id: 'review',
      title: 'На проверке',
      color: 'bg-purple-500',
      tickets: [
        {
          id: '4',
          title: 'Обновление документации',
          description: 'Нужно обновить пользовательскую документацию',
          priority: 'low',
          assignee: {
            name: 'Алексей Козлов',
            avatar: '/placeholder.svg'
          },
          tags: ['документация'],
          commentsCount: 2
        }
      ]
    },
    {
      id: 'done',
      title: 'Выполнено',
      color: 'bg-green-500',
      tickets: [
        {
          id: '5',
          title: 'Исправление бага в отчетах',
          description: 'Исправлен баг с некорректным отображением данных',
          priority: 'high',
          assignee: {
            name: 'Иван Петров',
            avatar: '/placeholder.svg'
          },
          tags: ['баг', 'отчеты'],
          commentsCount: 7
        }
      ]
    }
  ]);

  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityText = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'Критический';
      case 'high':
        return 'Высокий';
      case 'medium':
        return 'Средний';
      case 'low':
        return 'Низкий';
      default:
        return 'Не указан';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const isOverdue = (date: Date) => {
    return date < new Date();
  };

  return (
    <div className="h-full">
      <div className="flex gap-6 h-full overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${column.color}`} />
                    <CardTitle className="text-sm font-medium">
                      {column.title}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {column.tickets.length}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {column.tickets.map((ticket) => (
                    <Card key={ticket.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium line-clamp-2">
                              {ticket.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {ticket.description}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Редактировать</DropdownMenuItem>
                              <DropdownMenuItem>Назначить</DropdownMenuItem>
                              <DropdownMenuItem>Удалить</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(ticket.priority)} text-white border-none`}
                          >
                            {getPriorityText(ticket.priority)}
                          </Badge>
                          {ticket.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-3">
                            {ticket.assignee ? (
                              <div className="flex items-center gap-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={ticket.assignee.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {ticket.assignee.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs">{ticket.assignee.name}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>Не назначен</span>
                              </div>
                            )}
                            
                            {ticket.dueDate && (
                              <div className={`flex items-center gap-1 ${
                                isOverdue(ticket.dueDate) ? 'text-red-500' : ''
                              }`}>
                                {isOverdue(ticket.dueDate) && <AlertCircle className="h-3 w-3" />}
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(ticket.dueDate)}</span>
                              </div>
                            )}
                          </div>
                          
                          {ticket.commentsCount > 0 && (
                            <Badge variant="outline" className="text-xs">
                              💬 {ticket.commentsCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
