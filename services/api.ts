
/**
 * Базовый класс для работы с API
 */
import { supabase } from "@/integrations/supabase/client";

export class BaseApi {
  /**
   * Базовый URL для API
   */
  protected baseUrl: string;

  /**
   * Конструктор API сервиса
   * @param {string} baseUrl - Базовый URL для API
   */
  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Возвращает базовый URL API
   * @returns {string} Базовый URL API
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Выполняет GET запрос
   * @param {string} endpoint - Эндпоинт API
   * @param {Record<string, any>} params - Параметры запроса
   * @returns {Promise<T>} Результат запроса
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      // Для демонстрационных целей используем моки
      // В реальном приложении здесь будет запрос к backend API
      
      // Для демо, имитируем задержку и возвращаем моки
      return new Promise((resolve) => {
        setTimeout(() => {
          // Здесь можно подставить моки в зависимости от endpoint
          const mockData = this.getMockData(endpoint, params);
          resolve(mockData as T);
        }, 500);
      });
    } catch (error) {
      console.error("API error:", error);
      throw new Error(`API error: ${error}`);
    }
  }

  /**
   * Выполняет POST запрос
   * @param {string} endpoint - Эндпоинт API
   * @param {T} data - Данные запроса
   * @returns {Promise<R>} Результат запроса
   */
  async post<T, R>(endpoint: string, data: T): Promise<R> {
    try {
      // Для демонстрационных целей используем моки
      return new Promise((resolve) => {
        setTimeout(() => {
          // Здесь можно обработать данные и вернуть результат
          const mockResponse = { id: "mock-id", ...data } as unknown as R;
          resolve(mockResponse);
        }, 500);
      });
    } catch (error) {
      console.error("API error:", error);
      throw new Error(`API error: ${error}`);
    }
  }

  /**
   * Выполняет PUT запрос
   * @param {string} endpoint - Эндпоинт API
   * @param {T} data - Данные запроса
   * @returns {Promise<R>} Результат запроса
   */
  async put<T, R>(endpoint: string, data: T): Promise<R> {
    try {
      // Для демонстрационных целей используем моки
      return new Promise((resolve) => {
        setTimeout(() => {
          // Здесь можно обработать данные и вернуть результат
          const mockResponse = { ...data } as unknown as R;
          resolve(mockResponse);
        }, 500);
      });
    } catch (error) {
      console.error("API error:", error);
      throw new Error(`API error: ${error}`);
    }
  }

  /**
   * Выполняет DELETE запрос
   * @param {string} endpoint - Эндпоинт API
   * @returns {Promise<void>} Результат запроса
   */
  async delete(endpoint: string): Promise<void> {
    try {
      // Для демонстрационных целей используем моки
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 500);
      });
    } catch (error) {
      console.error("API error:", error);
      throw new Error(`API error: ${error}`);
    }
  }

  /**
   * Возвращает моки для разных эндпоинтов (для демонстрационных целей)
   * @param {string} endpoint - Эндпоинт API
   * @param {Record<string, any>} params - Параметры запроса
   * @returns {any} Моки для указанного эндпоинта
   */
  private getMockData(endpoint: string, params?: Record<string, any>): any {
    // Для продакшн версии этой функции не должно быть
    // Здесь мы просто возвращаем фиктивные данные для демонстрации
    
    if (endpoint.startsWith('/tickets')) {
      return {
        tickets: [
          { id: '1', subject: 'Проблема с входом', status: 'new', priority: 'medium' },
          { id: '2', subject: 'Не работает оплата', status: 'in_progress', priority: 'high' }
        ],
        total: 2
      };
    }
    
    if (endpoint.startsWith('/contacts')) {
      return {
        contacts: [
          { id: '1', firstName: 'Иван', lastName: 'Петров', email: ['ivan@example.com'] },
          { id: '2', firstName: 'Мария', lastName: 'Смирнова', email: ['maria@example.com'] }
        ],
        total: 2
      };
    }
    
    if (endpoint.startsWith('/companies')) {
      return {
        companies: [
          { id: '1', name: 'ООО "Первая компания"', industry: 'IT' },
          { id: '2', name: 'ЗАО "Вторая компания"', industry: 'Финансы' }
        ],
        total: 2
      };
    }
    
    if (endpoint.startsWith('/deals')) {
      return {
        deals: [
          { id: '1', name: 'Покупка ПО', stage: 'qualified', amount: 100000 },
          { id: '2', name: 'Техническая поддержка', stage: 'proposal', amount: 50000 }
        ],
        total: 2
      };
    }
    
    return {};
  }
}

/**
 * Экземпляр базового API для использования в приложении
 */
export const api = new BaseApi();
