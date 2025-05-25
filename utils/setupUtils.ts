export interface DatabaseConfig {
  type: 'supabase' | 'mysql';
  url?: string;
  apiKey?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
}

export interface AdminConfig {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const getStoredDatabaseConfig = (): DatabaseConfig | null => {
  try {
    const config = localStorage.getItem('dbConfig');
    return config ? JSON.parse(config) : null;
  } catch {
    return null;
  }
};

export const isProjectInitialized = (): boolean => {
  return localStorage.getItem('projectInitialized') === 'true';
};

export const resetProjectSetup = (): void => {
  localStorage.removeItem('projectInitialized');
  localStorage.removeItem('dbConfig');
  localStorage.removeItem('adminConfig');
};

// Функция для создания динамического клиента Supabase
export const createDynamicSupabaseClient = () => {
  const config = getStoredDatabaseConfig();
  
  if (!config || config.type !== 'supabase' || !config.url || !config.apiKey) {
    throw new Error('Supabase configuration not found');
  }

  return import('@supabase/supabase-js').then(({ createClient }) => {
    return createClient(config.url!, config.apiKey!, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  });
};

// SQL для создания всех необходимых таблиц
const createTablesSQL = `
-- Создание типов (enums)
DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('new', 'open', 'pending', 'solved', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_channel AS ENUM ('web', 'email', 'phone', 'telegram', 'whatsapp', 'vk');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'agent', 'read_only');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE deal_stage AS ENUM ('lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Создание таблиц
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role user_role DEFAULT 'read_only',
  first_name text,
  last_name text,
  position text,
  department text,
  created_at timestamp with time zone DEFAULT now(),
  last_login timestamp with time zone,
  is_active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email jsonb DEFAULT '[]'::jsonb,
  phone jsonb DEFAULT '[]'::jsonb,
  position text,
  source text,
  tags text[] DEFAULT '{}',
  custom_fields jsonb DEFAULT '{}'::jsonb,
  responsible_user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.companies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  website text,
  industry text,
  size text,
  address text,
  tags text[] DEFAULT '{}',
  custom_fields jsonb DEFAULT '{}'::jsonb,
  primary_contact_id uuid,
  responsible_user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject text NOT NULL,
  description text NOT NULL,
  status ticket_status DEFAULT 'new',
  priority ticket_priority DEFAULT 'medium',
  channel ticket_channel DEFAULT 'web',
  assigned_to uuid,
  assigned_group text,
  client_id uuid,
  company_id uuid,
  tags text[] DEFAULT '{}',
  due_date timestamp with time zone,
  resolved_at timestamp with time zone,
  closed_at timestamp with time zone,
  related_tickets uuid[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ticket_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id uuid NOT NULL,
  author_id uuid NOT NULL,
  author_type text NOT NULL,
  content text NOT NULL,
  is_internal boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.deals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  amount numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  stage deal_stage DEFAULT 'lead',
  probability integer DEFAULT 0,
  expected_close_date timestamp with time zone,
  client_id uuid,
  company_id uuid,
  responsible_user_id uuid,
  tags text[] DEFAULT '{}',
  custom_fields jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  type text DEFAULT 'meeting',
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_public boolean DEFAULT false,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.knowledge_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  parent_id uuid,
  is_public boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.knowledge_articles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  category_id uuid,
  author_id uuid,
  tags text[] DEFAULT '{}',
  is_published boolean DEFAULT false,
  published_at timestamp with time zone,
  view_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  manager_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename text NOT NULL,
  url text NOT NULL,
  mime_type text NOT NULL,
  size integer NOT NULL,
  ticket_id uuid,
  comment_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- Включение RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Базовые RLS политики (можно расширить позже)
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.profiles FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.contacts FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.companies FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.tickets FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.ticket_comments FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.deals FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.calendar_events FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.reports FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.knowledge_categories FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.knowledge_articles FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.departments FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.attachments FOR SELECT USING (true);

-- Политики для вставки (только аутентифицированные пользователи)
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users" ON public.contacts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users" ON public.companies FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users" ON public.tickets FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users" ON public.ticket_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users" ON public.deals FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users" ON public.calendar_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users" ON public.reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users" ON public.knowledge_articles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users" ON public.attachments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Политики для обновления (только аутентифицированные пользователи)
CREATE POLICY IF NOT EXISTS "Enable update for authenticated users" ON public.contacts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Enable update for authenticated users" ON public.companies FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Enable update for authenticated users" ON public.tickets FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Enable update for authenticated users" ON public.deals FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Enable update for authenticated users" ON public.calendar_events FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Enable update for authenticated users" ON public.reports FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Enable update for authenticated users" ON public.knowledge_articles FOR UPDATE USING (auth.role() = 'authenticated');

-- Функция для создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автоматического создания профиля
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
`;

// Функция для тестирования подключения к базе данных
export const testDatabaseConnection = async (config: any): Promise<{ success: boolean; message: string }> => {
  try {
    if (config.type === 'supabase') {
      if (!config.url || !config.apiKey) {
        return {
          success: false,
          message: 'URL и API ключ обязательны для Supabase'
        };
      }

      // Создаем временный клиент для тестирования
      const { createClient } = await import('@supabase/supabase-js');
      const testClient = createClient(config.url, config.apiKey);
      
      // Простая проверка подключения через auth
      const { data, error } = await testClient.auth.getSession();
      
      if (error && error.message.includes('Invalid API key')) {
        return {
          success: false,
          message: 'Неверный API ключ'
        };
      }

      // Проверяем доступность API
      try {
        const response = await fetch(`${config.url}/rest/v1/`, {
          headers: {
            'apikey': config.apiKey,
            'Authorization': `Bearer ${config.apiKey}`
          }
        });

        if (response.status === 200) {
          return {
            success: true,
            message: 'Подключение к Supabase установлено успешно'
          };
        } else {
          return {
            success: false,
            message: `HTTP ошибка: ${response.status}`
          };
        }
      } catch (fetchError: any) {
        return {
          success: false,
          message: `Ошибка сети: ${fetchError.message}`
        };
      }
    }
    
    return {
      success: false,
      message: 'Неподдерживаемый тип базы данных'
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Ошибка тестирования: ${error.message}`
    };
  }
};

// Функция для создания всех таблиц
export const initializeDatabaseTables = async (config: DatabaseConfig): Promise<{ success: boolean; message: string }> => {
  try {
    if (config.type === 'supabase') {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(config.url!, config.apiKey!);
      
      // Выполняем SQL для создания таблиц
      const { error } = await supabase.rpc('exec_sql', { sql: createTablesSQL });
      
      if (error) {
        console.error('Error creating tables:', error);
        return { success: false, message: `Ошибка создания таблиц: ${error.message}` };
      }
      
      return { success: true, message: 'Все таблицы успешно созданы' };
    } else {
      // Для MySQL сохраняем SQL в localStorage для администратора
      localStorage.setItem('mysqlInitSQL', createTablesSQL);
      return { success: true, message: 'SQL для создания таблиц сохранен (требуется ручное выполнение)' };
    }
  } catch (error: any) {
    console.error('Error initializing database tables:', error);
    return { success: false, message: `Ошибка инициализации: ${error.message}` };
  }
};

// Функция для создания администратора
export const createAdminUser = async (config: AdminConfig): Promise<{ success: boolean; message: string }> => {
  try {
    const dbConfig = getStoredDatabaseConfig();
    
    if (!dbConfig) {
      return { success: false, message: 'Конфигурация базы данных не найдена' };
    }

    if (dbConfig.type === 'supabase') {
      const supabase = await createDynamicSupabaseClient();
      
      // Создаем пользователя через Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: config.email,
        password: config.password,
        options: {
          data: {
            first_name: config.firstName,
            last_name: config.lastName,
            role: 'admin'
          }
        }
      });

      if (error) {
        return { success: false, message: `Ошибка создания пользователя: ${error.message}` };
      }
      
      if (data.user) {
        // Обновляем профиль пользователя с ролью админа
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', data.user.id);
          
        if (updateError) {
          console.warn('Warning: Could not set admin role:', updateError);
        }
        
        return { success: true, message: 'Администратор успешно создан' };
      }
      
      return { success: false, message: 'Не удалось создать пользователя' };
    } else {
      // Для MySQL сохраняем данные админа
      localStorage.setItem('adminConfig', JSON.stringify(config));
      return { success: true, message: 'Данные администратора сохранены (требуется настройка в MySQL)' };
    }
  } catch (error: any) {
    console.error('Admin creation failed:', error);
    return { success: false, message: `Ошибка: ${error.message}` };
  }
};
