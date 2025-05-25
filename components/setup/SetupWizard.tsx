
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Database, User, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { testDatabaseConnection, initializeDatabaseTables, createAdminUser } from "@/utils/setupUtils";

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

const setupSteps: SetupStep[] = [
  {
    id: "database",
    title: "Настройка базы данных",
    description: "Выберите и настройте подключение к базе данных",
    icon: Database
  },
  {
    id: "admin",
    title: "Создание администратора",
    description: "Создайте учетную запись администратора",
    icon: User
  },
  {
    id: "complete",
    title: "Завершение",
    description: "Настройка завершена успешно",
    icon: CheckCircle
  }
];

interface SetupWizardProps {
  onComplete: () => void;
}

const SetupWizard = ({ onComplete }: SetupWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dbConfig, setDbConfig] = useState({
    type: 'supabase' as 'supabase' | 'mysql',
    url: '',
    apiKey: '',
    host: 'localhost',
    port: 3306,
    database: '',
    username: '',
    password: ''
  });
  const [adminData, setAdminData] = useState({
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Администратор',
    lastName: 'Системы'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await testDatabaseConnection(dbConfig);
      setTestResult(result);
      
      if (result.success) {
        toast({
          title: "Тест подключения успешен",
          description: result.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка подключения",
          description: result.message,
        });
      }
    } catch (error: any) {
      const errorResult = { success: false, message: error.message || "Неизвестная ошибка" };
      setTestResult(errorResult);
      toast({
        variant: "destructive",
        title: "Ошибка тестирования",
        description: errorResult.message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDatabaseSubmit = async () => {
    setIsLoading(true);
    try {
      // Сначала тестируем подключение
      const testResult = await testDatabaseConnection(dbConfig);
      
      if (!testResult.success) {
        toast({
          variant: "destructive",
          title: "Ошибка подключения",
          description: testResult.message
        });
        setIsLoading(false);
        return;
      }

      // Создаем таблицы
      const initResult = await initializeDatabaseTables(dbConfig);
      
      if (!initResult.success) {
        toast({
          variant: "destructive",
          title: "Ошибка создания таблиц",
          description: initResult.message
        });
        setIsLoading(false);
        return;
      }

      // Сохраняем конфигурацию базы данных
      localStorage.setItem('dbConfig', JSON.stringify(dbConfig));
      
      setCurrentStep(1);
      toast({
        title: "База данных настроена",
        description: "Подключение к базе данных установлено и таблицы созданы"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка настройки",
        description: error.message || "Не удалось настроить базу данных"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await createAdminUser(adminData);
      
      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Ошибка создания администратора",
          description: result.message
        });
        setIsLoading(false);
        return;
      }

      setCurrentStep(2);
      toast({
        title: "Администратор создан",
        description: result.message
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка создания админа",
        description: error.message || "Не удалось создать администратора"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Отмечаем проект как настроенный
      localStorage.setItem('projectInitialized', 'true');
      
      toast({
        title: "Настройка завершена",
        description: "CRM система успешно настроена и готова к использованию"
      });

      onComplete();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка завершения",
        description: error.message || "Не удалось завершить настройку"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderDatabaseStep = () => (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Настройка базы данных
        </CardTitle>
        <CardDescription>
          Выберите тип базы данных и настройте подключение
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Тип базы данных</Label>
          <RadioGroup 
            value={dbConfig.type}
            onValueChange={(value) => {
              setDbConfig({...dbConfig, type: value as 'supabase' | 'mysql'});
              setTestResult(null);
            }}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="supabase" id="supabase" />
              <Label htmlFor="supabase">Supabase (рекомендуется)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mysql" id="mysql" />
              <Label htmlFor="mysql">MySQL</Label>
            </div>
          </RadioGroup>
        </div>

        {dbConfig.type === 'supabase' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="supabase-url">URL проекта Supabase</Label>
              <Input
                id="supabase-url"
                value={dbConfig.url}
                onChange={(e) => {
                  setDbConfig({...dbConfig, url: e.target.value});
                  setTestResult(null);
                }}
                placeholder="https://your-project.supabase.co"
              />
            </div>
            <div>
              <Label htmlFor="supabase-key">API ключ</Label>
              <Input
                id="supabase-key"
                type="password"
                value={dbConfig.apiKey}
                onChange={(e) => {
                  setDbConfig({...dbConfig, apiKey: e.target.value});
                  setTestResult(null);
                }}
                placeholder="your-anon-key"
              />
            </div>
          </div>
        )}

        {dbConfig.type === 'mysql' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mysql-host">Хост</Label>
                <Input
                  id="mysql-host"
                  value={dbConfig.host}
                  onChange={(e) => {
                    setDbConfig({...dbConfig, host: e.target.value});
                    setTestResult(null);
                  }}
                  placeholder="localhost"
                />
              </div>
              <div>
                <Label htmlFor="mysql-port">Порт</Label>
                <Input
                  id="mysql-port"
                  type="number"
                  value={dbConfig.port}
                  onChange={(e) => {
                    setDbConfig({...dbConfig, port: parseInt(e.target.value) || 3306});
                    setTestResult(null);
                  }}
                  placeholder="3306"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="mysql-database">База данных</Label>
              <Input
                id="mysql-database"
                value={dbConfig.database}
                onChange={(e) => {
                  setDbConfig({...dbConfig, database: e.target.value});
                  setTestResult(null);
                }}
                placeholder="crm_database"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mysql-username">Пользователь</Label>
                <Input
                  id="mysql-username"
                  value={dbConfig.username}
                  onChange={(e) => {
                    setDbConfig({...dbConfig, username: e.target.value});
                    setTestResult(null);
                  }}
                  placeholder="root"
                />
              </div>
              <div>
                <Label htmlFor="mysql-password">Пароль</Label>
                <Input
                  id="mysql-password"
                  type="password"
                  value={dbConfig.password}
                  onChange={(e) => {
                    setDbConfig({...dbConfig, password: e.target.value});
                    setTestResult(null);
                  }}
                  placeholder="password"
                />
              </div>
            </div>
          </div>
        )}

        {/* Результат тестирования */}
        {testResult && (
          <Alert variant={testResult.success ? "default" : "destructive"}>
            {testResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>
              {testResult.message}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={handleTestConnection} 
          disabled={isTesting}
          className="flex-1"
        >
          {isTesting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Тестирование...
            </>
          ) : (
            "Проверить подключение"
          )}
        </Button>
        <Button 
          onClick={handleDatabaseSubmit} 
          disabled={isLoading || !testResult?.success} 
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Настройка...
            </>
          ) : (
            "Продолжить"
          )}
        </Button>
      </CardFooter>
    </Card>
  );

  const renderAdminStep = () => (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Создание администратора
        </CardTitle>
        <CardDescription>
          Создайте учетную запись администратора системы
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="admin-firstName">Имя</Label>
            <Input
              id="admin-firstName"
              value={adminData.firstName}
              onChange={(e) => setAdminData({...adminData, firstName: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="admin-lastName">Фамилия</Label>
            <Input
              id="admin-lastName"
              value={adminData.lastName}
              onChange={(e) => setAdminData({...adminData, lastName: e.target.value})}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="admin-email">Email</Label>
          <Input
            id="admin-email"
            type="email"
            value={adminData.email}
            onChange={(e) => setAdminData({...adminData, email: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="admin-password">Пароль</Label>
          <Input
            id="admin-password"
            type="password"
            value={adminData.password}
            onChange={(e) => setAdminData({...adminData, password: e.target.value})}
          />
        </div>
        <Alert>
          <AlertDescription>
            <strong>Важно!</strong> Сохраните эти данные! Они понадобятся для входа в систему.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" onClick={() => setCurrentStep(0)} className="flex-1">
          Назад
        </Button>
        <Button onClick={handleAdminSubmit} disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Создание...
            </>
          ) : (
            "Создать администратора"
          )}
        </Button>
      </CardFooter>
    </Card>
  );

  const renderCompleteStep = () => (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Настройка завершена
        </CardTitle>
        <CardDescription>
          CRM система успешно настроена и готова к использованию
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Поздравляем!</strong> Ваша CRM система настроена и готова к работе.
          </AlertDescription>
        </Alert>
        <div className="space-y-2">
          <p><strong>Данные для входа:</strong></p>
          <p>Email: {adminData.email}</p>
          <p>Пароль: {adminData.password}</p>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm">
            <strong>Что было сделано:</strong>
          </p>
          <ul className="text-sm mt-2 space-y-1">
            <li>✅ Настроено подключение к базе данных</li>
            <li>✅ Созданы все необходимые таблицы</li>
            <li>✅ Создан аккаунт администратора</li>
            <li>✅ Настроены политики безопасности</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleComplete} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Завершение...
            </>
          ) : (
            "Войти в систему"
          )}
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Настройка CRM системы</h1>
          <p className="text-muted-foreground mt-2">
            Добро пожаловать! Давайте настроим вашу CRM систему
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {setupSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2
                    ${isCompleted ? 'bg-green-600 border-green-600 text-white' : 
                      isActive ? 'border-primary text-primary' : 'border-muted text-muted-foreground'}
                  `}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {index < setupSteps.length - 1 && (
                    <div className={`w-16 h-0.5 ml-4 ${isCompleted ? 'bg-green-600' : 'bg-muted'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {currentStep === 0 && renderDatabaseStep()}
        {currentStep === 1 && (
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Создание администратора
              </CardTitle>
              <CardDescription>
                Создайте учетную запись администратора системы
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="admin-firstName">Имя</Label>
                  <Input
                    id="admin-firstName"
                    value={adminData.firstName}
                    onChange={(e) => setAdminData({...adminData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="admin-lastName">Фамилия</Label>
                  <Input
                    id="admin-lastName"
                    value={adminData.lastName}
                    onChange={(e) => setAdminData({...adminData, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={adminData.email}
                  onChange={(e) => setAdminData({...adminData, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="admin-password">Пароль</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={adminData.password}
                  onChange={(e) => setAdminData({...adminData, password: e.target.value})}
                />
              </div>
              <Alert>
                <AlertDescription>
                  <strong>Важно!</strong> Сохраните эти данные! Они понадобятся для входа в систему.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep(0)} className="flex-1">
                Назад
              </Button>
              <Button onClick={handleAdminSubmit} disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Создание...
                  </>
                ) : (
                  "Создать администратора"
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
        {currentStep === 2 && (
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Настройка завершена
              </CardTitle>
              <CardDescription>
                CRM система успешно настроена и готова к использованию
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Поздравляем!</strong> Ваша CRM система настроена и готова к работе.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <p><strong>Данные для входа:</strong></p>
                <p>Email: {adminData.email}</p>
                <p>Пароль: {adminData.password}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Что было сделано:</strong>
                </p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>✅ Настроено подключение к базе данных</li>
                  <li>✅ Созданы все необходимые таблицы</li>
                  <li>✅ Создан аккаунт администратора</li>
                  <li>✅ Настроены политики безопасности</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleComplete} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Завершение...
                  </>
                ) : (
                  "Войти в систему"
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SetupWizard;
