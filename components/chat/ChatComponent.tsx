
import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile, Phone, Video, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
  };
  timestamp: Date;
  isOwn: boolean;
  type: 'text' | 'image' | 'file';
}

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  role: string;
}

const ChatComponent = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Привет! Как дела с тикетом #1234?',
      sender: {
        id: '2',
        name: 'Мария Сидорова',
        avatar: '/placeholder.svg',
        isOnline: true
      },
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      isOwn: false,
      type: 'text'
    },
    {
      id: '2',
      content: 'Привет! Работаю над ним, уже почти готово. Должен закрыть его сегодня.',
      sender: {
        id: '1',
        name: 'Вы',
        isOnline: true
      },
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      isOwn: true,
      type: 'text'
    },
    {
      id: '3',
      content: 'Отлично! Клиент уже интересовался статусом.',
      sender: {
        id: '2',
        name: 'Мария Сидорова',
        avatar: '/placeholder.svg',
        isOnline: true
      },
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isOwn: false,
      type: 'text'
    }
  ]);

  const [onlineUsers] = useState<ChatUser[]>([
    {
      id: '2',
      name: 'Мария Сидорова',
      avatar: '/placeholder.svg',
      isOnline: true,
      role: 'Менеджер'
    },
    {
      id: '3',
      name: 'Иван Петров',
      avatar: '/placeholder.svg',
      isOnline: true,
      role: 'Техподдержка'
    },
    {
      id: '4',
      name: 'Алексей Козлов',
      avatar: '/placeholder.svg',
      isOnline: false,
      lastSeen: new Date(Date.now() - 30 * 60 * 1000),
      role: 'Разработчик'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<ChatUser>(onlineUsers[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: {
        id: '1',
        name: 'Вы',
        isOnline: true
      },
      timestamp: new Date(),
      isOwn: true,
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="flex h-[600px] bg-background border rounded-lg overflow-hidden">
      {/* Список пользователей */}
      <div className="w-80 border-r">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Команда онлайн</h3>
          <p className="text-sm text-muted-foreground">
            {onlineUsers.filter(u => u.isOnline).length} онлайн
          </p>
        </div>
        <ScrollArea className="h-[calc(600px-80px)]">
          <div className="p-2 space-y-1">
            {onlineUsers.map((user) => (
              <div
                key={user.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                  selectedUser.id === user.id ? 'bg-muted' : ''
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                      user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.role}</p>
                    {!user.isOnline && user.lastSeen && (
                      <p className="text-xs text-muted-foreground">
                        {formatLastSeen(user.lastSeen)}
                      </p>
                    )}
                  </div>
                  {user.isOnline && (
                    <Badge variant="secondary" className="text-xs">
                      Онлайн
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Чат */}
      <div className="flex-1 flex flex-col">
        {/* Заголовок чата */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={selectedUser.avatar} />
              <AvatarFallback className="text-sm">
                {selectedUser.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{selectedUser.name}</h4>
              <p className="text-xs text-muted-foreground">
                {selectedUser.isOnline ? 'Онлайн' : `Был(а) ${formatLastSeen(selectedUser.lastSeen!)}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Просмотр профиля</DropdownMenuItem>
                <DropdownMenuItem>Очистить историю</DropdownMenuItem>
                <DropdownMenuItem>Заблокировать</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Сообщения */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[70%] ${message.isOwn ? 'flex-row-reverse' : ''}`}>
                  {!message.isOwn && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.sender.avatar} />
                      <AvatarFallback className="text-xs">
                        {message.sender.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`rounded-lg p-3 ${
                    message.isOwn 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.isOwn 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Ввод сообщения */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Введите сообщение..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button variant="ghost" size="sm">
              <Smile className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
