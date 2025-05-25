
/**
 * Утилиты для сброса настроек базы данных
 */

/**
 * Удаляет все настройки подключения к базе данных из localStorage
 * После вызова этой функции приложение запустит мастер настройки
 */
export const resetDatabaseConnection = (): void => {
  // Удаляем все ключи связанные с настройкой базы данных
  localStorage.removeItem('projectInitialized');
  localStorage.removeItem('dbConfig');
  localStorage.removeItem('databaseConfig');
  localStorage.removeItem('setupComplete');
  
  // Очищаем данные сессии
  localStorage.removeItem('supabase.auth.token');
  
  console.log('Database connection settings have been reset');
  
  // Перезагружаем страницу для запуска мастера настройки
  window.location.reload();
};

/**
 * Проверяет, настроена ли база данных
 */
export const isDatabaseConfigured = (): boolean => {
  return localStorage.getItem('projectInitialized') === 'true';
};

/**
 * Получает текущую конфигурацию базы данных
 */
export const getCurrentDatabaseConfig = (): any => {
  const config = localStorage.getItem('databaseConfig');
  return config ? JSON.parse(config) : null;
};
