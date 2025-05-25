
import { useState } from "react";
import { useDatabase } from "@/contexts/DatabaseContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const DatabaseSettings = () => {
  const { databaseConfig, status, setDatabaseConfig, testConnection, saveDatabaseConfig } = useDatabase();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleTypeChange = (type: 'supabase' | 'mysql') => {
    setDatabaseConfig({ ...databaseConfig, type });
  };
  
  const handleFieldChange = (field: string, value: string) => {
    setDatabaseConfig({ ...databaseConfig, [field]: value });
  };
  
  const handleTestConnection = async () => {
    setIsLoading(true);
    await testConnection();
    setIsLoading(false);
  };
  
  const handleSaveSettings = async () => {
    setIsLoading(true);
    await saveDatabaseConfig();
    setIsLoading(false);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Настройки базы данных</h3>
        <p className="text-sm text-muted-foreground">
          Выберите и настройте подключение к базе данных для вашей системы.
        </p>
      </div>
      
      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle>Выбор базы данных</CardTitle>
          <CardDescription>Выберите тип базы данных для использования в системе</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={databaseConfig.type}
            onValueChange={(value) => handleTypeChange(value as 'supabase' | 'mysql')}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="supabase" id="supabase" />
              <Label htmlFor="supabase">Supabase (облачное решение)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mysql" id="mysql" />
              <Label htmlFor="mysql">MySQL (через Node.js)</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
      
      {databaseConfig.type === 'supabase' && (
        <Card>
          <CardHeader>
            <CardTitle>Настройки Supabase</CardTitle>
            <CardDescription>Подключение к облачной базе данных Supabase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supabase-url">URL</Label>
              <Input
                id="supabase-url"
                value={databaseConfig.url || ""}
                onChange={(e) => handleFieldChange('url', e.target.value)}
                placeholder="https://your-project-id.supabase.co"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supabase-key">API Key</Label>
              <Input
                id="supabase-key"
                type="password"
                value={databaseConfig.apiKey || ""}
                onChange={(e) => handleFieldChange('apiKey', e.target.value)}
                placeholder="your-supabase-anon-key"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleTestConnection} disabled={isLoading}>
              Проверить соединение
            </Button>
            <Button onClick={handleSaveSettings} disabled={isLoading}>
              Сохранить настройки
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {databaseConfig.type === 'mysql' && (
        <Card>
          <CardHeader>
            <CardTitle>Настройки MySQL</CardTitle>
            <CardDescription>Подключение к базе данных MySQL через Node.js</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mysql-host">Хост</Label>
              <Input
                id="mysql-host"
                value={databaseConfig.host || ""}
                onChange={(e) => handleFieldChange('host', e.target.value)}
                placeholder="localhost"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mysql-port">Порт</Label>
              <Input
                id="mysql-port"
                type="number"
                value={databaseConfig.port?.toString() || ""}
                onChange={(e) => handleFieldChange('port', e.target.value)}
                placeholder="3306"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mysql-database">База данных</Label>
              <Input
                id="mysql-database"
                value={databaseConfig.database || ""}
                onChange={(e) => handleFieldChange('database', e.target.value)}
                placeholder="crm_database"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mysql-username">Имя пользователя</Label>
              <Input
                id="mysql-username"
                value={databaseConfig.username || ""}
                onChange={(e) => handleFieldChange('username', e.target.value)}
                placeholder="root"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mysql-password">Пароль</Label>
              <Input
                id="mysql-password"
                type="password"
                value={databaseConfig.password || ""}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                placeholder="password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleTestConnection} disabled={isLoading}>
              Проверить соединение
            </Button>
            <Button onClick={handleSaveSettings} disabled={isLoading}>
              Сохранить настройки
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {status.lastChecked && (
        <Alert variant={status.isConnected ? "default" : "destructive"}>
          {status.isConnected ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {status.isConnected ? "Соединение установлено" : "Ошибка соединения"}
          </AlertTitle>
          <AlertDescription>
            {status.isConnected
              ? `Успешное подключение к базе данных ${databaseConfig.type}`
              : status.error || "Не удалось подключиться к базе данных"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default DatabaseSettings;
