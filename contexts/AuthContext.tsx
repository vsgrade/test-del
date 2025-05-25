import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from '@supabase/supabase-js';
import { UserRole, UserRoleEnum } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * Интерфейс контекста аутентификации
 */
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  updateProfile: (data: { firstName?: string; lastName?: string; position?: string; department?: string }) => Promise<void>;
}

// Создание контекста аутентификации
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Хук для использования контекста аутентификации
 * @returns {AuthContextType} Контекст аутентификации
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Карта разрешений для различных ролей
const permissionMap: Record<UserRole, string[]> = {
  [UserRoleEnum.ADMIN]: ["*"], // Администратор имеет все права
  [UserRoleEnum.MANAGER]: [
    "tickets:view", "tickets:create", "tickets:update", "tickets:assign",
    "crm:view", "crm:create", "crm:update",
    "deals:view", "deals:create", "deals:update",
    "reports:view",
    "kb:view", "kb:create", "kb:update"
  ],
  [UserRoleEnum.SUPPORT_AGENT]: [
    "tickets:view", "tickets:create", "tickets:update", "tickets:assign",
    "crm:view",
    "kb:view", "kb:create", "kb:update"
  ],
  [UserRoleEnum.SALES_AGENT]: [
    "tickets:view", 
    "crm:view", "crm:create", "crm:update",
    "deals:view", "deals:create", "deals:update"
  ],
  [UserRoleEnum.READ_ONLY]: [
    "tickets:view", 
    "crm:view", 
    "deals:view", 
    "reports:view", 
    "kb:view"
  ]
};

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Провайдер контекста аутентификации
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Проверка аутентификации при загрузке
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // If we just signed in or signed out, show a toast
        if (event === 'SIGNED_IN') {
          toast({
            title: "Вход выполнен",
            description: "Вы успешно вошли в систему",
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Выход выполнен",
            description: "Вы вышли из системы",
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  /**
   * Функция входа пользователя
   * @param {string} email - Email пользователя
   * @param {string} password - Пароль пользователя
   * @returns {Promise<void>} Результат операции
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || "Ошибка при входе");
      setIsLoading(false);
      throw err;
    }
  };

  /**
   * Функция регистрации пользователя
   * @param {string} email - Email пользователя
   * @param {string} password - Пароль пользователя
   * @param {string} firstName - Имя пользователя
   * @param {string} lastName - Фамилия пользователя
   * @returns {Promise<void>} Результат операции
   */
  const signup = async (email: string, password: string, firstName: string, lastName: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || "Ошибка при регистрации");
      setIsLoading(false);
      throw err;
    }
  };

  /**
   * Функция выхода пользователя
   * @returns {Promise<void>} Результат операции
   */
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || "Ошибка при выходе");
      setIsLoading(false);
      throw err;
    }
  };

  /**
   * Обновляет профиль пользователя
   * @param data - Данные для обновления
   */
  const updateProfile = async (data: { firstName?: string; lastName?: string; position?: string; department?: string }): Promise<void> => {
    if (!user) throw new Error("Пользователь не авторизован");
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          position: data.position,
          department: data.department,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Профиль обновлен",
        description: "Ваш профиль успешно обновлен",
      });
      
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || "Ошибка при обновлении профиля");
      setIsLoading(false);
      throw err;
    }
  };

  /**
   * Проверяет наличие разрешения у пользователя
   * @param {string} permission - Проверяемое разрешение
   * @returns {boolean} Результат проверки
   */
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // TODO: Get user role from profiles table
    const userRole = UserRoleEnum.ADMIN as UserRole; // Default to admin for now
    const userPermissions = permissionMap[userRole];
    
    // Проверка на наличие разрешения на все действия ("*")
    if (userPermissions.includes("*")) return true;
    
    // Проверка на конкретное разрешение
    return userPermissions.includes(permission);
  };

  const value = {
    user,
    session,
    isLoading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    hasPermission,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
