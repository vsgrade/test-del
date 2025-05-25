
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { DatabaseConfig, DatabaseStatus } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getStoredDatabaseConfig, createDynamicSupabaseClient } from "@/utils/setupUtils";

interface DatabaseContextType {
  databaseConfig: DatabaseConfig;
  status: DatabaseStatus;
  setDatabaseConfig: (config: DatabaseConfig) => void;
  testConnection: () => Promise<boolean>;
  saveDatabaseConfig: () => Promise<void>;
}

const initialConfig: DatabaseConfig = {
  type: 'supabase',
};

const initialStatus: DatabaseStatus = {
  isConnected: false,
  lastChecked: null,
};

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
};

interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const [databaseConfig, setDatabaseConfigState] = useState<DatabaseConfig>(() => {
    // Пытаемся загрузить конфигурацию из localStorage или используем значения из setup
    const savedConfig = getStoredDatabaseConfig();
    return savedConfig || initialConfig;
  });
  const [status, setStatus] = useState<DatabaseStatus>(initialStatus);
  const { toast } = useToast();
  
  // Обновление настроек базы данных
  const setDatabaseConfig = (config: DatabaseConfig) => {
    setDatabaseConfigState(config);
  };
  
  // Проверка соединения с базой данных
  const testConnection = async (): Promise<boolean> => {
    try {
      if (databaseConfig.type === 'supabase') {
        let client;
        
        // Используем динамический клиент если настройки из setup, иначе дефолтный
        if (databaseConfig.url && databaseConfig.apiKey) {
          client = await createDynamicSupabaseClient();
        } else {
          client = supabase; // Используем дефолтный клиент
        }
        
        const { data, error } = await client.from('profiles').select('id').limit(1);
        
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = table doesn't exist
        
        const newStatus: DatabaseStatus = {
          isConnected: true,
          lastChecked: new Date(),
        };
        
        setStatus(newStatus);
        toast({
          title: "Соединение успешно",
          description: "Соединение с Supabase установлено",
        });
        
        return true;
      } else if (databaseConfig.type === 'mysql') {
        // Для MySQL отправляем запрос на бэкенд для проверки соединения
        const response = await fetch('/api/test-mysql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(databaseConfig)
        });
        
        if (!response.ok) throw new Error('MySQL connection failed');
        
        const newStatus: DatabaseStatus = {
          isConnected: true,
          lastChecked: new Date(),
        };
        
        setStatus(newStatus);
        toast({
          title: "Соединение успешно",
          description: "Соединение с MySQL установлено",
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      const newStatus: DatabaseStatus = {
        isConnected: false,
        lastChecked: new Date(),
        error: error.message || "Ошибка соединения",
      };
      
      setStatus(newStatus);
      toast({
        variant: "destructive",
        title: "Ошибка соединения",
        description: error.message || "Не удалось подключиться к базе данных",
      });
      
      return false;
    }
  };
  
  // Сохранение настроек базы данных
  const saveDatabaseConfig = async (): Promise<void> => {
    try {
      // Сохраняем конфигурацию в localStorage
      localStorage.setItem('databaseConfig', JSON.stringify(databaseConfig));
      
      // Проверяем соединение
      await testConnection();
      
      toast({
        title: "Настройки сохранены",
        description: "Настройки базы данных сохранены",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка сохранения",
        description: error.message || "Не удалось сохранить настройки базы данных",
      });
    }
  };
  
  // Проверяем соединение при загрузке компонента
  useEffect(() => {
    if (databaseConfig.type) {
      testConnection();
    }
  }, []);
  
  const value = {
    databaseConfig,
    status,
    setDatabaseConfig,
    testConnection,
    saveDatabaseConfig
  };
  
  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
};
