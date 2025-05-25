
import { api } from './api';
import { Contact, Company } from '@/types';

/**
 * Сервис для работы с CRM
 */
export class CrmService {
  /**
   * Получает список контактов
   * @param {Object} params - Параметры запроса
   * @returns {Promise<{ contacts: Contact[], total: number }>} Список контактов и их общее количество
   */
  static async getContacts(params?: {
    search?: string;
    companyId?: string;
    tags?: string[];
    page?: number;
    limit?: number;
  }): Promise<{ contacts: Contact[], total: number }> {
    return api.get<{ contacts: Contact[], total: number }>('/contacts', params);
  }

  /**
   * Получает контакт по ID
   * @param {string} id - ID контакта
   * @returns {Promise<Contact>} Данные контакта
   */
  static async getContactById(id: string): Promise<Contact> {
    return api.get<Contact>(`/contacts/${id}`);
  }

  /**
   * Создает новый контакт
   * @param {Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>} contact - Данные контакта
   * @returns {Promise<Contact>} Созданный контакт
   */
  static async createContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    return api.post<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>, Contact>('/contacts', contact);
  }

  /**
   * Обновляет контакт
   * @param {string} id - ID контакта
   * @param {Partial<Contact>} contactData - Данные для обновления
   * @returns {Promise<Contact>} Обновленный контакт
   */
  static async updateContact(id: string, contactData: Partial<Contact>): Promise<Contact> {
    return api.put<Partial<Contact>, Contact>(`/contacts/${id}`, contactData);
  }

  /**
   * Удаляет контакт
   * @param {string} id - ID контакта
   * @returns {Promise<void>} Результат операции
   */
  static async deleteContact(id: string): Promise<void> {
    return api.delete(`/contacts/${id}`);
  }

  /**
   * Получает список компаний
   * @param {Object} params - Параметры запроса
   * @returns {Promise<{ companies: Company[], total: number }>} Список компаний и их общее количество
   */
  static async getCompanies(params?: {
    search?: string;
    industry?: string;
    tags?: string[];
    page?: number;
    limit?: number;
  }): Promise<{ companies: Company[], total: number }> {
    return api.get<{ companies: Company[], total: number }>('/companies', params);
  }

  /**
   * Получает компанию по ID
   * @param {string} id - ID компании
   * @returns {Promise<Company>} Данные компании
   */
  static async getCompanyById(id: string): Promise<Company> {
    return api.get<Company>(`/companies/${id}`);
  }

  /**
   * Создает новую компанию
   * @param {Omit<Company, 'id' | 'createdAt' | 'updatedAt'>} company - Данные компании
   * @returns {Promise<Company>} Созданная компания
   */
  static async createCompany(company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
    return api.post<Omit<Company, 'id' | 'createdAt' | 'updatedAt'>, Company>('/companies', company);
  }

  /**
   * Обновляет компанию
   * @param {string} id - ID компании
   * @param {Partial<Company>} companyData - Данные для обновления
   * @returns {Promise<Company>} Обновленная компания
   */
  static async updateCompany(id: string, companyData: Partial<Company>): Promise<Company> {
    return api.put<Partial<Company>, Company>(`/companies/${id}`, companyData);
  }

  /**
   * Удаляет компанию
   * @param {string} id - ID компании
   * @returns {Promise<void>} Результат операции
   */
  static async deleteCompany(id: string): Promise<void> {
    return api.delete(`/companies/${id}`);
  }
}
