
import { api } from './api';

/**
 * Интерфейс для параметров запроса отчета
 */
interface ReportParams {
  startDate?: string;
  endDate?: string;
  groupBy?: string;
  filters?: Record<string, any>;
}

/**
 * Интерфейс для данных отчета
 */
interface ReportData {
  type: string;
  title: string;
  data: any[];
  labels?: string[];
  series?: string[];
  meta?: Record<string, any>;
}

/**
 * Сервис для работы с отчетами
 */
export class ReportService {
  /**
   * Получает отчет по тикетам
   * @param {ReportParams} params - Параметры отчета
   * @returns {Promise<ReportData>} Данные отчета
   */
  static async getTicketsReport(params: ReportParams): Promise<ReportData> {
    return api.get<ReportData>('/reports/tickets', params);
  }

  /**
   * Получает отчет по эффективности агентов
   * @param {ReportParams} params - Параметры отчета
   * @returns {Promise<ReportData>} Данные отчета
   */
  static async getAgentsPerformanceReport(params: ReportParams): Promise<ReportData> {
    return api.get<ReportData>('/reports/agents-performance', params);
  }

  /**
   * Получает отчет по каналам обращений
   * @param {ReportParams} params - Параметры отчета
   * @returns {Promise<ReportData>} Данные отчета
   */
  static async getChannelsReport(params: ReportParams): Promise<ReportData> {
    return api.get<ReportData>('/reports/channels', params);
  }

  /**
   * Получает отчет по воронке продаж
   * @param {ReportParams} params - Параметры отчета
   * @returns {Promise<ReportData>} Данные отчета
   */
  static async getSalesFunnelReport(params: ReportParams): Promise<ReportData> {
    return api.get<ReportData>('/reports/sales-funnel', params);
  }

  /**
   * Получает отчет по продажам
   * @param {ReportParams} params - Параметры отчета
   * @returns {Promise<ReportData>} Данные отчета
   */
  static async getSalesReport(params: ReportParams): Promise<ReportData> {
    return api.get<ReportData>('/reports/sales', params);
  }

  /**
   * Получает отчет по источникам лидов
   * @param {ReportParams} params - Параметры отчета
   * @returns {Promise<ReportData>} Данные отчета
   */
  static async getLeadSourcesReport(params: ReportParams): Promise<ReportData> {
    return api.get<ReportData>('/reports/lead-sources', params);
  }

  /**
   * Экспортирует отчет
   * @param {string} reportType - Тип отчета
   * @param {ReportParams} params - Параметры отчета
   * @param {string} format - Формат экспорта (csv, xlsx, pdf)
   * @returns {Promise<Blob>} Данные файла
   */
  static async exportReport(reportType: string, params: ReportParams, format: 'csv' | 'xlsx' | 'pdf'): Promise<Blob> {
    const url = new URL(`${api.getBaseUrl()}/reports/${reportType}/export`, window.location.origin);
    url.searchParams.append('format', format);
    
    if (params.startDate) url.searchParams.append('startDate', params.startDate);
    if (params.endDate) url.searchParams.append('endDate', params.endDate);
    if (params.groupBy) url.searchParams.append('groupBy', params.groupBy);
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(`filter.${key}`, String(value));
        }
      });
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': '*/*'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return response.blob();
  }
}
