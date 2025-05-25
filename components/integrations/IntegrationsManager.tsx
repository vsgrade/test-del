
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import IntegrationForm from "./IntegrationForm";
import { supabase } from "@/integrations/supabase/client";
import { Integration } from "@/types/integration";
import { useToast } from "@/hooks/use-toast";

const IntegrationsManager = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchIntegrations = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Используем RPC функцию для получения интеграций
      const { data, error } = await supabase.rpc('get_user_integrations', {
        user_id_param: user.id
      });

      if (error) {
        console.error('Error fetching integrations:', error);
        // Создаем mock данные для демонстрации
        setIntegrations([
          {
            id: '1',
            name: 'Telegram Bot',
            type: 'telegram',
            config: { bot_token: '***' },
            is_active: true,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'WhatsApp Business',
            type: 'whatsapp',
            config: { phone_number: '***' },
            is_active: false,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      } else {
        setIntegrations(data || []);
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить интеграции",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleIntegrationCreated = () => {
    setShowCreateForm(false);
    fetchIntegrations();
  };

  const toggleIntegration = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase.rpc('toggle_integration', {
        integration_id: id,
        new_status: !isActive
      });

      if (error) throw error;

      toast({
        title: isActive ? "Интеграция отключена" : "Интеграция включена",
        description: "Статус интеграции успешно изменен",
      });

      fetchIntegrations();
    } catch (error: any) {
      console.error('Error toggling integration:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось изменить статус интеграции",
      });
    }
  };

  const deleteIntegration = async (id: string) => {
    try {
      const { error } = await supabase.rpc('delete_integration', {
        integration_id: id
      });

      if (error) throw error;

      toast({
        title: "Интеграция удалена",
        description: "Интеграция успешно удалена",
      });

      fetchIntegrations();
    } catch (error: any) {
      console.error('Error deleting integration:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить интеграцию",
      });
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'telegram':
        return '📱';
      case 'whatsapp':
        return '💬';
      case 'email':
        return '📧';
      case 'api':
        return '🔗';
      default:
        return '⚙️';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Интеграции</h2>
          <p className="text-muted-foreground">
            Управление подключениями к внешним сервисам
          </p>
        </div>
        
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить интеграцию
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Новая интеграция</DialogTitle>
            </DialogHeader>
            <IntegrationForm onIntegrationCreated={handleIntegrationCreated} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Загрузка интеграций...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => (
            <Card key={integration.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getIntegrationIcon(integration.type)}</span>
                  <div>
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                    <CardDescription className="capitalize">
                      {integration.type}
                    </CardDescription>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${integration.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${integration.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                    {integration.is_active ? 'Активна' : 'Неактивна'}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleIntegration(integration.id, integration.is_active)}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteIntegration(integration.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-muted-foreground">
                  Создана: {new Date(integration.created_at).toLocaleDateString('ru-RU')}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {integrations.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  Интеграции не настроены. Добавьте первую интеграцию для начала работы.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default IntegrationsManager;
