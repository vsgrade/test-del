
import { api } from './api';
import { Deal, DealStage } from '@/types';

/**
 * Сервис для работы со сделками
 */
export class DealService {
  /**
   * Получает список сделок
   * @param {Object} params - Параметры запроса
   * @returns {Promise<{ deals: Deal[], total: number }>} Список сделок и их общее количество
   */
  static async getDeals(params?: {
    stage?: DealStage;
    clientId?: string;
    companyId?: string;
    responsibleUserId?: string;
    minAmount?: number;
    maxAmount?: number;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ deals: Deal[], total: number }> {
    return api.get<{ deals: Deal[], total: number }>('/deals', params);
  }

  /**
   * Получает сделку по ID
   * @param {string} id - ID сделки
   * @returns {Promise<Deal>} Данные сделки
   */
  static async getDealById(id: string): Promise<Deal> {
    return api.get<Deal>(`/deals/${id}`);
  }

  /**
   * Создает новую сделку
   * @param {Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>} deal - Данные сделки
   * @returns {Promise<Deal>} Созданная сделка
   */
  static async createDeal(deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
    return api.post<Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>, Deal>('/deals', deal);
  }

  /**
   * Обновляет сделку
   * @param {string} id - ID сделки
   * @param {Partial<Deal>} dealData - Данные для обновления
   * @returns {Promise<Deal>} Обновленная сделка
   */
  static async updateDeal(id: string, dealData: Partial<Deal>): Promise<Deal> {
    return api.put<Partial<Deal>, Deal>(`/deals/${id}`, dealData);
  }

  /**
   * Удаляет сделку
   * @param {string} id - ID сделки
   * @returns {Promise<void>} Результат операции
   */
  static async deleteDeal(id: string): Promise<void> {
    return api.delete(`/deals/${id}`);
  }

  /**
   * Изменяет этап сделки
   * @param {string} id - ID сделки
   * @param {DealStage} stage - Новый этап
   * @returns {Promise<Deal>} Обновленная сделка
   */
  static async changeStage(id: string, stage: DealStage): Promise<Deal> {
    return api.put<{ stage: DealStage }, Deal>(`/deals/${id}/stage`, { stage });
  }
}
