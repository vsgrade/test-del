import { supabase } from "@/integrations/supabase/client";
import { Ticket, CreateTicketData, UpdateTicketData, TicketComment } from "@/types";

// Функция для создания тикета
export const createTicket = async (ticketData: CreateTicketData): Promise<Ticket> => {
  const { data, error } = await supabase
    .from('tickets')
    .insert({
      subject: ticketData.subject,
      description: ticketData.description,
      status: ticketData.status || 'new',
      priority: ticketData.priority || 'medium',
      channel: ticketData.channel || 'web',
      tags: ticketData.tags || [],
      assigned_to: ticketData.assigned_to,
      assigned_group: ticketData.assigned_group,
      client_id: ticketData.client_id,
      company_id: ticketData.company_id,
      due_date: ticketData.due_date,
      related_tickets: []
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating ticket:', error);
    throw new Error(`Ошибка создания тикета: ${error.message}`);
  }

  return data as Ticket;
};

// Функция для получения списка тикетов
export const getTickets = async (): Promise<Ticket[]> => {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tickets:', error);
    throw new Error(`Ошибка загрузки тикетов: ${error.message}`);
  }

  return data as Ticket[];
};

// Функция для получения тикета по ID
export const getTicketById = async (id: string): Promise<Ticket | null> => {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching ticket:', error);
    throw new Error(`Ошибка загрузки тикета: ${error.message}`);
  }

  return data as Ticket | null;
};

// Функция для обновления тикета
export const updateTicket = async (id: string, updates: UpdateTicketData): Promise<Ticket> => {
  const { data, error } = await supabase
    .from('tickets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating ticket:', error);
    throw new Error(`Ошибка обновления тикета: ${error.message}`);
  }

  return data as Ticket;
};

// Функция для удаления тикета
export const deleteTicket = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('tickets')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting ticket:', error);
    throw new Error(`Ошибка удаления тикета: ${error.message}`);
  }
};

// Функция для отправки ответа в Telegram
export const sendTelegramReply = async (ticketId: string, message: string): Promise<void> => {
  try {
    // Используем прямой запрос к базе данных для получения chat_id
    const { data: result, error } = await supabase
      .rpc('get_telegram_chat_by_ticket', { ticket_id: ticketId });

    if (error || !result || result.length === 0) {
      console.error('Chat info not found for ticket:', ticketId, error);
      return;
    }

    const chatInfo = result[0];

    // Отправляем сообщение через Edge Function
    const { error: sendError } = await supabase.functions.invoke('send-telegram-message', {
      body: {
        chatId: chatInfo.chat_id,
        message: message
      }
    });

    if (sendError) {
      console.error('Error sending Telegram message:', sendError);
      throw new Error('Не удалось отправить сообщение в Telegram');
    }
  } catch (error: any) {
    console.error('Error in sendTelegramReply:', error);
    throw new Error(`Ошибка отправки в Telegram: ${error.message}`);
  }
};

// Обновленная функция для добавления комментария с поддержкой Telegram
export const addTicketComment = async (
  ticketId: string,
  content: string,
  isInternal: boolean = false,
  sendToTelegram: boolean = false
): Promise<TicketComment> => {
  // Получаем текущего пользователя
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Пользователь не авторизован');
  }

  const { data, error } = await supabase
    .from('ticket_comments')
    .insert({
      ticket_id: ticketId,
      author_id: user.id,
      author_type: 'user',
      content,
      is_internal: isInternal
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding comment:', error);
    throw new Error(`Ошибка добавления комментария: ${error.message}`);
  }

  // Если не внутренний комментарий и запрошена отправка в Telegram
  if (!isInternal && sendToTelegram) {
    try {
      await sendTelegramReply(ticketId, content);
    } catch (telegramError) {
      console.error('Failed to send to Telegram:', telegramError);
      // Не прерываем выполнение, просто логируем ошибку
    }
  }

  return data as TicketComment;
};

// Функция для получения комментариев тикета
export const getTicketComments = async (ticketId: string): Promise<TicketComment[]> => {
  const { data, error } = await supabase
    .from('ticket_comments')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    throw new Error(`Ошибка загрузки комментариев: ${error.message}`);
  }

  return data as TicketComment[];
};

// Функция для обновления статуса тикета
export const updateTicketStatus = async (id: string, status: string): Promise<Ticket> => {
  const updates: UpdateTicketData = {
    status: status as any,
    updated_at: new Date().toISOString()
  };

  // Если статус "решен", добавляем время решения
  if (status === 'resolved') {
    updates.resolved_at = new Date().toISOString();
  }

  // Если статус "закрыт", добавляем время закрытия
  if (status === 'closed') {
    updates.closed_at = new Date().toISOString();
  }

  return updateTicket(id, updates);
};

// Функция для назначения тикета
export const assignTicket = async (id: string, assignedTo: string): Promise<Ticket> => {
  return updateTicket(id, { assigned_to: assignedTo });
};

// Функция для изменения приоритета тикета
export const updateTicketPriority = async (id: string, priority: string): Promise<Ticket> => {
  return updateTicket(id, { priority: priority as any });
};
