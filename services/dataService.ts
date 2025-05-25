
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole, UserRoleEnum } from "@/types";
import { Database } from "@/integrations/supabase/types";

/**
 * Базовый сервис для работы с данными через Supabase
 */
export class DataService {
  /**
   * Получает текущего пользователя с расширенной информацией из profiles
   * @returns {Promise<User | null>} Пользователь с расширенной информацией
   */
  static async getCurrentUser(): Promise<User | null> {
    const { data: authUser } = await supabase.auth.getUser();
    
    if (!authUser.user) {
      return null;
    }
    
    // Получаем данные профиля
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.user.id)
      .single();
    
    if (!profile) {
      return null;
    }
    
    // Возвращаем объединенные данные
    return {
      id: authUser.user.id,
      email: authUser.user.email || '',
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      position: profile.position || undefined,
      department: profile.department || undefined,
      role: profile.role as UserRole || UserRoleEnum.READ_ONLY,
      isActive: profile.is_active || false,
      lastLogin: profile.last_login || undefined,
      createdAt: profile.created_at || new Date().toISOString()
    };
  }

  /**
   * Обновляет профиль пользователя
   * @param {string} userId - ID пользователя
   * @param {Partial<Database['public']['Tables']['profiles']['Update']>} data - Данные для обновления
   * @returns {Promise<void>}
   */
  static async updateProfile(
    userId: string,
    data: Partial<Database['public']['Tables']['profiles']['Update']>
  ): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId);
    
    if (error) {
      throw error;
    }
  }
}
