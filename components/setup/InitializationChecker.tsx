
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import SetupWizard from "./SetupWizard";
import { supabase } from "@/integrations/supabase/client";

interface InitializationCheckerProps {
  children: React.ReactNode;
}

const InitializationChecker = ({ children }: InitializationCheckerProps) => {
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkInitialization();
  }, []);

  const checkInitialization = async () => {
    try {
      // Сначала проверяем локальное хранилище
      const localInit = localStorage.getItem('projectInitialized');
      
      if (localInit === 'true') {
        // Дополнительно проверяем подключение к базе данных
        const isDbConnected = await checkDatabaseConnection();
        
        if (isDbConnected) {
          setIsInitialized(true);
        } else {
          // База данных не подключена, нужна настройка
          localStorage.removeItem('projectInitialized');
          localStorage.removeItem('dbConfig');
          setIsInitialized(false);
        }
      } else {
        // Проект не инициализирован, проверим базу данных
        const isDbConnected = await checkDatabaseConnection();
        
        if (isDbConnected) {
          // База подключена, но проект не помечен как инициализированный
          // Проверим, есть ли необходимые таблицы
          const hasRequiredTables = await checkRequiredTables();
          
          if (hasRequiredTables) {
            // Все таблицы есть, можем пометить как инициализированный
            localStorage.setItem('projectInitialized', 'true');
            setIsInitialized(true);
          } else {
            setIsInitialized(false);
          }
        } else {
          setIsInitialized(false);
        }
      }
    } catch (error) {
      console.error('Error checking initialization:', error);
      setIsInitialized(false);
    } finally {
      setIsLoading(false);
    }
  };

  const checkDatabaseConnection = async (): Promise<boolean> => {
    try {
      // Простая проверка подключения к Supabase через auth
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Database connection error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Database connection check failed:', error);
      return false;
    }
  };

  const checkRequiredTables = async (): Promise<boolean> => {
    try {
      // Проверяем наличие основных таблиц
      const tables = ['tickets', 'contacts', 'companies'];
      
      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select('id').limit(1);
          
          if (error && error.code === 'PGRST116') {
            // Таблица не существует
            console.log(`Table ${table} does not exist`);
            return false;
          }
        } catch (err) {
          console.log(`Error checking table ${table}:`, err);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error checking required tables:', error);
      return false;
    }
  };

  const handleSetupComplete = () => {
    setIsInitialized(true);
    toast({
      title: "Добро пожаловать!",
      description: "Проект настроен. Теперь вы можете войти в систему.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Проверка инициализации...</p>
        </div>
      </div>
    );
  }

  if (isInitialized === false) {
    return <SetupWizard onComplete={handleSetupComplete} />;
  }

  return <>{children}</>;
};

export default InitializationChecker;
